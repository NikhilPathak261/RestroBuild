import { defineConfig, devices } from '@playwright/test';

const frontendPort = process.env.E2E_FRONTEND_PORT || '5174';
const backendPort = process.env.E2E_BACKEND_PORT || '18080';
const frontendURL = process.env.E2E_FRONTEND_URL || `http://localhost:${frontendPort}`;
const backendURL = process.env.VITE_API_BASE_URL || `http://localhost:${backendPort}/api`;

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: frontendURL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      grep: /@desktop/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      grep: /@mobile/,
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: [
    {
      command: '..\\backend\\mvnw.cmd -f ..\\backend\\pom.xml spring-boot:run -Dspring-boot.run.profiles=test',
      url: `http://localhost:${backendPort}/api/health`,
      timeout: 180_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        SERVER_PORT: backendPort,
        DB_URL: process.env.DB_URL || 'jdbc:mysql://localhost:3306/restrobuild_test',
        DB_USERNAME: process.env.DB_USERNAME || 'root',
        DB_PASSWORD: process.env.DB_PASSWORD || '',
        JWT_SECRET: process.env.JWT_SECRET || 'change-this-development-secret-change-this-development-secret',
        CORS_ALLOWED_ORIGINS: frontendURL,
        FRONTEND_BASE_URL: frontendURL,
      },
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${frontendPort}`,
      url: frontendURL,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        VITE_API_BASE_URL: backendURL,
      },
    },
  ],
});
