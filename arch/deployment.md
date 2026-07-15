# Deployment

Project: RestroBuild

Version: 1.0.0

Status: MVP baseline

---

# Purpose

This document defines the deployment baseline for the RestroBuild MVP.

---

# Local Runtime

The local runtime uses:

- MySQL 8.4 or compatible local MySQL server
- Spring Boot backend
- Vite React frontend during development

Backend command:

```bash
SPRING_PROFILES_ACTIVE=demo ./mvnw spring-boot:run
```

Frontend command:

```bash
npm run dev
```

---

# Demo Profile

The backend supports a `demo` Spring profile for local walkthroughs.

Run mode:

```bash
SPRING_PROFILES_ACTIVE=demo
```

Purpose:

- Seed a published demo restaurant.
- Seed owner, kitchen, and waiter accounts.
- Seed categories, menu items, tables, QR URLs, sample orders, and reviews.
- Keep demo data out of normal `default` and `prod` profile startup.

Demo credentials are documented in `README.md`.

---

# Required Environment Variables

Backend:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS`
- `FRONTEND_BASE_URL`
- `JPA_DDL_AUTO`
- `SPRING_PROFILES_ACTIVE`
- `LOG_LEVEL_ROOT`
- `LOG_LEVEL_APP`
- `LOG_LEVEL_SECURITY`

Frontend build:

- `VITE_API_BASE_URL`
- `VITE_WS_BASE_URL`

Default local MySQL JDBC URL:

```text
jdbc:mysql://localhost:3306/restrobuild?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

---

# Health Checks

Backend liveness uses:

```text
/api/health
```

Backend readiness uses:

```text
/api/health/ready
```

The readiness endpoint checks MySQL connectivity.

---

# Production Notes

- Set `JWT_SECRET` from a secure environment variable or secret manager.
- Restrict `CORS_ALLOWED_ORIGINS` to the deployed frontend origin.
- Set `FRONTEND_BASE_URL` to the deployed frontend URL so QR and publish links are correct.
- Use `wss://` for `VITE_WS_BASE_URL` when the frontend is served over HTTPS.
- Use `SPRING_PROFILES_ACTIVE=prod` for production deployments.
- The `prod` profile defaults `JPA_DDL_AUTO` to `validate` and disables Swagger/OpenAPI unless `SPRINGDOC_ENABLED=true`.
- The backend fails fast in `prod` if the placeholder JWT secret is configured.
- The backend fails fast in `prod` if `CORS_ALLOWED_ORIGINS` contains `*`.
- REST and WebSocket origins both use `CORS_ALLOWED_ORIGINS`.
- Move from MySQL schema auto-update to migrations before production data is relied on.
- Configure persistent MySQL storage and backups on the deployment host.

---

# Frontend Runtime

The frontend can be built with:

```bash
npm run build
```

The generated static assets are written to `frontend/dist`.

---

# Backend Runtime

The backend can be built with:

```bash
./mvnw package
```

The generated jar is written to `backend/target`.
