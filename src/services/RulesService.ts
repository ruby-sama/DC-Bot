import { ChannelType, type Client } from 'discord.js';
import { prisma } from '../db/prisma.js';
import type { ConfigService } from './ConfigService.js';
import { babyBlueEmbed } from '../utils/discord.js';

export class RulesService {
  constructor(private readonly config: ConfigService) {}

  async ensureRulesMessage(client: Client) {
    const channelId = this.config.server.channels.rulesChannel;
    if (!channelId) return;

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel || channel.type !== ChannelType.GuildText) return;

    const key = 'rules-message';
    const existing = await prisma.systemMessage.findUnique({ where: { key } });
    if (existing) return;

    const embed = babyBlueEmbed(this.config.rules.title, this.config.rules.description, this.config.server.colors.rules).addFields(
      this.config.rules.rules.map((rule: string, index: number) => ({ name: `Regel ${index + 1}`, value: rule }))
    );

    const message = await channel.send({ embeds: [embed] });
    await prisma.systemMessage.upsert({
      where: { key },
      update: { channelId: channel.id, messageId: message.id },
      create: { key, channelId: channel.id, messageId: message.id }
    });
  }
}
