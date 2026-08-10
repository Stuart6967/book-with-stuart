'use client';

import { FormEvent, useEffect, useState } from 'react';
import { CalendarOff, LockKeyhole, Trash2 } from 'lucide-react';
import '../styles.css';

type BlockedSlot = { date: string; period: string };

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [blocked, setBlocked] = useState<BlockedSlot[]>([]);
  const [date, setDate] = useState('');
  const [period, setPeriod] = useState('all');
  const [error, setError] = useState('');

  async function load() {
    const r = await fetch('/api/availability');
    const data = await r.json();
    setBlocked(data.blocked || []);
  }

  useEffect(() => { load(); }, []);

  function login(e: FormEvent) {
    e.preventDefault();
    if (!password) return;
    setAuthenticated(true);
  }

  async function addBlock(e: FormEvent) {
    e.preventDefault(); setError('');
    const r = await fetch('/api/availability',{method:'POST',headers:{'Content-Type':'application/json','x-admin-password':password},body:JSON.stringify({date,period})});
    if (r.status === 401) { setAuthenticated(false); setError('Onjuist administratorwachtwoord.'); return; }
    const data = await r.json();
    if (!r.ok) { setError(data.error || 'Opslaan mislukt.'); return; }
    setDate(''); setPeriod('all'); await load();
  }

  async function removeBlock(item: BlockedSlot) {
    setError('');
    const r = await fetch('/api/availability',{method:'DELETE',headers:{'Content-Type':'application/json','x-admin-password':password},body:JSON.stringify(item)});
    if (!r.ok) { setError('Verwijderen mislukt.'); return; }
    await load();
  }

  if (!authenticated) return <main className="shell success adminLogin"><div className="successIcon"><LockKeyhole size={30}/></div><p className="eyebrow">Administrator</p><h1>Beschikbaarheid beheren</h1><p className="lead">Alleen voor Stuart. Vul je administratorwachtwoord in.</p><form onSubmit={login} className="adminLoginForm"><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Administratorwachtwoord" required/><button className="secondary" type="submit">Inloggen</button></form>{error&&<div className="errorBox">{error}</div>}</main>;

  return <main className="shell"><header className="topbar"><div className="brandMark"><span>CARE4</span><b>GROUP</b></div><div className="recruiter"><span>Administrator</span><strong>Beschikbaarheid</strong></div></header><section className="hero"><div className="heroCopy"><p className="eyebrow">Beheer</p><h1>Blokkeer dagen of dagdelen.</h1><p className="lead">Gebruik dit bijvoorbeeld voor vakantie, afspraken of momenten waarop kandidaten geen voorkeur mogen insturen.</p></div><div className="heroPanel"><CalendarOff size={28}/><strong>Nieuwe blokkade</strong><small>Een hele dag of alleen de ochtend/middag blokkeren.</small></div></section><section className="card"><div className="sectionTitle"><span>01</span><div><h2>Beschikbaarheid blokkeren</h2><p>Geblokkeerde opties verdwijnen direct uit het kandidaatformulier.</p></div></div><form onSubmit={addBlock}><div className="grid two"><label><span>Datum</span><input type="date" required value={date} onChange={e=>setDate(e.target.value)}/></label><label><span>Blokkade</span><select value={period} onChange={e=>setPeriod(e.target.value)}><option value="all">Hele dag</option><option value="09:00–12:00">09:00 – 12:00</option><option value="13:00–16:00">13:00 – 16:00</option></select></label></div><button className="secondary" type="submit">Blokkade toevoegen</button></form>{error&&<div className="errorBox">{error}</div>}</section><section className="card"><div className="sectionTitle"><span>02</span><div><h2>Huidige blokkades</h2><p>Verwijder een blokkade zodra je weer beschikbaar bent.</p></div></div><div className="adminList">{blocked.length===0?<p className="weekdayHint">Er zijn nog geen blokkades ingesteld.</p>:blocked.map((item,i)=><div className="adminRow" key={`${item.date}-${item.period}-${i}`}><div><strong>{new Intl.DateTimeFormat('nl-NL',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${item.date}T12:00:00`))}</strong><span>{item.period==='all'?'Hele dag':item.period}</span></div><button type="button" onClick={()=>removeBlock(item)} aria-label="Verwijder blokkade"><Trash2 size={17}/></button></div>)}</div></section><footer><a href="/">Terug naar afspraakpagina</a></footer></main>;
}
