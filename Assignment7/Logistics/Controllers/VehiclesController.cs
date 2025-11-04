using Logistics.Data;
using Logistics.Dto;
using Logistics.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Logistics.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VehiclesController : ControllerBase
    {
        private readonly LogisticsDbContext _context;

        public VehiclesController(LogisticsDbContext context)
        {
            _context = context;
        }

        // GET: api/Vehicles
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Vehicle>>> GetVehicles()
        {
            return await _context.Vehicles.ToListAsync();
        }

        // GET: api/Vehicles/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Vehicle>> GetVehicle(int id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
                return NotFound();

            return vehicle;
        }

        // POST: api/Vehicles
        [HttpPost]
        public async Task<ActionResult<Vehicle>> PostVehicle(VehicleCreationDto vehicleDto)
        {
            var vehicle = new Vehicle
            {
                Model = vehicleDto.Model,
                LicensePlate = vehicleDto.LicensePlate,
                IsAvailable = vehicleDto.IsAvailable
            };

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVehicle), new { id = vehicle.VehicleId }, vehicle);
        }

        // PUT: api/Vehicles/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutVehicle(int id, VehicleCreationDto vehicleDto)
        {
            var vehicleInDb = await _context.Vehicles.FindAsync(id);
            if (vehicleInDb == null)
                return NotFound();

            vehicleInDb.Model = vehicleDto.Model;
            vehicleInDb.LicensePlate = vehicleDto.LicensePlate;
            vehicleInDb.IsAvailable = vehicleDto.IsAvailable;

            _context.Entry(vehicleInDb).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Vehicles/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVehicle(int id)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null)
                return NotFound();

            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
