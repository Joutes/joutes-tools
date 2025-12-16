import { AuthExample } from "@/components/AuthExample";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-950 rounded-lg shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Bienvenue</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connectez-vous pour continuer
          </p>
        </div>
        <AuthExample />
      </div>
    </div>
  );
}
