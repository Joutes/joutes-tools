import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { Resend } from "resend";
import db from "./mongodb";
import {passkey} from "@better-auth/passkey";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    passkey(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Si RESEND_API_KEY vaut "CONSOLE", on log l'OTP en console
        if (process.env.RESEND_API_KEY === "CONSOLE") {
          console.info(`✅ [DEV MODE] OTP pour ${email} (type: ${type}): ${otp}`);
          return;
        }

        // Sinon, on envoie l'email via Resend
        try {
          const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || "onboarding@resend.dev",
            to: email,
            subject: "Votre code de vérification",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Votre code de vérification</h2>
                <p>Utilisez le code suivant pour vous connecter :</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <h1 style="font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
                </div>
                <p>Ce code expirera dans quelques minutes.</p>
                <p style="color: #6b7280; font-size: 14px;">Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email.</p>
              </div>
            `,
          });
          console.info(`✅ Email envoyé avec succès à ${email} (ID: ${result.data?.id})`);
        } catch (error) {
          console.error(`❌ Erreur lors de l'envoi de l'email à ${email}:`, error);
          throw error;
        }
      },
    }),
  ],
});

