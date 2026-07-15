# Architecture Specification

Project: RestroBuild

Version: 1.0.0

Status: Approved

This document defines the complete software architecture for RestroBuild MVP.

Every implementation must follow this architecture unless explicitly changed by future architecture revisions.

---

# 1. Architecture Overview

RestroBuild is a production-quality multi-tenant SaaS application.

The architecture follows a layered backend architecture and a component-based frontend architecture.

The system consists of three major applications.

1. Restaurant Admin Dashboard
2. Customer Restaurant Website
3. Staff Dashboard

All three communicate with a common Spring Boot backend through REST APIs.

Real-time order updates use WebSockets.

---

# 2. High Level Architecture

                    Internet
                        |
                  React Frontend
                        |
                REST API + WebSocket
                        |
                 Spring Boot Backend
                        |
          -----------------------------
          |                           |
        MySQL                  Image Storage
                                (Local -> Cloud Ready)

---

# 3. System Modules

The backend is divided into independent business modules.

Authentication Module

Responsibilities

- Login
- Registration
- JWT
- Refresh Tokens

----------------------------

Restaurant Module

Responsibilities

- Restaurant Profile
- Website Settings
- Theme Customization

----------------------------

Menu Module

Responsibilities

- Categories
- Menu Items
- Search
- Filters

----------------------------

QR Module

Responsibilities

- QR Generation
- Table QR
- QR Validation

----------------------------

Order Module

Responsibilities

- Cart
- Order Creation
- Order Status
- Kitchen Queue

----------------------------

Review Module

Responsibilities

- Dish Reviews
- Review Validation

----------------------------

Analytics Module

Responsibilities

- Revenue
- Orders
- Popular Dishes
- Ratings

----------------------------

Staff Module

Responsibilities

- Kitchen Staff
- Waiters
- Permissions

---

# 4. Backend Architecture

The backend follows Layered Architecture.

Controller Layer

↓

Service Layer

↓

Repository Layer

↓

Database

Controllers must never access repositories directly.

Business logic belongs only inside services.

Repositories should contain only persistence logic.

---

# 5. Backend Package Structure

backend/src/main/java/com/restrobuild

config/

security/

auth/

restaurant/

menu/

category/

order/

orderitem/

review/

staff/

analytics/

qr/

common/

exception/

validation/

dto/

mapper/

repository/

service/

controller/

entity/

util/

websocket/

---

# 6. Layer Responsibilities

Controller

Responsibilities

- Receive Request
- Validate Request
- Call Service
- Return Response

Controllers should never contain business logic.

----------------------------

Service

Responsibilities

- Business Logic
- Transactions
- Authorization Rules
- Validation

----------------------------

Repository

Responsibilities

- Database Queries

Repositories should never contain business rules.

----------------------------

Entity

Responsibilities

- Database Mapping

Entities should not be exposed directly to frontend.

Always use DTOs.

----------------------------

DTO

Responsibilities

Transfer data between backend and frontend.

Separate DTOs should be created for

- Request
- Response

---

# 7. Frontend Architecture

Frontend uses React.

Architecture

Pages

↓

Layouts

↓

Components

↓

Shared Components

↓

Services

↓

REST APIs

State should never directly call backend.

Always use service classes.

---

# 8. Frontend Folder Structure

frontend/src

assets/

components/

common/

layouts/

pages/

hooks/

services/

contexts/

routes/

utils/

constants/

styles/

types/

---

# 9. Dashboard Separation

Three completely separate dashboards.

Admin Dashboard

Restaurant Owner

Staff Dashboard

Kitchen

Waiter

Customer Website

Public

Each dashboard should have independent navigation.

---

# 10. API Architecture

RESTful APIs.

Naming Rules

GET

/api/restaurants

POST

/api/orders

PUT

/api/menu-items/{id}

DELETE

/api/categories/{id}

No verbs inside URLs.

Good

/api/orders

Bad

/api/createOrder

---

# 11. Authentication Flow

Restaurant Owner

↓

Login

↓

JWT Generated

↓

Refresh Token Generated

↓

JWT sent with every request

↓

Backend validates token

↓

Role checked

↓

API executed

---

# 12. Authorization Strategy

Role Based Access Control (RBAC)

Roles

OWNER

KITCHEN

WAITER

CUSTOMER (Guest for MVP)

Permissions are checked inside service layer.

Never trust frontend permissions.

---

# 13. Multi-Tenant Strategy

Every business entity belongs to one Restaurant.

Examples

Restaurant

↓

Categories

↓

Menu

↓

Orders

↓

Reviews

↓

Staff

Every request must verify restaurant ownership.

Restaurant A must never access Restaurant B data.

Restaurant ID should always be derived from the authenticated owner or QR context—not trusted from arbitrary client input.

---

# 14. Database Design Principles

Use Long IDs consistently project-wide.

MySQL is the primary database.

Use InnoDB for transactional tables.

Use `utf8mb4` character encoding.

Primary keys use MySQL `AUTO_INCREMENT` through JPA `GenerationType.IDENTITY`.

Foreign Keys must always be enforced.

Soft delete is preferred where data history is valuable (restaurants, menu items, reviews).

Indexes should exist on

- restaurant_id
- category_id
- order_id
- table_id
- status

No duplicated data.

Normalization until practical.

Repository queries should prefer Spring Data derived queries or JPQL. Native SQL should be avoided unless a MySQL-specific optimization is intentionally required and documented.

---

# 15. Image Storage

Store only image URLs in database.

Images stored in

Development

Local Storage

Future

Cloud Storage

Storage implementation should be replaceable.

---

# 16. WebSocket Architecture

WebSocket is used only for real-time events.

Examples

New Order

Order Preparing

Order Ready

Order Served

Do not use WebSockets for CRUD operations.

CRUD continues through REST APIs.

---

# 17. Error Handling

Global Exception Handler.

Every error returns

timestamp

status

error

message

path

Never expose stack traces.

---

# 18. Logging

Log

Authentication

Errors

Orders

Payments (Future)

Do not log

Passwords

JWT

Sensitive Information

---

# 19. Validation

Validation must exist on both

Frontend

Backend

Backend validation is mandatory.

Never rely only on frontend validation.

---

# 20. Security Principles

Passwords

BCrypt

JWT Authentication

Role Based Authorization

HTTPS Ready

Parameterized Queries

Input Validation

Output Sanitization

No sensitive information in responses.

---

# 21. Coding Principles

Follow

SOLID

DRY

KISS

YAGNI

Composition over inheritance where appropriate.

Avoid God Classes.

Avoid Utility classes containing business logic.

---

# 22. Scalability Principles

Architecture should support future modules without major redesign.

Future modules include

Payments

Inventory

Reservations

Delivery

Loyalty

Multi-Branch

Custom Domains

AI Features

---

# 23. Deployment Architecture

Frontend

↓

Spring Boot

↓

MySQL

↓

Image Storage

Environment variables must be used for configuration.

---

# 24. Technology Stack

Frontend

React

React Router

Axios

Backend

Java 21

Spring Boot

Spring Security

Spring Data JPA

Hibernate

JWT

WebSocket

Database

MySQL

Build Tool

Maven

Documentation

Swagger/OpenAPI

# 25. Architecture Rules

The following rules are mandatory.

Controllers never contain business logic.

Repositories never contain business logic.

Entities are never returned directly.

Always use DTOs.

Never bypass service layer.

Never access repositories from controllers.

Every endpoint must be authenticated unless explicitly public.

Every business entity must belong to exactly one restaurant.

Restaurant isolation must never be violated.

All business rules belong inside services.

Frontend must communicate only through API service classes.

Shared components should be reusable.

Hardcoded values must be avoided.

Future extensibility should always be considered before introducing breaking changes.

---

# 26. Source of Truth

This document defines the technical architecture of RestroBuild.

All future implementation must follow this architecture.

If implementation conflicts with this architecture, the architecture must be updated before code is changed.
