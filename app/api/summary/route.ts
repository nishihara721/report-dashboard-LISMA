import { NextResponse } from 'next/server';
import { getSummaryDataFromDB } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('FB_PROJECT_ID:', process.env.FB_PROJECT_ID);
    console.log('FB_CLIENT_EMAIL:', process.env.FB_CLIENT_EMAIL);
    console.log('FB_PRIVATE_KEY exists:', !!process.env.FB_PRIVATE_KEY);
    const data = await getSummaryDataFromDB();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Summary error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}