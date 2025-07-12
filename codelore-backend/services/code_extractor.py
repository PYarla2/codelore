import ast

def extract_python_symbols(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        source = f.read()

    try:
        tree = ast.parse(source)
    except SyntaxError:
        return []

    results = []

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            results.append({
                "type": "function" if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) else "class",
                "name": node.name,
                "start_line": node.lineno,
                "docstring": ast.get_docstring(node),
                "code": ast.get_source_segment(source, node),
            })

    return results 