using System.ComponentModel.DataAnnotations;

namespace Logistics.Models
{
    public class Vehicle
    {
        public int VehicleId { get; set; }

        [Required]
        public string LicensePlate { get; set; }

        public string Model { get; set; }

        public bool IsAvailable { get; set; } = true;

        // One-to-many relationship with Trip
        public ICollection<Trip> Trips { get; set; }
    }
}
