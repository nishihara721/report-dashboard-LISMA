import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { updateClientUser, deleteClientUser } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

// ユーザー更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email?.endsWith('@5s-inc.jp')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { password, displayName, pages, isActive } = await request.json();

    const updateData: {
      passwordHash?: string;
      displayName?: string;
      pages?: string[];
      isActive?: boolean;
    } = { displayName, pages, isActive };

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    await updateClientUser(id, updateData);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ユーザー削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email?.endsWith('@5s-inc.jp')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await deleteClientUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}