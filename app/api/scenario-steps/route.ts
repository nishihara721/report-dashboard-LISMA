import { NextResponse } from 'next/server';
import { getScenarioStepsFromDB } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sValue = searchParams.get('s') ?? '';
    const data = await getScenarioStepsFromDB(sValue);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}