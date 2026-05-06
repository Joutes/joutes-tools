import type { Metadata } from 'next';
import cr from '@/data/riftbound/cr.json';
import CRView from './CRView';

export const metadata: Metadata = {
  title: 'Riftbound Comprehensive Rules',
  description: 'Consult official comprehensive rules for Riftbound TCG.',
  openGraph: {
    title: 'Riftbound Comprehensive Rules',
    description: 'Consult official comprehensive rules for Riftbound TCG.',
  },
};

export default function CRulesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Règles Complètes Riftbound</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {cr.length} entrées · Cliquez sur les liens bleus pour naviguer entre les règles
        </p>
      </div>
      <CRView entries={cr} />
    </div>
  );
}