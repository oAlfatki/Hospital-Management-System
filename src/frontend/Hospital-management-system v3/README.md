# Hospital frontend

React 19, TypeScript, Vite, React Query and React Hook Form. Arabic/English with RTL support.

See the [root README](../../../README.md) for API startup, administrator provisioning and SQL Server deployment.

```bash
npm ci
npm run dev
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Development proxies `/api` to `http://localhost:5069`. `.env.example` documents proxy/base URL overrides. The backend creates and validates the HttpOnly session cookie. Browser tests start separate local servers and a disposable database; they never use the hosted hospital database.
