using HSMDataAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace HSMDataAccess.Data
{
    public class AppDBContext:DbContext
    {
        
        public AppDBContext(DbContextOptions<AppDBContext> options)
           : base(options)
        {
        }
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<Doctor> Doctors { get; set; }
        public virtual DbSet<Person> People { get; set; }
        public virtual DbSet<Department> Departments { get; set; }
        public virtual DbSet<Employee> Employees { get; set; }
        public virtual DbSet<Bill> Bills { get; set; }
        public DbSet<BillLine> BillLines { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public virtual DbSet<Patient> Patients { get; set; }
        public virtual DbSet<Notification> Notifications { get; set; }
        public virtual DbSet<Report> Reports { get; set; }
        public virtual DbSet<Appointment> Appointments { get; set; }
        public virtual DbSet<AuditLog> AuditLogs { get; set; }
        public virtual DbSet<ServiceCategories> ServiceCategories { get; set; }
        public virtual DbSet<MedicalServices> MedicalServices { get; set; }
        public virtual DbSet<MedicalRecord> MedicalRecords { get; set; }
        public virtual DbSet<BillService> BillServices { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            if (Database.IsSqlite())
            {
                ConfigureWorkflowModel(modelBuilder);
                return;
            }
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ID)
                   .HasColumnType("nchar(10)")
                   .IsRequired().HasDefaultValueSql("LEFT(CONVERT(nvarchar(36), NEWID()), 10)"); ;


                entity.ToTable(e =>
                            e.HasCheckConstraint
                            ("CK_Users_Role", "([Role]='Management' OR [Role]='Accounts' OR [Role]='Nurse' OR [Role]='Doctor' OR [Role]='Admin')"));
                entity.ToTable(e =>
                            e.HasCheckConstraint
                            ("CK_Users_Status", "([Status]=(1) OR [Status]=(0))"));
                
                entity.Property(e => e.ID)
                .ValueGeneratedOnAdd();
                entity.Property(e => e.Name)
                .HasColumnType("nvarchar(200)")
                .HasMaxLength(200)
                .IsRequired();
                entity.Property(e => e.Role)
                .IsRequired();
                entity.Property(e => e.Status)
                .HasColumnType("bit")
                .IsRequired();
                entity.Property(e => e.PasswordHash)
                .HasColumnType("nvarchar(255)")
                .HasMaxLength(255)
                .IsRequired();
                entity.Property(e => e.PersonID)
                .HasColumnType("nchar(10)")
                .HasMaxLength(10)
                .IsRequired();
                entity.HasOne(u => u.Person)
                  .WithOne()
                  .HasForeignKey<User>(e => e.PersonID);
                entity.HasIndex(e => e.PersonID, "IX_Users_Person");
            });
            modelBuilder.Entity<Doctor>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ID)
                 .HasColumnType("nchar(10)")
                .HasMaxLength(10)
                .HasDefaultValueSql("LEFT(CONVERT(nvarchar(36), NEWID()), 10)")
                .ValueGeneratedOnAdd();
                
                entity.HasIndex(e => e.DepartmentID, "IX_Doctors_Departments");
                entity.HasIndex(e => e.UserID, "IX_Doctors_Users");
                entity.ToTable(
                    t =>
                    {
                        t
                        .HasCheckConstraint
                        ("CK_Doctors_Status", "([Status]=0 OR [Status]=1)");
                    });
                entity.Property(e => e.Specialization)
                .HasColumnType("nvarchar(50)")
                .HasMaxLength(50)
                .IsRequired();
                entity.Property(e => e.Status)
                .HasColumnType("bit")
                .IsRequired();
                entity.HasOne(d => d.Department)
                .WithMany()
                 .HasForeignKey(d => d.DepartmentID)
                 .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.User)
                .WithOne(u => u.doctor)
    .HasForeignKey<Doctor>(d => d.UserID);
            });
            modelBuilder.Entity<Department>(entity =>
            {
                entity.Ignore(e => e.Doctor);
                entity.Property(e => e.ID)
                 .HasColumnType("nchar(10)")
                .HasMaxLength(10)
                .HasDefaultValueSql("LEFT(CONVERT(nvarchar(36), NEWID()), 10)");
                entity.Property(e => e.Name)
                 .HasColumnType("nvarchar(100)")
                .HasMaxLength(100);
                entity.Property(e => e.HeadOf)
                 .HasColumnType("nchar(10)")
                .HasMaxLength(10);
            });
            modelBuilder.Entity<Person>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.ToTable(
                   t =>
                   {
                       t
                       .HasCheckConstraint
                       ("CK_People_Email", "([Email] like '%_@_%._%')");
                   });
                entity.ToTable(
                  t =>
                  {
                      t
                      .HasCheckConstraint
                      ("CK_People_Gender", "([Gender]='Female' OR [Gender]='Male' OR [Gender]='Other' OR [Gender]='Prefer not to say')");
                  });
                entity.ToTable(
                  t =>
                  {
                      t
                      .HasCheckConstraint
                      ("CK_People_Name", "(len(Trim([Name]))>=(2))");
                  });
                entity.HasIndex(e => e.Email, "IX_People_Email").IsUnique();
                entity.HasIndex(e => e.ContactNumber, "IX_People_ContactNumber").IsUnique();
                entity.Property(e => e.ID)
                 .HasColumnType("nchar(10)")
                .HasMaxLength(10)
                .HasDefaultValueSql("LEFT(CONVERT(nvarchar(36), NEWID()), 10)");
                entity.Property(e => e.Name)
                .HasColumnType("nvarchar(200)")
                .HasMaxLength(200);
                entity.Property(e => e.ContactNumber)
                .HasColumnType("nchar(10)")
                .HasMaxLength(10);
                entity.Property(e => e.Email)
                .HasColumnType("nvarchar(250)")
                .HasMaxLength(250);
                entity.Property(e => e.Gender)
                .HasColumnType("nvarchar(30)")
                .HasMaxLength(30);
                entity.Property(e => e.Address)
               .HasColumnType("text");
                entity.Property(e => e.DateOfBirth)
              .HasColumnType("date");
            });
            modelBuilder.Entity<Patient>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.ToTable(
                   t =>
                   {
                       t
                       .HasCheckConstraint
                       ("CK_Patients_Status", "([Status]=(1) OR [Status]=(0))");
                   });

                entity.Property(e => e.ID)
                  .HasColumnType("nchar(10)")
                 .HasMaxLength(10)
                 .HasDefaultValueSql("LEFT(CONVERT(nvarchar(36), NEWID()), 10)");
                entity.Property(e => e.ID)
                .HasColumnType("nchar(10)")
                .HasMaxLength(10);
                entity.Property(e => e.MedicalHistory)
                .HasColumnType("text");
                entity.Property(e => e.Status)
                .HasColumnType("bit");
                entity.Property(e => e.PersonID)
                .HasMaxLength(10);
                entity.HasOne(d => d.Person)
                 .WithOne(e => e.Patient)
                  .HasForeignKey<Patient>(d => d.PersonID)
                  .OnDelete(DeleteBehavior.Restrict)
                  ;
            });
            modelBuilder.Entity<Employee>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ID)
                  .HasColumnType("nchar(10)")
                 .HasMaxLength(10)
                 .HasDefaultValueSql("LEFT(CONVERT(nvarchar(36), NEWID()), 10)");
                entity.Property(e => e.Salary)
                .HasColumnType("decimal(10, 2)")
                .IsRequired();
                entity.Property(e => e.HireDate)
                .IsRequired();
                entity.Property(e => e.PersonID)
                .HasColumnType("nchar(10)")
                .HasMaxLength(10)
                .IsRequired();
                entity.Property(e => e.IsActive)
                .HasColumnType("bit")
                .IsRequired();
                entity.HasOne(d => d.Person)
                 .WithOne(e => e.Employee)
                  .HasForeignKey<Employee>(d => d.PersonID)
                  .OnDelete(DeleteBehavior.Restrict)
                  .HasConstraintName("FK_Employees_People");
                entity.HasIndex(e => e.PersonID).IsUnique()
                .HasDatabaseName("IX_Employees_Person");
            });
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ID)
                   .HasColumnType("nchar(10)")
                   .IsRequired().HasDefaultValueSql("LEFT(CONVERT(nvarchar(36), NEWID()), 10)"); ;

                entity.Property(e => e.ID)
                    .HasColumnType("nchar(10)")
                    .ValueGeneratedOnAdd();

                entity.Property(e => e.PatientID)
                    .HasColumnType("nchar(10)")
                    .HasMaxLength(10)
                    .IsRequired();

                entity.Property(e => e.UserID)
                    .HasColumnType("nchar(10)")
                    .HasMaxLength(10)
                    .IsRequired();

                entity.Property(e => e.Type)
                    .HasColumnType("nchar(5)")
                    .HasMaxLength(5)
                    .IsRequired();

                entity.Property(e => e.Message)
                    .HasColumnType("text")
                    .IsRequired();

                entity.Property(e => e.Status)
                    .HasColumnType("nchar(10)")
                    .HasMaxLength(10)
                    .IsRequired();

                entity.Property(e => e.SentOn)
                    .HasColumnType("datetime");

                entity.Property(e => e.DeliveryConfirmation)
                    .HasColumnType("bit");

                entity.HasOne(d => d.User)
                 .WithMany(n => n.notification)
                  .HasForeignKey(d => d.UserID)
                  .OnDelete(DeleteBehavior.Restrict);
                 
                entity.HasOne(d => d.patient)
                 .WithMany(n => n.notification)
                  .HasForeignKey(d => d.UserID)
                  .OnDelete(DeleteBehavior.Restrict);
                entity.ToTable(
                   t =>
                   {
                       t
                       .HasCheckConstraint
                       ("CK_Notification_Status", "([Status]='Pending' OR [Status]='Failed' OR [Status]='Sent')");
                   });
                entity.ToTable(
                   t =>
                   {
                       t
                       .HasCheckConstraint
                       ("CK_Notification_Type", "([Type]='SMS' OR [Type]='Email')");
                   });
            });
            modelBuilder.Entity<Report>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ID)
                   .HasColumnType("nchar(10)")
                   .IsRequired().HasDefaultValueSql("LEFT(CONVERT(nvarchar(36), NEWID()), 10)"); ;

                entity.Property(e => e.ID)
                    .HasColumnType("nchar(10)")
                    .HasMaxLength(10)
                    .IsRequired();

                entity.Property(e => e.Type)
                    .HasColumnType("nchar(10)")
                    .HasMaxLength(10)
                    .IsRequired();

                entity.Property(e => e.GeneratedOn)
                    .HasColumnType("datetime")
                    .IsRequired();

                entity.Property(e => e.GeneratedBy)
                    .HasColumnType("nchar(10)")
                    .HasMaxLength(10)
                    .IsRequired();

                entity.Property(e => e.AppointmentCount)
                    .HasColumnType("int");

                entity.Property(e => e.Revenue)
                    .HasColumnType("decimal(10, 2)");

                entity.Property(e => e.PaymentsReceived)
                    .HasColumnType("decimal(10, 2)");

                entity.Property(e => e.PendingPayments)
                    .HasColumnType("decimal(10, 2)");

                entity.Property(e => e.Metrics)
                    .HasColumnType("text");

                entity.Property(e => e.ExportFormat)
                    .HasColumnType("nchar(5)")
                    .HasMaxLength(5)
                    .IsRequired();

                entity.Property(e => e.Status)
                    .HasColumnType("nchar(7)")
                    .HasMaxLength(7);

                entity.Property(e => e.Notes)
                    .HasColumnType("text");
                entity.ToTable(
                  t =>
                  {
                      t
                      .HasCheckConstraint
                      ("CK_Reports_ExportFormat", "([ExportFormat]='Excel' OR [ExportFormat]='PDF')");
                  });
                entity.ToTable(
                   t =>
                   {
                       t
                       .HasCheckConstraint
                       ("CK_Reports_Type", "([Type]='Monthly' OR [Type]='Weekly' OR [Type]='Daily')");
                   });
                entity.HasOne(d => d.user)
                .WithMany(n => n.report)
                 .HasForeignKey(d => d.GeneratedBy)
                 .OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.HasKey(e => e.ID);

                entity.Property(e => e.ID)
                    .HasColumnType("nchar(10)")
                    .IsRequired().HasDefaultValueSql("LEFT(CONVERT(nvarchar(36), NEWID()), 10)"); ;

                entity.Property(e => e.PatientID)
                    .HasColumnType("nchar(10)")
                    .IsRequired();

                entity.Property(e => e.DoctorID)
                    .HasColumnType("nchar(10)")
                    .IsRequired();

                entity.Property(e => e.Date)
                    .HasColumnType("date")
                    .IsRequired();

                entity.Property(e => e.Time)
                    .HasColumnType("time(7)");

                entity.Property(e => e.Duration)
                    .HasColumnType("int")
                    .IsRequired();

                entity.Property(e => e.Status)
                    .HasColumnType("nchar(15)")
                    .IsRequired();

                entity.Property(e => e.NotificationSent)
                    .HasColumnType("bit");
                entity.ToTable(
                 t =>
                 {
                     t
                     .HasCheckConstraint
                     ("CK_Appointments_Status", "([Status]='Cancelled' OR [Status]='Rescheduled' OR [Status]='Scheduled')");
                 });
                entity.HasIndex(e => e.DoctorID, "IX_Appointments_Doctor");
                entity.HasIndex(e => e.PatientID, "IX_Appointments_Patient");
                entity.HasIndex(e => e.Status, "IX_Appointments_Status");
                entity.HasOne(d => d.patient)
                 .WithMany(n => n.appointment)
                  .HasForeignKey(d => d.PatientID)
                  .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(d => d.doctor)
                 .WithMany(n => n.appointment)
                  .HasForeignKey(d => d.DoctorID)
                  .OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<Bill>(entity =>
            {
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ID)
                .HasColumnType("nchar(10)")
               .HasMaxLength(10)
               .HasDefaultValueSql("LEFT(CONVERT(nvarchar(36), NEWID()), 10)");
                entity.Property(e => e.ID)
                    .HasColumnType("nchar(10)")
                    .IsRequired();

                entity.Property(e => e.PatientID)
                    .HasColumnType("nchar(10)")
                    .IsRequired();

                entity.Property(e => e.Status)
                    .HasColumnType("varchar(30)")
                    .IsRequired();

                entity.Property(e => e.Date)
                    .HasColumnType("datetime");

                entity.Property(e => e.PartialPaymentAmount)
                    .HasColumnType("decimal(10,2)");

                entity.Property(e => e.DueDate)
                    .HasColumnType("datetime");

                entity.Property(e => e.Invoice)
                    .HasColumnType("varchar(50)")
                    .IsRequired();

                entity.Property(e => e.GrossAmount)
                    .HasColumnType("decimal(10,2)")
                    .IsRequired();

                entity.Property(e => e.Discount)
                    .HasColumnType("decimal(10,2)");

                entity.Property(e => e.InsuranceCoverage)
                    .HasColumnType("decimal(5,2)");

                entity.Property(e => e.PatientResponsibility)
                    .HasColumnType("decimal(10,2)")
                    .IsRequired();
                entity.HasIndex(e => e.Date, "idx_bills_date");
                entity.HasIndex(e => e.DueDate, "idx_bills_due_date");
                entity.HasIndex(e => e.PatientID, "idx_bills_patient");
                entity.HasIndex(e => e.Status, "idx_bills_status");
                entity.HasIndex(e => e.Invoice)
                .IsUnique()
                .HasDatabaseName("UQ_Bills_Invoice");
                entity.ToTable(
                 t =>
                 {
                     t
                     .HasCheckConstraint
                     ("CK_Bills_Status", "([Status]='Pending Insurance' OR [Status]='Cancelled' OR [Status]='Partially Paid' OR [Status]='Unpaid' OR [Status]='Paid')");
                 });
                entity.HasOne(d => d.patient)
                 .WithMany(n => n.bill)
                  .HasForeignKey(d => d.PatientID)
                  .OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("AuditLogs");

                entity.HasKey(x => x.ID);
                entity.Property(e => e.ID)
                   .HasColumnType("nchar(10)")
                   .IsRequired().HasDefaultValueSql("LEFT(CONVERT(nvarchar(36), NEWID()), 10)"); ;

                entity.Property(x => x.ID)
                    .HasColumnType("nchar(10)")
                    .IsRequired();

                entity.Property(x => x.UserID)
                    .HasColumnType("nchar(10)")
                    .IsRequired();

                entity.Property(x => x.Entity)
                    .HasColumnType("nvarchar(50)")
                    .IsRequired();

                entity.Property(x => x.Action)
                    .HasColumnType("nchar(10)")
                    .IsRequired();

                entity.Property(x => x.Timestamp)
                    .HasColumnType("datetime")
                    .IsRequired();

                entity.Property(x => x.Details)
                    .HasColumnType("text");
                entity.ToTable(
                 t =>
                 {
                     t
                     .HasCheckConstraint
                     ("CK_AuditLogs_Action", "([Action]='Access' OR [Action]='Delete' OR [Action]='Update' OR [Action]='Create')");
                 });
                entity.HasOne(d => d.user)
                 .WithMany(n => n.auditLog)
                  .HasForeignKey(d => d.UserID)
                  .OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<ServiceCategories>(entity =>
            {
                entity.ToTable("ServiceCategories");
                entity.Property(e => e.ID)
                   .HasColumnType("nchar(10)")
                   .IsRequired().HasDefaultValueSql("LEFT(CONVERT(nvarchar(36), NEWID()), 10)"); ;

                entity.HasKey(x => x.ID);

                entity.Property(x => x.ID)
                    .HasColumnType("nchar(10)")
                    .IsRequired();

                entity.Property(x => x.CategoryName)
                    .HasColumnType("varchar(100)")
                    .IsRequired();

                entity.Property(x => x.CategoryDescription)
                    .HasColumnType("text");
                entity.HasIndex(e => e.CategoryName)
                .IsUnique()
                .HasDatabaseName("UQ__Service__CategoryName");
                

            });
            modelBuilder.Entity<MedicalServices>(entity =>
            {
                entity.HasKey(x => x.ID);
                entity.Property(e => e.ID)
                   .HasColumnType("nchar(10)")
                   .IsRequired().HasDefaultValueSql("LEFT(CONVERT(nvarchar(36), NEWID()), 10)"); ;

                entity.Property(x => x.ID)
                    .HasColumnType("nchar(10)")
                    .IsRequired();

                entity.Property(x => x.ServiceName)
                    .HasColumnType("varchar(255)")
                    .IsRequired();

                entity.Property(x => x.CategoryID)
                    .HasColumnType("nchar(10)")
                    .IsRequired();

                entity.Property(x => x.DefaultPrice)
                    .HasColumnType("decimal(10,2)")
                    .IsRequired();

                entity.Property(x => x.Description)
                    .HasColumnType("text");

                entity.Property(x => x.DurationMinutes);

                entity.HasIndex(e => e.ServiceName, "UQ__MedicalService__ServiceName");
                entity.HasOne(d => d.serviceCategory)
                .WithMany(n => n.medicalService)
                 .HasForeignKey(d => d.CategoryID)
                 .OnDelete(DeleteBehavior.Restrict);
                
            });
            modelBuilder.Entity<MedicalRecord>(entity =>
            {
                entity.HasKey(x => x.ID);
                entity.Property(e => e.ID)
                   .HasColumnType("nchar(10)")
                   .IsRequired().HasDefaultValueSql("LEFT(CONVERT(nvarchar(36), NEWID()), 10)"); ;

                entity.Property(x => x.ID)
                    .HasColumnType("nchar(10)")
                    .IsRequired();

                entity.Property(x => x.PatientID)
                    .HasColumnType("nchar(10)")
                    .IsRequired();

                entity.Property(x => x.Diagnosis)
                    .HasColumnType("text")
                    .IsRequired(false);

                entity.Property(x => x.Treatment)
                    .HasColumnType("text")
                    .IsRequired(false);

                entity.Property(x => x.Prescriptions)
                    .HasColumnType("text")
                    .IsRequired(false);

                entity.Property(x => x.Status)
                    .HasColumnType("nchar(10)")
                    .IsRequired(false);

                entity.Property(x => x.AuditTrail)
                    .HasColumnType("text")
                    .IsRequired();

                entity.Property(x => x.AccessLevel)
                    .HasColumnType("nchar(10)")
                    .IsRequired();

                entity.HasOne(x => x.patient)
                    .WithMany(x => x.medicalRecord)
                    .HasForeignKey(x => x.PatientID)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.ToTable(
                 t =>
                 {
                     t
                     .HasCheckConstraint
                     ("CK_MedicalRecords_Status", "([Status]='Archived' OR [Status]='Active')");
                 });
            });
            modelBuilder.Entity<BillService>(entity =>
            {
                entity.HasKey(x => new
                {
                    x.BillID,
                    x.ServiceID
                });
               

                entity.Property(x => x.BillID)
                    .HasColumnType("nchar(10)")
                    .IsRequired();

                entity.Property(x => x.ServiceID)
                    .HasColumnType("nchar(10)")
                    .IsRequired();

                entity.Property(x => x.Quantity)
                    .IsRequired(false);

                entity.Property(x => x.UnitPrice)
                    .HasColumnType("decimal(10,2)")
                    .IsRequired();

                entity.Property(x => x.TotalPrice).HasComputedColumnSql("[Quantity] * [UnitPrice]");

                entity.HasOne(x => x.bill)
                    .WithMany(x => x.billService)
                    .HasForeignKey(x => x.BillID)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(x => x.medicalService)
                    .WithMany(x => x.billServices)
                    .HasForeignKey(x => x.ServiceID)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            ConfigureWorkflowModel(modelBuilder);
        }
        private void ConfigureWorkflowModel(ModelBuilder model)
        {
            model.Entity<Department>().Ignore(x => x.Doctor);
            model.Entity<Doctor>().HasOne(x => x.Department).WithMany().HasForeignKey(x => x.DepartmentID).OnDelete(DeleteBehavior.Restrict);
            model.Entity<Doctor>().HasOne(x => x.Person).WithMany().HasForeignKey(x => x.PersonID).OnDelete(DeleteBehavior.Restrict);
            model.Entity<Doctor>().HasOne(x => x.User).WithOne(x => x.doctor).HasForeignKey<Doctor>(x => x.UserID).OnDelete(DeleteBehavior.Restrict);
            model.Entity<User>().HasOne(x => x.Person).WithOne().HasForeignKey<User>(x => x.PersonID).OnDelete(DeleteBehavior.Restrict);
            model.Entity<Patient>().HasOne(x => x.Person).WithOne(x => x.Patient).HasForeignKey<Patient>(x => x.PersonID).OnDelete(DeleteBehavior.Restrict);
            model.Entity<Employee>().HasOne(x => x.Person).WithOne(x => x.Employee).HasForeignKey<Employee>(x => x.PersonID).OnDelete(DeleteBehavior.Restrict);
            model.Entity<Person>().HasIndex(x => x.Email).IsUnique();
            model.Entity<Person>().Property(x => x.ContactNumber).IsRequired(false);
            model.Entity<Person>().HasIndex(x => x.ContactNumber).IsUnique().HasFilter("[ContactNumber] IS NOT NULL");
            model.Entity<BillLine>().HasOne(x => x.Bill).WithMany(x => x.Lines).HasForeignKey(x => x.BillID).OnDelete(DeleteBehavior.Cascade);
            model.Entity<Payment>().HasOne(x => x.Bill).WithMany(x => x.Payments).HasForeignKey(x => x.BillID).OnDelete(DeleteBehavior.Restrict);
            model.Entity<Bill>().Property(x => x.Revision).IsConcurrencyToken();
            model.Entity<MedicalRecord>().Property(x => x.Version).IsConcurrencyToken();
            model.Entity<Bill>().Property(x => x.TaxPercent).HasPrecision(5, 2);
            model.Entity<BillLine>().Property(x => x.ID).HasMaxLength(10);
            model.Entity<Payment>().Property(x => x.ID).HasMaxLength(10);
            model.Entity<BillLine>().Property(x => x.Cost).HasPrecision(10, 2);
            model.Entity<Payment>().Property(x => x.Amount).HasPrecision(10, 2);
            model.Entity<Bill>().HasIndex(x => x.Invoice).IsUnique();
            model.Entity<Notification>().HasOne(x => x.patient).WithMany(x => x.notification).HasForeignKey(x => x.PatientID).OnDelete(DeleteBehavior.Restrict);
            if (Database.IsSqlite())
            {
                model.Entity<BillService>().HasKey(x => new { x.BillID, x.ServiceID });
                model.Entity<BillService>().Ignore(x => x.TotalPrice);
                // Legacy navigation names do not follow EF's foreign-key naming convention.
                model.Entity<Appointment>().HasOne(x => x.patient).WithMany(x => x.appointment).HasForeignKey(x => x.PatientID).OnDelete(DeleteBehavior.Restrict);
                model.Entity<Appointment>().HasOne(x => x.doctor).WithMany(x => x.appointment).HasForeignKey(x => x.DoctorID).OnDelete(DeleteBehavior.Restrict);
                model.Entity<Bill>().HasOne(x => x.patient).WithMany(x => x.bill).HasForeignKey(x => x.PatientID).OnDelete(DeleteBehavior.Restrict);
                model.Entity<MedicalRecord>().HasOne(x => x.patient).WithMany(x => x.medicalRecord).HasForeignKey(x => x.PatientID).OnDelete(DeleteBehavior.Restrict);

                model.Entity<Notification>().HasOne(x => x.User).WithMany(x => x.notification).HasForeignKey(x => x.UserID).OnDelete(DeleteBehavior.Restrict);
                model.Entity<AuditLog>().HasOne(x => x.user).WithMany(x => x.auditLog).HasForeignKey(x => x.UserID).OnDelete(DeleteBehavior.Restrict);
                model.Entity<Report>().HasOne(x => x.user).WithMany(x => x.report).HasForeignKey(x => x.GeneratedBy).OnDelete(DeleteBehavior.Restrict);
                model.Entity<MedicalServices>().HasOne(x => x.serviceCategory).WithMany(x => x.medicalService).HasForeignKey(x => x.CategoryID);
                model.Entity<BillService>().HasOne(x => x.bill).WithMany(x => x.billService).HasForeignKey(x => x.BillID);
                model.Entity<BillService>().HasOne(x => x.medicalService).WithMany(x => x.billServices).HasForeignKey(x => x.ServiceID);
            }
        }

    }
}
