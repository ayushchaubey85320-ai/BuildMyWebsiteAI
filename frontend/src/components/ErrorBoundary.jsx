import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error in preview component:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8 bg-slate-900/90 text-white rounded-2xl border border-rose-500/30 m-4">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-rose-300 mb-2">Canvas Render Protection</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              A temporary issue occurred while rendering this section: {this.state.error?.message || 'Component failed to mount.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Canvas</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
