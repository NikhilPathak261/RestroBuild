# Business Flow Specification

Project: RestroBuild

Version: 1.0.0

Status: Approved

---

# Purpose

This document defines the business workflows of RestroBuild.

It explains how every major feature should behave from the user's perspective.

This document intentionally avoids implementation details such as database schema, APIs, or UI components.

If any implementation conflicts with these business flows, the implementation should be corrected rather than modifying the business flow.

---

# Actors

There are four actors in the system.

1. Restaurant Owner
2. Kitchen Staff
3. Waiter
4. Customer

---

# Overall Business Flow

Restaurant Owner

↓

Creates Restaurant

↓

Customizes Website

↓

Adds Menu

↓

Generates QR Codes

↓

Publishes Website

↓

Customer Scans QR

↓

Customer Places Order

↓

Kitchen Receives Order

↓

Kitchen Updates Status

↓

Waiter Serves Order

↓

Customer Reviews Dish

↓

Owner Views Analytics

---

# Flow 1 : Restaurant Registration

Actor

Restaurant Owner

Steps

1. Owner visits platform.
2. Owner registers using email and password.
3. Email is verified (optional for MVP if mocked).
4. Owner logs in.
5. Owner is redirected to onboarding.

Result

Restaurant owner account is created.

---

# Flow 2 : Restaurant Creation

Actor

Restaurant Owner

Steps

1. Owner enters restaurant information.

- Name
- Address
- Contact Number
- Description
- Opening Hours

2. Restaurant is created.
3. Owner becomes the administrator of that restaurant.

Result

Restaurant profile exists.

Business Rules

One owner can own multiple restaurants in future.

For MVP, one owner owns exactly one restaurant.

---

# Flow 3 : Website Setup

Actor

Restaurant Owner

Steps

1. Select website template.
2. Upload logo.
3. Upload cover image.
4. Choose primary color.
5. Choose secondary color.
6. Edit About section.
7. Save changes.

Result

Restaurant website becomes publicly accessible.

Business Rules

Templates are predefined.

No drag-and-drop editing.

---

# Flow 4 : Menu Management

Actor

Restaurant Owner

Steps

1. Create menu category.
2. Add menu items.
3. Upload image.
4. Set price.
5. Select veg/non-veg.
6. Set spicy level.
7. Set sweet level.
8. Set preparation time.
9. Save.

Result

Dish appears on restaurant website.

Business Rules

Unavailable dishes remain visible (optional) but cannot be ordered.

Hidden dishes are not visible to customers.

---

# Flow 5 : QR Generation

Actor

Restaurant Owner

Steps

1. Owner enters number of tables.
2. System generates QR code for every table.
3. QR codes are downloadable.

Each QR contains

Restaurant Identifier

Table Number

Business Rules

Every QR belongs to exactly one table.

Table numbers are unique within a restaurant.

---

# Flow 6 : Customer Visits Restaurant

Actor

Customer

Steps

1. Customer sits at table.
2. Customer scans QR.
3. QR opens restaurant website.
4. System identifies

Restaurant

Table Number

5. Customer sees menu.

Business Rules

Customer should never manually enter table number.

---

# Flow 7 : Browse Menu

Actor

Customer

Customer can

Search dishes

Filter by

- Category
- Veg
- Non-Veg
- Spicy
- Sweet

Sort by

- Price Low → High
- Price High → Low

Customer views

Image

Description

Price

Rating

Availability

---

# Flow 8 : Cart Management

Actor

Customer

Customer can

Add item

Increase quantity

Decrease quantity

Remove item

Add special instructions

Example

"No onion"

"Extra spicy"

Result

Cart is updated.

---

# Flow 9 : Place Order

Actor

Customer

Steps

1. Customer submits cart.
2. Order is created.
3. Kitchen receives order.
4. Customer receives confirmation.

Business Rules

Order belongs to

Restaurant

Table

Customer Session

Customer cannot order unavailable dishes.

---

# Flow 10 : Kitchen Processing

Actor

Kitchen Staff

Steps

Kitchen sees incoming order.

Kitchen changes status.

Pending

↓

Preparing

↓

Ready

Business Rules

Kitchen cannot mark Served.

Only Waiter can mark Served.

---

# Flow 11 : Waiter Flow

Actor

Waiter

Steps

1. Waiter views Ready Orders.
2. Delivers food.
3. Marks order as Served.

Result

Customer sees Served status.

---

# Flow 12 : Live Order Tracking

Actor

Customer

Customer always sees current order status.

Possible states

Pending

Preparing

Ready

Served

Updates should appear in real time.

Business Rules

Customer cannot modify status.

---

# Flow 13 : Additional Orders

Actor

Customer

Scenario

Customer has already ordered.

Later wishes to order more.

Steps

1. Browse menu.
2. Add new items.
3. Place another order.

Business Rules

New order belongs to the same dining session.

Customer should not lose previous order history.

---

# Flow 14 : Bill Summary

Actor

Customer

Customer can view

Ordered Items

Quantity

Individual Price

Subtotal

Grand Total

Business Rules

Bill represents all served orders within the current dining session.

Payment integration is outside MVP.

---

# Flow 15 : Review Submission

Actor

Customer

Customer selects previously ordered dish.

Customer submits

Rating

Comment

Business Rules

Customer may review only dishes actually ordered.

Each dish may be reviewed once per dining session.

Restaurant owner may hide inappropriate reviews.

---

# Flow 16 : Analytics

Actor

Restaurant Owner

Dashboard displays

Today's Orders

Today's Revenue

Most Ordered Dish

Least Ordered Dish

Average Rating

Total Orders

Business Rules

Analytics are restaurant-specific.

Restaurants never access analytics of another restaurant.

---

# Flow 17 : Staff Management

Actor

Restaurant Owner

Owner can

Create Kitchen Staff

Create Waiters

Disable Staff Accounts

Business Rules

Staff belong to exactly one restaurant.

Staff cannot switch restaurants.

---

# Flow 18 : Logout

Applicable to

Owner

Kitchen

Waiter

Steps

Logout

↓

JWT removed

↓

Session invalidated

↓

Redirect to Login

---

# Dining Session Lifecycle

Customer scans QR

↓

Dining Session starts

↓

Customer browses menu

↓

Order #1

↓

Kitchen

↓

Served

↓

Order #2 (optional)

↓

Kitchen

↓

Served

↓

Bill Viewed

↓

Reviews Submitted

↓

Dining Session Ends

---

# Order Lifecycle

Pending

↓

Preparing

↓

Ready

↓

Served

↓

Completed

Optional

↓

Cancelled

Only staff may update order states.

---

# Business Rules Summary

BR-01

One owner owns one restaurant in MVP.

BR-02

One restaurant has many tables.

BR-03

One table has one QR code.

BR-04

QR identifies restaurant and table.

BR-05

Customer never enters table manually.

BR-06

Kitchen updates only preparation status.

BR-07

Waiter marks Served.

BR-08

Customer may place multiple orders during one dining session.

BR-09

Bill contains all orders from the current dining session.

BR-10

Only ordered dishes can be reviewed.

BR-11

Every staff member belongs to exactly one restaurant.

BR-12

Restaurant data is completely isolated from other restaurants.

BR-13

Unavailable dishes cannot be ordered.

BR-14

Hidden dishes are invisible to customers.

BR-15

Only authenticated owners may modify restaurant configuration.

---

# Future Business Flows (Out of Scope)

The following flows are intentionally excluded from MVP.

- Online Payments
- Reservations
- Loyalty Program
- Inventory Management
- Delivery Orders
- Multi-Branch Restaurants
- Coupon Redemption
- Custom Domains
- AI Features

---

# Source of Truth

All future documents including

- database-design.md
- apispec.md
- backendspec.md
- frontendspec.md

must follow these business workflows.

Any implementation that violates these workflows should be considered incorrect unless this document is officially updated.