import {ChevronLeftIcon} from "lucide-react";
import Link from "next/link";
import {langToFlag} from "@/lib/langs";
import {Button} from "@/components/ui/button";
import CardCard from "@/app/collection/boosters/[boosterId]/CardCard";
import {Booster} from "@/lib/types/booster";
import AddCardBar from "@/app/collection/boosters/[boosterId]/AddCardBar";

export default async function BoosterDetailsPage({ params }: { params: Promise<{ boosterId: string }> }) {
  const { boosterId } = await params;

  const booster: Booster = {
    id: boosterId,
    lang: 'fr',
    setCode: 'OGN',
    gameId: '',
    value: '12.34',
    cards: [
      {
        id: 'card1',
        name: 'Annie - Fiery',
        setCode: 'OGS',
        collectorNumber: '1',
        foil: true,
        imageUrl: 'https://tcgplayer-cdn.tcgplayer.com/product/653136_400w.jpg',
      }
    ],
    type: 'PLAY_BOOSTER',
    userId: '',
    archived: false,
    createdAt: new Date().toISOString(),
  };

  if (!booster) {
    return <div>Booster not found</div>;
  }

  async function addCard({ setCode, collectorNumber }: { setCode: string; collectorNumber: string }) {
    'use server';

    if (!booster) {
      throw new Error('Booster not found');
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-row">
        <Link href="./">
          <ChevronLeftIcon className="size-6"/>
        </Link>

        <h1 className="text-xl font-semibold pb-8">{langToFlag[booster.lang] ?? booster.lang} {booster.setCode}</h1>
      </div>

      <p className="text-lg font-semibold">Valeur estimée : {booster.value ?? '-'} €</p>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-row justify-between">

          <h2 className="text-lg font-semibold">{booster.cards.length} Cartes</h2>

          <div className="space-x-4">
            <Button>Refresh prices</Button>
            <Button>Delete booster</Button>
          </div>
        </div>

        <div className="py-8">
          <AddCardBar
            setCode={booster.setCode}
            lang={booster.lang ?? 'en'}
            addCard={addCard}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {booster.cards.map((card) => (
            <CardCard card={card} key={card.id} boosterId={booster.id}/>
          ))}
        </div>
      </div>
    </div>
  );
}