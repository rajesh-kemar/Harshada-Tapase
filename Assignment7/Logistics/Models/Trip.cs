using System.ComponentModel.DataAnnotations;

namespace Logistics.Models
{
    public class Trip
    {
        public int TripId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        [Required]
        public string Destination { get; set; }

        public string Status { get; set; } = "in-progress";

        public int? DriverId { get; set; }
        public Driver? Driver { get; set; }

        public int? VehicleId { get; set; }
        public Vehicle? Vehicle { get; set; }
    }
}
