import os
import re
from typing import Dict, List, Set, Tuple
from pathlib import Path

def build_dependency_graph(repo_path: str) -> Dict:
    """
    Build a dependency graph showing how files are connected.
    """
    connections = {
        "imports": [],
        "exports": [],
        "dependencies": {},
        "file_map": {}
    }
    
    # Get all code files
    code_files = get_code_files(repo_path)
    
    for file_path in code_files:
        file_ext = Path(file_path).suffix.lower()
        full_path = os.path.join(repo_path, file_path)
        
        if os.path.exists(full_path):
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                # Extract imports
                imports = extract_imports(content, file_ext, repo_path)
                connections["imports"].extend(imports)
                
                # Extract exports
                exports = extract_exports(content, file_ext)
                connections["exports"].extend(exports)
                
                # Build dependency map
                connections["dependencies"][file_path] = {
                    "imports": imports,
                    "exports": exports,
                    "imported_by": []
                }
                
                # Build file map for easy lookup
                connections["file_map"][file_path] = {
                    "path": file_path,
                    "type": categorize_file_type(file_path),
                    "size": len(content.split('\n'))
                }
                
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
    
    # Build reverse dependencies (who imports what)
    build_reverse_dependencies(connections)
    
    return connections

def get_code_files(repo_path: str) -> List[str]:
    """
    Get all code files in the repository.
    """
    code_files = []
    
    for root, dirs, files in os.walk(repo_path):
        # Skip hidden directories and common exclusions
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'venv', '.git']]
        
        for file in files:
            if file.startswith('.'):
                continue
                
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, repo_path)
            
            # Only include code files
            if is_code_file(file):
                code_files.append(rel_path.replace('\\', '/'))  # Normalize path separators
    
    return code_files

def is_code_file(filename: str) -> bool:
    """
    Check if a file is a code file.
    """
    code_extensions = {
        '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',  # JavaScript/TypeScript
        '.py', '.pyx', '.pyi',  # Python
        '.java', '.kt',  # Java/Kotlin
        '.go',  # Go
        '.rb',  # Ruby
        '.php',  # PHP
        '.cs',  # C#
        '.cpp', '.cc', '.cxx', '.h', '.hpp',  # C/C++
        '.rs',  # Rust
        '.swift',  # Swift
        '.scala',  # Scala
    }
    
    return Path(filename).suffix.lower() in code_extensions

def extract_imports(content: str, file_ext: str, repo_path: str) -> List[Dict]:
    """
    Extract import statements from file content.
    """
    imports = []
    
    if file_ext in ['.js', '.jsx', '.ts', '.tsx']:
        # JavaScript/TypeScript imports
        import_patterns = [
            r'import\s+(?:\{[^}]*\}|\*\s+as\s+(\w+)|\w+)\s+from\s+[\'"]([^\'"]+)[\'"]',
            r'require\s*\(\s*[\'"]([^\'"]+)[\'"]',
            r'import\s+[\'"]([^\'"]+)[\'"]'
        ]
        
        for pattern in import_patterns:
            matches = re.findall(pattern, content)
            for match in matches:
                if isinstance(match, tuple):
                    module_name = match[1] if len(match) > 1 else match[0]
                else:
                    module_name = match
                
                if module_name and not module_name.startswith('.'):
                    # External dependency
                    imports.append({
                        "type": "external",
                        "module": module_name,
                        "source": "unknown"
                    })
                elif module_name and module_name.startswith('.'):
                    # Internal dependency
                    imports.append({
                        "type": "internal",
                        "module": module_name,
                        "source": "relative"
                    })
    
    elif file_ext == '.py':
        # Python imports
        import_patterns = [
            r'from\s+([a-zA-Z_][a-zA-Z0-9_.]*)\s+import',
            r'import\s+([a-zA-Z_][a-zA-Z0-9_.]*)',
            r'from\s+\.([a-zA-Z_][a-zA-Z0-9_.]*)\s+import'
        ]
        
        for pattern in import_patterns:
            matches = re.findall(pattern, content)
            for match in matches:
                if match and not match.startswith('.'):
                    # External dependency
                    imports.append({
                        "type": "external",
                        "module": match,
                        "source": "unknown"
                    })
                elif match and match.startswith('.'):
                    # Internal dependency
                    imports.append({
                        "type": "internal",
                        "module": match,
                        "source": "relative"
                    })
    
    return imports

def extract_exports(content: str, file_ext: str) -> List[str]:
    """
    Extract export statements from file content.
    """
    exports = []
    
    if file_ext in ['.js', '.jsx', '.ts', '.tsx']:
        # JavaScript/TypeScript exports
        export_patterns = [
            r'export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)',
            r'export\s+\{([^}]+)\}',
            r'export\s+default\s+(\w+)'
        ]
        
        for pattern in export_patterns:
            matches = re.findall(pattern, content)
            for match in matches:
                if ',' in match:
                    # Multiple exports
                    items = [item.strip() for item in match.split(',')]
                    exports.extend(items)
                else:
                    exports.append(match.strip())
    
    elif file_ext == '.py':
        # Python doesn't have explicit exports, but we can look for class/function definitions
        # that might be imported by other modules
        export_patterns = [
            r'class\s+(\w+)',
            r'def\s+(\w+)'
        ]
        
        for pattern in export_patterns:
            matches = re.findall(pattern, content)
            exports.extend(matches)
    
    return [exp for exp in exports if exp]  # Filter out empty strings

def categorize_file_type(file_path: str) -> str:
    """
    Categorize file type based on path and extension.
    """
    path_lower = file_path.lower()
    
    if any(ext in path_lower for ext in ['.jsx', '.tsx']):
        return "React Component"
    elif any(ext in path_lower for ext in ['.js', '.ts']):
        if any(folder in path_lower for folder in ['components', 'pages', 'views']):
            return "UI Component"
        elif any(folder in path_lower for folder in ['api', 'routes', 'controllers']):
            return "API Handler"
        elif any(folder in path_lower for folder in ['utils', 'helpers', 'services']):
            return "Utility/Service"
        else:
            return "JavaScript/TypeScript"
    elif path_lower.endswith('.py'):
        if any(folder in path_lower for folder in ['api', 'routes', 'endpoints']):
            return "API Endpoint"
        elif any(folder in path_lower for folder in ['models', 'schemas']):
            return "Data Model"
        elif any(folder in path_lower for folder in ['services', 'business']):
            return "Business Logic"
        else:
            return "Python Module"
    else:
        return "Code File"

def build_reverse_dependencies(connections: Dict):
    """
    Build reverse dependency map (who imports what).
    """
    for file_path, deps in connections["dependencies"].items():
        for import_info in deps["imports"]:
            if import_info["type"] == "internal":
                # Find which files import this one
                for other_file, other_deps in connections["dependencies"].items():
                    if other_file != file_path:
                        # This is a simplified check - in a real implementation,
                        # you'd need to resolve the actual file paths
                        if any(imp["module"] in file_path for imp in other_deps["imports"]):
                            deps["imported_by"].append(other_file)

def generate_mermaid_diagram(connections: Dict, max_nodes: int = 20) -> str:
    """
    Generate a Mermaid.js diagram from the dependency graph.
    """
    # Limit the number of nodes to prevent overwhelming diagrams
    files = list(connections["dependencies"].keys())[:max_nodes]
    
    mermaid_lines = ["graph TD"]
    
    # Add nodes
    for file_path in files:
        file_type = connections["file_map"][file_path]["type"]
        node_id = file_path.replace('/', '_').replace('.', '_').replace('-', '_')
        mermaid_lines.append(f'    {node_id}["{file_path}"]')
    
    # Add edges (imports)
    edge_count = 0
    max_edges = 30  # Limit edges to prevent cluttered diagrams
    
    for file_path in files:
        if edge_count >= max_edges:
            break
            
        deps = connections["dependencies"][file_path]
        source_id = file_path.replace('/', '_').replace('.', '_').replace('-', '_')
        
        for import_info in deps["imports"]:
            if edge_count >= max_edges:
                break
                
            if import_info["type"] == "internal":
                # Try to find the target file
                target_file = find_target_file(import_info["module"], files)
                if target_file:
                    target_id = target_file.replace('/', '_').replace('.', '_').replace('-', '_')
                    mermaid_lines.append(f'    {source_id} --> {target_id}')
                    edge_count += 1
    
    return '\n'.join(mermaid_lines)

def find_target_file(module_path: str, available_files: List[str]) -> str:
    """
    Find the actual file path for a module import.
    This is a simplified implementation.
    """
    # Remove leading dots and file extensions
    clean_module = module_path.lstrip('.').replace('.js', '').replace('.py', '')
    
    # Look for matching files
    for file_path in available_files:
        if clean_module in file_path or file_path.endswith(f'/{clean_module}.js') or file_path.endswith(f'/{clean_module}.py'):
            return file_path
    
    return None 