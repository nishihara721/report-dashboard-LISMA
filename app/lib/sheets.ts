// import { google } from 'googleapis';

// // ==========================================
// // Google Sheets API の認証設定
// // 環境変数から認証情報を読み込んでいます
// // ==========================================
// const auth = new google.auth.JWT({
//   email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
//   key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//   scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
// });

// const sheets = google.sheets({ version: 'v4', auth });

// // 対象のスプレッドシートID（環境変数で管理）
// const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID!;

// // ==========================================
// // CL数のデータソース設定
// // 'flipdesk'  → 【データ】フリップデスクの「ポップアップ内のクリック数」列を使用
// // 'clicklog'  → 【データ】クリックログの「LINE追加」件数を使用
// // 環境変数 CL_SOURCE で切り替え可能。未設定の場合は 'flipdesk' が使われます
// // ==========================================
// const CL_SOURCE = process.env.CL_SOURCE ?? 'flipdesk';

// // ==========================================
// // スプレッドシートのシートデータを取得する共通関数
// // sheetName: シート名
// // headerRow: ヘッダー（列名）が何行目にあるか（デフォルト: 1行目）
// // ==========================================
// async function getSheetData(sheetName: string, headerRow: number = 1): Promise<{ header: string[], rows: string[][] }> {
//   const res = await sheets.spreadsheets.values.get({
//     spreadsheetId: SPREADSHEET_ID,
//     range: sheetName,
//   });
//   const values = res.data.values ?? [];
//   const header = values[headerRow - 1] ?? []; // ヘッダー行を取得
//   const rows = values.slice(headerRow);        // データ行を取得（ヘッダーの次の行から）
//   return { header, rows };
// }

// // ==========================================
// // 日付文字列を "YYYY/MM/DD" 形式に正規化する関数
// // スプシの日付は "2026/3/18 16:38" や "2026/03/18" など
// // 形式がバラバラなので統一します
// // ==========================================
// function toDateStr(value: string): string {
//   if (!value) return '';
//   const part = value.split(' ')[0]; // 時刻部分（例: 16:38）を除去
//   const [y, m, d] = part.split('/');
//   if (!y || !m || !d) return '';
//   // 月・日を必ず2桁に揃える（例: 3 → 03）
//   return `${y}/${m.padStart(2, '0')}/${d.padStart(2, '0')}`;
// }

// // ==========================================
// // 期間別レポートのデータを取得する関数
// // from/to を指定すると日付範囲で絞り込みができます
// // 指定しない場合は全期間のデータを返します
// // ==========================================
// export async function getReportData(from?: string, to?: string) {
//   // 4つのシートを同時に取得（並列処理で高速化）
//   const [session, flip, friend, cv] = await Promise.all([
//     getSheetData('【データ】セッション数', 4), // ヘッダーが4行目にある
//     getSheetData('【データ】フリップデスク', 1),
//     getSheetData('【データ】友だちデータ', 1),
//     getSheetData('【データ】成果ログ', 1),
//   ]);

//   // 各シートの列インデックスを取得（列名で検索）
//   const sessionDateIdx = session.header.indexOf('日付');         // セッション数シートの日付列
//   const sessionTotalIdx = session.header.indexOf('合計');            // セッション数シートの合計列（PV数）
//   const flipDateIdx = flip.header.indexOf('日付');                   // フリップデスクの日付列
//   const flipImpIdx = flip.header.indexOf('自動ポップアップ表示回数'); // imp数の列
//   const flipClIdx = flip.header.indexOf('ポップアップ内のクリック数'); // CL数の列（flipdesk使用時）
//   const friendDateIdx = friend.header.indexOf('友だち追加日時');      // 友だちデータの日付列
//   const cvDateIdx = cv.header.indexOf('成果日時');                   // 成果ログの日付列

//   // 日付をキーとして各指標を集計するオブジェクト
//   const dateMap: Record<string, {
//     pv: number;     // ページビュー数
//     imp: number;    // ポップアップ表示回数
//     cl: number;     // クリック数
//     friend: number; // 友だち追加数
//     cv: number;     // コンバージョン数
//   }> = {};

//   // 日付が存在しない場合は初期値を設定する関数
//   const ensure = (date: string) => {
//     if (!dateMap[date]) dateMap[date] = { pv: 0, imp: 0, cl: 0, friend: 0, cv: 0 };
//   };

//   // PV数の集計（セッション数シートの合計列から取得）
//   for (const row of session.rows) {
//     const date = toDateStr(row[sessionDateIdx] ?? '');
//     if (!date) continue;
//     ensure(date);
//     dateMap[date].pv += Number(row[sessionTotalIdx]) || 0;
//   }

//   // imp数の集計（フリップデスクシートから取得）
//   // CL_SOURCE が 'flipdesk' の場合はCL数も同時に集計
//   for (const row of flip.rows) {
//     const date = toDateStr(row[flipDateIdx] ?? '');
//     if (!date) continue;
//     ensure(date);
//     dateMap[date].imp += Number(row[flipImpIdx]) || 0;
//     if (CL_SOURCE === 'flipdesk') {
//       dateMap[date].cl += Number(row[flipClIdx]) || 0;
//     }
//   }

//   // CL数の集計（クリックログシートから取得）
//   // CL_SOURCE が 'clicklog' の場合のみ実行
//   // 「CV/追加」列が「LINE追加」の行のみカウント
//   if (CL_SOURCE === 'clicklog') {
//     const clickLog = await getSheetData('【データ】クリックログ', 1);
//     const clickDateIdx = clickLog.header.indexOf('クリック日時');
//     const clickTypeIdx = clickLog.header.indexOf('CV/追加');

//     for (const row of clickLog.rows) {
//       if (row[clickTypeIdx] !== 'LINE追加') continue; // LINE追加以外はスキップ
//       const date = toDateStr(row[clickDateIdx] ?? '');
//       if (!date) continue;
//       ensure(date);
//       dateMap[date].cl += 1;
//     }
//   }

//   // 友だち追加数の集計（友だちデータシートの行数をカウント）
//   for (const row of friend.rows) {
//     const date = toDateStr(row[friendDateIdx] ?? '');
//     if (!date) continue;
//     ensure(date);
//     dateMap[date].friend += 1;
//   }

//   // CV数の集計（成果ログシートの行数をカウント）
//   for (const row of cv.rows) {
//     const date = toDateStr(row[cvDateIdx] ?? '');
//     if (!date) continue;
//     ensure(date);
//     dateMap[date].cv += 1;
//   }

//   // 集計結果を日付順に並べ替え、日付範囲でフィルタリングして返す
//   const result = Object.entries(dateMap)
//     .sort(([a], [b]) => a.localeCompare(b))
//     .filter(([date]) => {
//       // APIから受け取った日付（ハイフン区切り）をスラッシュ区切りに変換して比較
//       if (from && date < from.replace(/-/g, '/')) return false;
//       if (to && date > to.replace(/-/g, '/')) return false;
//       return true;
//     })
//     .map(([date, d]) => ({
//       date,
//       pv: d.pv,
//       imp: d.imp,
//       impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',       // imp率 = imp数 ÷ PV数
//       cl: d.cl,
//       ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',          // CTR = CL数 ÷ imp数
//       friend: d.friend,
//       friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-', // 友だち追加率 = 友だち追加数 ÷ CL数
//       cv: d.cv,
//       cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',   // CVR = CV数 ÷ 友だち追加数
//     }));

//   return result;
// }

// // ==========================================
// // ポップアップ（p列）の値一覧を取得する関数
// // チェックボックスの選択肢として使用します
// // 「-」は除外します
// // ==========================================
// export async function getPValues(): Promise<string[]> {
//   const [flip, friend, cv] = await Promise.all([
//     getSheetData('【データ】フリップデスク', 1),
//     getSheetData('【データ】友だちデータ', 1),
//     getSheetData('【データ】成果ログ', 1),
//   ]);

//   const flipPIdx = flip.header.indexOf('p');
//   const friendPIdx = friend.header.indexOf('p');
//   const cvPIdx = cv.header.indexOf('p');

//   // 重複を除いた値のセットを作成
//   const values = new Set<string>();
//   for (const row of flip.rows) if (row[flipPIdx] && row[flipPIdx] !== '-') values.add(row[flipPIdx]);
//   for (const row of friend.rows) if (row[friendPIdx] && row[friendPIdx] !== '-') values.add(row[friendPIdx]);
//   for (const row of cv.rows) if (row[cvPIdx] && row[cvPIdx] !== '-') values.add(row[cvPIdx]);

//   return [...values].sort(); // アルファベット順に並び替えて返す
// }

// // ==========================================
// // ポップアップ別レポートのデータを取得する関数
// // pValue: 絞り込むポップアップの値（例: "p01"）
// // from/to: 日付範囲（省略可）
// // PV数はポップアップに関係なく全体の合計を使用します
// // ==========================================
// export async function getReportDataByP(pValue: string, from?: string, to?: string) {
//   const [session, flip, friend, cv] = await Promise.all([
//     getSheetData('【データ】セッション数', 4),
//     getSheetData('【データ】フリップデスク', 1),
//     getSheetData('【データ】友だちデータ', 1),
//     getSheetData('【データ】成果ログ', 1),
//   ]);

//   const sessionDateIdx = session.header.indexOf('日付');
//   const sessionTotalIdx = session.header.indexOf('合計');
//   const flipDateIdx = flip.header.indexOf('日付');
//   const flipImpIdx = flip.header.indexOf('自動ポップアップ表示回数');
//   const flipClIdx = flip.header.indexOf('ポップアップ内のクリック数');
//   const flipPIdx = flip.header.indexOf('p');
//   const friendDateIdx = friend.header.indexOf('友だち追加日時');
//   const friendPIdx = friend.header.indexOf('p');
//   const cvDateIdx = cv.header.indexOf('成果日時');
//   const cvPIdx = cv.header.indexOf('p');

//   const dateMap: Record<string, {
//     pv: number; imp: number; cl: number; friend: number; cv: number;
//   }> = {};

//   const ensure = (date: string) => {
//     if (!dateMap[date]) dateMap[date] = { pv: 0, imp: 0, cl: 0, friend: 0, cv: 0 };
//   };

//   // PV数はポップアップで絞り込まず全体の合計を使用
//   for (const row of session.rows) {
//     const date = toDateStr(row[sessionDateIdx] ?? '');
//     if (!date) continue;
//     ensure(date);
//     dateMap[date].pv += Number(row[sessionTotalIdx]) || 0;
//   }

//   // imp数・CL数（指定のポップアップのみ）
//   for (const row of flip.rows) {
//     if (!row[flipPIdx] || row[flipPIdx] === '-' || row[flipPIdx] !== pValue) continue;
//     const date = toDateStr(row[flipDateIdx] ?? '');
//     if (!date) continue;
//     ensure(date);
//     dateMap[date].imp += Number(row[flipImpIdx]) || 0;
//     if (CL_SOURCE === 'flipdesk') {
//       dateMap[date].cl += Number(row[flipClIdx]) || 0;
//     }
//   }

//   // CL数（クリックログシートから取得・指定のポップアップのみ）
//   if (CL_SOURCE === 'clicklog') {
//     const clickLog = await getSheetData('【データ】クリックログ', 1);
//     const clickDateIdx = clickLog.header.indexOf('クリック日時');
//     const clickTypeIdx = clickLog.header.indexOf('CV/追加');
//     const clickPIdx = clickLog.header.indexOf('p');

//     for (const row of clickLog.rows) {
//       if (row[clickTypeIdx] !== 'LINE追加') continue;
//       if (!row[clickPIdx] || row[clickPIdx] !== pValue) continue;
//       const date = toDateStr(row[clickDateIdx] ?? '');
//       if (!date) continue;
//       ensure(date);
//       dateMap[date].cl += 1;
//     }
//   }

//   // 友だち追加数（指定のポップアップのみ）
//   for (const row of friend.rows) {
//     if (!row[friendPIdx] || row[friendPIdx] === '-' || row[friendPIdx] !== pValue) continue;
//     const date = toDateStr(row[friendDateIdx] ?? '');
//     if (!date) continue;
//     ensure(date);
//     dateMap[date].friend += 1;
//   }

//   // CV数（指定のポップアップのみ）
//   for (const row of cv.rows) {
//     if (!row[cvPIdx] || row[cvPIdx] === '-' || row[cvPIdx] !== pValue) continue;
//     const date = toDateStr(row[cvDateIdx] ?? '');
//     if (!date) continue;
//     ensure(date);
//     dateMap[date].cv += 1;
//   }

//   return Object.entries(dateMap)
//     .sort(([a], [b]) => a.localeCompare(b))
//     .filter(([date]) => {
//       if (from && date < from.replace(/-/g, '/')) return false;
//       if (to && date > to.replace(/-/g, '/')) return false;
//       return true;
//     })
//     .map(([date, d]) => ({
//       date,
//       pv: d.pv,
//       imp: d.imp,
//       impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
//       cl: d.cl,
//       ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
//       friend: d.friend,
//       friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
//       cv: d.cv,
//       cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
//     }));
// }

// // ==========================================
// // 直近1週間にデータがあるポップアップ（p列）の値一覧を取得する関数
// // ==========================================
// export async function getActivePValues(): Promise<string[]> {
//   const [flip, friend, cv] = await Promise.all([
//     getSheetData('【データ】フリップデスク', 1),
//     getSheetData('【データ】友だちデータ', 1),
//     getSheetData('【データ】成果ログ', 1),
//   ]);

//   const flipPIdx = flip.header.indexOf('p');
//   const flipDateIdx = flip.header.indexOf('日付');
//   const friendPIdx = friend.header.indexOf('p');
//   const friendDateIdx = friend.header.indexOf('友だち追加日時');
//   const cvPIdx = cv.header.indexOf('p');
//   const cvDateIdx = cv.header.indexOf('成果日時');

//   // 直近1週間の日付を計算
//   const now = new Date();
//   const oneWeekAgo = new Date(now);
//   oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
//   const fromDate = `${oneWeekAgo.getFullYear()}/${String(oneWeekAgo.getMonth() + 1).padStart(2, '0')}/${String(oneWeekAgo.getDate()).padStart(2, '0')}`;

//   const values = new Set<string>();

//   for (const row of flip.rows) {
//     const date = toDateStr(row[flipDateIdx] ?? '');
//     if (!date || date < fromDate) continue;
//     if (row[flipPIdx] && row[flipPIdx] !== '-') values.add(row[flipPIdx]);
//   }

//   for (const row of friend.rows) {
//     const date = toDateStr(row[friendDateIdx] ?? '');
//     if (!date || date < fromDate) continue;
//     if (row[friendPIdx] && row[friendPIdx] !== '-') values.add(row[friendPIdx]);
//   }

//   for (const row of cv.rows) {
//     const date = toDateStr(row[cvDateIdx] ?? '');
//     if (!date || date < fromDate) continue;
//     if (row[cvPIdx] && row[cvPIdx] !== '-') values.add(row[cvPIdx]);
//   }

//   return [...values].sort();
// }

// // ==========================================
// // 離脱地点の値一覧を取得する関数
// // チェックボックスの選択肢として使用します
// // 「-」は除外します
// // ==========================================
// export async function getExitValues(): Promise<string[]> {
//   const [flip, friend] = await Promise.all([
//     getSheetData('【データ】フリップデスク', 1),
//     getSheetData('【データ】友だちデータ', 1),
//   ]);

//   const flipIdx = flip.header.indexOf('離脱地点');
//   const friendIdx = friend.header.indexOf('離脱地点');

//   const values = new Set<string>();
//   for (const row of flip.rows) if (row[flipIdx] && row[flipIdx] !== '-') values.add(row[flipIdx]);
//   for (const row of friend.rows) if (row[friendIdx] && row[friendIdx] !== '-') values.add(row[friendIdx]);

//   return [...values].sort();
// }

// // ==========================================
// // 離脱地点別レポートのデータを取得する関数
// // exitValue: 絞り込む離脱地点の値（例: "LP離脱"）
// // from/to: 日付範囲（省略可）
// // CV数・CVRは離脱地点別では表示しないため集計しません
// // ==========================================
// export async function getReportDataByExit(exitValue: string, from?: string, to?: string) {
//   const [session, flip, friend] = await Promise.all([
//     getSheetData('【データ】セッション数', 4),
//     getSheetData('【データ】フリップデスク', 1),
//     getSheetData('【データ】友だちデータ', 1),
//   ]);

//   const sessionDateIdx = session.header.indexOf('日付');
//   const sessionTotalIdx = session.header.indexOf('合計');
//   const flipDateIdx = flip.header.indexOf('日付');
//   const flipImpIdx = flip.header.indexOf('自動ポップアップ表示回数');
//   const flipClIdx = flip.header.indexOf('ポップアップ内のクリック数');
//   const flipExitIdx = flip.header.indexOf('離脱地点');
//   const friendDateIdx = friend.header.indexOf('友だち追加日時');
//   const friendExitIdx = friend.header.indexOf('離脱地点');

//   const dateMap: Record<string, {
//     pv: number; imp: number; cl: number; friend: number;
//   }> = {};

//   const ensure = (date: string) => {
//     if (!dateMap[date]) dateMap[date] = { pv: 0, imp: 0, cl: 0, friend: 0 };
//   };

//   // PV数はポップアップで絞り込まず全体の合計を使用
//   for (const row of session.rows) {
//     const date = toDateStr(row[sessionDateIdx] ?? '');
//     if (!date) continue;
//     ensure(date);
//     dateMap[date].pv += Number(row[sessionTotalIdx]) || 0;
//   }

//   // imp数・CL数（指定の離脱地点のみ）
//   for (const row of flip.rows) {
//     if (!row[flipExitIdx] || row[flipExitIdx] === '-' || row[flipExitIdx] !== exitValue) continue;
//     const date = toDateStr(row[flipDateIdx] ?? '');
//     if (!date) continue;
//     ensure(date);
//     dateMap[date].imp += Number(row[flipImpIdx]) || 0;
//     if (CL_SOURCE === 'flipdesk') {
//       dateMap[date].cl += Number(row[flipClIdx]) || 0;
//     }
//   }

//   // CL数（クリックログシートから取得・指定の離脱地点のみ）
//   if (CL_SOURCE === 'clicklog') {
//     const clickLog = await getSheetData('【データ】クリックログ', 1);
//     const clickDateIdx = clickLog.header.indexOf('クリック日時');
//     const clickTypeIdx = clickLog.header.indexOf('CV/追加');
//     const clickExitIdx = clickLog.header.indexOf('離脱地点');

//     for (const row of clickLog.rows) {
//       if (row[clickTypeIdx] !== 'LINE追加') continue;
//       if (!row[clickExitIdx] || row[clickExitIdx] !== exitValue) continue;
//       const date = toDateStr(row[clickDateIdx] ?? '');
//       if (!date) continue;
//       ensure(date);
//       dateMap[date].cl += 1;
//     }
//   }

//   // 友だち追加数（指定の離脱地点のみ）
//   for (const row of friend.rows) {
//     if (!row[friendExitIdx] || row[friendExitIdx] === '-' || row[friendExitIdx] !== exitValue) continue;
//     const date = toDateStr(row[friendDateIdx] ?? '');
//     if (!date) continue;
//     ensure(date);
//     dateMap[date].friend += 1;
//   }

//   return Object.entries(dateMap)
//     .sort(([a], [b]) => a.localeCompare(b))
//     .filter(([date]) => {
//       if (from && date < from.replace(/-/g, '/')) return false;
//       if (to && date > to.replace(/-/g, '/')) return false;
//       return true;
//     })
//     .map(([date, d]) => ({
//       date,
//       pv: d.pv,
//       imp: d.imp,
//       impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
//       cl: d.cl,
//       ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
//       friend: d.friend,
//       friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
//     }));
// }

// // ==========================================
// // シナリオ（s列）の値一覧を取得する関数
// // チェックボックスの選択肢として使用します
// // 「-」は除外します
// // ==========================================
// export async function getSValues(): Promise<string[]> {
//   const [flip, friend, cv] = await Promise.all([
//     getSheetData('【データ】フリップデスク', 1),
//     getSheetData('【データ】友だちデータ', 1),
//     getSheetData('【データ】成果ログ', 1),
//   ]);

//   const flipSIdx = flip.header.indexOf('s');
//   const friendSIdx = friend.header.indexOf('s');
//   const cvSIdx = cv.header.indexOf('s');

//   const values = new Set<string>();
//   for (const row of flip.rows) if (row[flipSIdx] && row[flipSIdx] !== '-') values.add(row[flipSIdx]);
//   for (const row of friend.rows) if (row[friendSIdx] && row[friendSIdx] !== '-') values.add(row[friendSIdx]);
//   for (const row of cv.rows) if (row[cvSIdx] && row[cvSIdx] !== '-') values.add(row[cvSIdx]);

//   return [...values].sort();
// }

// // ==========================================
// // シナリオ別レポートのデータを取得する関数
// // sValue: 絞り込むシナリオの値（例: "s01"）
// // from/to: 日付範囲（省略可）
// // PV数はシナリオに関係なく全体の合計を使用します
// // ==========================================
// export async function getReportDataByS(sValue: string, from?: string, to?: string) {
//   const [session, flip, friend, cv] = await Promise.all([
//     getSheetData('【データ】セッション数', 4),
//     getSheetData('【データ】フリップデスク', 1),
//     getSheetData('【データ】友だちデータ', 1),
//     getSheetData('【データ】成果ログ', 1),
//   ]);

//   const sessionDateIdx = session.header.indexOf('日付');
//   const sessionTotalIdx = session.header.indexOf('合計');
//   const flipDateIdx = flip.header.indexOf('日付');
//   const flipImpIdx = flip.header.indexOf('自動ポップアップ表示回数');
//   const flipClIdx = flip.header.indexOf('ポップアップ内のクリック数');
//   const flipSIdx = flip.header.indexOf('s');
//   const friendDateIdx = friend.header.indexOf('友だち追加日時');
//   const friendSIdx = friend.header.indexOf('s');
//   const cvDateIdx = cv.header.indexOf('成果日時');
//   const cvSIdx = cv.header.indexOf('s');

//   const dateMap: Record<string, {
//     pv: number; imp: number; cl: number; friend: number; cv: number;
//   }> = {};

//   const ensure = (date: string) => {
//     if (!dateMap[date]) dateMap[date] = { pv: 0, imp: 0, cl: 0, friend: 0, cv: 0 };
//   };

//   // PV数はシナリオで絞り込まず全体の合計を使用
//   for (const row of session.rows) {
//     const date = toDateStr(row[sessionDateIdx] ?? '');
//     if (!date) continue;
//     ensure(date);
//     dateMap[date].pv += Number(row[sessionTotalIdx]) || 0;
//   }

//   // imp数・CL数（指定のシナリオのみ）
//   for (const row of flip.rows) {
//     if (!row[flipSIdx] || row[flipSIdx] === '-' || row[flipSIdx] !== sValue) continue;
//     const date = toDateStr(row[flipDateIdx] ?? '');
//     if (!date) continue;
//     ensure(date);
//     dateMap[date].imp += Number(row[flipImpIdx]) || 0;
//     if (CL_SOURCE === 'flipdesk') {
//       dateMap[date].cl += Number(row[flipClIdx]) || 0;
//     }
//   }

//   // CL数（クリックログシートから取得・指定のシナリオのみ）
//   if (CL_SOURCE === 'clicklog') {
//     const clickLog = await getSheetData('【データ】クリックログ', 1);
//     const clickDateIdx = clickLog.header.indexOf('クリック日時');
//     const clickTypeIdx = clickLog.header.indexOf('CV/追加');
//     const clickSIdx = clickLog.header.indexOf('s');

//     for (const row of clickLog.rows) {
//       if (row[clickTypeIdx] !== 'LINE追加') continue;
//       if (!row[clickSIdx] || row[clickSIdx] !== sValue) continue;
//       const date = toDateStr(row[clickDateIdx] ?? '');
//       if (!date) continue;
//       ensure(date);
//       dateMap[date].cl += 1;
//     }
//   }

//   // 友だち追加数（指定のシナリオのみ）
//   for (const row of friend.rows) {
//     if (!row[friendSIdx] || row[friendSIdx] === '-' || row[friendSIdx] !== sValue) continue;
//     const date = toDateStr(row[friendDateIdx] ?? '');
//     if (!date) continue;
//     ensure(date);
//     dateMap[date].friend += 1;
//   }

//   // CV数（指定のシナリオのみ）
//   for (const row of cv.rows) {
//     if (!row[cvSIdx] || row[cvSIdx] === '-' || row[cvSIdx] !== sValue) continue;
//     const date = toDateStr(row[cvDateIdx] ?? '');
//     if (!date) continue;
//     ensure(date);
//     dateMap[date].cv += 1;
//   }

//   return Object.entries(dateMap)
//     .sort(([a], [b]) => a.localeCompare(b))
//     .filter(([date]) => {
//       if (from && date < from.replace(/-/g, '/')) return false;
//       if (to && date > to.replace(/-/g, '/')) return false;
//       return true;
//     })
//     .map(([date, d]) => ({
//       date,
//       pv: d.pv,
//       imp: d.imp,
//       impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
//       cl: d.cl,
//       ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
//       friend: d.friend,
//       friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
//       cv: d.cv,
//       cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
//     }));
// }

// // ==========================================
// // サマリ用：月別・p別・s別を1回のAPI取得でまとめて集計
// // 3つの集計を別々に行うとAPIリクエスト数が増えるため統合しています
// // ==========================================
// export async function getSummaryData() {

//   // 全シートを1回だけ取得
//   const [session, flip, friend, cv] = await Promise.all([
//     getSheetData('【データ】セッション数', 4),
//     getSheetData('【データ】フリップデスク', 1),
//     getSheetData('【データ】友だちデータ', 1),
//     getSheetData('【データ】成果ログ', 1),
//   ]);

//   const sessionDateIdx = session.header.indexOf('日付');
//   const sessionTotalIdx = session.header.indexOf('合計');
//   const flipDateIdx = flip.header.indexOf('日付');
//   const flipImpIdx = flip.header.indexOf('自動ポップアップ表示回数');
//   const flipClIdx = flip.header.indexOf('ポップアップ内のクリック数');
//   const flipPIdx = flip.header.indexOf('p');
//   const flipSIdx = flip.header.indexOf('s');
//   const friendDateIdx = friend.header.indexOf('友だち追加日時');
//   const friendPIdx = friend.header.indexOf('p');
//   const friendSIdx = friend.header.indexOf('s');
//   const cvDateIdx = cv.header.indexOf('成果日時');
//   const cvPIdx = cv.header.indexOf('p');
//   const cvSIdx = cv.header.indexOf('s');

//   // 月別集計用
//   const monthMap: Record<string, {
//     pv: number; imp: number; cl: number; friend: number; cv: number; billing: number;
//   }> = {};

//   // p別集計用
//   const pMap: Record<string, {
//     imp: number; cl: number; friend: number; cv: number; billing: number;
//   }> = {};

//   // s別集計用
//   const sMap: Record<string, {
//     imp: number; cl: number; friend: number; cv: number; billing: number;
//   }> = {};

//   const ensureMonth = (month: string) => {
//     if (!monthMap[month]) monthMap[month] = { pv: 0, imp: 0, cl: 0, friend: 0, cv: 0, billing: 0 };
//   };
//   const ensureP = (p: string) => {
//     if (!pMap[p]) pMap[p] = { imp: 0, cl: 0, friend: 0, cv: 0, billing: 0 };
//   };
//   const ensureS = (s: string) => {
//     if (!sMap[s]) sMap[s] = { imp: 0, cl: 0, friend: 0, cv: 0, billing: 0 };
//   };

//   // PV数（月別のみ）
//   let totalPv = 0;
//   for (const row of session.rows) {
//     const date = toDateStr(row[sessionDateIdx] ?? '');
//     if (!date) continue;
//     const month = date.slice(0, 7);
//     ensureMonth(month);
//     const pv = Number(row[sessionTotalIdx]) || 0;
//     monthMap[month].pv += pv;
//     totalPv += pv;
//   }

//   // imp数・CL数（月別・p別・s別）
//   for (const row of flip.rows) {
//     const date = toDateStr(row[flipDateIdx] ?? '');
//     if (!date) continue;
//     const month = date.slice(0, 7);
//     const p = row[flipPIdx];
//     const s = row[flipSIdx];
//     const imp = Number(row[flipImpIdx]) || 0;
//     const cl = CL_SOURCE === 'flipdesk' ? Number(row[flipClIdx]) || 0 : 0;

//     ensureMonth(month);
//     monthMap[month].imp += imp;
//     monthMap[month].cl += cl;

//     if (p && p !== '-') {
//       ensureP(p);
//       pMap[p].imp += imp;
//       pMap[p].cl += cl;
//     }

//     if (s && s !== '-') {
//       ensureS(s);
//       sMap[s].imp += imp;
//       sMap[s].cl += cl;
//     }
//   }

//   // CL数（クリックログシートから取得）
//   if (CL_SOURCE === 'clicklog') {
//     const clickLog = await getSheetData('【データ】クリックログ', 1);
//     const clickDateIdx = clickLog.header.indexOf('クリック日時');
//     const clickTypeIdx = clickLog.header.indexOf('CV/追加');
//     const clickPIdx = clickLog.header.indexOf('p');
//     const clickSIdx = clickLog.header.indexOf('s');

//     for (const row of clickLog.rows) {
//       if (row[clickTypeIdx] !== 'LINE追加') continue;
//       const date = toDateStr(row[clickDateIdx] ?? '');
//       if (!date) continue;
//       const month = date.slice(0, 7);
//       const p = row[clickPIdx];
//       const s = row[clickSIdx];

//       ensureMonth(month);
//       monthMap[month].cl += 1;

//       if (p && p !== '-') { ensureP(p); pMap[p].cl += 1; }
//       if (s && s !== '-') { ensureS(s); sMap[s].cl += 1; }
//     }
//   }

//   // 友だち追加数（月別・p別・s別）
//   for (const row of friend.rows) {
//     const date = toDateStr(row[friendDateIdx] ?? '');
//     if (!date) continue;
//     const month = date.slice(0, 7);
//     const p = row[friendPIdx];
//     const s = row[friendSIdx];

//     ensureMonth(month);
//     monthMap[month].friend += 1;

//     if (p && p !== '-') { ensureP(p); pMap[p].friend += 1; }
//     if (s && s !== '-') { ensureS(s); sMap[s].friend += 1; }
//   }

//   // CV数・請求額（月別・p別・s別）
//   // 請求額はサマリではDBから集計するため、ここでは0として扱う
//   for (const row of cv.rows) {
//     const date = toDateStr(row[cvDateIdx] ?? '');
//     if (!date) continue;
//     const month = date.slice(0, 7);
//     const p = row[cvPIdx];
//     const s = row[cvSIdx];

//     ensureMonth(month);
//     monthMap[month].cv += 1;

//     if (p && p !== '-') { ensureP(p); pMap[p].cv += 1; }
//     if (s && s !== '-') { ensureS(s); sMap[s].cv += 1; }
//   }

//   // 月別の出力
//   const byMonth = Object.entries(monthMap)
//     .sort(([a], [b]) => a.localeCompare(b))
//     .map(([month, d]) => ({
//       label: month,
//       pv: d.pv,
//       imp: d.imp,
//       impRate: d.pv > 0 ? ((d.imp / d.pv) * 100).toFixed(2) + '%' : '-',
//       cl: d.cl,
//       ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
//       friend: d.friend,
//       friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
//       cv: d.cv,
//       cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
//       billing: d.billing,
//     }));

//   // p別の出力
//   const byP = Object.entries(pMap)
//     .sort(([a], [b]) => a.localeCompare(b))
//     .map(([p, d]) => ({
//       label: p,
//       pv: totalPv,
//       imp: d.imp,
//       impRate: totalPv > 0 ? ((d.imp / totalPv) * 100).toFixed(2) + '%' : '-',
//       cl: d.cl,
//       ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
//       friend: d.friend,
//       friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
//       cv: d.cv,
//       cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
//       billing: d.billing,
//     }));

//   // s別の出力
//   const byS = Object.entries(sMap)
//     .sort(([a], [b]) => a.localeCompare(b))
//     .map(([s, d]) => ({
//       label: s,
//       pv: totalPv,
//       imp: d.imp,
//       impRate: totalPv > 0 ? ((d.imp / totalPv) * 100).toFixed(2) + '%' : '-',
//       cl: d.cl,
//       ctr: d.imp > 0 ? ((d.cl / d.imp) * 100).toFixed(2) + '%' : '-',
//       friend: d.friend,
//       friendRate: d.cl > 0 ? ((d.friend / d.cl) * 100).toFixed(2) + '%' : '-',
//       cv: d.cv,
//       cvr: d.friend > 0 ? ((d.cv / d.friend) * 100).toFixed(2) + '%' : '-',
//       billing: d.billing,
//     }));

//   return { byMonth, byP, byS };
// }