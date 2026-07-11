# Architecture Decisions

Project: RestroBuild

Version: 1.0.0

Status: Approved

---

# Purpose

This document records important architectural and technical decisions made during the design of RestroBuild.

Future implementations should respect these decisions unless this document is officially updated.

---

# ADR-001

Title

Multi-Tenant SaaS Architecture

Decision

The application will be built as a multi-tenant SaaS platform.

Reason

- Supports multiple restaurants.
- Single backend application.
- Easier deployment.
- Easier maintenance.
- Lower infrastructure cost.

---

# ADR-002

Title

Single Restaurant Per Owner (MVP)

Decision

Each owner can manage exactly one restaurant.

Reason

- Simpler implementation.
- Simpler authentication.
- Simpler dashboard.
- Multi-restaurant support can be added later.

---

# ADR-003

Title

Predefined Website Templates

Decision

Restaurants choose from predefined templates.

Reason

- Faster development.
- Easier maintenance.
- Consistent UI.
- Avoids complexity of drag-and-drop builders.

---

# ADR-004

Title

Separate Dashboards

Decision

Maintain independent dashboards for

- Owner
- Kitchen
- Waiter

Reason

Each role has different responsibilities.

This keeps the interface simple and secure.

---

# ADR-005

Title

Spring Boot Backend

Decision

Backend uses Spring Boot.

Reason

- Mature ecosystem.
- Excellent security support.
- Easy REST API development.
- Strong JPA integration.
- Industry standard.

---

# ADR-006

Title

React Frontend

Decision

Frontend uses React.

Reason

- Component-based architecture.
- Fast development.
- Large ecosystem.
- Excellent SPA support.

---

# ADR-007

Title

MySQL Database

Decision

Use MySQL.

Reason

- Reliable.
- ACID compliant.
- Excellent indexing.
- Production-ready.
- Broad hosting support and familiar operational tooling.

Implementation Notes

- Use the MySQL Connector/J driver.
- Use InnoDB for transactional tables.
- Use `utf8mb4` character encoding.
- Use `BIGINT AUTO_INCREMENT` primary keys through JPA `GenerationType.IDENTITY`.

---

# ADR-008

Title

Spring Data JPA

Decision

Use Spring Data JPA with Hibernate.

Reason

- Reduces boilerplate.
- Easy repository implementation.
- Good transaction management.
- Industry standard.

---

# ADR-009

Title

JWT Authentication

Decision

Authentication uses JWT Access Token with Refresh Token.

Reason

- Stateless authentication.
- Scalable.
- Widely adopted.
- Suitable for REST APIs.

---

# ADR-010

Title

Role-Based Access Control

Decision

Authorization is role-based.

Roles

- OWNER
- KITCHEN
- WAITER

Reason

Simple permission model.

Easy to extend later.

---

# ADR-011

Title

REST APIs

Decision

Frontend communicates with backend using REST APIs.

Reason

- Simpler than GraphQL.
- Easy documentation.
- Industry standard.
- Swagger support.

---

# ADR-012

Title

WebSocket for Real-Time Updates

Decision

Use WebSocket only for order status updates.

Reason

REST handles CRUD operations efficiently.

WebSocket is needed only for real-time communication.

---

# ADR-013

Title

DTO-Based API

Decision

Never expose entities directly.

Always use DTOs.

Reason

- Better security.
- API stability.
- Decouples database from API.

---

# ADR-014

Title

Layered Backend Architecture

Decision

Backend layers

Controller

↓

Service

↓

Repository

↓

Database

Reason

- Separation of concerns.
- Easier testing.
- Better maintainability.

---

# ADR-015

Title

Business Logic in Service Layer

Decision

Business rules belong only inside services.

Reason

Keeps controllers and repositories clean.

---

# ADR-016

Title

Restaurant Data Isolation

Decision

Every business entity belongs to one restaurant.

Reason

Guarantees tenant isolation.

Prevents cross-restaurant data access.

---

# ADR-017

Title

Soft Hide Instead of Delete

Decision

Menu items should be hidden instead of deleted if referenced by previous orders.

Reason

Preserves historical order data.

---

# ADR-018

Title

Image Storage

Decision

Database stores only image URLs.

Reason

Improves database performance.

Allows migration to cloud storage later.

---

# ADR-019

Title

Responsive Design

Decision

Entire application must support

- Desktop
- Tablet
- Mobile

Reason

Customers primarily use mobile devices.

Restaurant owners often use tablets.

---

# ADR-020

Title

Mobile-First Customer Website

Decision

Customer website follows a mobile-first approach.

Reason

Restaurant customers access the application by scanning QR codes.

---

# ADR-021

Title

Component-Based Frontend

Decision

UI should be built using reusable React components.

Reason

Improves maintainability.

Reduces duplication.

---

# ADR-022

Title

Bean Validation

Decision

Use Jakarta Bean Validation for request validation.

Reason

Keeps validation consistent and centralized.

---

# ADR-023

Title

Global Exception Handling

Decision

Handle all exceptions using a centralized exception handler.

Reason

Consistent API responses.

Cleaner controller code.

---

# ADR-024

Title

Swagger Documentation

Decision

Document every API using OpenAPI/Swagger.

Reason

Improves developer experience.

Makes frontend integration easier.

---

# ADR-025

Title

Docker Support

Decision

Application should be Docker-ready.

Reason

Simplifies deployment.

Provides consistent environments.

---

# ADR-026

Title

Environment Variables

Decision

Sensitive configuration must come from environment variables.

Examples

MySQL JDBC URL

JWT Secret

API Keys

Reason

Improves security.

Supports multiple deployment environments.

---

# ADR-027

Title

Production-Quality Code

Decision

The project is built using production-level coding standards.

Reason

The objective is to create a real SaaS application rather than a demonstration project.

---

# Source of Truth

These architectural decisions are considered final for the MVP.

Any future architectural changes must first update this document before implementation.
