-- Current model: CreatedBy and UpdatedBy are integer employee ids.
-- Use the Admin employee id when it exists, otherwise fallback to 1.
DECLARE @AdminId INT =
(
    SELECT TOP (1) Id
    FROM Employees
    WHERE Username = 'admin' OR Department = 'Admin' OR JobTitle = 'Admin'
    ORDER BY Id
);

SET @AdminId = ISNULL(@AdminId, 1);

UPDATE Employees
SET CreatedBy = @AdminId
WHERE CreatedBy IS NULL OR CreatedBy = 0;

UPDATE Employees
SET UpdatedBy = @AdminId
WHERE UpdatedBy IS NULL OR UpdatedBy = 0;

-- If your database has a custom string column instead, use this shape:
-- UPDATE Employees SET CreatedBy = 'Admin' WHERE CreatedBy IS NULL OR LTRIM(RTRIM(CreatedBy)) = '';
-- UPDATE Employees SET ModifiedBy = 'Admin' WHERE ModifiedBy IS NULL OR LTRIM(RTRIM(ModifiedBy)) = '';
