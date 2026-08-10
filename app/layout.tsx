import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'Plan een gesprek | Stuart',
  description: 'Geef eenvoudig je voorkeursmomenten door voor een gesprek.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="nl"><body>{children}</body></html>;
}
