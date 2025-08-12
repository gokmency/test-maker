# Test Maker - PDF'den Soru Seçimi ve Test Oluşturma Aracı

Öğretmenlerin PDF dosyalarından soruları seçerek profesyonel test kitapçıkları oluşturabileceği modern web uygulaması.

## 🚀 Özellikler

### ✅ Tamamlanan Özellikler
- **PDF Yükleme ve Görüntüleme**: PDF dosyalarını yükleyip sayfa sayfa görüntüleme
- **Soru Seçimi**: PDF üzerinde fare ile kare çizerek soruları seçme
- **Drag & Drop**: Seçilen soruları sürükle-bırak ile yeniden sıralama
- **Profesyonel PDF Export**: Seçilen sorulardan test kitapçığı oluşturma
- **Responsive Tasarım**: Tüm cihazlarda uyumlu arayüz
- **Test Şablonları**: Özelleştirilebilir test başlığı, okul, öğretmen bilgileri

### 🔧 Teknik Özellikler
- **React 18 + TypeScript**: Modern ve tip güvenli geliştirme
- **Vite**: Hızlı development ve build
- **Shadcn/UI**: Modern ve erişilebilir UI bileşenleri
- **React PDF**: PDF görüntüleme ve işleme
- **Fabric.js**: Canvas üzerinde interaktif soru seçimi
- **jsPDF**: Profesyonel PDF oluşturma
- **DND Kit**: Drag & drop sıralama
- **Tailwind CSS**: Responsive ve modern tasarım

## 🛠 Kurulum

```bash
# Projeyi klonla
git clone [repo-url]
cd question-extractor

# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev
```

## 📖 Kullanım

### 1. PDF Yükleme
- Ana sayfada "Dosya Seç" butonuna tıklayın
- Veya PDF dosyasını sürükleyip bırakın
- Desteklenen format: PDF (Maksimum 50MB)

### 2. Soru Seçimi
- PDF yüklendikten sonra "Soru Seç" butonuna tıklayın
- PDF üzerinde fare ile kare çizerek soruları seçin
- Seçilen sorular sağ panelde görüntülenir

### 3. Soru Düzenleme
- Sağ panelde soruları sürükle-bırak ile yeniden sıralayın
- İstenmeyen soruları çöp kutusu simgesi ile silin

### 4. Test Oluşturma
- Test ayarları bölümünde:
  - Test başlığını girin
  - Okul/kurum adını yazın
  - Sınıf/şube bilgisini ekleyin
  - Öğretmen adını girin
  - Süreyi belirleyin
- "PDF Test Kitapçığı Oluştur" butonuna tıklayın

## 🎯 MVP Kapsamı

### Dahil Edilenler ✅
- [x] PDF yükleme ve görüntüleme
- [x] Basit kare çizme ile soru seçimi  
- [x] Seçilen soruları listeleme
- [x] Drag & drop ile sıralama
- [x] Temel test şablonu
- [x] PDF export
- [x] Responsive tasarım

### Gelecek Versiyonlar 🔄
- [ ] Çoklu PDF desteği
- [ ] Gelişmiş soru editörü
- [ ] Soru kategorileri
- [ ] Template kaydetme
- [ ] Kullanıcı hesapları

## 🏗 Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── PDFUploader.tsx  # PDF yükleme
│   ├── PDFViewer.tsx    # PDF görüntüleme ve soru seçimi
│   ├── QuestionPanel.tsx # Soru listesi ve test ayarları
│   └── ui/              # Shadcn UI bileşenleri
├── hooks/               # Custom hook'lar
│   └── usePDFExport.ts  # PDF export işlemleri
├── types/               # TypeScript tip tanımları
│   └── test.ts          # Test ve soru tipleri
└── pages/               # Sayfa bileşenleri
    └── TestMaker.tsx    # Ana uygulama sayfası
```

## 🎨 Tasarım Sistemi

### Renk Paleti
- **Primary**: #4F46E5 (Indigo)
- **Secondary**: #059669 (Emerald) 
- **Accent**: #DC2626 (Red)
- **Background**: #F9FAFB (Gray-50)
- **Text**: #111827 (Gray-900)

## 📱 Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1279px  
- **Desktop**: ≥ 1280px

## 🚀 Build ve Deploy

```bash
# Production build
npm run build

# Build'i önizle
npm run preview
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Test Maker** - Eğitimde teknoloji kullanımını kolaylaştıran modern araç 🎓

## Original Lovable Project Info

**URL**: https://lovable.dev/projects/bbd491d7-6d06-4bce-b66a-62442b82dd62

This project is built with:
- Vite
- TypeScript  
- React
- shadcn-ui
- Tailwind CSS