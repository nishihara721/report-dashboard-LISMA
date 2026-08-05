import { adminDb } from './firebase-admin';

type PriceRule = { fromDate: string; price: number };

// ==========================================
// 日付フィルタリング用のヘルパー関数
// ==========================================
function filterByDate<T extends { date: string }>(
  docs: T[],
  from?: string,
  to?: string
): T[] {
  return docs.filter((d) => {
    if (from && d.date < from) return false;
    if (to && d.date > to) return false;
    return true;
  });
}

// ==========================================
// 期間別レポートをDBから取得する関数
// ==========================================
export async function getReportDataFromDB(from?: string, to?: string) {
  const snapshot = await adminDb
    .collection('daily_reports')
    .orderBy('date', 'asc')
    .get();

  const docs = snapshot.docs.map((doc) => doc.data() as {
    date: string; pv: number; imp: number; cl: number;
    friend: number; cv: number; billing: number;
  });

  return filterByDate(docs, from, to).map((d) => ({
    date: d.date,
    pv: d.pv,
    imp: d.imp,
    impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
    cl: d.cl,
    ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
    friend: d.friend,
    friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
    cv: d.cv,
    cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
    billing: d.billing,
  }));
}

// ==========================================
// ポップアップ別レポートをDBから取得する関数
// ==========================================
export async function getReportDataByPFromDB(pValue: string, from?: string, to?: string) {
  const snapshot = await adminDb
    .collection('daily_reports_by_p')
    .where('p_value', '==', pValue)
    .orderBy('date', 'asc')
    .get();

  const docs = snapshot.docs.map((doc) => doc.data() as {
    date: string; pv: number; imp: number; cl: number;
    friend: number; cv: number; billing: number; p_value: string;
  });

  return filterByDate(docs, from, to).map((d) => ({
    date: d.date,
    pv: d.pv,
    imp: d.imp,
    impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
    cl: d.cl,
    ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
    friend: d.friend,
    friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
    cv: d.cv,
    cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
    billing: d.billing,
  }));
}

// ==========================================
// シナリオ別レポートをDBから取得する関数
// ==========================================
export async function getReportDataBySFromDB(sValue: string, from?: string, to?: string) {
  const snapshot = await adminDb
    .collection('daily_reports_by_s')
    .where('s_value', '==', sValue)
    .orderBy('date', 'asc')
    .get();

  const docs = snapshot.docs.map((doc) => doc.data() as {
    date: string; pv: number; imp: number; cl: number;
    friend: number; cv: number; billing: number; s_value: string;
  });

  return filterByDate(docs, from, to).map((d) => ({
    date: d.date,
    pv: d.pv,
    imp: d.imp,
    impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
    cl: d.cl,
    ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
    friend: d.friend,
    friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
    cv: d.cv,
    cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
    billing: d.billing,
  }));
}

// ==========================================
// 離脱地点別レポートをDBから取得する関数
// ==========================================
export async function getReportDataByExitFromDB(exitValue: string, from?: string, to?: string) {
  const snapshot = await adminDb
    .collection('daily_reports_by_exit')
    .where('exit_value', '==', exitValue)
    .orderBy('date', 'asc')
    .get();

  const docs = snapshot.docs.map((doc) => doc.data() as {
    date: string; pv: number; imp: number; cl: number;
    friend: number; exit_value: string;
  });

  return filterByDate(docs, from, to).map((d) => ({
    date: d.date,
    pv: d.pv,
    imp: d.imp,
    impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
    cl: d.cl,
    ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
    friend: d.friend,
    friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
  }));
}

// ==========================================
// 訴求別レポートをDBから取得する関数
// ==========================================
export async function getReportDataByAppealFromDB(appealValue: string, from?: string, to?: string) {
  const snapshot = await adminDb
    .collection('daily_reports_by_appeal')
    .where('appeal_value', '==', appealValue)
    .orderBy('date', 'asc')
    .get();

  const docs = snapshot.docs.map((doc) => doc.data() as {
    date: string; pv: number; imp: number; cl: number;
    friend: number; cv: number; billing: number; appeal_value: string;
  });

  return filterByDate(docs, from, to).map((d) => ({
    date: d.date,
    pv: d.pv,
    imp: d.imp,
    impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
    cl: d.cl,
    ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
    friend: d.friend,
    friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
    cv: d.cv,
    cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
    billing: d.billing,
  }));
}

// ==========================================
// 期間別（共有用）レポートをDBから取得する関数
// ==========================================
export async function getSharedReportDataFromDB(from?: string, to?: string) {
  const [baseSnapshot, sharedSnapshot] = await Promise.all([
    adminDb.collection('daily_reports').orderBy('date', 'asc').get(),
    adminDb.collection('daily_reports_shared').orderBy('date', 'asc').get(),
  ]);

  const baseDocs = baseSnapshot.docs.map((doc) => doc.data() as {
    date: string; pv: number; imp: number; cl: number; friend: number;
  });

  const sharedMap: Record<string, { cv: number; unit_price: number; billing: number }> = {};
  sharedSnapshot.docs.forEach((doc) => {
    const d = doc.data();
    sharedMap[d.date] = { cv: d.cv, unit_price: d.unit_price, billing: d.billing };
  });

  return filterByDate(baseDocs, from, to).map((d) => {
    const shared = sharedMap[d.date];
    const cv = shared?.cv ?? 0;
    const unitPrice = shared?.unit_price ?? 0;
    const billing = shared?.billing ?? 0;

    return {
      date: d.date,
      pv: d.pv,
      imp: d.imp,
      impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
      cl: d.cl,
      ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
      friend: d.friend,
      friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
      cv,
      cvr: d.friend > 0 ? ((cv / d.friend) * 100).toFixed(2) + '%' : '-',
      unitPrice,
      billing,
    };
  });
}

// ==========================================
// ポップアップの選択肢一覧をDBから取得する関数
// ==========================================
export async function getPValuesFromDB(): Promise<string[]> {
  const snapshot = await adminDb.collection('distinct_p_values').get();
  return snapshot.docs.map((doc) => doc.id).sort();
}

// ==========================================
// シナリオの選択肢一覧をDBから取得する関数
// ==========================================
export async function getSValuesFromDB(): Promise<string[]> {
  const snapshot = await adminDb.collection('distinct_s_values').get();
  return snapshot.docs.map((doc) => doc.id).sort();
}

// ==========================================
// 離脱地点の選択肢一覧をDBから取得する関数
// ==========================================
export async function getExitValuesFromDB(): Promise<string[]> {
  const snapshot = await adminDb.collection('distinct_exit_values').get();
  return snapshot.docs.map((doc) => doc.id).sort();
}

// ==========================================
// 訴求の選択肢一覧をDBから取得する関数
// ==========================================
export async function getAppealValuesFromDB(): Promise<string[]> {
  const snapshot = await adminDb.collection('distinct_appeal_values').get();
  return snapshot.docs.map((doc) => doc.id).sort();
}

// ==========================================
// 直近1週間にデータがあるポップアップ一覧をDBから取得する関数
// ==========================================
export async function getActivePValuesFromDB(): Promise<string[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const fromDate = oneWeekAgo.toISOString().slice(0, 10);

  const snapshot = await adminDb
    .collection('daily_reports_by_p')
    .where('date', '>=', fromDate)
    .get();

  const values = new Set<string>(snapshot.docs.map((doc) => doc.data().p_value));
  return [...values].sort();
}

// ==========================================
// 直近1週間にデータがあるシナリオ一覧をDBから取得する関数
// ==========================================
export async function getActiveSValuesFromDB(): Promise<string[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const fromDate = oneWeekAgo.toISOString().slice(0, 10);

  const snapshot = await adminDb
    .collection('daily_reports_by_s')
    .where('date', '>=', fromDate)
    .get();

  const values = new Set<string>(snapshot.docs.map((doc) => doc.data().s_value));
  return [...values].sort();
}

// ==========================================
// 直近1週間にデータがある訴求一覧をDBから取得する関数
// ==========================================
export async function getActiveAppealValuesFromDB(): Promise<string[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const fromDate = oneWeekAgo.toISOString().slice(0, 10);

  const snapshot = await adminDb
    .collection('daily_reports_by_appeal')
    .where('date', '>=', fromDate)
    .get();

  const values = new Set<string>(snapshot.docs.map((doc) => doc.data().appeal_value));
  return [...values].sort();
}

// ==========================================
// メモを取得する関数
// ==========================================
export async function getNotesFromDB(from?: string, to?: string) {
  const snapshot = await adminDb.collection('daily_notes').get();

  const noteMap: Record<string, string> = {};
  snapshot.docs.forEach((doc) => {
    const d = doc.data();
    if (from && d.date < from) return;
    if (to && d.date > to) return;
    noteMap[d.date] = d.note;
  });

  return noteMap;
}

// ==========================================
// メモを保存する関数
// ==========================================
export async function upsertNoteFromDB(date: string, note: string) {
  await adminDb.collection('daily_notes').doc(date).set({
    date,
    note,
    updated_at: new Date().toISOString(),
  }, { merge: true });
}

// ==========================================
// クライアントユーザーを取得する関数
// ==========================================
export async function getClientUsers() {
  const snapshot = await adminDb.collection('client_users').orderBy('created_at', 'desc').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ==========================================
// クライアントユーザーを作成する関数
// ==========================================
export async function createClientUser(data: {
  username: string;
  passwordHash: string;
  displayName: string;
  pages: string[];
}) {
  const ref = await adminDb.collection('client_users').add({
    username: data.username,
    password_hash: data.passwordHash,
    display_name: data.displayName,
    is_active: true,
    pages: data.pages,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  return ref.id;
}

// ==========================================
// クライアントユーザーを更新する関数
// ==========================================
export async function updateClientUser(id: string, data: {
  passwordHash?: string;
  displayName?: string;
  pages?: string[];
  isActive?: boolean;
}) {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (data.passwordHash) updateData.password_hash = data.passwordHash;
  if (data.displayName) updateData.display_name = data.displayName;
  if (data.pages) updateData.pages = data.pages;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;

  await adminDb.collection('client_users').doc(id).update(updateData);
}

// ==========================================
// クライアントユーザーを削除する関数
// ==========================================
export async function deleteClientUser(id: string) {
  await adminDb.collection('client_users').doc(id).delete();
}

// ==========================================
// ユーザー名でクライアントユーザーを検索する関数
// ==========================================
export async function getClientUserByUsername(username: string) {
  const snapshot = await adminDb
    .collection('client_users')
    .where('username', '==', username)
    .where('is_active', '==', true)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

// ==========================================
// サマリ用：月別・p別・s別をDBから取得してまとめて集計する関数
// ==========================================
export async function getSummaryDataFromDB() {
  const [dailySnapshot, pSnapshot, sSnapshot] = await Promise.all([
    adminDb.collection('daily_reports').orderBy('date', 'asc').get(),
    adminDb.collection('summary_by_p').get(),
    adminDb.collection('summary_by_s').get(),
  ]);

  // 月別集計
  const monthMap: Record<string, {
    pv: number; imp: number; cl: number; friend: number; cv: number; billing: number;
  }> = {};

  dailySnapshot.docs.forEach((doc) => {
    const d = doc.data();
    const month = d.date.slice(0, 7);
    if (!monthMap[month]) monthMap[month] = { pv: 0, imp: 0, cl: 0, friend: 0, cv: 0, billing: 0 };
    monthMap[month].pv += d.pv;
    monthMap[month].imp += d.imp;
    monthMap[month].cl += d.cl;
    monthMap[month].friend += d.friend;
    monthMap[month].cv += d.cv;
    monthMap[month].billing += d.billing ?? 0;
  });

  const totalPv = dailySnapshot.docs.reduce((acc, doc) => acc + doc.data().pv, 0);

  // 月別の出力
  const byMonth = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({
      label: month,
      pv: d.pv,
      imp: d.imp,
      impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
      cl: d.cl,
      ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
      friend: d.friend,
      friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
      cv: d.cv,
      cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
      billing: d.billing,
    }));

  // p別の出力
  const byP = pSnapshot.docs
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((doc) => {
      const d = doc.data();
      return {
        label: doc.id,
        pv: totalPv,
        imp: d.imp,
        impRate: totalPv > 0 ? ((d.imp / totalPv) * 100).toFixed(2) + '%' : '-',
        cl: d.cl,
        ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
        friend: d.friend,
        friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
        cv: d.cv,
        cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
        billing: d.billing,
      };
    });

  // s別の出力
  const byS = sSnapshot.docs
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((doc) => {
      const d = doc.data();
      return {
        label: doc.id,
        pv: totalPv,
        imp: d.imp,
        impRate: totalPv > 0 ? ((d.imp / totalPv) * 100).toFixed(2) + '%' : '-',
        cl: d.cl,
        ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
        friend: d.friend,
        friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
        cv: d.cv,
        cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
        billing: d.billing,
      };
    });

  return { byMonth, byP, byS };
}

// ==========================================
// シナリオ×通数別レポートをDBから取得する関数
// ==========================================
export async function getScenarioStepsFromDB(sValue: string) {
  const snapshot = await adminDb
    .collection('scenario_steps')
    .where('s_value', '==', sValue)
    .get();

  const docs = snapshot.docs.map((doc) => doc.data() as {
    s_value: string;
    step: string;
    send_count: number;
    click_count: number;
    cv_count: number;
    block_count: number;
  });

  // 通数でソート
  docs.sort((a, b) => a.step.localeCompare(b.step, 'ja'));

  // 1通目の送信人数を取得（CVRとブロック率の計算に使用）
  const firstStepDoc = docs[0];
  const firstSendCount = firstStepDoc?.send_count ?? 0;

  return docs.map((d) => ({
    step: d.step,
    send_count: d.send_count,
    click_count: d.click_count,
    click_rate: d.send_count > 0
      ? ((d.click_count / d.send_count) * 100).toFixed(2) + '%'
      : '-',
    cv_count: d.cv_count,
    cvr: firstSendCount > 0
      ? ((d.cv_count / firstSendCount) * 100).toFixed(2) + '%'
      : '-',
    block_count: d.block_count,
    block_rate: firstSendCount > 0
      ? ((d.block_count / firstSendCount) * 100).toFixed(2) + '%'
      : '-',
  }));
}