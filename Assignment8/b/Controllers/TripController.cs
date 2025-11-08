
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
        // ✅ Get Active trips
        [HttpGet("active")]
        
        public async Task<IActionResult> GetActiveTrips()
        {
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
            var longTrips = await _context.Trips
                .Where(t => EF.Functions.DateDiffHour(t.StartTime, t.EndTime) > 8)
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

        // ✅ Driver: Update trip status (Planned → InProgress → Completed)
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
            if (status != "InProgress" && status != "Completed")
            {
                return BadRequest("Invalid status update requested.");
            }

            if (status == "InProgress" && trip.Status == "Planned")
            {
                trip.Status = "InProgress";
                trip.StartTime = DateTime.Now;
                // RULE: If trip is in progress, EndTime must be null
                trip.EndTime = null;
            }
            else if (status == "Completed" && trip.Status == "InProgress")
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
        // Inside TripController

        // Inside TripController

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

            //// SQL Server stored procedure call
            //var summary = await _context.Set<DriverTripSummaryDto>()
            //    .FromSqlRaw("EXEC GetDriverTripSummary @DriverId = {0}", driverId)
            //    .ToListAsync();

            // SQL Server stored procedure call
            var summary = await _context.DriverTripSummaries
                .FromSqlRaw("EXEC GetDriverTripSummary @DriverId = {0}", driverId)
                .ToListAsync();

            // The stored procedure returns one result set (a list with one element)
            var result = summary.FirstOrDefault();

            if (result == null)
            {
                // If the driver exists but has no completed trips, the procedure returns one row with zeros.
                // This case should not strictly happen if the SP is written as suggested, but serves as a safeguard.
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
                // RULE: Trip should not be deleted, so we return 404/NotFound if it doesn't exist.
                return NotFound("Trip not found. Cannot be deleted via edit.");

            // RULE: Allow editing of ALL trips (Planned, InProgress, Completed, Cancelled)
            // We only need to check Driver/Vehicle existence:
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

            // RULE: Driver/Vehicle change means the trip remains as is.

            // Allow dispatcher to update times/remarks/status
            existingTrip.StartTime = updatedTrip.StartTime;

            // Check if the dispatcher explicitly provided a new status
            if (!string.IsNullOrEmpty(updatedTrip.Status))
            {
                // If the dispatcher sets a status, use it.
                existingTrip.Status = updatedTrip.Status;

                // Handle EndTime based on the new status:
                if (existingTrip.Status == "Completed")
                {
                    // If the dispatcher forces 'Completed', they must set EndTime
                    existingTrip.EndTime = updatedTrip.EndTime ?? DateTime.Now;
                }
                else if (existingTrip.Status == "InProgress")
                {
                    // RULE: if trip is InProgress/Ongoing, EndTime must be null
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

