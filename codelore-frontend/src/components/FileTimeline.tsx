import React from 'react';

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

interface FileTimelineProps {
  files: FileData[];
  onFileSelect: (file: FileData) => void;
}

const FileTimeline: React.FC<FileTimelineProps> = ({ files, onFileSelect }) => {
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

  // Sort files by most recent commit
  const sortedFiles = [...files].sort((a, b) => {
    const aDate = a.commitHistory.length > 0 ? new Date(a.commitHistory[0].date).getTime() : 0;
    const bDate = b.commitHistory.length > 0 ? new Date(b.commitHistory[0].date).getTime() : 0;
    return bDate - aDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">File Evolution Timeline</h2>
        <p className="text-sm text-gray-600">
          {files.length} files • Sorted by recent activity
        </p>
      </div>

      <div className="grid gap-6">
        {sortedFiles.map((file) => (
          <div
            key={file.path}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onFileSelect(file)}
          >
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <span className="text-2xl">{getFileIcon(file.name)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {file.name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(file.role)}`}>
                      {file.role}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{file.path}</p>
                  
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {file.summary}
                  </p>

                  {file.commitHistory.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Recent Activity ({file.commitHistory.length} commits)
                      </h4>
                      <div className="space-y-2">
                        {file.commitHistory.slice(0, 3).map((commit, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {commit.message}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  {new Date(commit.date).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500 font-mono">
                                  {commit.hash.substring(0, 8)}
                                </span>
                              </div>
                              {commit.changes && (
                                <p className="text-xs text-gray-600 mt-1 truncate">
                                  {commit.changes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        {file.commitHistory.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{file.commitHistory.length - 3} more commits
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {file.connections.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Connected Files ({file.connections.length})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {file.connections.slice(0, 5).map((connection, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            {connection}
                          </span>
                        ))}
                        {file.connections.length > 5 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-50 text-gray-600">
                            +{file.connections.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Files Found</h3>
          <p className="text-gray-600">Try adjusting your search or filters to see file timeline data.</p>
        </div>
      )}
    </div>
  );
};

export default FileTimeline; 