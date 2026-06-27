using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistance.Migrations
{
    /// <inheritdoc />
    public partial class manager : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ManagerApprovedTax",
                table: "TaxAssessments",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ManagerDecisionDate",
                table: "Exemptions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ManagerNote",
                table: "Exemptions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ManagerUserId",
                table: "Exemptions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ManagerVerdict",
                table: "Exemptions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TaxYear",
                table: "Exemptions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "ManagerDecisionDate",
                table: "Appeals",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ManagerNote",
                table: "Appeals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ManagerUserId",
                table: "Appeals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ManagerVerdict",
                table: "Appeals",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ManagerApprovedTax",
                table: "TaxAssessments");

            migrationBuilder.DropColumn(
                name: "ManagerDecisionDate",
                table: "Exemptions");

            migrationBuilder.DropColumn(
                name: "ManagerNote",
                table: "Exemptions");

            migrationBuilder.DropColumn(
                name: "ManagerUserId",
                table: "Exemptions");

            migrationBuilder.DropColumn(
                name: "ManagerVerdict",
                table: "Exemptions");

            migrationBuilder.DropColumn(
                name: "TaxYear",
                table: "Exemptions");

            migrationBuilder.DropColumn(
                name: "ManagerDecisionDate",
                table: "Appeals");

            migrationBuilder.DropColumn(
                name: "ManagerNote",
                table: "Appeals");

            migrationBuilder.DropColumn(
                name: "ManagerUserId",
                table: "Appeals");

            migrationBuilder.DropColumn(
                name: "ManagerVerdict",
                table: "Appeals");
        }
    }
}
