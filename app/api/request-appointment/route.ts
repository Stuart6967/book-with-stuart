import { NextResponse } from 'next/server';

const TO_EMAIL = 's.green@care4group.nl';

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, education, subject, notes, preferences } = body;

    if (!firstName || !lastName || !email || !phone || !education || !subject || !Array.isArray(preferences) || preferences.length !== 3) {
      return NextResponse.json({ error: 'Onvolledige gegevens' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY ontbreekt');
      return NextResponse.json({ error: 'E-mailservice is nog niet geconfigureerd' }, { status: 503 });
    }

    const preferenceRows = preferences.map((pref: { date?: string; period?: string }, index: number) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e7ecea;font-weight:700;">Voorkeur ${index + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e7ecea;">${escapeHtml(pref.date)} · ${escapeHtml(pref.period)}</td>
      </tr>`).join('');

    const html = `
      <div style="font-family:Arial,sans-serif;color:#24303a;max-width:680px;margin:auto;">
        <div style="background:#27856d;color:white;padding:22px 24px;border-radius:16px 16px 0 0;">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:1.4px;opacity:.8;">Nieuw afspraakverzoek</div>
          <h1 style="font-size:24px;margin:8px 0 0;">${escapeHtml(firstName)} ${escapeHtml(lastName)}</h1>
        </div>
        <div style="border:1px solid #dfe8e4;border-top:0;padding:24px;border-radius:0 0 16px 16px;">
          <table style="border-collapse:collapse;width:100%;font-size:14px;">
            <tr><td style="padding:10px 12px;border-bottom:1px solid #e7ecea;font-weight:700;">E-mail</td><td style="padding:10px 12px;border-bottom:1px solid #e7ecea;">${escapeHtml(email)}</td></tr>
            <tr><td style="padding:10px 12px;border-bottom:1px solid #e7ecea;font-weight:700;">Telefoon</td><td style="padding:10px 12px;border-bottom:1px solid #e7ecea;">${escapeHtml(phone)}</td></tr>
            <tr><td style="padding:10px 12px;border-bottom:1px solid #e7ecea;font-weight:700;">Opleiding</td><td style="padding:10px 12px;border-bottom:1px solid #e7ecea;">${escapeHtml(education)}</td></tr>
            <tr><td style="padding:10px 12px;border-bottom:1px solid #e7ecea;font-weight:700;">Onderwerp</td><td style="padding:10px 12px;border-bottom:1px solid #e7ecea;">${escapeHtml(subject)}</td></tr>
            ${preferenceRows}
          </table>
          ${notes ? `<div style="margin-top:20px;"><strong>Toelichting</strong><p style="line-height:1.6;color:#5f6d73;">${escapeHtml(notes)}</p></div>` : ''}
          <p style="font-size:12px;color:#899492;margin-top:24px;">Dit verzoek is nog geen definitieve afspraak.</p>
        </div>
      </div>`;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || 'Afspraakverzoeken <onboarding@resend.dev>',
        to: [TO_EMAIL],
        reply_to: email,
        subject: `Nieuw afspraakverzoek: ${firstName} ${lastName}`,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const detail = await resendResponse.text();
      console.error('Resend fout:', detail);
      return NextResponse.json({ error: 'E-mail kon niet worden verstuurd' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Onverwachte fout' }, { status: 500 });
  }
}
