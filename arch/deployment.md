# Deployment

Project: RestroBuild

Version: 1.0.0

Status: MVP baseline

---

# Purpose

This document defines the deployment baseline for the RestroBuild MVP.

---

# Local Docker Stack

The local Docker stack runs:

- MySQL 8.4
- Spring Boot backend
- Nginx-served React frontend

Command:

```bash
docker compose up --build
```

The stack reads configuration from `.env`. Start from `.env.example`.

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

Demo credentials are documented in `README.md` and `.env.demo.example`.

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
- `JAVA_OPTS`
- `LOG_LEVEL_ROOT`
- `LOG_LEVEL_APP`
- `LOG_LEVEL_SECURITY`

Frontend build:

- `VITE_API_BASE_URL`
- `VITE_WS_BASE_URL`

Database:

- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PORT`

Default local MySQL JDBC URL:

```text
jdbc:mysql://mysql:3306/restrobuild?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

---

# Health Checks

MySQL uses `mysqladmin ping`.

Backend liveness uses:

```text
/api/health
```

Backend readiness uses:

```text
/api/health/ready
```

The readiness endpoint checks MySQL connectivity. The local Compose stack waits for backend readiness before starting the frontend container.

---

# Production Notes

- Replace the development `JWT_SECRET`.
- Restrict `CORS_ALLOWED_ORIGINS` to the deployed frontend origin.
- Set `FRONTEND_BASE_URL` to the deployed frontend URL so QR and publish links are correct.
- Use `wss://` for `VITE_WS_BASE_URL` when the frontend is served over HTTPS.
- Use `SPRING_PROFILES_ACTIVE=prod` for production deployments.
- The `prod` profile defaults `JPA_DDL_AUTO` to `validate` and disables Swagger/OpenAPI unless `SPRINGDOC_ENABLED=true`.
- The backend fails fast in `prod` if the development JWT secret is still configured.
- The backend fails fast in `prod` if `CORS_ALLOWED_ORIGINS` contains `*`.
- REST and WebSocket origins both use `CORS_ALLOWED_ORIGINS`.
- Move from MySQL schema auto-update to migrations before production data is relied on.
- Configure persistent MySQL storage and backups on the deployment host.

---

# Frontend Runtime

The frontend is served by Nginx in the Docker image.

The Nginx baseline includes:

- SPA fallback routing.
- Gzip compression for text assets.
- Basic security headers for content type, framing, and referrer policy.

---

# Container Runtime

Backend container:

- Runs the Spring Boot jar as a dedicated non-root user.
- Accepts optional JVM settings through `JAVA_OPTS`.
- Includes an image-level health check against `/api/health/ready`.
- Emits request IDs in logs and returns them as `X-Request-Id` response headers.
- Supports log level tuning through `LOG_LEVEL_ROOT`, `LOG_LEVEL_APP`, and `LOG_LEVEL_SECURITY`.

Frontend runtime:

- Displays backend request IDs in API error toasts when the response includes `X-Request-Id`.

Frontend container:

- Serves static assets through Nginx.
- Includes an image-level health check against `/`.
