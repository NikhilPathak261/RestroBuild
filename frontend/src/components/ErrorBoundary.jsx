import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="center-page">
          <p className="eyebrow">Something went wrong</p>
          <h1>We could not load this page.</h1>
          <p className="muted">Please refresh and try again.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Refresh page
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
