using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddOutreachModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Outreaches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Location = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Leader = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Activities = table.Column<string>(type: "jsonb", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Photos = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Outreaches", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OutreachReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    OutreachId = table.Column<int>(type: "INTEGER", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Author = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Photos = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OutreachReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OutreachReports_Outreaches_OutreachId",
                        column: x => x.OutreachId,
                        principalTable: "Outreaches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Outreaches_CreatedAt",
                table: "Outreaches",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Outreaches_Status",
                table: "Outreaches",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_OutreachReports_CreatedAt",
                table: "OutreachReports",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_OutreachReports_OutreachId",
                table: "OutreachReports",
                column: "OutreachId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OutreachReports");

            migrationBuilder.DropTable(
                name: "Outreaches");
        }
    }
}
