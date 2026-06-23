using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Persistance.Data.Migrations
{
    /// <inheritdoc />
    public partial class CleanInitialDesign : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TableName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    KeyValue = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ActionType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OldValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    ActionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    JobTitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Department = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OfficeId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Governorates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Governorates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Owners",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NationalId = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    OwnerType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Owners", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Properties",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BuildingNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GovernorateId = table.Column<int>(type: "int", nullable: false),
                    CenterId = table.Column<int>(type: "int", nullable: false),
                    StreetId = table.Column<int>(type: "int", nullable: false),
                    NeighborhoodId = table.Column<int>(type: "int", nullable: false),
                    CurrentPropertyNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OldPropertyNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PlanningNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BuildYear = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Properties", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Centers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    GovernorateId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Centers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Centers_Governorates_GovernorateId",
                        column: x => x.GovernorateId,
                        principalTable: "Governorates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Units",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PropertyId = table.Column<int>(type: "int", nullable: false),
                    UnitNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Floor = table.Column<int>(type: "int", nullable: false),
                    Area = table.Column<double>(type: "float", nullable: false),
                    UsageType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FinishingType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UnitType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Units", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Units_Properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "Properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Neighborhoods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CenterId = table.Column<int>(type: "int", nullable: false),
                    Zone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Neighborhoods", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Neighborhoods_Centers_CenterId",
                        column: x => x.CenterId,
                        principalTable: "Centers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Streets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CenterId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Streets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Streets_Centers_CenterId",
                        column: x => x.CenterId,
                        principalTable: "Centers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoleAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OwnerId = table.Column<int>(type: "int", nullable: false),
                    PropertyId = table.Column<int>(type: "int", nullable: true),
                    UnitId = table.Column<int>(type: "int", nullable: true),
                    RoleType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ShareType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SharePercentage = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoleAssignments_Owners_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Owners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RoleAssignments_Properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "Properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoleAssignments_Units_UnitId",
                        column: x => x.UnitId,
                        principalTable: "Units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Governorates",
                columns: new[] { "Id", "CreatedAt", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 6, 23, 19, 24, 10, 999, DateTimeKind.Utc).AddTicks(7527), "القاهرة" },
                    { 2, new DateTime(2026, 6, 23, 19, 24, 10, 999, DateTimeKind.Utc).AddTicks(8773), "الجيزة" },
                    { 3, new DateTime(2026, 6, 23, 19, 24, 10, 999, DateTimeKind.Utc).AddTicks(8775), "الإسكندرية" },
                    { 4, new DateTime(2026, 6, 23, 19, 24, 10, 999, DateTimeKind.Utc).AddTicks(8776), "أسيوط" },
                    { 5, new DateTime(2026, 6, 23, 19, 24, 10, 999, DateTimeKind.Utc).AddTicks(8778), "المنيا" },
                    { 6, new DateTime(2026, 6, 23, 19, 24, 10, 999, DateTimeKind.Utc).AddTicks(8849), "سوهاج" },
                    { 7, new DateTime(2026, 6, 23, 19, 24, 10, 999, DateTimeKind.Utc).AddTicks(8851), "قنا" }
                });

            migrationBuilder.InsertData(
                table: "Centers",
                columns: new[] { "Id", "CreatedAt", "GovernorateId", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(5734), 1, "مدينة نصر" },
                    { 2, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(6810), 1, "المعادي" },
                    { 3, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(6813), 1, "حلوان" },
                    { 4, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(6814), 2, "الدقي" },
                    { 5, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(6816), 2, "الهرم" },
                    { 6, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(6818), 3, "سيدي جابر" },
                    { 7, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(6820), 3, "العجمي" },
                    { 8, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(6821), 4, "أسيوط" },
                    { 9, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(6823), 4, "البداري" },
                    { 10, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(6825), 4, "ديروط" },
                    { 11, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(6827), 4, "القوصية" },
                    { 12, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(6828), 5, "المنيا" },
                    { 13, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(6830), 6, "سوهاج" },
                    { 14, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(6832), 7, "قنا" }
                });

            migrationBuilder.InsertData(
                table: "Neighborhoods",
                columns: new[] { "Id", "CenterId", "CreatedAt", "Name", "Zone" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2026, 6, 23, 19, 24, 11, 2, DateTimeKind.Utc).AddTicks(707), "الحي السابع", "A" },
                    { 2, 1, new DateTime(2026, 6, 23, 19, 24, 11, 2, DateTimeKind.Utc).AddTicks(1933), "الحي الثامن", "B" },
                    { 3, 1, new DateTime(2026, 6, 23, 19, 24, 11, 2, DateTimeKind.Utc).AddTicks(1935), "الحي العاشر", "C" },
                    { 4, 8, new DateTime(2026, 6, 23, 19, 24, 11, 2, DateTimeKind.Utc).AddTicks(1937), "غرب البلد", "A" },
                    { 5, 8, new DateTime(2026, 6, 23, 19, 24, 11, 2, DateTimeKind.Utc).AddTicks(1941), "شرق البلد", "B" },
                    { 6, 8, new DateTime(2026, 6, 23, 19, 24, 11, 2, DateTimeKind.Utc).AddTicks(1943), "الأربعين", "C" }
                });

            migrationBuilder.InsertData(
                table: "Streets",
                columns: new[] { "Id", "CenterId", "CreatedAt", "Name" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(8541), "شارع النصر" },
                    { 2, 1, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(9416), "شارع عباس العقاد" },
                    { 3, 1, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(9418), "شارع مكرم عبيد" },
                    { 4, 8, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(9419), "شارع الجمهورية" },
                    { 5, 8, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(9421), "شارع الهلالي" },
                    { 6, 8, new DateTime(2026, 6, 23, 19, 24, 11, 1, DateTimeKind.Utc).AddTicks(9422), "شارع يسري راغب" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Centers_GovernorateId",
                table: "Centers",
                column: "GovernorateId");

            migrationBuilder.CreateIndex(
                name: "IX_Neighborhoods_CenterId",
                table: "Neighborhoods",
                column: "CenterId");

            migrationBuilder.CreateIndex(
                name: "IX_Owners_NationalId",
                table: "Owners",
                column: "NationalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RoleAssignments_OwnerId",
                table: "RoleAssignments",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleAssignments_PropertyId",
                table: "RoleAssignments",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleAssignments_UnitId",
                table: "RoleAssignments",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_Streets_CenterId",
                table: "Streets",
                column: "CenterId");

            migrationBuilder.CreateIndex(
                name: "IX_Units_PropertyId",
                table: "Units",
                column: "PropertyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.DropTable(
                name: "Neighborhoods");

            migrationBuilder.DropTable(
                name: "RoleAssignments");

            migrationBuilder.DropTable(
                name: "Streets");

            migrationBuilder.DropTable(
                name: "Owners");

            migrationBuilder.DropTable(
                name: "Units");

            migrationBuilder.DropTable(
                name: "Centers");

            migrationBuilder.DropTable(
                name: "Properties");

            migrationBuilder.DropTable(
                name: "Governorates");
        }
    }
}
