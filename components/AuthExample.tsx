"use client";

import { useState } from "react";
import {emailOtp, useSession, signOut, authClient} from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Exemple de composant d'authentification avec emailOTP
 * 
 * Flux :
 * 1. L'utilisateur saisit son email
 * 2. On envoie l'OTP (par email ou en console selon RESEND_API_KEY)
 * 3. L'utilisateur saisit l'OTP reçu
 * 4. On vérifie l'OTP et connecte l'utilisateur
 */
export function AuthExample() {
  const { data: session, isPending } = useSession();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      setStep("otp");
    } catch (err) {
      setError("Erreur lors de l'envoi de l'OTP");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authClient.signIn.emailOtp({
        email,
        otp,
      });
      // L'utilisateur est maintenant connecté
      setStep("email");
      setEmail("");
      setOtp("");
    } catch (err) {
      setError("Code OTP invalide ou expiré");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return <div>Chargement...</div>;
  }

  if (session) {
    return (
      <div className="space-y-4">
        <p>Connecté en tant que : {session.user.email}</p>
        <Button
          onClick={async () => {
            await signOut();
          }}
        >
          Se déconnecter
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-md">
      {step === "email" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <h2 className="text-2xl font-bold">Connexion</h2>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Envoi..." : "Envoyer le code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <h2 className="text-2xl font-bold">Vérification</h2>
          <p className="text-sm text-gray-600">
            Un code a été envoyé à {email}
            {process.env.NEXT_PUBLIC_RESEND_MODE === "CONSOLE" && 
              " (vérifiez la console du serveur)"}
          </p>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium mb-2">
              Code de vérification
            </label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              required
              disabled={loading}
              maxLength={6}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError("");
              }}
              disabled={loading}
            >
              Retour
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Vérification..." : "Vérifier"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
