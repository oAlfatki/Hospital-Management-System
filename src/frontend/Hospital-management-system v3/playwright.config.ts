import { defineConfig } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120000,
  workers: 1,
  use: {
    baseURL: 'http://localhost:3011',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, args: ['--no-sandbox'] } : {},
  },
  webServer: [
    {
      command: 'dotnet run --no-launch-profile --project ../../backend/Project1/HSMAPI/HSMAPI.csproj --urls http://localhost:5081',
      url: 'http://localhost:5081/health',
      timeout: 120000,
      env: {
        ASPNETCORE_ENVIRONMENT: 'Development',
        Database__Provider: 'Sqlite', Database__Initialize: 'true',
        ConnectionStrings__DefaultConnection: `Data Source=${join(tmpdir(), `hms-e2e-${Date.now()}.db`)}`,
        Bootstrap__Email: 'admin@example.test', Bootstrap__Password: 'Integration-Only-Password-37!',
        FrontendOrigins__0: 'http://localhost:3011',
      },
    },
    { command: 'npm run dev -- --port 3011', url: 'http://localhost:3011', env: { API_PROXY_TARGET: 'http://localhost:5081' } },
  ],
});
