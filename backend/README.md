# DSA Search Engine - Backend API

This is the backend service for the DSA based search engine, built with **Python**, **FastAPI**, and **Meilisearch**.

## Features
- 🚀 Blazing fast search capabilities powered by Meilisearch.
- 🌱 Automatically seeds initial dummy DSA problem data on startup.
- 🔍 Advanced filtering by platform, difficulty, and tags.
- 📖 Auto-generated Swagger interactive API documentation.

## Prerequisites
- Python 3.8+
- Docker (to run the Meilisearch database instance)

## Setup and Installation

1. **Install Python Dependencies**
   Navigate to the `backend` directory and install the required packages. (Consider using a virtual environment):
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**
   Copy the provided example environment file and configure your keys:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your secure `MEILI_MASTER_KEY` and ensure `MEILI_URL` points to your Meilisearch instance. *(Note: Meilisearch requires the master key to be at least 16 bytes).* Also, configure your `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `JWT_SECRET`, `FRONTEND_URL`, and `ADMIN_EMAILS` for OAuth, authentication, and RBAC functionality.

3. **Start Meilisearch (via Docker)**
   Run the following command to start a local Meilisearch instance. Ensure the master key matches the one in your `.env` file:
   ```bash
   docker run -it --rm \
     -p 7700:7700 \
     -v "$(pwd)/meili_data:/meili_data" \
     -e MEILI_MASTER_KEY="your_super_secret_master_key_here" \
     getmeili/meilisearch:v1.7
   ```

4. **Run the FastAPI Server**
   Start the backend development server using Uvicorn:
   ```bash
   uvicorn main:app --reload
   ```
   Upon startup, the server will automatically connect to Meilisearch, create/configure the `dsa_problems` index, and seed it with dummy data.

## API Endpoints

- **`GET /`** - Health check and welcome message.
- **`GET /search`** - Main search endpoint.
  - **Query Parameters:**
    - `q` (string): The main search query string.
    - `limit` (int): Maximum number of results to return (default: 20).
    - `offset` (int): Number of results to skip for pagination (default: 0).
    - `platform` (string): Filter by platform (e.g., `LeetCode`, `Codeforces`).
    - `difficulty` (string): Filter by difficulty (e.g., `High`, `Medium`).
    - `tag` (string): Filter by a specific topic tag (e.g., `dynamic programming`).
- **`GET /auth/login`** - Initiates the Google OAuth 2.0 flow.
- **`GET /auth/callback`** - Handles the callback from Google OAuth 2.0 and returns user info.

## Interactive API Documentation
Once the server is running, navigate to http://127.0.0.1:8000/docs in your browser to access the interactive Swagger UI. You can test all search queries and filters directly from this interface!