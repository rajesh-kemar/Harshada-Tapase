
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
    public class TripsController : ControllerBase
    {
        private readonly LogisticsDbContext _context;

        public TripsController(LogisticsDbContext context)
        {
            _context = context;
        }

        // ✅ GET: api/Trips
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Trip>>> GetTrips()
        {
            return await _context.Trips.ToListAsync();
        }

        // ✅ GET: api/Trips/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Trip>> GetTrip(int id)
        {
            var trip = await _context.Trips.FindAsync(id);
            if (trip == null) return NotFound();
            return trip;
        }

        // ✅ GET: api/Trips/active
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<Trip>>> GetActiveTrips()
        {
            return await _context.Trips
                .Where(t => t.Status == "In Progress")
                .ToListAsync();
        }

        // ✅ GET: api/Trips/completed
        [HttpGet("completed")]
        public async Task<ActionResult<IEnumerable<Trip>>> GetCompletedTrips()
        {
            return await _context.Trips
                .Where(t => t.Status == "Completed")
                .ToListAsync();
        }

        // ✅ GET: api/Trips/long
        [HttpGet("long")]
        public async Task<ActionResult<IEnumerable<Trip>>> GetLongTrips()
        {
            // Trips lasting longer than 8 hours
            return await _context.Trips
                .Where(t => EF.Functions.DateDiffHour(t.StartTime, t.EndTime) > 8)
                .ToListAsync();
        }

        // ✅ PUT: api/Trips/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTrip(int id, Trip trip)
        {
            if (id != trip.TripId)
                return BadRequest();

            _context.Entry(trip).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TripExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // ✅ POST: api/Trips
        [HttpPost]
        public async Task<ActionResult<Trip>> PostTrip(TripCreationDto tripDto)
        {
            if (tripDto.DriverId == 0 || tripDto.VehicleId == 0)
            {
                return BadRequest("Driver and Vehicle IDs must be selected.");
            }

            var trip = new Trip
            {
                Destination = tripDto.Destination,
                DriverId = tripDto.DriverId,
                VehicleId = tripDto.VehicleId,
                Status = tripDto.Status ?? "Pending",
                StartTime = tripDto.StartTime,
                EndTime = tripDto.EndTime ?? tripDto.StartTime
            };

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    _context.Trips.Add(trip);
                    await _context.SaveChangesAsync();

                    // Update driver and vehicle availability
                    var driver = await _context.Drivers.FindAsync(trip.DriverId);
                    if (driver != null) driver.IsAvailable = false;

                    var vehicle = await _context.Vehicles.FindAsync(trip.VehicleId);
                    if (vehicle != null) vehicle.IsAvailable = false;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return CreatedAtAction("GetTrip", new { id = trip.TripId }, trip);
                }
                catch
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, "An error occurred while creating the trip and updating availability.");
                }
            }
        }

        // ✅ DELETE: api/Trips/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrip(int id)
        {
            var trip = await _context.Trips.FindAsync(id);
            if (trip == null) return NotFound();

            _context.Trips.Remove(trip);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TripExists(int id)
        {
            return _context.Trips.Any(e => e.TripId == id);
        }
    }
}
