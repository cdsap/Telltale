export interface DisplayValue {
  text: string;
  title: string;
}

export function formatCanonicalNumber(
  value: number,
  locale?: string,
): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(
    value,
  );
}

export function formatDurationMs(
  milliseconds: number,
  locale?: string,
): DisplayValue {
  const abs = Math.abs(milliseconds);
  const title = `${formatCanonicalNumber(milliseconds, locale)} ms`;
  if (abs >= 60_000) {
    return {
      text: `${formatCanonicalNumber(milliseconds / 60_000, locale)} min`,
      title,
    };
  }
  if (abs >= 1_000) {
    return {
      text: `${formatCanonicalNumber(milliseconds / 1_000, locale)} s`,
      title,
    };
  }
  return { text: `${formatCanonicalNumber(milliseconds, locale)} ms`, title };
}

export function formatSignedMetricValue(
  value: number | null,
  unit: string,
  valueType: string | null,
  locale?: string,
): DisplayValue {
  if (value === null) {
    return { text: "N/A", title: "No value" };
  }
  const formatted = formatMetricValue(value, unit, valueType, locale);
  if (value > 0 && !formatted.text.startsWith("+") && !formatted.text.startsWith("-")) {
    return { text: `+${formatted.text}`, title: `+${formatted.title}` };
  }
  return formatted;
}

export function formatMetricValue(
  value: number | null,
  unit: string,
  valueType: string | null,
  locale?: string,
): DisplayValue {
  if (value === null) {
    return { text: "N/A", title: "No value" };
  }
  if (valueType === "duration" || unit === "ms") {
    return formatDurationMs(value, locale);
  }
  const number = formatCanonicalNumber(value, locale);
  return {
    text: unit ? `${number} ${unit}` : number,
    title: unit ? `${number} ${unit}` : number,
  };
}

export function axisUnitLabel(unit: string, valueType: string | null): string {
  if (valueType === "duration" || unit === "ms") {
    return "seconds";
  }
  return unit || "value";
}

export function toChartNumber(
  value: number,
  unit: string,
  valueType: string | null,
): number {
  if (valueType === "duration" || unit === "ms") {
    return value / 1_000;
  }
  return value;
}
