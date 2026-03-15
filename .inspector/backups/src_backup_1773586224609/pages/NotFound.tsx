import React from 'react';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-slate-50">
            <h1 className="text-6xl font-black text-indigo-600 mb-4">404</h1>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Page Not Found</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <a href="/" className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
                Go Back Home
            </a>
        </div>
    );
};

export default NotFound;
