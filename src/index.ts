import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { ConfigService } from './services/ConfigService.js';
import { UserService } from './services/UserService.js';
import { ProfileService } from './services/ProfileService.js';
import { BirthdayService } from './services/BirthdayService.js';
import { LevelService } from './services/LevelService.js';
import { AchievementService } from './services/AchievementService.js';
import { SecurityService } from './services/SecurityService.js';
import { VerificationService } from './services/VerificationService.js';
import { MedalService } from './services/MedalService.js';
import { RulesService } from './services/RulesService.js';
import type { BotContext } from './types.js';
import { registerInteractionCreate } from './events/interactionCreate.js';
import { registerGuildMemberAdd } from './events/guildMemberAdd.js';
import { startSchedulers } from './scheduler/index.js';

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error('DISCORD_TOKEN fehlt');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

const config = new ConfigService();
const level = new LevelService();

const services = {
  config,
  users: new UserService(),
  profile: new ProfileService(config),
  birthday: new BirthdayService(config),
  level,
  achievements: new AchievementService(level),
  security: new SecurityService(config),
  verification: new VerificationService(config),
  medals: new MedalService(),
  rules: new RulesService(config)
};

const ctx: BotContext = { client, services };

registerInteractionCreate(ctx);
registerGuildMemberAdd(ctx);

client.once('ready', async () => {
  console.log(`Bot online: ${client.user?.tag}`);
  await services.rules.ensureRulesMessage(client);
  await startSchedulers(ctx);
});

await client.login(token);
