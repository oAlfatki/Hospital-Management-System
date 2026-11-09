import { test, expect, type Page, type APIRequestContext, type Download, type BrowserContext } from '@playwright/test';
import { readFileSync } from 'node:fs';
const en = JSON.parse(readFileSync(new URL('../../src/core/locales/en.json', import.meta.url), 'utf8')) as Record<string, string>;
const ar = JSON.parse(readFileSync(new URL('../../src/core/locales/ar.json', import.meta.url), 'utf8')) as Record<string, string>;
const password = 'Integration-Only-Password-37!';
test.setTimeout(45000);
let sequence = 100;
async function data(response: Awaited<ReturnType<APIRequestContext['post']>>, expected = 201): Promise<Record<string, any>> {
  expect(response.status(), await response.text()).toBe(expected); return await response.json() as Record<string, any>;
}
async function login(page: Page, email = 'admin@example.test') {
  await page.goto('/auth'); await page.locator('input[type=email]').fill(email); await page.locator('input[type=password]').fill(password);
  await page.locator('button[type=submit]').click(); await expect(page).toHaveURL(/dashboard/);
}
async function patient(request: APIRequestContext, extra: Record<string, unknown> = {}) {
  const n = ++sequence;
  return data(await request.post('/api/patients', { data: { name: `Feature Browser ${n}`, email: `feature${n}@browser.test`, contactNumber: `07${n.toString().padStart(8, '0')}`,
    dateOfBirth: '1991-03-10', gender: 'Female', address: 'Riyadh', medicalHistory: '', status: 'Active', ...extra } }));
}
async function doctor(request: APIRequestContext) {
  const n = ++sequence; const department = await data(await request.post('/api/departments', { data: { name: `Department ${n}` } }));
  return data(await request.post('/api/doctors', { data: { name: `Feature Physician ${n}`, email: `physician${n}@browser.test`, contactNumber: `08${n.toString().padStart(8, '0')}`,
    departmentId: department.departmentId, specialty: 'Pediatrics', status: 'Active' } }));
}
async function invoice(request: APIRequestContext, patientId: string) {
  return data(await request.post('/api/billing', { data: { patientId, services: [{ serviceName: 'Consultation', cost: 100 }], taxPercent: 0, discountAmount: 0,
    dueDate: new Date(Date.now() + 864000000).toISOString().slice(0, 10) } }));
}
async function staff(request: APIRequestContext, role: string) {
  const n = ++sequence; const email = `staff${n}@browser.test`;
  const user = await data(await request.post('/api/auth/register', { data: { name: `Feature ${role} ${n}`, email, role, status: 'Active', password } }));
  return { ...user, email };
}
async function logout(page: Page) { await page.getByTitle(en.logout, { exact: true }).click(); await expect(page).toHaveURL(/auth/); }
async function csv(download: Download) {
  const stream = await download.createReadStream(); let text = ''; for await (const chunk of stream) text += chunk.toString('utf8'); return text;
}

let adminCookies: Awaited<ReturnType<BrowserContext['cookies']>>;
test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  await data(await context.request.post('http://localhost:3011/api/auth/login', { data: { email: 'admin@example.test', password } }), 200);
  adminCookies = await context.cookies();
  await context.close();
});
test.beforeEach(async ({ page, context }) => {
  await context.addCookies(adminCookies);
  await page.addInitScript(() => { if (!localStorage.getItem('hms_lang')) localStorage.setItem('hms_lang', 'en'); });
  await page.goto('/dashboard');
  await expect(page.getByText('Clinical Performance & Analytics')).toBeVisible();
});

test('patients: pagination searches all pages and status filter survives edits and reload', async ({ page }) => {
  for (let i = 0; i < 12; i++) await patient(page.request);
  const target = await patient(page.request, { status: 'Deceased' });
  await page.goto('/patients'); await expect(page.getByRole('button', { name: 'Next page' })).toBeEnabled();
  await page.getByRole('button', { name: 'Next page' }).click(); await expect(page.getByRole('button', { name: 'Previous page' })).toBeEnabled();
  await page.getByPlaceholder(en.searchPatientsPlaceholder).fill(target.name);
  const row = page.getByRole('row').filter({ hasText: target.name }); await expect(row).toBeVisible(); await expect(row).toContainText(en.commonDeceased);
  await row.getByRole('button', { name: 'Edit patient' }).click();
  await expect(page.getByRole('dialog').locator('[name=medicalHistory]')).toHaveValue('');
  await page.getByRole('dialog').locator('[name=status]').selectOption('Inactive');
  await page.getByRole('dialog').getByRole('button', { name: en.applyChanges }).click(); await expect(page.getByRole('dialog')).toBeHidden();
  await expect(row).toContainText(en.commonInactive); await page.reload();
  await page.getByPlaceholder(en.searchPatientsPlaceholder).fill(target.name); await expect(page.getByRole('row').filter({ hasText: target.name })).toContainText(en.commonInactive);
  await page.locator('select').first().selectOption('Active'); await expect(page.getByRole('row').filter({ hasText: target.name })).toHaveCount(0);
});

test('patients: invalid form stays open and displays validation without sending a create request', async ({ page }) => {
  let creates = 0;
  page.on('request', request => { if (request.method() === 'POST' && request.url().endsWith('/api/patients')) creates++; });
  await page.goto('/patients'); await page.getByRole('button', { name: en.registerPatient, exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: en.saveRecord, exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible(); await expect(page.getByText(en.validationPatientNameRequired, { exact: true })).toBeVisible(); expect(creates).toBe(0);
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toBeHidden();
});

test('doctors: edit, deactivate and reactivate preserve demographic and department data', async ({ page }) => {
  const d = await doctor(page.request); await page.goto('/doctors');
  const card = page.getByTestId('doctor-card').filter({ hasText: d.name }); await card.getByRole('button', { name: 'Edit doctor' }).click();
  await page.getByRole('dialog').locator('[name=specialty]').fill('Neurology'); await page.getByRole('dialog').locator('button').last().click();
  await expect(page.getByRole('dialog')).toBeHidden(); await expect(card).toContainText('Neurology');
  await card.getByRole('button', { name: en.deactivate, exact: true }).click(); await expect(card.getByRole('button', { name: en.activate, exact: true })).toBeVisible();
  await card.getByRole('button', { name: en.activate, exact: true }).click(); await expect(card.getByRole('button', { name: en.deactivate, exact: true })).toBeVisible();
  await page.reload(); await expect(page.getByTestId('doctor-card').filter({ hasText: d.name })).toContainText(d.email);
});

test('appointments: reschedule conflict leaves original time intact and cancel requires confirmation', async ({ page }) => {
  const p = await patient(page.request); const d = await doctor(page.request); const day = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
  const a = await data(await page.request.post('/api/appointments', { data: { patientId: p.patientId, doctorId: d.doctorId, appointmentDate: day, appointmentTime: '10:00', durationMinutes: 30 } }));
  await data(await page.request.post('/api/appointments', { data: { patientId: p.patientId, doctorId: d.doctorId, appointmentDate: day, appointmentTime: '11:00', durationMinutes: 30 } }));
  await page.goto('/appointments'); const row = page.getByRole('row').filter({ hasText: a.appointmentId });
  await row.getByRole('button', { name: en.reschedule, exact: true }).click();
  await page.getByRole('dialog').locator('[name=appointmentTime]').fill('11:15');
  await page.getByRole('dialog').getByRole('button', { name: en.applyReschedule, exact: true }).click();
  await expect(page.getByText('Doctor or patient already has an overlapping appointment.').first()).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: en.commonCancel, exact: true }).click();
  await expect(row).toContainText('10:00');
  page.once('dialog', dialog => dialog.dismiss()); await row.getByRole('button', { name: en.commonCancel, exact: true }).click(); await expect(row).toContainText(en.commonScheduled);
  page.once('dialog', dialog => dialog.accept()); await row.getByRole('button', { name: en.commonCancel, exact: true }).click(); await expect(row).toContainText(en.commonCancelled);
  await page.reload(); await expect(page.getByRole('row').filter({ hasText: a.appointmentId })).toContainText(en.noActionsPossible);
});

test('billing: invoice details, full payment and CSV contain the same persisted amounts', async ({ page }) => {
  const p = await patient(page.request, { name: 'Feature, "CSV" Patient' }); const b = await invoice(page.request, p.patientId);
  await page.goto('/billing'); const row = page.getByRole('row').filter({ hasText: b.billId });
  await row.getByRole('button', { name: en.invoiceBtn, exact: true }).click(); await expect(page.getByRole('dialog')).toContainText('Consultation');
  await expect(page.getByRole('dialog')).toContainText('$100.00'); await page.getByRole('button', { name: 'Close dialog' }).click();
  for (const amount of ['30', '70']) {
    await row.getByRole('button', { name: en.payBtn, exact: true }).click(); await page.getByRole('dialog').locator('[name=amountToPay]').fill(amount);
    await page.getByRole('dialog').getByRole('button', { name: en.applyPaymentBtn, exact: true }).click(); await expect(page.getByRole('dialog')).toBeHidden();
  }
  await expect(row).toContainText(en.commonPaid); await expect(row.getByRole('button', { name: en.payBtn, exact: true })).toHaveCount(0);
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: en.exportCsvReport, exact: true }).click();
  const contents = await csv(await downloadPromise); expect(contents).toContain('"Feature, ""CSV"" Patient"'); expect(contents).toContain(b.billId);
  await page.reload(); await expect(page.getByRole('row').filter({ hasText: b.billId })).toContainText(en.commonPaid);
});

test('billing: dynamic services can be added and removed and overpayment is blocked', async ({ page }) => {
  const p = await patient(page.request); await page.goto('/billing'); await page.getByRole('button', { name: en.generateBill, exact: true }).click();
  const dialog = page.getByRole('dialog'); await dialog.locator('[name=patientId]').selectOption(p.patientId);
  await dialog.getByPlaceholder(en.serviceNamePlaceholder).fill('Ultrasound'); await dialog.getByPlaceholder(en.costPlaceholder).fill('80');
  await dialog.getByRole('button', { name: en.addItemBtn, exact: true }).click();
  await expect(dialog.getByText('Ultrasound', { exact: true })).toBeVisible(); await dialog.getByTitle('Remove service').first().click();
  await dialog.locator('[name=taxPercent]').fill('0'); await dialog.locator('[name=discountAmount]').fill('5');
  const saved = page.waitForResponse(r => r.url().endsWith('/api/billing') && r.request().method() === 'POST');
  await dialog.getByRole('button', { name: en.generateAndDispatchInvoice, exact: true }).click(); const b = await (await saved).json();
  expect(b.totalAmount).toBe(75); expect(b.services).toEqual([{ serviceName: 'Ultrasound', cost: 80 }]);
  const row = page.getByRole('row').filter({ hasText: b.billId }); await row.getByRole('button', { name: en.payBtn, exact: true }).click();
  await page.getByRole('dialog').locator('[name=amountToPay]').fill('76'); await page.getByRole('dialog').getByRole('button', { name: en.applyPaymentBtn, exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible(); await expect(row).toContainText('$0.00');
});

test('notifications: search, type and delivery-status filters show the queued recipient', async ({ page }) => {
  const p = await patient(page.request); const b = await invoice(page.request, p.patientId); await data(await page.request.post(`/api/billing/${b.billId}/reminders`), 202);
  await page.goto('/notifications'); await page.getByRole('textbox').first().fill(p.name);
  const row = page.getByRole('row').filter({ hasText: p.name }); await expect(row).toContainText('Pending');
  await page.locator('select').nth(0).selectOption('SMS'); await expect(row).toHaveCount(0);
  await page.locator('select').nth(0).selectOption('Email'); await page.locator('select').nth(1).selectOption('Pending'); await expect(row).toBeVisible();
  await page.locator('select').nth(1).selectOption('Sent'); await expect(row).toHaveCount(0);
});

test('audit: module/action/search filters and exported CSV match successful mutations', async ({ page }) => {
  const me = await (await page.request.get('/api/auth/session')).json() as any;
  await data(await page.request.put(`/api/auth/${me.userId}`, { data: { ...me, name: 'Admin, "CSV"', status: 'Active' } }), 200);
  const p = await patient(page.request); await page.goto('/audit'); await page.getByRole('textbox').first().fill(p.patientId);
  await page.locator('select').nth(0).selectOption('Patient'); await page.locator('select').nth(1).selectOption('Create');
  const row = page.getByRole('row').filter({ hasText: p.patientId }); await expect(row).toBeVisible();
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: en.exportAuditSpreadsheet, exact: true }).click();
  const contents = await csv(await pending); expect(contents).toContain(p.patientId); expect(contents).toContain('Create'); expect(contents).toContain('"Admin, ""CSV"""');
  await page.locator('select').nth(1).selectOption('Delete'); await expect(row).toHaveCount(0);
});

test('users: activation toggle is persisted and disabled staff cannot log in', async ({ page }) => {
  const user = await staff(page.request, 'Nurse'); await page.goto('/users'); const row = page.getByRole('row').filter({ hasText: user.email });
  await row.getByRole('button', { name: en.deactivate, exact: true }).click(); await expect(row.getByRole('button', { name: en.activate, exact: true })).toBeVisible();
  const response = await page.request.post('/api/auth/login', { data: { email: user.email, password } }); expect(response.status()).toBe(401);
  await row.getByRole('button', { name: en.activate, exact: true }).click(); await expect(row.getByRole('button', { name: en.deactivate, exact: true })).toBeVisible();
  await page.reload(); await expect(page.getByRole('row').filter({ hasText: user.email })).toContainText(en.commonActive);
});

test('records: archive, search and history retain the original and updated diagnoses', async ({ page }) => {
  const p = await patient(page.request); const user = await staff(page.request, 'Doctor'); await logout(page); await login(page, user.email);
  const record = await data(await page.request.post('/api/records', { data: { patientId: p.patientId, diagnosis: 'Feature Original Diagnosis', treatment: 'Initial treatment', prescriptions: 'None', status: 'Active' } }));
  await page.goto('/records'); await page.getByRole('textbox').first().fill(p.name);
  await page.getByRole('button', { name: en.modifyRecordBtn, exact: true }).click(); const dialog = page.getByRole('dialog');
  await dialog.locator('[name=diagnosis]').fill('Feature Archived Diagnosis'); await dialog.locator('[name=status]').selectOption('Archived');
  await dialog.getByRole('button', { name: en.compileUpdateBtn, exact: true }).click(); await expect(dialog).toBeHidden();
  await expect(page.getByText('Feature Archived Diagnosis', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: new RegExp(en.vHistoryBtn) }).click(); await expect(page.getByRole('dialog')).toContainText('Feature Original Diagnosis');
  await expect(page.getByRole('dialog')).toContainText('Feature Archived Diagnosis');
  const records = await (await page.request.get('/api/records')).json(); expect(records.find((r: any) => r.recordId === record.recordId).version).toBe(2);
});

test('dashboard: refresh updates real figures and financial data is hidden from clinical staff', async ({ page }) => {
  const p = await patient(page.request); const b = await invoice(page.request, p.patientId); await data(await page.request.post(`/api/billing/${b.billId}/payments`, { data: { amountToPay: 20 } }), 200);
  await page.goto('/dashboard'); const previous = await (await page.request.get('/api/dashboard')).json();
  await patient(page.request); const response = page.waitForResponse(r => r.url().endsWith('/api/dashboard'));
  await page.getByRole('button', { name: en.refreshIndicators, exact: true }).click(); const fresh = await (await response).json();
  expect(fresh.stats.totalPatients).toBe(previous.stats.totalPatients + 1); await expect(page.getByText('Clinical Performance & Analytics')).toBeVisible();
  const nurse = await staff(page.request, 'Nurse'); await logout(page); await login(page, nurse.email);
  const restricted = await (await page.request.get('/api/dashboard')).json(); expect(restricted.financeVisible).toBe(false); expect(restricted.stats.monthlyRevenue).toBeNull();
  await page.goto('/billing'); await expect(page).toHaveURL(/dashboard/); expect((await page.request.get('/api/billing')).status()).toBe(403);
});

test('layout: theme and Arabic persist, mobile navigation works and logout removes access', async ({ page }) => {
  await page.getByRole('button', { name: 'Toggle theme' }).click(); await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'العربية', exact: true }).click(); await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('lang', 'ar'); await expect(page.locator('html')).toHaveClass(/dark/);
  await page.setViewportSize({ width: 390, height: 844 }); await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.locator('nav:visible').getByRole('link', { name: ar.patientsDirectory, exact: true }).click(); await expect(page).toHaveURL(/patients/);
  await expect(page.locator('nav:visible')).toHaveCount(0);
  // Header logout title is translated after the language change.
  await page.locator('header button[title]').click(); await expect(page).toHaveURL(/auth/);
  await page.goto('/patients'); await expect(page).toHaveURL(/auth/);
});


test('failures: dashboard errors and failed logout are visible without losing a valid session', async ({ page }) => {
  await page.route('**/api/dashboard', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Temporarily unavailable' }) }));
  await page.reload(); await expect(page.getByText(en.commonSomethingWentWrong, { exact: true })).toBeVisible();
  await page.unroute('**/api/dashboard'); await page.reload(); await expect(page.getByText('Clinical Performance & Analytics')).toBeVisible();
  await page.route('**/api/auth/logout', route => route.abort());
  await page.getByTitle(en.logout, { exact: true }).click(); await expect(page.getByText('Unable to connect to the server.', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/dashboard/); await page.unroute('**/api/auth/logout'); await logout(page);
});
