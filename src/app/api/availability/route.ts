import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { computeSlots, getAppointmentsForDate, getBlockedSlotsForDate, getBusinessHoursForDate } from '@/lib/availability';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const durationMin = Math.max(30, parseInt(searchParams.get('durationMin') ?? '30', 10) || 30);

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Bitte ein gültiges Datum angeben.' }, { status: 400 });
  }

  const supabase = supabaseServer();
  const hours = await getBusinessHoursForDate(supabase, date);
  if (!hours) {
    return NextResponse.json({ error: 'Öffnungszeiten nicht gefunden.' }, { status: 500 });
  }

  if (hours.closed) {
    return NextResponse.json({ closed: true, dayLabel: hours.dayLabel, open: hours.open, close: hours.close, slots: [] });
  }

  const [appointments, blockedSlots] = await Promise.all([
    getAppointmentsForDate(supabase, date),
    getBlockedSlotsForDate(supabase, date),
  ]);
  const slots = computeSlots(hours, [...appointments, ...blockedSlots], date, durationMin);

  return NextResponse.json({ closed: false, dayLabel: hours.dayLabel, open: hours.open, close: hours.close, slots });
}
