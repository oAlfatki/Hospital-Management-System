using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using HSMDataAccess.Data;
using HSMDataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace HSMAPI.Tests;

// Each case owns a disposable database and authenticates through the real login endpoint.
public class FeatureApiTests : IAsyncLifetime
{
    private readonly HospitalFactory app = new();
    private HttpClient admin = null!;
    private int sequence;
    private const string Password = WorkflowTests.Password;
    public async Task InitializeAsync() { admin = app.CreateClient(); await Login(admin); }
    public Task DisposeAsync() { admin.Dispose(); app.Dispose(); return Task.CompletedTask; }
    private static async Task<JsonElement> Read(HttpResponseMessage response, int status = 200)
    {
        var body = await response.Content.ReadAsStringAsync();
        Assert.True((int)response.StatusCode == status, $"Expected {status}; got {(int)response.StatusCode}: {body}");
        if (string.IsNullOrWhiteSpace(body)) return default;
        if (response.Content.Headers.ContentType?.MediaType == "text/plain") return JsonSerializer.SerializeToElement(body);
        return JsonDocument.Parse(body).RootElement.Clone();
    }
    private static async Task Login(HttpClient client, string email = "admin@example.test", string password = Password) =>
        await Read(await client.PostAsJsonAsync("/api/auth/login", new { email, password }));
    private Dictionary<string, object?> PersonBody(string status = "Active")
    {
        var n = ++sequence;
        return new() { ["name"] = $"Feature Patient {n}", ["email"] = $"person{n}@feature.test", ["contactNumber"] = $"05{n:D8}",
            ["dateOfBirth"] = "1992-06-15", ["gender"] = "Female", ["address"] = "Riyadh", ["medicalHistory"] = "", ["status"] = status };
    }
    private async Task<(string Id, Dictionary<string, object?> Body)> Patient(string status = "Active")
    {
        var body = PersonBody(status); var p = await Read(await admin.PostAsJsonAsync("/api/patients", body), 201);
        return (p.GetProperty("patientId").GetString()!, body);
    }
    private async Task<string> Department(string name = "Cardiology") =>
        (await Read(await admin.PostAsJsonAsync("/api/departments", new { name, description = "Feature department" }), 201)).GetProperty("departmentId").GetString()!;
    private async Task<(string Id, Dictionary<string, object?> Body)> Doctor(string? department = null)
    {
        var body = PersonBody(); body["departmentId"] = department ?? await Department(); body["specialty"] = "Cardiology";
        var doctor = await Read(await admin.PostAsJsonAsync("/api/doctors", body), 201);
        return (doctor.GetProperty("doctorId").GetString()!, body);
    }
    private object Staff(string role, string email) => new { name = role + " Feature Staff", email, role, status = "Active", password = Password };
    private object Appointment(string patient, string doctor, string time = "10:00") => new { patientId = patient, doctorId = doctor,
        appointmentDate = DateTime.Today.AddDays(3).ToString("yyyy-MM-dd"), appointmentTime = time, durationMinutes = 30 };
    private object Invoice(string patient, decimal cost = 100m) => new { patientId = patient, services = new[] { new { serviceName = "Consultation", cost } },
        taxPercent = 0, discountAmount = 0, dueDate = DateTime.Today.AddDays(10).ToString("yyyy-MM-dd") };
    private async Task<string> Bill(string patient) => (await Read(await admin.PostAsJsonAsync("/api/billing", Invoice(patient)), 201)).GetProperty("billId").GetString()!;

    [Fact]
    public async Task Authentication_RejectsMissingFieldsAndNormalizesEmail()
    {
        using var c = app.CreateClient();
        await Read(await c.PostAsJsonAsync("/api/auth/login", new { email = "", password = "" }), 400);
        await Read(await c.PostAsJsonAsync("/api/auth/login", new { email = "admin@example.test", password = "invalid" }), 401);
        await Login(c, "ADMIN@EXAMPLE.TEST");
        Assert.Equal("Admin", (await Read(await c.GetAsync("/api/auth/session"))).GetProperty("role").GetString());
        var cookies = (await c.GetAsync("/api/auth/session")).StatusCode; Assert.Equal(HttpStatusCode.OK, cookies);
    }

    [Fact]
    public async Task Users_ChangesPasswordAndRoleWithoutLosingProfile()
    {
        var created = await Read(await admin.PostAsJsonAsync("/api/auth/register", Staff("Management", "staff@feature.test")), 201);
        var id = created.GetProperty("userId").GetString();
        using var staff = app.CreateClient(); await Login(staff, "staff@feature.test");
        await Read(await staff.GetAsync("/api/audit"));
        await Read(await admin.PutAsJsonAsync($"/api/auth/{id}", new { name = "Updated Staff", email = "staff@feature.test", role = "Nurse", status = "Active", password = "Replacement-Password-44!" }));
        await Read(await staff.GetAsync("/api/audit"), 403);
        using var login = app.CreateClient();
        await Read(await login.PostAsJsonAsync("/api/auth/login", new { email = "staff@feature.test", password = Password }), 401);
        await Login(login, "staff@feature.test", "Replacement-Password-44!");
        var profile = await Read(await login.GetAsync("/api/auth/session"));
        Assert.Equal("Updated Staff", profile.GetProperty("name").GetString()); Assert.Equal("Nurse", profile.GetProperty("role").GetString());
    }

    [Fact]
    public async Task Users_RejectsSelfLockoutDuplicateEmailAndShortPassword()
    {
        var me = await Read(await admin.GetAsync("/api/auth/session"));
        await Read(await admin.PutAsJsonAsync("/api/auth/" + me.GetProperty("userId").GetString(), new { name = "Administrator", email = "admin@example.test", role = "Nurse", status = "Active" }), 409);
        await Read(await admin.PostAsJsonAsync("/api/auth/register", Staff("Nurse", "admin@example.test")), 409);
        await Read(await admin.PostAsJsonAsync("/api/auth/register", new { name = "Short Password", email = "short@feature.test", role = "Nurse", status = "Active", password = "short" }), 400);
        Assert.Equal("Admin", (await Read(await admin.GetAsync("/api/auth/session"))).GetProperty("role").GetString());
    }

    [Fact]
    public async Task Patients_PersistsAllDemographicsAndAllStatuses()
    {
        var (id, body) = await Patient();
        foreach (var status in new[] { "Inactive", "Deceased", "Active" })
        {
            body["status"] = status; body["name"] = "Updated Patient"; body["address"] = "Jeddah"; body["medicalHistory"] = "Allergy";
            await Read(await admin.PutAsJsonAsync($"/api/patients/{id}", body));
            var p = await Read(await admin.GetAsync($"/api/patients/{id}"));
            Assert.Equal(status, p.GetProperty("status").GetString()); Assert.Equal("Jeddah", p.GetProperty("address").GetString());
            Assert.Equal("Allergy", p.GetProperty("medicalHistory").GetString()); Assert.Equal("1992-06-15", p.GetProperty("dateOfBirth").GetString());
        }
        await Read(await admin.DeleteAsync($"/api/patients/{id}"), 204);
        await Read(await admin.GetAsync($"/api/patients/{id}"), 404);
        await Read(await admin.PutAsJsonAsync("/api/patients/absent", body), 404);
        await Read(await admin.DeleteAsync("/api/patients/absent"), 404);
    }

    [Fact]
    public async Task Patients_RejectsDuplicatePhoneFutureBirthAndInvalidContacts()
    {
        var (_, first) = await Patient(); var body = PersonBody(); body["contactNumber"] = first["contactNumber"];
        await Read(await admin.PostAsJsonAsync("/api/patients", body), 409);
        body = PersonBody(); body["dateOfBirth"] = DateTime.Today.AddDays(1).ToString("yyyy-MM-dd"); await Read(await admin.PostAsJsonAsync("/api/patients", body), 400);
        body = PersonBody(); body["email"] = "not-an-email"; await Read(await admin.PostAsJsonAsync("/api/patients", body), 400);
        body = PersonBody(); body["contactNumber"] = "123"; await Read(await admin.PostAsJsonAsync("/api/patients", body), 400);
        Assert.Equal(1, (await Read(await admin.GetAsync("/api/patients"))).GetArrayLength());
    }

    [Fact]
    public async Task DepartmentsAndDoctors_EditDeactivateReactivateAndDelete()
    {
        var department = await Department(); var (id, body) = await Doctor(department);
        body["name"] = "Edited Physician"; body["specialty"] = "Neurology"; body["status"] = "Inactive";
        await Read(await admin.PutAsJsonAsync($"/api/doctors/{id}", body));
        var doctor = await Read(await admin.GetAsync($"/api/doctors/{id}")); Assert.Equal("Inactive", doctor.GetProperty("status").GetString()); Assert.Equal("Neurology", doctor.GetProperty("specialty").GetString());
        body["status"] = "Active"; await Read(await admin.PutAsJsonAsync($"/api/doctors/{id}", body));
        await Read(await admin.PutAsJsonAsync($"/api/departments/{department}", new { name = "Neurology", headOfDepartment = id, description = "Edited description" }));
        await Read(await admin.DeleteAsync($"/api/doctors/{id}"), 409);
        await Read(await admin.DeleteAsync($"/api/departments/{department}"), 409);
        await Read(await admin.PutAsJsonAsync($"/api/departments/{department}", new { name = "Neurology", headOfDepartment = "", description = "No head" }));
        await Read(await admin.DeleteAsync($"/api/doctors/{id}"), 204);
        await Read(await admin.GetAsync($"/api/doctors/{id}"), 404);
        await Read(await admin.DeleteAsync($"/api/departments/{department}"), 204);
    }

    [Fact]
    public async Task Departments_RejectsWrongHeadAndProtectsTransferOfCurrentHead()
    {
        var a = await Department("Department A"); var b = await Department("Department B"); var (id, body) = await Doctor(a);
        await Read(await admin.PutAsJsonAsync($"/api/departments/{b}", new { name = "Department B", headOfDepartment = id }), 400);
        await Read(await admin.PutAsJsonAsync($"/api/departments/{a}", new { name = "Department A", headOfDepartment = id }));
        body["departmentId"] = b; await Read(await admin.PutAsJsonAsync($"/api/doctors/{id}", body), 409);
        body["departmentId"] = a; body["status"] = "Inactive"; await Read(await admin.PutAsJsonAsync($"/api/doctors/{id}", body), 409);
        body["departmentId"] = "absent"; await Read(await admin.PutAsJsonAsync($"/api/doctors/{id}", body), 404);
        await Read(await admin.PutAsJsonAsync("/api/departments/absent", new { name = "Absent" }), 404);
    }

    [Fact]
    public async Task Doctors_LinksStaffCreatedBeforeTheProfile()
    {
        await Read(await admin.PostAsJsonAsync("/api/auth/register", Staff("Doctor", "first@feature.test")), 201);
        var department = await Department(); var body = PersonBody(); body["email"] = "first@feature.test"; body["departmentId"] = department; body["specialty"] = "Pediatrics";
        var doctor = await Read(await admin.PostAsJsonAsync("/api/doctors", body), 201);
        await Read(await admin.PostAsJsonAsync("/api/doctors", body), 409);
        using var staff = app.CreateClient(); await Login(staff, "first@feature.test");
        Assert.Equal(doctor.GetProperty("name").GetString(), (await Read(await staff.GetAsync("/api/auth/session"))).GetProperty("name").GetString());
    }

    [Fact]
    public async Task Appointments_ChecksDoctorAndPatientIntervalsIndependently()
    {
        var (p1, _) = await Patient(); var (p2, _) = await Patient(); var (d1, _) = await Doctor(); var (d2, _) = await Doctor();
        var a = await Read(await admin.PostAsJsonAsync("/api/appointments", Appointment(p1, d1)), 201); var id = a.GetProperty("appointmentId").GetString();
        await Read(await admin.PostAsJsonAsync("/api/appointments", Appointment(p2, d1, "10:15")), 409);
        await Read(await admin.PostAsJsonAsync("/api/appointments", Appointment(p1, d2, "10:15")), 409);
        await Read(await admin.PostAsJsonAsync("/api/appointments", Appointment(p2, d2, "10:15")), 201);
        await Read(await admin.PostAsJsonAsync("/api/appointments", Appointment(p1, d1, "10:30")), 201);
        await Read(await admin.PatchAsJsonAsync($"/api/appointments/{id}/reschedule", new { newDate = DateTime.Today.AddDays(3).ToString("yyyy-MM-dd"), newTime = "10:45" }), 409);
        var unchanged = await Read(await admin.GetAsync($"/api/appointments/{id}")); Assert.Equal("10:00", unchanged.GetProperty("appointmentTime").GetString());
        await Read(await admin.DeleteAsync($"/api/appointments/{id}"), 204); await Read(await admin.GetAsync($"/api/appointments/{id}"), 404);
    }

    [Fact]
    public async Task Appointments_RejectsInactiveParticipantsPastDatesAndMissingTime()
    {
        var (p, body) = await Patient(); var (d, _) = await Doctor();
        await Read(await admin.PostAsJsonAsync("/api/appointments", new { patientId = p, doctorId = d, appointmentDate = DateTime.Today.AddDays(3).ToString("yyyy-MM-dd"), durationMinutes = 30 }), 400);
        await Read(await admin.PostAsJsonAsync("/api/appointments", new { patientId = p, doctorId = d, appointmentDate = "2020-01-01", appointmentTime = "10:00", durationMinutes = 30 }), 400);
        await Read(await admin.PostAsJsonAsync("/api/appointments", new { patientId = p, doctorId = d, appointmentDate = DateTime.Today.AddDays(3).ToString("yyyy-MM-dd"), appointmentTime = "25:00", durationMinutes = 30 }), 400);
        body["status"] = "Inactive"; await Read(await admin.PutAsJsonAsync($"/api/patients/{p}", body));
        await Read(await admin.PostAsJsonAsync("/api/appointments", Appointment(p, d)), 404);
        await Read(await admin.PatchAsJsonAsync("/api/appointments/absent/status", new { status = "Cancelled" }), 404);
    }

    [Fact]
    public async Task Billing_RejectsInvalidLinesDiscountsPaymentsAndMissingInvoices()
    {
        var (patient, _) = await Patient(); var id = await Bill(patient);
        await Read(await admin.PostAsJsonAsync("/api/billing", new { patientId = patient, services = Array.Empty<object>(), taxPercent = 0, discountAmount = 0, dueDate = DateTime.Today.AddDays(2).ToString("yyyy-MM-dd") }), 400);
        await Read(await admin.PostAsJsonAsync("/api/billing", Invoice(patient, -5)), 400);
        await Read(await admin.PostAsJsonAsync($"/api/billing/{id}/payments", new { amountToPay = 0 }), 400);
        await Read(await admin.PostAsJsonAsync($"/api/billing/{id}/payments", new { amountToPay = -1 }), 400);
        await Read(await admin.PostAsJsonAsync($"/api/billing/{id}/payments", new { amountToPay = 101 }), 409);
        await Read(await admin.PostAsJsonAsync("/api/billing/absent/payments", new { amountToPay = 1 }), 404);
        await Read(await admin.PostAsync("/api/billing/absent/reminders", null), 404);
        await Read(await admin.PostAsJsonAsync($"/api/billing/{id}/payments", new { amountToPay = 100 }));
        await Read(await admin.PostAsync($"/api/billing/{id}/reminders", null), 409);
        var unpaid = await Bill(patient); await Read(await admin.DeleteAsync($"/api/billing/{unpaid}"), 204);
        await Read(await admin.GetAsync($"/api/billing/{unpaid}"), 404);
    }

    [Fact]
    public async Task Billing_RoundsInputsBeforeCalculationsAndShowsOverdueInvoices()
    {
        var (patient, _) = await Patient();
        var b = await Read(await admin.PostAsJsonAsync("/api/billing", new { patientId = patient, services = new[] { new { serviceName = "Fractional", cost = 10.005m } },
            taxPercent = 15.005m, discountAmount = 0.005m, dueDate = DateTime.Today.AddDays(2).ToString("yyyy-MM-dd") }), 201);
        Assert.Equal(10.01m, b.GetProperty("subtotal").GetDecimal()); Assert.Equal(11.50m, b.GetProperty("totalAmount").GetDecimal());
        var id = b.GetProperty("billId").GetString();
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDBContext>(); var entity = await db.Bills.FindAsync(id);
            entity!.DueDate = DateTime.UtcNow.Date.AddDays(-2); await db.SaveChangesAsync();
        }
        Assert.Equal("Overdue", (await Read(await admin.GetAsync($"/api/billing/{id}"))).GetProperty("status").GetString());
    }

    [Fact]
    public async Task Billing_ConcurrentPaymentsCannotOverpayOrLoseLedgerEntries()
    {
        var (patient, _) = await Patient(); var id = await Bill(patient);
        using var a = app.CreateClient(); using var b = app.CreateClient(); await Login(a); await Login(b);
        var responses = await Task.WhenAll(a.PostAsJsonAsync($"/api/billing/{id}/payments", new { amountToPay = 80 }), b.PostAsJsonAsync($"/api/billing/{id}/payments", new { amountToPay = 80 }));
        Assert.Equal(new[] { 200, 409 }, responses.Select(r => (int)r.StatusCode).OrderBy(x => x).ToArray());
        var bill = await Read(await admin.GetAsync($"/api/billing/{id}")); Assert.Equal(80m, bill.GetProperty("paidAmount").GetDecimal());
        using var scope = app.Services.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDBContext>();
        Assert.Equal(1, await db.Payments.CountAsync(p => p.BillID == id));
    }

    [Fact]
    public async Task ClinicalRecords_PreservesEveryVersionAndRejectsStaleChanges()
    {
        var (patient, _) = await Patient(); await Read(await admin.PostAsJsonAsync("/api/auth/register", Staff("Doctor", "clinical@feature.test")), 201);
        using var c = app.CreateClient(); await Login(c, "clinical@feature.test");
        var r = await Read(await c.PostAsJsonAsync("/api/records", new { patientId = patient, diagnosis = "Initial", treatment = "Treatment", prescriptions = "None", status = "Active" }), 201);
        var id = r.GetProperty("recordId").GetString();
        await Read(await c.PutAsJsonAsync($"/api/records/{id}", new { diagnosis = "Archived diagnosis", treatment = "Treatment 2", prescriptions = "Medication", status = "Archived", version = 1 }));
        await Read(await c.PutAsJsonAsync($"/api/records/{id}", new { diagnosis = "Stale", treatment = "Stale", prescriptions = "", status = "Active", version = 1 }), 409);
        var latest = (await Read(await c.GetAsync("/api/records"))).EnumerateArray().Single();
        Assert.Equal("Archived", latest.GetProperty("status").GetString()); Assert.Equal(patient, latest.GetProperty("patientId").GetString());
        Assert.Equal("Initial", latest.GetProperty("history")[0].GetProperty("diagnosis").GetString());
        Assert.Equal("Archived diagnosis", latest.GetProperty("history")[1].GetProperty("diagnosis").GetString());
        await Read(await c.PostAsJsonAsync("/api/records", new { patientId = "absent", diagnosis = "Diagnosis", treatment = "Treatment", prescriptions = "", status = "Active" }), 404);
    }

    [Fact]
    public async Task NotificationsAndAudit_UseRealRecipientActorAndOnlyCommitSuccessfulChanges()
    {
        var (patient, body) = await Patient(); var bill = await Bill(patient); var me = await Read(await admin.GetAsync("/api/auth/session"));
        await Read(await admin.PostAsync($"/api/billing/{bill}/reminders", null), 202);
        var notification = (await Read(await admin.GetAsync("/api/notifications"))).EnumerateArray().Single();
        Assert.Equal(patient, notification.GetProperty("patientId").GetString()); Assert.Equal(me.GetProperty("userId").GetString(), notification.GetProperty("userId").GetString());
        Assert.Equal(JsonValueKind.Null, notification.GetProperty("sentOn").ValueKind); Assert.Equal("Pending", notification.GetProperty("status").GetString());
        var before = (await Read(await admin.GetAsync("/api/audit"))).GetArrayLength();
        await Read(await admin.PostAsJsonAsync("/api/patients", body), 409);
        var after = await Read(await admin.GetAsync("/api/audit")); Assert.Equal(before, after.GetArrayLength());
        Assert.Contains(after.EnumerateArray(), x => x.GetProperty("entity").GetString() == "Notification" && x.GetProperty("userId").GetString() == me.GetProperty("userId").GetString());
    }

    [Theory]
    [InlineData("Admin")][InlineData("Doctor")][InlineData("Nurse")][InlineData("Accounts")][InlineData("Management")]
    public async Task Permissions_EveryRoleIsCheckedAcrossAllFeatureReadsAndWrites(string role)
    {
        var (patient, _) = await Patient(); var (doctor, doctorBody) = await Doctor();
        using var c = app.CreateClient();
        if (role == "Admin") await Login(c);
        else { await Read(await admin.PostAsJsonAsync("/api/auth/register", Staff(role, "role@feature.test")), 201); await Login(c, "role@feature.test"); }
        foreach (var path in new[] { "patients", "doctors", "departments", "appointments", "dashboard" }) await Read(await c.GetAsync("/api/" + path));
        await Read(await c.GetAsync("/api/records"), role is "Doctor" or "Nurse" ? 200 : 403);
        await Read(await c.GetAsync("/api/billing"), role is "Admin" or "Accounts" or "Management" ? 200 : 403);
        await Read(await c.GetAsync("/api/auth/users"), role == "Admin" ? 200 : 403);
        foreach (var path in new[] { "notifications", "audit" }) await Read(await c.GetAsync("/api/" + path), role is "Admin" or "Management" ? 200 : 403);
        foreach (var path in new[] { "PersonController", "EmployeeController", "ReportController", "ServiceCategoryController", "BillServiceController" })
            await Read(await c.GetAsync($"/api/{path}/All"), role == "Admin" ? 200 : 403);
        await Read(await c.PostAsJsonAsync("/api/patients", PersonBody()), role == "Accounts" ? 403 : 201);
        await Read(await c.PostAsJsonAsync("/api/appointments", Appointment(patient, doctor)), role == "Accounts" ? 403 : 201);
        await Read(await c.PostAsJsonAsync("/api/billing", Invoice(patient)), role is "Admin" or "Accounts" or "Management" ? 201 : 403);
        await Read(await c.PostAsJsonAsync("/api/records", new { patientId = patient, diagnosis = "Diagnosis", treatment = "Treatment", prescriptions = "", status = "Active" }), role is "Doctor" or "Nurse" ? 201 : 403);
        await Read(await c.PostAsJsonAsync("/api/auth/register", Staff("Nurse", "another@feature.test")), role == "Admin" ? 201 : 403);
        await Read(await c.PostAsJsonAsync("/api/departments", new { name = "Permissions Department" }), role is "Admin" or "Management" ? 201 : 403);
        await Read(await c.PutAsJsonAsync("/api/doctors/" + doctor, doctorBody), role is "Admin" or "Management" ? 200 : 403);
        await Read(await c.PutAsJsonAsync("/api/departments/" + doctorBody["departmentId"], new { name = "Permissions Department Updated" }), role is "Admin" or "Management" ? 200 : 403);
        var bill = await Bill(patient);
        await Read(await c.PostAsJsonAsync($"/api/billing/{bill}/payments", new { amountToPay = 10 }), role is "Admin" or "Accounts" or "Management" ? 200 : 403);
        await Read(await c.PostAsync($"/api/billing/{bill}/reminders", null), role is "Admin" or "Accounts" or "Management" ? 202 : 403);
        var unpaid = await Bill(patient);
        await Read(await c.DeleteAsync($"/api/billing/{unpaid}"), role == "Admin" ? 204 : 403);
        await Read(await c.PutAsJsonAsync("/api/appointments/missing", Appointment(patient, doctor)), role == "Accounts" ? 403 : 404);
        await Read(await c.DeleteAsync("/api/appointments/missing"), role == "Admin" ? 404 : 403);
        await Read(await c.PutAsJsonAsync("/api/billing/missing", Invoice(patient)), role is "Admin" or "Accounts" or "Management" ? 404 : 403);
        await Read(await c.DeleteAsync("/api/auth/missing"), role == "Admin" ? 404 : 403);
        await Read(await c.DeleteAsync("/api/records/missing?version=1"), role is "Doctor" or "Nurse" ? 404 : 403);
        await Read(await c.PutAsJsonAsync("/api/notifications/missing", new { message = "Updated", type = "Email" }), role is "Admin" or "Management" ? 404 : 403);
        await Read(await c.DeleteAsync("/api/notifications/missing"), role is "Admin" or "Management" ? 404 : 403);
        var (unlinkedPatient, _) = await Patient();
        await Read(await c.DeleteAsync($"/api/patients/{unlinkedPatient}"), role == "Admin" ? 204 : 403);
    }

    private async Task<string> SeedPerson()
    {
        var body = PersonBody(); var id = Guid.NewGuid().ToString("N")[..10];
        using var scope = app.Services.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDBContext>();
        db.People.Add(new Person { ID = id, Name = (string)body["name"]!, Email = (string)body["email"]!, ContactNumber = (string)body["contactNumber"]!,
            Gender = "Female", Address = "Riyadh", DateOfBirth = new DateOnly(1990, 1, 1) });
        await db.SaveChangesAsync(); return id;
    }

    [Fact]
    public async Task LegacyPeople_CreateReadUpdateDeleteReturnsThePersistedIdentifier()
    {
        var body = PersonBody(); body["id"] = Guid.NewGuid().ToString("N")[..10];
        var created = await Read(await admin.PostAsJsonAsync("/api/PersonController/Create", body), 201);
        var id = created.GetProperty("id").GetString();
        var persisted = await Read(await admin.GetAsync($"/api/PersonController/{id}"));
        Assert.Equal(body["name"], persisted.GetProperty("employeeDTO").GetProperty("name").GetString());
        body["name"] = "Edited Legacy Person"; await Read(await admin.PutAsJsonAsync($"/api/PersonController/{id}", body));
        Assert.Equal("Edited Legacy Person", (await Read(await admin.GetAsync($"/api/PersonController/{id}"))).GetProperty("employeeDTO").GetProperty("name").GetString());
        await Read(await admin.DeleteAsync($"/api/PersonController/Delete/{id}")); await Read(await admin.GetAsync($"/api/PersonController/{id}"), 404);
    }

    [Fact]
    public async Task LegacyEmployees_CreateReadUpdateDeleteAndRejectsInvalidPerson()
    {
        var person = await SeedPerson();
        var body = new Dictionary<string, object?> { ["id"] = Guid.NewGuid().ToString("N")[..10], ["personID"] = person, ["salary"] = 5000, ["hireDate"] = "2024-01-01T00:00:00", ["isActive"] = true };
        var created = await Read(await admin.PostAsJsonAsync("/api/EmployeeController/Create", body), 201); var id = created.GetProperty("id").GetString();
        Assert.Equal(5000, (await Read(await admin.GetAsync($"/api/EmployeeController/{id}"))).GetProperty("employeeDTO").GetProperty("salary").GetDecimal());
        body["salary"] = 6000; await Read(await admin.PutAsJsonAsync($"/api/EmployeeController/{id}", body));
        Assert.Equal(6000, (await Read(await admin.GetAsync($"/api/EmployeeController/{id}"))).GetProperty("employeeDTO").GetProperty("salary").GetDecimal());
        await Read(await admin.DeleteAsync($"/api/EmployeeController/Delete/{id}")); await Read(await admin.GetAsync($"/api/EmployeeController/{id}"), 404);
        body["personID"] = "absent"; await Read(await admin.PostAsJsonAsync("/api/EmployeeController/Create", body), 404);
    }

    [Fact]
    public async Task LegacyServiceCategories_CreateReadUpdateDeleteReturnsData()
    {
        var body = new { id = Guid.NewGuid().ToString("N")[..10], categoryName = "Consultations", categoryDescription = "Clinical services" };
        var created = await Read(await admin.PostAsJsonAsync("/api/ServiceCategoryController/Create", body), 201); var id = created.GetProperty("id").GetString();
        var category = await Read(await admin.GetAsync($"/api/ServiceCategoryController/{id}"));
        Assert.Equal("Consultations", category.GetProperty("categoryName").GetString());
        await Read(await admin.PutAsJsonAsync($"/api/ServiceCategoryController/{id}", new { id, categoryName = "Specialist", categoryDescription = "Updated" }));
        Assert.Equal("Specialist", (await Read(await admin.GetAsync($"/api/ServiceCategoryController/{id}"))).GetProperty("categoryName").GetString());
        await Read(await admin.DeleteAsync($"/api/ServiceCategoryController/Delete/{id}")); await Read(await admin.GetAsync($"/api/ServiceCategoryController/{id}"), 404);
    }

    [Fact]
    public async Task LegacyReports_CreateReadUpdateDeleteAndRejectsInvalidFormat()
    {
        var me = await Read(await admin.GetAsync("/api/auth/session"));
        var body = new Dictionary<string, object?> { ["id"] = Guid.NewGuid().ToString("N")[..10], ["generatedBy"] = me.GetProperty("userId").GetString(),
            ["type"] = "Daily", ["generatedOn"] = "2026-01-01T12:00:00", ["exportFormat"] = "PDF", ["status"] = "Success", ["notes"] = "Initial report" };
        var created = await Read(await admin.PostAsJsonAsync("/api/ReportController/Create", body), 201); var id = created.GetProperty("id").GetString();
        await Read(await admin.GetAsync($"/api/ReportController/{id}"));
        body["notes"] = "Updated report"; await Read(await admin.PutAsJsonAsync($"/api/ReportController/{id}", body));
        var report = await Read(await admin.GetAsync($"/api/ReportController/{id}"));
        Assert.Contains("Updated report", report.ToString());
        await Read(await admin.DeleteAsync($"/api/ReportController/Delete/{id}")); await Read(await admin.GetAsync($"/api/ReportController/{id}"), 404);
        body["exportFormat"] = "Executable"; await Read(await admin.PostAsJsonAsync("/api/ReportController/Create", body), 400);
    }

    [Fact]
    public async Task LegacyBillServices_UsesMedicalServiceKeyAndUpdatesWithoutTrackingConflict()
    {
        var (patient, _) = await Patient(); var bill = await Bill(patient); var service = Guid.NewGuid().ToString("N")[..10];
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDBContext>(); var category = Guid.NewGuid().ToString("N")[..10];
            db.ServiceCategories.Add(new ServiceCategories { ID = category, CategoryName = "Lab", CategoryDescription = "Lab services" });
            db.MedicalServices.Add(new MedicalServices { ID = service, CategoryID = category, ServiceName = "Blood test", DefaultPrice = 10 });
            await db.SaveChangesAsync();
        }
        var body = new { serviceID = service, billID = bill, quantity = 2, unitPrice = 10, totalPrice = 20 };
        await Read(await admin.PostAsJsonAsync("/api/BillServiceController/Create", body), 201);
        var line = await Read(await admin.GetAsync($"/api/BillServiceController/{service}/{bill}"));
        Assert.Equal(2, line.GetProperty("employeeDTO").GetProperty("quantity").GetInt32());
        await Read(await admin.PutAsJsonAsync($"/api/BillServiceController/{service}/{bill}", new { serviceID = service, billID = bill, quantity = 3, unitPrice = 12, totalPrice = 36 }));
        line = await Read(await admin.GetAsync($"/api/BillServiceController/{service}/{bill}"));
        Assert.Equal(3, line.GetProperty("employeeDTO").GetProperty("quantity").GetInt32());
        await Read(await admin.DeleteAsync($"/api/BillServiceController/Delete/{service}/{bill}"));
        await Read(await admin.GetAsync($"/api/BillServiceController/{service}/{bill}"), 404);
    }

    [Fact]
    public async Task EveryProtectedApiRoute_RejectsAnonymousRequests()
    {
        using var anonymous = app.CreateClient();
        var source = app.Services.GetRequiredService<Microsoft.AspNetCore.Routing.EndpointDataSource>();
        var operations = 0;
        foreach (var endpoint in source.Endpoints.OfType<Microsoft.AspNetCore.Routing.RouteEndpoint>())
        {
            var route = endpoint.RoutePattern.RawText;
            if (route is null || !route.StartsWith("api/", StringComparison.Ordinal)
                || endpoint.Metadata.GetMetadata<Microsoft.AspNetCore.Authorization.IAllowAnonymous>() is not null) continue;
            var methods = endpoint.Metadata.GetMetadata<Microsoft.AspNetCore.Routing.IHttpMethodMetadata>()?.HttpMethods ?? [];
            var path = "/" + System.Text.RegularExpressions.Regex.Replace(route, @"\{[^}]+\}", "absent");
            foreach (var method in methods)
            {
                using var request = new HttpRequestMessage(new HttpMethod(method), path);
                using var response = await anonymous.SendAsync(request);
                Assert.True(response.StatusCode == HttpStatusCode.Unauthorized, $"{method} {route} returned {response.StatusCode} for an anonymous user.");
                operations++;
            }
        }
        Assert.True(operations >= 40, $"Unexpectedly small API inventory: {operations} protected operations.");
    }

    [Fact]
    public async Task Appointments_ConcurrentReservationsCannotDoubleBookTheSameInterval()
    {
        var (patient, _) = await Patient(); var (doctor, _) = await Doctor();
        using var a = app.CreateClient(); using var b = app.CreateClient(); await Login(a); await Login(b);
        var request = Appointment(patient, doctor);
        var responses = await Task.WhenAll(a.PostAsJsonAsync("/api/appointments", request), b.PostAsJsonAsync("/api/appointments", request));
        Assert.Equal(new[] { 201, 409 }, responses.Select(r => (int)r.StatusCode).OrderBy(x => x).ToArray());
        Assert.Single((await Read(await admin.GetAsync("/api/appointments"))).EnumerateArray());
    }

    [Fact]
    public async Task AppointmentEditing_ChangesParticipantsAndDurationButRejectsConflictsAndCancelledRows()
    {
        var (p1, _) = await Patient(); var (p2, _) = await Patient(); var (d1, _) = await Doctor(); var (d2, _) = await Doctor();
        var created = await Read(await admin.PostAsJsonAsync("/api/appointments", Appointment(p1, d1)), 201);
        var id = created.GetProperty("appointmentId").GetString();
        var update = new { patientId = p2, doctorId = d2, appointmentDate = DateTime.Today.AddDays(4).ToString("yyyy-MM-dd"), appointmentTime = "11:00", durationMinutes = 60 };
        await Read(await admin.PutAsJsonAsync($"/api/appointments/{id}", update));
        var saved = await Read(await admin.GetAsync($"/api/appointments/{id}"));
        Assert.Equal(p2, saved.GetProperty("patientId").GetString()); Assert.Equal(d2, saved.GetProperty("doctorId").GetString());
        Assert.Equal(60, saved.GetProperty("durationMinutes").GetInt32());
        await Read(await admin.PostAsJsonAsync("/api/appointments", Appointment(p1, d1)), 201);
        await Read(await admin.PutAsJsonAsync($"/api/appointments/{id}", Appointment(p1, d1)), 409);
        Assert.Equal(p2, (await Read(await admin.GetAsync($"/api/appointments/{id}"))).GetProperty("patientId").GetString());
        await Read(await admin.PatchAsJsonAsync($"/api/appointments/{id}/status", new { status = "Cancelled" }));
        await Read(await admin.PutAsJsonAsync($"/api/appointments/{id}", update), 409);
    }

    [Fact]
    public async Task InvoiceEditing_ReplacesLinesRecalculatesAmountsAndProtectsPaidInvoices()
    {
        var (p1, _) = await Patient(); var (p2, _) = await Patient(); var id = await Bill(p1);
        var request = new { patientId = p2, services = new[] { new { serviceName = "Lab", cost = 80m }, new { serviceName = "Therapy", cost = 40m } }, taxPercent = 10m, discountAmount = 12m, dueDate = DateTime.Today.AddDays(5).ToString("yyyy-MM-dd") };
        await Read(await admin.PutAsJsonAsync($"/api/billing/{id}", request));
        var saved = await Read(await admin.GetAsync($"/api/billing/{id}"));
        Assert.Equal(p2, saved.GetProperty("patientId").GetString()); Assert.Equal(120m, saved.GetProperty("totalAmount").GetDecimal());
        Assert.Equal(2, saved.GetProperty("services").GetArrayLength()); Assert.Contains(saved.GetProperty("services").EnumerateArray(), x => x.GetProperty("serviceName").GetString() == "Lab");
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDBContext>(); Assert.Equal(2, await db.BillLines.CountAsync(x => x.BillID == id));
        }
        await Read(await admin.PostAsJsonAsync($"/api/billing/{id}/payments", new { amountToPay = 20 }));
        await Read(await admin.PutAsJsonAsync($"/api/billing/{id}", Invoice(p1, 10m)), 409);
        await Read(await admin.DeleteAsync($"/api/billing/{id}"), 409);
        saved = await Read(await admin.GetAsync($"/api/billing/{id}")); Assert.Equal(120m, saved.GetProperty("totalAmount").GetDecimal()); Assert.Equal(20m, saved.GetProperty("paidAmount").GetDecimal());
    }

    [Fact]
    public async Task InvoiceEditing_RejectsInvalidBodiesWithoutChangingTheExistingInvoice()
    {
        var (patient, _) = await Patient(); var id = await Bill(patient);
        await Read(await admin.PutAsJsonAsync($"/api/billing/{id}", new { patientId = patient, services = Array.Empty<object>(), dueDate = DateTime.Today.AddDays(3).ToString("yyyy-MM-dd") }), 400);
        await Read(await admin.PutAsJsonAsync($"/api/billing/{id}", Invoice("missing")), 404);
        await Read(await admin.PutAsJsonAsync($"/api/billing/{id}", new { patientId = patient, services = new[] { new { serviceName = "Lab", cost = 10 } }, discountAmount = 20, dueDate = DateTime.Today.AddDays(3).ToString("yyyy-MM-dd") }), 400);
        Assert.Equal(100m, (await Read(await admin.GetAsync($"/api/billing/{id}"))).GetProperty("totalAmount").GetDecimal());
    }

    [Fact]
    public async Task StaffDeletion_DeletesUnusedAccountsButProtectsSelfAndAccountsWithActivity()
    {
        var self = (await Read(await admin.GetAsync("/api/auth/session"))).GetProperty("userId").GetString();
        await Read(await admin.DeleteAsync($"/api/auth/{self}"), 409);
        var staff = await Read(await admin.PostAsJsonAsync("/api/auth/register", Staff("Nurse", "delete@feature.test")), 201);
        var id = staff.GetProperty("userId").GetString(); await Read(await admin.DeleteAsync($"/api/auth/{id}"), 204);
        await Read(await admin.PostAsJsonAsync("/api/auth/login", new { email = "delete@feature.test", password = Password }), 401);
        var linked = await Read(await admin.PostAsJsonAsync("/api/auth/register", Staff("Management", "linked@feature.test")), 201);
        using var c = app.CreateClient(); await Login(c, "linked@feature.test"); await Read(await c.PostAsJsonAsync("/api/patients", PersonBody()), 201);
        await Read(await admin.DeleteAsync("/api/auth/" + linked.GetProperty("userId").GetString()), 409);
    }

    [Fact]
    public async Task RecordDeletion_RequiresTheLatestVersionAndWritesAnAuditEntry()
    {
        var (patient, _) = await Patient(); await Read(await admin.PostAsJsonAsync("/api/auth/register", Staff("Nurse", "delete-record@feature.test")), 201);
        using var c = app.CreateClient(); await Login(c, "delete-record@feature.test");
        var record = await Read(await c.PostAsJsonAsync("/api/records", new { patientId = patient, diagnosis = "Diagnosis", treatment = "Treatment", status = "Active" }), 201);
        var id = record.GetProperty("recordId").GetString();
        await Read(await c.DeleteAsync($"/api/records/{id}?version=2"), 409);
        await Read(await c.DeleteAsync($"/api/records/{id}?version=1"), 204);
        Assert.Empty((await Read(await c.GetAsync("/api/records"))).EnumerateArray());
        await Read(await c.DeleteAsync($"/api/records/{id}?version=1"), 404);
        Assert.Contains((await Read(await admin.GetAsync("/api/audit"))).EnumerateArray(), x => x.GetProperty("action").GetString() == "Delete" && x.GetProperty("entity").GetString() == "MedicalRecord");
    }

    [Fact]
    public async Task Notifications_CanEditAndDeletePendingRowsButCannotAlterSentHistory()
    {
        var (patient, _) = await Patient(); var bill = await Bill(patient);
        var notification = await Read(await admin.PostAsync($"/api/billing/{bill}/reminders", null), 202); var id = notification.GetProperty("notificationId").GetString();
        await Read(await admin.PutAsJsonAsync($"/api/notifications/{id}", new { message = "Updated reminder", type = "SMS" }));
        var saved = (await Read(await admin.GetAsync("/api/notifications"))).EnumerateArray().Single();
        Assert.Equal("Updated reminder", saved.GetProperty("message").GetString()); Assert.Equal("SMS", saved.GetProperty("type").GetString()); Assert.Equal(patient, saved.GetProperty("patientId").GetString());
        await Read(await admin.PutAsJsonAsync($"/api/notifications/{id}", new { message = " ", type = "Email" }), 400);
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDBContext>(); var n = await db.Notifications.FindAsync(id); n!.Status = "Sent"; n.SentOn = DateTime.UtcNow; await db.SaveChangesAsync();
        }
        await Read(await admin.PutAsJsonAsync($"/api/notifications/{id}", new { message = "Tampered", type = "Email" }), 409);
        await Read(await admin.DeleteAsync($"/api/notifications/{id}"), 409);
        var pending = await Read(await admin.PostAsync($"/api/billing/{bill}/reminders", null), 202); var pendingId = pending.GetProperty("notificationId").GetString();
        await Read(await admin.DeleteAsync($"/api/notifications/{pendingId}"), 204);
        Assert.Single((await Read(await admin.GetAsync("/api/notifications"))).EnumerateArray());
    }
}
