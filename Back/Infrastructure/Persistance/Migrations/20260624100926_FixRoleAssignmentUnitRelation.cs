using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistance.Migrations
{
    /// <inheritdoc />
    public partial class FixRoleAssignmentUnitRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoleAssignments_Units_UnitId1",
                table: "RoleAssignments");

            migrationBuilder.DropIndex(
                name: "IX_RoleAssignments_UnitId1",
                table: "RoleAssignments");

            migrationBuilder.DropColumn(
                name: "UnitId1",
                table: "RoleAssignments");

            migrationBuilder.AlterColumn<double>(
                name: "SharePercentage",
                table: "RoleAssignments",
                type: "float",
                nullable: false,
                defaultValue: 100.0,
                oldClrType: typeof(double),
                oldType: "float");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "SharePercentage",
                table: "RoleAssignments",
                type: "float",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "float",
                oldDefaultValue: 100.0);

            migrationBuilder.AddColumn<int>(
                name: "UnitId1",
                table: "RoleAssignments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RoleAssignments_UnitId1",
                table: "RoleAssignments",
                column: "UnitId1");

            migrationBuilder.AddForeignKey(
                name: "FK_RoleAssignments_Units_UnitId1",
                table: "RoleAssignments",
                column: "UnitId1",
                principalTable: "Units",
                principalColumn: "Id");
        }
    }
}
