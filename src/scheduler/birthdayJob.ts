import { ChannelType, type Guild } from 'discord.js';
import { CronJob } from 'cron';
import { prisma } from '../db/prisma.js';
import type { BotContext } from '../types.js';

const isBirthdayToday = (today: Date, birthday: Date) => {
  const bm = birthday.getUTCMonth();
  const bd = birthday.getUTCDate();
  if (bm === 1 && bd === 29) {
    const leap = new Date(Date.UTC(today.getUTCFullYear(), 1, 29)).getUTCDate() === 29;
    return leap ? today.getUTCMonth() === 1 && today.getUTCDate() === 29 : today.getUTCMonth() === 2 && today.getUTCDate() === 1;
  }
  return today.getUTCMonth() === bm && today.getUTCDate() === bd;
};

const getTargetGuilds = async (ctx: BotContext): Promise<Guild[]> => {
  const configuredGuildId = ctx.services.config.server.guildId;
  if (configuredGuildId) {
    const guild = await ctx.client.guilds.fetch(configuredGuildId).catch(() => null);
    return guild ? [guild] : [];
  }

  const ids = Array.from(ctx.client.guilds.cache.keys());
  const guilds = await Promise.all(ids.map((id) => ctx.client.guilds.fetch(id).catch(() => null)));
  return guilds.filter((g): g is Guild => Boolean(g));
};

export const runBirthdayCheck = async (ctx: BotContext) => {
  const guilds = await getTargetGuilds(ctx);
  if (!guilds.length) return;

  const birthdayRole = ctx.services.config.server.roles.birthdayRole;
  const users = await prisma.user.findMany({ where: { birthday: { not: null } } });
  const today = new Date();

  for (const guild of guilds) {
    for (const user of users) {
      const birthday = user.birthday;
      if (!birthday) continue;

      const member = await guild.members.fetch(user.discordId).catch(() => null);
      if (!member) continue;

      const todayBirthday = isBirthdayToday(today, birthday);

      if (birthdayRole) {
        if (todayBirthday && !member.roles.cache.has(birthdayRole)) await member.roles.add(birthdayRole).catch(() => null);
        if (!todayBirthday && member.roles.cache.has(birthdayRole)) await member.roles.remove(birthdayRole).catch(() => null);
      }

      if (todayBirthday && user.birthdayPingEnabled && user.lastBirthdayPingYear !== today.getUTCFullYear()) {
        const channelId = ctx.services.config.server.channels.birthdayChannel;
        const channel = channelId ? await guild.channels.fetch(channelId).catch(() => null) : null;
        if (channel && channel.type === ChannelType.GuildText) {
          await channel.send(`🎂 <@${user.discordId}> hat heute Geburtstag.`).catch(() => null);
        }
        await prisma.user.update({ where: { id: user.id }, data: { lastBirthdayPingYear: today.getUTCFullYear() } });
      }
    }
  }
};

export const startBirthdayScheduler = (ctx: BotContext) => {
  new CronJob('0 0 * * *', () => void runBirthdayCheck(ctx), null, true, ctx.services.config.server.timezone);
};
