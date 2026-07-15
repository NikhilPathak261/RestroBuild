# Authentication and Permission Specification

Project: RestroBuild

Version: 1.0.0

Status: Approved

---

# Purpose

This document defines the authentication and authorization system for RestroBuild MVP.

It specifies:

- User authentication
- JWT authentication
- Role-based access control
- Access permissions
- Security rules

Every protected API must follow this document.

---

# Authentication Method

The platform uses

- JWT Access Token
- Refresh Token

Access Token is sent with every authenticated request.

Access and refresh tokens must carry separate token type claims. Access tokens may authenticate API requests. Refresh tokens may only be used with the refresh endpoint.

Authorization Header

Authorization: Bearer <access_token>

---

# Password Storage

Passwords must never be stored in plain text.

Passwords must be hashed using

BCrypt

Password comparison must always use BCrypt verification.

---

# Login Flow

1. User enters email and password.
2. Credentials are validated.
3. Password hash is verified.
4. Access Token generated.
5. Refresh Token generated.
6. Tokens returned to frontend.
7. Frontend stores tokens securely.
8. Access Token is sent with future requests.

---

# Frontend Token Refresh

When an authenticated API request receives `401 Unauthorized`, the frontend attempts one access-token refresh using the stored refresh token.

If refresh succeeds:

- The new access token is stored.
- The original request is retried once.

If refresh fails:

- Stored auth tokens and role are cleared.
- The app is notified that the session expired.

---

# Logout Flow

1. User clicks logout.
2. Frontend removes stored tokens.
3. User is redirected to login page.

---

# Token Expiration

Access Token

15 Minutes

Refresh Token

7 Days

---

# User Types

The platform has three authenticated user types.

Restaurant Owner

Kitchen Staff

Waiter

Customers do not require authentication in MVP.

---

# Roles

ROLE_OWNER

Full restaurant access.

ROLE_KITCHEN

Kitchen operations only.

ROLE_WAITER

Serving operations only.

---

# Restaurant Owner Permissions

Restaurant Owner can

- View dashboard
- Edit restaurant profile
- Change website theme
- Manage categories
- Manage menu items
- Generate QR codes
- View all orders
- View analytics
- Create staff accounts
- Disable staff accounts
- View reviews
- Hide reviews
- Delete reviews

Restaurant Owner cannot

- Access another restaurant

---

# Kitchen Permissions

Kitchen can

- Login
- View pending orders
- View preparing orders
- View ready orders
- Change order status

MVP bridge

Until staff account creation/login is implemented, restaurant owners may also call kitchen and waiter workflow endpoints for their own restaurant to manually test and operate the order lifecycle.

Kitchen cannot

- Edit restaurant
- Edit menu
- Edit categories
- Manage staff
- View analytics
- Delete orders
- Delete reviews

---

# Waiter Permissions

Waiter can

- Login
- View ready orders
- Mark order served

Waiter cannot

- Edit restaurant
- Edit menu
- Create menu
- Delete menu
- Manage users
- View analytics

---

# Customer Permissions

Customer can

- Browse menu
- Search menu
- Filter menu
- Place order
- View order status
- View bill
- Submit review

Customer cannot

- Modify restaurant
- Modify menu
- Update order status
- Access admin dashboard

---

# Public APIs

These APIs require no authentication.

Restaurant Website

Restaurant Menu

Dish Details

Search Menu

Filter Menu

Place Order

Track Order

Submit Review (subject to business rules)

---

# Protected APIs

Authentication required.

Restaurant Dashboard

Staff Dashboard

Menu Management

Category Management

Restaurant Settings

Analytics

Review Moderation

QR Management

Staff Management

---

# Authorization Rules

Restaurant Owner

Has full access to resources belonging to their own restaurant.

Kitchen

Can only access kitchen operations of their own restaurant.

Waiter

Can only access waiter operations of their own restaurant.

---

# Restaurant Isolation

Every authenticated request must verify

Authenticated User

↓

Restaurant

↓

Requested Resource

If the resource belongs to another restaurant

Return

403 Forbidden

---

# Permission Matrix

| Feature | Owner | Kitchen | Waiter | Customer |
|----------|-------|----------|---------|----------|
| View Restaurant Website | ✓ | ✓ | ✓ | ✓ |
| Edit Restaurant Profile | ✓ | ✗ | ✗ | ✗ |
| Manage Website Theme | ✓ | ✗ | ✗ | ✗ |
| Manage Categories | ✓ | ✗ | ✗ | ✗ |
| Manage Menu | ✓ | ✗ | ✗ | ✗ |
| View Orders | ✓ | ✓ | ✓ | ✗ |
| Update Order Status | ✗ | ✓ | ✓ | ✗ |
| Generate QR Codes | ✓ | ✗ | ✗ | ✗ |
| Manage Staff | ✓ | ✗ | ✗ | ✗ |
| View Analytics | ✓ | ✗ | ✗ | ✗ |
| Moderate Reviews | ✓ | ✗ | ✗ | ✗ |
| Place Order | ✗ | ✗ | ✗ | ✓ |
| View Bill | ✗ | ✗ | ✗ | ✓ |
| Submit Review | ✗ | ✗ | ✗ | ✓ |

---

# Order Status Permissions

Pending

↓

Preparing

Kitchen

Preparing

↓

Ready

Kitchen

Ready

↓

Served

Waiter

Cancelled

Restaurant Owner only

---

# Security Rules

Passwords must never be returned in API responses.

Password hashes must never leave backend.

JWT secret must be stored using environment variables.

The production profile must fail fast when JWT secrets are missing, blank, too short, or still set to the development placeholder.

Production CORS origins must be explicitly configured and must not contain wildcard or blank origins.

Sensitive endpoints require authentication.

Every request must validate JWT.

JWT authentication must only create a security context for an existing, active user.

Login and refresh must reject inactive owner and staff accounts.

Backend service helpers must reject missing authentication as unauthenticated and owner-only lookups by non-owner principals as forbidden.

Application-level missing credential exceptions must return the standard `401 Authentication required.` API failure envelope.

Every request must validate user role.

Every request must validate restaurant ownership.

Backend HTTP responses must include defensive browser security headers, including a restrictive content security policy, no-referrer policy, and frame denial.

---

# HTTP Response Codes

200

Request successful

201

Resource created

400

Validation error

401

Unauthenticated

Security layer responses must use the standard API failure envelope.

403

Forbidden

Forbidden responses must use the standard API failure envelope with `Permission denied.`.

404

Resource not found

409

Conflict

500

Internal server error

---

# Session Rules

A user may be logged in on multiple devices.

Logging out removes local session only.

Refresh token expiration requires login again.

---

# Future Enhancements

Not part of MVP

- Google Login
- GitHub Login
- Two Factor Authentication
- Email Verification Enforcement
- Account Locking
- OAuth2
- Multi-device Session Management

---

# Source of Truth

All authentication, authorization, and security implementations must follow this document.

No authentication behavior should differ from this specification unless this document is updated.
