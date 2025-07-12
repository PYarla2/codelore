export type ChangeLog = {
  commit_sha: string;
  timestamp: string;
  author: string;
  summary: string;
  change_type: "added" | "modified" | "removed";
  additions: number;
  deletions: number;
};

export type FileHistory = {
  [filename: string]: ChangeLog[];
};

export type FileEvolutionResponse = {
  repo: string;
  owner: string;
  repo_name: string;
  total_files_tracked: number;
  file_evolution: FileHistory;
  lifecycle_stats: {
    [filename: string]: {
      created_at: string;
      last_modified: string;
      total_commits: number;
      total_additions: number;
      total_deletions: number;
      net_changes: number;
      change_types: string[];
    };
  };
};

export type RepositoryAnalysis = {
  repo: string;
  commits: Array<{
    hash: string;
    msg: string;
    author: string;
    date: string;
    files: string[];
  }>;
  modules: Array<{
    module: string;
    file_count: number;
  }>;
  files: Array<{
    path: string;
    type: string;
    ext: string;
  }>;
}; 