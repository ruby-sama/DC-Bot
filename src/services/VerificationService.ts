import { randomInt } from 'node:crypto';
import { prisma } from '../db/prisma.js';
import type { ConfigService } from './ConfigService.js';

export class VerificationService {
  constructor(private readonly config: ConfigService) {}

  async createChallenge(discordId: string) {
    const user = await prisma.user.upsert({ where: { discordId }, update: {}, create: { discordId } });
    const length = this.config.security.captcha.length;
    const code = Array.from({ length }, () => randomInt(0, 10)).join('');
    const expiresAt = new Date(Date.now() + this.config.security.captcha.expiresInMinutes * 60_000);

    return prisma.verificationChallenge.create({ data: { userId: user.id, code, expiresAt } });
  }

  async verify(discordId: string, input: string) {
    const user = await prisma.user.findUnique({ where: { discordId } });
    if (!user) return false;

    const challenge = await prisma.verificationChallenge.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    if (!challenge || challenge.expiresAt < new Date()) return false;
    return challenge.code === input;
  }
}
