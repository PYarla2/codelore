import os
import requests
from typing import Dict, List, Optional
from datetime import datetime

def get_commit_diff(owner: str, repo: str, commit_sha: str, github_token: Optional[str] = None) -> List[Dict]:
    """
    Get detailed diff information for a specific commit using GitHub API.
    
    Args:
        owner (str): Repository owner
        repo (str): Repository name
        commit_sha (str): Commit SHA
        github_token (str, optional): GitHub API token for higher rate limits
        
    Returns:
        List[Dict]: List of file changes with diff details
    """
    url = f"https://api.github.com/repos/{owner}/{repo}/commits/{commit_sha}"
    
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "CodeLore-Backend"
    }
    
    if github_token:
        headers["Authorization"] = f"token {github_token}"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        commit_data = response.json()
        
        files_changed = []
        for file in commit_data.get("files", []):
            files_changed.append({
                "filename": file["filename"],
                "status": file["status"],  # added, modified, removed
                "additions": file.get("additions", 0),
                "deletions": file.get("deletions", 0),
                "changes": file.get("changes", 0),
                "patch": file.get("patch", ""),  # The actual diff
                "raw_url": file.get("raw_url", "")
            })
        
        return files_changed
        
    except requests.RequestException as e:
        print(f"Error fetching commit diff: {e}")
        return []

def extract_repo_owner_name(repo_url: str) -> tuple:
    """
    Extract owner and repo name from GitHub URL.
    
    Args:
        repo_url (str): GitHub repository URL
        
    Returns:
        tuple: (owner, repo_name)
    """
    # Handle different GitHub URL formats
    if repo_url.startswith("https://github.com/"):
        parts = repo_url.replace("https://github.com/", "").rstrip("/").split("/")
        if len(parts) >= 2:
            return parts[0], parts[1]
    
    raise ValueError(f"Invalid GitHub URL format: {repo_url}")

def build_file_evolution(owner: str, repo: str, commits: List[Dict], github_token: Optional[str] = None) -> Dict:
    """
    Build a complete file evolution map from commit history.
    
    Args:
        owner (str): Repository owner
        repo (str): Repository name
        commits (List[Dict]): List of commit data from pydriller
        github_token (str, optional): GitHub API token
        
    Returns:
        Dict: File evolution mapping {filename: [changes]}
    """
    file_evolution = {}
    
    for commit in commits:
        commit_sha = commit["hash"]
        timestamp = commit["date"]
        
        # Get detailed diff for this commit
        file_changes = get_commit_diff(owner, repo, commit_sha, github_token)
        
        for change in file_changes:
            filename = change["filename"]
            
            if filename not in file_evolution:
                file_evolution[filename] = []
            
            file_evolution[filename].append({
                "commit_sha": commit_sha,
                "timestamp": timestamp,
                "change_type": change["status"],
                "additions": change["additions"],
                "deletions": change["deletions"],
                "summary": commit["msg"],
                "author": commit["author"]
            })
    
    return file_evolution

def get_file_lifecycle_stats(file_evolution: Dict) -> Dict:
    """
    Calculate lifecycle statistics for each file.
    
    Args:
        file_evolution (Dict): File evolution mapping
        
    Returns:
        Dict: File lifecycle statistics
    """
    stats = {}
    
    for filename, changes in file_evolution.items():
        if not changes:
            continue
            
        first_change = changes[0]
        last_change = changes[-1]
        
        total_additions = sum(c["additions"] for c in changes)
        total_deletions = sum(c["deletions"] for c in changes)
        
        stats[filename] = {
            "created_at": first_change["timestamp"],
            "last_modified": last_change["timestamp"],
            "total_commits": len(changes),
            "total_additions": total_additions,
            "total_deletions": total_deletions,
            "net_changes": total_additions - total_deletions,
            "change_types": list(set(c["change_type"] for c in changes))
        }
    
    return stats 