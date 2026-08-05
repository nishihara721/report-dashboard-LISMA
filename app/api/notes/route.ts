import { NextResponse } from 'next/server';
import { getNotesFromDB, upsertNoteFromDB } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

// メモの取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') ?? undefined;
    const to = searchParams.get('to') ?? undefined;
    const data = await getNotesFromDB(from, to);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// メモの保存
export async function POST(request: Request) {
  try {
    const { date, note } = await request.json();
    await upsertNoteFromDB(date, note);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}