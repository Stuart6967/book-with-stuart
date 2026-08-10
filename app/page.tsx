'use client';

import { FormEvent, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, GraduationCap, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import './styles.css';

type Preference = { date: string; period: string };
const emptyPreference = (): Preference => ({ date: '', period: '' });

function isWeekday(dateString: string) {
  if (!dateString) return true;
  const day = new Date(`${dateString}T12:00:00`).getDay();
  return day >= 1 && day <= 5;
}

export default function Home() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState<Preference[]>([emptyPreference(), emptyPreference(), emptyPreference()]);

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  function updatePreference(index: number, field: keyof Preference, value: string) {
    if (field === 'date' && value && !isWeekday(value)) {
      setError('Kies een datum van maandag t/m vrijdag.');
      return;
    }
    setError('');
    setPreferences(current => current.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError('');
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      firstName: data.get('firstName'),
      lastName: data.get('lastName'),
      email: data.get('email'),
      phone: data.get('phone'),
      education: data.get('education'),
      subject: data.get('subject'),
      notes: data.get('notes'),
      preferences,
    };

    try {
      const response = await fetch('/api/request-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Verzenden mislukt');
      setSent(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Het afspraakverzoek kon niet worden verzonden. Probeer het opnieuw of neem rechtstreeks contact op.');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <main className="shell success">
        <div className="successIcon"><CheckCircle2 size={34}/></div>
        <p className="eyebrow">Verzoek succesvol verstuurd</p>
        <h1>Bedankt! Ik neem je voorkeuren door.</h1>
        <p className="lead">Je afspraak is nog niet definitief. Ik bekijk je voorkeursmomenten en neem contact met je op om samen het definitieve tijdstip vast te leggen.</p>
        <button className="secondary" onClick={() => setSent(false)}>Nog een verzoek indienen</button>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brandMark"><span>care4</span><b>group</b></div>
        <div className="recruiter"><span>Afspraak met</span><strong>Stuart Green</strong></div>
      </header>

      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">Persoonlijk kennismaken</p>
          <h1>Plan jouw voorkeursmoment voor een gesprek.</h1>
          <p className="lead">Geef drie momenten door waarop je kunt. Je plant nog niets definitief in: ik ontvang jouw voorkeuren en neem daarna persoonlijk contact met je op.</p>
          <div className="trustRow"><span><Clock3 size={16}/> ± 2 minuten</span><span><ShieldCheck size={16}/> Persoonlijk behandeld</span></div>
        </div>
        <div className="heroPanel">
          <span className="miniLabel">Beschikbare dagdelen</span>
          <strong>Maandag t/m vrijdag</strong>
          <div className="periodPill">09:00 — 12:00</div>
          <div className="periodPill">13:00 — 16:00</div>
          <small>Je geeft voorkeuren door. Ik bevestig het definitieve tijdstip later persoonlijk.</small>
        </div>
      </section>

      <form onSubmit={submit}>
        <section className="card">
          <div className="sectionTitle"><span>01</span><div><h2>Wie ben je?</h2><p>Een paar gegevens zodat ik weet met wie ik contact opneem.</p></div></div>
          <div className="grid two">
            <label><span><UserRound size={16}/> Voornaam</span><input required name="firstName" placeholder="Voornaam"/></label>
            <label><span><UserRound size={16}/> Achternaam</span><input required name="lastName" placeholder="Achternaam"/></label>
            <label><span><Mail size={16}/> E-mailadres</span><input required type="email" name="email" placeholder="naam@email.nl"/></label>
            <label><span><Phone size={16}/> Telefoonnummer</span><input required type="tel" name="phone" placeholder="06 12345678"/></label>
          </div>
          <label><span><GraduationCap size={16}/> Welke opleiding heb je afgerond?</span><input required name="education" placeholder="Bijv. Verzorgende IG, MBO-V, HBO-V, Social Work..."/></label>
        </section>

        <section className="card">
          <div className="sectionTitle"><span>02</span><div><h2>Waar wil je het over hebben?</h2><p>Zo kan ik me alvast goed voorbereiden.</p></div></div>
          <label><span>Onderwerp</span><select required name="subject" defaultValue=""><option value="" disabled>Kies een onderwerp</option><option>Kennismaking</option><option>Vacature of opdracht bespreken</option><option>Inschrijving bij Care4 Group</option><option>Vervolgafspraak</option><option>Anders</option></select></label>
          <label><span>Korte toelichting <em>optioneel</em></span><textarea name="notes" rows={4} placeholder="Vertel kort wat je wilt bespreken..."/></label>
        </section>

        <section className="card">
          <div className="sectionTitle"><span>03</span><div><h2>Kies drie voorkeursmomenten</h2><p>Kies per voorkeur een werkdag en een dagdeel.</p></div></div>
          <div className="preferences">
            {preferences.map((pref, index) => (
              <div className="preference" key={index}>
                <div className="rank"><b>{index + 1}</b><small>{index === 0 ? 'Eerste voorkeur' : index === 1 ? 'Tweede voorkeur' : 'Derde voorkeur'}</small></div>
                <label><span><CalendarDays size={16}/> Datum</span><input required type="date" min={minDate} value={pref.date} onChange={e => updatePreference(index, 'date', e.target.value)}/></label>
                <label><span><Clock3 size={16}/> Dagdeel</span><select required value={pref.period} onChange={e => updatePreference(index, 'period', e.target.value)}><option value="" disabled>Kies een tijdvak</option><option value="09:00–12:00">09:00 – 12:00</option><option value="13:00–16:00">13:00 – 16:00</option></select></label>
              </div>
            ))}
          </div>
          <p className="weekdayHint">Beschikbaar van maandag t/m vrijdag. Weekenddagen kunnen niet worden gekozen.</p>
        </section>

        {error && <div className="errorBox">{error}</div>}

        <section className="submitCard">
          <div><strong>Klaar om je voorkeuren te versturen?</strong><p>Het verzoek wordt rechtstreeks naar Stuart gestuurd. Er wordt nog niets definitief ingepland.</p></div>
          <button type="submit" disabled={sending}>{sending ? 'Versturen...' : 'Afspraakverzoek versturen'}</button>
        </section>
      </form>

      <footer><strong>Samen zorg beter maken.</strong><span>Je gegevens worden uitsluitend gebruikt om contact op te nemen over jouw afspraakverzoek.</span></footer>
    </main>
  );
}
