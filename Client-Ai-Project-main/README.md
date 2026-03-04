# 🚀 AI Planet: The Ultimate No-Code LLM Workflow Builder

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Deployment-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![ChromaDB](https://img.shields.io/badge/Vector%20DB-ChromaDB-FF6F00?style=for-the-badge&logo=chromadb&logoColor=white)](https://www.trychroma.com/)
[![Gemini](https://img.shields.io/badge/LLM-Google%20Gemini-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://deepmind.google/technologies/gemini/)

**AI Planet** is a state-of-the-art, visual **No-Code LLM Workflow Builder**. It empowers non-technical users and developers alike to design, deploy, and execute sophisticated LLM workflows through a seamless drag-and-drop interface. By integrating **Retrieval-Augmented Generation (RAG)** directly into our node-based canvas, AI Planet bridges the gap between static documents and dynamic AI intelligence.

---

## 🌟 Key Features

| Feature | Description |
| :--- | :--- |
| **Visual Workflow Builder** | Use `@xyflow/react` to design complex LLM chains using an intuitive canvas. |
| **Integrated RAG Pipeline** | Effortlessly upload PDFs and transform them into searchable semantic embeddings automatically. |
| **Real-time Streaming** | Experience lightning-fast responses with Server-Sent Events (SSE) for token-by-token LLM generation. |
| **Modular Node Architecture** | Mix and match input, processing, and output nodes to build context-aware AI agents. |
| **Persistence Layer** | Save and reload your workflow topologies and chat histories securely in PostgreSQL. |
| **Docker-First Design** | One-command setup for the entire stack (FastAPI, React, PostgreSQL, ChromaDB). |

---

## 🏗️ Architecture Insight

AI Planet utilizes a decoupled, high-performance architecture designed for scalability and ease of use.

### 🧬 Core Components
1.  **React Frontend (SPA)**: Built with **Vite**, **Tailwind CSS**, and **Zustand**. It provides a rich, responsive UI for graph construction and real-time chat.
2.  **FastAPI Backend**: A production-grade Python server that orchestrates the execution of graph-based logic and handles heavy PDF processing.
3.  **Vector Store (ChromaDB)**: A dedicated high-dimensional database that stores document embeddings and performs sub-second semantic retrieval.
4.  **Relational DB (PostgreSQL)**: Manages metadata, persistent workflow configurations, and chat logs.

> [!TIP]
> Refer to [HLD.md](./HLD.md) and [LLD.md](./LLD.md) for more technical details on the system design and class interactions.

---

## 🛠️ Technical Stack

- **Frontend core**: `React 19`, `Typescript`, `Vite`
- **Visualization**: `@xyflow/react` (React Flow)
- **Styling & Animation**: `Tailwind CSS v4`, `Framer Motion`, `Lucide React`
- **Backend framework**: `FastAPI` (Python 3.11+)
- **ORM & Database**: `SQLAlchemy`, `PostgreSQL 15`
- **Vector Intelligence**: `ChromaDB`, `Google Gemini Embedding (gemini-embedding-001)`
- **LLM Orchestration**: `Google Gemini SDK (gemini-1.5-flash)`
- **Document Processing**: `PyMuPDF` (for extraction), custom recursive chunking logic

---

## 🚀 Quick Start Guide

Ready to build your first AI agent? Follow these steps to get AI Planet running locally in minutes.

### 1. Prerequisites
Ensure you have the following installed:
- ✅ **Docker & Docker Compose**
- ✅ **Google Gemini API Key** ([Get it here](https://aistudio.google.com/app/apikey))

### 2. Configure Environment
Create a `.env` file in the project root:
```bash
# Root directory .env
GEMINI_API_KEY=your_api_key_goes_here
```

### 3. Launch with Docker
Run the following command to build and start all four services:
```bash
docker-compose up --build
```
*Wait for the containers to initialize. The first build may take a few minutes as it pulls the base images and installs dependencies.*

### 4. Access URLs
- 🎨 **Workflow Canvas**: [http://localhost:3000](http://localhost:3000)
- 📡 **Backend API (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 📊 **ChromaDB API**: [http://localhost:8001](http://localhost:8001)

---

## 🧩 Exploring the Workflow Nodes

### 1. 📥 User Query Node
The entry point of your workflow. It captures the user's input/question that drives the LLM's response generation.

### 2. 📂 Knowledge Base Node
Connects your workflow to the RAG pipeline. It retrieves the most relevant semantic context from your uploaded PDF documents stored in ChromaDB.

### 3. ⚙️ LLM Engine Node (Gemini)
The brains of the operation. It receives inputs from the Knowledge Base and User Query, applies a system prompt, and calls the Gemini API to generate a reasoned response.

### 4. 📤 Output Node
Displays the final synthesized response to the user. Supports full markdown rendering for better readability of code blocks, tables, and lists.

---

## 🔍 Troubleshooting & FAQ

**Q: My PDF isn't uploading?**  
A: Check the backend logs (`docker-compose logs backend`). Ensure your PDF is not password-protected and is within a reasonable file size (recommended < 10MB for rapid embedding).

**Q: "Internal Server Error" on LLM execution?**  
A: Most likely an invalid or expired `GEMINI_API_KEY`. Verify your `.env` file and ensure there are no trailing spaces after the key.

**Q: How do I clear the vector database?**  
A: To completely reset all data including embeddings and PostgreSQL metadata, run:
```bash
docker-compose down -v
```

---

## 🔮 Future Roadmap
- [ ] **Multi-Model Support**: Integration with OpenAI (GPT-4), Anthropic (Claude), and local Ollama instances.
- [ ] **Custom Node Creation**: An interface for developers to write custom Python snippets that behave as nodes.
- [ ] **Advanced Edge Logic**: Conditional branching (If/Else nodes) for complex decision making.
- [ ] **Workflow Export/Import**: Export workflows as JSON files for sharing and version control.

---

## 🤝 Contributing
We welcome contributions! Please fork the repository and submit a pull request with your enhancements. For major changes, please open an issue first to discuss what you'd like to change.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
