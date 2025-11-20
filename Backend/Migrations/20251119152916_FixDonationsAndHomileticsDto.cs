using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class FixDonationsAndHomileticsDto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DonationCampaigns",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    GoalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CurrentAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CoverImage = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    StartDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    EndDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedById = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonationCampaigns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DonationCampaigns_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Donations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DonorId = table.Column<string>(type: "TEXT", nullable: true),
                    DonorName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    DonorEmail = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    DonationType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    TargetId = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Purpose = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Message = table.Column<string>(type: "TEXT", nullable: true),
                    Anonymous = table.Column<bool>(type: "INTEGER", nullable: false),
                    PaymentMethod = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    TransactionReference = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ReceiptUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    ReceiptSent = table.Column<bool>(type: "INTEGER", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    DonationCampaignId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Donations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Donations_DonationCampaigns_DonationCampaignId",
                        column: x => x.DonationCampaignId,
                        principalTable: "DonationCampaigns",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Donations_Users_DonorId",
                        column: x => x.DonorId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_DonationCampaigns_CreatedAt",
                table: "DonationCampaigns",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_DonationCampaigns_CreatedById",
                table: "DonationCampaigns",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_DonationCampaigns_Status",
                table: "DonationCampaigns",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_CreatedAt",
                table: "Donations",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_DonationCampaignId",
                table: "Donations",
                column: "DonationCampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_DonationType",
                table: "Donations",
                column: "DonationType");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_DonorId",
                table: "Donations",
                column: "DonorId");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_Status",
                table: "Donations",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Donations");

            migrationBuilder.DropTable(
                name: "DonationCampaigns");
        }
    }
}
