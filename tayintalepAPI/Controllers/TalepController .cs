using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TayinTalepAPI.Data;
using TayinTalepAPI.Helpers;
using TayinTalepAPI.Models;

namespace TayinTalepAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TalepController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TalepController> _logger;

        public TalepController(ApplicationDbContext context, ILogger<TalepController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetTalepler()
        {
            var kullaniciId = GetCurrentUserId();
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (kullaniciId == null)
            {
                _logger.LogWarning("GetTalepler: Kullanıcı ID alınamadı.");
                return Unauthorized();
            }

            if (role == "Yonetici")
            {
                var tumTalepler = await _context.Talepler
                    .Include(t => t.Kullanici)
                    .OrderByDescending(t => t.BasvuruTarihi)
                    .Select(t => new TalepDto
                    {
                        Id = t.Id,
                        Baslik = t.Baslik,
                        TalepTuru = t.TalepTuru,
                        HedefAdliye = t.HedefAdliye,
                        Durum = t.Durum,
                        BasvuruTarihi = t.BasvuruTarihi,
                        SicilNo = t.Kullanici.SicilNo,
                        AdSoyad = t.Kullanici.AdSoyad,
                        Unvan = t.Kullanici.Unvan
                    })
                    .ToListAsync();

                _logger.LogInformation("Yönetici {KullaniciId} tüm talepleri listeledi.", kullaniciId);
                return Ok(tumTalepler);
            }
            else
            {
                var talepler = await _context.Talepler
                    .Where(t => t.KullaniciId == kullaniciId.Value)
                    .Include(t => t.Kullanici)
                    .OrderByDescending(t => t.BasvuruTarihi)
                    .Select(t => new
                    {
                        t.Id,
                        AdSoyad = t.Kullanici.AdSoyad,
                        t.Baslik,
                        t.TalepTuru,
                        t.HedefAdliye,
                        t.Durum,
                        t.BasvuruTarihi
                    })
                    .ToListAsync();

                _logger.LogInformation("Kullanıcı {KullaniciId} {TalepSayisi} talebi listeledi.", kullaniciId, talepler.Count);
                return Ok(talepler);
            }
        }

        [HttpPost]
        [Authorize(Roles = "Personel")]
        public async Task<IActionResult> YeniTalep([FromBody] TalepOlusturDto dto)
        {
            var kullaniciId = GetCurrentUserId();
            if (kullaniciId == null)
                return Unauthorized();

            var validationResult = ValidateTalepDto(dto);
            if (validationResult != null)
                return validationResult;

            var kullanici = await _context.Kullanicilar.FindAsync(kullaniciId.Value);
            if (kullanici == null)
                return Unauthorized();

            var yeniTalep = new Talep
            {
                Baslik = dto.Baslik,
                TalepTuru = dto.TalepTuru,
                HedefAdliye = dto.HedefAdliye,
                Durum = "Beklemede",
                BasvuruTarihi = DateTime.Now,
                KullaniciId = kullaniciId.Value
            };

            _context.Talepler.Add(yeniTalep);

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Yeni talep oluşturuldu: {TalepId} - {KullaniciId}", yeniTalep.Id, kullaniciId);
                return Ok(new { yeniTalep.Id, yeniTalep.Baslik, yeniTalep.Durum });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep oluşturulurken hata: {KullaniciId}", kullaniciId);
                return StatusCode(500, "Talep oluşturulamadı.");
            }
        }

        [HttpPost("{id}/onayla")]
        [Authorize(Roles = "Yonetici")]
        public async Task<IActionResult> Onayla(int id)
        {
            return await UpdateTalepStatus(id, "Onaylandı");
        }

        [HttpPost("{id}/reddet")]
        [Authorize(Roles = "Yonetici")]
        public async Task<IActionResult> Reddet(int id)
        {
            return await UpdateTalepStatus(id, "Reddedildi");
        }

        private async Task<IActionResult> UpdateTalepStatus(int id, string yeniDurum)
        {
            var talep = await _context.Talepler.FindAsync(id);
            if (talep == null)
                return NotFound("Talep bulunamadı.");

            if (talep.Durum == yeniDurum)
                return BadRequest($"Talep zaten {yeniDurum.ToLower()} durumda.");

            talep.Durum = yeniDurum;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Talep {TalepId} durumu {YeniDurum} olarak güncellendi.", id, yeniDurum);
            return Ok($"Talep {yeniDurum.ToLower()}.");
        }

        private Guid? GetCurrentUserId()
        {
            var userIdString = User.FindFirstValue("id");
            return Guid.TryParse(userIdString, out var userId) ? userId : null;
        }

        private BadRequestObjectResult? ValidateTalepDto(TalepOlusturDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Baslik) ||
                string.IsNullOrWhiteSpace(dto.TalepTuru) ||
                string.IsNullOrWhiteSpace(dto.HedefAdliye))
            {
                return BadRequest("Başlık, talep türü ve hedef adliye boş olamaz.");
            }

            if (dto.Baslik.Length < 5 || dto.Baslik.Length > 100)
                return BadRequest("Başlık 5 ile 100 karakter arasında olmalıdır.");

            if (dto.Baslik.Contains("<script>", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Başlıkta geçersiz içerik tespit edildi.");

            var gecerliTalepTurleri = new[] { "Tayin", "Yer Değişikliği" };
            if (!gecerliTalepTurleri.Any(t => t.Equals(dto.TalepTuru, StringComparison.OrdinalIgnoreCase)))
                return BadRequest("Geçersiz talep türü.");

            var gecerliAdliyeler = AdliyeListesi.TumAdliyeler();
            if (!gecerliAdliyeler.Contains(dto.HedefAdliye))
                return BadRequest("Geçersiz hedef adliye.");

            return null;
        }
    }
}
