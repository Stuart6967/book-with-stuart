'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, GraduationCap, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import './styles.css';

type Preference = { date: string; period: string };
type BlockedSlot = { date: string; period: string };
const emptyPreference = (): Preference => ({ date: '', period: '' });

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${dateString}T12:00:00`));
}

function buildWeekdays(blocked: BlockedSlot[]) {
  const dates: string[] = [];
  const cursor = new Date();
  cursor.setHours(12,0,0,0);
  while (dates.length < 60) {
    const day = cursor.getDay();
    if (day >= 1 && day <= 5) {
      const iso = cursor.toISOString().split('T')[0];
      const fullyBlocked = blocked.some(item => item.date === iso && item.period === 'all');
      if (!fullyBlocked) dates.push(iso);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export default function Home() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState<BlockedSlot[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([emptyPreference(), emptyPreference(), emptyPreference()]);

  useEffect(() => {
    fetch('/api/availability').then(r => r.ok ? r.json() : { blocked: [] }).then(data => setBlocked(data.blocked || [])).catch(() => setBlocked([]));
  }, []);

  const availableDates = useMemo(() => buildWeekdays(blocked), [blocked]);

  function periodsFor(date: string) {
    const periods = ['09:00–12:00','13:00–16:00'];
    return periods.filter(period => !blocked.some(item => item.date === date && (item.period === period || item.period === 'all')));
  }

  function updatePreference(index: number, field: keyof Preference, value: string) {
    setError('');
    setPreferences(current => current.map((item, i) => i === index ? { ...item, [field]: value, ...(field === 'date' ? { period: '' } : {}) } : item));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSending(true); setError('');
    const data = new FormData(e.currentTarget);
    const payload = { firstName:data.get('firstName'), lastName:data.get('lastName'), email:data.get('email'), phone:data.get('phone'), education:data.get('education'), notes:data.get('notes'), preferences };
    try {
      const response = await fetch('/api/request-appointment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Verzenden mislukt (${response.status})`);
      setSent(true); window.scrollTo({top:0,behavior:'smooth'});
    } catch (err) { setError(err instanceof Error ? err.message : 'Je bereikbaarheid kon niet worden verstuurd.'); }
    finally { setSending(false); }
  }

  if(sent) return <main className="shell success"><div className="successIcon"><CheckCircle2 size={34}/></div><p className="eyebrow">Bereikbaarheid ontvangen</p><h1>Bedankt! Ik weet wanneer ik je kan bellen.</h1><p className="lead">Ik bekijk je voorkeursmomenten en probeer je op één van deze momenten telefonisch te bereiken.</p><button className="secondary" onClick={()=>setSent(false)}>Nog een keer doorgeven</button></main>;

  return <main className="shell">
    <header className="topbar"><div className="brandMark"><span>CARE4</span><b>GROUP</b></div><div className="recruiter"><span>Contact met</span><strong>Stuart Green</strong></div></header>
    <section className="hero"><div className="heroCopy"><p className="eyebrow">Even bellen?</p><h1>Wanneer kan ik jou het beste bellen?</h1><p className="lead">Geef drie momenten door waarop jij goed bereikbaar bent. Zo bel ik je op een moment dat voor jou uitkomt.</p><div className="trustRow"><span><Clock3 size={16}/> Binnen 2 minuten geregeld</span><span><ShieldCheck size={16}/> Persoonlijk contact</span></div></div><div className="heroPanel"><span className="miniLabel">Momenten om te bellen</span><strong>Maandag t/m vrijdag</strong><div className="periodPill">09:00 — 12:00</div><div className="periodPill">13:00 — 16:00</div><small>Je ziet alleen momenten waarop ik je kan bellen.</small></div></section>
    <form onSubmit={submit}>
      <section className="card"><div className="sectionTitle"><span>01</span><div><h2>Wie mag ik bellen?</h2><p>Laat je gegevens achter, dan weet ik wie ik aan de lijn krijg.</p></div></div><div className="grid two"><label><span><UserRound size={16}/> Voornaam</span><input required name="firstName" placeholder="Voornaam"/></label><label><span><UserRound size={16}/> Achternaam</span><input required name="lastName" placeholder="Achternaam"/></label><label><span><Mail size={16}/> E-mailadres</span><input required type="email" name="email" placeholder="naam@email.nl"/></label><label><span><Phone size={16}/> Telefoonnummer</span><input required type="tel" name="phone" placeholder="06 12345678"/></label></div><label><span><GraduationCap size={16}/> Welke opleiding heb je afgerond?</span><input required name="education" placeholder="Bijv. Verzorgende IG, MBO-V, HBO-V of Social Work"/></label><label><span>Korte toelichting <em>optioneel</em></span><textarea name="notes" rows={3} placeholder="Wil je vooraf nog iets aan mij meegeven?"/></label></section>
      <section className="card"><div className="sectionTitle"><span>02</span><div><h2>Wanneer ben je bereikbaar?</h2><p>Kies drie momenten waarop ik jou goed telefonisch kan bereiken.</p></div></div><div className="preferences">{preferences.map((pref,index)=><div className="preference" key={index}><div className="rank"><b>{index+1}</b><small>{index===0?'Eerste voorkeur':index===1?'Tweede voorkeur':'Derde voorkeur'}</small></div><label><span><CalendarDays size={16}/> Datum</span><select required value={pref.date} onChange={e=>updatePreference(index,'date',e.target.value)}><option value="" disabled>Kies een werkdag</option>{availableDates.map(date=><option key={date} value={date}>{formatDate(date)}</option>)}</select></label><label><span><Clock3 size={16}/> Wanneer ben je bereikbaar?</span><select required disabled={!pref.date} value={pref.period} onChange={e=>updatePreference(index,'period',e.target.value)}><option value="" disabled>Kies een tijdvak</option>{periodsFor(pref.date).map(period=><option value={period} key={period}>{period.replace('–',' – ')}</option>)}</select></label></div>)}</div><p className="weekdayHint">Momenten waarop ik niet beschikbaar ben om te bellen, kun je niet selecteren.</p></section>
      {error&&<div className="errorBox">{error}</div>}
      <section className="submitCard"><div><strong>Geef je bereikbaarheid door</strong><p>Ik ontvang je drie voorkeuren en probeer je op één van deze momenten te bellen.</p></div><button type="submit" disabled={sending}>{sending?'Versturen...':'Verstuur mijn bereikbaarheid'}</button></section>
    </form><footer><strong>Samen zorg beter maken.</strong><span>Je gegevens worden alleen gebruikt om contact met je op te nemen.</span><a href="/admin">Administrator</a></footer>
  </main>;
}
