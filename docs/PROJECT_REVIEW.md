# Project review and implementation

## Structure

The frontend organizes each feature into API clients, request/response types, domain mappers, query hooks, forms and pages. React Query owns remote state; React Hook Form and Yup validate forms. Shared providers manage language, theme and authentication.

The backend originally exposed entity-shaped DTOs from controllers through mutable service modes, mappers and repositories. Person records hold identity/contact information; patients and users reference people, doctors reference users and departments, and appointments link patients to doctors. Bills, medical records, notifications and audit logs each reference their owner records.

The application API now exposes composed workflow contracts matching the UI. `WorkflowService` centralizes response projections, actor identity, money rounding, uniqueness checks and audit persistence. Controllers validate requests, load related data and commit workflow changes with their audit entries. SQL Server remains supported; SQLite provides a portable development and relational test environment. Legacy services remain for administrator-only endpoints outside the SPA.

## Findings and changes

| Area | Original failure | Implemented behavior |
| --- | --- | --- |
| Frontend build | Patient hooks returned arrays while pages expected paginated envelopes; form handler types did not compile | Consistent array queries; filter before client pagination; corrected form handler contracts |
| Patient registration | UI sent demographics; API expected an existing PersonID and rejected empty medical history | Person and Patient created together in one commit; demographic edits persist; optional history remains optional |
| Physicians | Missing person/user composition; a unique department relationship allowed only one physician | Separate physician profile linked to a person; staff login can be linked in either order; many physicians per department |
| Department management | UI lacked update operations and exposed invalid head selection on creation | Editable department name/description and head assignment constrained to active department members |
| Appointments | Wrong date/time/duration field names; partial writes reached full DTO endpoints; creation service returned a false result after insertion | Workflow request contracts, HH:mm parsing, explicit reschedule/cancel endpoints, overlap detection for both patient and doctor |
| Billing | UI services/tax/discount were absent from persistence; partial payment overwrote state and marked every payment Paid | Persisted invoice lines; server decimal calculations; additive payment ledger and concurrency protection; paid status only after settling the balance |
| Reminders | BillID was sent as PatientID, a nonexistent system sender was used and errors were swallowed | Invoice resolves recipient; authenticated actor is sender; queue record persists as Pending; request failures surface |
| Medical records | Update omitted patient identity and audit/access fields; version history existed only in UI types | Server preserves associations and access level; persists snapshots; rejects stale versions with 409 |
| Notifications | DTO names did not match UI; SQL recipient FK referenced UserID | Consistent notification projection and recipient FK; unknown delivery time displayed without fabricated dates |
| Audit | DTO names differed and mutations did not persist audit entries | Server records successful changes in the same database commit and exposes matching UI fields |
| Login | Compared email to a short username field and compared plaintext; localStorage acted as session authority | Login queries person email; hashes passwords; HttpOnly cookie sessions; server session verification and active-account checks |
| Authorization | Server did not enforce the frontend's roles | Server authorization for clinical records, finance, administration and mutations; legacy endpoints restricted |
| Request handling | Hardcoded wrong HTTPS port and one-second timeout; error shapes ignored | Same-origin proxy/configurable base URL; 15-second timeout; structured problem/validation errors |
| Rate limiting | Global unsynchronized counter blocked ordinary page loading after five requests and returned HTTP 200 text | Built-in per-IP login limit returning 429; ordinary reads are unaffected |
| Dashboard | Hardcoded date, chart revenue and growth claims | Current dates and server aggregates from stored payments and active appointments; finance hidden from clinical roles |
| Feedback | Toast calls had no mounted renderer | Shared Toaster provides visible success/error feedback |
| Forms and usability | Patient edit fields were not populated; staff editing was inaccessible; labels were not linked to inputs | Populated patient forms, staff editing, explicit passwords, linked labels and modal semantics/focus handling |
| Configuration | Hosted credentials were committed and action arguments could log passwords | Credentials removed from configuration; arguments removed from action logging; local development uses isolated data |
| Delivery | No repeatable verification pipeline | Relational API tests, browser workflows, CI, schema export and administrator provisioning tools |

## Verification boundaries

The automated suites execute against disposable SQLite databases and do not touch the hosted hospital database. A SQL Server metadata test verifies schema generation, recipient FK selection, the nonunique department relationship and concurrency configuration. SQL deployment scripts are reviewable artifacts; execution against an actual SQL Server is not claimed.

Notification dispatch is not configured. Existing payment dates cannot be reconstructed from aggregate paid totals, so those amounts remain on invoices and are not fabricated into current revenue. Existing free-text medical audit trails remain in the database; new record edits persist structured versions. Historical creation timestamps remain null when unknown.

The legacy employee, person, report, catalog-category and bill-service APIs are outside the current SPA's feature screens. They remain available to administrators, rather than silently claiming complete new frontend modules for them.
