import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { getClientUsers, createClientUser } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

// ユーザー一覧取得
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email?.endsWith('@5s-inc.jp')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getClientUsers();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ユーザー作成
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email?.endsWith('@5s-inc.jp')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username, password, displayName, pages } = await request.json();
    const passwordHash = await bcrypt.hash(password, 10);

    const id = await createClientUser({
      username,
      passwordHash,
      displayName,
      pages: pages ?? ['shared'],
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}