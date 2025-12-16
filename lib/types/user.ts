export type User = {
  id: string;
  username: string;
  displayName?: string; // Nom d'utilisateur personnalisé (partie avant le #)
  discriminator?: string; // Nombre à 4 chiffres (partie après le #)
  email?: string; // Email (utilisé avec better-auth)
  emailVerified?: boolean; // Si l'email a été vérifié
  image?: string; // Avatar de l'utilisateur
  createdAt?: Date;
  updatedAt?: Date;
}