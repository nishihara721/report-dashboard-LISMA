import { NextResponse } from 'next/server';
import { getReportDataFromDB, getMediaCostSettingsFromDB, calcAdCost } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') ?? undefined;
    const to = searchParams.get('to') ?? undefined;

    const [data, costSettings] = await Promise.all([
      getReportDataFromDB(from, to),
      getMediaCostSettingsFromDB(),
    ]);

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}