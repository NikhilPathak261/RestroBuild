# Codex Development Instructions

Project: RestroBuild

Version: 1.0.0

Status: Approved

---

# Purpose

This document defines how Codex (or any AI coding assistant) should work on the RestroBuild project.

The AI must treat every file inside the `arch/` folder as the single source of truth.

The AI should never make architectural assumptions that conflict with these documents.

---

# Source of Truth Priority

When generating code, follow these documents in the following order.

1. srs.md
2. architecture.md
3. business-flow.md
4. database-design.md
5. authAndPermission.md
6. apiSpec.md
7. backendSpec.md
8. frontendSpec.md
9. uiPagesAndRoutes.md
10. realtimeOrderFlow.md
11. developmentPlan.md
12. decisions.md

If two documents conflict, the document higher in the list takes precedence.

---

# General Rules

Always follow the existing project architecture.

Never redesign the architecture unless explicitly instructed.

Never remove existing functionality.

Never rename modules without instruction.

Never generate placeholder implementations unless requested.

Prefer production-quality code over quick implementations.

Always produce clean, maintainable code.

---

# Coding Standards

Write readable code.

Use meaningful names.

Avoid unnecessary comments.

Avoid code duplication.

Keep methods short.

Keep classes focused on one responsibility.

Follow SOLID principles.

Follow DRY where appropriate.

Follow KISS.

---

# Backend Rules

Always follow layered architecture.

Controller

↓

Service

↓

Repository

↓

Database

Controllers

- No business logic.
- No repository access.

Services

- Business logic only.

Repositories

- Database operations only.

Never bypass the service layer.

Never expose entities directly through APIs.

Always use DTOs.

---

# Frontend Rules

Components should be reusable.

Pages should be responsible for layout only.

Business logic should remain inside services, hooks, or contexts where appropriate.

Never call Axios directly from UI components.

Use the existing project structure.

Avoid duplicated components.

---

# Database Rules

Do not modify database schema without updating `database-design.md`.

Respect foreign keys.

Respect entity relationships.

Never violate restaurant data isolation.

---

# API Rules

Every new endpoint must follow `apiSpec.md`.

Use REST principles.

Return consistent response structures.

Validate all request DTOs.

Use proper HTTP status codes.

---

# Security Rules

Never expose passwords.

Never expose password hashes.

Never expose JWT secrets.

Validate authentication for protected endpoints.

Validate authorization for protected endpoints.

Validate restaurant ownership before accessing resources.

---

# UI Rules

Maintain a clean and professional interface.

Keep spacing consistent.

Follow the existing design language.

Do not introduce a new design system unless instructed.

Ensure responsive behavior.

---

# Real-Time Rules

Only use WebSocket for features defined in `realtimeOrderFlow.md`.

Do not replace REST APIs with WebSockets.

---

# Error Handling

Handle errors gracefully.

Use centralized exception handling.

Return meaningful error messages.

Do not expose internal implementation details.

---

# Validation

Validate input on both frontend and backend.

Backend validation is mandatory.

Do not rely only on frontend validation.

---

# Testing

Whenever implementing a feature,

ensure that:

- existing functionality is preserved
- new functionality is tested
- no compilation errors remain

---

# Dependencies

Do not introduce new libraries unless

- required
- justified
- compatible with the existing architecture

If a new dependency is added,

update project configuration accordingly.

---

# File Modification Rules

Modify only the files necessary for the requested feature.

Do not perform unrelated refactoring.

Do not change naming conventions.

Do not delete code unless explicitly instructed.

---

# Before Writing Code

Before implementing any feature,

understand

- business flow
- API specification
- database design
- architecture

Generate code only after ensuring consistency with all relevant documents.

---

# If Information Is Missing

If a required implementation detail is missing from the documentation,

make the smallest reasonable assumption that is consistent with the existing architecture.

Do not redesign the project.

---

# Code Quality Checklist

Before considering a task complete, verify:

- Code compiles successfully.
- No syntax errors.
- No unused imports.
- No duplicated logic.
- Proper validation.
- Proper exception handling.
- Proper authorization.
- Proper API responses.
- Responsive frontend where applicable.
- No hardcoded secrets.
- Naming conventions followed.

---

# Documentation Rules

If implementing a feature that changes architecture, APIs, database schema, or business behavior,

update the relevant document inside the `arch/` folder before implementing the code.

Documentation and implementation must always remain synchronized.

---

# Goal

The objective is to build RestroBuild as a production-quality SaaS application.

Every implementation should prioritize

- maintainability
- scalability
- readability
- security
- consistency

over writing the shortest or fastest code.

The project should be suitable as a real-world portfolio project and should follow professional software engineering practices.