namespace Logistics_9.Dto
{
    public class RegisterDto
    {
        public string Name { get; set; } = null!;
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Role { get; set; } = "Driver"; // "Driver" or "Dispatcher"

        // optional driver-only fields
        public int? Experience { get; set; }   // nullable
        public string? LicenceNumber { get; set; }
    }
}
