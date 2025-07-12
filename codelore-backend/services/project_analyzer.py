import os
import json
import re
from typing import Dict, List, Optional
from pathlib import Path

def extract_project_summary(repo_path: str) -> Dict:
    """
    Generate a project summary by analyzing README, package.json, folder structure, and commits.
    """
    summary_data = {
        "description": "",
        "type": "unknown",
        "key_features": [],
        "tech_stack": [],
        "structure": {}
    }
    
    # Try to get description from package.json
    package_json_path = os.path.join(repo_path, "package.json")
    if os.path.exists(package_json_path):
        try:
            with open(package_json_path, 'r', encoding='utf-8') as f:
                package_data = json.load(f)
                summary_data["description"] = package_data.get("description", "")
                summary_data["type"] = "Node.js/JavaScript"
                if "dependencies" in package_data:
                    summary_data["tech_stack"].extend(list(package_data["dependencies"].keys())[:5])
        except:
            pass
    
    # Try to get description from README
    readme_paths = [
        os.path.join(repo_path, "README.md"),
        os.path.join(repo_path, "readme.md"),
        os.path.join(repo_path, "README.txt")
    ]
    
    for readme_path in readme_paths:
        if os.path.exists(readme_path):
            try:
                with open(readme_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Extract first paragraph or first few lines
                    lines = content.split('\n')
                    for line in lines[:10]:
                        line = line.strip()
                        if line and not line.startswith('#') and not line.startswith('['):
                            summary_data["description"] = line[:200]  # First 200 chars
                            break
                    break
            except:
                pass
    
    # Analyze folder structure
    structure = analyze_folder_structure(repo_path)
    summary_data["structure"] = structure
    
    # Infer project type from structure
    if not summary_data["type"] or summary_data["type"] == "unknown":
        summary_data["type"] = infer_project_type(structure)
    
    # Generate key features from structure
    summary_data["key_features"] = infer_key_features(structure)
    
    return summary_data

def analyze_folder_structure(repo_path: str) -> Dict:
    """
    Analyze the folder structure to understand project organization.
    """
    structure = {
        "frontend": [],
        "backend": [],
        "config": [],
        "docs": [],
        "tests": [],
        "other": []
    }
    
    for root, dirs, files in os.walk(repo_path):
        # Skip hidden directories and common exclusions
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'venv']]
        
        rel_path = os.path.relpath(root, repo_path)
        if rel_path == '.':
            continue
            
        for file in files:
            if file.startswith('.'):
                continue
                
            file_path = os.path.join(rel_path, file)
            
            # Categorize files
            if any(ext in file.lower() for ext in ['.jsx', '.tsx', '.js', '.ts', '.vue', '.svelte']):
                if any(folder in rel_path.lower() for folder in ['src', 'app', 'components', 'pages']):
                    structure["frontend"].append(file_path)
                else:
                    structure["backend"].append(file_path)
            elif any(ext in file.lower() for ext in ['.py', '.java', '.go', '.rb', '.php']):
                structure["backend"].append(file_path)
            elif any(ext in file.lower() for ext in ['.json', '.yaml', '.yml', '.toml', '.env']):
                structure["config"].append(file_path)
            elif any(ext in file.lower() for ext in ['.md', '.txt', '.rst']):
                structure["docs"].append(file_path)
            elif any(ext in file.lower() for ext in ['.test.', '.spec.', 'test_']):
                structure["tests"].append(file_path)
            else:
                structure["other"].append(file_path)
    
    return structure

def infer_project_type(structure: Dict) -> str:
    """
    Infer project type from folder structure.
    """
    if structure["frontend"] and structure["backend"]:
        return "Full-stack application"
    elif structure["frontend"]:
        return "Frontend application"
    elif structure["backend"]:
        return "Backend application"
    elif structure["config"]:
        return "Configuration/Infrastructure"
    else:
        return "Documentation/Other"

def infer_key_features(structure: Dict) -> List[str]:
    """
    Infer key features from folder structure.
    """
    features = []
    
    # Check for common patterns
    frontend_files = [f.lower() for f in structure["frontend"]]
    backend_files = [f.lower() for f in structure["backend"]]
    
    if any('auth' in f for f in frontend_files + backend_files):
        features.append("User Authentication")
    
    if any('api' in f for f in backend_files):
        features.append("REST API")
    
    if any('db' in f or 'model' in f for f in backend_files):
        features.append("Database Integration")
    
    if any('test' in f for f in structure["tests"]):
        features.append("Testing")
    
    if any('docker' in f for f in structure["config"]):
        features.append("Containerization")
    
    if len(structure["frontend"]) > 5:
        features.append("Rich UI Components")
    
    if len(structure["backend"]) > 5:
        features.append("Complex Backend Logic")
    
    return features[:5]  # Limit to top 5 features

def generate_project_summary_text(summary_data: Dict) -> str:
    """
    Generate a human-readable project summary.
    """
    project_type = summary_data["type"]
    features = summary_data["key_features"]
    
    if summary_data["description"]:
        base_desc = summary_data["description"]
    else:
        base_desc = f"This is a {project_type.lower()}"
    
    if features:
        feature_text = ", ".join(features[:-1]) + f" and {features[-1]}" if len(features) > 1 else features[0]
        return f"{base_desc} that includes {feature_text}."
    else:
        return f"{base_desc}." 