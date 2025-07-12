import React, { useState, useEffect } from 'react';

interface FileRole {
  role: string;
  category: string;
  complexity: string;
  dependencies: string[];
  key_functions: string[];
}

interface FileHistory {
  commit: string;
  message: string;
  date: string;
  changeType: string;
  additions: number;
  deletions: number;
}

interface FileData {
  file_path: string;
  role: FileRole;
  history: FileHistory[];
  connections: {
    imports: string[];
    imported_by: string[];
  };
}

const FileExplorerPage: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [fileRoles, setFileRoles] = useState<Record<string, FileRole> | null>(null);
  const [fileHistory, setFileHistory] = useState<Record<string, FileHistory[]> | null>(null);
  const [dependencies, setDependencies] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const analyzeFiles = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get file roles
      const rolesResponse = await fetch(`http://localhost:8000/file-roles?url=${encodeURIComponent(repoUrl)}`);
      const rolesData = await rolesResponse.json();

      // Get file evolution
      const evolutionResponse = await fetch(`http://localhost:8000/evolution?url=${encodeURIComponent(repoUrl)}`);
      const evolutionData = await evolutionResponse.json();

      // Get dependencies
      const depsResponse = await fetch(`http://localhost:8000/dependencies?url=${encodeURIComponent(repoUrl)}`);
      const depsData = await depsResponse.json();

      if (rolesData.error || evolutionData.error || depsData.error) {
        setError(rolesData.error || evolutionData.error || depsData.error);
      } else {
        setFileRoles(rolesData.file_roles);
        setFileHistory(evolutionData.file_evolution);
        setDependencies(depsData.dependencies);
      }
    } catch (err) {
      setError('Failed to analyze repository files');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredFiles = () => {
    if (!fileRoles) return [];

    let files = Object.entries(fileRoles);

    // Apply search filter
    if (searchTerm) {
      files = files.filter(([filePath]) => 
        filePath.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      files = files.filter(([, role]) => role.category === filterCategory);
    }

    return files;
  };

  const getFileConnections = (filePath: string) => {
    if (!dependencies || !dependencies[filePath]) {
      return { imports: [], imported_by: [] };
    }

    const deps = dependencies[filePath];
    const imports = deps.imports
      .filter((imp: any) => imp.type === 'internal')
      .map((imp: any) => imp.module);
    
    const imported_by = deps.imported_by || [];

    return { imports, imported_by };
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'UI Component': return 'bg-green-100 text-green-800';
      case 'API Endpoint': return 'bg-blue-100 text-blue-800';
      case 'Data Model': return 'bg-purple-100 text-purple-800';
      case 'Business Logic': return 'bg-orange-100 text-orange-800';
      case 'Frontend Utility': return 'bg-teal-100 text-teal-800';
      case 'Backend Utility': return 'bg-indigo-100 text-indigo-800';
      case 'Configuration': return 'bg-yellow-100 text-yellow-800';
      case 'Test': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'added': return 'bg-green-100 text-green-800';
      case 'modified': return 'bg-yellow-100 text-yellow-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderFileCard = (filePath: string, role: FileRole) => {
    const isSelected = selectedFile === filePath;
    const connections = getFileConnections(filePath);
    const history = fileHistory?.[filePath] || [];

    return (
      <div 
        key={filePath}
        className={`p-4 border rounded-lg cursor-pointer transition-all ${
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
        onClick={() => setSelectedFile(isSelected ? null : filePath)}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-800 truncate flex-1 mr-2">{filePath}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(role.category)}`}>
            {role.category}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">{role.role}</p>
        
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
          <span>Complexity: {role.complexity}</span>
          <span>Changes: {history.length}</span>
          <span>Deps: {connections.imports.length}</span>
          <span>Used by: {connections.imported_by.length}</span>
        </div>

        {isSelected && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
            {/* Key Functions */}
            {role.key_functions.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Key Functions:</h4>
                <div className="flex flex-wrap gap-1">
                  {role.key_functions.map((func: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded">
                      {func}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dependencies */}
            {connections.imports.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Imports:</h4>
                <div className="flex flex-wrap gap-1">
                  {connections.imports.slice(0, 3).map((dep: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-xs rounded">
                      {dep}
                    </span>
                  ))}
                  {connections.imports.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-xs rounded">
                      +{connections.imports.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Recent Changes */}
            {history.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Recent Changes:</h4>
                <div className="space-y-1">
                  {history.slice(0, 3).map((change: FileHistory, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className={`px-1 py-0.5 rounded ${getChangeTypeColor(change.changeType)}`}>
                        {change.changeType}
                      </span>
                      <span className="text-gray-600 truncate">{change.message}</span>
                    </div>
                  ))}
                  {history.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{history.length - 3} more changes
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getUniqueCategories = () => {
    if (!fileRoles) return [];
    const categories = new Set(Object.values(fileRoles).map(role => role.category));
    return Array.from(categories).sort();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">File Explorer</h1>
          <p className="text-gray-600">Explore individual files, their roles, and connections</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="Enter GitHub repository URL (e.g., https://github.com/user/repo)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={analyzeFiles}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze Files'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {fileRoles && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Files</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by filename..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {getUniqueCategories().map((category: string) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                Showing {getFilteredFiles().length} of {Object.keys(fileRoles).length} files
              </div>
            </div>

            {/* Files Grid */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Files & Their Roles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredFiles().map(([filePath, role]: [string, FileRole]) =>
                  renderFileCard(filePath, role)
                )}
              </div>
              
              {getFilteredFiles().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No files match your current filters
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorerPage; 