using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TayinTalepAPI.Data;

namespace TayinTalepAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Yonetici")]
    public class YoneticiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<YoneticiController> _logger;

        public YoneticiController(ApplicationDbContext context, ILogger<YoneticiController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Tüm talepleri listele
        [HttpGet("talepler")]
        public async Task<IActionResult> TumTalepleriGetir()
        {
            try
            {
                _logger.LogInformation("Yönetici tüm talepler çağrıldı.");
                var talepler = await _context.Talepler
                    .Include(t => t.Kullanici)
                    .Select(t => new TalepDto
                    {
                        Id = t.Id,
                        Baslik = t.Baslik,
                        Durum = t.Durum,
                        BasvuruTarihi = t.BasvuruTarihi,
                        TalepTuru = t.TalepTuru,
                        HedefAdliye = t.HedefAdliye,
                        SicilNo = t.Kullanici != null ? t.Kullanici.SicilNo : null,
                        AdSoyad = t.Kullanici != null && t.Kullanici.AdSoyad != null && t.Kullanici.AdSoyad != "" ? t.Kullanici.AdSoyad : "Bilinmiyor",
                        Unvan = t.Kullanici != null ? t.Kullanici.Unvan : null,
                    })
                    .ToListAsync();


                return Ok(talepler);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "TumTalepleriGetir metodu çalışırken hata oluştu.");
                return StatusCode(500, "Talepler alınamadı: " + ex.Message);
            }
        }

        // Talep onayla
        [HttpPost("talep-onayla/{id}")]
        public async Task<IActionResult> TalepOnayla(int id)
        {
            var talep = await _context.Talepler.FindAsync(id);
            if (talep == null)
                return NotFound(new { message = "Talep bulunamadı." });

            talep.Durum = "Onaylandı";
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Talep {id} başarıyla onaylandı." });
        }

        // Talep reddet
        [HttpPost("talep-reddet/{id}")]
        public async Task<IActionResult> TalepReddet(int id)
        {
            var talep = await _context.Talepler.FindAsync(id);
            if (talep == null)
                return NotFound(new { message = "Talep bulunamadı." });

            talep.Durum = "Reddedildi";
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Talep {id} reddedildi." });
        }
    }
}
