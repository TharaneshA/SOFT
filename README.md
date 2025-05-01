# SOFT

## Prerequisites

- **Node.js** (v16+ recommended)
- **Rust** (for Tauri backend)
- **Python 3.8+** (for embedding)
- **sentence-transformers** Python library
- **Qdrant** (vector database, recommended via Docker)
- **pnpm** (or npm/yarn)
- **Docker** (for Qdrant, optional but recommended)

## Setup Instructions

### 1. Install Node.js, Rust, and Python
- Download and install [Node.js](https://nodejs.org/)
- Install Rust: https://www.rust-lang.org/tools/install
- Install Python: https://www.python.org/downloads/

### 2. Install Qdrant (Vector Database)
- **Recommended (Docker):**
  ```sh
  docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
  ```
- Or see [Qdrant docs](https://qdrant.tech/documentation/) for other install options.

### 3. Install Python Dependencies
- Open a terminal and run:
  ```sh
  pip install sentence-transformers
  ```

### 4. Install Node.js Dependencies
- In the project root:
  ```sh
  pnpm install
  # or
  npm install
  ```

### 5. Install Rust Dependencies
- In the `src-tauri` directory:
  ```sh
  cargo build
  ```

### 6. Run the App (Development)
- Start Qdrant (see step 2)
- In the project root:
  ```sh
  pnpm run dev
  # or
  npm run dev
  ```
- In another terminal, run Tauri dev:
  ```sh
  cd src-tauri
  cargo tauri dev
  ```

### 7. Build a Native App (Windows/macOS/Linux)
- In the project root:
  ```sh
  pnpm run build
  # or
  npm run build
  ```
- Then package with Tauri:
  ```sh
  cd src-tauri
  cargo tauri build
  ```
- The packaged app (.exe, .app, etc.) will be in `src-tauri/target/release/bundle/`.

## Notes
- Ensure Qdrant is running before starting the app.
- If you encounter issues with Python or sentence-transformers, check your Python PATH and virtual environment.
- For advanced Tauri configuration, see `tauri.conf.json`.

## Troubleshooting
- Qdrant not found? Make sure Docker is running and the container is started.
- Rust or Node errors? Ensure all prerequisites are installed and up to date.

---

This guide helps you set up, run, and package SOFT as a native desktop application.