# SPA API contracts

All paths are relative to the same frontend origin. ASP.NET serializes properties as camelCase. Successful collections are JSON arrays; creates return the persisted view with HTTP 201, updates return that same view with HTTP 200, and deletes return 204. Validation failures use problem details and a field `errors` dictionary; missing records return 404; duplicates, overlaps, stale versions and invalid payment balances return 409. Protected requests require the `hms_session` HttpOnly cookie.

| Feature | Operations | Important contract fields |
| --- | --- | --- |
| Auth | `POST /api/auth/login`, `GET /api/auth/session`, `POST /api/auth/logout` | Login `{email,password}` → `{success,user}`; session returns the user; no passwords/hashes in responses |
| Staff | `GET /api/auth/users`, `POST /api/auth/register`, `PUT /api/auth/{id}` | `name,email,role,contactNumber?,department?,status,password?`; creation requires 12+ character password; update password is optional; response identifier `userId` |
| Patients | `GET/POST /api/patients`, `GET/PUT/DELETE /api/patients/{id}` | `name,dateOfBirth,gender,contactNumber,email,address,medicalHistory,status`; identifier `patientId`; optional empty medical history allowed |
| Doctors | `GET/POST /api/doctors`, `GET/PUT/DELETE /api/doctors/{id}` | `name,departmentId,specialty,contactNumber,email,status`; identifier `doctorId`; supports a profile without granting a staff login |
| Departments | `GET/POST /api/departments`, `PUT/DELETE /api/departments/{id}` | `name,description?,headOfDepartment?`; identifier `departmentId`; head must be an active physician in that department |
| Appointments | `GET/POST /api/appointments`, `GET/DELETE /api/appointments/{id}` | Create `patientId,doctorId,appointmentDate,appointmentTime,durationMinutes`; identifier `appointmentId`; status is assigned by server |
| Cancel | `PATCH /api/appointments/{id}/status` | `{status:"Cancelled"}`; retains patient, physician, date, time and duration |
| Reschedule | `PATCH /api/appointments/{id}/reschedule` | `{newDate,newTime}`; retains associations and duration; detects interval overlaps, excluding cancelled appointments |
| Billing | `GET/POST /api/billing`, `GET/DELETE /api/billing/{id}` | Create `patientId,services:[{serviceName,cost}],taxPercent,discountAmount,dueDate`; identifier `billId`; subtotal, total and balance calculated on server |
| Payments | `POST /api/billing/{id}/payments` | `{amountToPay}`; adds to existing payment amount; rejects zero, negatives and overpayment; persists dated payment entry |
| Reminder | `POST /api/billing/{id}/reminders` | No recipient/sender fields accepted; server resolves them; returns HTTP 202 and a Pending notification |
| Clinical records | `GET/POST /api/records`, `PUT /api/records/{id}` | Create `patientId,diagnosis,treatment,prescriptions,status`; update `diagnosis,treatment,prescriptions,status,version`; identifier `recordId`; response includes `history,version,updatedBy` |
| Notifications | `GET /api/notifications` | `notificationId,patientId,userId,type,message,status,sentOn,deliveryConfirmation,retries`; `sentOn` is null until sent |
| Audit | `GET /api/audit` | `auditId,userId,userName,entity,action,timestamp,details`; writes are server-owned |
| Dashboard | `GET /api/dashboard` | `financeVisible,stats,upcomingAppts,revenueData,doctorApptData`; finance fields are null for Doctor/Nurse |

Dates use `YYYY-MM-DD`; time input accepts `HH:mm` and `HH:mm:ss`. Appointment response times use `HH:mm`. Timestamps are UTC ISO strings. Unknown historical metadata is null; the frontend does not invent timestamps. Monetary values are rounded to two decimal places on the server. Partial invoices display Pending or Overdue while the database distinguishes Unpaid and Partially Paid.

| Capability | Roles |
| --- | --- |
| Shared patient/physician/department/appointment lookup and dashboard | Any active authenticated staff member, including Accounts for billing lookups |
| Register/edit patients and schedule/reschedule/cancel | Admin, Doctor, Nurse, Management |
| Medical record reads and writes | Doctor, Nurse |
| Finance reads, invoices, payments, reminders | Admin, Accounts, Management |
| Manage doctors/departments | Admin, Management |
| Staff management | Admin |
| Notification and audit views | Admin, Management |
| Delete patients/appointments/unpaid bills | Admin, subject to linked-record checks |

PUT operations accept complete writable forms. The frontend's status toggles send the complete current form with the new status, preventing omitted fields from being lost. Record updates additionally submit the exact version originally opened for editing.

The frontend does not expose arbitrary notification creation, audit modification or clinical record deletion. Notifications are created through the supported reminder workflow; clinical history and audit entries are preserved.
