using Logistics_9.Dto;
using Logistics_9.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Logistics_9.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TripController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TripController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Dispatcher")]
        public async Task<IActionResult> CreateTrip([FromBody] Trip trip)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Verify Driver exists (this is good practice)
            var driverExists = await _context.Drivers.AnyAsync(d => d.DriverId == trip.DriverId);
            if (!driverExists)
                return BadRequest("Invalid DriverId");

            // Verify Vehicle exists (this is good practice)
            var vehicleExists = await _context.Vehicles.AnyAsync(v => v.VehicleId == trip.VehicleId);
            if (!vehicleExists)
                return BadRequest("Invalid VehicleId");

            trip.Status = "Planned";   // default status

            await _context.Trips.AddAsync(trip);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Trip created successfully", trip });
        }


        // ✅ Dispatcher: Get all trips
        [HttpGet]
        [Authorize(Roles = "Dispatcher")]
        public async Task<IActionResult> GetAllTrips()
        {
            var trips = await _context.Trips
                .Include(t => t.Driver)
                .ThenInclude(d => d.User)
                .Include(t => t.Vehicle)
                .ToListAsync();

            return Ok(trips);
        }

        // ✅ Get Active trips (for dashboard)
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveTrips()
        {
            // Status filter changed to "Active"
            var activeTrips = await _context.Trips
                .Where(t => t.Status == "Active")
                .Include(x => x.Driver)
                .Include(x => x.Vehicle)
                .ToListAsync();

            return Ok(activeTrips);
        }

        // ✅ Get Completed trips
        [HttpGet("completed")]
        public async Task<IActionResult> GetCompletedTrips()
        {
            var completedTrips = await _context.Trips
                .Where(t => t.Status == "Completed")
                .Include(x => x.Driver)
                .Include(x => x.Vehicle)
                .ToListAsync();

            return Ok(completedTrips);
        }

        // ✅ Trips greater than 8 hours
        [HttpGet("long-trips")]
        public async Task<IActionResult> GetLongTrips()
        {
            // NOTE: EF.Functions.DateDiffHour is SQL Server specific.
            var longTrips = await _context.Trips
                .Where(t => t.EndTime.HasValue && EF.Functions.DateDiffHour(t.StartTime, t.EndTime.Value) > 8)
                .Include(x => x.Driver)
                .Include(x => x.Vehicle)
                .ToListAsync();

            return Ok(longTrips);
        }

        // ✅ Driver: View only their trips (UserId from JWT)
        [HttpGet("my-trips")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> GetMyTrips()
        {
            int loggedUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var trips = await _context.Trips
                .Include(t => t.Vehicle)
                .Include(t => t.Driver)
                .Where(t => t.Driver.UserId == loggedUserId)
                .ToListAsync();

            return Ok(trips);
        }

        // ✅ Driver: Update trip status (Planned → Active → Completed)
        [HttpPut("update-status/{tripId}")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> UpdateStatus(int tripId, [FromBody] string status)
        {
            int loggedUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var trip = await _context.Trips
                .Include(t => t.Driver)
                .FirstOrDefaultAsync(t => t.TripId == tripId && t.Driver.UserId == loggedUserId);

            if (trip == null)
                return NotFound("Trip not found or not assigned to you");

            // Check if the requested status is valid
            // Now expecting "Active" (formerly "Ongoing")
            if (status != "Active" && status != "Completed")
            {
                return BadRequest("Invalid status update requested. Only 'Active' or 'Completed' allowed.");
            }

            // RULE: Planned → Active
            if (status == "Active" && trip.Status == "Planned")
            {
                trip.Status = "Active";
                trip.StartTime = DateTime.Now;
                // RULE: If trip is active, EndTime must be null
                trip.EndTime = null;
            }
            // RULE: Active → Completed
            else if (status == "Completed" && trip.Status == "Active")
            {
                trip.Status = "Completed";
                trip.EndTime = DateTime.Now; // Set EndTime upon completion
            }
            else
            {
                return BadRequest($"Invalid status transition from {trip.Status} to {status}.");
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Trip status updated successfully", trip });
        }

        /// <summary>
        /// Driver: Get a summary of completed trips and total hours driven.
        /// </summary>
        [HttpGet("driver-summary/{driverId}")]
        [Authorize(Roles = "Dispatcher, Driver")] // Both roles can view this
        public async Task<IActionResult> GetDriverTripSummary(int driverId)
        {
            // If the user is a Driver, enforce that they can only view their own summary
            if (User.IsInRole("Driver"))
            {
                int loggedUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == loggedUserId);

                if (driver == null || driver.DriverId != driverId)
                {
                    return Forbid("You are not authorized to view the summary for this DriverId.");
                }
            }

            // SQL Server stored procedure call
            var summary = await _context.DriverTripSummaries
                .FromSqlRaw("EXEC GetDriverTripSummary @DriverId = {0}", driverId)
                .ToListAsync();

            // The stored procedure returns one result set (a list with one element)
            var result = summary.FirstOrDefault();

            if (result == null)
            {
                return NotFound($"No trip summary found for Driver ID: {driverId}.");
            }

            return Ok(result);
        }


        // NEW/UPDATED: Dispatcher: Edit Trip details
        [HttpPut("{tripId}")]
        [Authorize(Roles = "Dispatcher")]
        public async Task<IActionResult> EditTrip(int tripId, [FromBody] Trip updatedTrip)
        {
            if (tripId != updatedTrip.TripId)
                return BadRequest("Trip ID mismatch.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingTrip = await _context.Trips.FindAsync(tripId);

            if (existingTrip == null)
                return NotFound("Trip not found. Cannot be deleted via edit.");

            // Check Driver/Vehicle existence:
            var driverExists = await _context.Drivers.AnyAsync(d => d.DriverId == updatedTrip.DriverId);
            if (!driverExists)
                return BadRequest("Invalid DriverId");

            var vehicleExists = await _context.Vehicles.AnyAsync(v => v.VehicleId == updatedTrip.VehicleId);
            if (!vehicleExists)
                return BadRequest("Invalid VehicleId");


            // Update the properties
            existingTrip.DriverId = updatedTrip.DriverId;
            existingTrip.VehicleId = updatedTrip.VehicleId;
            existingTrip.Source = updatedTrip.Source;
            existingTrip.Destination = updatedTrip.Destination;

            // Allow dispatcher to update times/remarks/status
            existingTrip.StartTime = updatedTrip.StartTime;

            // Check if the dispatcher explicitly provided a new status
            if (!string.IsNullOrEmpty(updatedTrip.Status))
            {
                // Validate new status is one of the allowed values
                string normalizedStatus = updatedTrip.Status.Trim();
                if (normalizedStatus != "Planned" && normalizedStatus != "Active" &&
                    normalizedStatus != "Completed" && normalizedStatus != "Cancelled")
                {
                    // IMPORTANT: You must update your DTO/Model validation to accept "Active"
                    return BadRequest($"Invalid status: {updatedTrip.Status}. Must be 'Planned', 'Active', 'Completed', or 'Cancelled'.");
                }

                // If the dispatcher sets a status, use it.
                existingTrip.Status = normalizedStatus;

                // Handle EndTime based on the new status:
                // Now using "Active"
                if (existingTrip.Status == "Completed")
                {
                    // If the dispatcher forces 'Completed', they must set EndTime
                    existingTrip.EndTime = updatedTrip.EndTime ?? existingTrip.EndTime ?? DateTime.Now;
                }
                else if (existingTrip.Status == "Active")
                {
                    // RULE: if trip is Active, EndTime must be null
                    existingTrip.EndTime = null;
                }
                else // Planned/Cancelled
                {
                    existingTrip.EndTime = updatedTrip.EndTime; // Can be null or set
                }
            }

            existingTrip.Remarks = updatedTrip.Remarks;


            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Trips.Any(e => e.TripId == tripId))
                {
                    return NotFound("Trip not found after concurrency check.");
                }
                throw;
            }

            return Ok(new { Message = "Trip updated successfully", existingTrip });
        }
    }
}