# Backend Specification

Project: RestroBuild

Version: 1.0.0

Status: Approved

---

# Purpose

This document defines the backend architecture, coding standards, project structure, and implementation rules for RestroBuild.

Every backend implementation must follow this specification.

---

# Technology Stack

Language

Java 21

Framework

Spring Boot

Security

Spring Security

Authentication

JWT

Database

MySQL

ORM

Spring Data JPA (Hibernate)

Validation

Jakarta Bean Validation

Build Tool

Maven

Documentation

Swagger / OpenAPI

Real-Time Communication

WebSocket

---

# Project Structure

backend/

src/

main/

java/

com/restrobuild/

config/

controller/

service/

repository/

entity/

dto/

mapper/

security/

exception/

validation/

websocket/

util/

common/

resources/

application.properties

---

# Layered Architecture

Controller

↓

Service

↓

Repository

↓

Database

Rules

Controllers never access repositories.

Controllers never contain business logic.

Business logic belongs only inside services.

Repositories only perform database operations.

---

# Controller Layer

Responsibilities

- Receive requests
- Validate request DTOs
- Call services
- Return responses

Rules

- No business logic
- No entity manipulation
- Return ResponseEntity
- Return DTOs only

---

# Service Layer

Responsibilities

- Business logic
- Authorization
- Validation
- Transactions

Rules

- One service per business module
- Services communicate through interfaces where appropriate
- Services never return entities directly

---

# Repository Layer

Responsibilities

- CRUD operations
- Custom database queries

Rules

- Extend JpaRepository
- Keep queries minimal
- No business logic

---

# Entity Layer

Responsibilities

Database mapping.

Rules

- One entity per table
- Use JPA annotations
- Never expose entities directly to frontend
- No business logic inside entities

---

# DTO Layer

Every API must use DTOs.

Separate DTOs for

Create

Update

Response

Never reuse Entity as API response.

---

# Mapper Layer

Purpose

Convert

DTO

↓

Entity

Entity

↓

DTO

Rules

- No business logic
- Mapping only

---

# Validation

Validation must use Bean Validation.

Examples

@NotBlank

@NotNull

@Email

@Positive

@Size

Validation occurs before service execution.

---

# Exception Handling

Use Global Exception Handler.

Handle

ValidationException

EntityNotFoundException

AccessDeniedException

AuthenticationException

BusinessException

UnexpectedException

Never expose stack traces.

---

# API Response Structure

Success

{
    "success": true,
    "message": "...",
    "data": {}
}

Failure

{
    "success": false,
    "message": "...",
    "errors": []
}

---

# Transactions

Use @Transactional for operations that modify data.

Examples

Create Order

Create Restaurant

Delete Category

Update Menu

Rules

Read operations should not use transactions unless necessary.

---

# Logging

Log

Authentication

Errors

Order creation

Order status updates

Restaurant creation

Do Not Log

Passwords

JWT Tokens

Sensitive information

---

# Security Rules

Use BCrypt password hashing.

JWT authentication for protected APIs.

Every protected request validates

- JWT
- User
- Restaurant ownership
- User role

---

# Configuration

Store configurable values in

application.properties

Environment Variables

Examples

MySQL JDBC URL

MySQL Driver

`com.mysql.cj.jdbc.Driver`

Default local JDBC URL shape

`jdbc:mysql://localhost:3306/restrobuild?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`

JWT Secret

JWT Expiration

Image Upload Path

---

# Image Upload

Supported Formats

JPG

PNG

WEBP

Maximum Size

5 MB

Store only image URLs in database.

---

# Naming Conventions

Classes

PascalCase

RestaurantService

MenuController

Variables

camelCase

menuItem

restaurantId

Packages

lowercase

Endpoints

kebab-case

Database

snake_case

---

# Service Naming

RestaurantService

MenuService

CategoryService

OrderService

ReviewService

StaffService

AnalyticsService

AuthenticationService

---

# Controller Naming

RestaurantController

MenuController

CategoryController

OrderController

ReviewController

StaffController

AnalyticsController

AuthenticationController

---

# Repository Naming

RestaurantRepository

MenuRepository

CategoryRepository

OrderRepository

ReviewRepository

StaffRepository

---

# DTO Naming

CreateRestaurantRequest

UpdateRestaurantRequest

RestaurantResponse

CreateMenuItemRequest

MenuItemResponse

UpdateOrderStatusRequest

ReviewResponse

---

# Entity Naming

Restaurant

Category

MenuItem

RestaurantTable

Order

OrderItem

Review

Owner

Staff

---

# Package Rules

Each module should contain

controller

service

repository

entity

dto

mapper

Example

menu/

controller/

service/

repository/

entity/

dto/

mapper/

---

# Dependency Rules

Controller

↓

Service

↓

Repository

↓

Database

Controllers must never call repositories.

Repositories must never call services.

---

# Business Rules

Business rules belong only in services.

Examples

Restaurant ownership

Order validation

Review eligibility

Permission checks

Order status changes

---

# Pagination

All list APIs should support pagination where appropriate.

Default Page Size

20

Maximum Page Size

100

---

# Sorting

List APIs should support sorting.

Examples

price

createdAt

rating

name

---

# Searching

Search should be case-insensitive.

Trim whitespace.

Ignore leading and trailing spaces.

---

# Code Quality

Follow

SOLID

DRY

KISS

Readable code

Meaningful method names

Small methods

Single Responsibility Principle

---

# Testing

Unit Tests

Service layer

Integration Tests

Controller APIs

Repository queries

Critical business flows

---

# Documentation

Every REST endpoint must appear in Swagger.

Public APIs

Protected APIs

Request DTOs

Response DTOs

Validation messages

---

# Future Compatibility

Backend architecture should support future addition of

Payments

Reservations

Inventory

Loyalty

Coupons

Multi-Branch

Custom Domains

without major restructuring.

---

# Source of Truth

All backend development must follow this document.

Any architectural or coding standard changes must first be reflected here before implementation.
