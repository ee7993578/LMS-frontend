import { Component } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }

  static getDerivedStateFromError(error) { return { hasError: true, error }; }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <div className="text-center max-w-sm space-y-4">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
              <AlertTriangle size={24} className="text-red-400"/>
            </div>
            <div>
              <h3 className="font-display font-semibold text-ink-100">Something went wrong</h3>
              <p className="text-xs text-ink-500 mt-1">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex items-center justify-center gap-1.5 mx-auto px-4 py-2 bg-ink-800 hover:bg-ink-700 text-sm text-ink-300 rounded-xl transition-colors">
              <RefreshCw size={13}/> Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
