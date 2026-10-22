import type { ReactNode } from "react";
import { GlobalCompareBar } from "../components/workbench/GlobalCompareBar";
import { WorkbenchHeader } from "../components/workbench/WorkbenchHeader";
import { WorkbenchNav } from "../components/workbench/WorkbenchNav";

export function WorkbenchLayout({ children }: { children: ReactNode }) {
  return (
    <div className="workbench">
      <WorkbenchHeader />
      <GlobalCompareBar />
      <div className="workbench-body">
        <WorkbenchNav />
        <main className="workbench-main">{children}</main>
      </div>
    </div>
  );
}
