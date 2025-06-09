using System.ComponentModel.DataAnnotations;

namespace TayinTalepAPI.Models
{
    public class KullaniciLoginDto
    {
        [Required(ErrorMessage = "Sicil No gereklidir.")]
        public string SicilNo { get; set; }

        [Required(ErrorMessage = "Şifre gereklidir.")]
        public string Sifre { get; set; }
    }
}
