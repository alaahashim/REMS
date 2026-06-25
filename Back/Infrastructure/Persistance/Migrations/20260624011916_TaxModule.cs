using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistance.Migrations
{
    /// <inheritdoc />
    public partial class TaxModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TaxAssessments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UnitId = table.Column<int>(type: "int", nullable: false),
                    OwnerId = table.Column<int>(type: "int", nullable: true),
                    TaxYear = table.Column<int>(type: "int", nullable: false),
                    AnnualRent = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MaintenanceDiscountRate = table.Column<decimal>(type: "decimal(8,4)", nullable: false),
                    MaintenanceDiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NetAnnualRentalValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TaxRate = table.Column<decimal>(type: "decimal(8,4)", nullable: false),
                    AnnualTax = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsExempted = table.Column<bool>(type: "bit", nullable: false),
                    ExemptionAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExemptionReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PayerType = table.Column<int>(type: "int", nullable: false),
                    PaymentPlan = table.Column<int>(type: "int", nullable: false),
                    AppealFee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalDue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CalculationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaxAssessments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaxAssessments_Owners_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Owners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TaxAssessments_Units_UnitId",
                        column: x => x.UnitId,
                        principalTable: "Units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TaxRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RuleCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RuleValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EffectiveTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaxRules", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TaxAssessments_OwnerId",
                table: "TaxAssessments",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxAssessments_UnitId_TaxYear",
                table: "TaxAssessments",
                columns: new[] { "UnitId", "TaxYear" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TaxRules_RuleCode",
                table: "TaxRules",
                column: "RuleCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TaxAssessments");

            migrationBuilder.DropTable(
                name: "TaxRules");
        }
    }
}
