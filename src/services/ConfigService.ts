import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

const serverSchema = z.object({
  guildId: z.string().optional().default(''),
  timezone: z.string().default('Europe/Berlin'),
  colors: z.record(z.string()),
  roles: z.object({
    verifiedRole: z.string(),
    adminRoles: z.array(z.string()),
    highestRoles: z.array(z.string()),
    regionRoles: z.array(z.string()),
    nsfwRole: z.string(),
    ventingRole: z.string(),
    mentalHealthRole: z.string(),
    ageRoleU18: z.string(),
    ageRole18_24: z.string(),
    ageRole25_30: z.string(),
    ageRole30Plus: z.string(),
    birthdayRole: z.string(),
    levelRoles: z.record(z.string())
  }),
  channels: z.record(z.string())
});

const securitySchema = z.object({
  youngAccountDays: z.number(),
  autoVerifyScoreThreshold: z.number(),
  captcha: z.object({ length: z.number(), expiresInMinutes: z.number() })
});

const levelingSchema = z.any();
const achievementsSchema = z.any();
const rulesSchema = z.any();

export class ConfigService {
  readonly server = this.read('config/server.json', serverSchema);
  readonly security = this.read('config/security.json', securitySchema);
  readonly leveling = this.read('config/leveling.json', levelingSchema);
  readonly achievements = this.read('config/achievements.json', achievementsSchema);
  readonly rules = this.read('config/rules.json', rulesSchema);

  private read<T>(path: string, schema: z.ZodType<T>): T {
    const abs = resolve(process.cwd(), path);
    const raw = readFileSync(abs, 'utf8');
    return schema.parse(JSON.parse(raw));
  }

  getLevelChannelId() {
    return this.server.channels.levelChannel || this.server.channels.spamChannel;
  }

  getAchievementChannelId() {
    return this.server.channels.achievementChannel || this.server.channels.spamChannel;
  }
}
