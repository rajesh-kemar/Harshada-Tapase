
using System.ComponentModel.DataAnnotations;
namespace Logistics.Dto
{
    public class VehicleCreationDto
    {
        [Required]
        public string Model { get; set; }
        [Required]
        public string LicensePlate { get; set; }
        public bool IsAvailable { get; set; }
    }
}
