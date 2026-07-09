import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

const SLOT_STEP_MIN = 30;

export interface BusinessHoursRow {
  weekday: number;
  dayLabel: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface BookedInterval {
  startsAt: string;
  durationMin: number;
}

export interface AvailabilitySlot {
  time: string;
  available: boolean;
}

export async function getBusinessHoursForDate(
  supabase: SupabaseClient<Database>,
  date: string,
): Promise<BusinessHoursRow | null> {
  const weekday = new Date(`${date}T00:00:00`).getDay();
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .eq('weekday', weekday)
    .maybeSingle();
  if (error || !data) return null;
  return {
    weekday: data.weekday,
    dayLabel: data.day_label,
    open: data.open_time.slice(0, 5),
    close: data.close_time.slice(0, 5),
    closed: data.closed,
  };
}

export async function getAppointmentsForDate(
  supabase: SupabaseClient<Database>,
  date: string,
): Promise<BookedInterval[]> {
  const dayStart = `${date}T00:00:00.000Z`;
  const dayEnd = `${date}T23:59:59.999Z`;
  const { data, error } = await supabase
    .from('appointments')
    .select('starts_at, duration_min')
    .neq('status', 'cancelled')
    .gte('starts_at', dayStart)
    .lte('starts_at', dayEnd);
  if (error || !data) return [];
  return data.map((row) => ({ startsAt: row.starts_at, durationMin: row.duration_min }));
}

// Manual blocks (external-channel bookings like Treatwell, lunch breaks, time
// off) — same shape as a booked appointment interval, merged in by callers.
export async function getBlockedSlotsForDate(
  supabase: SupabaseClient<Database>,
  date: string,
): Promise<BookedInterval[]> {
  const dayStart = `${date}T00:00:00.000Z`;
  const dayEnd = `${date}T23:59:59.999Z`;
  const { data, error } = await supabase
    .from('blocked_slots')
    .select('starts_at, duration_min')
    .gte('starts_at', dayStart)
    .lte('starts_at', dayEnd);
  if (error || !data) return [];
  return data.map((row) => ({ startsAt: row.starts_at, durationMin: row.duration_min }));
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function overlaps(aStartMin: number, aEndMin: number, bStartMin: number, bEndMin: number): boolean {
  return aStartMin < bEndMin && bStartMin < aEndMin;
}

// Appointment times are stored as naive Europe/Berlin wall-clock values (see
// booking convention note on starts_at) — comparing them against raw UTC
// "now" drifts by 1-2h depending on DST, which let already-passed slots keep
// showing as available. Read "now" back out in the same Berlin wall-clock frame.
function berlinNow(): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

export function hasOverlap(
  appointments: BookedInterval[],
  startsAt: Date,
  durationMin: number,
): boolean {
  const startMin = startsAt.getTime() / 60000;
  const endMin = startMin + durationMin;
  return appointments.some((appt) => {
    const apptStartMin = new Date(appt.startsAt).getTime() / 60000;
    const apptEndMin = apptStartMin + appt.durationMin;
    return overlaps(startMin, endMin, apptStartMin, apptEndMin);
  });
}

export function computeSlots(
  hours: BusinessHoursRow,
  appointments: BookedInterval[],
  date: string,
  durationMin: number,
): AvailabilitySlot[] {
  if (hours.closed) return [];

  const openMin = toMinutes(hours.open);
  const closeMin = toMinutes(hours.close);
  const { date: todayBerlin, minutes: nowMinBerlin } = berlinNow();
  const isToday = date === todayBerlin;
  const nowMin = isToday ? nowMinBerlin : -1;

  const busy = appointments.map((appt) => {
    const apptDate = new Date(appt.startsAt);
    const apptStartMin = apptDate.getUTCHours() * 60 + apptDate.getUTCMinutes();
    return { start: apptStartMin, end: apptStartMin + appt.durationMin };
  });

  const slots: AvailabilitySlot[] = [];
  for (let slotStart = openMin; slotStart + durationMin <= closeMin; slotStart += SLOT_STEP_MIN) {
    const slotEnd = slotStart + durationMin;
    const inPast = isToday && slotStart <= nowMin;
    const conflicts = busy.some((b) => overlaps(slotStart, slotEnd, b.start, b.end));
    const hh = String(Math.floor(slotStart / 60)).padStart(2, '0');
    const mm = String(slotStart % 60).padStart(2, '0');
    slots.push({ time: `${hh}:${mm}`, available: !inPast && !conflicts });
  }
  return slots;
}
