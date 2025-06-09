using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TayinTalepAPI.Data;
using TayinTalepAPI.Models;

namespace TayinTalepAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TayinController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TayinController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/tayin
        [HttpGet]
        public IActionResult GetTayinlar()
        {
            // Token'dan kullanıcı id'sini alalım
            var kullaniciId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (kullaniciId == null) return Unauthorized();

            var tayinlar = _context.TayinTalepleri
                .Where(t => t.KullaniciId == Guid.Parse(kullaniciId))
                .ToList();

            return Ok(tayinlar);
        }

        // POST: api/tayin
        [HttpPost]
        public IActionResult YeniTayinTalebi([FromBody] TayinTalebi yeniTayin)
        {
            var kullaniciId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (kullaniciId == null) return Unauthorized();

            yeniTayin.KullaniciId = Guid.Parse(kullaniciId);
            yeniTayin.BasvuruTarihi = DateTime.Now;

            _context.TayinTalepleri.Add(yeniTayin);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetTayinlar), new { id = yeniTayin.Id }, yeniTayin);
        }
    }
}
