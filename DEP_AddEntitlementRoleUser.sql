CREATE PROCEDURE AddEntitlementRoleUser
(
    @RoleID  INT,        -- References Cricut.dbo.EntitlementRoles.RoleID
    @UserID  INT         -- References Cricut.dbo.AU_Users.i_recid
)
AS
BEGIN
    SET NOCOUNT, XACT_ABORT ON;

    INSERT INTO [$(sf_cricutlog)].[dbo].[esf_LogAccess] ([LogSeverityID],[Description],[CreatedDate]) VALUES (666,'AddEntitlementRoleUser',GETDATE())

    DECLARE @UserRoleID INT = -1;

    BEGIN TRY
        IF NOT EXISTS(SELECT 1 FROM dbo.EntitlementRoleUser WHERE EntitlementRoleID = @RoleID AND UserID = @UserID)
        BEGIN
            INSERT dbo.EntitlementRoleUser (EntitlementRoleID, UserID)
            VALUES (@RoleID, @UserID);
        END

        SELECT CAST(NULL AS INT) AS UserRoleID,
            UserID,
            EntitlementRoleID,
            CreatedDate
        FROM dbo.EntitlementRoleUser
        WHERE EntitlementRoleID = @RoleID
            AND UserID = @UserID;

        RETURN 0;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        DECLARE @ErrMessage  NVARCHAR(4000),
            @ErrSeverity     INT,
            @ErrState        INT;

        SELECT @ErrMessage = ERROR_MESSAGE(),
            @ErrSeverity = ERROR_SEVERITY(),
            @ErrState = ERROR_STATE();

        RAISERROR(@ErrMessage, @ErrSeverity, @ErrState);

        RETURN -1;
    END CATCH
END