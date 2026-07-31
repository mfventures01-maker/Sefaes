import React, { Suspense } from 'react';

/**
 * SEFAES Route Suspense Gate
 * 
 * Centralized loading boundary for all lazy-loaded route modules.
 * - No API calls inside fallback
 * - No layout rendering during loading state
 * - No authentication state leakage
 * - Deterministic, lightweight spinner only
 */

const RouteLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-slate-500 animate-pulse">Loading module...</p>
    </div>
  </div>
);

export const RouteSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<RouteLoader />}>
    {children}
  </Suspense>
);

export default RouteSuspense;
