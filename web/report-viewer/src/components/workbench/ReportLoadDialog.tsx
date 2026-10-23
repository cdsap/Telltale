import {
  formatByteSize,
  type ReportLoadProgress,
} from "../../api/loadReport";

const PHASE_COPY: Record<ReportLoadProgress["phase"], string> = {
  download: "Downloading report JSON…",
  parse: "Parsing JSON…",
  validate: "Checking report…",
};

function progressRatio(progress: ReportLoadProgress): number | null {
  const total = progress.totalBytes;
  if (total == null || total <= 0) {
    return null;
  }
  if (progress.loadedBytes <= total) {
    return progress.loadedBytes / total;
  }
  return progress.phase === "download" ? 0.99 : 1;
}

export function ReportLoadDialog({ progress }: { progress: ReportLoadProgress }) {
  const ratio = progressRatio(progress);
  const percent = ratio == null ? null : Math.round(ratio * 100);
  const bytesLabel =
    progress.totalBytes != null && progress.loadedBytes <= progress.totalBytes
      ? `${formatByteSize(progress.loadedBytes)} of ${formatByteSize(progress.totalBytes)}`
      : formatByteSize(progress.loadedBytes);
  return (
    <div className="load-dialog-root">
      <div
        className="load-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="load-dialog-title"
        aria-describedby="load-dialog-status"
      >
        <h1 id="load-dialog-title">Loading experiment report</h1>
        <p id="load-dialog-status" className="load-dialog-status">
          {PHASE_COPY[progress.phase]}
        </p>
        <div
          className="load-progress"
          role="progressbar"
          aria-label="Report download"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent ?? undefined}
        >
          <div
            className={
              percent == null ? "load-progress-bar is-indeterminate" : "load-progress-bar"
            }
            style={percent == null ? undefined : { width: `${percent}%` }}
          />
        </div>
        <p className="load-progress-bytes">{bytesLabel}</p>
      </div>
    </div>
  );
}
