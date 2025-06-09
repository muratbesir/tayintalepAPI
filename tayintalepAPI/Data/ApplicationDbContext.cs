using Microsoft.EntityFrameworkCore;
using TayinTalepAPI.Models;

namespace TayinTalepAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Kullanici> Kullanicilar { get; set; }
        public DbSet<Talep> Talepler { get; set; }
        public DbSet<TayinTalebi> TayinTalepleri { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Kullanici>().HasData(new Kullanici
            {
                Id = Guid.Parse("a1b2c3d4-e5f6-7890-1234-56789abcdef0"), // Sabit GUID
                SicilNo = "999999",
                Sifre = "admin123",
                AdSoyad = "Admin Kullanıcı",
                Unvan = "Yönetici",
                Rol = "Yonetici",
                CalistigiKurum = "Genel Yönetim"
            });
            modelBuilder.Entity<Kullanici>()
                .HasMany(k => k.Talepler)
                .WithOne(t => t.Kullanici)
                .HasForeignKey(t => t.KullaniciId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Kullanici>()
                .HasMany(k => k.TayinTalepleri)
                .WithOne(tt => tt.Kullanici)
                .HasForeignKey(tt => tt.KullaniciId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
