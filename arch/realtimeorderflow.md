# Real-Time Order Flow Specification

Project: RestroBuild

Version: 1.0.0

Status: Approved

---

# Purpose

This document defines the real-time communication flow of RestroBuild.

Real-time communication is used only for order-related updates between

- Customer
- Kitchen Staff
- Waiter
- Restaurant Owner

The goal is to keep all clients synchronized without requiring manual page refreshes.

---

# Technology

Spring Boot WebSocket

---

# Communication Model

Client

↓

WebSocket Connection

↓

Spring Boot WebSocket Server

↓

Subscribed Clients Receive Events

---

# Real-Time Events

The system supports the following events.

- New Order Created
- Order Accepted
- Order Preparing
- Order Ready
- Order Served

Only these events should use WebSocket.

All CRUD operations continue to use REST APIs.

---

# Connection Flow

1. User opens application.

2. Frontend establishes WebSocket connection.

3. User subscribes to relevant event channel.

4. Backend pushes events automatically.

5. Frontend updates UI immediately.

---

# Customer Flow

Customer

↓

Scans QR

↓

Browses Menu

↓

Places Order (REST)

↓

Order Created

↓

Backend broadcasts

NEW_ORDER

↓

Kitchen receives

↓

Kitchen updates status

↓

Backend broadcasts

ORDER_PREPARING

↓

Customer receives update

↓

Kitchen marks Ready

↓

Backend broadcasts

ORDER_READY

↓

Customer notified

↓

Waiter serves order

↓

Backend broadcasts

ORDER_SERVED

↓

Customer UI updates

---

# Kitchen Flow

Kitchen Dashboard

↓

Receives NEW_ORDER event

↓

Displays order instantly

↓

Kitchen changes status

↓

Backend broadcasts updated status

↓

Customer

↓

Waiter

↓

Owner

receive update

---

# Waiter Flow

Waiter Dashboard

↓

Receives READY orders

↓

Serves food

↓

Marks Served

↓

Backend broadcasts

ORDER_SERVED

↓

Customer receives update

---

# Owner Flow

Restaurant Owner Dashboard

Receives

- New Order
- Order Status Changes

Dashboard updates automatically.

---

# WebSocket Channels

Customer

/topic/orders/{orderId}

Kitchen

/topic/kitchen/orders

Waiter

/topic/waiter/orders

Owner

/topic/owner/orders

MVP transport note

The current implementation uses a native WebSocket endpoint at `/ws`.

Clients subscribe by sending a text message:

SUBSCRIBE /topic/orders/{orderId}

The backend broadcasts JSON event payloads to matching subscribers.

---

# Event Types

NEW_ORDER

ORDER_PREPARING

ORDER_READY

ORDER_SERVED

ORDER_CANCELLED

---

# Event Payload

Every event should follow

{
    "eventType": "",
    "orderId": 101,
    "status": "",
    "timestamp": ""
}

---

# New Order Event

Event

NEW_ORDER

Triggered When

Customer places order.

Receivers

Kitchen

Restaurant Owner

---

# Preparing Event

Event

ORDER_PREPARING

Triggered When

Kitchen starts preparing.

Receivers

Customer

Restaurant Owner

---

# Ready Event

Event

ORDER_READY

Triggered When

Kitchen marks Ready.

Receivers

Customer

Waiter

Restaurant Owner

---

# Served Event

Event

ORDER_SERVED

Triggered When

Waiter marks Served.

Receivers

Customer

Restaurant Owner

---

# Cancelled Event

Event

ORDER_CANCELLED

Triggered When

Restaurant Owner cancels order.

Receivers

Customer

Kitchen

Waiter

---

# Client Behaviour

Customer

Automatically update

- Order Status
- Estimated Time

Kitchen

Automatically insert

New Orders

Waiter

Automatically update

Ready Orders

Owner

Automatically refresh

Dashboard statistics

---

# Connection Lifecycle

Application Opens

↓

Connect WebSocket

↓

Subscribe

↓

Receive Events

↓

Application Closes

↓

Disconnect

---

# Reconnection Strategy

If connection drops

↓

Attempt reconnection automatically.

Retry interval

5 seconds

Maximum retries

Unlimited until application closes.

---

# Offline Behaviour

If WebSocket disconnects

Customer

Continue using application.

Order status should refresh using REST API until WebSocket reconnects.

Kitchen

Continue processing orders.

Owner

Dashboard continues functioning.

---

# Event Ordering

Events must always follow

NEW_ORDER

↓

ORDER_PREPARING

↓

ORDER_READY

↓

ORDER_SERVED

Optional

↓

ORDER_CANCELLED

Invalid transitions should be rejected.

---

# Security

Only authenticated users may subscribe to

Kitchen

Waiter

Owner

channels.

Customer subscriptions should only receive updates for their own active order.

Restaurant data isolation must always be enforced.

---

# Performance

Events should be lightweight.

Broadcast only required data.

Do not send complete entities.

---

# Error Handling

If event delivery fails

Do not affect business operation.

REST API remains the source of truth.

Frontend should recover by fetching latest order status.

---

# Source of Truth

All WebSocket implementation must follow this document.

No real-time functionality should be implemented outside these rules.
