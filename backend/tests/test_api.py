import pytest
import time
import jwt
import httpx
from datetime import datetime, timezone
from fastapi import status
from httpx import AsyncClient
import main
from main import app, client, cleanup_guest_indices

# --- Mocks for Scrapers to Keep Tests Fast & Network-Independent ---
@pytest.fixture(autouse=True)
def mock_scrapers(monkeypatch):
    async def mock_fetch_leetcode(url):
        return "Mocked Leetcode Title"
    async def mock_fetch_codeforces(url):
        return "Mocked Codeforces Title"
    async def mock_fetch_default(url):
        return "Mocked Default Title"

    monkeypatch.setattr("main.fetch_leetcode_title", mock_fetch_leetcode)
    monkeypatch.setattr("main.fetch_codeforces_title", mock_fetch_codeforces)
    monkeypatch.setattr("main.fetch_default_title", mock_fetch_default)

    # Re-map in global dictionary to ensure main uses the mocked functions
    main.TITLE_SCRAPERS["Leetcode"] = mock_fetch_leetcode
    main.TITLE_SCRAPERS["Codeforces"] = mock_fetch_codeforces


# --- 1. Unauthenticated Route Tests ---
@pytest.mark.asyncio
async def test_unauthenticated_requests():
    transport = httpx.ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Search requires auth
        response = await ac.get("/search?q=sum")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # Profile details require auth
        response = await ac.get("/auth/me")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        # CRUD actions require auth
        response = await ac.post("/problems", json={})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        response = await ac.put("/problems/1", json={})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        response = await ac.delete("/problems/1")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# --- 2. Standard User RBAC Tests (Read-Only) ---
@pytest.mark.asyncio
async def test_standard_user_permissions(generate_token):
    token = generate_token(email="user@example.com", role="user")
    headers = {"Authorization": f"Bearer {token}"}
    cookies = {"access_token": token}

    transport = httpx.ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Should be able to query auth/me
        response = await ac.get("/auth/me", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["role"] == "user"

        # Should be able to search problems
        response = await ac.get("/search?q=sum", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)

        # Should NOT be allowed to perform CRUD operations
        new_problem = {
            "link": "https://leetcode.com/problems/two-sum/",
            "platform": "Leetcode",
            "difficulty": "Easy",
            "tags": ["strings"],
            "notes": "Test note"
        }
        response = await ac.post("/problems", json=new_problem, headers=headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN

        response = await ac.put("/problems/1", json={"difficulty": "Hard"}, headers=headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN

        response = await ac.delete("/problems/1", headers=headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN


# --- 3. Admin User CRUD & Validation Tests ---
@pytest.mark.asyncio
async def test_admin_crud_and_validations(generate_token):
    token = generate_token(email="admin@example.com", role="admin")
    headers = {"Authorization": f"Bearer {token}"}
    
    transport = httpx.ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # A. Create problem successfully
        new_problem = {
            "link": "https://leetcode.com/problems/3sum/",
            "platform": "Leetcode",
            "difficulty": "Easy",
            "tags": ["two pointers"],
            "notes": "Fast search test"
        }
        response = await ac.post("/problems", json=new_problem, headers=headers)
        assert response.status_code == status.HTTP_201_CREATED
        created_prob = response.json()
        assert created_prob["title"] == "Mocked Leetcode Title"
        assert created_prob["platform"] == "Leetcode"
        assert created_prob["difficulty"] == "Easy"
        created_id = created_prob["id"]

        # B. Platform domain validation error
        mismatched_problem = {
            "link": "https://codeforces.com/problemset/problem/71/A",
            "platform": "Leetcode",
            "difficulty": "Easy",
            "tags": ["strings"]
        }
        response = await ac.post("/problems", json=mismatched_problem, headers=headers)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "domain does not match" in response.text

        # C. Search the created problem
        response = await ac.get("/search?q=mocked", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        hits = response.json()
        assert len(hits) >= 1
        assert any(h["id"] == created_id for h in hits)

        # D. Update problem notes & difficulty
        response = await ac.put(f"/problems/{created_id}", json={"difficulty": "Medium", "notes": "Updated note"}, headers=headers)
        assert response.status_code == status.HTTP_200_OK
        updated_prob = response.json()
        assert updated_prob["difficulty"] == "Medium"
        assert updated_prob["notes"] == "Updated note"

        # E. Update validation block: cannot update link or platform
        response = await ac.put(f"/problems/{created_id}", json={"link": "https://leetcode.com/problems/different/"}, headers=headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        response = await ac.put(f"/problems/{created_id}", json={"platform": "Codeforces"}, headers=headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # F. Delete problem
        response = await ac.delete(f"/problems/{created_id}", headers=headers)
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # G. Search again to confirm deletion
        response = await ac.get(f"/search?q=mocked", headers=headers)
        hits = response.json()
        assert not any(h["id"] == created_id for h in hits)


# --- 4. Guest Sandbox Mode & Isolation Tests ---
@pytest.mark.asyncio
async def test_guest_sandbox_flow_and_isolation(generate_token):
    # Setup test client
    transport = httpx.ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # A. Trigger guest login redirection
        response = await ac.get("/auth/guest")
        assert response.status_code == status.HTTP_307_TEMPORARY_REDIRECT
        
        # B. Retrieve and decode access token cookie
        assert "access_token" in response.cookies
        guest_token = response.cookies["access_token"]
        headers = {"Authorization": f"Bearer {guest_token}"}
        
        payload = jwt.decode(guest_token, options={"verify_signature": False})
        guest_index_name = payload["index_name"]
        assert guest_index_name.startswith("dsa_problems_guest_")

        # C. Query guest index problems (should have default dummy list)
        response = await ac.get("/search", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        guest_problems = response.json()
        assert len(guest_problems) == 10  # Dummy seed count

        # D. Add a new problem inside the guest workspace
        guest_new_problem = {
            "link": "https://codeforces.com/problemset/problem/71/B",
            "platform": "Codeforces",
            "difficulty": "Easy",
            "tags": ["strings"],
            "notes": "Guest problem note"
        }
        response = await ac.post("/problems", json=guest_new_problem, headers=headers)
        assert response.status_code == status.HTTP_201_CREATED
        created_guest_prob = response.json()
        assert created_guest_prob["title"] == "Mocked Codeforces Title"
        guest_problem_id = created_guest_prob["id"]

        # E. Verify it is visible inside the guest search
        response = await ac.get("/search?q=mocked", headers=headers)
        assert len(response.json()) >= 1
        assert any(p["id"] == guest_problem_id for p in response.json())

        # F. Verify isolation: the guest problem MUST NOT be visible inside the default admin/user index
        admin_token = generate_token(email="admin@example.com", role="admin")
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        async with AsyncClient(transport=transport, base_url="http://test") as ac_admin:
            response = await ac_admin.get("/search?q=mocked", headers=admin_headers)
            admin_problems = response.json()
            assert not any(p["id"] == guest_problem_id for p in admin_problems)

        # G. Log out guest and verify immediate deletion of guest Meilisearch index
        response = await ac.post("/auth/logout", headers=headers)
        assert response.status_code == status.HTTP_200_OK
        
        # Poll Meilisearch to verify index deletion is processed
        guest_deleted = False
        for _ in range(30):
            indexes_data = client.get_indexes()
            indexes_list = indexes_data.get("results", []) if isinstance(indexes_data, dict) else indexes_data
            guest_uids = [idx.uid if hasattr(idx, "uid") else idx.get("uid") for idx in indexes_list]
            if guest_index_name not in guest_uids:
                guest_deleted = True
                break
            time.sleep(0.1)
            
        assert guest_deleted, f"Guest index {guest_index_name} was not deleted from Meilisearch."


# --- 5. Garbage Collection Sweeper Test ---
def test_guest_index_garbage_collection():
    current_time = int(time.time())
    
    # Create an expired guest index (simulated as created 16 minutes / 960 seconds ago)
    expired_timestamp = current_time - 960
    expired_index_name = f"dsa_problems_guest_{expired_timestamp}_expiredsessionid123"
    expired_index = client.index(expired_index_name)
    # Add dummy document to verify creation
    task_expired = expired_index.add_documents([{"id": 1, "title": "Expired Problem"}])
    client.wait_for_task(task_expired.task_uid)
    
    # Create an active guest index (created 5 minutes / 300 seconds ago)
    active_timestamp = current_time - 300
    active_index_name = f"dsa_problems_guest_{active_timestamp}_activesessionid456"
    active_index = client.index(active_index_name)
    task_active = active_index.add_documents([{"id": 1, "title": "Active Problem"}])
    client.wait_for_task(task_active.task_uid)

    # Run the sweeper routine
    cleanup_guest_indices()

    # Poll Meilisearch until the expired index is deleted
    expired_deleted = False
    uids = []
    for _ in range(30):
        indexes_data = client.get_indexes()
        indexes_list = indexes_data.get("results", []) if isinstance(indexes_data, dict) else indexes_data
        uids = [idx.uid if hasattr(idx, "uid") else idx.get("uid") for idx in indexes_list]
        if expired_index_name not in uids:
            expired_deleted = True
            break
        time.sleep(0.1)

    # The expired index should be cleaned up
    assert expired_deleted, f"Expired index {expired_index_name} was not cleaned up. Current indexes: {uids}"
    
    # The active index should remain
    assert active_index_name in uids
    
    # Teardown the active index
    try:
        client.delete_index(active_index_name)
    except Exception:
        pass
