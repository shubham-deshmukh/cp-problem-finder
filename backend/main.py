from contextlib import asynccontextmanager
from fastapi import FastAPI, Query
import meilisearch
from meilisearch.errors import MeilisearchCommunicationError
from typing import Optional, List
import logging
import os
from dotenv import load_dotenv
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# 1. Initialize Meilisearch Client
MEILI_URL = os.getenv("MEILI_URL", "http://127.0.0.1:7700")
MEILI_MASTER_KEY = os.getenv("MEILI_MASTER_KEY", "")
INDEX_NAME = os.getenv("INDEX_NAME", "dsa_problems")

client = meilisearch.Client(MEILI_URL, MEILI_MASTER_KEY)

# 2. Convert JS dummy data into Python dictionaries
DUMMY_DATA = [
    {"id": 1, "platform": "LeetCode", "platformIcon": "◼️", "title": "Longest Common Subsequence", "link": "https://leetcode.com/problems/longest-common-subsequence/", "tags": ["dynamic programming", "strings", "greedy", "recursion"], "difficulty": "High"},
    {"id": 2, "platform": "Codeforces", "platformIcon": "📊", "title": "Edit Distance", "link": "https://codeforces.com/problemset/problem/72/E", "tags": ["dynamic programming", "graphs", "graphs"], "difficulty": "High"},
    {"id": 3, "platform": "AtCoder", "platformIcon": "🐜", "title": "Traveling Salesman", "link": "https://atcoder.jp/contests/abc/tasks/abc_tsp", "tags": ["dynamic programming", "strings", "greedy"], "difficulty": "Medium"},
    {"id": 4, "platform": "CodeChef", "platformIcon": "🍳", "title": "Longest Connection", "link": "https://www.codechef.com/problems/LONGC", "tags": ["dynamic programming", "graphs", "greedy"], "difficulty": "High"},
    {"id": 5, "platform": "CodeChef", "platformIcon": "🍳", "title": "Traveling Pattern", "link": "https://www.codechef.com/problems/TRVPAT", "tags": ["dynamic programming", "greedy", "recursion", "recursion"], "difficulty": "High"},
    {"id": 6, "platform": "Codeforces", "platformIcon": "📊", "title": "Longest Subsequence", "link": "https://codeforces.com/problemset/problem/12/LS", "tags": ["dynamic programming", "greedy", "recursion", "graphs"], "difficulty": "High"},
    {"id": 7, "platform": "CodeChef", "platformIcon": "🍳", "title": "Monestriatic Function", "link": "https://www.codechef.com/problems/MONFUNC", "tags": ["dynamic programming", "strings", "greedy"], "difficulty": "High"},
    {"id": 8, "platform": "CodeChef", "platformIcon": "🍳", "title": "Traveling Salesman", "link": "https://www.codechef.com/problems/TSP", "tags": ["dynamic programming", "greedy", "recursion", "graphs"], "difficulty": "High"},
    {"id": 9, "platform": "CSES", "platformIcon": "🔷", "title": "Longest Common Subsequence", "link": "https://cses.fi/problemset/task/1234", "tags": ["dynamic programming", "strings", "greedy", "recursion"], "difficulty": "High"},
    {"id": 10, "platform": "CSES", "platformIcon": "🔷", "title": "leetcode.com/problems/...65561/...", "link": "https://cses.fi/problemset/task/5678", "tags": ["dynamic programming", "recursion", "greedy", "recursion"], "difficulty": "Medium", "isNew": True},
]

# Pydantic model for request validation
class Problem(BaseModel):
    id: int
    platform: str
    platformIcon: str
    title: str
    link: str
    tags: List[str]
    difficulty: str
    isNew: Optional[bool] = False

# 3. Define Startup Logic using Lifespan Context
@asynccontextmanager
async def lifespan(app: FastAPI):
    # This block runs when the server starts.
    # We initialize the index, upload the data, and configure filterable attributes.
    try:
        index = client.index(INDEX_NAME)
        
        # Add documents to Meilisearch
        index.add_documents(DUMMY_DATA)
        
        # Configure Meilisearch settings
        # Searchable attributes dictate what fields Meilisearch looks at when querying
        index.update_searchable_attributes(["title", "tags", "platform"])
        
        # Filterable attributes must be explicitly defined in Meilisearch to use them in WHERE-like clauses
        index.update_filterable_attributes(["platform", "difficulty", "tags", "isNew"])
        logger.info("Successfully connected to Meilisearch and initialized the index.")
    except MeilisearchCommunicationError:
        logger.error(f"Failed to connect to Meilisearch at {MEILI_URL}. Please ensure the server is running.")
    
    yield # The server runs and handles requests here
    
    # Any cleanup code would go here when the server shuts down

# Initialize FastAPI App
app = FastAPI(title="DSA Search Engine API", lifespan=lifespan)

# 4. Define API Endpoints
@app.get("/")
def read_root():
    return {"message": "DSA Search Engine API is running. Visit /docs for Swagger UI."}

@app.get("/search")
def search_problems(
    q: str = Query("", description="The main search query string"),
    limit: int = Query(20, description="Max results to return"),
    offset: int = Query(0, description="Number of results to skip"),
    platform: Optional[str] = Query(None, description="Filter by platform (e.g., LeetCode)"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty (e.g., High)"),
    tag: Optional[str] = Query(None, description="Filter by a specific tag")
):
    """
    Search for DSA problems with optional faceting/filtering.
    """
    # Construct the filter string for Meilisearch
    filter_conditions = []
    
    if platform:
        filter_conditions.append(f"platform = '{platform}'")
    if difficulty:
        filter_conditions.append(f"difficulty = '{difficulty}'")
    if tag:
        filter_conditions.append(f"tags = '{tag}'")
    
    # Build search parameters
    search_params = {
        "limit": limit,
        "offset": offset,
    }
    
    # Meilisearch expects filters as a list of strings for AND logic, 
    # or a single formatted string. A list of strings equates to AND.
    if filter_conditions:
        search_params["filter"] = filter_conditions

    # Perform the search
    index = client.index(INDEX_NAME)
    search_results = index.search(q, search_params)
    
    return search_results

@app.post("/problems", status_code=201)
def add_problem(problem: Problem):
    """
    Add a new DSA problem to the search index.
    """
    try:
        index = client.index(INDEX_NAME)
        # Add document to Meilisearch (updates if id already exists)
        response = index.add_documents([problem.dict()])
        return {"message": "Problem added successfully", "task_uid": response.task_uid}
    except MeilisearchCommunicationError:
        logger.error("Failed to connect to Meilisearch while adding a problem.")
        return {"error": "Database connection failed"}
