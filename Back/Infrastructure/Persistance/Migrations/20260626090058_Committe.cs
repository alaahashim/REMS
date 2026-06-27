using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistance.Migrations
{
    /// <inheritdoc />
    public partial class Committe : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CommitteeDecisionDate",
                table: "Exemptions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CommitteeNote",
                table: "Exemptions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CommitteeUserId",
                table: "Exemptions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CommitteeVerdict",
                table: "Exemptions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CommitteeDecisionDate",
                table: "Appeals",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CommitteeNote",
                table: "Appeals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CommitteeUserId",
                table: "Appeals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CommitteeVerdict",
                table: "Appeals",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CommitteeDecisionDate",
                table: "Exemptions");

            migrationBuilder.DropColumn(
                name: "CommitteeNote",
                table: "Exemptions");

            migrationBuilder.DropColumn(
                name: "CommitteeUserId",
                table: "Exemptions");

            migrationBuilder.DropColumn(
                name: "CommitteeVerdict",
                table: "Exemptions");

            migrationBuilder.DropColumn(
                name: "CommitteeDecisionDate",
                table: "Appeals");

            migrationBuilder.DropColumn(
                name: "CommitteeNote",
                table: "Appeals");

            migrationBuilder.DropColumn(
                name: "CommitteeUserId",
                table: "Appeals");

            migrationBuilder.DropColumn(
                name: "CommitteeVerdict",
                table: "Appeals");
        }
    }
}
