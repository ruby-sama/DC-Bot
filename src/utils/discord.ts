import { EmbedBuilder } from 'discord.js';

export const safeHex = (hex: string): number => Number.parseInt(hex.replace('#', ''), 16);

export const babyBlueEmbed = (title: string, description?: string, colorHex = '#89CFF0') =>
  new EmbedBuilder().setColor(safeHex(colorHex)).setTitle(title).setDescription(description ?? null);
