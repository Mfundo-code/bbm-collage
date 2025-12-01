using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMentorshipSystemBBM : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Mentors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    AreaOfExpertise = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Bio = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Availability = table.Column<string>(type: "jsonb", nullable: false),
                    CommunicationChannels = table.Column<string>(type: "jsonb", nullable: false),
                    MaxMentees = table.Column<int>(type: "INTEGER", nullable: false),
                    CurrentMentees = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mentors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Mentors_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Mentees",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    MentorId = table.Column<int>(type: "INTEGER", nullable: true),
                    LearningGoals = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Background = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    PreferredTopics = table.Column<string>(type: "jsonb", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mentees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Mentees_Mentors_MentorId",
                        column: x => x.MentorId,
                        principalTable: "Mentors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Mentees_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MentorshipSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    MentorId = table.Column<int>(type: "INTEGER", nullable: false),
                    MenteeId = table.Column<int>(type: "INTEGER", nullable: false),
                    ScheduledAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DurationMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    MeetingLink = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Agenda = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MentorshipSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MentorshipSessions_Mentees_MenteeId",
                        column: x => x.MenteeId,
                        principalTable: "Mentees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MentorshipSessions_Mentors_MentorId",
                        column: x => x.MentorId,
                        principalTable: "Mentors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Mentees_CreatedAt",
                table: "Mentees",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Mentees_MentorId",
                table: "Mentees",
                column: "MentorId");

            migrationBuilder.CreateIndex(
                name: "IX_Mentees_Status",
                table: "Mentees",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Mentees_UserId",
                table: "Mentees",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Mentors_CreatedAt",
                table: "Mentors",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Mentors_Status",
                table: "Mentors",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Mentors_UserId",
                table: "Mentors",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MentorshipSessions_CreatedAt",
                table: "MentorshipSessions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_MentorshipSessions_MenteeId",
                table: "MentorshipSessions",
                column: "MenteeId");

            migrationBuilder.CreateIndex(
                name: "IX_MentorshipSessions_MentorId",
                table: "MentorshipSessions",
                column: "MentorId");

            migrationBuilder.CreateIndex(
                name: "IX_MentorshipSessions_ScheduledAt",
                table: "MentorshipSessions",
                column: "ScheduledAt");

            migrationBuilder.CreateIndex(
                name: "IX_MentorshipSessions_Status",
                table: "MentorshipSessions",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MentorshipSessions");

            migrationBuilder.DropTable(
                name: "Mentees");

            migrationBuilder.DropTable(
                name: "Mentors");
        }
    }
}
