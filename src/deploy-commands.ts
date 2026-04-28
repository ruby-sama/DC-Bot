import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commands } from './commands/index.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID ?? process.env.CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID ?? process.env.GUILD_ID;

if (!token || !clientId) {
  throw new Error('DISCORD_TOKEN und DISCORD_CLIENT_ID/CLIENT_ID erforderlich');
}

const rest = new REST({ version: '10' }).setToken(token);
const body = commands.map((c) => c.data.toJSON());

const validGuildId = guildId && /^\d{17,20}$/.test(guildId) ? guildId : null;

if (validGuildId) {
  await rest.put(Routes.applicationGuildCommands(clientId, validGuildId), { body });
  console.log(`Guild commands deployed to ${validGuildId}`);
} else {
  await rest.put(Routes.applicationCommands(clientId), { body });
  console.log('Global commands deployed (für alle Server)');
}
