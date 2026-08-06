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
    const { dateMap, flowMap, mediaMap, codeMap } = body;

    const batch = adminDb.batch();

    // daily_reports_L への保存（期間別）
    if (dateMap && dateMap.length > 0) {
      for (const d of dateMap) {
        const ref = adminDb.collection('daily_reports_L').doc(d.date);
        batch.set(ref, d, { merge: true });
      }
    }

    // daily_reports_L_by_flow への保存（フロー別）
    if (flowMap && flowMap.length > 0) {
      for (const d of flowMap) {
        const ref = adminDb.collection('daily_reports_L_by_flow').doc(`${d.date}__${d.flow}`);
        batch.set(ref, d, { merge: true });
      }
      // distinct_flow_values の更新
      const flowValues = [...new Set(flowMap.map((d: { flow: string }) => d.flow))];
      for (const flow of flowValues) {
        const ref = adminDb.collection('distinct_flow_values').doc(flow as string);
        batch.set(ref, { value: flow }, { merge: true });
      }
    }

    // daily_reports_L_by_media への保存（メディア別）
    if (mediaMap && mediaMap.length > 0) {
      for (const d of mediaMap) {
        const ref = adminDb.collection('daily_reports_L_by_media').doc(`${d.date}__${d.media}`);
        batch.set(ref, d, { merge: true });
      }
      // distinct_media_values の更新
      const mediaValues = [...new Set(mediaMap.map((d: { media: string }) => d.media))];
      for (const media of mediaValues) {
        const ref = adminDb.collection('distinct_media_values').doc(media as string);
        batch.set(ref, { value: media }, { merge: true });
      }
    }

    // daily_reports_L_by_code への保存（コード別）
    if (codeMap && codeMap.length > 0) {
      for (const d of codeMap) {
        const ref = adminDb.collection('daily_reports_L_by_code').doc(`${d.date}__${d.flow}__${d.media}__${d.media_no}`);
        batch.set(ref, d, { merge: true });
      }
      // distinct_code_values の更新
      const codeValues = [...new Set(codeMap.map((d: { flow: string; media: string; media_no: string }) =>
        `${d.flow}__${d.media}__${d.media_no}`
      ))];
      for (const code of codeValues) {
        const ref = adminDb.collection('distinct_code_values').doc(code as string);
        batch.set(ref, { value: code }, { merge: true });
      }
    }

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}