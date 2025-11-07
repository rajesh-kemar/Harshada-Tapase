using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Logistics_9.Models
{
    public class Vehicle
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int VehicleId { get; set; }

        [Required(ErrorMessage = "Vehicle name is required")]
        [StringLength(100, ErrorMessage = "Vehicle name cannot exceed 100 characters")]
        public string VehicleName { get; set; }

        [Required(ErrorMessage = "Vehicle number is required")]
        [StringLength(12, MinimumLength = 12, ErrorMessage = "Vehicle number must be exactly 12 characters long")]
        [RegularExpression(@"^[A-Z]{2}\d{2}-[A-Z]{2}-\d{4}$",
            ErrorMessage = "Vehicle number must be in format like MH12-ER-1234")]
        public string VehicleNumber { get; set; }

        [Required(ErrorMessage = "Vehicle type is required")]
        [StringLength(50, ErrorMessage = "Vehicle type cannot exceed 50 characters")]
        public string VehicleType { get; set; }

        [Required(ErrorMessage = "Capacity is required")]
        [Range(1, 100, ErrorMessage = "Capacity must be between 1 and 100 tons")]
        public int Capacity { get; set; }
    }
}
