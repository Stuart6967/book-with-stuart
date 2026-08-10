'use client';

import { FormEvent, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Mail, Phone, UserRound } from 'lucide-react';
import './styles.css';

type Preference = { date: string; time: string };

const emptyPreference = (): Preference => ({ date: '', time: '' });

export default function Home() {
  const [sent, setSent] = useState(false);
  const [preferences, setPreferences] = useState<Preference[]>([emptyPreference(), emptyPreference(), emptyPreference()]);

  function updatePreference(index: number, field: keyof Preference, value: string) {
    setPreferences(current => current.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (sent) {
    return <main className="shell success"><div className="successIcon"><CheckCircle2 size={34}/></div><p className="eyebrow">Afspraakverzoek ontvangen</p><h1>Bedankt! Ik neem je voorkeuren door.</h1><p className="lead">Je afspraak staat nog niet definitief gepland. Ik controleer je voorkeursmomenten en neem contact met je op om het definitieve tijdstip te bevestigen.</p><button className="secondary" onClick={() => setSent(false)}>Nog een verzoek indienen</button></main>;
  }

  return (
    <main className="shell">
      <section className="intro">
        <div className="avatar">SG</div>
        <div><p className="eyebrow">Plan een gesprek</p><h1>Wanneer komt het jou goed uit?</h1><p className="lead">Geef hieronder drie momenten door waarop je beschikbaar bent. Ik bekijk je voorkeuren en bevestig daarna persoonlijk het definitieve tijdstip.</p></div>
      </section>

      <div className="notice"><CalendarDays size={20}/><div><strong>Dit is een afspraakverzoek</strong><span>Je gekozen momenten zijn voorkeuren en worden niet direct in mijn agenda gezet.</span></div></div>

      <form onSubmit={submit}>
        <section className="card">
          <div className="sectionTitle"><span>1</span><div><h2>Jouw gegevens</h2><p>Zodat ik weet met wie ik de afspraak maak.</p></div></div>
          <div className="grid two">
            <label><span><UserRound size={16}/> Voornaam</span><input required name="firstName" placeholder="Voornaam"/></label>
            <label><span><UserRound size={16}/> Achternaam</span><input required name="lastName" placeholder="Achternaam"/></label>
            <label><span><Mail size={16}/> E-mailadres</span><input required type="email" name="email" placeholder="naam@email.nl"/></label>
            <label><span><Phone size={16}/> Telefoonnummer</span><input required type="tel" name="phone" placeholder="06 12345678"/></label>
          </div>
        </section>

        <section className="card">
          <div className="sectionTitle"><span>2</span><div><h2>Waar gaat het gesprek over?</h2><p>Een korte omschrijving is voldoende.</p></div></div>
          <label><span>Onderwerp</span><select required defaultValue=""><option value="" disabled>Kies een onderwerp</option><option>Kennismaking</option><option>Vacature of opdracht bespreken</option><option>Vervolgafspraak</option><option>Anders</option></select></label>
          <label><span>Korte toelichting <em>optioneel</em></span><textarea name="notes" rows={4} placeholder="Vertel kort waar je het over wilt hebben..."/></label>
        </section>

        <section className="card">
          <div className="sectionTitle"><span>3</span><div><h2>Kies drie voorkeursmomenten</h2><p>Hoe meer spreiding, hoe makkelijker we snel een passend moment vinden.</p></div></div>
          <div className="preferences">
            {preferences.map((pref, index) => <div className="preference" key={index}><div className="rank">{index + 1}<small>{index === 0 ? 'Eerste voorkeur' : index === 1 ? 'Tweede voorkeur' : 'Derde voorkeur'}</small></div><label><span><CalendarDays size={16}/> Datum</span><input required type="date" value={pref.date} onChange={e => updatePreference(index, 'date', e.target.value)}/></label><label><span><Clock3 size={16}/> Tijd</span><input required type="time" value={pref.time} onChange={e => updatePreference(index, 'time', e.target.value)}/></label></div>)}
          </div>
        </section>

        <section className="submitCard"><div><strong>Alles ingevuld?</strong><p>Na verzenden ontvang ik je drie voorkeuren. Er wordt nog niets definitief ingepland.</p></div><button type="submit">Afspraakverzoek versturen</button></section>
      </form>
      <footer>Persoonlijke afspraakpagina · Je gegevens worden alleen gebruikt om contact over deze afspraak op te nemen.</footer>
    </main>
  );
}
