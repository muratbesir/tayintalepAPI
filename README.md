Personel Tayin Talebi Uygulaması

Bu proje, adliyede görev yapan personelin başka bir adliyeye tayin talebinde bulunabilmesini sağlayan web tabanlı bir sistemdir.
 Personel sisteme giriş yaparak yeni talep oluşturabilir, önceki taleplerini görüntüleyebilir ve taleplerin durumunu takip edebilir.
Yönetici ise bu talepleri görüntüleyebilir, onaylayabilir ve reddebilir.

 

 Kullanılan Teknolojiler

### Backend
- **ASP.NET Core Web API
- **Entity Framework Core
- **JWT Authentication
- **MSSQL
- **Katmanlı Mimari (API, Service, Repository, Entity, DTO)
- **Loglama ILogger)

### Frontend
- **React.js
- **Axios
- **React Router
- **Bootstrap
- **Responsive tasarım desteği

---

 Kurulum Talimatları

### Backend (.NET Core API)

1. **Veritabanını oluşturun:**
   - `appsettings.json` dosyasındaki bağlantı cümlesini (`ConnectionStrings:DefaultConnection`) 
2. **Veritabanı migrasyonları:**
   ```bash
3.dotnet ef database update
4.cd tayintalepAPI\tayintalepAPI\tayin-talep-frontend\
5.npm install
6.npm start



| Rol      | Sicil No | Şifre  |
| -------- | -------- | ------ |
| Yonetici | 000000   | 000000 |
| Personel | 288154   | 123456 |
| Personel | 295359   | 123456 |



 Temel Özellikler
Sicil numarası ve şifre ile giriş

JWT ile kimlik doğrulama

Personelin temel bilgilerini görüntüleyebilme

Yeni tayin talebi oluşturma

Daha önce oluşturulmuş talepleri listeleme

Her talep için:

Başvuru tarihi

Talep türü

Talep durumu

Hedef adliye

Sadece il merkezindeki 81 adliye üzerinden tercih yapılabilir

Loglama desteği (işlem takibi ve hata kaydı)


----------------------------------------------------------------------

📁 Proje Yapısı
 Backend (ASP.NET Core)

TayinTalepAPI/

├── Controllers/                    # API endpoint'lerini barındıran controller dosyaları

│   ├── AdliyeController.cs         # Adliye listesi (81 il) ile ilgili işlemleri içerir

│   ├── AuthController.cs           # Giriş işlemleri ve JWT token üretimi

│   ├── Class.cs                    # (Gereksizse kaldırılabilir) - genel sınıf

│   ├── KullaniciController.cs      # Kullanıcının temel bilgilerini dönen işlemler

│   ├── TalepController.cs          # Tayin taleplerini oluşturan ve listeleyen işlemler

│   ├── TayinController.cs          # Tayin talebi ile ilgili özel işlemler (gerekliyse)

│   ├── YoneticiController.cs       # Yönetici işlemleri (talepleri görüntüleme, onaylama)

│
├── Entities/                       # Entity sınıfları ve DTO'lar
│   ├── Kullanici.cs                # Kullanıcı entity'si (sicil no, ad-soyad, unvan vb.)
│   ├── Talep.cs                    # Talep entity'si (başlık, tür, durum, hedef adliye vb.)
│   ├── TayinTalebi.cs             # Alternatif ya da genişletilmiş talep modeli
│   ├── KullaniciLoginDto.cs       # Giriş işlemi için kullanılan DTO
│   ├── TalepCreateDto.cs          # Yeni talep oluşturmak için kullanılan DTO
│   ├── TalepDto.cs                # Taleplerin detaylı gösterimi için kullanılan DTO
│   ├── TalepOlusturDto.cs         # Yeni talep POST işleminde kullanılan DTO
│
├── Helpers/                        
│   └── JwtHelper.cs               # JWT token oluşturma ve doğrulama işlemleri
│
├── Data/
│   └── ApplicationDbContext.cs    # Entity Framework Core DbContext sınıfı
│
├── Logs/                          
│   └── (log-2025-06-09.txt)       # Hata ve işlem loglarının günlük olarak tutulduğu klasör
│
└── Program.cs                     # Uygulama başlatma ve servis yapılandırma dosyası
 Frontend (React.js)

React/
│
├── AdliyeSelect.js                # 81 il merkezindeki adliyeleri listeleyen dropdown bileşeni
├── Dashboard.js                   # Giriş sonrası yönlendirilen genel panel sayfası
├── KullaniciTaleplerPage.js       # Giriş yapan kullanıcının tüm taleplerini listeleyen sayfa
├── Layout.js                      # Tüm sayfalarda ortak kullanılan üst/yan menü düzeni
├── Login.js                       # Sicil numarası ve şifre ile giriş formu
├── Profil.js                      # Personelin temel bilgilerini gösteren bileşen
├── ProtectedRoute.js              # Kimliği doğrulanmamış kullanıcıyı girişe yönlendirir
├── Taleplerim.js                  # Kullanıcının önceki başvurularını gösteren bileşen
├── YeniTalepForm.js               # Yeni tayin talebi oluşturma formu
├── YoneticiTalepler.js            # Yöneticinin tüm talepleri görüntülediği yönetici ekranı
