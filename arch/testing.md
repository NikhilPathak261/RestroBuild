# Testing

Project: RestroBuild

Version: 1.0.0

Status: MVP baseline

---

# Purpose

This document defines the current automated testing baseline for the RestroBuild MVP.

---

# Frontend Tests

Framework

Vitest with jsdom and React Testing Library.

Command

```bash
npm run test
```

Current coverage baseline

- Shared loading and error UI states.
- Realtime order subscription client behavior.
- Authentication route guard behavior.
- Owner registration and login routing behavior.
- Backend inactive account login rejection.
- Public menu loading, filtering, sorting, in-page cart, persisted standalone cart, special instructions, and order placement behavior.
- Public menu spicy and sweet level filtering.
- Public menu active table order lookup with tracking and bill navigation.
- Public dish details and public menu item reviews.
- Public website homepage and about-page restaurant branding media.
- Public QR table validation and table-context navigation.
- Public order tracking, backend timeline loading with timestamp display, manual refresh, add-more-items navigation, reviews, and bill summary behavior.
- Public order progress timeline and estimated-time display.
- Public bill table-level aggregation, status context, manual refresh, active-order add-more navigation, and print action.
- Staff kitchen and waiter order status workflows with manual refresh controls.
- Waiter served order history.
- Dashboard category search/refresh and menu form/list refresh behavior, including dish image upload URL handoff.
- Dashboard owner order status, table number, date filters, and manual refresh.
- Dashboard overview metrics, recent orders, and manual refresh.
- Restaurant profile media URLs, upload URL handoff, previews, and website publishing/copy/open controls.
- Dashboard table QR previews, link copying, download links, staff filtering/refresh, review filtering/refresh, and owner order management behavior.
- Analytics dashboard display states and manual refresh.
- Backend production runtime configuration guard.
- Backend liveness and MySQL readiness health checks.
- Production CORS wildcard guard.
- Backend global authentication exception handling.
- Backend authenticated user service guard behavior.
- Backend request ID logging filter.
- Backend JWT authentication filter behavior.
- Backend JSON security error handlers.
- Backend order service table-bill aggregation and public timeline state behavior.
- Frontend ApiResponse unwrapping for backend response envelopes.
- Frontend API error formatting with request ID display.
- Frontend auth session storage and expiry notification.

Future frontend tests should prioritize

- Additional edge cases for failure states and validation.

CI baseline:

- Backend Maven tests.
- Frontend tests, lint, and build.
- Docker Compose configuration validation.

---

# Backend Tests

Framework

JUnit and Spring Boot Test dependencies are available through the backend Maven configuration.

Command

```bash
mvn test
```

Current environment note

Backend tests are not executable in the current local agent environment because Maven is not installed on PATH.

Future backend tests should prioritize

- Authentication and JWT behavior.
- Order lifecycle rules.
- Restaurant ownership authorization.
- Review verification rules.

---

# Definition of Done

Every new slice should run the fastest relevant checks:

- Frontend changes: `npm run test`, `npm run lint`, `npm run build`.
- Backend changes: `mvn test` when Maven is available.

Manual smoke testing should cover the affected user journey before deployment.
