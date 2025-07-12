import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';

interface FileRole {
  role: string;
  category: string;
  complexity: string;
  dependencies: string[];
  key_functions: string[];
}

interface ArchitectureData {
  repo: string;
  project_summary: string;
  project_details: {
    type: string;
    key_features: string[];
    tech_stack: string[];
    structure: any;
  };
  key_files: Record<string, FileRole>;
  dependency_graph: Record<string, any>;
  mermaid_diagram: string;
  architecture_stats: {
    total_files: number;
    frontend_files: number;
    backend_files: number;
    total_imports: number;
    total_exports: number;
  };
}

const ArchitecturePage: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [architectureData, setArchitectureData] = useState<ArchitectureData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  const analyzeArchitecture = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/architecture?url=${encodeURIComponent(repoUrl)}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setArchitectureData(data);
        // Render Mermaid diagram after data is loaded
        setTimeout(() => {
          mermaid.contentLoaded();
        }, 100);
      }
    } catch (err) {
      setError('Failed to analyze repository architecture');
    } finally {
      setLoading(false);
    }
  };

  const renderFileCard = (filePath: string, fileRole: FileRole) => {
    const isSelected = selectedFile === filePath;
    
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
          <h3 className="font-semibold text-sm text-gray-800 truncate">{filePath}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            fileRole.category === 'UI Component' ? 'bg-green-100 text-green-800' :
            fileRole.category === 'API Endpoint' ? 'bg-blue-100 text-blue-800' :
            fileRole.category === 'Data Model' ? 'bg-purple-100 text-purple-800' :
            fileRole.category === 'Business Logic' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {fileRole.category}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">{fileRole.role}</p>
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Complexity: {fileRole.complexity}</span>
          <span>Deps: {fileRole.dependencies.length}</span>
          <span>Functions: {fileRole.key_functions.length}</span>
        </div>

        {isSelected && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="space-y-2">
              {fileRole.key_functions.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Key Functions:</h4>
                  <div className="flex flex-wrap gap-1">
                    {fileRole.key_functions.map((func, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded">
                        {func}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {fileRole.dependencies.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Dependencies:</h4>
                  <div className="flex flex-wrap gap-1">
                    {fileRole.dependencies.slice(0, 3).map((dep, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-xs rounded">
                        {dep}
                      </span>
                    ))}
                    {fileRole.dependencies.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-xs rounded">
                        +{fileRole.dependencies.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Architecture</h1>
          <p className="text-gray-600">Analyze repository structure, file roles, and dependencies</p>
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
              onClick={analyzeArchitecture}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze Architecture'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {architectureData && (
          <div className="space-y-6">
            {/* Project Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Summary</h3>
                  <p className="text-gray-600">{architectureData.project_summary}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Key Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {architectureData.project_details.key_features.map((feature, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Architecture Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{architectureData.architecture_stats.total_files}</div>
                  <div className="text-sm text-gray-600">Total Files</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{architectureData.architecture_stats.frontend_files}</div>
                  <div className="text-sm text-gray-600">Frontend</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{architectureData.architecture_stats.backend_files}</div>
                  <div className="text-sm text-gray-600">Backend</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{architectureData.architecture_stats.total_imports}</div>
                  <div className="text-sm text-gray-600">Imports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{architectureData.architecture_stats.total_exports}</div>
                  <div className="text-sm text-gray-600">Exports</div>
                </div>
              </div>
            </div>

            {/* Dependency Diagram */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dependency Graph</h2>
              <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
                <div className="mermaid">
                  {architectureData.mermaid_diagram}
                </div>
              </div>
            </div>

            {/* Key Files */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Files & Their Roles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(architectureData.key_files).map(([filePath, fileRole]) =>
                  renderFileCard(filePath, fileRole)
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchitecturePage; 