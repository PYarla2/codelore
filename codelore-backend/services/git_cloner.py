from git import Repo
import os

def clone_repo(repo_url: str, target_dir: str = "cloned_repos"):
    """
    Clone a GitHub repository to a local directory.
    
    Args:
        repo_url (str): The GitHub repository URL
        target_dir (str): Directory to store cloned repos
        
    Returns:
        str: Path to the cloned repository
    """
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
    
    repo_name = repo_url.rstrip('/').split('/')[-1]
    local_path = os.path.join(target_dir, repo_name)
    
    if os.path.exists(local_path):
        return local_path  # Already cloned
    
    Repo.clone_from(repo_url, local_path)
    return local_path 