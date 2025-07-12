# main.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from services.git_cloner import clone_repo
from services.commit_parser import get_commit_summary
from services.module_parser import get_directory_tree, detect_modules
from services.code_extractor import extract_python_symbols
from services.summarizer import summarize_symbol
from services.diff_parser import build_file_evolution, get_file_lifecycle_stats, extract_repo_owner_name
from services.project_analyzer import extract_project_summary, generate_project_summary_text
from services.file_analyzer import analyze_file_role
from services.dependency_analyzer import build_dependency_graph, generate_mermaid_diagram
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def hello():
    return {"message": "CodeLore backend live"}

@app.get("/api/project/summary")
def get_dashboard_data(url: str = Query(..., description="GitHub repo URL")):
    """
    Unified endpoint that provides all data needed for the dashboard.
    Returns project summary, file roles, commit history, and architecture diagram.
    """
    try:
        # Clone repo and get basic data
        path = clone_repo(url)
        commits = get_commit_summary(path)
        owner, repo = extract_repo_owner_name(url)
        
        # Get project summary
        summary_data = extract_project_summary(path)
        summary_text = generate_project_summary_text(summary_data)
        
        # Get dependency graph and architecture
        connections = build_dependency_graph(path)
        mermaid_diagram = generate_mermaid_diagram(connections)
        
        # Get file evolution for commit history
        file_evolution = build_file_evolution(owner, repo, commits[:30], None)  # Limit for performance
        
        # Build comprehensive file data
        files = []
        for file_path in connections["dependencies"].keys():
            full_path = os.path.join(path, file_path)
            if os.path.exists(full_path):
                # Get file role
                file_history = file_evolution.get(file_path, [])
                role_data = analyze_file_role(full_path, file_history)
                
                # Get file connections
                file_connections = []
                if file_path in connections["dependencies"]:
                    for dep in connections["dependencies"][file_path]:
                        if dep in connections["file_map"]:
                            file_connections.append(connections["file_map"][dep]["name"])
                
                # Format commit history
                formatted_history = []
                for commit in file_history[:10]:  # Limit to 10 most recent
                    formatted_history.append({
                        "hash": commit.get("hash", ""),
                        "date": commit.get("date", ""),
                        "message": commit.get("message", ""),
                        "changes": commit.get("changes", "")
                    })
                
                # Create file object
                file_obj = {
                    "name": os.path.basename(file_path),
                    "path": file_path,
                    "role": role_data.get("role", "Unknown"),
                    "connections": file_connections,
                    "commitHistory": formatted_history,
                    "summary": role_data.get("summary", "No summary available")
                }
                files.append(file_obj)
        
        return {
            "summary": summary_text,
            "files": files,
            "architecture": mermaid_diagram,
            "stats": {
                "total_files": len(files),
                "total_commits": len(commits),
                "total_connections": len(connections["imports"])
            }
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/analyze")
def analyze_repo(url: str = Query(..., description="GitHub repo URL")):
    try:
        path = clone_repo(url)
        commits = get_commit_summary(path)
        file_tree = get_directory_tree(path)
        modules = detect_modules(file_tree)
        return {
            "repo": url,
            "commits": commits[:10],
            "modules": modules,
            "files": file_tree[:20]  # Preview top 20
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/symbols")
def extract_code(url: str, file: str):
    try:
        path = clone_repo(url)
        full_path = os.path.join(path, file)
        if not os.path.isfile(full_path):
            return {"error": "File not found"}
        symbols = extract_python_symbols(full_path)
        return {"file": file, "symbols": symbols}
    except Exception as e:
        return {"error": str(e)}

@app.get("/summarize")
def summarize_code(url: str, file: str):
    try:
        path = clone_repo(url)
        full_path = os.path.join(path, file)
        symbols = extract_python_symbols(full_path)
        summaries = []
        for symbol in symbols:
            summary = summarize_symbol(symbol)
            summaries.append({
                "name": symbol["name"],
                "type": symbol["type"],
                "summary": summary
            })
        return {"file": file, "summaries": summaries}
    except Exception as e:
        return {"error": str(e)}

@app.get("/evolution")
def get_file_evolution(url: str = Query(..., description="GitHub repo URL"), 
                      github_token: str = Query(None, description="GitHub API token (optional)")):
    """
    Get detailed file evolution tracking for a repository.
    Shows how each file has changed over time with commit-level details.
    """
    try:
        # Clone repo and get commit history
        path = clone_repo(url)
        commits = get_commit_summary(path)
        
        # Extract owner and repo name from URL
        owner, repo = extract_repo_owner_name(url)
        
        # Build file evolution map
        file_evolution = build_file_evolution(owner, repo, commits[:50], github_token)  # Limit to 50 commits for performance
        
        # Calculate lifecycle statistics
        lifecycle_stats = get_file_lifecycle_stats(file_evolution)
        
        return {
            "repo": url,
            "owner": owner,
            "repo_name": repo,
            "total_files_tracked": len(file_evolution),
            "file_evolution": file_evolution,
            "lifecycle_stats": lifecycle_stats
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/file-history")
def get_file_history(url: str = Query(..., description="GitHub repo URL"),
                    filename: str = Query(..., description="File path to track"),
                    github_token: str = Query(None, description="GitHub API token (optional)")):
    """
    Get detailed evolution history for a specific file.
    Shows all changes made to the file over time.
    """
    try:
        # Clone repo and get commit history
        path = clone_repo(url)
        commits = get_commit_summary(path)
        
        # Extract owner and repo name from URL
        owner, repo = extract_repo_owner_name(url)
        
        # Build file evolution map
        file_evolution = build_file_evolution(owner, repo, commits, github_token)
        
        # Get history for specific file
        file_history = file_evolution.get(filename, [])
        
        return {
            "repo": url,
            "filename": filename,
            "total_changes": len(file_history),
            "history": file_history
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/project-summary")
def get_project_summary(url: str = Query(..., description="GitHub repo URL")):
    """
    Get an intelligent project summary including description, type, and key features.
    """
    try:
        path = clone_repo(url)
        summary_data = extract_project_summary(path)
        summary_text = generate_project_summary_text(summary_data)
        
        return {
            "repo": url,
            "summary": summary_text,
            "details": summary_data
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/file-roles")
def get_file_roles(url: str = Query(..., description="GitHub repo URL")):
    """
    Get role and purpose analysis for all files in the repository.
    """
    try:
        path = clone_repo(url)
        
        # Get file evolution data to include commit history
        commits = get_commit_summary(path)
        owner, repo = extract_repo_owner_name(url)
        file_evolution = build_file_evolution(owner, repo, commits[:20], None)  # Limit commits for performance
        
        file_roles = {}
        
        # Analyze each file
        for file_path in file_evolution.keys():
            full_path = os.path.join(path, file_path)
            if os.path.exists(full_path):
                file_history = file_evolution.get(file_path, [])
                role_data = analyze_file_role(full_path, file_history)
                file_roles[file_path] = role_data
        
        return {
            "repo": url,
            "total_files_analyzed": len(file_roles),
            "file_roles": file_roles
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/dependencies")
def get_dependency_graph(url: str = Query(..., description="GitHub repo URL")):
    """
    Get dependency graph and file connections for the repository.
    """
    try:
        path = clone_repo(url)
        connections = build_dependency_graph(path)
        mermaid_diagram = generate_mermaid_diagram(connections)
        
        return {
            "repo": url,
            "total_files": len(connections["dependencies"]),
            "total_imports": len(connections["imports"]),
            "total_exports": len(connections["exports"]),
            "dependencies": connections["dependencies"],
            "file_map": connections["file_map"],
            "mermaid_diagram": mermaid_diagram
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/architecture")
def get_architecture_overview(url: str = Query(..., description="GitHub repo URL")):
    """
    Get comprehensive architecture overview including project summary, file roles, and dependencies.
    """
    try:
        path = clone_repo(url)
        
        # Get all the data
        summary_data = extract_project_summary(path)
        summary_text = generate_project_summary_text(summary_data)
        
        connections = build_dependency_graph(path)
        mermaid_diagram = generate_mermaid_diagram(connections)
        
        # Get file roles for key files
        commits = get_commit_summary(path)
        owner, repo = extract_repo_owner_name(url)
        file_evolution = build_file_evolution(owner, repo, commits[:20], None)
        
        key_file_roles = {}
        for file_path in list(connections["dependencies"].keys())[:10]:  # Top 10 files
            full_path = os.path.join(path, file_path)
            if os.path.exists(full_path):
                file_history = file_evolution.get(file_path, [])
                role_data = analyze_file_role(full_path, file_history)
                key_file_roles[file_path] = role_data
        
        return {
            "repo": url,
            "project_summary": summary_text,
            "project_details": summary_data,
            "key_files": key_file_roles,
            "dependency_graph": connections["dependencies"],
            "mermaid_diagram": mermaid_diagram,
            "architecture_stats": {
                "total_files": len(connections["dependencies"]),
                "frontend_files": len([f for f in connections["file_map"].values() if "Component" in f["type"] or "UI" in f["type"]]),
                "backend_files": len([f for f in connections["file_map"].values() if "API" in f["type"] or "Logic" in f["type"]]),
                "total_imports": len(connections["imports"]),
                "total_exports": len(connections["exports"])
            }
        }
    except Exception as e:
        return {"error": str(e)}

  
