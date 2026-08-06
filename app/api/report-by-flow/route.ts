import { NextResponse } from 'next/server';
import { getReportDataByFlowFromDB, getMediaCostSettingsFromDB, calcAdCost } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const flowValue = searchParams.get('flow') ?? '';
    const from = searchParams.get('from') ?? undefined;
    const to = searchParams.get('to') ?? undefined;

    const [data, costSettings] = await Promise.all([
      getReportDataByFlowFromDB(flowValue, from, to),
      getMediaCostSettingsFromDB(),
    ]);

    // フロー別はメディアが混在するためad_costをそのまま合計して表示
    const result = data.map((d) => {
      const adCost = d.ad_cost ?? 0;
      return {
        ...d,
        adCost,
        cpf: d.friend > 0 ? Math.round(adCost / d.friend) : 0,
        cpa: d.cv > 0 ? Math.round(adCost / d.cv) : 0,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}