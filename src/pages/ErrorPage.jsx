import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCcw, Home, MessageCircle } from 'lucide-react';
import { companyData } from '../constants/companyData';

const ErrorPage = ({ error, errorInfo, resetErrorBoundary }) => {
  const handleRetry = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
        <div className="mx-auto mb-6 w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center">
          <AlertTriangle size={32} className="text-white" />
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-3 text-gray-600 leading-relaxed">
          We&apos;ve encountered an unexpected error. Don&apos;t worry, our team has been notified.
        </p>

        {import.meta.env.DEV && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700 mb-2">
              Error Details (Development)
            </summary>
            <div className="space-y-2">
              {error?.message && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm font-mono text-red-700 overflow-x-auto">
                  Error: {error.message}
                </div>
              )}
              {error?.stack && (
                <div data-lenis-prevent className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs font-mono text-red-700 overflow-x-auto max-h-32 overflow-y-auto">
                  Stack: {error.stack}
                </div>
              )}
              {errorInfo?.componentStack && (
                <div data-lenis-prevent className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs font-mono text-red-700 overflow-x-auto max-h-32 overflow-y-auto">
                  Component Stack: {errorInfo.componentStack}
                </div>
              )}
            </div>
          </details>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleRetry}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            Try Again
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleGoBack}
              className="flex-1 px-6 py-3 bg-white text-gray-700 font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              Go Back
            </button>

            <Link
              to="/"
              className="flex-1 px-6 py-3 bg-white text-gray-700 font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Home
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-6">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            Contact Support
          </Link>
          <a
            href={`mailto:${companyData.email}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            Report Issue
          </a>
        </div>

        {error && (
          <div className="mt-6 text-xs text-gray-500">
            Error ID: {error.name || 'Unknown'}-{Date.now()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
