using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Logistics_9.Models
{
    public class Trip
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TripId { get; set; }

        // Foreign key to Driver table
        [Required]
        [ForeignKey("Driver")]
        public int DriverId { get; set; }

        [JsonIgnore]
        public Driver? Driver { get; set; } 

        // Foreign key to Vehicle table
        [Required]
        [ForeignKey("Vehicle")]
        public int VehicleId { get; set; }

        [JsonIgnore]
        public Vehicle? Vehicle { get; set; } 

        [Required(ErrorMessage = "Source is required")]
        [StringLength(100, ErrorMessage = "Source cannot exceed 100 characters")]
        public string Source { get; set; }

        [Required(ErrorMessage = "Destination is required")]
        [StringLength(100, ErrorMessage = "Destination cannot exceed 100 characters")]
        public string Destination { get; set; }


        [Required(ErrorMessage = "Start time is required")]
        public DateTime StartTime { get; set; }

        [Required(ErrorMessage = "End time is required")]
        public DateTime? EndTime { get; set; } //null =in process

        [Required(ErrorMessage = "Status is required")]
        [StringLength(20)]
        [RegularExpression("^(Pending|Ongoing|Completed|Cancelled)$",
            ErrorMessage = "Status must be one of: Pending, Ongoing, Completed, or Cancelled")]
        public string Status { get; set; }

        [StringLength(500, ErrorMessage = "Remarks cannot exceed 500 characters")]
        public string? Remarks { get; set; }
    }
}
