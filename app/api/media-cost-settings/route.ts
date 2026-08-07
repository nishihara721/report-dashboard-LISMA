import { NextResponse } from 'next/server';
import { getMediaCostSettingsFromDB, upsertMediaCostSettingFromDB, deleteMediaCostSettingFromDB, recalcAdCostForMedia } from '@/app/lib/db';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getMediaCostSettingsFromDB();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email?.endsWith('@5s-inc.jp')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { media, from_date, type, rate, cpf, cpa } = await request.json();

    // 設定を保存
    await upsertMediaCostSettingFromDB(media, { from_date, type, rate, cpf, cpa });

    console.log('再計算開始:', media);
    // 広告費を再計算して保存
    await recalcAdCostForMedia(media);
    console.log('再計算完了:', media);

    // 広告費を再計算して保存
    await recalcAdCostForMedia(media);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email?.endsWith('@5s-inc.jp')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { media, from_date } = await request.json();
    await deleteMediaCostSettingFromDB(media, from_date);

    // 広告費を再計算して保存
    await recalcAdCostForMedia(media);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}