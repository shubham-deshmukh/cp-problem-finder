import os
import pytest
import asyncio
import jwt
from datetime import datetime, timedelta, timezone

# 1. Set environment variables BEFORE importing main.py so it connects to test Meilisearch
os.environ["MEILI_URL"] = "http://127.0.0.1:7701"
os.environ["MEILI_MASTER_KEY"] = "test-master-key-xyz-123-456"
os.environ["INDEX_NAME"] = "dsa_problems_test"
os.environ["ADMIN_EMAILS"] = "admin@example.com"
os.environ["JWT_SECRET"] = "test_jwt_secret_key"
os.environ["FRONTEND_URL"] = "http://localhost:5173"

import meilisearch
from main import app, client, DUMMY_DATA, JWT_SECRET, JWT_ALGORITHM

@pytest.fixture(scope="session")
def event_loop():
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    loop.close()

@pytest.fixture(scope="session")
def meili_client():
    return client

@pytest.fixture(scope="function", autouse=True)
def setup_test_index(meili_client):
    # Setup step: Clean any existing test indexes to ensure run isolation
    try:
        indexes_data = meili_client.get_indexes()
        indexes_list = indexes_data.get("results", []) if isinstance(indexes_data, dict) else indexes_data
        for idx in indexes_list:
            uid = idx.uid if hasattr(idx, "uid") else idx.get("uid") if isinstance(idx, dict) else idx
            if uid and (uid.startswith("dsa_problems_test") or uid.startswith("dsa_problems_guest_")):
                try:
                    meili_client.delete_index(uid)
                except Exception:
                    pass
    except Exception:
        pass

    # Create default test index
    index_name = "dsa_problems_test"
    index = meili_client.index(index_name)
    
    # Add dummy data and update configurations
    task_docs = index.add_documents(DUMMY_DATA)
    task_searchable = index.update_searchable_attributes(["title", "tags", "platform"])
    task_filterable = index.update_filterable_attributes(["platform", "difficulty", "tags", "isNew", "link"])
    task_sortable = index.update_sortable_attributes(["id"])
    
    meili_client.wait_for_task(task_docs.task_uid)
    meili_client.wait_for_task(task_searchable.task_uid)
    meili_client.wait_for_task(task_filterable.task_uid)
    meili_client.wait_for_task(task_sortable.task_uid)
    
    yield
    
    # Teardown step: Clean up
    try:
        meili_client.delete_index(index_name)
    except Exception:
        pass

@pytest.fixture
def generate_token():
    def _generate(email: str, role: str, index_name: str = "dsa_problems_test"):
        expire = datetime.now(timezone.utc) + timedelta(minutes=10)
        payload = {
            "sub": f"user_id_{email}",
            "email": email,
            "name": f"{role.capitalize()} User",
            "picture": None,
            "role": role,
            "index_name": index_name,
            "exp": expire
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return _generate
