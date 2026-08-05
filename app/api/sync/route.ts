import { NextResponse } from 'next/server';
import { adminDb } from '@/app/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('x-sync-secret');
    if (authHeader !== process.env.SYNC_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { dateMap, pMap, sMap, exitMap, appealMap, sharedMap, scenarioStepMap } = body;

    const batch = adminDb.batch();

    // daily_reports への保存
    if (dateMap && dateMap.length > 0) {
      for (const d of dateMap) {
        const ref = adminDb.collection('daily_reports').doc(d.date);
        batch.set(ref, d, { merge: true });
      }
    }

    // daily_reports_by_p への保存
    if (pMap && pMap.length > 0) {
      for (const d of pMap) {
        const ref = adminDb.collection('daily_reports_by_p').doc(`${d.date}__${d.p_value}`);
        batch.set(ref, d, { merge: true });
      }
      // distinct_p_values の更新
      const pValues = [...new Set(pMap.map((d: { p_value: string }) => d.p_value))];
      for (const p of pValues) {
        const ref = adminDb.collection('distinct_p_values').doc(p as string);
        batch.set(ref, { value: p }, { merge: true });
      }
      // summary_by_p の更新
      const summaryP: Record<string, { imp: number; cl: number; friend: number; cv: number; billing: number }> = {};
      for (const d of pMap) {
        if (!summaryP[d.p_value]) summaryP[d.p_value] = { imp: 0, cl: 0, friend: 0, cv: 0, billing: 0 };
        summaryP[d.p_value].imp += d.imp;
        summaryP[d.p_value].cl += d.cl;
        summaryP[d.p_value].friend += d.friend;
        summaryP[d.p_value].cv += d.cv;
        summaryP[d.p_value].billing += d.billing ?? 0;
      }
      for (const [p, data] of Object.entries(summaryP)) {
        const ref = adminDb.collection('summary_by_p').doc(p);
        batch.set(ref, data, { merge: true });
      }
    }

    // daily_reports_by_s への保存
    if (sMap && sMap.length > 0) {
      for (const d of sMap) {
        const ref = adminDb.collection('daily_reports_by_s').doc(`${d.date}__${d.s_value}`);
        batch.set(ref, d, { merge: true });
      }
      // distinct_s_values の更新
      const sValues = [...new Set(sMap.map((d: { s_value: string }) => d.s_value))];
      for (const s of sValues) {
        const ref = adminDb.collection('distinct_s_values').doc(s as string);
        batch.set(ref, { value: s }, { merge: true });
      }
      // summary_by_s の更新
      const summaryS: Record<string, { imp: number; cl: number; friend: number; cv: number; billing: number }> = {};
      for (const d of sMap) {
        if (!summaryS[d.s_value]) summaryS[d.s_value] = { imp: 0, cl: 0, friend: 0, cv: 0, billing: 0 };
        summaryS[d.s_value].imp += d.imp;
        summaryS[d.s_value].cl += d.cl;
        summaryS[d.s_value].friend += d.friend;
        summaryS[d.s_value].cv += d.cv;
        summaryS[d.s_value].billing += d.billing ?? 0;
      }
      for (const [s, data] of Object.entries(summaryS)) {
        const ref = adminDb.collection('summary_by_s').doc(s);
        batch.set(ref, data, { merge: true });
      }
    }

    // daily_reports_by_exit への保存
    if (exitMap && exitMap.length > 0) {
      for (const d of exitMap) {
        const ref = adminDb.collection('daily_reports_by_exit').doc(`${d.date}__${d.exit_value}`);
        batch.set(ref, d, { merge: true });
      }
      // distinct_exit_values の更新
      const exitValues = [...new Set(exitMap.map((d: { exit_value: string }) => d.exit_value))];
      for (const exit of exitValues) {
        const ref = adminDb.collection('distinct_exit_values').doc(exit as string);
        batch.set(ref, { value: exit }, { merge: true });
      }
    }

    // daily_reports_by_appeal への保存
    if (appealMap && appealMap.length > 0) {
      for (const d of appealMap) {
        const ref = adminDb.collection('daily_reports_by_appeal').doc(`${d.date}__${d.appeal_value}`);
        batch.set(ref, d, { merge: true });
      }
      // distinct_appeal_values の更新
      const appealValues = [...new Set(appealMap.map((d: { appeal_value: string }) => d.appeal_value))];
      for (const appeal of appealValues) {
        const ref = adminDb.collection('distinct_appeal_values').doc(appeal as string);
        batch.set(ref, { value: appeal }, { merge: true });
      }
    }

    // daily_reports_shared への保存
    if (sharedMap && sharedMap.length > 0) {
      for (const d of sharedMap) {
        const ref = adminDb.collection('daily_reports_shared').doc(d.date);
        batch.set(ref, d, { merge: true });
      }
    }

    // scenario_steps への保存
    if (scenarioStepMap && scenarioStepMap.length > 0) {
      for (const d of scenarioStepMap) {
        const ref = adminDb.collection('scenario_steps').doc(`${d.s_value}__${d.step}`);
        batch.set(ref, d, { merge: true });
      }
      // distinct_s_values の更新
      const sValues = [...new Set(scenarioStepMap.map((d: { s_value: string }) => d.s_value))];
      for (const s of sValues) {
        const ref = adminDb.collection('distinct_s_values').doc(s as string);
        batch.set(ref, { value: s }, { merge: true });
      }
    }

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}