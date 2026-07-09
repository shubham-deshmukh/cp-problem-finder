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

## 🎭 End-to-End Tests (Playwright)

The E2E test suite uses **Playwright** to run full-browser user scenarios against the running frontend and backend.

### Setup
Ensure Playwright and browser binaries are installed:
```bash
cd frontend
npm install
npx playwright install chromium
```

### Running Tests
Make sure both the FastAPI backend (`http://localhost:8000`) and the Vite dev server (`http://localhost:5173`) are running. Then execute:
```bash
# Run E2E tests in headless mode
npx playwright test

# Run E2E tests in headed mode with UI/HTML reports
npx playwright test --ui
```

### Covered Test Cases (Guest Journey Flow)
The script `frontend/e2e/guest_flow.spec.ts` verifies:
1. **Welcome Modal Onboarding:** Checks for welcome guide dialog rendering on new sessions, tests its dismissal, and verifies state persistence.
2. **Guest Sandbox Authentication:** Verifies "Continue as guest" triggers dynamic, isolated index creation on backend and routes user to dashboard.
3. **Problem Addition (CRUD):** Fills in a problem link, selects platform/difficulty/tags, writes markdown notes, and submits. Asserts title scraping and addition.
4. **Markdown Drawer Verification:** Opens the problem's notes drawer, updates contents with raw markdown, saves, and asserts proper HTML formatting preview.
5. **Fuzzy Search & Clear:** Verifies that searching filters the list and that clearing the input refreshes the list with all items in descending order of creation.
6. **Theme Toggling:** Clicks theme button and verifies body CSS `color-scheme` updates dynamically.
7. **Session Teardown:** Logs out and verifies index teardown on backend and user redirection back to landing page.

---

## ⚡ Load & Concurrency Tests (k6)

The load test suite uses **k6** to profile API performance under concurrent user load.

### Setup
k6 must be installed on your local machine.
- **Windows (winget)**:
  ```powershell
  winget install GrafanaLabs.k6 --accept-source-agreements --accept-package-agreements
  ```
- **macOS (Homebrew)**:
  ```bash
  brew install k6
  ```

### Running Tests
Make sure the FastAPI backend (`http://localhost:8000`) is running. Then run k6:
```bash
# Execute load test script (using the absolute path to k6 if not in PATH)
k6 run backend/load_tests/load_test.js
```

### Covered Load Scenarios & Target Metrics
The script `backend/load_tests/load_test.js` simulates a ramping workload of up to **20 concurrent virtual users** over **1 minute and 15 seconds** executing the following path:
1. **Dynamic Sandbox Allocation (1 VU Login):** Hits `GET /auth/guest` once per VU lifecycle, triggering index creation and JWT generation on the backend.
2. **Concurrent Fuzzy Searches (95% Probability):** Hits `GET /search?q=...` with randomized query terms repeatedly, measuring search response time under load.
3. **Problem Creation CRUD (5% Probability):** Hits `POST /problems` using the parsed guest auth token, checking database insertion performance under load.

### Performance Thresholds
The load test establishes strict SLAs to ensure backend reliability:
- **`http_req_duration` SLA:** 95% of HTTP requests must complete in under **500ms** (`p(95) < 500`).
- **`http_req_failed` SLA:** The HTTP request failure rate must remain under **1%** (`rate < 0.01`).
