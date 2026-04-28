import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const baseAchievements = [
  { key: 'messages_5', category: 'messages', tier: 1, name: '💬 Nachrichten I', description: 'Sende 5 Nachrichten', requiredValue: 5, xpReward: 50 },
  { key: 'messages_10', category: 'messages', tier: 2, name: '💬 Nachrichten II', description: 'Sende 10 Nachrichten', requiredValue: 10, xpReward: 100 },
  { key: 'level_10', category: 'level', tier: 3, name: '⭐ Level 10', description: 'Erreiche Level 10', requiredValue: 10, xpReward: 250 }
];

await prisma.achievement.createMany({ data: baseAchievements, skipDuplicates: true });
console.log(`Seeded ${baseAchievements.length} achievements`);
await prisma.$disconnect();
