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
        <div style={{ padding: '10vh 24px', maxWidth: 680, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--md-sys-color-on-background)' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5em', color: 'var(--md-sys-color-primary)' }}>Something went wrong</h1>
          <p style={{ color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.7 }}>
            An unexpected error occurred. Try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5em', padding: '10px 24px',
              background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)',
              border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: '0.9rem',
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
