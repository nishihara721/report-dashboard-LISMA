import { NextResponse } from 'next/server';
import { getReportDataByCodeFromDB, getMediaCostSettingsFromDB, calcAdCost } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codeValue = searchParams.get('code') ?? '';
    const from = searchParams.get('from') ?? undefined;
    const to = searchParams.get('to') ?? undefined;

    const [data, costSettings] = await Promise.all([
      getReportDataByCodeFromDB(codeValue, from, to),
      getMediaCostSettingsFromDB(),
    ]);

    const [, media] = codeValue.split('__');
    const rules = costSettings[media];

    const result = data.map((d) => {
      const adCost = calcAdCost(d.ad_cost ?? 0, d.friend, d.cv, d.date, rules);
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