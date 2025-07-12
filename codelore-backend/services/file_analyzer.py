import os
import re
from typing import Dict, List, Optional

def analyze_file_role(file_path: str, file_history: List[Dict] = None) -> Dict:
    """
    Analyze a file to determine its role and purpose in the project.
    """
    role_data = {
        "role": "",
        "category": "",
        "complexity": "low",
        "dependencies": [],
        "key_functions": []
    }
    
    filename = os.path.basename(file_path)
    file_ext = os.path.splitext(filename)[1].lower()
    dir_path = os.path.dirname(file_path)
    
    # Determine category based on file extension and location
    role_data["category"] = categorize_file(file_path, file_ext, dir_path)
    
    # Determine role based on filename, path, and history
    role_data["role"] = determine_file_role(filename, dir_path, file_history)
    
    # Analyze complexity and dependencies
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                role_data["complexity"] = assess_complexity(content, file_ext)
                role_data["dependencies"] = extract_dependencies(content, file_ext)
                role_data["key_functions"] = extract_key_functions(content, file_ext)
        except:
            pass
    
    return role_data

def categorize_file(file_path: str, file_ext: str, dir_path: str) -> str:
    """
    Categorize file based on extension and directory structure.
    """
    # Frontend files
    if file_ext in ['.jsx', '.tsx', '.js', '.ts', '.vue', '.svelte']:
        if any(folder in dir_path.lower() for folder in ['components', 'pages', 'views', 'ui']):
            return "UI Component"
        elif any(folder in dir_path.lower() for folder in ['hooks', 'utils', 'helpers']):
            return "Frontend Utility"
        elif any(folder in dir_path.lower() for folder in ['store', 'state', 'redux']):
            return "State Management"
        else:
            return "Frontend Logic"
    
    # Backend files
    elif file_ext in ['.py']:
        if any(folder in dir_path.lower() for folder in ['api', 'routes', 'endpoints']):
            return "API Endpoint"
        elif any(folder in dir_path.lower() for folder in ['models', 'schemas']):
            return "Data Model"
        elif any(folder in dir_path.lower() for folder in ['services', 'business']):
            return "Business Logic"
        elif any(folder in dir_path.lower() for folder in ['utils', 'helpers']):
            return "Backend Utility"
        else:
            return "Backend Logic"
    
    # Configuration files
    elif file_ext in ['.json', '.yaml', '.yml', '.toml', '.env']:
        return "Configuration"
    
    # Documentation
    elif file_ext in ['.md', '.txt', '.rst']:
        return "Documentation"
    
    # Tests
    elif any(test_indicator in file_path.lower() for test_indicator in ['test_', '.test.', '.spec.']):
        return "Test"
    
    # Styles
    elif file_ext in ['.css', '.scss', '.sass', '.less']:
        return "Styling"
    
    else:
        return "Other"

def determine_file_role(filename: str, dir_path: str, file_history: List[Dict] = None) -> str:
    """
    Determine the specific role of a file based on its name, path, and history.
    """
    filename_lower = filename.lower()
    dir_path_lower = dir_path.lower()
    
    # Authentication related
    if any(auth_term in filename_lower for auth_term in ['auth', 'login', 'register', 'jwt', 'token']):
        return "Handles user authentication and authorization"
    
    # Database related
    if any(db_term in filename_lower for db_term in ['model', 'schema', 'database', 'db', 'orm']):
        return "Defines data models and database schema"
    
    # API related
    if any(api_term in filename_lower for api_term in ['api', 'route', 'endpoint', 'controller']):
        return "Exposes API endpoints and handles requests"
    
    # UI Components
    if any(ui_term in filename_lower for ui_term in ['button', 'form', 'modal', 'card', 'header', 'footer']):
        return "Renders UI component for user interaction"
    
    # Configuration
    if any(config_term in filename_lower for config_term in ['config', 'settings', 'env']):
        return "Manages application configuration and settings"
    
    # Utilities
    if any(util_term in filename_lower for util_term in ['util', 'helper', 'common', 'shared']):
        return "Provides utility functions and shared logic"
    
    # State management
    if any(state_term in filename_lower for state_term in ['store', 'state', 'redux', 'context']):
        return "Manages application state and data flow"
    
    # Testing
    if any(test_term in filename_lower for test_term in ['test', 'spec']):
        return "Contains tests for application functionality"
    
    # Documentation
    if any(doc_term in filename_lower for doc_term in ['readme', 'docs', 'guide']):
        return "Provides documentation and usage instructions"
    
    # Check directory-based patterns
    if 'auth' in dir_path_lower:
        return "Handles authentication and user management"
    elif 'api' in dir_path_lower:
        return "Exposes REST API endpoints"
    elif 'components' in dir_path_lower:
        return "Renders reusable UI components"
    elif 'pages' in dir_path_lower:
        return "Defines application pages and views"
    elif 'services' in dir_path_lower:
        return "Contains business logic and external service integrations"
    elif 'utils' in dir_path_lower:
        return "Provides utility functions and helpers"
    
    # Check commit history for clues
    if file_history:
        first_commit = file_history[0] if file_history else None
        if first_commit and 'message' in first_commit:
            commit_msg = first_commit['message'].lower()
            if any(term in commit_msg for term in ['add auth', 'login', 'authentication']):
                return "Handles user authentication"
            elif any(term in commit_msg for term in ['add api', 'endpoint', 'route']):
                return "Exposes API functionality"
            elif any(term in commit_msg for term in ['add component', 'ui', 'interface']):
                return "Renders user interface elements"
    
    # Default based on category
    return "Contains application logic and functionality"

def assess_complexity(content: str, file_ext: str) -> str:
    """
    Assess the complexity of a file based on its content.
    """
    lines = content.split('\n')
    non_empty_lines = [line for line in lines if line.strip()]
    
    if len(non_empty_lines) < 50:
        return "low"
    elif len(non_empty_lines) < 200:
        return "medium"
    else:
        return "high"

def extract_dependencies(content: str, file_ext: str) -> List[str]:
    """
    Extract dependencies from file content.
    """
    dependencies = []
    
    if file_ext in ['.js', '.jsx', '.ts', '.tsx']:
        # JavaScript/TypeScript imports
        import_pattern = r'import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+[\'"]([^\'"]+)[\'"]'
        matches = re.findall(import_pattern, content)
        dependencies.extend(matches)
        
        # Require statements
        require_pattern = r'require\s*\(\s*[\'"]([^\'"]+)[\'"]'
        matches = re.findall(require_pattern, content)
        dependencies.extend(matches)
    
    elif file_ext == '.py':
        # Python imports
        import_pattern = r'(?:from|import)\s+([a-zA-Z_][a-zA-Z0-9_.]*)'
        matches = re.findall(import_pattern, content)
        dependencies.extend(matches)
    
    return list(set(dependencies))[:10]  # Limit to 10 unique dependencies

def extract_key_functions(content: str, file_ext: str) -> List[str]:
    """
    Extract key function/class names from file content.
    """
    functions = []
    
    if file_ext in ['.js', '.jsx', '.ts', '.tsx']:
        # JavaScript/TypeScript functions and classes
        function_pattern = r'(?:function|const|let|var)\s+(\w+)\s*[=\(]'
        class_pattern = r'class\s+(\w+)'
        
        func_matches = re.findall(function_pattern, content)
        class_matches = re.findall(class_pattern, content)
        
        functions.extend(func_matches)
        functions.extend(class_matches)
    
    elif file_ext == '.py':
        # Python functions and classes
        function_pattern = r'def\s+(\w+)'
        class_pattern = r'class\s+(\w+)'
        
        func_matches = re.findall(function_pattern, content)
        class_matches = re.findall(class_pattern, content)
        
        functions.extend(func_matches)
        functions.extend(class_matches)
    
    return functions[:5]  # Limit to 5 key functions/classes 