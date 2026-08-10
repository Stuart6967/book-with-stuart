import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) return NextResponse.json({ error: 'Administratorwachtwoord is nog niet ingesteld.' }, { status: 500 });
  if (password !== configured) return NextResponse.json({ error: 'Onjuist wachtwoord.' }, { status: 401 });
  return NextResponse.json({ ok: true });
}
