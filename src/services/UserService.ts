import { prisma } from '../db/prisma.js';

export class UserService {
  async getOrCreate(discordId: string) {
    return prisma.user.upsert({
      where: { discordId },
      update: {},
      create: { discordId }
    });
  }

  async setBirthday(discordId: string, birthday: Date) {
    return prisma.user.update({
      where: { discordId },
      data: { birthday, birthdayLocked: true }
    });
  }
}
