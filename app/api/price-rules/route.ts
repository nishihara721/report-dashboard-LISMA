import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // 成果単価は成果ログの列で管理するため、このAPIは空配列を返す
  return NextResponse.json([]);
}