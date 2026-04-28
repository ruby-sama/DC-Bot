export const parseGermanDate = (input: string): Date | null => {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(input.trim());
  if (!match) return null;

  const [, dd, mm, yyyy] = match;
  const date = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
  if (
    date.getUTCFullYear() !== Number(yyyy) ||
    date.getUTCMonth() !== Number(mm) - 1 ||
    date.getUTCDate() !== Number(dd)
  ) {
    return null;
  }
  return date;
};

export const calculateAge = (birthday?: Date | null): number | null => {
  if (!birthday) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - birthday.getUTCFullYear();
  const m = now.getUTCMonth() - birthday.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < birthday.getUTCDate())) {
    age--;
  }
  return age;
};
