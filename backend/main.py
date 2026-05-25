from contextlib import asynccontextmanager
import re
import html
import urllib.parse
from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import meilisearch
from meilisearch.errors import MeilisearchCommunicationError, MeilisearchApiError
from typing import Optional, List
import logging
import os
import time
from dotenv import load_dotenv
import httpx
from pydantic import BaseModel, HttpUrl, field_validator, model_validator
from curl_cffi.requests import AsyncSession
import jwt
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# 1. Initialize Meilisearch Client
MEILI_URL = os.getenv("MEILI_URL", "http://127.0.0.1:7700")
MEILI_MASTER_KEY = os.getenv("MEILI_MASTER_KEY", "")
INDEX_NAME = os.getenv("INDEX_NAME", "dsa_problems")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip(' "\'')
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "").strip(' "\'')
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "").strip(' "\'')

JWT_SECRET = os.getenv("JWT_SECRET", "your_super_secret_jwt_key_here")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
# Strip any literal quotes that Docker might pass, and remove accidental trailing slashes
FRONTEND_URL = os.getenv("FRONTEND_URL", "").strip(' "\'').rstrip('/')

raw_admin_emails = os.getenv("ADMIN_EMAILS", "")
# Robustly clean any brackets, quotes, and whitespace, then lowercase
cleaned_emails = raw_admin_emails.replace('"', '').replace("'", "").replace("[", "").replace("]", "")
ADMIN_EMAILS = [email.strip().lower() for email in cleaned_emails.split(",") if email.strip()]

client = meilisearch.Client(MEILI_URL, MEILI_MASTER_KEY)

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("email", "").lower() not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Not enough permissions. Admin access required.")
    return current_user

# 2. Convert JS dummy data into Python dictionaries
DUMMY_DATA = [
    {"id": 1, "platform": "Leetcode", "platformIcon": "◼️", "title": "Longest Common Subsequence", "link": "https://leetcode.com/problems/longest-common-subsequence/", "tags": ["dynamic programming", "strings", "greedy", "recursion"], "difficulty": "High"},
    {"id": 2, "platform": "Codeforces", "platformIcon": "📊", "title": "Edit Distance", "link": "https://codeforces.com/problemset/problem/72/E", "tags": ["dynamic programming", "graphs"], "difficulty": "High"},
    {"id": 3, "platform": "Atcoder", "platformIcon": "🐜", "title": "Traveling Salesman", "link": "https://atcoder.jp/contests/abc/tasks/abc_tsp", "tags": ["dynamic programming", "strings", "greedy"], "difficulty": "Medium"},
    {"id": 4, "platform": "Codechef", "platformIcon": "🍳", "title": "Longest Connection", "link": "https://www.codechef.com/problems/LONGC", "tags": ["dynamic programming", "graphs", "greedy"], "difficulty": "High"},
    {"id": 5, "platform": "Codechef", "platformIcon": "🍳", "title": "Traveling Pattern", "link": "https://www.codechef.com/problems/TRVPAT", "tags": ["dynamic programming", "greedy", "recursion", "recursion"], "difficulty": "High"},
    {"id": 6, "platform": "Codeforces", "platformIcon": "📊", "title": "Longest Subsequence", "link": "https://codeforces.com/problemset/problem/12/LS", "tags": ["dynamic programming", "greedy", "recursion", "graphs"], "difficulty": "High"},
    {"id": 7, "platform": "Codechef", "platformIcon": "🍳", "title": "Monestriatic Function", "link": "https://www.codechef.com/problems/MONFUNC", "tags": ["dynamic programming", "strings", "greedy"], "difficulty": "High"},
    {"id": 8, "platform": "Codechef", "platformIcon": "🍳", "title": "Traveling Salesman", "link": "https://www.codechef.com/problems/TSP", "tags": ["dynamic programming", "greedy", "recursion", "graphs"], "difficulty": "High"},
    {"id": 9, "platform": "CSES", "platformIcon": "🔷", "title": "Longest Common Subsequence", "link": "https://cses.fi/problemset/task/1234", "tags": ["dynamic programming", "strings", "greedy", "recursion"], "difficulty": "High"},
    {"id": 10, "platform": "CSES", "platformIcon": "🔷", "title": "Array Description", "link": "https://cses.fi/problemset/task/1746", "tags": ["dynamic programming", "recursion", "greedy", "recursion"], "difficulty": "Medium", "isNew": True},
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
        valid_platforms = ["Leetcode", "Codeforces", "Atcoder", "Codechef", "CSES"]
        print(v)
        if v not in valid_platforms:
            raise ValueError(f"Platform must be one of: {', '.join(valid_platforms)}")
        return v

    @model_validator(mode='after')
    def check_domain_matches_platform(self):
        platform_domains = {
            "Leetcode": "leetcode.com",
            "Codeforces": "codeforces.com",
            "Atcoder": "atcoder.jp",
            "Codechef": "codechef.com",
            "CSES": "cses.fi"
        }
        expected_domain = platform_domains.get(self.platform)
        if expected_domain and expected_domain not in str(self.link):
            raise ValueError(f"URL domain does not match the selected platform. Expected domain: '{expected_domain}'")
        return self

# Pydantic model for partial problem updates
class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    link: Optional[HttpUrl] = None
    platform: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = None

    @field_validator('platform')
    @classmethod
    def check_platform(cls, v):
        if v is None:
            return v
        valid_platforms = ["Leetcode", "Codeforces", "Atcoder", "Codechef", "CSES"]
        if v not in valid_platforms:
            raise ValueError(f"Platform must be one of: {', '.join(valid_platforms)}")
        return v

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
        logger.warning(f"Failed to fetch Leetcode title for {url}: {e}. Falling back to slug parsing.")

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
        index.update_filterable_attributes(["platform", "difficulty", "tags", "isNew", "link"])
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
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        FRONTEND_URL # Added production frontend origin
    ],
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
    platform: Optional[str] = Query(None, description="Filter by platform (e.g., Leetcode)"),
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
async def add_problem(problem_in: ProblemCreate, current_user: dict = Depends(get_admin_user)):
    """
    Add a new DSA problem to the search index.
    """
    link_str = str(problem_in.link)
    
    try:
        index = client.index(INDEX_NAME)
        # Check if the problem already exists by filtering for the exact link
        existing_problems = index.search("", {"filter": [f"link = '{link_str}'"], "limit": 1})
        if existing_problems.get("hits"):
            raise HTTPException(status_code=400, detail="A problem with this link already exists.")
    except MeilisearchCommunicationError:
        logger.error("Failed to connect to Meilisearch while validating existing problem.")
        raise HTTPException(status_code=500, detail="Database connection failed")

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

@app.put("/problems/{problem_id}", response_model=Problem)
async def update_problem(problem_id: int, problem_in: ProblemUpdate, current_user: dict = Depends(get_admin_user)):
    """
    Update an existing DSA problem.
    """
    try:
        index = client.index(INDEX_NAME)
        doc_obj = index.get_document(problem_id)
        # Meilisearch returns a Document object; convert it to a dictionary
        existing = doc_obj.__dict__ if hasattr(doc_obj, "__dict__") else doc_obj
    except MeilisearchApiError:
        raise HTTPException(status_code=404, detail="Problem not found")
    except MeilisearchCommunicationError:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    update_data = problem_in.model_dump(exclude_unset=True)
    if not update_data:
        return existing

    if "link" in update_data:
        if str(update_data["link"]) != existing.get("link"):
            raise HTTPException(status_code=400, detail="Updating the problem link is not allowed.")
        update_data["link"] = str(update_data["link"])
            
    if "platform" in update_data:
        if update_data["platform"] != existing.get("platform"):
            raise HTTPException(status_code=400, detail="Updating the problem platform is not allowed.")
        
    update_data["id"] = problem_id
    
    try:
        index.update_documents([update_data])
        # Return the merged document simulating Meilisearch's partial update
        updated_doc = {**existing, **update_data}
        return updated_doc
    except MeilisearchApiError as e:
        logger.error(f"Meilisearch API error while updating problem {problem_id}: {e}")
        raise HTTPException(status_code=400, detail="Failed to update problem in database")
    except MeilisearchCommunicationError:
        logger.error("Failed to connect to Meilisearch while updating a problem.")
        raise HTTPException(status_code=500, detail="Database connection failed")

@app.delete("/problems/{problem_id}", status_code=204)
def delete_problem(problem_id: int, current_user: dict = Depends(get_admin_user)):
    """
    Delete a DSA problem from the search index.
    """
    try:
        index = client.index(INDEX_NAME)
        
        # Verify the problem exists before attempting to delete
        index.get_document(problem_id)
        
        # Queue the deletion task in Meilisearch
        index.delete_document(problem_id)
    except MeilisearchApiError:
        raise HTTPException(status_code=404, detail="Problem not found")
    except MeilisearchCommunicationError:
        logger.error(f"Failed to connect to Meilisearch while deleting problem {problem_id}.")
        raise HTTPException(status_code=500, detail="Database connection failed")

@app.get("/auth/login", tags=["Authentication"])
def login_via_google():
    """
    Redirect to Google OAuth 2.0 authorization endpoint.
    """
    google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "response_type": "code",
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    url = f"{google_auth_url}?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url)

@app.get("/auth/callback", tags=["Authentication"])
async def google_auth_callback(code: str = Query(..., description="Authorization code from Google")):
    """
    Callback endpoint for Google OAuth 2.0. Exchanges the auth code for an access token and fetches user info.
    """
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    
    async with httpx.AsyncClient() as client:
        # 1. Exchange the auth code for an access token
        response = await client.post(token_url, data=data)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch token from Google")
        
        token_data = response.json()
        access_token = token_data.get("access_token")
        
        # 2. Use the access token to fetch the user's profile info
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        user_info_response = await client.get(user_info_url, headers=headers)
        
        if user_info_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user info from Google")
            
        user_info = user_info_response.json()
        
        # Determine user role based on ADMIN_EMAILS
        user_email = user_info.get("email", "").lower()
        role = "admin" if user_email in ADMIN_EMAILS else "user"

        # Create JWT session token
        expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
        jwt_payload = {
            "sub": user_info.get("id"),
            "email": user_email,
            "name": user_info.get("name"),
            "picture": user_info.get("picture"),
            "role": role,
            "exp": expire
        }
        
        access_token = jwt.encode(jwt_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        # Redirect back to the frontend with the token
        redirect_url = f"{FRONTEND_URL}?token={access_token}"
        return RedirectResponse(url=redirect_url)