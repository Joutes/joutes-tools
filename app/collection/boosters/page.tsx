import {getBoosters} from "@/lib/data/boosters";

export default async function BoostersPage() {
  const boosters = await getBoosters({});

  console.log(boosters);
  return <div>Boosters Page</div>;
}