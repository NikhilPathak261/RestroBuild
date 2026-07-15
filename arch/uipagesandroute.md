# UI Pages and Routes Specification

Project: RestroBuild

Version: 1.0.0

Status: Approved

---

# Purpose

This document defines every page, route, layout, and navigation flow of the RestroBuild frontend.

All frontend routing must follow this document.

---

# Route Groups

The application contains four route groups.

1. Authentication
2. Restaurant Owner Dashboard
3. Staff Dashboard
4. Customer Website

---

# Authentication Routes

## Login

Route

/login

Access

Public

Purpose

Authenticate Owner or Staff.

---

## Register

Route

/register

Access

Public

Purpose

Create Restaurant Owner account.

---

# Restaurant Owner Routes

Base Route

/dashboard

Layout

Admin Layout

Accessibility

Includes a skip-to-main-content link and a stable `main` landmark.

Authentication

ROLE_OWNER

---

## Dashboard

Route

/dashboard

MVP Status

Implemented with owner metrics, popular dish, recent orders, realtime refresh, and manual refresh control.

Purpose

Business overview.

Widgets

- Today's Orders
- Revenue
- Average Rating
- Popular Dish
- Recent Orders

---

## Restaurant Profile

Route

/dashboard/profile

MVP Status

Implemented with restaurant details, logo URL/cover URL fields, local image upload helpers, and media previews.

Purpose

Manage restaurant information.

Sections

- Basic Information
- Contact Information
- Opening Hours
- Logo
- Cover Image

---

## Website Settings

Route

/dashboard/website

MVP Status

Implemented with theme selection, color controls, about content editing, publish status, public URL copying, and open-site action.

Purpose

Customize website.

Sections

- Template
- Theme Colors
- About Section
- Publish Website

---

## Category Management

Route

/dashboard/categories

MVP Status

Implemented with create, edit, delete, search, and manual refresh controls.

Purpose

Manage menu categories.

Actions

- Create
- Edit
- Delete
- Search

---

## Menu Management

Route

/dashboard/menu

MVP Status

Implemented with category assignment, search, manual refresh, image URL entry, local dish image upload helper, previews, availability toggles, hide/show, edit, and delete.

Purpose

Manage menu items.

Actions

- Create
- Edit
- Delete
- Hide
- Toggle Availability

---

## Orders

Route

/dashboard/orders

MVP Status

Implemented with status, table number, and order date filters, owner order status actions, realtime refresh, manual refresh control, and client-side pagination for large MVP result sets.

Purpose

View all restaurant orders.

Filters

- Status
- Date
- Table Number

---

## Reviews

Route

/dashboard/reviews

MVP Status

Implemented with rating filtering, manual refresh, hide/show moderation, delete actions, and client-side pagination for large MVP result sets.

Purpose

Moderate customer reviews.

Actions

- Hide
- Delete

---

## Staff Management

Route

/dashboard/staff

MVP Status

Implemented with create/edit staff forms, search, role/status filters, manual refresh, enable/disable, delete actions, and client-side pagination for large MVP result sets.

Purpose

Manage restaurant staff.

Actions

- Create
- Update
- Disable
- Delete

---

## Analytics

Route

/dashboard/analytics

MVP Status

Implemented with revenue, order, rating, menu item, and category metrics plus manual refresh.

Purpose

Business analytics.

Sections

- Revenue
- Orders
- Ratings
- Popular Dishes

---

# Kitchen Routes

Base Route

/kitchen

Layout

Staff Layout

Accessibility

Includes a skip-to-main-content link and a stable `main` landmark.

Authentication

ROLE_KITCHEN

---

## Pending Orders

Route

/kitchen/pending

MVP Status

Implemented with realtime order updates, manual refresh, and kitchen preparation actions.

---

## Preparing Orders

Route

/kitchen/preparing

MVP Status

Implemented with realtime order updates, manual refresh, and ready-order actions.

---

## Ready Orders

Route

/kitchen/ready

MVP Status

Implemented with realtime order updates and manual refresh.

---

# Waiter Routes

Base Route

/waiter

Layout

Staff Layout

Authentication

ROLE_WAITER

---

## Ready Orders

Route

/waiter/ready

MVP Status

Implemented with realtime order updates, manual refresh, and mark-served action.

---

## Served Orders

Route

/waiter/served

MVP Status

Implemented with served order history, realtime order updates, and manual refresh for waiter users.

---

# Customer Website

Base Route

/r/{restaurantSlug}

Authentication

Public

Layout

Public Layout

Accessibility

Includes a skip-to-main-content link and wraps routed customer pages in a stable `main` landmark.

---

## Homepage

Route

/r/{restaurantSlug}

MVP Status

Implemented with restaurant hero content, logo and cover branding, and optional table QR validation when `tableId` is present.

Purpose

Restaurant homepage.

---

## About

Route

/r/{restaurantSlug}/about

MVP Status

Implemented with published restaurant about content and cover image branding when available.

---

## Menu

Route

/r/{restaurantSlug}/menu

MVP Status

Implemented with search, category filtering, food-type filtering, taste-level filtering, price sorting, special instructions, an in-page server-backed order cart, and standalone cart handoff.

---

## Dish Details

Route

/r/{restaurantSlug}/menu/:menuItemId

MVP Status

Implemented with dish description, category, price, food type, preparation time, taste levels, customer reviews, and a back-to-menu action.

---

## Cart

Route

/r/{restaurantSlug}/cart

MVP Status

Implemented with server-backed cart items, anonymous cart token reuse, quantity editing, special instructions, QR-required order placement, and back-to-menu navigation.

---

## Order Tracking

Route

/r/{restaurantSlug}/orders/:orderId

MVP Status

Implemented with live order status, manual refresh, estimated time, progress timeline, itemized order details, special instructions, add-more-items navigation, bill navigation, and served-order review submission.

---

## Bill Summary

Route

/r/{restaurantSlug}/bill/:orderId

MVP Status

Implemented as a public bill summary page with live status context, QR table-level bill aggregation, manual refresh, estimated time, itemized prices, subtotal, total, special instructions, add-more-items navigation for active orders, print action, and a link back to order tracking.

---

## Contact

Route

/r/{restaurantSlug}/contact

MVP Status

Implemented with published restaurant contact details.

---

# Navigation

## Owner Sidebar

Dashboard

Restaurant Profile

Website

Categories

Menu

Orders

Reviews

Staff

Analytics

Logout

---

## Kitchen Sidebar

Pending Orders

Preparing Orders

Ready Orders

Logout

---

## Waiter Sidebar

Ready Orders

Served Orders

Logout

---

## Customer Navigation

Home

Menu

About

Contact

Cart

---

# Route Protection

Public Routes

Accessible without authentication.

Protected Routes

Require valid JWT.

Owner routes require

ROLE_OWNER

Kitchen routes require

ROLE_KITCHEN

Waiter routes require

ROLE_WAITER

Unauthorized access returns

403 Forbidden

Unauthenticated users are redirected to

/login

---

# Breadcrumb Examples

Dashboard

Dashboard

Menu

Dashboard > Menu

Analytics

Dashboard > Analytics

Restaurant Profile

Dashboard > Restaurant Profile

---

# Not Found Page

Route

*

Display

404 Page Not Found

Provide button to return home.

---

# Error Page

Display

Unexpected Error

Retry Button

Go Home Button

---

# Loading Screen

Display during

Initial application load

Lazy-loaded pages

Authentication verification

MVP Status

Implemented with route-level React lazy loading and a shared loading fallback while page chunks load.

---

# Page Titles

Each page should define an appropriate browser title.

Examples

Dashboard | RestroBuild

Menu Management | RestroBuild

Restaurant Profile | RestroBuild

Analytics | RestroBuild

---

# Route Naming Rules

Use lowercase.

Use hyphens where needed.

Do not use spaces.

Use nouns instead of verbs.

Correct

/dashboard/menu

Incorrect

/dashboard/manageMenu

---

# Source of Truth

All frontend routes and navigation must follow this document.

Any routing changes must first be reflected here before implementation.
