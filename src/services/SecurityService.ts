import type { GuildMember } from 'discord.js';
import { prisma } from '../db/prisma.js';
import type { ConfigService } from './ConfigService.js';

export class SecurityService {
  constructor(private readonly config: ConfigService) {}

  async isYoungAccountBypassed() {
    const bypass = await prisma.securityBypass.findFirst({
      where: { type: 'young-accounts', expiresAt: { gt: new Date() } }
    });
    return Boolean(bypass);
  }

  scoreMember(member: GuildMember) {
    const ageDays = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
    let score = 0;
    if (ageDays >= 30) score += 2;
    if (ageDays >= 90) score += 2;
    if (member.user.avatar) score += 1;
    if (member.displayName?.trim()) score += 1;
    if (/\d{4,}$/.test(member.user.username)) score -= 1;
    if (!member.user.avatar) score -= 1;
    if (!member.displayName?.trim()) score -= 1;
    return score;
  }

  async evaluateJoin(member: GuildMember) {
    const ageDays = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
    if (ageDays < this.config.security.youngAccountDays && !(await this.isYoungAccountBypassed())) return 'kick';
    return this.scoreMember(member) >= this.config.security.autoVerifyScoreThreshold ? 'auto-verify' : 'manual';
  }
}
