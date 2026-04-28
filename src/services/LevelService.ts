import { prisma } from '../db/prisma.js';
import { levelFromXp } from '../utils/level.js';

export class LevelService {
  async addXp(discordId: string, amount: number, source: string, metadata?: object) {
    const user = await prisma.user.upsert({ where: { discordId }, update: {}, create: { discordId } });
    const totalXp = user.totalXp + amount;
    const newLevel = levelFromXp(totalXp);

    await prisma.$transaction([
      prisma.user.update({ where: { discordId }, data: { totalXp, visibleLevel: Math.min(newLevel, 100) } }),
      prisma.xpEvent.create({ data: { userId: user.id, source, amount, metadata } }),
      ...(newLevel > user.visibleLevel ? [prisma.levelEvent.create({ data: { userId: user.id, level: newLevel } })] : [])
    ]);

    return { previousLevel: user.visibleLevel, newLevel, totalXp };
  }
}
