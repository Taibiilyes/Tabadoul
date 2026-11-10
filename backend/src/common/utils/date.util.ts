export function differenceInYears(from: Date, to: Date): number {
  let years = from.getFullYear() - to.getFullYear();
  const monthDiff = from.getMonth() - to.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && from.getDate() < to.getDate())) {
    years--;
  }
  return years;
}
