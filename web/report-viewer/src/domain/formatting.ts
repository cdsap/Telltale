import type { Comparison, ComparisonTone } from "./types";

export function formatPercent(
  value: number | null,
  locale?: string,
): string {
  if (value === null || !Number.isFinite(value)) {
    return "N/A";
  }
  const rounded = Number(value.toFixed(2));
  if (value !== 0 && rounded === 0) {
    return `${value < 0 ? "−" : "+"}<0.01%`;
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
  if (comparison.deltaPercent === null && comparison.deltaAbsolute === null) {
    return "N/A";
  }
  if (comparison.deltaPercent === null) {
    return "N/A";
  }
  return formatPercent(comparison.deltaPercent, locale);
}

export function formatSignedNumber(
  value: number,
  locale?: string,
): string {
  return new Intl.NumberFormat(locale, {
    signDisplay: "exceptZero",
    maximumFractionDigits: 3,
  }).format(value);
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
