import { prisma } from '../db/prisma.js';

export class MedalService {
  async create(emoji: string, name: string) {
    const count = await prisma.medal.count();
    const displayId = `MEDAL-${String(count + 1).padStart(3, '0')}`;
    return prisma.medal.create({ data: { emoji, name, displayId } });
  }

  async list() {
    return prisma.medal.findMany({ orderBy: { displayId: 'asc' } });
  }
}
