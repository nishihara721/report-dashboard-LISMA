// ==========================================
// 共通ユーティリティ関数
// アプリ全体で使い回す計算・変換処理をまとめています
// ==========================================

// ------------------------------------------
// 割合を計算してパーセント文字列で返す関数
// 例: calcRate(25, 100) → "25.00%"
// 分母が0の場合は "-" を返します
// ------------------------------------------
export function calcRate(numerator: number, denominator: number): string {
  if (denominator === 0) return '-';
  return ((numerator / denominator) * 100).toFixed(2) + '%';
}

// ------------------------------------------
// 日付オブジェクトを "YYYY/MM/DD" 形式の文字列に変換する関数
// 例: new Date(2026, 2, 5) → "2026/03/05"
// ------------------------------------------
export function toYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}
