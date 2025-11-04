using System.ComponentModel.DataAnnotations;
namespace Logistics.Dto
{
    public class DriverCreationDto
    {
        [Required]
        public string Name { get; set; }
        public bool IsAvailable { get; set; }
    }
    public class DriverAvailabilityUpdateDto
    {
        [Required] // Ensure the status is always provided in the request body
        public bool IsAvailable { get; set; }
    }
}
