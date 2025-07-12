import React, { useState } from 'react';

interface FileData {
  name: string;
  path: string;
  role: string;
  connections: string[];
  commitHistory: Array<{
    hash: string;
    date: string;
    message: string;
    changes: string;
  }>;
  summary: string;
}

interface FileDetailViewProps {
  file: FileData;
}

const FileDetailView: React.FC<FileDetailViewProps> = ({ file }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'connections'>('overview');

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'UI Component': 'bg-blue-100 text-blue-800',
      'API Endpoint': 'bg-green-100 text-green-800',
      'Authentication': 'bg-red-100 text-red-800',
      'Database': 'bg-purple-100 text-purple-800',
      'Utility': 'bg-gray-100 text-gray-800',
      'Configuration': 'bg-yellow-100 text-yellow-800',
      'Service': 'bg-indigo-100 text-indigo-800',
      'Type Definition': 'bg-pink-100 text-pink-800',
      'Test': 'bg-orange-100 text-orange-800',
      'Documentation': 'bg-teal-100 text-teal-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const icons: { [key: string]: string } = {
      'tsx': '⚛️',
      'ts': '📘',
      'jsx': '⚛️',
      'js': '📘',
      'py': '🐍',
      'json': '📄',
      'md': '📝',
      'css': '🎨',
      'html': '🌐',
      'yml': '⚙️',
      'yaml': '⚙️',
      'txt': '📄',
      'sql': '🗄️',
      'sh': '💻',
      'bat': '💻',
      'ps1': '💻'
    };
    return icons[extension || ''] || '📄';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* File Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <span className="text-3xl">{getFileIcon(file.name)}</span>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{file.name}</h1>
              <p className="text-gray-600 mt-1">{file.path}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(file.role)}`}>
                {file.role}
              </span>
              <button
                onClick={() => copyToClipboard(`${file.name}\nRole: ${file.role}\nPath: ${file.path}\nSummary: ${file.summary}`)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Copy Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <nav className="flex space-x-8 px-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Commit History ({file.commitHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'connections'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Connections ({file.connections.length})
          </button>
        </nav>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">File Summary</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {file.summary}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">File Information</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">File Type</dt>
                      <dd className="text-sm text-gray-900">{file.name.split('.').pop()?.toUpperCase() || 'Unknown'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Role</dt>
                      <dd className="text-sm text-gray-900">{file.role}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Total Commits</dt>
                      <dd className="text-sm text-gray-900">{file.commitHistory.length}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Connections</dt>
                      <dd className="text-sm text-gray-900">{file.connections.length}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Activity</h4>
                  {file.commitHistory.length > 0 ? (
                    <div className="space-y-3">
                      {file.commitHistory.slice(0, 3).map((commit, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-3">
                          <p className="text-sm text-gray-900 font-medium">{commit.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(commit.date).toLocaleDateString()} • {commit.hash.substring(0, 8)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No commit history available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Commit History</h3>
              {file.commitHistory.length > 0 ? (
                <div className="space-y-4">
                  {file.commitHistory.map((commit, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">{commit.message}</p>
                          <p className="text-xs text-gray-500 mb-2">
                            {new Date(commit.date).toLocaleString()} • {commit.hash}
                          </p>
                          {commit.changes && (
                            <div className="bg-gray-50 rounded p-3">
                              <p className="text-xs text-gray-700">{commit.changes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No commit history available for this file.</p>
              )}
            </div>
          )}

          {activeTab === 'connections' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">File Connections</h3>
              {file.connections.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {file.connections.map((connection, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{connection}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No connections found for this file.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileDetailView; 