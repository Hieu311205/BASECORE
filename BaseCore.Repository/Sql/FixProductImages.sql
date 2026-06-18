USE [LapTrinhWeb]
GO

UPDATE [dbo].[Products]
SET [ImageUrl] = CASE [Id]
    WHEN 7 THEN N'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80'
    WHEN 8 THEN N'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80'
    WHEN 9 THEN N'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=600&q=80'
    WHEN 10 THEN N'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=600&q=80'
    WHEN 11 THEN N'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=600&q=80'
    WHEN 14 THEN N'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80'
    WHEN 15 THEN N'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80'
    WHEN 16 THEN N'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=600&q=80'
    WHEN 19 THEN N'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=600&q=80'
    WHEN 20 THEN N'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=600&q=80'
    WHEN 21 THEN N'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=600&q=80'
    WHEN 23 THEN N'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80'
    WHEN 24 THEN N'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80'
    WHEN 25 THEN N'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=600&q=80'
    WHEN 26 THEN N'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80'
    WHEN 27 THEN N'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80'
    WHEN 28 THEN N'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80'
    WHEN 29 THEN N'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80'
    WHEN 30 THEN N'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80'
    WHEN 31 THEN N'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80'
    WHEN 33 THEN N'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80'
    ELSE [ImageUrl]
END
WHERE [Id] IN (7, 8, 9, 10, 11, 14, 15, 16, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33);
GO

UPDATE [dbo].[Products]
SET [ImageUrl] = N'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80'
WHERE
    [IsDeleted] = 0
    AND (
        [ImageUrl] IS NULL
        OR LTRIM(RTRIM([ImageUrl])) = N''
        OR [ImageUrl] LIKE N'%...%'
        OR [ImageUrl] LIKE N'%N''%'
    );
GO

SELECT
    [Id],
    [Name],
    [ImageUrl]
FROM [dbo].[Products]
WHERE [IsDeleted] = 0
ORDER BY [Id];
GO
