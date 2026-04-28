import { Events } from 'discord.js';
import { commands } from '../commands/index.js';
import type { BotContext } from '../types.js';
import { handleProfileButton } from '../interactions/buttons/profileButtons.js';
import { handleBirthdayModal } from '../interactions/modals/birthdayModal.js';

const commandMap = new Map(commands.map((c) => [c.data.name, c]));

export const registerInteractionCreate = (ctx: BotContext) => {
  ctx.client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = commandMap.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction, ctx);
      return;
    }

    if (interaction.isButton()) {
      await handleProfileButton(interaction, ctx);
      return;
    }

    if (interaction.isModalSubmit()) {
      await handleBirthdayModal(interaction, ctx);
    }
  });
};
