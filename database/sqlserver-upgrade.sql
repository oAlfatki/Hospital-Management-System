-- Upgrade an existing database matching the original EF model.
-- Review and run against a restored backup first; never run sqlserver-create.sql on existing data.
-- No connection is made or schema change applied automatically by the application.
SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL OR OBJECT_ID(N'dbo.People', N'U') IS NULL
    THROW 51000, 'Expected hospital schema was not found. Select the correct database.', 1;

DECLARE @table sysname, @statement nvarchar(max);
DECLARE tables_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT name FROM (VALUES ('Patients'), ('Users'), ('Doctors'), ('Departments'), ('Appointments'), ('Bills'), ('MedicalRecords')) AS t(name);
OPEN tables_cursor;
FETCH NEXT FROM tables_cursor INTO @table;
WHILE @@FETCH_STATUS = 0
BEGIN
    IF COL_LENGTH('dbo.' + @table, 'CreatedOn') IS NULL
    BEGIN
        SET @statement = N'ALTER TABLE dbo.' + QUOTENAME(@table) + N' ADD CreatedOn datetime2 NULL;'; EXEC sp_executesql @statement;
    END;
    IF COL_LENGTH('dbo.' + @table, 'UpdatedOn') IS NULL
    BEGIN
        SET @statement = N'ALTER TABLE dbo.' + QUOTENAME(@table) + N' ADD UpdatedOn datetime2 NULL;'; EXEC sp_executesql @statement;
    END;
    IF COL_LENGTH('dbo.' + @table, 'CreatedBy') IS NULL
    BEGIN
        SET @statement = N'ALTER TABLE dbo.' + QUOTENAME(@table) + N' ADD CreatedBy nvarchar(max) NOT NULL CONSTRAINT ' + QUOTENAME('DF_' + @table + '_CreatedBy') + N' DEFAULT N'''';'; EXEC sp_executesql @statement;
    END;
    FETCH NEXT FROM tables_cursor INTO @table;
END;
CLOSE tables_cursor;
DEALLOCATE tables_cursor;

IF COL_LENGTH('dbo.Patients', 'ClinicalStatus') IS NULL
    EXEC(N'ALTER TABLE dbo.Patients ADD ClinicalStatus nvarchar(max) NOT NULL CONSTRAINT DF_Patients_ClinicalStatus DEFAULT N''Active''; UPDATE dbo.Patients SET ClinicalStatus = CASE WHEN Status = 1 THEN N''Active'' ELSE N''Inactive'' END;');
IF COL_LENGTH('dbo.Users', 'DepartmentName') IS NULL
    ALTER TABLE dbo.Users ADD DepartmentName nvarchar(max) NULL;
IF COL_LENGTH('dbo.Departments', 'Description') IS NULL
    ALTER TABLE dbo.Departments ADD Description nvarchar(max) NULL;
IF COL_LENGTH('dbo.Doctors', 'PersonID') IS NULL
    EXEC(N'ALTER TABLE dbo.Doctors ADD PersonID nchar(10) NULL; UPDATE d SET PersonID=u.PersonID FROM dbo.Doctors d JOIN dbo.Users u ON u.ID=d.UserID;');
IF COL_LENGTH('dbo.Bills', 'TaxPercent') IS NULL
    ALTER TABLE dbo.Bills ADD TaxPercent decimal(5,2) NOT NULL CONSTRAINT DF_Bills_TaxPercent DEFAULT 0;
IF COL_LENGTH('dbo.Bills', 'Revision') IS NULL
    ALTER TABLE dbo.Bills ADD Revision int NOT NULL CONSTRAINT DF_Bills_Revision DEFAULT 0;
IF COL_LENGTH('dbo.MedicalRecords', 'Version') IS NULL
    ALTER TABLE dbo.MedicalRecords ADD Version int NOT NULL CONSTRAINT DF_MedicalRecords_Version DEFAULT 1;
IF COL_LENGTH('dbo.MedicalRecords', 'UpdatedBy') IS NULL
    ALTER TABLE dbo.MedicalRecords ADD UpdatedBy nvarchar(max) NOT NULL CONSTRAINT DF_MedicalRecords_UpdatedBy DEFAULT N'';

ALTER TABLE dbo.Users ALTER COLUMN Name nvarchar(200) NOT NULL;
ALTER TABLE dbo.Departments ALTER COLUMN Name nvarchar(100) NOT NULL;
ALTER TABLE dbo.Bills ALTER COLUMN Discount decimal(10,2) NULL;
ALTER TABLE dbo.Doctors ALTER COLUMN UserID nchar(10) NULL;

IF OBJECT_ID('dbo.CK_People_Gender', 'C') IS NOT NULL ALTER TABLE dbo.People DROP CONSTRAINT CK_People_Gender;
ALTER TABLE dbo.People ALTER COLUMN Gender nvarchar(30) NOT NULL;
ALTER TABLE dbo.People ADD CONSTRAINT CK_People_Gender CHECK (Gender IN ('Male','Female','Other','Prefer not to say'));
IF OBJECT_ID('dbo.CK_Users_Role', 'C') IS NOT NULL ALTER TABLE dbo.Users DROP CONSTRAINT CK_Users_Role;
UPDATE dbo.Users SET Role = LTRIM(RTRIM(Role));
ALTER TABLE dbo.Users ADD CONSTRAINT CK_Users_Role CHECK (Role IN ('Admin','Doctor','Nurse','Accounts','Management'));

-- Optional staff phone numbers must not collide on an empty value.
IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.People') AND name='IX_People_ContactNumber')
    DROP INDEX IX_People_ContactNumber ON dbo.People;
ALTER TABLE dbo.People ALTER COLUMN ContactNumber nchar(10) NULL;
UPDATE dbo.People SET ContactNumber = NULL WHERE LTRIM(RTRIM(ContactNumber)) = '';
CREATE UNIQUE INDEX IX_People_ContactNumber ON dbo.People(ContactNumber) WHERE ContactNumber IS NOT NULL;

-- The original relationship incorrectly allowed one doctor per department.
-- Drop only single-column unique indexes on DepartmentID; leave other indexes intact.
DECLARE @index sysname;
DECLARE index_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT i.name FROM sys.indexes i
    JOIN sys.index_columns ic ON ic.object_id=i.object_id AND ic.index_id=i.index_id AND ic.key_ordinal=1
    JOIN sys.columns c ON c.object_id=ic.object_id AND c.column_id=ic.column_id
    WHERE i.object_id=OBJECT_ID('dbo.Doctors') AND i.is_unique=1 AND i.is_primary_key=0 AND i.is_unique_constraint=0
      AND c.name='DepartmentID' AND NOT EXISTS (SELECT 1 FROM sys.index_columns ic2 WHERE ic2.object_id=i.object_id AND ic2.index_id=i.index_id AND ic2.key_ordinal>1);
OPEN index_cursor; FETCH NEXT FROM index_cursor INTO @index;
WHILE @@FETCH_STATUS=0
BEGIN
    SET @statement=N'DROP INDEX '+QUOTENAME(@index)+N' ON dbo.Doctors;'; EXEC sp_executesql @statement;
    FETCH NEXT FROM index_cursor INTO @index;
END;
CLOSE index_cursor; DEALLOCATE index_cursor;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.Doctors') AND name='IX_Doctors_Departments')
    CREATE INDEX IX_Doctors_Departments ON dbo.Doctors(DepartmentID);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='FK_Doctors_People_PersonID')
    EXEC(N'ALTER TABLE dbo.Doctors ADD CONSTRAINT FK_Doctors_People_PersonID FOREIGN KEY(PersonID) REFERENCES dbo.People(ID);');
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.Doctors') AND name='IX_Doctors_PersonID')
    EXEC(N'CREATE INDEX IX_Doctors_PersonID ON dbo.Doctors(PersonID);');

-- Correct the original notification FK that used UserID for both recipient and sender.
DECLARE fk_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT name FROM sys.foreign_keys WHERE parent_object_id=OBJECT_ID('dbo.Notifications') AND referenced_object_id=OBJECT_ID('dbo.Patients');
OPEN fk_cursor; FETCH NEXT FROM fk_cursor INTO @index;
WHILE @@FETCH_STATUS=0
BEGIN
    SET @statement=N'ALTER TABLE dbo.Notifications DROP CONSTRAINT '+QUOTENAME(@index)+N';'; EXEC sp_executesql @statement;
    FETCH NEXT FROM fk_cursor INTO @index;
END;
CLOSE fk_cursor; DEALLOCATE fk_cursor;
ALTER TABLE dbo.Notifications WITH CHECK ADD CONSTRAINT FK_Notifications_Patients_PatientID FOREIGN KEY(PatientID) REFERENCES dbo.Patients(ID);

IF OBJECT_ID('dbo.BillLines', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.BillLines (
        ID nvarchar(10) NOT NULL CONSTRAINT PK_BillLines PRIMARY KEY,
        BillID nchar(10) NOT NULL,
        ServiceName nvarchar(max) NOT NULL,
        Cost decimal(10,2) NOT NULL,
        CONSTRAINT FK_BillLines_Bills_BillID FOREIGN KEY(BillID) REFERENCES dbo.Bills(ID) ON DELETE CASCADE
    );
    CREATE INDEX IX_BillLines_BillID ON dbo.BillLines(BillID);
    -- Preserve existing service lines without rewriting invoice totals.
    INSERT INTO dbo.BillLines(ID, BillID, ServiceName, Cost)
        SELECT LEFT(CONVERT(nvarchar(36),NEWID()),10), bs.BillID,
            ms.ServiceName + N' × ' + CONVERT(nvarchar(12),COALESCE(bs.Quantity,1)),
            COALESCE(bs.Quantity,1) * bs.UnitPrice
        FROM dbo.BillServices bs JOIN dbo.MedicalServices ms ON ms.ID=bs.ServiceID;
END;
IF OBJECT_ID('dbo.Payments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Payments (
        ID nvarchar(10) NOT NULL CONSTRAINT PK_Payments PRIMARY KEY,
        BillID nchar(10) NOT NULL,
        Amount decimal(10,2) NOT NULL,
        PaidOn datetime2 NOT NULL,
        CONSTRAINT FK_Payments_Bills_BillID FOREIGN KEY(BillID) REFERENCES dbo.Bills(ID)
    );
    CREATE INDEX IX_Payments_BillID ON dbo.Payments(BillID);
    -- Historical paid totals remain on Bills. Their payment dates are unknown;
    -- do not fabricate ledger entries or inflate the current month's revenue.
END;

COMMIT TRANSACTION;
