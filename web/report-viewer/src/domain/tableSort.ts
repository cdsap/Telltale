export type SortDirection = "asc" | "desc";

export function nextSortDirection(
  activeColumn: string,
  nextColumn: string,
  currentDirection: SortDirection,
  defaultDirection: SortDirection = "desc",
): SortDirection {
  if (activeColumn !== nextColumn) {
    return defaultDirection;
  }
  return currentDirection === "asc" ? "desc" : "asc";
}

export function sortDirectionSign(direction: SortDirection): number {
  return direction === "asc" ? 1 : -1;
}

export function compareStrings(left: string, right: string): number {
  return left.localeCompare(right, undefined, { sensitivity: "base" });
}

export function compareNullableNumbers(
  left: number | null | undefined,
  right: number | null | undefined,
): number {
  if (left == null && right == null) {
    return 0;
  }
  if (left == null) {
    return 1;
  }
  if (right == null) {
    return -1;
  }
  return left - right;
}
