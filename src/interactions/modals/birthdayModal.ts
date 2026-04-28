import type { ModalSubmitInteraction } from 'discord.js';
import { parseGermanDate } from '../../utils/date.js';
import type { BotContext } from '../../types.js';

export const handleBirthdayModal = async (interaction: ModalSubmitInteraction, ctx: BotContext) => {
  const [scope, action, ownerId] = interaction.customId.split(':');
  if (scope !== 'birthday' || action !== 'set' || !ownerId) return;

  if (interaction.user.id !== ownerId) {
    await interaction.reply({ content: 'Nur der Profilinhaber kann den Geburtstag setzen.', ephemeral: true });
    return;
  }

  const value = interaction.fields.getTextInputValue('birthday');
  const parsed = parseGermanDate(value);
  if (!parsed || parsed > new Date()) {
    await interaction.reply({ content: 'Ungültiges Datum. Nutze DD.MM.YYYY und kein Zukunftsdatum.', ephemeral: true });
    return;
  }

  const user = await ctx.services.users.getOrCreate(interaction.user.id);
  if (user.birthdayLocked) {
    await interaction.reply({
      content: `Geburtstag ist gesperrt. Bitte nutze <#${ctx.services.config.server.channels.supportChannel}> und Thread ${ctx.services.config.server.channels.privacyThread}.`,
      ephemeral: true
    });
    return;
  }

  await ctx.services.users.setBirthday(interaction.user.id, parsed);
  const member = await interaction.guild?.members.fetch(interaction.user.id);
  if (member) await ctx.services.birthday.applyAgeRole(member, parsed);

  await interaction.reply({ content: 'Geburtstag gespeichert und gesperrt.', ephemeral: true });
};
