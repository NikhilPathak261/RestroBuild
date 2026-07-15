# Testing

Project: RestroBuild

Version: 1.0.0

Status: MVP automated verification baseline

---

# Purpose

This document defines the automated test strategy for the RestroBuild MVP. The goal is to verify backend rules, frontend behavior, and the real browser ordering lifecycle without requiring manual click-through testing.

---

# Test Strategy

RestroBuild uses three automated layers:

- Backend unit and integration tests for domain rules, security, tenancy, cart APIs, orders, reviews, and analytics.
- Frontend component and integration tests with Vitest, jsdom, and React Testing Library.
- Playwright end-to-end tests that run the real frontend and backend together against an isolated MySQL test database.

Existing tests must stay enabled. New tests should fix product issues they expose instead of weakening assertions.

---

# Test Database

Automated database-backed tests must not use the real local `restrobuild` database.

The dedicated test database is:

```text
restrobuild_test
```

Runtime variables:

```text
DB_URL=jdbc:mysql://localhost:3306/restrobuild_test
DB_USERNAME=<local test mysql user>
DB_PASSWORD=<local test mysql password>
JWT_SECRET=<test jwt secret>
```

The checked-in `test` Spring profile uses `spring.jpa.hibernate.ddl-auto=create-drop`, so the schema is recreated for test runs. The database itself must exist before backend integration or Playwright tests start. The frontend command `npm run create:test-db` creates it using the local MySQL client.

No real password, JWT secret, or personal credential should be committed to the repository.

---

# Backend Tests

Framework:

JUnit, Spring Boot Test, MockMvc, Mockito.

Commands:

```powershell
cd backend
.\mvnw.cmd clean test
.\mvnw.cmd clean package
```

Current backend coverage includes:

- Owner registration and login.
- JWT-protected endpoint access.
- Restaurant profile creation and update.
- Restaurant data isolation between owners.
- Category creation and update.
- Menu item creation, availability, and visibility.
- Staff creation and role restriction checks.
- Public cart creation with `X-Cart-Token`.
- Cart item add, update, remove, and clear flows.
- Public order placement.
- Invalid order status transition rejection.
- Kitchen transition from `PENDING` to `PREPARING` to `READY`.
- Waiter transition from `READY` to `SERVED`.
- Verified review submission.
- Rejection of reviews for unordered or unserved items.
- Analytics summary and top-item calculations.
- Health, request IDs, JWT, security errors, authenticated user guards, order timeline, and bill aggregation.

---

# Frontend Tests

Framework:

Vitest with jsdom and React Testing Library.

Commands:

```powershell
cd frontend
npm run lint
npm test
npm run build
```

Current frontend coverage includes:

- Authentication registration and login flows.
- Protected routes and unauthorized state.
- Loading, error, and empty page states.
- Public menu loading, filtering, sorting, and table-context behavior.
- Server-backed public cart behavior and anonymous cart token handling.
- Cart quantity updates, clearing, and order placement.
- Public order tracking, bill summaries, and review submission.
- Kitchen and waiter order screens.
- Dashboard categories, menu, tables, staff, orders, reviews, restaurant profile, website settings, and analytics screens.
- API response unwrapping, API error formatting, auth session storage, clipboard, QR utilities, realtime client behavior, and uploads.

---

# End-To-End Tests

Framework:

Playwright with Chromium desktop and a mobile Chromium device profile.

Command:

```powershell
cd frontend
npm run test:e2e
```

Default E2E ports:

```text
Backend: http://localhost:18080
Frontend: http://localhost:5174
```

The E2E command:

1. Creates `restrobuild_test` if it does not exist.
2. Starts the backend with the `test` profile.
3. Starts the Vite frontend with `VITE_API_BASE_URL` pointed at the test backend.
4. Runs the Playwright browser scenario.

Covered desktop browser flow:

- Seed/register an owner through the real backend API.
- Log in/create restaurant data through the real backend API setup path.
- Create category, available menu item, table, kitchen staff, and waiter staff.
- Open the public restaurant menu for the table.
- Add a dish to the server-backed anonymous cart.
- Verify an anonymous cart token is stored in browser session storage.
- Open the standalone cart and place an order.
- Log in as kitchen staff and move the order from `PENDING` to `PREPARING` to `READY`.
- Log in as waiter and mark the order `SERVED`.
- Return to the customer order page and verify `SERVED`.
- Submit a verified review.
- Log in as owner and verify reviews, orders, and analytics reflect the order.

Additional E2E checks:

- Mobile public customer flow for opening the QR menu, adding multiple quantities to the server-backed cart, persisting the anonymous cart token, reviewing the cart total, and placing an order.
- Negative API check that review submission is rejected before an order reaches `SERVED`.

---

# Full Verification

Windows command:

```powershell
.\verify.bat
```

The script runs:

- Backend tests.
- Backend package.
- Frontend lint.
- Frontend tests.
- Frontend build.
- Playwright E2E tests.

The script exits non-zero on the first failed command.

---

# Expected Result

The MVP is considered automatically verified only when all backend tests, frontend tests, frontend lint, frontend build, backend package, and Playwright E2E tests pass.
