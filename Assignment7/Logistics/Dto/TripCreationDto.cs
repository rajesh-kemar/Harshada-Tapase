using System.ComponentModel.DataAnnotations;
namespace Logistics.Dto
{
    public class TripCreationDto
    {
        [Required]
        public string Destination { get; set; }
        public int DriverId { get; set; } 
        public int VehicleId { get; set; }
        public string Status { get; set; }
        [Required]
        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }
    }
}
