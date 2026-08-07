import { adminDb } from './firebase-admin';

// ==========================================
// 期間別レポートをDBから取得する関数
// ==========================================
export async function getReportDataFromDB(from?: string, to?: string) {
  const snapshot = await adminDb
    .collection('daily_reports_L')
    .orderBy('date', 'asc')
    .get();

  const docs = snapshot.docs.map((doc) => doc.data() as {
    date: string; cl: number; friend: number; cv: number; calc_ad_cost?: number;
  });

  return docs
    .filter((d) => {
      if (from && d.date < from) return false;
      if (to && d.date > to) return false;
      return true;
    })
    .map((d) => ({
      date: d.date,
      cl: d.cl,
      friend: d.friend,
      friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
      cv: d.cv,
      cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
      adCost: d.calc_ad_cost ?? 0,
      cpf: d.friend > 0 && d.calc_ad_cost ? Math.round(d.calc_ad_cost / d.friend) : 0,
      cpa: d.cv > 0 && d.calc_ad_cost ? Math.round(d.calc_ad_cost / d.cv) : 0,
    }));
}

// ==========================================
// フロー別レポートをDBから取得する関数
// ==========================================
export async function getReportDataByFlowFromDB(flowValue: string, from?: string, to?: string) {
  const snapshot = await adminDb
    .collection('daily_reports_L_by_flow')
    .where('flow', '==', flowValue)
    .orderBy('date', 'asc')
    .get();

  const docs = snapshot.docs.map((doc) => doc.data() as {
    date: string; flow: string; cl: number; friend: number; cv: number; ad_cost?: number; calc_ad_cost?: number;
  });

  return docs
    .filter((d) => {
      if (from && d.date < from) return false;
      if (to && d.date > to) return false;
      return true;
    })
    .map((d) => ({
      date: d.date,
      cl: d.cl,
      friend: d.friend,
      friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
      cv: d.cv,
      cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
      ad_cost: d.ad_cost ?? 0,
      adCost: d.calc_ad_cost ?? 0,
      cpf: d.friend > 0 && d.calc_ad_cost ? Math.round(d.calc_ad_cost / d.friend) : 0,
      cpa: d.cv > 0 && d.calc_ad_cost ? Math.round(d.calc_ad_cost / d.cv) : 0,
    }));
}

// ==========================================
// メディア別レポートをDBから取得する関数
// ==========================================
export async function getReportDataByMediaFromDB(mediaValue: string, from?: string, to?: string) {
  const snapshot = await adminDb
    .collection('daily_reports_L_by_media')
    .where('media', '==', mediaValue)
    .orderBy('date', 'asc')
    .get();

  const docs = snapshot.docs.map((doc) => doc.data() as {
    date: string; media: string; cl: number; friend: number; cv: number; ad_cost?: number; calc_ad_cost?: number;
  });

  return docs
    .filter((d) => {
      if (from && d.date < from) return false;
      if (to && d.date > to) return false;
      return true;
    })
    .map((d) => ({
      date: d.date,
      cl: d.cl,
      friend: d.friend,
      friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
      cv: d.cv,
      cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
      ad_cost: d.ad_cost ?? 0,
      adCost: d.calc_ad_cost ?? 0,
      cpf: d.friend > 0 && d.calc_ad_cost ? Math.round(d.calc_ad_cost / d.friend) : 0,
      cpa: d.cv > 0 && d.calc_ad_cost ? Math.round(d.calc_ad_cost / d.cv) : 0,
    }));
}

// ==========================================
// コード別レポートをDBから取得する関数
// ==========================================
export async function getReportDataByCodeFromDB(codeValue: string, from?: string, to?: string) {
  const [flow, media, mediaNo] = codeValue.split('__');

  const snapshot = await adminDb
    .collection('daily_reports_L_by_code')
    .where('flow', '==', flow)
    .where('media', '==', media)
    .where('media_no', '==', mediaNo)
    .orderBy('date', 'asc')
    .get();

  const docs = snapshot.docs.map((doc) => doc.data() as {
    date: string; flow: string; media: string; media_no: string;
    cl: number; friend: number; cv: number; ad_cost?: number; calc_ad_cost?: number;
  });

  return docs
    .filter((d) => {
      if (from && d.date < from) return false;
      if (to && d.date > to) return false;
      return true;
    })
    .map((d) => ({
      date: d.date,
      cl: d.cl,
      friend: d.friend,
      friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
      cv: d.cv,
      cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
      ad_cost: d.ad_cost ?? 0,
      adCost: d.calc_ad_cost ?? 0,
      cpf: d.friend > 0 && d.calc_ad_cost ? Math.round(d.calc_ad_cost / d.friend) : 0,
      cpa: d.cv > 0 && d.calc_ad_cost ? Math.round(d.calc_ad_cost / d.cv) : 0,
    }));
}

// ==========================================
// フローの選択肢一覧をDBから取得する関数
// ==========================================
export async function getFlowValuesFromDB(): Promise<string[]> {
  const snapshot = await adminDb.collection('distinct_flow_values').get();
  return snapshot.docs.map((doc) => doc.id).sort();
}

// ==========================================
// メディアの選択肢一覧をDBから取得する関数
// ==========================================
export async function getMediaValuesFromDB(): Promise<string[]> {
  const snapshot = await adminDb.collection('distinct_media_values').get();
  return snapshot.docs.map((doc) => doc.id).sort();
}

// ==========================================
// コードの選択肢一覧をDBから取得する関数
// ==========================================
export async function getCodeValuesFromDB(): Promise<string[]> {
  const snapshot = await adminDb.collection('distinct_code_values').get();
  return snapshot.docs.map((doc) => doc.id).sort();
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
// サマリ用：月別集計をDBから取得する関数
// ==========================================
export async function getSummaryDataFromDB() {
  const [dailySnapshot, flowSnapshot, mediaSnapshot] = await Promise.all([
    adminDb.collection('daily_reports_L').orderBy('date', 'asc').get(),
    adminDb.collection('daily_reports_L_by_flow').get(),
    adminDb.collection('daily_reports_L_by_media').get(),
  ]);

  // 月別集計
  const monthMap: Record<string, {
    cl: number; friend: number; cv: number; adCost: number;
  }> = {};

  dailySnapshot.docs.forEach((doc) => {
    const d = doc.data();
    const month = d.date.slice(0, 7);
    if (!monthMap[month]) monthMap[month] = { cl: 0, friend: 0, cv: 0, adCost: 0 };
    monthMap[month].cl += d.cl;
    monthMap[month].friend += d.friend;
    monthMap[month].cv += d.cv;
    monthMap[month].adCost += d.calc_ad_cost ?? 0;
  });

  // フロー別集計
  const flowMap: Record<string, {
    cl: number; friend: number; cv: number; adCost: number;
  }> = {};

  flowSnapshot.docs.forEach((doc) => {
    const d = doc.data();
    const flow = d.flow;
    if (!flowMap[flow]) flowMap[flow] = { cl: 0, friend: 0, cv: 0, adCost: 0 };
    flowMap[flow].cl += d.cl;
    flowMap[flow].friend += d.friend;
    flowMap[flow].cv += d.cv;
    flowMap[flow].adCost += d.calc_ad_cost ?? 0;
  });

  // メディア別集計
  const mediaMap: Record<string, {
    cl: number; friend: number; cv: number; adCost: number;
  }> = {};

  mediaSnapshot.docs.forEach((doc) => {
    const d = doc.data();
    const media = d.media;
    if (!mediaMap[media]) mediaMap[media] = { cl: 0, friend: 0, cv: 0, adCost: 0 };
    mediaMap[media].cl += d.cl;
    mediaMap[media].friend += d.friend;
    mediaMap[media].cv += d.cv;
    mediaMap[media].adCost += d.calc_ad_cost ?? 0;
  });

  // 月別の出力
  const byMonth = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({
      label: month,
      cl: d.cl,
      friend: d.friend,
      friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
      cv: d.cv,
      cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
      adCost: d.adCost,
      cpf: d.friend > 0 && d.adCost > 0 ? Math.round(d.adCost / d.friend) : 0,
      cpa: d.cv > 0 && d.adCost > 0 ? Math.round(d.adCost / d.cv) : 0,
    }));

  // フロー別の出力
  const byFlow = Object.entries(flowMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([flow, d]) => ({
      label: flow,
      cl: d.cl,
      friend: d.friend,
      friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
      cv: d.cv,
      cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
      adCost: d.adCost,
      cpf: d.friend > 0 && d.adCost > 0 ? Math.round(d.adCost / d.friend) : 0,
      cpa: d.cv > 0 && d.adCost > 0 ? Math.round(d.adCost / d.cv) : 0,
    }));

  // メディア別の出力
  const byMedia = Object.entries(mediaMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([media, d]) => ({
      label: media,
      cl: d.cl,
      friend: d.friend,
      friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
      cv: d.cv,
      cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
      adCost: d.adCost,
      cpf: d.friend > 0 && d.adCost > 0 ? Math.round(d.adCost / d.friend) : 0,
      cpa: d.cv > 0 && d.adCost > 0 ? Math.round(d.adCost / d.cv) : 0,
    }));

  return { byMonth, byFlow, byMedia };
}

// ==========================================
// メディア別広告費設定を取得する関数
// ==========================================
export async function getMediaCostSettingsFromDB() {
  const snapshot = await adminDb.collection('media_cost_settings').get();
  const settings: Record<string, {
    type: string;
    rate?: number;
    cpf?: number;
    cpa?: number;
    from_date: string;
  }[]> = {};

  for (const doc of snapshot.docs) {
    const rulesSnapshot = await adminDb
      .collection('media_cost_settings')
      .doc(doc.id)
      .collection('rules')
      .get();

    console.log(`${doc.id} rules count:`, rulesSnapshot.docs.length);
    rulesSnapshot.docs.forEach(d => console.log(`${doc.id} rule:`, JSON.stringify(d.data())));

    settings[doc.id] = rulesSnapshot.docs.map((ruleDoc) => ruleDoc.data() as {
      type: string;
      rate?: number;
      cpf?: number;
      cpa?: number;
      from_date: string;
    });
  }

  return settings;
}

// ==========================================
// メディア別広告費設定を保存する関数
// ==========================================
export async function upsertMediaCostSettingFromDB(media: string, data: {
  from_date: string;
  type: string;
  rate?: number;
  cpf?: number;
  cpa?: number;
}) {
  // メディアのドキュメントを作成
  await adminDb.collection('media_cost_settings').doc(media).set(
    { updated_at: new Date().toISOString() },
    { merge: true }
  );

  // rulesサブコレクションに保存
  const ruleRef = adminDb
    .collection('media_cost_settings')
    .doc(media)
    .collection('rules')
    .doc(data.from_date);

  console.log(`Saving rule for ${media} on ${data.from_date}:`, JSON.stringify(data));

  await ruleRef.set({
    from_date: data.from_date,
    type: data.type,
    rate: data.rate ?? null,
    cpf: data.cpf ?? null,
    cpa: data.cpa ?? null,
  });
}

// ==========================================
// メディア別広告費設定を削除する関数
// ==========================================
export async function deleteMediaCostSettingFromDB(media: string, fromDate: string) {
  await adminDb
    .collection('media_cost_settings')
    .doc(media)
    .collection('rules')
    .doc(fromDate)
    .delete();
}

// ==========================================
// 広告費を計算する関数（日付に応じた設定を適用）
// ==========================================
export function calcAdCost(
  adCost: number,
  friend: number,
  cv: number,
  date: string,
  rules?: {
    type: string;
    rate?: number;
    cpf?: number;
    cpa?: number;
    from_date: string;
  }[]
): number {
  if (!rules || rules.length === 0) return 0;

  // 日付以前で最も新しいルールを適用
  const sorted = [...rules].sort((a, b) => b.from_date.localeCompare(a.from_date));
  const setting = sorted.find((r) => r.from_date <= date);
  if (!setting) return 0;

  switch (setting.type) {
    case 'budget':
      return Math.round(adCost * (setting.rate ?? 1));
    case 'affi_cpf':
      return Math.round((setting.cpf ?? 0) * friend);
    case 'affi_cpa':
      return Math.round((setting.cpa ?? 0) * cv);
    case 'budget_cpa':
      return Math.round(adCost * (setting.rate ?? 1) + (setting.cpa ?? 0) * cv);
    default:
      return 0;
  }
}

// ==========================================
// メディア別広告費を再計算してDBに保存する関数
// ==========================================
export async function recalcAdCostForMedia(media: string) {
  const allSettings = await getMediaCostSettingsFromDB();
  const rules = allSettings[media];
  if (!rules || rules.length === 0) return;

  const codeSnapshot = await adminDb
    .collection('daily_reports_L_by_code')
    .where('media', '==', media)
    .get();

  // 日付ごとの合計を集計
  const dateAdCostMap: Record<string, number> = {};
  const flowAdCostMap: Record<string, number> = {};
  const mediaAdCostMap: Record<string, number> = {};

  const batch = adminDb.batch();

  for (const doc of codeSnapshot.docs) {
    const d = doc.data();

    const sorted = [...rules].sort((a, b) => b.from_date.localeCompare(a.from_date));
    const rule = sorted.find((r) => r.from_date <= d.date);
    if (!rule) continue;

    let calcAdCost = 0;
    switch (rule.type) {
      case 'budget':
        calcAdCost = Math.round((d.ad_cost ?? 0) * (rule.rate ?? 1));
        break;
      case 'affi_cpf':
        calcAdCost = Math.round((rule.cpf ?? 0) * (d.friend ?? 0));
        break;
      case 'affi_cpa':
        calcAdCost = Math.round((rule.cpa ?? 0) * (d.cv ?? 0));
        break;
      case 'budget_cpa':
        calcAdCost = Math.round((d.ad_cost ?? 0) * (rule.rate ?? 1) + (rule.cpa ?? 0) * (d.cv ?? 0));
        break;
    }

    const cpf = d.friend > 0 ? Math.round(calcAdCost / d.friend) : 0;
    const cpaVal = d.cv > 0 ? Math.round(calcAdCost / d.cv) : 0;

    // コード別を更新
    batch.update(doc.ref, { calc_ad_cost: calcAdCost, cpf, cpa_val: cpaVal });

    // 日付・フロー・メディアごとに集計
    dateAdCostMap[d.date] = (dateAdCostMap[d.date] ?? 0) + calcAdCost;
    const flowKey = `${d.date}__${d.flow}`;
    flowAdCostMap[flowKey] = (flowAdCostMap[flowKey] ?? 0) + calcAdCost;
    const mediaKey = `${d.date}__${media}`;
    mediaAdCostMap[mediaKey] = (mediaAdCostMap[mediaKey] ?? 0) + calcAdCost;
  }

  // 期間別を更新
  for (const [date, adCost] of Object.entries(dateAdCostMap)) {
    const dateRef = adminDb.collection('daily_reports_L').doc(date);
    const dateDoc = await dateRef.get();
    const friend = dateDoc.data()?.friend ?? 0;
    const cv = dateDoc.data()?.cv ?? 0;
    batch.set(dateRef, {
      calc_ad_cost: adCost,
      cpf: friend > 0 ? Math.round(adCost / friend) : 0,
      cpa_val: cv > 0 ? Math.round(adCost / cv) : 0,
    }, { merge: true });
  }

  // メディア別を更新
  for (const [key, adCost] of Object.entries(mediaAdCostMap)) {
    const mediaRef = adminDb.collection('daily_reports_L_by_media').doc(key);
    const mediaDoc = await mediaRef.get();
    const friend = mediaDoc.data()?.friend ?? 0;
    const cv = mediaDoc.data()?.cv ?? 0;
    batch.set(mediaRef, {
      calc_ad_cost: adCost,
      cpf: friend > 0 ? Math.round(adCost / friend) : 0,
      cpa_val: cv > 0 ? Math.round(adCost / cv) : 0,
    }, { merge: true });
  }

  // フロー別を更新
  for (const [key, adCost] of Object.entries(flowAdCostMap)) {
    const flowRef = adminDb.collection('daily_reports_L_by_flow').doc(key);
    const flowDoc = await flowRef.get();
    const friend = flowDoc.data()?.friend ?? 0;
    const cv = flowDoc.data()?.cv ?? 0;
    batch.set(flowRef, {
      calc_ad_cost: adCost,
      cpf: friend > 0 ? Math.round(adCost / friend) : 0,
      cpa_val: cv > 0 ? Math.round(adCost / cv) : 0,
    }, { merge: true });
  }

  await batch.commit();
}

// ==========================================
// 直近1週間にデータがあるフロー一覧をDBから取得する関数
// ==========================================
export async function getActiveFlowValuesFromDB(): Promise<string[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const fromDate = oneWeekAgo.toISOString().slice(0, 10);

  const snapshot = await adminDb
    .collection('daily_reports_L_by_flow')
    .where('date', '>=', fromDate)
    .get();

  const values = new Set<string>(snapshot.docs.map((doc) => doc.data().flow));
  return [...values].sort();
}

// ==========================================
// 直近1週間にデータがあるメディア一覧をDBから取得する関数
// ==========================================
export async function getActiveMediaValuesFromDB(): Promise<string[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const fromDate = oneWeekAgo.toISOString().slice(0, 10);

  const snapshot = await adminDb
    .collection('daily_reports_L_by_media')
    .where('date', '>=', fromDate)
    .get();

  const values = new Set<string>(snapshot.docs.map((doc) => doc.data().media));
  return [...values].sort();
}

// ==========================================
// 直近1週間にデータがあるコード一覧をDBから取得する関数
// ==========================================
export async function getActiveCodeValuesFromDB(): Promise<string[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const fromDate = oneWeekAgo.toISOString().slice(0, 10);

  const snapshot = await adminDb
    .collection('daily_reports_L_by_code')
    .where('date', '>=', fromDate)
    .get();

  const values = new Set<string>(
    snapshot.docs.map((doc) => {
      const d = doc.data();
      return `${d.flow}__${d.media}__${d.media_no}`;
    })
  );
  return [...values].sort();
}