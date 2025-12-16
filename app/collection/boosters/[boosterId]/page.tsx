import {ChevronLeftIcon, RefreshCcw, Trash} from "lucide-react";
import Link from "next/link";
import {langToFlag} from "@/lib/langs";
import {Button} from "@/components/ui/button";
import CardCard from "@/app/collection/boosters/[boosterId]/CardCard";
import AddCardBar from "@/app/collection/boosters/[boosterId]/AddCardBar";
import {getBooster} from "@/lib/data/boosters";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {DuplicateBoosterButton} from "@/app/collection/boosters/[boosterId]/components";

export default async function BoosterDetailsPage({params}: { params: Promise<{ boosterId: string }> }) {
  const {boosterId} = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const booster = await getBooster(boosterId);

  if (!session || !booster || booster.userId !== session.user.id) {
    return <div>Booster not found</div>;
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

          <div className="space-x-4 items-center">
            <Button>
              <RefreshCcw className="size-4"/>
              Refresh prices
            </Button>
            <Button>
              <Trash className="size-4"/>
              Delete booster
            </Button>
            <DuplicateBoosterButton
              booster={{gameId: booster.gameId, lang: booster.lang, type: booster.type, setCode: booster.setCode}}/>
          </div>
        </div>

        <div className="py-8">
          <AddCardBar
            boosterId={booster.id}
            setCode={booster.setCode}
            lang={booster.lang ?? 'en'}
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