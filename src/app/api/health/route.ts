import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// Throwaway connectivity check for the Supabase setup (Phase 1). Safe to keep
// around after setup, but not linked from any UI.
export async function GET() {
  try {
    const supabase = supabaseServer();
    const { error } = await supabase.from('categories').select('id').limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
