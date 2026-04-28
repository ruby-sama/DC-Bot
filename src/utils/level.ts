export const totalXpForLevel = (level: number): number => 35 * level * level;

export const levelFromXp = (xp: number): number => {
  let low = 0;
  let high = 100;

  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (totalXpForLevel(mid) <= xp) low = mid;
    else high = mid - 1;
  }
  return Math.min(low, 100);
};

export const progressForXp = (xp: number) => {
  const level = levelFromXp(xp);
  const currentFloor = totalXpForLevel(level);
  const nextFloor = totalXpForLevel(Math.min(level + 1, 100));
  const within = xp - currentFloor;
  const needed = Math.max(1, nextFloor - currentFloor);
  const percent = Math.min(100, Math.round((within / needed) * 100));
  return { level, currentFloor, nextFloor, within, needed, percent };
};

export const buildProgressBar = (percent: number): string => {
  const size = 10;
  const filled = Math.round((percent / 100) * size);
  return `${'🟦'.repeat(filled)}${'⬜'.repeat(size - filled)}`;
};
