IF OBJECT_ID('AdminSettings', 'U') IS NULL
BEGIN
    CREATE TABLE AdminSettings (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_AdminSettings PRIMARY KEY,
        Scope NVARCHAR(100) NOT NULL,
        JsonValue NVARCHAR(MAX) NOT NULL,
        UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_AdminSettings_UpdatedAt DEFAULT GETDATE()
    );

    CREATE UNIQUE INDEX IX_AdminSettings_Scope ON AdminSettings(Scope);
END;
