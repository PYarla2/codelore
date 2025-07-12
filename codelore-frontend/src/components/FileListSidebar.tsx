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

interface FileListSidebarProps {
  files: FileData[];
  selectedFile: FileData | null;
  onFileSelect: (file: FileData) => void;
}

const FileListSidebar: React.FC<FileListSidebarProps> = ({
  files,
  selectedFile,
  onFileSelect
}) => {
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

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Files ({files.length})</h3>
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.path}
              onClick={() => onFileSelect(file)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedFile?.path === file.path
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg">{getFileIcon(file.name)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium truncate ${
                      selectedFile?.path === file.path ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {file.name}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(file.role)}`}>
                      {file.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {file.path}
                  </p>
                  {file.connections.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Connections:</p>
                      <div className="flex flex-wrap gap-1">
                        {file.connections.slice(0, 3).map((connection, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                          >
                            {connection}
                          </span>
                        ))}
                        {file.connections.length > 3 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                            +{file.connections.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {file.commitHistory.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Last updated: {new Date(file.commitHistory[0].date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {files.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No files found</p>
            <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileListSidebar; 