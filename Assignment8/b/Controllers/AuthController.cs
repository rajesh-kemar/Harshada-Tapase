using Logistics_9.Dto;
using Logistics_9.Models;
using Logistics_9.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace Logistics_9.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly JwtService _jwt;
        private readonly PasswordHasher<User> _passwordHasher;

        public AuthController(AppDbContext context, JwtService jwt)
        {
            _context = context;
            _jwt = jwt;
            _passwordHasher = new PasswordHasher<User>();
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // basic uniqueness checks
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Email already registered.");
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                return BadRequest("Username already taken.");

            // create user entity
            var user = new User
            {
                Name = dto.Name,
                Username = dto.Username,
                Email = dto.Email,
                Role = dto.Role // "Driver" or "Dispatcher"
            };

            // hash password
            user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

            // use transaction so user+driver are atomic
            using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Users.Add(user);
                await _context.SaveChangesAsync(); // user.UserId now set

                // if role is Driver, create driver row
                if (dto.Role.Equals("Driver", StringComparison.OrdinalIgnoreCase))
                {
                    // validate driver fields
                    if (!dto.Experience.HasValue || string.IsNullOrWhiteSpace(dto.LicenceNumber))
                    {
                        // either: reject or create and expect user to complete later
                        // we'll reject to ensure driver data present
                        await tx.RollbackAsync();
                        return BadRequest("Driver fields (Experience, LicenceNumber) are required for role Driver.");
                    }

                    var driver = new Driver
                    {
                        UserId = user.UserId,
                        DriverName = user.Name,
                        Experience = dto.Experience.Value,
                        LicenceNumber = dto.LicenceNumber
                    };

                    _context.Drivers.Add(driver);
                    await _context.SaveChangesAsync();
                }

                await tx.CommitAsync();

                // optionally generate token on register
                var token = _jwt.GenerateToken(user);

                return Ok(new
                {
                    message = "Registered successfully",
                    userId = user.UserId,
                    token
                });
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, ex.Message);
            }
        }

        // ✅ LOGIN — Use the injected PasswordHasher to verify the password securely
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Username == dto.Username);

            if (user == null)
                return Unauthorized("Invalid username or password");

            // Use the injected _passwordHasher.VerifyHashedPassword method
            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);

            if (result == PasswordVerificationResult.Failed)
                return Unauthorized("Invalid username or password");

            var token = _jwt.GenerateToken(user);

            return Ok(new { Token = token, Role = user.Role, Username = user.Username, UserId = user.UserId });
        }

        // ✅ Validate token from frontend
        [HttpGet("validate")]
        public IActionResult ValidateToken()
        {
            var username = User.Identity?.Name ?? "Unknown";
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "NoRole";

            return Ok(new { message = "Token is valid", username, role });
        }




        // ---- Utility Methods ----

        private string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private bool VerifyPassword(string password, string storedHash)
        {
            var hash = HashPassword(password);
            return hash == storedHash;
        }
    }
}

  
