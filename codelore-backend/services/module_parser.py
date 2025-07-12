# services/module_parser.py
import os

def get_directory_tree(base_path, ignore_dirs=None):
    if ignore_dirs is None:
        ignore_dirs = {'.git', '__pycache__', 'node_modules', '.venv'}

    structure = []

    for root, dirs, files in os.walk(base_path):
        # Filter ignored dirs
        dirs[:] = [d for d in dirs if d not in ignore_dirs]

        for file in files:
            rel_path = os.path.relpath(os.path.join(root, file), base_path)
            structure.append({
                "path": rel_path,
                "type": "file",
                "ext": os.path.splitext(file)[1],
            })

    return structure

def detect_modules(file_tree):
    """
    Detect top-level modules in the repository.
    
    Args:
        file_tree (list): List of file dictionaries from get_directory_tree
        
    Returns:
        list: List of module dictionaries with name and file count
    """
    modules = {}
    for file in file_tree:
        path = file["path"]
        top_dir = path.split(os.sep)[0]
        if file["ext"] in [".py", ".js", ".ts", ".java", ".cpp", ".c", ".go", ".rs"]:
            modules.setdefault(top_dir, 0)
            modules[top_dir] += 1
    
    return [{"module": k, "file_count": v} for k, v in modules.items()]
