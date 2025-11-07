
using Logistics_9.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Logistics_9.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehicleController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VehicleController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ Dispatcher + Driver: View all vehicles
        [HttpGet]
        [Authorize(Roles = "Dispatcher,Driver")]
        public async Task<IActionResult> GetAllVehicles()
        {
            var vehicles = await _context.Vehicles.ToListAsync();
            return Ok(vehicles);
        }

        // ✅ Dispatcher: Create Vehicle
        [HttpPost]
        [Authorize(Roles = "Dispatcher")]
        public async Task<IActionResult> CreateVehicle([FromBody] Vehicle vehicle)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check duplicate vehicle number
            var exists = await _context.Vehicles.AnyAsync(v => v.VehicleNumber == vehicle.VehicleNumber);
            if (exists)
                return BadRequest("Vehicle number already exists");

            await _context.Vehicles.AddAsync(vehicle);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Vehicle created successfully", vehicle });
        }

        // ✅ Dispatcher: Update Vehicle
        [HttpPut("{id}")]
        [Authorize(Roles = "Dispatcher")]
        public async Task<IActionResult> UpdateVehicle(int id, [FromBody] Vehicle updatedVehicle)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
                return NotFound("Vehicle not found");

            // Update allowed fields
            vehicle.VehicleName = updatedVehicle.VehicleName;
            vehicle.VehicleType = updatedVehicle.VehicleType;
            vehicle.VehicleNumber = updatedVehicle.VehicleNumber;
            vehicle.Capacity = updatedVehicle.Capacity;

            _context.Vehicles.Update(vehicle);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Vehicle updated successfully", vehicle });
        }

        // ✅ Dispatcher: Delete Vehicle
        [HttpDelete("{id}")]
        [Authorize(Roles = "Dispatcher")]
        public async Task<IActionResult> DeleteVehicle(int id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
                return NotFound("Vehicle not found");

            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync();

            return Ok("Vehicle deleted successfully");
        }
    }
}
