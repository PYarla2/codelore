# CodeLore

Welcome to CodeLore! This is a tool I built to help myself (and hopefully you) make sense of big, messy, or unfamiliar GitHub repositories. It analyzes a repo and gives you a visual, interactive story of how the codebase evolved, what each file does, and how everything fits together.

---

## Why CodeLore?

I was tired of joining new projects and spending hours (or days) just figuring out what files mattered, what changed when, and how the pieces connected. So I made CodeLore to automate that detective work. It’s especially handy for open source, onboarding, or refactoring.

---

## What It Does

- **Project Summary:** Pulls together a high-level summary from the README, package.json, and commit history. You get a quick sense of what the repo is about.
- **File Timeline:** Tracks every file’s changes over time—who changed what, when, and why. You can see which files are stable and which are a hot mess.
- **File Roles:** Tries to guess what each file is for (API, UI, model, config, etc.) based on its name, folder, and code. Not perfect, but surprisingly useful.
- **Dependency Graph:** Maps out which files depend on which, and draws it as a graph (using Mermaid.js). Great for spotting tangled code or key modules.
- **File Details:** Click any file to see its summary, history, connections, and more.
- **Search & Filter:** Quickly find files by name or role. No more endless scrolling.
- **Export:** Download a Markdown summary of the project and files for sharing or docs.

---

## How to Use It

1. **Clone this repo and install dependencies:**

   ```bash
   git clone <your-fork-or-this-repo>
   cd codelore-backend
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # or: source venv/bin/activate  # On Mac/Linux
   pip install -r requirements.txt
   cd ../codelore-frontend
   npm install
   ```

2. **Set your OpenAI API key (for summaries):**
   - On Windows (CMD):
     ```
     set OPENAI_API_KEY=your-openai-api-key
     ```
   - On Mac/Linux:
     ```
     export OPENAI_API_KEY=your-openai-api-key
     ```

3. **Start the backend:**
   ```bash
   cd codelore-backend
   python main.py
   # or for auto-reload:
   uvicorn main:app --reload
   ```

4. **Start the frontend:**
   ```bash
   cd codelore-frontend
   npm start
   ```

5. **Open your browser to [http://localhost:3000](http://localhost:3000)**

6. **Paste in a GitHub repo URL and hit Analyze.**

---

## Real-World Tips

- Works best on public repos. For private ones, you’ll need to add a GitHub token (not yet in the UI, but you can hack it in the backend).
- If you see “No files found,” try setting the filter to “All” or check the backend logs for errors.
- The dependency graph can get wild on huge repos—try zooming or filtering.
- Summaries are as good as the code and commit messages. Garbage in, garbage out!
- If you break something, just delete the `cloned_repos` folder and try again.

---

## Tech Stack (because you’ll ask)

- **Backend:** Python, FastAPI, GitPython, OpenAI (for summaries), Mermaid.js (for diagrams)
- **Frontend:** React, TypeScript, Tailwind CSS, Mermaid.js

---

## Contributing

PRs welcome! If you have ideas, bug reports, or want to make it prettier, open an issue or send a pull request. I built this for myself but would love to see it help others.

---

## License

MIT. Use it, fork it, break it, fix it. Just don’t blame me if it tells you your code is a mess. 😉