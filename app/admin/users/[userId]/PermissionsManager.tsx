"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2 } from "lucide-react";
import { addPermissionAction, removePermissionAction } from "@/app/admin/users/action";

const KNOWN_PERMISSIONS = [
  "deck_checker:ai",
  "collection:write",
  "erratas:write",
];

interface PermissionsManagerProps {
  userId: string;
  initialPermissions: string[];
}

export function PermissionsManager({ userId, initialPermissions }: PermissionsManagerProps) {
  const [permissions, setPermissions] = useState<string[]>(initialPermissions);
  const [newPermission, setNewPermission] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAdd = (permission: string) => {
    const trimmed = permission.trim();
    if (!trimmed || permissions.includes(trimmed)) {
      setNewPermission("");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await addPermissionAction(userId, trimmed);
        setPermissions((prev) => [...prev, trimmed]);
        setNewPermission("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur lors de l'ajout");
      }
    });
  };

  const handleRemove = (permission: string) => {
    setError(null);
    startTransition(async () => {
      try {
        await removePermissionAction(userId, permission);
        setPermissions((prev) => prev.filter((p) => p !== permission));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur lors de la suppression");
      }
    });
  };

  const suggestedPermissions = KNOWN_PERMISSIONS.filter((p) => !permissions.includes(p));

  return (
    <div className="space-y-4">
      {/* Liste des permissions actuelles */}
      <div>
        <p className="text-sm font-medium mb-2">Permissions actuelles</p>
        {permissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune permission accordée.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {permissions.map((perm) => (
              <Badge key={perm} variant="secondary" className="flex items-center gap-1 pr-1">
                <span>{perm}</span>
                <button
                  onClick={() => handleRemove(perm)}
                  disabled={isPending}
                  className="ml-1 rounded-full hover:bg-destructive/20 p-0.5 transition-colors disabled:opacity-50"
                  aria-label={`Supprimer la permission ${perm}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions de permissions connues */}
      {suggestedPermissions.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPermissions.map((perm) => (
              <button
                key={perm}
                onClick={() => handleAdd(perm)}
                disabled={isPending}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-dashed border-muted-foreground/50 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                {perm}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ajout manuel */}
      <div>
        <p className="text-sm font-medium mb-2">Ajouter une permission</p>
        <div className="flex gap-2 max-w-md">
          <Input
            value={newPermission}
            onChange={(e) => setNewPermission(e.target.value)}
            placeholder="ex: deck_checker:ai"
            disabled={isPending}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd(newPermission);
              }
            }}
          />
          <Button
            onClick={() => handleAdd(newPermission)}
            disabled={isPending || !newPermission.trim()}
            size="default"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Ajouter
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

