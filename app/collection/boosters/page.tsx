import {getBoosters} from "@/lib/data/boosters";

export default async function BoostersPage() {
  const boosters = await getBoosters({
    gameId: '6668cd15056765e4d0fcf113',
  });

  console.log(boosters);
  return <div>Boosters Page</div>;
}