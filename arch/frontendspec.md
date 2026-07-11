# Frontend Specification

Project: RestroBuild

Version: 1.0.0

Status: Approved

---

# Purpose

This document defines the frontend architecture, coding standards, UI structure, page hierarchy, component organization, routing strategy, state management, and development rules for RestroBuild.

Every frontend implementation must follow this specification.

---

# Technology Stack

Framework

React

Language

JavaScript

Routing

React Router

HTTP Client

Axios

State Management

Context API

Styling

CSS Modules

Icons

React Icons

Notifications

React Toastify

Build Tool

Vite

---

# Project Structure

frontend/

src/

assets/

components/

layouts/

pages/

contexts/

hooks/

services/

routes/

utils/

constants/

styles/

types/

App.jsx

main.jsx

---

# Architecture

Application

↓

Layouts

↓

Pages

↓

Components

↓

Services

↓

Backend APIs

Business logic should never exist inside components.

---

# Layouts

Admin Layout

Restaurant Owner Dashboard

Staff Layout

Kitchen

Waiter

Public Layout

Restaurant Website

Authentication Layout

Login

Register

---

# Common Components

Navbar

Sidebar

Footer

Button

Input

Textarea

Modal

Dialog

Loader

Spinner

Badge

Card

Table

Pagination

SearchBar

EmptyState

ConfirmDialog

Toast

ImageUploader

---

# State Management

Context API should manage

Authentication

Current User

Restaurant

Theme

Cart

Global Loading

Avoid unnecessary global state.

Use local state where possible.

---

# API Communication

All backend communication must go through service classes.

Example

AuthService

RestaurantService

CategoryService

MenuService

OrderService

ReviewService

AnalyticsService

StaffService

Components must never call Axios directly.

---

# Routing

Use React Router.

Public Routes

Login

Register

Restaurant Website

Menu

About

Contact

Protected Routes

Dashboard

Menu Management

Category Management

Orders

Reviews

Analytics

Staff

Website Settings

Unauthorized users must be redirected to Login.

---

# Authentication Flow

User Login

↓

Access Token Stored

↓

Authenticated Routes Enabled

↓

Logout

↓

Token Removed

↓

Redirect Login

---

# Restaurant Owner Pages

Login

Register

Dashboard

Restaurant Profile

Website Settings

Category Management

Menu Management

Orders

Reviews

Staff Management

Analytics

Settings

---

# Kitchen Pages

Login

Pending Orders

Preparing Orders

Ready Orders

---

# Waiter Pages

Login

Ready Orders

Served Orders

---

# Customer Pages

Homepage

About

Menu

Dish Details

Cart

Order Status

Bill Summary

Reviews

Contact

---

# Dashboard

Dashboard should display

Today's Orders

Today's Revenue

Popular Dish

Least Ordered Dish

Average Rating

Recent Orders

Quick Actions

---

# Restaurant Profile Page

Restaurant Information

Logo Upload

Cover Upload

Contact Information

Opening Hours

Save Changes

---

# Website Settings Page

Template Selection

Primary Color

Secondary Color

About Section

Preview

Publish

---

# Category Management Page

Category List

Create Category

Update Category

Delete Category

Search

Pagination

---

# Menu Management Page

Dish List

Create Dish

Edit Dish

Delete Dish

Hide Dish

Availability Toggle

Image Upload

Filters

Search

Pagination

---

# Orders Page

Owner

View all restaurant orders.

Supports

Status Filter

Date Filter

Search

---

# Kitchen Dashboard

Pending Orders

Preparing Orders

Ready Orders

Update Status

Auto Refresh

---

# Waiter Dashboard

Ready Orders

Mark Served

Served History

---

# Analytics Page

Cards

Revenue

Orders

Average Rating

Popular Dish

Charts

Daily Revenue

Weekly Revenue

Monthly Revenue

---

# Review Management Page

Review List

Rating Filter

Hide Review

Delete Review

---

# Staff Management Page

Staff List

Create Staff

Edit Staff

Disable Staff

Delete Staff

---

# Public Restaurant Website

Homepage

About

Menu

Contact

Reviews

Cart

Order Tracking

Bill

---

# Menu Page

Customer can

Browse dishes

Search

Filter

Filter by spicy level

Filter by sweet level

Sort

View Details

Add To Cart

See active table orders and open tracking or bill links when visiting from a table QR.

---

# Cart Page

Display

Items

Quantity

Subtotal

Special Instructions

Place Order

---

# Order Tracking Page

Display

Order Status

Estimated Time

Ordered Items

Order Timeline

Auto Refresh

---

# Bill Page

Display

Items

Quantity

Price

Subtotal

Grand Total

---

# Forms

Every form should have

Client-side validation

Error messages

Loading state

Disabled submit while processing

Success notification

Failure notification

---

# Loading States

Show loader

Initial page load

API requests

Image uploads

Form submissions

---

# Empty States

Display meaningful messages.

Examples

No Orders

No Reviews

No Categories

No Menu Items

---

# Error Handling

Display user-friendly messages.

Do not expose server stack traces.

Retry where appropriate.

---

# Responsive Design

Desktop

Laptop

Tablet

Mobile

Customer website should be mobile-first.

---

# UI Principles

Clean

Minimal

Professional

Consistent spacing

Consistent typography

Consistent colors

Reusable components

---

# Component Rules

Components should

Have one responsibility.

Receive data through props.

Avoid direct API calls.

Avoid business logic.

Be reusable whenever possible.

---

# Naming Conventions

Components

PascalCase

MenuCard

OrderTable

CategoryForm

Variables

camelCase

Functions

camelCase

Files

PascalCase

Folders

lowercase

---

# Icons

Use React Icons.

Avoid image-based icons.

---

# Images

Lazy load images where appropriate.

Provide fallback image.

Maintain aspect ratio.

---

# Tables

All tables should support

Pagination

Loading State

Empty State

Responsive Layout

---

# Search

Search should

Be case-insensitive.

Ignore leading/trailing spaces.

Update results without page refresh.

---

# Pagination

Default

20 records

Configurable

---

# Notifications

Show toast notifications for

Create

Update

Delete

Success

Failure

Validation Errors

---

# Security

Never store passwords.

Never expose JWT in UI.

Protect authenticated routes.

Hide unauthorized pages.

---

# Performance

Avoid unnecessary re-renders.

Lazy load pages.

Memoize expensive components where needed.

Optimize images.

---

# Accessibility

Buttons must have labels.

Inputs must have labels.

Images should have alt text.

Keyboard navigation should work.

Color contrast should be sufficient.

---

# Future Compatibility

Frontend architecture should support future modules

Payments

Reservations

Inventory

Coupons

Loyalty

Delivery

without major restructuring.

---

# Source of Truth

All frontend development must follow this document.

Any frontend architecture or coding standard changes must first be reflected here before implementation.
