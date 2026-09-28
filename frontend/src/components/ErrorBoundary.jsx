import React from "react";

// Last-resort catcher: a crash in one page must never blank the whole app.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-screen place-items-center bg-void px-4">
          <div className="w-full max-w-md rounded-3xl border border-line bg-panel p-8 text-center">
            <p className="font-display text-xl font-black text-zinc-100">The reel snapped</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Something broke on this screen. Your account and data are fine —
              try reloading.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 h-11 w-full rounded-xl bg-ember text-sm font-bold text-white hover:bg-ember-bright"
            >
              Reload PlayTube
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
