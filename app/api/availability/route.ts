import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(value?: string) {
  if (!value) return null;
  let url = value.trim();
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1$/i, '');
  return url;
}

function supabase() {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL);
  const key = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function GET() {
  const client = supabase();
  if (!client) return NextResponse.json({ blocked: [], error: 'Supabase is nog niet ingesteld.' }, { status: 500 });

  const { data, error } = await client
    .from('blocked_availability')
    .select('date,period')
    .order('date');

  if (error) {
    console.error('Supabase GET availability error:', error);
    return NextResponse.json({ blocked: [], error: error.message, code: error.code }, { status: 500 });
  }

  return NextResponse.json({ blocked: data || [] });
}

export async function POST(request: NextRequest) {
  if (request.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = supabase();
  if (!client) {
    return NextResponse.json({ error: 'Supabase is nog niet ingesteld.' }, { status: 500 });
  }

  const { date, period } = await request.json();

  if (!date || !period) {
    return NextResponse.json({ error: 'Datum en dagdeel zijn verplicht.' }, { status: 400 });
  }

  const allowedPeriods = ['all', '09:00–12:00', '13:00–16:00'];
  if (!allowedPeriods.includes(period)) {
    return NextResponse.json({ error: 'Ongeldig dagdeel.' }, { status: 400 });
  }

  const day = new Date(`${date}T12:00:00`).getDay();
  if (day === 0 || day === 6) {
    return NextResponse.json({ error: 'Weekenddagen kunnen niet worden geblokkeerd.' }, { status: 400 });
  }

  const { error } = await client
    .from('blocked_availability')
    .insert({ date, period });

  if (error) {
    console.error('Supabase POST availability error:', error);
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (request.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = supabase();
  if (!client) {
    return NextResponse.json({ error: 'Supabase is nog niet ingesteld.' }, { status: 500 });
  }

  const { date, period } = await request.json();

  const { error } = await client
    .from('blocked_availability')
    .delete()
    .eq('date', date)
    .eq('period', period);

  if (error) {
    console.error('Supabase DELETE availability error:', error);
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
