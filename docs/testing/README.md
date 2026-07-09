# Testing Guide - CP Problem Finder

This guide details how to run the unit, integration, end-to-end, and load testing suites for the CP Problem Finder application.

## 🧪 Isolated Test Environment

To prevent test executions from altering or wiping your active development database, all tests run against an isolated Meilisearch instance listening on port **`7701`**.

Before running any test suites, start this container using the test-specific docker-compose configuration:
```bash
# Navigate to the backend folder and start the test database
cd backend
docker compose -f test_docker-compose.yml up -d
```

---

## 🐍 Backend Unit & Integration Tests (Pytest)

The backend test suite is built on **Pytest** and covers API endpoint controls, role permissions (RBAC), URL parsing validation, sandbox index routing, and index cleanup.

### Setup
Ensure backend dependencies (including testing utilities) are installed:
```bash
cd backend
pip install -r requirements.txt
```

### Running Tests
Execute the pytest runner from the `backend/` directory:
```bash
# Run the entire test suite
python -m pytest

# Run with code coverage reporting
pytest --cov=. tests/
```

### Covered Test Cases
1. **Unauthenticated Routes:** Verifies requests without JWT tokens are rejected with a `401 Unauthorized` status.
2. **Standard User RBAC:** Asserts that logged-in users without admin privileges can search, but receive `403 Forbidden` on mutating endpoints (`POST`, `PUT`, `DELETE`).
3. **Admin User CRUD:** Validates that admins can write, edit, and delete problems, and verifies validation constraints (e.g. URL domain mismatches or updating links/platforms).
4. **Guest Sandbox Isolation:** Logs in as guest, asserts isolated sandbox index creation, tests CRUD operations, verifies guest changes do not leak to the production index, and verifies index deletion on logout.
5. **Garbage Collection Sweeper:** Directly invokes the background sweeper to ensure sandbox indices older than 15 minutes are pruned while preserving active ones.
6. **Platform Scrapers:** Tests that HTML titles are dynamically fetched from LeetCode, Codeforces, CodeChef, CSES, and AtCoder with anti-bot impersonations.

---

## ⚛️ Frontend Unit & Store Tests (Vitest)

The frontend unit test suite uses **Vitest** and **React Testing Library** to verify state management in the Zustand store.

### Setup
Ensure frontend dependencies (including Vitest, jsdom, and testing-library packages) are installed:
```bash
cd frontend
npm install
```

### Running Tests
Execute the Vitest runner from the `frontend/` directory:
```bash
# Run all tests once
npm run test
```

### Covered Test Cases (Zustand Auth Store)
1. **Initial State:** Verifies store defaults (`isAuthenticated: false`, `user: null`, `checkingAuth: true`).
2. **Login Action:** Asserts `login(user)` correctly populates profile data and sets `isAuthenticated` to true.
3. **Logout Action:** Mocks browser fetch, asserts a `POST /auth/logout` call, and resets the auth store to defaults.
4. **CheckAuth Action (Success/Failure):** Mocks fetch to `/auth/me` with both successful (sets user profile) and failed (resets store state) scenarios.
5. **Session Expiration Handler:** Verifies `handleSessionExpired()` triggers a browser alert once and resets state when the session expires, preventing redundant prompts on subsequent triggers.

---

## 🧪 Upcoming Test Suites

### 1. End-to-End Tests (Playwright)
*(To be implemented in Phase 4)*
- Target: Full browser simulations (Guest onboarding, problem addition, notes rendering, fuzzy filtering).
- Command: `npx playwright test`.

### 2. Load & Concurrency Tests (k6)
*(To be implemented in Phase 5)*
- Target: Concurrency limits on guest workspace creation, fuzzy search latency under load, and background cleanup task locks.
- Command: `k6 run load_test.js`.
