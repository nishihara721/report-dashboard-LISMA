import { NextResponse } from 'next/server';
import { getMediaCostSettingsFromDB, upsertMediaCostSettingFromDB, deleteMediaCostSettingFromDB } from '@/app/lib/db';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

// 設定取得
export async function GET() {
  try {
    const data = await getMediaCostSettingsFromDB();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 設定保存
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email?.endsWith('@5s-inc.jp')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { media, from_date, type, rate, cpf, cpa } = await request.json();
    await upsertMediaCostSettingFromDB(media, { from_date, type, rate, cpf, cpa });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 設定削除
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email?.endsWith('@5s-inc.jp')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { media, from_date } = await request.json();
    await deleteMediaCostSettingFromDB(media, from_date);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}