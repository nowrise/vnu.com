import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: { error?: Error; resetError: () => void }) => ReactNode);
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Import dynamically to avoid circular dependency
    import("@/lib/error-monitoring").then(({ captureError }) => {
      captureError(error, {
        componentStack: errorInfo.componentStack,
      });
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      
      if (typeof fallback === "function") {
        return fallback({ error: this.state.error, resetError: this.resetError });
      }
      
      if (fallback) {
        return fallback;
      }

      // Default fallback
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Something went wrong</h2>
            <p className="text-muted-foreground">An unexpected error occurred</p>
            <button
              onClick={this.resetError}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
