export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function generateAllNumbers(): number[] {
  return Array.from({ length: 90 }, (_, i) => i + 1);
}

export function getAnnounceText(num: number): string {
  if (num < 10) {
    return `Single number, ${num}`;
  }
  const digits = num.toString().split('');
  if (num % 10 === 0) {
    return `${digits[0]} zero, ${num}`;
  }
  if (num % 11 === 0) {
    return `Two ${digits[0]}s, ${num}`;
  }
  return `${digits[0]} and ${digits[1]}, ${num}`;
}
