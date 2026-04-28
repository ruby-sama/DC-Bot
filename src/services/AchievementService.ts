import { prisma } from '../db/prisma.js';
import { LevelService } from './LevelService.js';

export class AchievementService {
  constructor(private readonly levelService: LevelService) {}

  async unlock(discordId: string, achievementKey: string) {
    const user = await prisma.user.upsert({ where: { discordId }, update: {}, create: { discordId } });
    const achievement = await prisma.achievement.findUnique({ where: { key: achievementKey } });
    if (!achievement) return null;

    const existing = await prisma.userAchievement.findFirst({ where: { userId: user.id, achievementId: achievement.id } });
    if (existing) return null;

    await prisma.userAchievement.create({ data: { userId: user.id, achievementId: achievement.id } });
    await this.levelService.addXp(discordId, achievement.xpReward, 'achievement', { achievementKey });
    return achievement;
  }
}
