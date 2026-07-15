# Database Design

Project: RestroBuild

Version: 1.0.0

Status: Approved

---

# Purpose

This document defines the complete database design for RestroBuild MVP.

It specifies every entity, its attributes, relationships, constraints, and design rules.

The database should be normalized and designed for scalability while keeping the MVP simple.

---

# Database

MySQL

---

# MySQL Storage Conventions

Storage engine

InnoDB

Character set

utf8mb4

Collation

utf8mb4_unicode_ci

Boolean values

Use MySQL boolean-compatible columns through JPA mappings. Physical MySQL storage may use `TINYINT(1)`.

Date and time values

Use Java `Instant` in backend entities and MySQL `DATETIME(6)` or equivalent Hibernate-managed timestamp columns.

Money values

Use `DECIMAL(10,2)`.

Text values

Use bounded `VARCHAR` columns for short fields and `TEXT` only for long descriptive content.

---

# Primary Key Strategy

Every table uses

Long BIGINT

MySQL AUTO_INCREMENT

Example

id BIGINT AUTO_INCREMENT PRIMARY KEY

---

# Common Columns

Unless specified otherwise, every table should contain

created_at

updated_at

---

# Column Type Rules

Identifiers

`BIGINT AUTO_INCREMENT`

Short names and emails

`VARCHAR`

Descriptions and long comments

`TEXT` or bounded `VARCHAR` when the maximum length is known.

Prices and monetary totals

`DECIMAL(10,2)`

Flags

MySQL boolean-compatible storage through JPA, physically compatible with `TINYINT(1)`.

Timestamps

`DATETIME(6)` or the Hibernate-managed MySQL equivalent.

---

# Entity Relationship Overview

Restaurant
│
├── WebsiteTheme
├── Category
│      └── MenuItem
├── RestaurantTable
│      └── QRCode
├── PublicCart
│      └── PublicCartItem
├── Staff
├── Order
│      └── OrderItem
└── Review

---

# Table : restaurant

Purpose

Stores restaurant information.

Columns

id

name

slug

description

address

phone

email

opening_hours

logo_url

cover_image_url

primary_color

secondary_color

template_name

about

is_published

is_active

created_at

updated_at

Relationships

Restaurant

↓

Many Categories

↓

Many Menu Items

↓

Many Tables

↓

Many Staff

↓

Many Orders

↓

Many Reviews

↓

Many Public Carts

---

# Table : owner

Purpose

Stores restaurant owner account.

Columns

id

restaurant_id (FK)

name

email

password_hash

is_verified

is_active

created_at

updated_at

Business Rules

One owner belongs to one restaurant after restaurant creation.

For MVP onboarding, `restaurant_id` may be null immediately after owner registration and must be assigned when the owner creates the restaurant profile.

Once assigned, an owner may not be assigned to another restaurant in MVP.

Email must be unique.

Password stored using BCrypt.

---

# Table : staff

Purpose

Restaurant employees.

Columns

id

restaurant_id (FK)

name

email

password_hash

role

is_active

created_at

updated_at

Role Enum

ROLE_KITCHEN

ROLE_WAITER

API requests may use KITCHEN or WAITER; the backend normalizes these to ROLE_KITCHEN or ROLE_WAITER for Spring Security authorization.

Business Rules

Staff belongs to exactly one restaurant.

Email unique.

---

# Table : category

Purpose

Dish categories.

Columns

id

restaurant_id (FK)

name

display_order

is_active

created_at

updated_at

Examples

Starters

Desserts

Drinks

Main Course

Business Rules

Category names should be unique within one restaurant.

---

# Table : menu_item

Purpose

Stores dishes.

Columns

id

restaurant_id (FK)

category_id (FK)

name

description

price

image_url

food_type

spicy_level

sweet_level

preparation_time

is_available

is_hidden

created_at

updated_at

Food Type Enum

VEG

NON_VEG

Spicy Level

0

1

2

3

Sweet Level

0

1

2

3

Business Rules

Hidden dishes are not shown.

Unavailable dishes are visible but cannot be ordered.

---

# Table : restaurant_table

Purpose

Restaurant tables.

Columns

id

restaurant_id (FK)

table_number

qr_code_url

is_active

created_at

updated_at

Business Rules

Table numbers must be unique within a restaurant.

---

# Table : customer_order

Purpose

Stores customer orders.

Columns

id

restaurant_id (FK)

table_id (FK)

status

total_amount

special_instructions

ordered_at

updated_at

Status Enum

PENDING

PREPARING

READY

SERVED

CANCELLED

Business Rules

Each order belongs to one table.

Each order belongs to one restaurant.

---

# Table : public_cart

Purpose

Stores anonymous public customer carts before order placement.

Columns

id

restaurant_id (FK)

token

created_at

updated_at

Business Rules

Cart tokens identify anonymous customer carts.

One public cart belongs to one restaurant.

Cart tokens must be unique.

---

# Table : public_cart_item

Purpose

Stores dishes inside an anonymous public cart.

Columns

id

cart_id (FK)

menu_item_id (FK)

quantity

special_instructions

Business Rules

Cart item quantity must be between 1 and 99.

Cart item special instructions must be at most 500 characters.

---

# Table : order_item

Purpose

Stores dishes inside an order.

Columns

id

order_id (FK)

menu_item_id (FK)

quantity

price

subtotal

Business Rules

Price should be copied from menu item at ordering time.

Changing menu price later must not affect previous orders.

Subtotal

quantity × price

---

# Table : review

Purpose

Customer reviews.

Columns

id

restaurant_id (FK)

menu_item_id (FK)

order_item_id (FK)

rating

comment

is_visible

created_at

Business Rules

Rating

1–5

One review per order item.

Only ordered dishes can be reviewed.

---

# Relationships

Restaurant

1

↓

Many

Category

Restaurant

1

↓

Many

MenuItem

Restaurant

1

↓

Many

RestaurantTable

Restaurant

1

↓

Many

Staff

Restaurant

1

↓

Many

Order

Restaurant

1

↓

Many

PublicCart

PublicCart

1

↓

Many

PublicCartItem

Restaurant

1

↓

Many

Review

Category

1

↓

Many

MenuItem

RestaurantTable

1

↓

Many

Order

Order

1

↓

Many

OrderItem

MenuItem

1

↓

Many

OrderItem

MenuItem

1

↓

Many

PublicCartItem

MenuItem

1

↓

Many

Review

OrderItem

1

↓

1

Review

---

# Indexes

Restaurant

email

slug

Owner

email

Staff

email

Category

restaurant_id

MenuItem

restaurant_id

category_id

Order

restaurant_id

table_id

status

PublicCart

restaurant_id

token

PublicCartItem

cart_id

menu_item_id

Review

menu_item_id

---

# Constraints

Restaurant

Email unique.

Slug unique.

Owner

Email unique.

Staff

Email unique.

Category

Unique

restaurant_id + name

Restaurant Table

Unique

restaurant_id + table_number

Public Cart

Unique

token

Review

Unique

order_item_id

---

# Cascade Rules

Deleting Restaurant

↓

Delete

Categories

Menu Items

Tables

Staff

Orders

Order Items

Reviews

Deleting Category

↓

Not Allowed

until menu items are reassigned or deleted.

Deleting Menu Item

↓

Not Allowed

if previous orders reference it.

Instead

Mark Hidden.

Deleting Order

↓

Delete Order Items.

---

# Data Integrity Rules

Every Menu Item belongs to exactly one Category.

Every Category belongs to exactly one Restaurant.

Every Order belongs to exactly one Restaurant.

Every Order belongs to exactly one Table.

Every Review belongs to one Menu Item.

Every Staff belongs to one Restaurant.

---

# Naming Conventions

Tables

snake_case

Columns

snake_case

Primary Keys

id

Foreign Keys

entity_name_id

Examples

restaurant_id

category_id

table_id

order_id

---

# Future Expansion

The schema should allow future addition of

Payments

Reservations

Inventory

Coupons

Loyalty

Delivery

without requiring major redesign.

---

# Source of Truth

All JPA entities, repositories, and migrations must follow this document.

No database changes should be introduced unless this document is updated first.
