import type { ChatInputCommandInteraction, Client, GuildMember, Interaction, User } from 'discord.js';

export type CommandHandler = (interaction: ChatInputCommandInteraction, ctx: BotContext) => Promise<void>;
export type InteractionHandler = (interaction: Interaction, ctx: BotContext) => Promise<void>;

export interface BotContext {
  client: Client;
  services: ServiceContainer;
}

export interface ServiceContainer {
  config: import('./services/ConfigService.js').ConfigService;
  users: import('./services/UserService.js').UserService;
  profile: import('./services/ProfileService.js').ProfileService;
  birthday: import('./services/BirthdayService.js').BirthdayService;
  level: import('./services/LevelService.js').LevelService;
  achievements: import('./services/AchievementService.js').AchievementService;
  security: import('./services/SecurityService.js').SecurityService;
  verification: import('./services/VerificationService.js').VerificationService;
  medals: import('./services/MedalService.js').MedalService;
  rules: import('./services/RulesService.js').RulesService;
}

export interface VerifyScoreInput {
  user: User;
  member: GuildMember;
}
