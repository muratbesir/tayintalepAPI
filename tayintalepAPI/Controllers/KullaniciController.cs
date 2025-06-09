using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TayinTalepAPI.Data;
using TayinTalepAPI.Models;

namespace TayinTalepAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class KullaniciController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<KullaniciController> _logger;

        public KullaniciController(ApplicationDbContext context, IConfiguration configuration, ILogger<KullaniciController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpGet("profil")]
        [Authorize]
        public async Task<IActionResult> Profil()
        {
            var sicilNo = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(sicilNo))
            {
                return Unauthorized();
            }

            var kullanici = await _context.Kullanicilar
                .Where(k => k.SicilNo == sicilNo)
                .Select(k => new {
                    k.AdSoyad,
                    k.SicilNo,
                    k.Unvan
                })
                .FirstOrDefaultAsync();

            if (kullanici == null)
                return NotFound("Kullanıcı bulunamadı");

            return Ok(kullanici);
        }

        [HttpPost]
        public async Task<IActionResult> Ekle([FromBody] Kullanici yeniKullanici)
        {
            if (yeniKullanici == null)
                return BadRequest("Kullanıcı bilgileri eksik.");

            _context.Kullanicilar.Add(yeniKullanici);
            await _context.SaveChangesAsync();

            return Ok(yeniKullanici);
        }

        [HttpPost("giris")]
        public IActionResult Giris([FromBody] KullaniciLoginDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.SicilNo) || string.IsNullOrWhiteSpace(dto.Sifre))
            {
                return BadRequest("Sicil numarası ve şifre boş olamaz.");
            }

            var kullanici = _context.Kullanicilar
                .FirstOrDefault(x => x.SicilNo == dto.SicilNo && x.Sifre == dto.Sifre);

            if (kullanici == null)
                return Unauthorized("Sicil numarası veya şifre hatalı.");

            var rol = "Personel";
            if (!string.IsNullOrEmpty(kullanici.Unvan) && kullanici.Unvan.Contains("yonetici", StringComparison.OrdinalIgnoreCase))
            {
                rol = "Yonetici";
            }

            _logger.LogInformation("Kullanıcı unvanı: {Unvan}, Atanan rol: {Rol}", kullanici.Unvan, rol);

            var jwtSettings = _configuration.GetSection("Jwt");
            var key = jwtSettings["Key"];

            if (string.IsNullOrEmpty(key))
            {
                _logger.LogError("JWT Key yapılandırması eksik.");
                return StatusCode(500, "Sunucu yapılandırmasında hata var.");
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim("id", kullanici.Id.ToString()),
                new Claim(ClaimTypes.Name, kullanici.SicilNo),
                new Claim(ClaimTypes.Role, rol)
            };

            // ExpiresInMinutes güvenli şekilde parse edilir
            var expiresInMinutesString = jwtSettings["ExpiresInMinutes"];
            if (!double.TryParse(expiresInMinutesString ?? "", out var expiresInMinutes))
            {
                expiresInMinutes = 30; // Varsayılan 30 dakika
            }

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiresInMinutes),
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new { Token = tokenString });
        }
    }
}
