import type { BotContext } from '../types.js';
import { runBirthdayCheck, startBirthdayScheduler } from './birthdayJob.js';

export const startSchedulers = async (ctx: BotContext) => {
  startBirthdayScheduler(ctx);
  await runBirthdayCheck(ctx);
};
