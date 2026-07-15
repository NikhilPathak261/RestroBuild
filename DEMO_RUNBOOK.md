# RestroBuild Demo Runbook

Use this checklist for a smooth local MVP demo.

## Start

1. Make sure MySQL is running and create a local database for the demo.

2. Start the backend with:

```bash
export DB_URL='jdbc:mysql://localhost:3306/<your_database>?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
export DB_USERNAME='<your_database_user>'
export DB_PASSWORD='<your_database_password>'
export JWT_SECRET='<your_long_random_secret>'
SPRING_PROFILES_ACTIVE=demo ./mvnw spring-boot:run
```

On Windows PowerShell, run:

```powershell
$env:SPRING_PROFILES_ACTIVE='demo'
$env:DB_URL='jdbc:mysql://localhost:3306/<your_database>?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
$env:DB_USERNAME='<your_database_user>'
$env:DB_PASSWORD='<your_database_password>'
$env:JWT_SECRET='<your_long_random_secret>'
.\mvnw.cmd spring-boot:run
```

and start the frontend with:

```bash
npm run dev
```

## Demo Accounts

- Owner: `owner@demo.restrobuild.test` / `DemoPass123`
- Kitchen: `kitchen@demo.restrobuild.test` / `DemoPass123`
- Waiter: `waiter@demo.restrobuild.test` / `DemoPass123`

## Walkthrough

1. Log in as owner and show dashboard, profile, website settings, menu, tables, orders, reviews, staff, and analytics.
   Use the `Owner demo` button on the login page to autofill credentials.
   In profile/menu forms, either paste image URLs or use the upload controls to attach local logo, cover, and dish images.
   In website settings, publish, copy the public URL, and open the public site from the publish panel.
2. Open the public site: `http://localhost:5173/r/spice-house-demo`.
3. Open a table QR link from the owner table page, then browse the public menu.
4. Preview and download a table QR code from the owner table page.
5. Use search, category, food type, spicy, sweet, and price filters.
6. Add dishes to the cart, open `Review cart`, adjust quantities or instructions, place an order, then show order tracking and the table-level bill page.
7. Log in as kitchen staff and move a pending order to preparing, then ready.
   Use the `Kitchen demo` button on the login page.
8. Log in as waiter and mark a ready order served, then show served history.
   Use the `Waiter demo` button on the login page.
9. Return to the customer order page and submit a verified review.
10. Return to owner analytics/reviews/orders to show the restaurant-side updates.

## Demo Notes

- The demo profile is idempotent: it skips seeding if the demo owner already exists.
- Image media can be pasted as URLs or uploaded through the owner dashboard; uploaded files are served from `/uploads/media`.
- Uploaded demo media is stored in `UPLOAD_MEDIA_DIR` (`uploads/media` by default).
- Backend tests can run with `.\mvnw.cmd test` on Windows or `./mvnw test` on Unix shells; frontend checks use `npm run lint`, `npm run build`, and `npx vitest run --pool=threads`.
