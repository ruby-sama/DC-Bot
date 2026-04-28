import type { GuildMember } from 'discord.js';
import { prisma } from '../db/prisma.js';
import { calculateAge } from '../utils/date.js';
import type { ConfigService } from './ConfigService.js';

export class BirthdayService {
  constructor(private readonly config: ConfigService) {}

  async toggleBirthdayPing(discordId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { discordId } });
    return prisma.user.update({
      where: { discordId },
      data: { birthdayPingEnabled: !user.birthdayPingEnabled }
    });
  }

  async applyAgeRole(member: GuildMember, birthday: Date) {
    const age = calculateAge(birthday);
    if (age === null) return;

    const roleMap = this.config.server.roles;
    const allAgeRoles = [roleMap.ageRoleU18, roleMap.ageRole18_24, roleMap.ageRole25_30, roleMap.ageRole30Plus].filter(Boolean);
    if (allAgeRoles.length) await member.roles.remove(allAgeRoles).catch(() => null);

    const targetRole = age < 18 ? roleMap.ageRoleU18 : age <= 24 ? roleMap.ageRole18_24 : age <= 30 ? roleMap.ageRole25_30 : roleMap.ageRole30Plus;
    if (targetRole) await member.roles.add(targetRole).catch(() => null);
  }
}
