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

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = adminClient();
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const team = data.users.map((u) => ({
    id: u.id,
    email: u.email,
    role: (u.app_metadata?.role as string) ?? 'admin',
    createdAt: u.created_at,
    lastSignInAt: u.last_sign_in_at,
  }));

  return NextResponse.json(team);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const email = (body.email as string)?.trim().toLowerCase();
  const role = body.role === 'super_admin' ? 'super_admin' : 'admin';
  if (!email) return NextResponse.json({ error: 'E-Mail ist erforderlich.' }, { status: 400 });

  const password = genPassword();
  const supabase = adminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ id: data.user.id, email, role, password }, { status: 201 });
}
