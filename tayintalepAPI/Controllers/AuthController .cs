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
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(ApplicationDbContext context, IConfiguration configuration, ILogger<AuthController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] KullaniciLoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.SicilNo) || string.IsNullOrWhiteSpace(dto.Sifre))
            {
                return BadRequest("Sicil numarası ve şifre boş olamaz.");
            }

            var kullanici = await _context.Kullanicilar
                .FirstOrDefaultAsync(k => k.SicilNo == dto.SicilNo && k.Sifre == dto.Sifre);

            if (kullanici == null)
            {
                _logger.LogWarning("Başarısız giriş denemesi: {SicilNo}", dto.SicilNo);
                return Unauthorized("Sicil numarası veya şifre hatalı.");
            }

            // Consistent role assignment
            var rol = DetermineUserRole(kullanici);

            _logger.LogInformation("Başarılı giriş: {SicilNo}, Rol: {Rol}", kullanici.SicilNo, rol);

            var token = GenerateJwtToken(kullanici, rol);

            return Ok(new { Token = token });
        }

        [HttpGet("profil")]
        [Authorize]
        public async Task<IActionResult> Profil()
        {
            var kullaniciId = GetCurrentUserId();
            if (kullaniciId == null)
                return Unauthorized();

            var kullanici = await _context.Kullanicilar
                .Where(k => k.Id == kullaniciId.Value)
                .Select(k => new {
                    k.Id,
                    k.AdSoyad,
                    k.SicilNo,
                    k.Unvan,
                    k.CalistigiKurum
                })
                .FirstOrDefaultAsync();

            if (kullanici == null)
                return NotFound("Kullanıcı bulunamadı");

            return Ok(kullanici);
        }

        private static string DetermineUserRole(Kullanici kullanici)
        {
            // Use the Rol property if it exists, otherwise determine from Unvan
            if (!string.IsNullOrEmpty(kullanici.Rol))
                return kullanici.Rol;

            if (!string.IsNullOrEmpty(kullanici.Unvan) &&
                kullanici.Unvan.Contains("yonetici", StringComparison.OrdinalIgnoreCase))
            {
                return "Yonetici";
            }

            return "Personel";
        }

        private string GenerateJwtToken(Kullanici kullanici, string rol)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = jwtSettings["Key"];

            if (string.IsNullOrEmpty(key))
                throw new Exception("JWT Key yapılandırması eksik!");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, kullanici.Id.ToString()),
                new Claim(ClaimTypes.Name, kullanici.SicilNo),
                new Claim("AdSoyad", kullanici.AdSoyad),
                new Claim(ClaimTypes.Role, rol)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(jwtSettings["ExpiresInMinutes"])),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private Guid? GetCurrentUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userIdString, out var userId))
                return userId;
            return null;
        }
    }
}