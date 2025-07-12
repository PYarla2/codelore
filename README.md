# CodeLore 🚀

**Repository Analysis & Storytelling Tool**

CodeLore is an intelligent developer tool that analyzes GitHub repositories to generate interactive storybooks explaining repo evolution, architecture, and logic. It provides deep insights into how codebases evolve over time and how different components interact.

## ✨ Features

### 📊 **File Evolution Timeline**
- Track how files change over time with commit-level details
- Visualize file lifecycle and development patterns
- Understand which files are most actively maintained

### 🏗️ **Architecture Visualization**
- Interactive Mermaid.js dependency graphs
- File relationship mapping and connection analysis
- Visual representation of project structure

### 🎯 **Intelligent File Role Analysis**
- AI-powered file purpose detection
- Automatic categorization (UI, API, Auth, Utils, etc.)
- Smart summaries of each file's function

### 📝 **Project Summary Generation**
- AI-generated project overviews
- Key features and technology stack identification
- Exportable project documentation

### 🔍 **Advanced Search & Filtering**
- Search by filename or path
- Filter by file roles and types
- Real-time filtering and sorting

## 🛠️ Tech Stack

### Backend
- **Python 3.8+** with FastAPI
- **GitPython** for repository analysis
- **OpenAI GPT-4** for intelligent summarization
- **Mermaid.js** for diagram generation

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Mermaid.js** for interactive diagrams
- **Modern React Hooks** for state management

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Backend Setup
```bash
cd codelore-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
export OPENAI_API_KEY="your-openai-api-key"  # Required for AI features

# Start the backend server
python main.py
```

The backend will be available at `http://localhost:8000`

### Frontend Setup
```bash
cd codelore-frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at `http://localhost:3000`

## 📖 Usage

1. **Open CodeLore** in your browser at `http://localhost:3000`
2. **Enter a GitHub repository URL** (e.g., `https://github.com/username/repository`)
3. **Click "Analyze Repository"** and wait for the analysis to complete
4. **Explore the results**:
   - **Timeline**: See file evolution over time
   - **Architecture**: View dependency graphs and file relationships
   - **File Details**: Click on any file for detailed analysis
   - **Search & Filter**: Use the sidebar to find specific files or roles

## 🔧 API Endpoints

### Core Endpoints
- `GET /api/project/summary?url={repo_url}` - Get complete project analysis
- `GET /project-summary?url={repo_url}` - Get project summary only
- `GET /file-roles?url={repo_url}` - Get file role analysis
- `GET /dependencies?url={repo_url}` - Get dependency graph
- `GET /evolution?url={repo_url}` - Get file evolution data

### Analysis Endpoints
- `GET /architecture?url={repo_url}` - Get architecture overview
- `GET /file-history?url={repo_url}&filename={file}` - Get specific file history

## 📁 Project Structure

```
codelore/
├── codelore-backend/          # Python FastAPI backend
│   ├── main.py               # Main application entry point
│   ├── services/             # Analysis services
│   │   ├── git_cloner.py     # Repository cloning
│   │   ├── commit_parser.py  # Git commit analysis
│   │   ├── file_analyzer.py  # File role detection
│   │   ├── dependency_analyzer.py # Dependency mapping
│   │   └── project_analyzer.py # Project summarization
│   └── requirements.txt      # Python dependencies
├── codelore-frontend/        # React TypeScript frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── DashboardPage.tsx      # Main dashboard
│   │   │   ├── FileListSidebar.tsx    # File navigation
│   │   │   ├── ArchitectureGraph.tsx  # Mermaid diagrams
│   │   │   ├── FileDetailView.tsx     # File details
│   │   │   └── SearchAndFilters.tsx   # Search functionality
│   │   └── App.tsx           # Main app component
│   └── package.json          # Node.js dependencies
└── README.md                 # This file
```

## 🎯 Use Cases

### For Developers
- **Onboarding**: Quickly understand new codebases
- **Code Review**: Identify architectural patterns and dependencies
- **Refactoring**: Visualize file relationships before making changes
- **Documentation**: Generate project overviews automatically

### For Teams
- **Knowledge Sharing**: Create visual documentation of project structure
- **Architecture Reviews**: Present dependency graphs and file relationships
- **Project Planning**: Understand codebase evolution patterns

### For Open Source
- **Repository Analysis**: Evaluate project health and activity
- **Contribution Planning**: Identify areas needing attention
- **Documentation**: Generate README files and project summaries

## 🔍 How It Works

1. **Repository Cloning**: Downloads the target repository locally
2. **Git Analysis**: Extracts commit history and file evolution data
3. **Code Parsing**: Analyzes file contents and dependencies
4. **AI Summarization**: Uses GPT-4 to generate intelligent summaries
5. **Visualization**: Creates interactive diagrams and timelines
6. **Data Integration**: Combines all analysis into a unified dashboard

## 🚀 Deployment

### Backend Deployment
```bash
# Using Docker
docker build -t codelore-backend ./codelore-backend
docker run -p 8000:8000 codelore-backend

# Using Python directly
cd codelore-backend
pip install -r requirements.txt
python main.py
```

### Frontend Deployment
```bash
# Build for production
cd codelore-frontend
npm run build

# Deploy to Vercel/Netlify
# The build folder can be deployed to any static hosting service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 API access
- **Mermaid.js** for diagram generation
- **FastAPI** for the backend framework
- **React** and **Tailwind CSS** for the frontend

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/codelore/issues) page
2. Create a new issue with detailed information
3. Include repository URL and error messages if applicable

---

**Made with ❤️ for the developer community**