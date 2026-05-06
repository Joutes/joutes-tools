import cr from '@/data/riftbound/cr.json';

export const metadata = {
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Comprehensive Rules</h1>
      </div>
    </div>
  )
}