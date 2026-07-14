import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminSession } from '@/lib/supabase/authServer';
import crypto from 'node:crypto';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function genPassword() {
  return crypto.randomBytes(9).toString('base64url');
}

async function requireSuperAdmin() {
  const session = await getAdminSession();
  if (!session || session.role !== 'super_admin') return null;
  return session;
}

// Reset a team member's password to a freshly generated one-time password.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const supabase = adminClient();

  if (body.action === 'reset-password') {
    const password = genPassword();
    const { error } = await supabase.auth.admin.updateUserById(id, { password });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ password });
  }

  if (body.action === 'set-role') {
    const role = body.role === 'super_admin' ? 'super_admin' : 'admin';
    const { error } = await supabase.auth.admin.updateUserById(id, { app_metadata: { role } });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unbekannte Aktion.' }, { status: 400 });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ error: 'Du kannst dich nicht selbst entfernen.' }, { status: 400 });
  }

  const supabase = adminClient();
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
