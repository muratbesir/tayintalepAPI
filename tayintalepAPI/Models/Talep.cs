using System;
using System.Text.Json.Serialization;

namespace TayinTalepAPI.Models
{
    public class Talep
    {
        public int Id { get; set; } 
        public string Baslik { get; set; }
        public string Durum { get; set; }
        public DateTime BasvuruTarihi { get; set; }
        public string TalepTuru { get; set; }
        public Guid KullaniciId { get; set; }
        public string HedefAdliye { get; set; }

        [JsonIgnore]
        public Kullanici Kullanici { get; set; }
    }
}
