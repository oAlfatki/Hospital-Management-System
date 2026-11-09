# Hospital Management System

React 19 / TypeScript / Vite frontend and ASP.NET Core 8 / EF Core backend. The existing three-tier backend is retained: HSMAPI → HSMBusiness → HSMDataAccess. Controllers call the existing business services; only repositories execute EF queries and persistence. Arabic and English, RTL, role-based navigation, patient registration, scheduling, medical records, billing, notification queue and audit history.

## Run locally

Requirements: .NET SDK 8+, Node.js 22+, npm. Development uses an isolated SQLite database; no hosted database credentials are required.

From the repository root, set a development administrator **once** and start the API:

```bash
export Bootstrap__Email='your-admin@example.com'
read -rs -p 'Initial administrator password (12+ characters): ' Bootstrap__Password
export Bootstrap__Password
dotnet run --project src/backend/Project1/HSMAPI/HSMAPI.csproj --launch-profile http
```

The password is read from the terminal without echo. PowerShell users can set equivalent environment variables, or use .NET user secrets. Bootstrap runs only in Development/Testing and only when the user table is empty. Remove the bootstrap environment variables after the first successful launch. Never use test credentials with real data.

In another terminal:

```bash
cd 'src/frontend/Hospital-management-system v3'
npm ci
npm run dev
```

Open `http://localhost:3000`. The API listens on `http://localhost:5069`; Vite proxies `/api`, including session cookies. Swagger is available at `http://localhost:5069/swagger` during development. Copy `.env.example` only if changing the proxy target. Local SQLite files and secrets are ignored by Git.

Create a department before registering its doctors. A doctor profile and a staff login are separate operations: use the same email and the Doctor role to link them, in either creation order. Set staff passwords explicitly when creating accounts; the API stores hashes and never returns credentials. Assign a department head after adding an active doctor to that department.

## Verify

```bash
dotnet test tests/HSMAPI.Tests/HSMAPI.Tests.csproj
cd 'src/frontend/Hospital-management-system v3'
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests start their own API, Vite server and temporary SQLite database. The suite covers patient registration/editing, departments, physicians, scheduling, invoices, partial payments, reminders, staff accounts, clinical updates and Arabic mobile rendering. API tests additionally exercise permissions, disabled sessions, duplicates, conflicts, record versions and SQL Server model generation. Architecture tests enforce the three-tier boundaries. CI runs these checks for pushes and pull requests.

## SQL Server and existing installations

Set `Database__Provider=SqlServer` and supply `ConnectionStrings__DefaultConnection` through environment configuration or a secret manager. Do not put credentials in appsettings files. Production requires HTTPS, a same-origin reverse proxy for `/api`, and persistent ASP.NET Data Protection keys when running multiple instances. Configure `FrontendOrigins` for your actual frontend origin.

For an **empty** SQL Server database, review and apply [database/sqlserver-create.sql](database/sqlserver-create.sql). Regenerate it without connecting to any database:

```bash
dotnet run --project tools/SchemaExport/SchemaExport.csproj -- database/sqlserver-create.sql
```

For an **existing** installation, use [database/sqlserver-upgrade.sql](database/sqlserver-upgrade.sql) on a restored backup first. It adds workflow metadata, invoice lines and payment history, preserves existing data, and fixes the department relationship and notification recipient foreign key. Historical timestamps and payment dates that were never recorded remain unknown. The upgrade script has not been executed against the hosted SQL Server; its actual schema and constraints must be checked during deployment.

Provision or reset an administrator explicitly after applying the schema:

```bash
export HMS_ADMIN_EMAIL='your-admin@example.com'
read -rs -p 'Administrator password (12+ characters): ' HMS_ADMIN_PASSWORD
export HMS_ADMIN_PASSWORD
dotnet run --project tools/AdminProvision/AdminProvision.csproj
unset HMS_ADMIN_PASSWORD
```

This maintenance command requires the database environment variables above and writes only the selected administrator account and an audit entry. Existing plaintext passwords are deliberately rejected by the new login flow. Reset the administrator with this tool, then reset other staff accounts through User Management.

The original repository contained a database credential. Its current value has been removed from tracked configuration, but it remains in Git history: rotate it at the database provider before using the hosted installation.

## Scope and integration details

- [Architecture, findings and fixes](docs/PROJECT_REVIEW.md)
- [Frontend/API contracts and permissions](docs/API_CONTRACTS.md)
- Reminders create a durable `Pending` notification. Actual email/SMS delivery requires a provider and a delivery worker, which are not configured in this repository. The interface does not claim successful delivery.
- Legacy person, employee, report, service-category and bill-service endpoints remain administrator-only. They are not separate screens in the current frontend; they are not covered by the browser workflow suite.
- Verification uses SQLite for execution and SQL Server metadata for schema validation. An actual SQL Server deployment and its upgrade script still need validation against a restored installation.
