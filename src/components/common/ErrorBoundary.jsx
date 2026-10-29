import React from 'react';
import ErrorPage from '../../pages/ErrorPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });

    // Log to external service in production
    if (import.meta.env.PROD) {
      // Example: logErrorToService(error, errorInfo);
    }

    // The error boundary sits above <Routes>, so once it catches an error
    // React Router is unmounted and stays unmounted — client-side nav (Links,
    // history) can no longer render anything. A hard redirect to '/' is the
    // only way to guarantee navigation works again. Guard against a redirect
    // loop for errors that happen on '/' itself, or repeat within 5s.
    const isHome = window.location.pathname === '/';
    const lastRedirect = Number(sessionStorage.getItem('errorBoundaryRedirectAt') || 0);
    const redirectedRecently = Date.now() - lastRedirect < 5000;

    if (!isHome && !redirectedRecently) {
      sessionStorage.setItem('errorBoundaryRedirectAt', String(Date.now()));
      window.location.href = '/';
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const isHome = window.location.pathname === '/';
      if (!isHome) {
        // Redirecting to '/' via componentDidCatch — avoid flashing the
        // full error page for what should be a near-instant hard navigation.
        return (
          <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
            <p className="text-gray-500 font-medium">Redirecting...</p>
          </div>
        );
      }

      // Already on '/' — nowhere else to redirect to, show the real fallback.
      return (
        <ErrorPage
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
