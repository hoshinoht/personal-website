import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '10vh 24px', maxWidth: 680, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif', color: '#F3F5FC' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5em', color: '#C4A2D4' }}>Something went wrong</h1>
          <p style={{ color: '#B2B6C1', lineHeight: 1.7 }}>
            An unexpected error occurred. Try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5em', padding: '10px 24px',
              background: '#C4A2D4', color: '#1E1E2E', border: 'none',
              borderRadius: 20, cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
