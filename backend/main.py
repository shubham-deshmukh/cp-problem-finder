from contextlib import asynccontextmanager
import re
import html
import urllib.parse
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import meilisearch
from meilisearch.errors import MeilisearchCommunicationError
from typing import Optional, List
import logging
import os
import time
from dotenv import load_dotenv
import httpx
from pydantic import BaseModel, HttpUrl, field_validator, model_validator
from curl_cffi.requests import AsyncSession

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

PLATFORM_ICONS = {
    "Leetcode": "◼️",
    "Codeforces": "📊",
    "Atcoder": "🐜",
    "Codechef": "🍳",
    "CSES": "🔷"
}

# Constant list of available tags
AVAILABLE_TAGS = [
    "dynamic programming",
    "graphs",
    "greedy",
    "recursion",
    "strings",
    "trees",
    "binary search",
    "two pointers",
    "backtracking",
    "bit manipulation",
    "segment trees",
    "trie",
]

# Pydantic model for incoming frontend request
class ProblemCreate(BaseModel):
    link: HttpUrl
    platform: str
    difficulty: str
    tags: List[str]

    @field_validator('platform')
    @classmethod
    def check_platform(cls, v):
        valid_platforms = ["LeetCode", "Codeforces", "Atcoder", "Codechef", "CSES"]
        print(v)
        if v not in valid_platforms:
            raise ValueError(f"Platform must be one of: {', '.join(valid_platforms)}")
        return v

    @model_validator(mode='after')
    def check_domain_matches_platform(self):
        platform_domains = {
            "LeetCode": "leetcode.com",
            "Codeforces": "codeforces.com",
            "AtCoder": "atcoder.jp",
            "CodeChef": "codechef.com",
            "CSES": "cses.fi"
        }
        expected_domain = platform_domains.get(self.platform)
        if expected_domain and expected_domain not in str(self.link):
            raise ValueError(f"URL domain does not match the selected platform. Expected domain: '{expected_domain}'")
        return self

# --- Scraper Strategy Pattern ---

async def fetch_leetcode_title(url: str) -> str:
    title_slug = url.rstrip('/').split('/')[-1]
    
    graphql_query = """
    query questionTitle($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        title
      }
    }
    """
    
    payload = {
        "query": graphql_query,
        "variables": {"titleSlug": title_slug}
    }
    
    try:
        async with httpx.AsyncClient() as client:
            # A User-Agent header is often required by public APIs to avoid bot-blocking
            response = await client.post(
                "https://leetcode.com/graphql", 
                json=payload,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            )
            response.raise_for_status()
            data = response.json()
            # Navigate the JSON response to extract the title
            title = data.get("data", {}).get("question", {}).get("title")
            if title:
                return html.unescape(title)
    except Exception as e:
        logger.warning(f"Failed to fetch LeetCode title for {url}: {e}. Falling back to slug parsing.")

    # Fallback to URL parsing if network request fails or question is not found
    decoded_slug = urllib.parse.unquote(title_slug)
    return decoded_slug.replace('-', ' ').title()

async def fetch_codeforces_title(url: str) -> str:
    try:
        # Direct HTML scraping bypasses API limitations for new/private/gym contests
        # Using curl_cffi to impersonate a real browser and bypass Cloudflare's 403 blocks
        async with AsyncSession(impersonate="chrome120") as client:
            response = await client.get(url)
            response.raise_for_status()
            
            # Codeforces embeds the title in a specific div: <div class="title">A. Problem Name</div>
            match = re.search(r'<div class="title">(?:[A-Z0-9]+\.\s*)(.*?)</div>', response.text)
            if match:
                return html.unescape(match.group(1).strip())
    except Exception as e:
        logger.warning(f"Failed to fetch Codeforces title for {url}: {e}. Falling back to slug parsing.")
            
    # Fallback to URL parsing (yielding the problem index like "E") if request fails
    decoded_slug = urllib.parse.unquote(url.rstrip('/').split('/')[-1])
    return decoded_slug.upper()

async def fetch_codechef_title(url: str) -> str:
    try:
        async with AsyncSession(impersonate="chrome120") as client:
            response = await client.get(url)
            response.raise_for_status()
            
            # CodeChef embeds the title in the HTML <title> tag (e.g., "Problem Name Problem | CodeChef")
            match = re.search(r'<title>(.*?)</title>', response.text)
            if match:
                raw_title = match.group(1)
                # Clean up the string by splitting at the pipe and removing the word " Problem"
                title = raw_title.split('|')[0].replace(' Problem', '').strip()
                return html.unescape(title)
    except Exception as e:
        logger.warning(f"Failed to fetch CodeChef title for {url}: {e}. Falling back to slug parsing.")
            
    decoded_slug = urllib.parse.unquote(url.rstrip('/').split('/')[-1])
    return decoded_slug.replace('-', ' ').title()

async def fetch_cses_title(url: str) -> str:
    try:
        async with AsyncSession(impersonate="chrome120") as client:
            response = await client.get(url)
            response.raise_for_status()
            
            # CSES titles are typically formatted as "CSES - Problem Name"
            match = re.search(r'<title>CSES - (.*?)</title>', response.text)
            if match:
                return html.unescape(match.group(1).strip())
    except Exception as e:
        logger.warning(f"Failed to fetch CSES title for {url}: {e}. Falling back to slug parsing.")
            
    decoded_slug = urllib.parse.unquote(url.rstrip('/').split('/')[-1])
    return decoded_slug.replace('-', ' ').title()

async def fetch_atcoder_title(url: str) -> str:
    try:
        async with AsyncSession(impersonate="chrome120") as client:
            response = await client.get(url)
            response.raise_for_status()
            
            # AtCoder titles are formatted as "B - Incomplete Shuffle"
            match = re.search(r'<title>(.*?)</title>', response.text)
            if match:
                return html.unescape(match.group(1).strip())
    except Exception as e:
        logger.warning(f"Failed to fetch AtCoder title for {url}: {e}. Falling back to slug parsing.")
            
    decoded_slug = urllib.parse.unquote(url.rstrip('/').split('/')[-1])
    return decoded_slug.replace('_', ' ').replace('-', ' ').title()

async def fetch_default_title(url: str) -> str:
    """Fallback for static sites or platforms without a dedicated scraper yet."""
    decoded_slug = urllib.parse.unquote(url.rstrip('/').split('/')[-1])
    return decoded_slug.replace('-', ' ').title()

# Map the platform string to the specific asynchronous scraper function
TITLE_SCRAPERS = {
    "Leetcode": fetch_leetcode_title,
    "Codeforces": fetch_codeforces_title,
    "Atcoder": fetch_atcoder_title,
    "Codechef": fetch_codechef_title,
    "CSES": fetch_cses_title,
}

# Pydantic model representing the full DB document
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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Added both localhost and IP variations
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Define API Endpoints
@app.get("/")
def read_root():
    return {"message": "DSA Search Engine API is running. Visit /docs for Swagger UI."}

@app.get("/tags", response_model=List[str])
def get_tags():
    """
    Fetch all available problem tags.
    """
    return AVAILABLE_TAGS

@app.get("/search", response_model=List[Problem])
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
    
    # Return only the 'hits' to prevent sending Meilisearch metadata to the client
    return search_results.get("hits", [])

@app.post("/problems", status_code=201, response_model=Problem)
async def add_problem(problem_in: ProblemCreate):
    """
    Add a new DSA problem to the search index.
    """
    link_str = str(problem_in.link)
    
    # Look up the appropriate scraper based on the platform, falling back to the default one
    scraper_func = TITLE_SCRAPERS.get(problem_in.platform, fetch_default_title)
    extracted_title = await scraper_func(link_str)
    # Determine the platform icon or use a default one
    platform_icon = PLATFORM_ICONS.get(problem_in.platform, "🌐")

    # Construct the full problem dictionary with an auto-generated timestamp ID
    problem_doc = {
        "id": int(time.time()),
        "platform": problem_in.platform,
        "platformIcon": platform_icon,
        "title": extracted_title,
        "link": link_str,
        "tags": problem_in.tags,
        "difficulty": problem_in.difficulty,
        "isNew": True
    }

    try:
        index = client.index(INDEX_NAME)
        # Add document to Meilisearch
        response = index.add_documents([problem_doc])
        # Return only the created problem document for exact consistency with the search API
        return problem_doc
    except MeilisearchCommunicationError:
        logger.error("Failed to connect to Meilisearch while adding a problem.")
        raise HTTPException(status_code=500, detail="Database connection failed")
