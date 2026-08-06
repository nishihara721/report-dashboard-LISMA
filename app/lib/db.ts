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
    date: string; cl: number; friend: number; cv: number;
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
    date: string; flow: string; cl: number; friend: number; cv: number;
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
    date: string; media: string; cl: number; friend: number; cv: number;
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
    cl: number; friend: number; cv: number;
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
  const snapshot = await adminDb
    .collection('daily_reports_L')
    .orderBy('date', 'asc')
    .get();

  const monthMap: Record<string, {
    cl: number; friend: number; cv: number;
  }> = {};

  snapshot.docs.forEach((doc) => {
    const d = doc.data();
    const month = d.date.slice(0, 7);
    if (!monthMap[month]) monthMap[month] = { cl: 0, friend: 0, cv: 0 };
    monthMap[month].cl += d.cl;
    monthMap[month].friend += d.friend;
    monthMap[month].cv += d.cv;
  });

  const byMonth = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({
      label: month,
      cl: d.cl,
      friend: d.friend,
      friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
      cv: d.cv,
      cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
    }));

  return { byMonth };
}