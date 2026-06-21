using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistance.Migrations
{
    /// <inheritdoc />
    public partial class Exemption : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Exemptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OwnerId = table.Column<int>(type: "int", nullable: false),
                    UnitId = table.Column<int>(type: "int", nullable: false),
                    UnitNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExemptionType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExemptionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    DecisionResult = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExemptionStartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExemptionEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LegalReference = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExemptionReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InspectionResult = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Exemptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Exemptions_Owners_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Owners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Exemptions_Units_UnitId",
                        column: x => x.UnitId,
                        principalTable: "Units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ExemptionAttachments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExemptionId = table.Column<int>(type: "int", nullable: false),
                    DocumentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    UpdatedBy = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExemptionAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExemptionAttachments_Exemptions_ExemptionId",
                        column: x => x.ExemptionId,
                        principalTable: "Exemptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExemptionAttachments_ExemptionId",
                table: "ExemptionAttachments",
                column: "ExemptionId");

            migrationBuilder.CreateIndex(
                name: "IX_Exemptions_OwnerId",
                table: "Exemptions",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Exemptions_UnitId",
                table: "Exemptions",
                column: "UnitId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExemptionAttachments");

            migrationBuilder.DropTable(
                name: "Exemptions");
        }
    }
}
