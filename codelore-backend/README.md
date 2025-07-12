# CodeLore Backend

FastAPI backend for analyzing GitHub repositories and parsing commit history.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
uvicorn main:app --reload
```

## Endpoints

- `GET /` - Health check
- `GET /analyze?url=<github_repo_url>` - Analyze a GitHub repository

## Example Usage

```bash
curl "http://localhost:8000/analyze?url=https://github.com/tiangolo/fastapi"
```

This will return the first 10 commits with author, message, date, and modified files.

## Features

- Clone GitHub repositories locally
- Parse commit history using pydriller
- Extract commit metadata (hash, message, author, date, files)
- RESTful API interface 