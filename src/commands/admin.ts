import { SlashCommandBuilder } from 'discord.js';
import type { CommandHandler } from '../types.js';

export const adminCommand = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Admin-Befehle')
    .addSubcommandGroup((g) =>
      g
        .setName('medal')
        .setDescription('Medaillen')
        .addSubcommand((s) => s.setName('list').setDescription('Listet alle Medaillen'))
        .addSubcommand((s) =>
          s
            .setName('create')
            .setDescription('Erstellt Medaille')
            .addStringOption((o) => o.setName('emoji').setDescription('Emoji').setRequired(true))
            .addStringOption((o) => o.setName('name').setDescription('Name').setRequired(true))
        )
    ),
  execute: (async (interaction, ctx) => {
    const adminRoles = ctx.services.config.server.roles.adminRoles;
    const member = await interaction.guild?.members.fetch(interaction.user.id);

    if (!member || !adminRoles.some((id) => member.roles.cache.has(id))) {
      await interaction.reply({ content: 'Keine Berechtigung.', ephemeral: true });
      return;
    }

    const group = interaction.options.getSubcommandGroup();
    const sub = interaction.options.getSubcommand();

    if (group === 'medal' && sub === 'list') {
      const medals = await ctx.services.medals.list();
      const content = medals.length ? medals.map((m) => `${m.displayId} • ${m.emoji} ${m.name}`).join('\n') : 'Keine Medaillen vorhanden.';
      await interaction.reply({ content, ephemeral: true });
      return;
    }

    if (group === 'medal' && sub === 'create') {
      const emoji = interaction.options.getString('emoji', true);
      const name = interaction.options.getString('name', true);
      const medal = await ctx.services.medals.create(emoji, name);
      await interaction.reply({ content: `Medaille erstellt: ${medal.displayId} (${medal.emoji} ${medal.name})`, ephemeral: true });
      return;
    }

    await interaction.reply({ content: 'Noch nicht implementiert.', ephemeral: true });
  }) satisfies CommandHandler
};
