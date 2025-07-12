import React, { useState } from 'react';
import TimelinePage from './components/TimelinePage';
import ArchitecturePage from './components/ArchitecturePage';
import FileExplorerPage from './components/FileExplorerPage';

type Page = 'timeline' | 'architecture' | 'explorer';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('timeline');

  const renderPage = () => {
    switch (currentPage) {
      case 'timeline':
        return <TimelinePage />;
      case 'architecture':
        return <ArchitecturePage />;
      case 'explorer':
        return <FileExplorerPage />;
      default:
        return <TimelinePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">CodeLore</h1>
            </div>
            <div className="flex items-center space-x-8">
              <button
                onClick={() => setCurrentPage('timeline')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'timeline'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setCurrentPage('architecture')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'architecture'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Architecture
              </button>
              <button
                onClick={() => setCurrentPage('explorer')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'explorer'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                File Explorer
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
