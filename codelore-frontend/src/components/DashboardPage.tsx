import React, { useState, useEffect } from 'react';
import FileListSidebar from './FileListSidebar';
import ProjectSummary from './ProjectSummary';
import FileDetailView from './FileDetailView';
import ArchitectureGraph from './ArchitectureGraph';
import FileTimeline from './FileTimeline';
import SearchAndFilters from './SearchAndFilters';

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

interface ProjectData {
  summary: string;
  files: FileData[];
  architecture: string;
}

const DashboardPage: React.FC = () => {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'timeline' | 'architecture' | 'details'>('timeline');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const fetchProjectData = async (url: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch project data from backend
      const response = await fetch(`http://localhost:8000/api/project/summary?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project data');
      }
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setProjectData(data);
      setHasAnalyzed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      fetchProjectData(repoUrl.trim());
    }
  };

  const filteredFiles = projectData?.files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || file.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const handleFileSelect = (file: FileData) => {
    setSelectedFile(file);
    setActiveTab('details');
  };

  const handleExportSummary = async () => {
    if (!projectData) return;
    
    const summary = `# Project Summary\n\n${projectData.summary}\n\n## Files\n\n${projectData.files.map(file => 
      `### ${file.name}\n- **Role:** ${file.role}\n- **Path:** ${file.path}\n- **Summary:** ${file.summary}\n`
    ).join('\n')}`;
    
    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-summary.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Landing page when no repo has been analyzed
  if (!hasAnalyzed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">CodeLore</h1>
            <p className="text-xl text-gray-600 mb-2">Repository Analysis & Storytelling</p>
            <p className="text-gray-500">
              Understand any GitHub repository's evolution, architecture, and file relationships
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleAnalyzeRepo} className="space-y-6">
              <div>
                <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  id="repo-url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !repoUrl.trim()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing Repository...
                  </div>
                ) : (
                  'Analyze Repository'
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">What CodeLore provides:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📊</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">File Evolution Timeline</h4>
                    <p className="text-xs text-gray-500">Track how files change over time</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">🏗️</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Architecture Visualization</h4>
                    <p className="text-xs text-gray-500">Interactive dependency graphs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm">🎯</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">File Role Analysis</h4>
                    <p className="text-xs text-gray-500">Understand each file's purpose</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-sm">📝</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Project Summary</h4>
                    <p className="text-xs text-gray-500">AI-generated project overview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Repository</h2>
          <p className="text-gray-600">This may take a few moments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Project</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => setHasAnalyzed(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Another Repository
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">CodeLore</h1>
              <p className="text-sm text-gray-600">Repository Analysis</p>
            </div>
            <button
              onClick={() => setHasAnalyzed(false)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              New Repo
            </button>
          </div>
        </div>
        
        <SearchAndFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
        />
        
        <FileListSidebar
          files={filteredFiles}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Project Overview</h2>
              <p className="text-sm text-gray-600">
                {filteredFiles.length} files • {projectData?.files.length || 0} total
              </p>
            </div>
            <button
              onClick={handleExportSummary}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Export Summary
            </button>
          </div>
        </div>

        {/* Project Summary */}
        {projectData && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <ProjectSummary summary={projectData.summary} />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <nav className="flex space-x-8 px-4">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'timeline'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'architecture'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Architecture
            </button>
            {selectedFile && (
              <button
                onClick={() => setActiveTab('details')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                File Details
              </button>
            )}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'timeline' && (
            <div className="p-6">
              <FileTimeline files={filteredFiles} onFileSelect={handleFileSelect} />
            </div>
          )}
          
          {activeTab === 'architecture' && projectData && (
            <div className="p-6">
              <ArchitectureGraph mermaidCode={projectData.architecture} />
            </div>
          )}
          
          {activeTab === 'details' && selectedFile && (
            <div className="p-6">
              <FileDetailView file={selectedFile} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 