'use server';

import { REST } from "@discordjs/rest";
import { Routes } from 'discord-api-types/v10';
import { SlashCommandBuilder } from '@discordjs/builders';
import { requireAdmin } from "@/lib/auth-utils";

export async function registerDiscordCommands() {
    await requireAdmin();

    console.log('Updating commands...');
    const commands = [
        new SlashCommandBuilder()
            .setName('ask')
            .setNameLocalization('fr', 'demander')
            .setDescription('Ask a question to the bot')
            .setDescriptionLocalization('fr', 'Poser une question au bot')
            .addStringOption(option =>
                option.setName('message')
                    .setNameLocalization('fr', 'message')
                    .setDescription('Your message to the bot')
                    .setDescriptionLocalization('fr', 'Votre message au bot')
                    .setRequired(true)
            )
            .toJSON()
    ];

    const rest = new REST().setToken(process.env.DISCORD_TOKEN ?? '');

    await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID ?? ''),
        { body: commands }
    );

    console.log('Commands updated.');
}