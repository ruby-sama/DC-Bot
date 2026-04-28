import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type GuildMember } from 'discord.js';
import { prisma } from '../db/prisma.js';
import type { ConfigService } from './ConfigService.js';
import { calculateAge } from '../utils/date.js';
import { buildProgressBar, progressForXp } from '../utils/level.js';
import { babyBlueEmbed } from '../utils/discord.js';

export class ProfileService {
  constructor(private readonly config: ConfigService) {}

  async buildProfile(member: GuildMember, isOwnProfile: boolean) {
    const dbUser = await prisma.user.upsert({ where: { discordId: member.id }, update: {}, create: { discordId: member.id } });
    const medals = await prisma.userMedal.findMany({ where: { userId: dbUser.id }, include: { medal: true } });
    const achievements = await prisma.userAchievement.findMany({ where: { userId: dbUser.id }, include: { achievement: true }, take: 5, orderBy: { unlockedAt: 'desc' } });

    const regions = this.config.server.roles.regionRoles
      .filter((roleId) => member.roles.cache.has(roleId))
      .map((roleId) => member.guild.roles.cache.get(roleId)?.name)
      .filter(Boolean)
      .join(', ') || '—';

    const highest = this.config.server.roles.highestRoles.find((roleId) => member.roles.cache.has(roleId));
    const highestRoleName = highest ? member.guild.roles.cache.get(highest)?.name ?? '—' : '—';

    const progress = progressForXp(dbUser.totalXp);
    const embed = babyBlueEmbed(`${member.displayName} • Profil`, undefined, this.config.server.colors.profile)
      .setThumbnail(member.displayAvatarURL())
      .addFields(
        { name: 'Nickname', value: member.displayName, inline: true },
        { name: 'Username', value: member.user.username, inline: true },
        { name: 'Geburtstag', value: dbUser.birthday ? dbUser.birthday.toISOString().slice(0, 10) : 'Nicht gesetzt', inline: true },
        { name: 'Alter', value: String(calculateAge(dbUser.birthday) ?? '—'), inline: true },
        { name: 'Wohnort', value: regions, inline: true },
        { name: 'Höchste Rolle', value: highestRoleName, inline: true },
        { name: 'Medaillen', value: medals.length ? medals.map((m) => `${m.medal.emoji} ${m.medal.name}`).join('\n') : 'Keine', inline: false },
        { name: 'Achievements', value: achievements.length ? achievements.map((a) => `🏅 ${a.achievement.name}`).join('\n') : 'Keine', inline: false },
        { name: 'Progression', value: `Level ${progress.level} • ${dbUser.totalXp} XP\n${progress.within}/${progress.needed} (${progress.percent}%)\n${buildProgressBar(progress.percent)}`, inline: false }
      );

    const rows = isOwnProfile
      ? [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`profile:birthday:set:${member.id}`).setLabel('Geburtstag setzen').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`profile:birthday:toggle-ping:${member.id}`).setLabel('Birthday-Ping').setStyle(dbUser.birthdayPingEnabled ? ButtonStyle.Success : ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`profile:toggle:nsfw:${member.id}`).setLabel('NSFW').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`profile:toggle:venting:${member.id}`).setLabel('Venting').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`profile:toggle:mental:${member.id}`).setLabel('Mental Health').setStyle(ButtonStyle.Secondary)
          )
        ]
      : [];

    return { embed, rows };
  }
}
