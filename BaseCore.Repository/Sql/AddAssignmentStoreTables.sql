IF COL_LENGTH('Products', 'SupplierId') IS NULL
    ALTER TABLE Products ADD SupplierId INT NULL;

IF COL_LENGTH('Products', 'Sku') IS NULL
    ALTER TABLE Products ADD Sku NVARCHAR(50) NULL;

IF COL_LENGTH('Products', 'Slug') IS NULL
    ALTER TABLE Products ADD Slug NVARCHAR(250) NULL;

IF COL_LENGTH('Products', 'CreatedAt') IS NULL
    ALTER TABLE Products ADD CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Products_CreatedAt DEFAULT GETDATE();

IF COL_LENGTH('Products', 'UpdatedAt') IS NULL
    ALTER TABLE Products ADD UpdatedAt DATETIME2 NULL;

IF COL_LENGTH('Products', 'IsDeleted') IS NULL
    ALTER TABLE Products ADD IsDeleted BIT NOT NULL CONSTRAINT DF_Products_IsDeleted DEFAULT 0;

IF COL_LENGTH('Categories', 'CreatedAt') IS NULL
    ALTER TABLE Categories ADD CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Categories_CreatedAt DEFAULT GETDATE();

IF COL_LENGTH('Categories', 'UpdatedAt') IS NULL
    ALTER TABLE Categories ADD UpdatedAt DATETIME2 NULL;

IF COL_LENGTH('Categories', 'IsDeleted') IS NULL
    ALTER TABLE Categories ADD IsDeleted BIT NOT NULL CONSTRAINT DF_Categories_IsDeleted DEFAULT 0;

IF COL_LENGTH('Orders', 'RecipientName') IS NULL
    ALTER TABLE Orders ADD RecipientName NVARCHAR(150) NULL;

IF COL_LENGTH('Orders', 'RecipientPhone') IS NULL
    ALTER TABLE Orders ADD RecipientPhone NVARCHAR(30) NULL;

IF COL_LENGTH('Orders', 'PaymentMethod') IS NULL
    ALTER TABLE Orders ADD PaymentMethod NVARCHAR(50) NOT NULL CONSTRAINT DF_Orders_PaymentMethod DEFAULT 'COD';

IF COL_LENGTH('Orders', 'PaymentStatus') IS NULL
    ALTER TABLE Orders ADD PaymentStatus NVARCHAR(50) NOT NULL CONSTRAINT DF_Orders_PaymentStatus DEFAULT 'Unpaid';

IF COL_LENGTH('Orders', 'UpdatedAt') IS NULL
    ALTER TABLE Orders ADD UpdatedAt DATETIME2 NULL;

IF COL_LENGTH('OrderDetails', 'UnitPrice') IS NULL
    ALTER TABLE OrderDetails ADD UnitPrice DECIMAL(18, 2) NOT NULL CONSTRAINT DF_OrderDetails_UnitPrice DEFAULT 0;

IF OBJECT_ID('Suppliers', 'U') IS NULL
BEGIN
    CREATE TABLE Suppliers (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Suppliers PRIMARY KEY,
        Name NVARCHAR(200) NOT NULL,
        ContactName NVARCHAR(150) NULL,
        Email NVARCHAR(150) NULL,
        Phone NVARCHAR(30) NULL,
        Address NVARCHAR(500) NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_Suppliers_IsActive DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Suppliers_CreatedAt DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NULL,
        IsDeleted BIT NOT NULL CONSTRAINT DF_Suppliers_IsDeleted DEFAULT 0
    );
END;

IF OBJECT_ID('Carts', 'U') IS NULL
BEGIN
    CREATE TABLE Carts (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Carts PRIMARY KEY,
        UserId INT NOT NULL,
        ProductId INT NOT NULL,
        Quantity INT NOT NULL CONSTRAINT DF_Carts_Quantity DEFAULT 1,
        CONSTRAINT FK_Carts_Users_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
        CONSTRAINT FK_Carts_Products_ProductId FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
    );
    CREATE UNIQUE INDEX IX_Carts_UserId_ProductId ON Carts(UserId, ProductId);
END;

IF OBJECT_ID('Wishlists', 'U') IS NULL
BEGIN
    CREATE TABLE Wishlists (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Wishlists PRIMARY KEY,
        UserId INT NOT NULL,
        ProductId INT NOT NULL,
        CONSTRAINT FK_Wishlists_Users_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
        CONSTRAINT FK_Wishlists_Products_ProductId FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
    );
    CREATE UNIQUE INDEX IX_Wishlists_UserId_ProductId ON Wishlists(UserId, ProductId);
END;

IF OBJECT_ID('UserAddresses', 'U') IS NULL
BEGIN
    CREATE TABLE UserAddresses (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_UserAddresses PRIMARY KEY,
        UserId INT NOT NULL,
        Label NVARCHAR(100) NULL,
        Recipient NVARCHAR(150) NOT NULL,
        Phone NVARCHAR(30) NULL,
        Address NVARCHAR(500) NOT NULL,
        IsDefault BIT NOT NULL CONSTRAINT DF_UserAddresses_IsDefault DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_UserAddresses_CreatedAt DEFAULT GETDATE(),
        CONSTRAINT FK_UserAddresses_Users_UserId FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );
END;

IF OBJECT_ID('ProductImages', 'U') IS NULL
BEGIN
    CREATE TABLE ProductImages (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ProductImages PRIMARY KEY,
        ProductId INT NOT NULL,
        ImageUrl NVARCHAR(500) NOT NULL,
        AltText NVARCHAR(250) NULL,
        IsPrimary BIT NOT NULL CONSTRAINT DF_ProductImages_IsPrimary DEFAULT 0,
        SortOrder INT NOT NULL CONSTRAINT DF_ProductImages_SortOrder DEFAULT 0,
        CONSTRAINT FK_ProductImages_Products_ProductId FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
    );
END;

IF OBJECT_ID('OrderLogs', 'U') IS NULL
BEGIN
    CREATE TABLE OrderLogs (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_OrderLogs PRIMARY KEY,
        OrderId INT NOT NULL,
        ChangedBy INT NULL,
        OldStatus NVARCHAR(50) NULL,
        NewStatus NVARCHAR(50) NOT NULL,
        Note NVARCHAR(500) NULL,
        ChangedAt DATETIME2 NOT NULL CONSTRAINT DF_OrderLogs_ChangedAt DEFAULT GETDATE(),
        CONSTRAINT FK_OrderLogs_Orders_OrderId FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
        CONSTRAINT FK_OrderLogs_Users_ChangedBy FOREIGN KEY (ChangedBy) REFERENCES Users(Id) ON DELETE SET NULL
    );
END;

IF OBJECT_ID('Promotions', 'U') IS NULL
BEGIN
    CREATE TABLE Promotions (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Promotions PRIMARY KEY,
        Name NVARCHAR(150) NOT NULL,
        PromoType NVARCHAR(50) NOT NULL,
        Value DECIMAL(18, 2) NOT NULL,
        MinOrder DECIMAL(18, 2) NOT NULL,
        StartDate DATETIME2 NOT NULL,
        EndDate DATETIME2 NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_Promotions_IsActive DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Promotions_CreatedAt DEFAULT GETDATE()
    );
    CREATE UNIQUE INDEX IX_Promotions_Name ON Promotions(Name);
END;

IF OBJECT_ID('PromotionProducts', 'U') IS NULL
BEGIN
    CREATE TABLE PromotionProducts (
        PromotionId INT NOT NULL,
        ProductId INT NOT NULL,
        CONSTRAINT PK_PromotionProducts PRIMARY KEY (PromotionId, ProductId),
        CONSTRAINT FK_PromotionProducts_Promotions_PromotionId FOREIGN KEY (PromotionId) REFERENCES Promotions(Id) ON DELETE CASCADE,
        CONSTRAINT FK_PromotionProducts_Products_ProductId FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
    );
END;

IF OBJECT_ID('PromotionCategories', 'U') IS NULL
BEGIN
    CREATE TABLE PromotionCategories (
        PromotionId INT NOT NULL,
        CategoryId INT NOT NULL,
        CONSTRAINT PK_PromotionCategories PRIMARY KEY (PromotionId, CategoryId),
        CONSTRAINT FK_PromotionCategories_Promotions_PromotionId FOREIGN KEY (PromotionId) REFERENCES Promotions(Id) ON DELETE CASCADE,
        CONSTRAINT FK_PromotionCategories_Categories_CategoryId FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE CASCADE
    );
END;
