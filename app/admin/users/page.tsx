import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-utils";
import { searchUsersByEmail } from "@/lib/data/users";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserIcon } from "lucide-react";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const userIsAdmin = await isAdmin();
  if (!userIsAdmin) {
    redirect("/");
  }

  const { email } = await searchParams;
  const users = email ? await searchUsersByEmail(email) : [];

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Gestion des utilisateurs</h1>

      <form method="GET" className="flex gap-2 mb-8">
        <Input
          type="email"
          name="email"
          defaultValue={email}
          placeholder="Rechercher par email..."
          className="max-w-md"
          autoComplete="off"
        />
        <Button type="submit">Rechercher</Button>
      </form>

      {email && (
        <>
          {users.length === 0 ? (
            <p className="text-muted-foreground">
              Aucun utilisateur trouvé pour &quot;{email}&quot;.
            </p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="shrink-0 w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{user.username}</div>
                    <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {user.permissions.length} permission(s)
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

