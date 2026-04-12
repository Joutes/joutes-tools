import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Settings } from "lucide-react";

const GAMES = [
  { slug: "altered", name: "Altered" },
  { slug: "drakerion", name: "Drakerion" },
  { slug: "riftbound", name: "Riftbound" },
  { slug: "swu", name: "Star Wars Unlimited" },
];

export default async function AdminPage() {
  const userIsAdmin = await isAdmin();
  if (!userIsAdmin) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Administration</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Utilisateurs
        </h2>
        <Button asChild variant="outline">
          <Link href="/admin/users">Gérer les utilisateurs</Link>
        </Button>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Paramètres des jeux
        </h2>
        <div className="flex flex-wrap gap-3">
          {GAMES.map((game) => (
            <Button key={game.slug} asChild variant="outline">
              <Link href={`/admin/settings/games/${game.slug}`}>
                {game.name}
              </Link>
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}

