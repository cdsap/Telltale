import type { Comparison, ComparisonTone } from "./types";

export function formatPercent(
  value: number | null,
  locale?: string,
): string {
  if (value === null || !Number.isFinite(value)) {
    return "N/A";
  }
  const formatted = new Intl.NumberFormat(locale, {
    signDisplay: "exceptZero",
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted}%`;
}

export function formatDelta(
  comparison: Comparison,
  locale?: string,
): string {
  if (comparison.unavailableReason && comparison.deltaPercent === null) {
    return "N/A";
  }
  return formatPercent(comparison.deltaPercent, locale);
}

export function toneLabel(tone: ComparisonTone): string {
  switch (tone) {
    case "better":
      return "faster";
    case "worse":
      return "slower";
    case "unavailable":
      return "unavailable";
    default:
      return "unchanged";
  }
}

export function formatIsoDate(value: string | null, locale?: string): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
