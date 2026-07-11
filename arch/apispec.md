# API Specification

Project: RestroBuild

Version: 1.0.0

Status: Approved

---

# Purpose

This document defines every REST API exposed by the backend.

Every endpoint must follow REST principles.

All request and response bodies use JSON.

Base URL

/api

---

# General API Rules

Content-Type

application/json

Authentication

JWT Bearer Token

Authorization: Bearer <token>

Response Format

Every successful response should follow:

{
    "success": true,
    "message": "...",
    "data": {}
}

Every failed response should follow:

{
    "success": false,
    "message": "...",
    "errors": []
}

---

# HTTP Status Codes

200 OK

201 Created

400 Bad Request

401 Unauthorized

Returned as the standard API failure envelope with `Authentication required.` when a protected endpoint is called without a valid access token.

403 Forbidden

Returned as the standard API failure envelope with `Permission denied.` when the authenticated user lacks permission.

404 Not Found

409 Conflict

500 Internal Server Error

---

# ============================
# Authentication APIs
# ============================

---

## Register Owner

POST

/api/auth/register

Authentication

Public

Description

Creates a new restaurant owner account.

Request

{
    "name": "",
    "email": "",
    "password": ""
}

Response

201 Created

{
    "success": true,
    "message": "Registration successful."
}

Validation

- Name required
- Email unique
- Valid email
- Password minimum 8 characters

---

## Login

POST

/api/auth/login

Authentication

Public

Request

{
    "email": "",
    "password": ""
}

Response

{
    "success": true,
    "message": "Login successful.",
    "data": {
        "accessToken": "",
        "refreshToken": "",
        "role": "OWNER"
    }
}

Validation

Email exists.

Password matches.

---

## Refresh Token

POST

/api/auth/refresh

Authentication

Public

Request

{
    "refreshToken":""
}

Response

{
    "accessToken":""
}

---

## Logout

POST

/api/auth/logout

Authentication

Required

Response

200 OK

---

# ============================
# Restaurant APIs
# ============================

---

## Create Restaurant

POST

/api/restaurants

Authentication

OWNER

Description

Creates restaurant profile.

Request

{
    "name":"",
    "description":"",
    "address":"",
    "phone":"",
    "email":"",
    "openingHours":""
}

Response

201 Created

Returns created restaurant.

---

## Get Restaurant

GET

/api/restaurants/me

Authentication

OWNER

Description

Returns logged in owner's restaurant.

---

## Update Restaurant

PUT

/api/restaurants/me

Authentication

OWNER

Description

Updates restaurant profile.

Request

{
    "name":"",
    "description":"",
    "address":"",
    "phone":"",
    "email":"",
    "openingHours":""
}

Response

Updated restaurant.

---

## Upload Media

POST

/api/uploads/media

Authentication

OWNER

Content Type

multipart/form-data

Request

file

Response

Uploaded image URL. The returned URL can be stored as a restaurant logo, restaurant cover image, or menu item image.

---

# ============================
# Website APIs
# ============================

---

## Get Website Settings

GET

/api/website

Authentication

OWNER

Returns

Current website settings.

---

## Update Website Theme

PUT

/api/website/theme

Authentication

OWNER

Request

{
    "template":"MODERN",
    "primaryColor":"#FF0000",
    "secondaryColor":"#FFFFFF"
}

Response

Updated theme.

---

## Update About Section

PUT

/api/website/about

Authentication

OWNER

Request

{
    "about":"..."
}

Response

Updated successfully.

---

## Publish Website

POST

/api/website/publish

Authentication

OWNER

Description

Publishes restaurant website.

Response

{
    "websiteUrl":"https://..."
}

---

## Public Restaurant Website

GET

/api/public/{restaurantSlug}

Authentication

Public

Returns

Restaurant information

Website theme

About section

Contact information

---

## Public Homepage

GET

/api/public/{restaurantSlug}/home

Authentication

Public

Returns

Homepage data.

---

## Public About

GET

/api/public/{restaurantSlug}/about

Authentication

Public

Returns

About section.

---

## Public Contact

GET

/api/public/{restaurantSlug}/contact

Authentication

Public

Returns

Restaurant contact information.

---

# Validation Rules

Restaurant Name

Required

Maximum 100 characters

Description

Maximum 1000 characters

Phone

Required

Valid phone number

Email

Required

Valid email

Opening Hours

Required

Logo

Image only

Maximum 5 MB

Cover Image

Image only

Maximum 10 MB

---

# Error Responses

400

Validation failed.

401

Authentication required.

403

Access denied.

404

Restaurant not found.

409

Email already exists.

500

Unexpected server error.

# =====================================================
# Category APIs
# =====================================================

## Create Category

POST

/api/categories

Authentication

OWNER

Description

Creates a new menu category.

Request

{
    "name": "Starters",
    "displayOrder": 1
}

Response

201 Created

Returns created category.

Validation

- Name required
- Name unique within restaurant

---

## Get All Categories

GET

/api/categories

Authentication

OWNER

Description

Returns all categories of the restaurant.

---

## Update Category

PUT

/api/categories/{categoryId}

Authentication

OWNER

Request

{
    "name": "Main Course",
    "displayOrder": 2
}

Response

Updated category.

---

## Delete Category

DELETE

/api/categories/{categoryId}

Authentication

OWNER

Description

Deletes category.

Business Rule

Category cannot be deleted if menu items exist inside it.

---

## Public Categories

GET

/api/public/{restaurantSlug}/categories

Authentication

Public

Description

Returns visible categories for customers.

---

# =====================================================
# Menu Item APIs
# =====================================================

## Create Menu Item

POST

/api/menu-items

Authentication

OWNER

Content Type

application/json

Description

Creates a new dish.

Request Fields

categoryId

name

description

price

foodType

spicyLevel

sweetLevel

preparationTime

isAvailable

imageUrl

MVP implementation accepts image URLs in JSON and the frontend displays previews before saving. Multipart image upload will be added with the image storage infrastructure.

Response

201 Created

Returns created menu item.

Validation

- Name required
- Price > 0
- Category must exist
- Preparation time >= 1 minute

---

## Get All Menu Items

GET

/api/menu-items

Authentication

OWNER

Description

Returns all menu items including hidden items.

---

## Get Menu Item

GET

/api/menu-items/{menuItemId}

Authentication

OWNER

Returns menu item details.

---

## Update Menu Item

PUT

/api/menu-items/{menuItemId}

Authentication

OWNER

Content Type

application/json

Description

Updates menu item.

Request

Same fields as Create Menu Item.

MVP implementation accepts `imageUrl` in JSON and the frontend displays previews before saving. Multipart image upload will be added with the image storage infrastructure.

---

## Delete Menu Item

DELETE

/api/menu-items/{menuItemId}

Authentication

OWNER

Business Rule

Menu items referenced by previous orders must not be physically deleted.

Instead

Mark as hidden.

---

## Hide Menu Item

PATCH

/api/menu-items/{menuItemId}/hide

Authentication

OWNER

Response

Menu item hidden.

---

## Show Menu Item

PATCH

/api/menu-items/{menuItemId}/show

Authentication

OWNER

Response

Menu item visible.

---

## Toggle Availability

PATCH

/api/menu-items/{menuItemId}/availability

Authentication

OWNER

Request

{
    "available": true
}

Response

Availability updated.

---

## Public Menu

GET

/api/public/{restaurantSlug}/menu

Authentication

Public

Description

Returns all visible menu items.

Only

- Visible
- Available

items are returned.

---

## Public Menu Item

GET

/api/public/{restaurantSlug}/menu/{menuItemId}

Authentication

Public

Returns

Dish details.

---

## Search Menu

GET

/api/public/{restaurantSlug}/menu/search

Authentication

Public

Query Parameters

keyword

Example

/menu/search?keyword=paneer

---

## Filter Menu

GET

/api/public/{restaurantSlug}/menu/filter

Authentication

Public

Query Parameters

categoryId

foodType

spicyLevel

sweetLevel

available

Example

/menu/filter?foodType=VEG

---

## Sort Menu

GET

/api/public/{restaurantSlug}/menu/sort

Authentication

Public

Query Parameters

sortBy

Supported Values

PRICE_ASC

PRICE_DESC

---

# =====================================================
# Restaurant Table APIs
# =====================================================

## Create Restaurant Tables

POST

/api/tables

Authentication

OWNER

Description

Creates restaurant tables.

Request

{
    "numberOfTables":20
}

Response

List of created tables.

---

## Get All Tables

GET

/api/tables

Authentication

OWNER

Returns

All restaurant tables.

---

## Update Table

PUT

/api/tables/{tableId}

Authentication

OWNER

Request

{
    "tableNumber":15
}

Response

Updated table.

Validation

Table number must be unique.

---

## Delete Table

DELETE

/api/tables/{tableId}

Authentication

OWNER

Business Rule

Tables with active orders cannot be deleted.

---

# =====================================================
# QR Code APIs
# =====================================================

## Generate QR Codes

POST

/api/qr/generate

Authentication

OWNER

Description

Generates QR codes for every table.

Response

QR URLs.

MVP stores QR target URLs. The owner dashboard can render QR previews and PNG downloads from those target URLs without storing QR image files.

---

## Regenerate QR

POST

/api/qr/regenerate/{tableId}

Authentication

OWNER

Description

Generates new QR for a specific table.

---

## Download QR

GET

/api/qr/{tableId}

Authentication

OWNER

Description

Downloads QR image.

Response

PNG Image

MVP returns an authenticated redirect to a generated PNG QR image for the table target URL.

---

## Validate QR

GET

/api/public/qr/{tableId}

Authentication

Public

Description

Validates QR.

Returns

Restaurant information

Table information

Business Rules

Invalid QR

↓

404 Not Found

Inactive table

↓

403 Forbidden

---

# Validation Rules

Category Name

Required

Maximum 50 characters

Menu Name

Required

Maximum 100 characters

Description

Maximum 1000 characters

Price

Must be greater than zero.

Preparation Time

Minimum 1 minute.

Food Type

Must be

VEG

NON_VEG

Image

JPEG

PNG

WEBP

Maximum Size

5 MB

Table Number

Positive integer.

Unique within restaurant.

---

# Error Responses

400

Validation failed.

401

Authentication required.

403

Access denied.

404

Resource not found.

409

Duplicate category or table number.

500

Unexpected server error.

# =====================================================
# Cart APIs
# =====================================================

## Get Current Cart

GET

/api/cart

Authentication

Public

Description

Returns the current cart for the customer's session.

Response

{
    "items": [],
    "subtotal": 0
}

---

## Add Item To Cart

POST

/api/cart/items

Authentication

Public

Request

{
    "menuItemId": 12,
    "quantity": 2,
    "specialInstructions": "Less spicy"
}

Response

Updated cart.

Validation

- Menu item must exist
- Menu item must be available
- Quantity > 0

---

## Update Cart Item

PUT

/api/cart/items/{cartItemId}

Authentication

Public

Request

{
    "quantity": 3,
    "specialInstructions": "No onion"
}

Response

Updated cart.

---

## Remove Cart Item

DELETE

/api/cart/items/{cartItemId}

Authentication

Public

Response

Item removed successfully.

---

## Clear Cart

DELETE

/api/cart

Authentication

Public

Response

Cart cleared.

---

# =====================================================
# Order APIs
# =====================================================

## Place Order

POST

/api/orders

Authentication

Public

Description

Creates a new order.

MVP implementation accepts order items directly in the request until server-side cart/dining-session storage is introduced.

Request

{
    "tableId": 5,
    "items": [
        {
            "menuItemId": 12,
            "quantity": 2
        }
    ],
    "specialInstructions": "Less spicy"
}

Response

201 Created

{
    "orderId": 101,
    "status": "PENDING"
}

Business Rules

- Order items must not be empty.
- All menu items must be available.
- Table must exist.
- Table must belong to the restaurant.

---

## Get Order

GET

/api/orders/{orderId}

Authentication

Public

Description

Returns complete order details.

Item response fields include `reviewed`, which tells the public order tracking page whether a served order item already has a submitted review.

---

## Get Current Table Orders

GET

/api/orders/table/{tableId}

Authentication

Public

Description

Returns all active orders for a table.

---

## Get Table Bill

GET

/api/orders/table/{tableId}/bill

Authentication

Public

Description

Returns the current table bill across all non-cancelled orders for the QR table context.

Response

```json
{
  "success": true,
  "message": "Table bill fetched successfully.",
  "data": {
    "tableId": 4,
    "tableNumber": 4,
    "orderCount": 2,
    "itemCount": 4,
    "subtotal": 900.00,
    "totalAmount": 900.00,
    "items": [
      {
        "orderId": 55,
        "orderStatus": "SERVED",
        "orderItemId": 1,
        "menuItemId": 7,
        "menuItemName": "Paneer Tikka",
        "quantity": 2,
        "price": 250.00,
        "subtotal": 500.00
      }
    ]
  }
}
```

MVP dining-session note

Until explicit dining-session storage exists, the table bill is derived from all non-cancelled orders currently associated with the active table.

---

## Get Restaurant Orders

GET

/api/orders

Authentication

OWNER

Description

Returns all restaurant orders.

Supports filters

status

date

tableNumber

Query parameters are optional and may be combined.

---

## Cancel Order

PATCH

/api/orders/{orderId}/cancel

Authentication

OWNER

Description

Cancels an order.

Business Rule

Only pending orders may be cancelled.

---

# =====================================================
# Kitchen APIs
# =====================================================

## Get Pending Orders

GET

/api/kitchen/orders/pending

Authentication

KITCHEN

Description

Returns all pending orders.

---

## Get Preparing Orders

GET

/api/kitchen/orders/preparing

Authentication

KITCHEN

Returns

Preparing orders.

---

## Get Ready Orders

GET

/api/kitchen/orders/ready

Authentication

KITCHEN

Returns

Ready orders.

---

## Start Preparing Order

PATCH

/api/kitchen/orders/{orderId}/prepare

Authentication

KITCHEN

Description

Changes status

PENDING

↓

PREPARING

---

## Mark Order Ready

PATCH

/api/kitchen/orders/{orderId}/ready

Authentication

KITCHEN

Description

Changes status

PREPARING

↓

READY

---

# =====================================================
# Waiter APIs
# =====================================================

## Get Ready Orders

GET

/api/waiter/orders/ready

Authentication

WAITER

Returns

Ready orders.

---

## Get Served Orders

GET

/api/waiter/orders/served

Authentication

WAITER

Returns

Served order history.

---

## Mark Order Served

PATCH

/api/waiter/orders/{orderId}/served

Authentication

WAITER

Description

Changes status

READY

↓

SERVED

---

# =====================================================
# Order Tracking APIs
# =====================================================

## Track Order

GET

/api/orders/{orderId}/status

Authentication

Public

Description

Returns current order status.

Response

{
    "orderId":101,
    "status":"PREPARING",
    "estimatedTime":15
}

---

## Get Order History

GET

/api/orders/{orderId}/timeline

Authentication

Public

Description

Returns complete order status timeline.

Response

```json
{
  "success": true,
  "message": "Order timeline fetched successfully.",
  "data": [
    {
      "status": "PENDING",
      "label": "Placed",
      "description": "The kitchen has received your order.",
      "state": "completed",
      "timestamp": "2026-07-10T10:00:00Z"
    },
    {
      "status": "READY",
      "label": "Ready",
      "description": "Your order is ready for service.",
      "state": "current",
      "timestamp": "2026-07-10T10:18:00Z"
    }
  ]
}
```

Timestamp note

The MVP stores order creation time and latest order update time. Timeline steps include timestamps where those values are known and return `null` for historical transition times that are not separately stored.

Example

Order Created

↓

Preparing

↓

Ready

↓

Served

---

# =====================================================
# Dashboard APIs
# =====================================================

## Dashboard Summary

GET

/api/dashboard

Authentication

OWNER

Returns

Today's Orders

Today's Revenue

Average Rating

Popular Dish

Least Ordered Dish

---

## Recent Orders

GET

/api/dashboard/recent-orders

Authentication

OWNER

Returns

Latest restaurant orders.

---

## Revenue Statistics

GET

/api/dashboard/revenue

Authentication

OWNER

Returns

Revenue summary.

Supports

Daily

Weekly

Monthly

---

## Popular Dishes

GET

/api/dashboard/popular-dishes

Authentication

OWNER

Returns

Most ordered dishes.

---

# =====================================================
# Validation Rules
# =====================================================

Order

Cart cannot be empty.

Table must exist.

Table must belong to restaurant.

Order Item

Quantity

Minimum

1

Maximum

99

Special Instructions

Maximum

500 characters.

---

# Order Status Flow

PENDING

↓

PREPARING

↓

READY

↓

SERVED

Optional

↓

CANCELLED

---

# Error Responses

400

Validation failed.

401

Authentication required.

403

Access denied.

404

Order not found.

409

Invalid order state transition.

500

Unexpected server error.

# =====================================================
# Review APIs
# =====================================================

## Submit Review

POST

/api/reviews

Authentication

Public

Description

Submits a review for a dish.

Request

{
    "orderItemId": 25,
    "rating": 5,
    "comment": "Very delicious."
}

Response

201 Created

Returns created review.

Business Rules

- Order item must exist.
- Dish must belong to the restaurant.
- Review allowed only once per order item.
- Rating must be between 1 and 5.

---

## Get Restaurant Reviews

GET

/api/reviews

Authentication

OWNER

Description

Returns all reviews of the restaurant.

Supports Filters

rating

menuItemId

---

## Get Menu Item Reviews

GET

/api/public/menu-items/{menuItemId}/reviews

Authentication

Public

Description

Returns all visible reviews of a menu item.

---

## Hide Review

PATCH

/api/reviews/{reviewId}/hide

Authentication

OWNER

Description

Hides review from public website.

---

## Unhide Review

PATCH

/api/reviews/{reviewId}/show

Authentication

OWNER

Description

Makes review visible again.

---

## Delete Review

DELETE

/api/reviews/{reviewId}

Authentication

OWNER

Description

Deletes a review permanently.

---

# =====================================================
# Staff APIs
# =====================================================

## Create Staff

POST

/api/staff

Authentication

OWNER

Description

Creates a new staff account.

Request

{
    "name":"Rahul",
    "email":"rahul@example.com",
    "password":"password123",
    "role":"KITCHEN"
}

Response

201 Created

Returns created staff.

Validation

- Email unique
- Role must be KITCHEN or WAITER

---

## Get All Staff

GET

/api/staff

Authentication

OWNER

Description

Returns all staff members.

---

## Get Staff Details

GET

/api/staff/{staffId}

Authentication

OWNER

Returns

Staff details.

---

## Update Staff

PUT

/api/staff/{staffId}

Authentication

OWNER

Request

{
    "name":"Rahul Sharma",
    "email":"rahul@example.com",
    "role":"WAITER"
}

Response

Updated staff.

---

## Disable Staff

PATCH

/api/staff/{staffId}/disable

Authentication

OWNER

Description

Disables staff login.

---

## Enable Staff

PATCH

/api/staff/{staffId}/enable

Authentication

OWNER

Description

Enables staff login.

---

## Delete Staff

DELETE

/api/staff/{staffId}

Authentication

OWNER

Description

Deletes staff account.

Business Rule

Owner account cannot be deleted.

---

# =====================================================
# Analytics APIs
# =====================================================

## Dashboard Summary

GET

/api/analytics/summary

Authentication

OWNER

Returns

- Total Orders
- Today's Orders
- Total Revenue
- Average Rating

---

## Daily Revenue

GET

/api/analytics/revenue/daily

Authentication

OWNER

Returns

Daily revenue data.

---

## Weekly Revenue

GET

/api/analytics/revenue/weekly

Authentication

OWNER

Returns

Weekly revenue.

---

## Monthly Revenue

GET

/api/analytics/revenue/monthly

Authentication

OWNER

Returns

Monthly revenue.

---

## Most Ordered Dishes

GET

/api/analytics/menu-items/top

Authentication

OWNER

Returns

Most ordered dishes.

---

## Least Ordered Dishes

GET

/api/analytics/menu-items/bottom

Authentication

OWNER

Returns

Least ordered dishes.

---

## Category Statistics

GET

/api/analytics/categories

Authentication

OWNER

Returns

Orders grouped by category.

---

## Ratings Summary

GET

/api/analytics/ratings

Authentication

OWNER

Returns

Average rating

Rating distribution

Total reviews

---

# =====================================================
# Common Validation Rules
# =====================================================

Email

- Required
- Valid format
- Maximum 255 characters

Password

- Minimum 8 characters
- Maximum 100 characters

Name

- Required
- Maximum 100 characters

Price

- Greater than 0

Rating

- Integer
- Between 1 and 5

Quantity

- Minimum 1
- Maximum 99

Image

- JPG
- PNG
- WEBP

Maximum Size

5 MB

---

# =====================================================
# Common Error Codes
# =====================================================

400

Validation failed.

401

Authentication required.

403

Permission denied.

404

Requested resource not found.

409

Conflict.

422

Business rule violation.

500

Unexpected server error.

---

# =====================================================
# API Design Rules
# =====================================================

- RESTful endpoint naming.
- Use plural resource names.
- Never expose database entities directly.
- Always return DTOs.
- Use pagination for list endpoints where appropriate.
- All timestamps use ISO-8601 format.
- All monetary values use decimal type.
- Every protected endpoint requires JWT authentication.
- Every request must enforce restaurant data isolation.
- Consistent success and error response structure across all APIs.

---

# Source of Truth

All backend controllers, services, DTOs, and frontend API integrations must follow this API specification.

Any API changes must first be reflected in this document before implementation.
