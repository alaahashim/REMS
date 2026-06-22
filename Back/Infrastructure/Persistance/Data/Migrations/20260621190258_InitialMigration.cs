using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistance.Data.Migrations
{
    public partial class InitialMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Baseline migration for existing database state.
            // Existing tables are already present in the database.
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No rollback actions for baseline migration.
        }
    }
}
