# 🍽️ RestroBuild

**RestroBuild** is a production-ready **Restaurant Website Builder & QR Ordering SaaS Platform** built with **Java, Spring Boot, React, and MySQL**.

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

- MySQL

## Documentation

- Swagger / OpenAPI

## Build Tools

- Maven
- Vite

## Containerization

- Docker

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

## Demo Profile

For a fast local walkthrough, run the backend with the `demo` profile. It seeds a published restaurant, staff users, tables, QR links, menu items, sample orders, and reviews.

```bash
SPRING_PROFILES_ACTIVE=demo mvn spring-boot:run
```

Demo logins:

- Owner: `owner@demo.restrobuild.test` / `DemoPass123`
- Kitchen: `kitchen@demo.restrobuild.test` / `DemoPass123`
- Waiter: `waiter@demo.restrobuild.test` / `DemoPass123`

The login page includes quick-fill buttons for these demo accounts.

Demo customer website:

```text
http://localhost:5173/r/spice-house-demo
```

With Docker, copy `.env.demo.example` to `.env` and start the stack:

```bash
cp .env.demo.example .env
docker compose up --build
```

Uploaded dashboard media is stored in `UPLOAD_MEDIA_DIR` and persisted in the Docker `backend_uploads` volume by default.

See `DEMO_RUNBOOK.md` for the recommended presentation walkthrough.

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

# Docker Deployment

Copy the example environment file and adjust secrets/URLs for your machine or host:

```bash
cp .env.example .env
```

Start the full stack:

```bash
docker compose up --build
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Backend liveness: `http://localhost:8080/api/health`
- Backend readiness: `http://localhost:8080/api/health/ready`

Important production variables:

- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`: point the backend to the MySQL database.
- `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `MYSQL_PORT`: configure the local Docker MySQL service.
- `JWT_SECRET`: replace the development value with a strong secret.
- `CORS_ALLOWED_ORIGINS`: set to the deployed frontend origin.
- `FRONTEND_BASE_URL`: set to the deployed frontend URL used in QR/public links.
- `VITE_API_BASE_URL`: set to the public backend API URL at frontend build time.
- `VITE_WS_BASE_URL`: set to the public WebSocket URL at frontend build time.
- `SPRING_PROFILES_ACTIVE`: use `prod` for production deployments.
- `JPA_DDL_AUTO`: use `validate` or managed MySQL migrations for production once migration tooling is added.
- `JAVA_OPTS`: optional JVM flags for the backend container, such as memory limits.
- `LOG_LEVEL_ROOT`, `LOG_LEVEL_APP`, `LOG_LEVEL_SECURITY`: optional backend log level controls.

When the backend runs with the `prod` profile, it fails fast if the development JWT secret or wildcard CORS origins are still configured and disables Swagger/OpenAPI by default.

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

Java • Spring Boot • React • MySQL
