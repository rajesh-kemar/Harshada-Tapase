
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

        // ✅ Dispatcher: Edit/Update Vehicle details
        [HttpPut("{id}")]
        [Authorize(Roles = "Dispatcher")]
        public async Task<IActionResult> EditVehicle(int id, [FromBody] Vehicle updatedVehicle)
        {
            if (id != updatedVehicle.VehicleId)
                return BadRequest("Vehicle ID mismatch.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingVehicle = await _context.Vehicles.FindAsync(id);

            if (existingVehicle == null)
                return NotFound("Vehicle not found.");

            // Check duplicate vehicle number only if the number is being changed
            if (existingVehicle.VehicleNumber != updatedVehicle.VehicleNumber)
            {
                var exists = await _context.Vehicles.AnyAsync(v => v.VehicleNumber == updatedVehicle.VehicleNumber && v.VehicleId != id);
                if (exists)
                    return BadRequest("Vehicle number already exists for another vehicle.");
            }

            // Update properties
            existingVehicle.VehicleName = updatedVehicle.VehicleName;
            existingVehicle.VehicleType = updatedVehicle.VehicleType;
            existingVehicle.VehicleNumber = updatedVehicle.VehicleNumber;
            existingVehicle.Capacity = updatedVehicle.Capacity;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Vehicles.Any(e => e.VehicleId == id))
                {
                    return NotFound("Vehicle not found after concurrency check.");
                }
                throw;
            }

            return Ok(new { Message = "Vehicle updated successfully", existingVehicle });
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
