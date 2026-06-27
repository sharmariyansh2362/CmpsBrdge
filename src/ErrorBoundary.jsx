import React from 'react';

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, background: '#FEF2F2', minHeight: '100vh', color: '#991B1B', fontFamily: 'monospace' }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>App Crashed</h1>
          <p style={{ marginTop: 10 }}>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ marginTop: 20, background: '#fff', padding: 20, overflow: 'auto', border: '1px solid #FCA5A5' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
