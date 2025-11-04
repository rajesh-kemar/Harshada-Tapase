using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
namespace Logistics.Models
{
    public class Driver
    {
        public int DriverId { get; set; }
        [Required]
        public string Name { get; set; }
        public bool IsAvailable { get; set; } = true;

        public ICollection<Trip> Trips { get; set; }
    }
}
