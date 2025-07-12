from pydriller import Repository

def get_commit_summary(repo_path):
    """
    Parse commit history from a repository.
    
    Args:
        repo_path (str): Path to the local repository
        
    Returns:
        list: List of commit data dictionaries
    """
    data = []
    for commit in Repository(repo_path).traverse_commits():
        # Get modified files using the correct pydriller API
        modified_files = []
        for modified_file in commit.modified_files:
            modified_files.append(modified_file.filename)
        
        data.append({
            "hash": commit.hash,
            "msg": commit.msg,
            "author": commit.author.name,
            "date": commit.author_date.isoformat(),
            "files": modified_files,
        })
    return data 