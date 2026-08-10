import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET() {
  const client = supabase();
  if (!client) return NextResponse.json({ blocked: [] });
  const { data, error } = await client.from('blocked_availability').select('date,period').order('date');
  if (error) return NextResponse.json({ blocked: [] }, { status: 500 });
  return NextResponse.json({ blocked: data || [] });
}

export async function POST(request: NextRequest) {
  if (request.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const client = supabase();
  if (!client) return NextResponse.json({ error: 'Supabase is nog niet ingesteld.' }, { status: 500 });
  const body = await request.json();
  const { date, period } = body;
  if (!date || !period) return NextResponse.json({ error: 'Datum en dagdeel zijn verplicht.' }, { status: 400 });
  const { error } = await client.from('blocked_availability').insert({ date, period });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (request.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const client = supabase();
  if (!client) return NextResponse.json({ error: 'Supabase is nog niet ingesteld.' }, { status: 500 });
  const { date, period } = await request.json();
  const { error } = await client.from('blocked_availability').delete().eq('date', date).eq('period', period);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
