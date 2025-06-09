using System;

namespace TayinTalepAPI.Models
{
    public class TayinTalebi
    {
        public int Id { get; set; }
        public Guid KullaniciId { get; set; }
        public string Adliye { get; set; }
        public DateTime BasvuruTarihi { get; set; }
        public string TalepTuru { get; set; }
        public Kullanici Kullanici { get; set; }
    }
}
