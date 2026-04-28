import { Events } from 'discord.js';
import type { BotContext } from '../types.js';

export const registerGuildMemberAdd = (ctx: BotContext) => {
  ctx.client.on(Events.GuildMemberAdd, async (member) => {
    const decision = await ctx.services.security.evaluateJoin(member);
    if (decision === 'kick') {
      await member.send('Dein Discord-Account ist jünger als zwei Wochen. Bitte joine erneut, sobald dein Account alt genug ist.').catch(() => null);
      await member.kick('Account jünger als 14 Tage').catch(() => null);
      return;
    }

    if (decision === 'auto-verify') {
      const verified = ctx.services.config.server.roles.verifiedRole;
      if (verified) await member.roles.add(verified).catch(() => null);
    }
  });
};
