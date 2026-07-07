# 🍽️ RestroBuild

**RestroBuild** is a production-ready **Restaurant Website Builder & QR Ordering SaaS Platform** built with **Java, Spring Boot, React, and PostgreSQL**.

It enables restaurant owners to create their own branded restaurant website without writing any code. Customers can scan QR codes placed on restaurant tables to browse the digital menu, place orders, track order status, and leave verified reviews.

> **Note:** This is **not** a food delivery platform like Zomato or Swiggy. It is a SaaS platform that helps restaurants create and manage their own digital presence and dine-in ordering system.

---

# ✨ Features

## Restaurant Owner

- Restaurant Registration & Authentication
- Restaurant Profile Management
- Website Template Selection
- Theme Customization
- Menu Category Management
- Menu Item Management
- Restaurant Table Management
- QR Code Generation
- Staff Management
- Order Management
- Review Moderation
- Business Analytics Dashboard

---

## Customer

- QR-Based Restaurant Access
- Digital Menu
- Search & Filters
- Add to Cart
- Place Orders
- Live Order Tracking
- Bill Summary
- Verified Dish Reviews

---

## Kitchen Staff

- View Incoming Orders
- Update Order Status
- Manage Kitchen Queue

---

## Waiter

- View Ready Orders
- Mark Orders as Served

---

# 🏗️ Tech Stack

## Frontend

- React
- React Router
- Axios
- Context API
- CSS Modules

## Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- JWT Authentication
- WebSocket

## Database

- PostgreSQL

## Documentation

- Swagger / OpenAPI

## Build Tools

- Maven
- Vite

## Containerization

- Docker (Planned)

---

# 📂 Project Structure

```text
RESTROBUILD/
│
├── backend/
│
├── frontend/
│
├── arch/               (Ignored from Git)
│
├── .gitignore
│
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone <repository-url>
```

---

## Backend

```bash
cd backend
```

Configure your environment variables.

Run

```bash
mvn spring-boot:run
```

Backend runs on

```
http://localhost:8080
```

---

## Frontend

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Run

```bash
npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

# 📖 Core Modules

- Authentication
- Restaurant Management
- Website Builder
- Menu Management
- QR Code Management
- Customer Ordering
- Kitchen Dashboard
- Waiter Dashboard
- Review System
- Analytics Dashboard
- Real-Time Order Tracking

---

# 🔒 Authentication

- JWT Authentication
- Refresh Tokens
- Role-Based Access Control

Roles

- Restaurant Owner
- Kitchen Staff
- Waiter
- Customer (Guest for MVP)

---

# 📡 Real-Time Features

- Live Order Updates
- Kitchen Queue Updates
- Waiter Notifications
- Customer Order Tracking

Powered by Spring WebSocket.

---

# 📱 Responsive Design

The application is fully responsive and supports

- Desktop
- Tablet
- Mobile

The customer website follows a mobile-first approach since it is primarily accessed by scanning QR codes.

---

# 🛣️ Roadmap

## MVP

- [x] Authentication
- [x] Restaurant Management
- [x] Website Builder
- [x] Menu Management
- [x] QR Ordering
- [x] Kitchen Dashboard
- [x] Waiter Dashboard
- [x] Reviews
- [x] Analytics

## Future Enhancements

- Online Payments
- Loyalty Program
- Inventory Management
- Reservations
- Multi-Branch Support
- Custom Domains
- AI Features

---

# 📄 License

This project is currently intended for educational and portfolio purposes.

---

# 👨‍💻 Author

**Nikhil Pathak**

B.Tech CSE (2023–2027)

Backend & Full-Stack Developer

Java • Spring Boot • React • PostgreSQL