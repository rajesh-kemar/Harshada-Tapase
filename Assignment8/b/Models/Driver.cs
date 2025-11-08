using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Logistics_9.Models
{
    public class Driver
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DriverId { get; set; }

        // Foreign key linking to User table
        [Required]
        [ForeignKey("User")]
        public int UserId { get; set; }

        [JsonIgnore]
        public User? User { get; set; }   // Navigation property

        [Required(ErrorMessage = "Driver name is required")]
        [StringLength(100, ErrorMessage = "Driver name cannot exceed 100 characters")]
        public string DriverName { get; set; }

        [Required(ErrorMessage = "Experience is required")]
        [Range(0, 50, ErrorMessage = "Experience must be between 0 and 50 years")]
        public int Experience { get; set; }

        [Required(ErrorMessage = "Licence number is required")]
        [StringLength(15, ErrorMessage = "Licence number cannot exceed 15 characters")]
        [RegularExpression(@"^[A-Z]{2}\d{2}-\d{6}$", 
            ErrorMessage = "Licence number must be in format e.g. MH11-345453")]
        public string LicenceNumber { get; set; }
    }
}
