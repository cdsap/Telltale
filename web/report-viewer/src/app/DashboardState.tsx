import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ExperimentResult, StatisticName, Variant } from "../domain/types";
import {
  parseHash,
  selectedVariants,
  serializeHash,
  type DashboardSelection,
} from "../domain/selections";

interface DashboardContextValue {
  report: ExperimentResult;
  selection: DashboardSelection;
  baseline: Variant;
  candidate: Variant;
  jsonUrl: string | null;
  legacyCsvUrl: string | null;
  legacyHtmlUrl: string | null;
  update: (patch: Partial<DashboardSelection>) => void;
  reset: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

interface DashboardProviderProps {
  report: ExperimentResult;
  jsonUrl: string | null;
  legacyCsvUrl?: string | null;
  legacyHtmlUrl?: string | null;
  children: ReactNode;
}

export function DashboardProvider({
  report,
  jsonUrl,
  legacyCsvUrl,
  legacyHtmlUrl,
  children,
}: DashboardProviderProps) {
  const [selection, setSelection] = useState<DashboardSelection>(() =>
    parseHash(typeof window === "undefined" ? "" : window.location.hash, report),
  );

  useEffect(() => {
    const apply = () => setSelection(parseHash(window.location.hash, report));
    window.addEventListener("hashchange", apply);
    window.addEventListener("popstate", apply);
    if (!window.location.hash) {
      try {
        window.history.replaceState(null, "", serializeHash(parseHash("", report), report));
      } catch {
        window.location.hash = serializeHash(parseHash("", report), report).slice(1);
      }
    }
    return () => {
      window.removeEventListener("hashchange", apply);
      window.removeEventListener("popstate", apply);
    };
  }, [report]);

  const update = useCallback(
    (patch: Partial<DashboardSelection>) => {
      setSelection((current) => {
        const next = { ...current, ...patch };
        if (next.baselineId === next.candidateId && report.variants.length > 1) {
          return current;
        }
        const hash = serializeHash(next, report);
        if (window.location.hash !== hash) {
          try {
            window.history.pushState(null, "", hash);
          } catch {
            window.location.hash = hash.slice(1);
          }
        }
        return next;
      });
    },
    [report],
  );

  const reset = useCallback(() => {
    update(parseHash("", report));
  }, [report, update]);

  const pair = selectedVariants(report, selection);
  const value = useMemo(() => {
    if (!pair) {
      return null;
    }
    return {
      report,
      selection,
      baseline: pair.baseline,
      candidate: pair.candidate,
      jsonUrl,
      legacyCsvUrl: legacyCsvUrl ?? null,
      legacyHtmlUrl: legacyHtmlUrl ?? null,
      update,
      reset,
    };
  }, [jsonUrl, legacyCsvUrl, legacyHtmlUrl, pair, report, reset, selection, update]);

  if (!value) {
    return null;
  }
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardContextValue {
  const value = useContext(DashboardContext);
  if (!value) {
    throw new Error("useDashboard must be used inside DashboardProvider");
  }
  return value;
}

export function useStatistic(): StatisticName {
  return useDashboard().selection.statistic;
}
