using Logistics.Models;
using Microsoft.EntityFrameworkCore;

namespace Logistics.Data
{
public class LogisticsDbContext : DbContext
    {
        public LogisticsDbContext(DbContextOptions<LogisticsDbContext> options) : base(options) { }

        public DbSet<Driver> Drivers { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Trip> Trips { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Trip>()
                .HasOne(t => t.Driver)
                .WithMany(d => d.Trips)
                .HasForeignKey(t => t.DriverId)
                .OnDelete(DeleteBehavior.SetNull); // Prevent trip deletion when driver is removed

            modelBuilder.Entity<Trip>()
                .HasOne(t => t.Vehicle)
                .WithMany(v => v.Trips)
                .HasForeignKey(t => t.VehicleId)
                .OnDelete(DeleteBehavior.SetNull); // Prevent trip deletion when vehicle is removed
        }
    }

}

