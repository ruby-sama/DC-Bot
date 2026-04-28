import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, type ButtonInteraction } from 'discord.js';
import { prisma } from '../../db/prisma.js';
import type { BotContext } from '../../types.js';

const ownerOnly = async (interaction: ButtonInteraction, ownerId: string) => {
  if (interaction.user.id !== ownerId) {
    await interaction.reply({ content: 'Nur der Profilinhaber kann diese Buttons nutzen.', ephemeral: true });
    return false;
  }
  return true;
};

export const handleProfileButton = async (interaction: ButtonInteraction, ctx: BotContext) => {
  const [scope, category, action, ownerId] = interaction.customId.split(':');
  if (scope !== 'profile' || !ownerId) return;
  if (!(await ownerOnly(interaction, ownerId))) return;

  if (category === 'birthday' && action === 'set') {
    const modal = new ModalBuilder().setCustomId(`birthday:set:${ownerId}`).setTitle('Geburtstag setzen');
    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder().setCustomId('birthday').setLabel('DD.MM.YYYY').setStyle(TextInputStyle.Short).setRequired(true)
      )
    );
    await interaction.showModal(modal);
    return;
  }

  if (category === 'birthday' && action === 'toggle-ping') {
    const changed = await ctx.services.birthday.toggleBirthdayPing(interaction.user.id);
    await interaction.reply({ content: `Birthday-Ping ist jetzt ${changed.birthdayPingEnabled ? 'aktiv' : 'deaktiviert'}.`, ephemeral: true });
    return;
  }

  if (category === 'toggle') {
    const key = action === 'nsfw' ? ctx.services.config.server.roles.nsfwRole : action === 'venting' ? ctx.services.config.server.roles.ventingRole : ctx.services.config.server.roles.mentalHealthRole;
    const member = await interaction.guild?.members.fetch(interaction.user.id);
    if (!member || !key) return;

    if (member.roles.cache.has(key)) await member.roles.remove(key).catch(() => null);
    else await member.roles.add(key).catch(() => null);

    await interaction.reply({ content: `Rolle ${member.roles.cache.has(key) ? 'aktiviert' : 'deaktiviert'}.`, ephemeral: true });
    return;
  }

  await interaction.reply({ content: 'Unbekannter Button.', ephemeral: true });
};
