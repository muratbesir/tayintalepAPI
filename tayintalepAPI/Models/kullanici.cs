using System;
using System.Collections.Generic;

namespace TayinTalepAPI.Models
{
    public class Kullanici
    {
        public Guid Id { get; set; }
        public string SicilNo { get; set; }
        public string Sifre { get; set; }
        public string AdSoyad { get; set; }
        public string Unvan { get; set; }
        public string Rol { get; set; }
        public string CalistigiKurum { get; set; }
        public ICollection<Talep> Talepler { get; set; }
        public ICollection<TayinTalebi> TayinTalepleri { get; set; }

    }
}
