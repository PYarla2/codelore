import React, { useState, useEffect } from "react";
import FileTimeline from "./FileTimeline";
import { FileEvolutionResponse } from "../types";

type Props = {
  repoUrl?: string;
};

export default function TimelinePage({ repoUrl }: Props) {
  const [data, setData] = useState<FileEvolutionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState(repoUrl || "");

  const fetchFileEvolution = async (url: string) => {
    if (!url) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/evolution?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFileEvolution(inputUrl);
  };

  useEffect(() => {
    if (repoUrl) {
      fetchFileEvolution(repoUrl);
    }
  }, [repoUrl]);

  // Transform data to match FileTimeline component interface
  const transformDataForFileTimeline = () => {
    if (!data) return [];
    
    return Object.entries(data.file_evolution).map(([filename, history]) => ({
      name: filename.split('/').pop() || filename,
      path: filename,
      role: "File", // Default role since we don't have role data in this endpoint
      connections: [], // No connection data in this endpoint
      commitHistory: history.map(commit => ({
        hash: commit.commit_sha,
        date: commit.timestamp,
        message: commit.summary,
        changes: `${commit.change_type} (+${commit.additions}, -${commit.deletions})`
      })),
      summary: `File with ${history.length} commits, ${data.lifecycle_stats[filename]?.total_additions || 0} additions, ${data.lifecycle_stats[filename]?.total_deletions || 0} deletions`
    }));
  };

  const handleFileSelect = (file: any) => {
    // Handle file selection - could open a modal or navigate to details
    console.log('Selected file:', file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing repository evolution...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📂 File Evolution Timeline
          </h1>
          <p className="text-gray-600 mb-6">
            Visualize how files in a GitHub repository have evolved over time
          </p>
          
          <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Analyze
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {data && (
          <div>
            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {data.repo_name}
              </h2>
              <p className="text-gray-600 mb-2">
                Owner: {data.owner} • Files tracked: {data.total_files_tracked}
              </p>
              <p className="text-sm text-gray-500">
                Repository: {data.repo}
              </p>
            </div>

            <FileTimeline
              files={transformDataForFileTimeline()}
              onFileSelect={handleFileSelect}
            />
          </div>
        )}

        {!data && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Ready to analyze a repository?
            </h2>
            <p className="text-gray-600">
              Enter a GitHub repository URL above to see its file evolution timeline
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 