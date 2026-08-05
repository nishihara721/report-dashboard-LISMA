import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('client_session');

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(session.value);
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}