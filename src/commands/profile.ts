import { SlashCommandBuilder } from 'discord.js';
import type { CommandHandler } from '../types.js';

export const profileCommand = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Zeigt ein Profil an')
    .addUserOption((option) => option.setName('user').setDescription('Optionaler User')),
  execute: (async (interaction, ctx) => {
    const user = interaction.options.getUser('user') ?? interaction.user;
    const member = await interaction.guild?.members.fetch(user.id);
    if (!member) {
      await interaction.reply({ content: 'Mitglied nicht gefunden.', ephemeral: true });
      return;
    }

    const { embed, rows } = await ctx.services.profile.buildProfile(member, user.id === interaction.user.id);
    await interaction.reply({ embeds: [embed], components: rows, ephemeral: true });
  }) satisfies CommandHandler
};
