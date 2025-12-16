# MedTech Mobile

Tıbbi cihaz servis takip uygulamasının mobil versiyonu.

## Özellikler

- 📱 iOS ve Android desteği
- 🔐 Kullanıcı kimlik doğrulama
- 📋 Servis raporu oluşturma ve düzenleme
- 📷 QR kod ile cihaz bilgisi çekme
- 📊 Rapor listesi ve detay görüntüleme
- ⚙️ Ayarlar ve profil yönetimi

## Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS için: Xcode (Mac gerekli)
- Android için: Android Studio veya Expo Go uygulaması

### Adımlar

1. Bağımlılıkları yükleyin:
```bash
cd MedtechMobile
npm install
```

2. Uygulamayı başlatın:
```bash
npm start
```

3. Expo Go uygulamasını telefonunuza indirin ve QR kodu taratın.

## API Ayarları

`src/services/api.ts` dosyasında API sunucu adresini güncelleyin:

```typescript
const API_BASE_URL = 'http://YOUR_IP:3001/api';
```

> **Not:** Mobil cihazdan erişim için `localhost` yerine bilgisayarınızın yerel IP adresini kullanın.

## Proje Yapısı

```
MedtechMobile/
├── App.tsx                 # Ana uygulama ve navigasyon
├── src/
│   ├── context/
│   │   └── AuthContext.tsx # Kimlik doğrulama
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── ReportFormScreen.tsx
│   │   ├── ReportDetailScreen.tsx
│   │   ├── QRScannerScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/         # Paylaşılan bileşenler
│   └── services/
│       └── api.ts          # API iletişimi
└── assets/                 # Görseller
```

## Geliştirme

```bash
# iOS simülatörde çalıştır
npm run ios

# Android emülatörde çalıştır
npm run android

# Web tarayıcıda çalıştır
npm run web
```
