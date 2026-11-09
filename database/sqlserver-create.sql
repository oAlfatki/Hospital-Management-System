CREATE TABLE [Departments] (
    [ID] nchar(10) NOT NULL DEFAULT (LEFT(CONVERT(nvarchar(36), NEWID()), 10)),
    [CreatedOn] datetime2 NULL,
    [UpdatedOn] datetime2 NULL,
    [CreatedBy] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Name] nvarchar(100) NOT NULL,
    [HeadOf] nchar(10) NULL,
    CONSTRAINT [PK_Departments] PRIMARY KEY ([ID])
);
GO


CREATE TABLE [People] (
    [ID] nchar(10) NOT NULL DEFAULT (LEFT(CONVERT(nvarchar(36), NEWID()), 10)),
    [Name] nvarchar(200) NOT NULL,
    [ContactNumber] nchar(10) NULL,
    [Email] nvarchar(250) NOT NULL,
    [Gender] nvarchar(30) NOT NULL,
    [Address] text NOT NULL,
    [DateOfBirth] date NOT NULL,
    CONSTRAINT [PK_People] PRIMARY KEY ([ID]),
    CONSTRAINT [CK_People_Email] CHECK (([Email] like '%_@_%._%')),
    CONSTRAINT [CK_People_Gender] CHECK (([Gender]='Female' OR [Gender]='Male' OR [Gender]='Other' OR [Gender]='Prefer not to say')),
    CONSTRAINT [CK_People_Name] CHECK ((len(Trim([Name]))>=(2)))
);
GO


CREATE TABLE [ServiceCategories] (
    [ID] nchar(10) NOT NULL DEFAULT (LEFT(CONVERT(nvarchar(36), NEWID()), 10)),
    [CategoryName] varchar(100) NOT NULL,
    [CategoryDescription] text NULL,
    CONSTRAINT [PK_ServiceCategories] PRIMARY KEY ([ID])
);
GO


CREATE TABLE [Employees] (
    [ID] nchar(10) NOT NULL DEFAULT (LEFT(CONVERT(nvarchar(36), NEWID()), 10)),
    [PersonID] nchar(10) NOT NULL,
    [Salary] decimal(10,2) NOT NULL,
    [HireDate] datetime2 NOT NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_Employees] PRIMARY KEY ([ID]),
    CONSTRAINT [FK_Employees_People] FOREIGN KEY ([PersonID]) REFERENCES [People] ([ID]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Patients] (
    [ID] nchar(10) NOT NULL DEFAULT (LEFT(CONVERT(nvarchar(36), NEWID()), 10)),
    [CreatedOn] datetime2 NULL,
    [UpdatedOn] datetime2 NULL,
    [CreatedBy] nvarchar(max) NOT NULL,
    [ClinicalStatus] nvarchar(max) NOT NULL,
    [MedicalHistory] text NOT NULL,
    [Status] bit NOT NULL,
    [PersonID] nchar(10) NOT NULL,
    CONSTRAINT [PK_Patients] PRIMARY KEY ([ID]),
    CONSTRAINT [CK_Patients_Status] CHECK (([Status]=(1) OR [Status]=(0))),
    CONSTRAINT [FK_Patients_People_PersonID] FOREIGN KEY ([PersonID]) REFERENCES [People] ([ID]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Users] (
    [ID] nchar(10) NOT NULL DEFAULT (LEFT(CONVERT(nvarchar(36), NEWID()), 10)),
    [CreatedOn] datetime2 NULL,
    [UpdatedOn] datetime2 NULL,
    [CreatedBy] nvarchar(max) NOT NULL,
    [DepartmentName] nvarchar(max) NULL,
    [Name] nvarchar(200) NOT NULL,
    [Role] nvarchar(max) NOT NULL,
    [Status] bit NOT NULL,
    [PasswordHash] nvarchar(255) NOT NULL,
    [PersonID] nchar(10) NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([ID]),
    CONSTRAINT [CK_Users_Role] CHECK (([Role]='Management' OR [Role]='Accounts' OR [Role]='Nurse' OR [Role]='Doctor' OR [Role]='Admin')),
    CONSTRAINT [CK_Users_Status] CHECK (([Status]=(1) OR [Status]=(0))),
    CONSTRAINT [FK_Users_People_PersonID] FOREIGN KEY ([PersonID]) REFERENCES [People] ([ID]) ON DELETE NO ACTION
);
GO


CREATE TABLE [MedicalServices] (
    [ID] nchar(10) NOT NULL DEFAULT (LEFT(CONVERT(nvarchar(36), NEWID()), 10)),
    [ServiceName] varchar(255) NOT NULL,
    [CategoryID] nchar(10) NOT NULL,
    [DefaultPrice] decimal(10,2) NOT NULL,
    [Description] text NULL,
    [DurationMinutes] int NULL,
    CONSTRAINT [PK_MedicalServices] PRIMARY KEY ([ID]),
    CONSTRAINT [FK_MedicalServices_ServiceCategories_CategoryID] FOREIGN KEY ([CategoryID]) REFERENCES [ServiceCategories] ([ID]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Bills] (
    [ID] nchar(10) NOT NULL DEFAULT (LEFT(CONVERT(nvarchar(36), NEWID()), 10)),
    [CreatedOn] datetime2 NULL,
    [UpdatedOn] datetime2 NULL,
    [CreatedBy] nvarchar(max) NOT NULL,
    [TaxPercent] decimal(5,2) NOT NULL,
    [Revision] int NOT NULL,
    [PatientID] nchar(10) NOT NULL,
    [Status] varchar(30) NOT NULL,
    [Date] datetime NULL,
    [PartialPaymentAmount] decimal(10,2) NULL,
    [DueDate] datetime NULL,
    [Invoice] varchar(50) NOT NULL,
    [GrossAmount] decimal(10,2) NOT NULL,
    [Discount] decimal(10,2) NULL,
    [InsuranceCoverage] decimal(5,2) NULL,
    [PatientResponsibility] decimal(10,2) NOT NULL,
    CONSTRAINT [PK_Bills] PRIMARY KEY ([ID]),
    CONSTRAINT [CK_Bills_Status] CHECK (([Status]='Pending Insurance' OR [Status]='Cancelled' OR [Status]='Partially Paid' OR [Status]='Unpaid' OR [Status]='Paid')),
    CONSTRAINT [FK_Bills_Patients_PatientID] FOREIGN KEY ([PatientID]) REFERENCES [Patients] ([ID]) ON DELETE NO ACTION
);
GO


CREATE TABLE [MedicalRecords] (
    [ID] nchar(10) NOT NULL DEFAULT (LEFT(CONVERT(nvarchar(36), NEWID()), 10)),
    [CreatedOn] datetime2 NULL,
    [UpdatedOn] datetime2 NULL,
    [CreatedBy] nvarchar(max) NOT NULL,
    [Version] int NOT NULL,
    [UpdatedBy] nvarchar(max) NOT NULL,
    [PatientID] nchar(10) NOT NULL,
    [Diagnosis] text NULL,
    [Treatment] text NULL,
    [Prescriptions] text NULL,
    [Status] nchar(10) NULL,
    [AuditTrail] text NOT NULL,
    [AccessLevel] nchar(10) NOT NULL,
    CONSTRAINT [PK_MedicalRecords] PRIMARY KEY ([ID]),
    CONSTRAINT [CK_MedicalRecords_Status] CHECK (([Status]='Archived' OR [Status]='Active')),
    CONSTRAINT [FK_MedicalRecords_Patients_PatientID] FOREIGN KEY ([PatientID]) REFERENCES [Patients] ([ID]) ON DELETE NO ACTION
);
GO


CREATE TABLE [AuditLogs] (
    [ID] nchar(10) NOT NULL DEFAULT (LEFT(CONVERT(nvarchar(36), NEWID()), 10)),
    [UserID] nchar(10) NOT NULL,
    [Entity] nvarchar(50) NOT NULL,
    [Action] nchar(10) NOT NULL,
    [Timestamp] datetime NOT NULL,
    [Details] text NULL,
    CONSTRAINT [PK_AuditLogs] PRIMARY KEY ([ID]),
    CONSTRAINT [CK_AuditLogs_Action] CHECK (([Action]='Access' OR [Action]='Delete' OR [Action]='Update' OR [Action]='Create')),
    CONSTRAINT [FK_AuditLogs_Users_UserID] FOREIGN KEY ([UserID]) REFERENCES [Users] ([ID]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Doctors] (
    [ID] nchar(10) NOT NULL DEFAULT (LEFT(CONVERT(nvarchar(36), NEWID()), 10)),
    [CreatedOn] datetime2 NULL,
    [UpdatedOn] datetime2 NULL,
    [CreatedBy] nvarchar(max) NOT NULL,
    [PersonID] nchar(10) NULL,
    [DepartmentID] nchar(10) NOT NULL,
    [Specialization] nvarchar(50) NOT NULL,
    [Status] bit NOT NULL,
    [UserID] nchar(10) NULL,
    CONSTRAINT [PK_Doctors] PRIMARY KEY ([ID]),
    CONSTRAINT [CK_Doctors_Status] CHECK (([Status]=0 OR [Status]=1)),
    CONSTRAINT [FK_Doctors_Departments_DepartmentID] FOREIGN KEY ([DepartmentID]) REFERENCES [Departments] ([ID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Doctors_People_PersonID] FOREIGN KEY ([PersonID]) REFERENCES [People] ([ID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Doctors_Users_UserID] FOREIGN KEY ([UserID]) REFERENCES [Users] ([ID]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Notifications] (
    [ID] nchar(10) NOT NULL DEFAULT (LEFT(CONVERT(nvarchar(36), NEWID()), 10)),
    [PatientID] nchar(10) NOT NULL,
    [UserID] nchar(10) NOT NULL,
    [Type] nchar(5) NOT NULL,
    [Message] text NOT NULL,
    [Status] nchar(10) NOT NULL,
    [SentOn] datetime NULL,
    [DeliveryConfirmation] bit NULL,
    CONSTRAINT [PK_Notifications] PRIMARY KEY ([ID]),
    CONSTRAINT [CK_Notification_Status] CHECK (([Status]='Pending' OR [Status]='Failed' OR [Status]='Sent')),
    CONSTRAINT [CK_Notification_Type] CHECK (([Type]='SMS' OR [Type]='Email')),
    CONSTRAINT [FK_Notifications_Patients_PatientID] FOREIGN KEY ([PatientID]) REFERENCES [Patients] ([ID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Notifications_Users_UserID] FOREIGN KEY ([UserID]) REFERENCES [Users] ([ID]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Reports] (
    [ID] nchar(10) NOT NULL DEFAULT (LEFT(CONVERT(nvarchar(36), NEWID()), 10)),
    [Type] nchar(10) NOT NULL,
    [GeneratedOn] datetime NOT NULL,
    [GeneratedBy] nchar(10) NOT NULL,
    [AppointmentCount] int NULL,
    [Revenue] decimal(10,2) NULL,
    [PaymentsReceived] decimal(10,2) NULL,
    [PendingPayments] decimal(10,2) NULL,
    [Metrics] text NULL,
    [ExportFormat] nchar(5) NOT NULL,
    [Status] nchar(7) NULL,
    [Notes] text NULL,
    CONSTRAINT [PK_Reports] PRIMARY KEY ([ID]),
    CONSTRAINT [CK_Reports_ExportFormat] CHECK (([ExportFormat]='Excel' OR [ExportFormat]='PDF')),
    CONSTRAINT [CK_Reports_Type] CHECK (([Type]='Monthly' OR [Type]='Weekly' OR [Type]='Daily')),
    CONSTRAINT [FK_Reports_Users_GeneratedBy] FOREIGN KEY ([GeneratedBy]) REFERENCES [Users] ([ID]) ON DELETE NO ACTION
);
GO


CREATE TABLE [BillLines] (
    [ID] nvarchar(10) NOT NULL,
    [BillID] nchar(10) NOT NULL,
    [ServiceName] nvarchar(max) NOT NULL,
    [Cost] decimal(10,2) NOT NULL,
    CONSTRAINT [PK_BillLines] PRIMARY KEY ([ID]),
    CONSTRAINT [FK_BillLines_Bills_BillID] FOREIGN KEY ([BillID]) REFERENCES [Bills] ([ID]) ON DELETE CASCADE
);
GO


CREATE TABLE [BillServices] (
    [ServiceID] nchar(10) NOT NULL,
    [BillID] nchar(10) NOT NULL,
    [Quantity] int NULL,
    [UnitPrice] decimal(10,2) NOT NULL,
    [TotalPrice] AS [Quantity] * [UnitPrice],
    CONSTRAINT [PK_BillServices] PRIMARY KEY ([BillID], [ServiceID]),
    CONSTRAINT [FK_BillServices_Bills_BillID] FOREIGN KEY ([BillID]) REFERENCES [Bills] ([ID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_BillServices_MedicalServices_ServiceID] FOREIGN KEY ([ServiceID]) REFERENCES [MedicalServices] ([ID]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Payments] (
    [ID] nvarchar(10) NOT NULL,
    [BillID] nchar(10) NOT NULL,
    [Amount] decimal(10,2) NOT NULL,
    [PaidOn] datetime2 NOT NULL,
    CONSTRAINT [PK_Payments] PRIMARY KEY ([ID]),
    CONSTRAINT [FK_Payments_Bills_BillID] FOREIGN KEY ([BillID]) REFERENCES [Bills] ([ID]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Appointments] (
    [ID] nchar(10) NOT NULL DEFAULT (LEFT(CONVERT(nvarchar(36), NEWID()), 10)),
    [CreatedOn] datetime2 NULL,
    [UpdatedOn] datetime2 NULL,
    [CreatedBy] nvarchar(max) NOT NULL,
    [PatientID] nchar(10) NOT NULL,
    [DoctorID] nchar(10) NOT NULL,
    [Date] date NOT NULL,
    [Time] time(7) NULL,
    [Duration] int NOT NULL,
    [Status] nchar(15) NOT NULL,
    [NotificationSent] bit NULL,
    CONSTRAINT [PK_Appointments] PRIMARY KEY ([ID]),
    CONSTRAINT [CK_Appointments_Status] CHECK (([Status]='Cancelled' OR [Status]='Rescheduled' OR [Status]='Scheduled')),
    CONSTRAINT [FK_Appointments_Doctors_DoctorID] FOREIGN KEY ([DoctorID]) REFERENCES [Doctors] ([ID]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Appointments_Patients_PatientID] FOREIGN KEY ([PatientID]) REFERENCES [Patients] ([ID]) ON DELETE NO ACTION
);
GO


CREATE INDEX [IX_Appointments_Doctor] ON [Appointments] ([DoctorID]);
GO


CREATE INDEX [IX_Appointments_Patient] ON [Appointments] ([PatientID]);
GO


CREATE INDEX [IX_Appointments_Status] ON [Appointments] ([Status]);
GO


CREATE INDEX [IX_AuditLogs_UserID] ON [AuditLogs] ([UserID]);
GO


CREATE INDEX [IX_BillLines_BillID] ON [BillLines] ([BillID]);
GO


CREATE INDEX [idx_bills_date] ON [Bills] ([Date]);
GO


CREATE INDEX [idx_bills_due_date] ON [Bills] ([DueDate]);
GO


CREATE INDEX [idx_bills_patient] ON [Bills] ([PatientID]);
GO


CREATE INDEX [idx_bills_status] ON [Bills] ([Status]);
GO


CREATE UNIQUE INDEX [UQ_Bills_Invoice] ON [Bills] ([Invoice]);
GO


CREATE INDEX [IX_BillServices_ServiceID] ON [BillServices] ([ServiceID]);
GO


CREATE INDEX [IX_Doctors_Departments] ON [Doctors] ([DepartmentID]);
GO


CREATE INDEX [IX_Doctors_PersonID] ON [Doctors] ([PersonID]);
GO


CREATE UNIQUE INDEX [IX_Doctors_UserID] ON [Doctors] ([UserID]) WHERE [UserID] IS NOT NULL;
GO


CREATE INDEX [IX_Doctors_Users] ON [Doctors] ([UserID]);
GO


CREATE UNIQUE INDEX [IX_Employees_Person] ON [Employees] ([PersonID]);
GO


CREATE INDEX [IX_MedicalRecords_PatientID] ON [MedicalRecords] ([PatientID]);
GO


CREATE INDEX [IX_MedicalServices_CategoryID] ON [MedicalServices] ([CategoryID]);
GO


CREATE INDEX [UQ__MedicalService__ServiceName] ON [MedicalServices] ([ServiceName]);
GO


CREATE INDEX [IX_Notifications_PatientID] ON [Notifications] ([PatientID]);
GO


CREATE INDEX [IX_Notifications_UserID] ON [Notifications] ([UserID]);
GO


CREATE UNIQUE INDEX [IX_Patients_PersonID] ON [Patients] ([PersonID]);
GO


CREATE INDEX [IX_Payments_BillID] ON [Payments] ([BillID]);
GO


CREATE UNIQUE INDEX [IX_People_ContactNumber] ON [People] ([ContactNumber]) WHERE [ContactNumber] IS NOT NULL;
GO


CREATE UNIQUE INDEX [IX_People_Email] ON [People] ([Email]);
GO


CREATE INDEX [IX_Reports_GeneratedBy] ON [Reports] ([GeneratedBy]);
GO


CREATE UNIQUE INDEX [UQ__Service__CategoryName] ON [ServiceCategories] ([CategoryName]);
GO


CREATE INDEX [IX_Users_Person] ON [Users] ([PersonID]);
GO


CREATE UNIQUE INDEX [IX_Users_PersonID] ON [Users] ([PersonID]);
GO


