# Love Contracts

Aşk sözleşmelerini dijital ortamda oluşturmanızı, yönetmenizi ve paylaşmanızı sağlayan modern bir web uygulaması.

## 🚀 Özellikler

- 📝 Gelişmiş WYSIWYG editör ile sözleşme oluşturma
- 👥 Partner davet sistemi ve ortak sözleşme yönetimi
- 📧 E-posta bildirimleri ve onay sistemi
- 🌓 Dark/Light tema desteği
- 💬 Yorum ve tartışma sistemi
- 📱 Responsive tasarım
- 🔒 JWT tabanlı güvenli kimlik doğrulama

## 🛠️ Teknolojiler

### Frontend
- React + Vite
- TailwindCSS + DaisyUI
- React Router
- React-Quill
- React DnD

### Backend
- Node.js + Express
- MySQL
- JWT Authentication
- Nodemailer

## 🚀 Kurulum

### Gereksinimler
- Node.js (v14+)
- MySQL
- npm veya yarn

### Backend Kurulumu
```bash
cd backend
npm install
cp .env.example .env  # .env dosyasını düzenleyin
npm run dev
```

### Frontend Kurulumu
```bash
cd frontend
npm install
npm run dev
```

### Veritabanı Kurulumu
1. MySQL'de yeni bir veritabanı oluşturun
2. `backend/config/schema.sql` dosyasını çalıştırın
3. `.env` dosyasında veritabanı bağlantı bilgilerini güncelleyin

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/verify` - Token doğrulama

### Contracts
- `GET /api/contracts` - Sözleşmeleri listele
- `POST /api/contracts` - Yeni sözleşme oluştur
- `GET /api/contracts/:id` - Sözleşme detayı
- `PUT /api/contracts/:id` - Sözleşme güncelle
- `DELETE /api/contracts/:id` - Sözleşme sil

### Templates
- `GET /api/templates` - Şablonları listele
- `GET /api/templates/:id` - Şablon detayı
- `POST /api/templates/:id/create-contract` - Şablondan sözleşme oluştur

## 🤝 Katkıda Bulunma

1. Bu repoyu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👥 Ekip

- [@The-mean](https://github.com/The-mean) - Proje Sahibi 