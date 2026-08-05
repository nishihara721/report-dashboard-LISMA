import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getClientUserByUsername } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

type ClientUser = {
  id: string;
  username: string;
  display_name: string;
  password_hash: string;
  pages: string[];
  is_active: boolean;
};

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const user = await getClientUserByUsername(username) as ClientUser | null;

    if (!user) {
      return NextResponse.json({ error: 'IDまたはパスワードが違います' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'IDまたはパスワードが違います' }, { status: 401 });
    }

    const pages = user.pages ?? ['shared'];

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        pages,
      },
    });

    response.cookies.set('client_session', JSON.stringify({
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      pages,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}