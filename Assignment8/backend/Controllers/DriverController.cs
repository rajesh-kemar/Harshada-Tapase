
using Logistics_9.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Logistics_9.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DriverController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DriverController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ Dispatcher: Get List of all drivers
        [HttpGet]
        [Authorize(Roles = "Dispatcher")]
        public async Task<IActionResult> GetAllDrivers()
        {
            var drivers = await _context.Drivers
                .Include(d => d.User)
                .ToListAsync();

            return Ok(drivers);
        }

        // ✅ Driver: View own driver profile
        [HttpGet("me")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> GetOwnProfile()
        {
            int loggedUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var driver = await _context.Drivers
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.UserId == loggedUserId);

            if (driver == null)
                return NotFound("Driver profile not found.");

            return Ok(driver);
        }

        [HttpPost]
        [Authorize(Roles = "Dispatcher")]
        public async Task<IActionResult> CreateDriver([FromBody] Driver driver)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FindAsync(driver.UserId);
            if (user == null)
                return BadRequest("Invalid UserId");

            driver.User = user;  // ✅ Attach User manually

            await _context.Drivers.AddAsync(driver);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Driver created successfully", driver });
        }


        // ✅ Dispatcher: Update Driver details
        [HttpPut("{id}")]
        [Authorize(Roles = "Dispatcher")]
        public async Task<IActionResult> UpdateDriver(int id, [FromBody] Driver updatedDriver)
        {
            var driver = await _context.Drivers.FindAsync(id);
            if (driver == null)
                return NotFound("Driver not found");

            driver.DriverName = updatedDriver.DriverName;
            driver.Experience = updatedDriver.Experience;
            driver.LicenceNumber = updatedDriver.LicenceNumber;

            _context.Drivers.Update(driver);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Driver updated successfully", driver });
        }

        // ✅ Dispatcher: Delete Driver
        [HttpDelete("{id}")]
        [Authorize(Roles = "Dispatcher")]
        public async Task<IActionResult> DeleteDriver(int id)
        {
            var driver = await _context.Drivers.FindAsync(id);
            if (driver == null)
                return NotFound("Driver not found");

            _context.Drivers.Remove(driver);
            await _context.SaveChangesAsync();

            return Ok("Driver deleted successfully");
        }
    }
}
