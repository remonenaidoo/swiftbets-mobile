const labels: Record<string, string> = {
  matchResult: 'Match result',
  totalGoalsOverUnder25: 'Total goals 2.5',
};

export function marketLabel(type: string): string {
  return labels[type] ?? type.replace(/([a-z])([A-Z])/g, '$1 $2');
}
