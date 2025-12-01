using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePrayerRequestMakeMissionary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PrayerRequests_Missionaries_MissionaryId",
                table: "PrayerRequests");

            migrationBuilder.AlterColumn<string>(
                name: "MissionaryId",
                table: "PrayerRequests",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AddColumn<DateTime>(
                name: "AnsweredAt",
                table: "PrayerRequests",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "PrayerRequests",
                type: "TEXT",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_PrayerRequests_Status",
                table: "PrayerRequests",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_PrayerRequests_Missionaries_MissionaryId",
                table: "PrayerRequests",
                column: "MissionaryId",
                principalTable: "Missionaries",
                principalColumn: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PrayerRequests_Missionaries_MissionaryId",
                table: "PrayerRequests");

            migrationBuilder.DropIndex(
                name: "IX_PrayerRequests_Status",
                table: "PrayerRequests");

            migrationBuilder.DropColumn(
                name: "AnsweredAt",
                table: "PrayerRequests");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "PrayerRequests");

            migrationBuilder.AlterColumn<string>(
                name: "MissionaryId",
                table: "PrayerRequests",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PrayerRequests_Missionaries_MissionaryId",
                table: "PrayerRequests",
                column: "MissionaryId",
                principalTable: "Missionaries",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
