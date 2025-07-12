import React from "react";
import { ChangeLog } from "../types";

type Props = {
  filename: string;
  history: ChangeLog[];
  stats?: {
    created_at: string;
    last_modified: string;
    total_commits: number;
    total_additions: number;
    total_deletions: number;
    net_changes: number;
    change_types: string[];
  };
};

export default function FileTimeline({ filename, history, stats }: Props) {
  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case "added":
        return "bg-green-100 border-green-300 text-green-800";
      case "modified":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "removed":
        return "bg-red-100 border-red-300 text-red-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case "added":
        return "➕";
      case "modified":
        return "✏️";
      case "removed":
        return "❌";
      default:
        return "📝";
    }
  };

  return (
    <div className="p-6 border border-gray-200 rounded-2xl shadow-sm mb-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">{filename}</h2>
        {stats && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">{stats.total_commits} commits</span>
            <span className="mx-2">•</span>
            <span className="text-green-600">+{stats.total_additions}</span>
            <span className="mx-1">/</span>
            <span className="text-red-600">-{stats.total_deletions}</span>
          </div>
        )}
      </div>
      
      {stats && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Created:</span>
              <div className="font-medium">{new Date(stats.created_at).toLocaleDateString()}</div>
            </div>
            <div>
              <span className="text-gray-500">Last Modified:</span>
              <div className="font-medium">{new Date(stats.last_modified).toLocaleDateString()}</div>
            </div>
            <div>
              <span className="text-gray-500">Net Changes:</span>
              <div className={`font-medium ${stats.net_changes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.net_changes >= 0 ? '+' : ''}{stats.net_changes}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Change Types:</span>
              <div className="font-medium">{stats.change_types.join(', ')}</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {history.map((log, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg border-l-4 ${getChangeTypeColor(log.change_type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getChangeTypeIcon(log.change_type)}</span>
                  <div className="text-sm font-semibold">{log.summary}</div>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  {log.author} — {new Date(log.timestamp).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {log.commit_sha.substring(0, 8)}
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="text-green-600">+{log.additions}</div>
                <div className="text-red-600">-{log.deletions}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 