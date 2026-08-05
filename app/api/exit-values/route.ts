import { NextResponse } from 'next/server';
import { getExitValuesFromDB } from '@/app/lib/db';

// export const revalidate = 3600;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const values = await getExitValuesFromDB();
    return NextResponse.json(values);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}