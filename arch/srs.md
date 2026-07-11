# Software Requirements Specification (SRS)

# Project Name

RestroBuild

---

# Version

1.0 (MVP)

---

# Document Purpose

This document defines the complete Software Requirements Specification (SRS) for the RestroBuild MVP.

It acts as the primary source of truth for the project.

Every architectural decision, database design, backend implementation, frontend implementation, and API must follow this document unless explicitly overridden by a newer version of this SRS.

No feature should be implemented unless it is either:

- explicitly described here
- or added through future revisions of this document.

---

# 1. Project Overview

RestroBuild is a multi-tenant SaaS platform that enables restaurant owners to create and manage their own restaurant website without writing any code.

Restaurant owners can:

- Register their restaurant
- Choose a website template
- Customize branding
- Add menu items
- Publish their restaurant website
- Generate QR codes for restaurant tables
- Receive customer orders digitally
- Manage kitchen workflow
- Collect verified customer reviews
- View business analytics

Customers simply scan a QR code placed on the restaurant table to access the restaurant website, browse the menu, place orders, track order status, and submit reviews.

This platform is **NOT** a food delivery application like Zomato or Swiggy.

Its primary purpose is to digitize dine-in restaurants by providing them with a branded website and QR-based ordering system.

---

# 2. Project Goals

The MVP should demonstrate the following capabilities:

- Multi-tenant SaaS architecture
- Production-quality backend
- Production-quality frontend
- Secure authentication
- Restaurant website generation
- Menu management
- QR ordering
- Kitchen order management
- Real-time order updates
- Verified reviews
- Analytics dashboard

The project should resemble a commercial SaaS product rather than a college CRUD application.

---

# 3. Target Users

The platform is intended for:

- Small restaurants
- Cafes
- Fast food outlets
- Cloud kitchens
- Fine dining restaurants
- Food courts

---

# 4. User Roles

The platform contains four roles.

## 1. Restaurant Owner

Responsibilities

- Manage restaurant
- Manage website
- Manage menu
- View analytics
- Manage staff
- View orders
- Manage reviews

---

## 2. Kitchen Staff

Responsibilities

- View incoming orders
- Update order preparation status

Cannot

- Modify restaurant information
- Access analytics
- Manage users

---

## 3. Waiter

Responsibilities

- View ready orders
- Mark orders as served

Cannot

- Modify menu
- Modify restaurant settings
- Access analytics

---

## 4. Customer

Responsibilities

- Browse menu
- Place orders
- Track order status
- Submit reviews

Customers do not require an account for MVP.

---

# 5. Project Scope (MVP)

The MVP includes the following modules.

## Restaurant Management

- Registration
- Login
- Restaurant Profile
- Website Customization

---

## Website Builder

- Predefined templates
- Theme customization
- Public restaurant website

No drag-and-drop editor will be implemented in MVP.

---

## Menu Management

Restaurant owners can

- Create categories
- Edit categories
- Delete categories

Restaurant owners can

- Add dishes
- Edit dishes
- Delete dishes
- Hide dishes

---

## QR Ordering

Every restaurant receives

- Restaurant QR
- Table-specific QR Codes

Customers scan QR and immediately access the restaurant website.

Table number should be automatically identified.

---

## Ordering System

Customers can

- Browse menu
- Filter menu
- Search dishes
- Add dishes to cart
- Update quantities
- Place order
- Add special instructions

---

## Kitchen Management

Kitchen staff should receive orders in real time.

Kitchen can update

Pending

↓

Preparing

↓

Ready

---

## Waiter Management

Waiters can

View Ready Orders

Mark Order Served

---

## Customer Tracking

Customers can

- View order status
- Add more items during dining
- View bill summary

---

## Reviews

Customers can review only dishes they have ordered.

Restaurant owner can

- View reviews
- Hide reviews
- Delete inappropriate reviews

---

## Analytics

Restaurant owner can view

- Today's Orders
- Total Orders
- Revenue
- Most Ordered Dish
- Least Ordered Dish
- Average Rating

---

# 6. Functional Requirements

## Authentication

The system shall

- Register restaurant owners
- Authenticate users
- Secure passwords using BCrypt
- Issue JWT access tokens
- Issue Refresh Tokens

---

## Restaurant Website

The system shall

Generate a public website for every restaurant.

Each website shall contain

- Home
- About
- Menu
- Contact

---

## Theme Customization

Restaurant owners shall be able to modify

- Primary Color
- Secondary Color
- Logo
- Cover Image
- About Section

---

## Menu

Each menu item shall contain

- Name
- Description
- Price
- Category
- Image
- Veg/Non-Veg
- Spicy Level
- Sweet Level
- Preparation Time
- Availability

---

## Menu Filtering

Customers shall filter menu using

- Category
- Veg
- Non-Veg
- Spicy
- Sweet

Customers shall sort menu using

- Price Low to High
- Price High to Low

---

## Ordering

Customers shall

- Create cart
- Modify cart
- Submit order

Orders shall include

- Table Number
- Ordered Items
- Quantity
- Instructions

---

## Order Status

Possible states

Pending

Preparing

Ready

Served

Cancelled

Only authorized staff can update order status.

---

## Reviews

Reviews shall only be allowed after ordering.

Each review shall contain

- Rating
- Comment

---

## Analytics

The system shall calculate

- Total Revenue
- Order Count
- Popular Dishes
- Average Ratings

---

# 7. Non-Functional Requirements

The application shall satisfy the following quality attributes.

## Performance

- Fast page loading
- Efficient database queries
- Pagination for large datasets

---

## Security

- JWT Authentication
- BCrypt Password Hashing
- Role-Based Authorization
- Input Validation
- SQL Injection Protection
- XSS Protection
- CSRF protection where applicable

---

## Reliability

- Graceful error handling
- Transaction management
- Consistent order state updates

---

## Maintainability

- Clean Architecture
- SOLID Principles
- Layered Architecture
- Modular code

---

## Scalability

The architecture shall support future expansion including

- Multi-branch restaurants
- Delivery
- Loyalty
- Inventory
- Reservations

without requiring major redesign.

---

## Responsiveness

The customer website shall be mobile-first.

Admin dashboard shall support

- Desktop
- Tablet
- Mobile

---

# 8. Business Rules

BR-01

Every restaurant owns its own isolated data.

---

BR-02

Customers may only access one restaurant at a time.

---

BR-03

Every QR code belongs to exactly one restaurant.

---

BR-04

Every table QR belongs to exactly one table.

---

BR-05

Only restaurant staff may update order status.

---

BR-06

Customers may only review dishes they ordered.

---

BR-07

Unavailable dishes shall not be orderable.

---

BR-08

Deleted menu items shall not appear publicly.

---

BR-09

Restaurant owners may customize only their own restaurant.

---

BR-10

Kitchen staff cannot access analytics.

---

BR-11

Waiters cannot modify menus.

---

BR-12

Customers cannot modify restaurant information.

---

# 9. Out of Scope (MVP)

The following features are intentionally excluded.

- Drag-and-drop website builder
- AI features
- Multi-branch restaurants
- Loyalty points
- Inventory management
- Delivery system
- Reservations
- Custom domains
- Multi-language support
- Advanced SEO
- Payroll
- Attendance
- POS integrations
- Video menu uploads

These may be implemented in future versions.

---

# 10. Success Criteria

The MVP is considered complete when a restaurant owner can

1. Register.
2. Login.
3. Create a restaurant.
4. Customize website appearance.
5. Add menu items.
6. Generate table QR codes.
7. Publish restaurant website.
8. Receive customer orders.
9. Update order status.
10. Allow customers to track orders.
11. Collect verified reviews.
12. View analytics dashboard.

---

# 11. Future Enhancements

Future versions may include

- Loyalty Program
- Coupons
- Reservations
- Inventory Management
- Delivery
- AI Menu Generation
- Drag-and-Drop Website Builder
- Multi-Branch Support
- Custom Domains
- Online Payments
- Advanced Analytics
- POS Integration

---

# 12. Source of Truth Policy

This document is the highest-level functional specification of the project.

All future documentation, including

- architecture.md
- database-design.md
- apispec.md
- backendspec.md
- frontendspec.md
- realtimeorderflow.md
- authandpermission.md

must comply with this SRS.

If any document conflicts with this SRS, this SRS takes precedence unless a newer version explicitly replaces it.
