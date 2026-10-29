import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumb on home page
  if (pathnames.length === 0) return null;

  const breadcrumbMap = {
    'study-abroad': 'Study Abroad',
    'destinations': 'Destinations',
    'destination': 'Destination',
    'cost-calculator': 'Cost Calculator',
    'apply': 'Apply',
    'blog': 'Blog',
  };

  return (
    <nav className="py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center flex-wrap gap-2 text-sm">
          <li>
            <Link
              to="/"
              className="flex items-center gap-1 text-slate-500 hover:text-primary-600 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </li>

          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            let decodedName = name;
            try { decodedName = decodeURIComponent(name); } catch { /* leave as-is if malformed */ }
            const displayName = breadcrumbMap[name] || decodedName.charAt(0).toUpperCase() + decodedName.slice(1);

            return (
              <React.Fragment key={name}>
                <li>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </li>
                <li>
                  {isLast ? (
                    <span className="text-slate-900 font-medium">
                      {displayName}
                    </span>
                  ) : (
                    <Link
                      to={routeTo}
                      className="text-slate-500 hover:text-primary-600 transition-colors"
                    >
                      {displayName}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;
