import { redirect, notFound } from "next/navigation";
import { isAdmin } from "@/lib/auth-utils";
import { getUserById } from "@/lib/data/users";
import { PermissionsManager } from "./PermissionsManager";
import { ArrowLeft, UserIcon, MailIcon, CalendarIcon, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const userIsAdmin = await isAdmin();
  if (!userIsAdmin) {
    redirect("/");
  }

  const { userId } = await params;
  const user = await getUserById(userId);

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la recherche
      </Link>

      {/* Profil utilisateur */}
      <div className="border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p className="text-sm text-muted-foreground">ID : {user.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {user.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MailIcon className="w-4 h-4 shrink-0" />
              <span>{user.email}</span>
              {user.emailVerified && (
                <ShieldCheckIcon className="w-4 h-4 text-green-500 shrink-0" aria-label="Email vérifié" />
              )}
            </div>
          )}
          {user.createdAt && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="w-4 h-4 shrink-0" />
              <span>
                Inscrit le{" "}
                {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Gestion des permissions */}
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Permissions</h2>
        <PermissionsManager userId={user.id} initialPermissions={user.permissions} />
      </div>
    </div>
  );
}

