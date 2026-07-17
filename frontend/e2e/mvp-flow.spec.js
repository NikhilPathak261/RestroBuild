import { expect, test } from '@playwright/test';

const apiBaseURL = process.env.VITE_API_BASE_URL
  || `http://localhost:${process.env.E2E_BACKEND_PORT || '18080'}/api`;

test('MVP customer order lifecycle and owner analytics flow @desktop', async ({ page, request }) => {
  const { owner, kitchen, waiter, restaurant, menuItem, table } = await seedScenario(request);

  await page.goto(`/r/${restaurant.slug}/menu?tableId=${table.id}`);
  await expect(page.getByRole('heading', { name: 'Choose your dishes' })).toBeVisible();
  await expect(page.getByRole('heading', { name: menuItem.name })).toBeVisible();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByRole('button', { name: `Add one ${menuItem.name}` })).toBeVisible();
  await page.waitForFunction(() => Boolean(window.sessionStorage.getItem('restrobuild.publicCartToken')));
  await page.getByRole('link', { name: 'Review cart' }).click();
  await expect(page.getByRole('heading', { name: 'Your order' })).toBeVisible();
  await expect(page.getByRole('heading', { name: menuItem.name })).toBeVisible();
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page).toHaveURL(/\/orders\/\d+\?tableId=/);
  const orderId = Number(page.url().match(/\/orders\/(\d+)/)[1]);
  await expect(page.getByRole('heading', { name: 'pending' })).toBeVisible();

  await login(page, kitchen.email, kitchen.password);
  await expect(page).toHaveURL(/\/kitchen\/pending/);
  await expect(page.getByText(`#${orderId}`)).toBeVisible();
  await page.getByRole('button', { name: 'Prepare' }).click();
  await waitForOrderStatus(request, orderId, 'PREPARING');
  await page.goto('/kitchen/preparing');
  await expect(page.getByText(`#${orderId}`)).toBeVisible();
  await page.getByRole('button', { name: 'Ready' }).click();
  await waitForOrderStatus(request, orderId, 'READY');

  await login(page, waiter.email, waiter.password);
  await expect(page).toHaveURL(/\/waiter\/ready/);
  await expect(page.getByText(`#${orderId}`)).toBeVisible();
  await page.getByRole('button', { name: 'Mark served' }).click();
  await waitForOrderStatus(request, orderId, 'SERVED');

  await page.goto(`/r/${restaurant.slug}/orders/${orderId}?tableId=${table.id}`);
  await expect(page.getByRole('heading', { name: 'served' })).toBeVisible();
  await expect(page.getByText('Enjoy your meal')).toBeVisible();
  await page.getByLabel('Comment').fill('Excellent browser verified meal');
  await page.getByRole('button', { name: 'Submit review' }).click();
  await expect(page.getByText('Review submitted. Thank you.')).toBeVisible();

  await login(page, owner.email, owner.password);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.getByRole('link', { name: 'Reviews' }).click();
  await expect(page.getByText('Excellent browser verified meal')).toBeVisible();
  await expect(page.getByText(menuItem.name)).toBeVisible();
  await page.getByRole('link', { name: 'Orders' }).click();
  await expect(page.getByText(`#${orderId}`)).toBeVisible();
  await page.getByRole('link', { name: 'Analytics' }).click();
  await expect(page.getByText('Total Orders')).toBeVisible();
  await expect(page.getByText('Rs. 275').first()).toBeVisible();
});

test('mobile customer can use the server-backed cart and place an order @mobile', async ({ page, request }) => {
  const { restaurant, menuItem, table } = await seedScenario(request, { staff: false });

  await page.goto(`/r/${restaurant.slug}/menu?tableId=${table.id}`);
  await expect(page.getByRole('heading', { name: 'Choose your dishes' })).toBeVisible();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('button', { name: `Add one ${menuItem.name}` }).click();
  await page.waitForFunction(() => Boolean(window.sessionStorage.getItem('restrobuild.publicCartToken')));
  await page.getByRole('link', { name: 'Review cart' }).click();
  await expect(page.getByText(menuItem.name).first()).toBeVisible();
  await expect(page.getByText('Rs. 550')).toBeVisible();
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page).toHaveURL(/\/orders\/\d+\?tableId=/);
  await expect(page.getByRole('heading', { name: 'pending' })).toBeVisible();
});

test('rejects review submission before the order is served @desktop', async ({ request }) => {
  const { restaurant, menuItem, table } = await seedScenario(request, { staff: false });
  expect(restaurant.id).toBeTruthy();
  const order = await apiPost(request, '/orders', {
    tableId: table.id,
    items: [
      {
        menuItemId: menuItem.id,
        quantity: 1,
      },
    ],
    specialInstructions: 'Negative review E2E',
  });

  const response = await request.post(`${apiBaseURL}/reviews`, {
    data: {
      orderItemId: order.items[0].id,
      rating: 5,
      comment: 'Too early',
    },
  });

  expect(response.status()).toBe(422);
  const responseBody = await response.json();
  expect(responseBody.message).toBe('Reviews are allowed only after the order is served.');
});

test('rejects invalid owner login in the browser @desktop', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('missing-owner@restrobuild.test');
  await page.getByLabel('Password').fill('WrongPass123');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText('Invalid email or password.')).toBeVisible();
});

test('blocks table QR context from a different restaurant @desktop', async ({ page, request }) => {
  const first = await seedScenario(request, { staff: false });
  const second = await seedScenario(request, { staff: false });

  await page.goto(`/r/${first.restaurant.slug}?tableId=${second.table.id}`);

  await expect(page.getByText('This table QR does not belong to this restaurant.')).toBeVisible();
});

test('prevents unavailable dishes from being ordered @desktop', async ({ page, request }) => {
  const { ownerToken, restaurant, menuItem, table } = await seedScenario(request, { staff: false });
  await apiPatch(request, `/menu-items/${menuItem.id}/availability`, { available: false }, ownerToken);

  await page.goto(`/r/${restaurant.slug}/menu?tableId=${table.id}`);

  await expect(page.getByRole('heading', { name: 'Choose your dishes' })).toBeVisible();
  await expect(page.getByText(menuItem.name)).not.toBeVisible();
  await expect(page.getByText('No dishes found.')).toBeVisible();

  const response = await request.post(`${apiBaseURL}/cart/items`, {
    data: {
      menuItemId: menuItem.id,
      quantity: 1,
    },
  });
  expect(response.status()).toBe(422);
  const responseBody = await response.json();
  expect(responseBody.message).toBe('Menu item is unavailable.');
});

async function login(page, email, password) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}

async function seedScenario(request, options = {}) {
  const { staff = true } = options;
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const owner = {
    name: 'E2E Owner',
    email: `owner-${suffix}@restrobuild.test`,
    password: 'OwnerPass123',
  };
  const kitchen = {
    name: 'E2E Kitchen',
    email: `kitchen-${suffix}@restrobuild.test`,
    password: 'StaffPass123',
  };
  const waiter = {
    name: 'E2E Waiter',
    email: `waiter-${suffix}@restrobuild.test`,
    password: 'StaffPass123',
  };

  await apiPost(request, '/auth/register', owner);
  const ownerAuth = await apiPost(request, '/auth/login', {
    email: owner.email,
    password: owner.password,
  });
  const ownerToken = ownerAuth.accessToken;

  const restaurant = await apiPost(request, '/restaurants', {
    name: `E2E Bistro ${suffix}`,
    description: 'Browser verified restaurant',
    address: '1 Browser Street',
    phone: '+91 90000 10000',
    email: `bistro-${suffix}@restrobuild.test`,
    openingHours: 'Mon-Sun 10:00 AM - 10:00 PM',
    logoUrl: '',
    coverImageUrl: '',
  }, ownerToken);
  await apiPost(request, '/website/publish', {}, ownerToken);

  const category = await apiPost(request, '/categories', {
    name: 'Browser Mains',
    displayOrder: 1,
  }, ownerToken);
  const menuItem = await apiPost(request, '/menu-items', {
    categoryId: category.id,
    name: 'Browser Paneer',
    description: 'E2E paneer dish',
    price: 275,
    imageUrl: '',
    foodType: 'VEG',
    spicyLevel: 2,
    sweetLevel: 1,
    preparationTime: 15,
    available: true,
  }, ownerToken);
  const tables = await apiPost(request, '/tables', { numberOfTables: 1 }, ownerToken);
  const table = tables[0];

  if (staff) {
    await apiPost(request, '/staff', {
      name: kitchen.name,
      email: kitchen.email,
      password: kitchen.password,
      role: 'KITCHEN',
    }, ownerToken);
    await apiPost(request, '/staff', {
      name: waiter.name,
      email: waiter.email,
      password: waiter.password,
      role: 'WAITER',
    }, ownerToken);
  }

  return { owner, kitchen, waiter, ownerToken, restaurant, category, menuItem, table };
}

async function apiPost(request, path, body, token) {
  const response = await request.post(`${apiBaseURL}${path}`, {
    data: body,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  expect(response.ok(), `${path} returned ${response.status()}: ${await response.text()}`).toBeTruthy();
  const json = await response.json();
  return json.data ?? null;
}

async function apiPatch(request, path, body, token) {
  const response = await request.patch(`${apiBaseURL}${path}`, {
    data: body,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  expect(response.ok(), `${path} returned ${response.status()}: ${await response.text()}`).toBeTruthy();
  const json = await response.json();
  return json.data ?? null;
}

async function waitForOrderStatus(request, orderId, expectedStatus) {
  await expect.poll(async () => {
    const response = await request.get(`${apiBaseURL}/orders/${orderId}/status`);
    const json = await response.json();
    return json.data.status;
  }, {
    message: `order ${orderId} reaches ${expectedStatus}`,
    timeout: 15_000,
  }).toBe(expectedStatus);
}
