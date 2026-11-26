import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function defangURL(url: string): string {
  return url.replace(/^http/i, 'hxxp').replace(/\./g, '[.]');
}

export function formatRiskScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return "Inconclusive";
  return `${score.toFixed(1)}%`;
}
