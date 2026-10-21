import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorState } from "../components/EmptyState/EmptyState";

interface Props {
  children: ReactNode;
}

interface State {
  message: string | null;
}

export class ReportErrorBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: Error): State {
    return { message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }

  render() {
    if (this.state.message) {
      return (
        <ErrorState
          title="The report viewer hit an unexpected error"
          detail={this.state.message}
        />
      );
    }
    return this.props.children;
  }
}
