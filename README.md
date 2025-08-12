# 🎓 Test Maker MVP

**PDF'den profesyonel test kitapçıkları oluşturan web tabanlı araç**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/gokmency/testmaker)
[![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Özellikler

### 🚀 **Ana Özellikler**
- **Multi-PDF Desteği** - Birden fazla PDF'den soru seçimi
- **Akıllı Soru Seçimi** - Fare ile kare çizerek soru crop etme
- **Profesyonel PDF Export** - A4 formatında test kitapçığı
- **Önizleme Sistemi** - İndirmeden önce PDF kontrolü
- **Türkçe Karakter Desteği** - Tam Türkçe dil desteği

### 🎯 **Soru Yönetimi**
- **Drag & Drop** - Soruları yeniden sıralama
- **Çoklu Seçim** - Birden fazla soru seçimi
- **Onay Sistemi** - Seçilen soruları onaylama/iptal etme
- **PDF Bilgisi** - Her sorunun hangi PDF'den geldiği

### 📋 **Test Şablonu**
- **Okul Bilgileri** - Okul adı, sınıf, öğretmen
- **Sınav Detayları** - Başlık, tarih, süre, puan
- **Numaralandırma** - Sayısal (1,2,3...) veya alfabetik (a,b,c...)
- **Özelleştirilebilir** - Tüm alanlar düzenlenebilir

## 🛠️ Teknoloji Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Shadcn/ui
- **PDF Rendering**: React-PDF (PDF.js)
- **PDF Generation**: jsPDF
- **Drag & Drop**: @dnd-kit
- **State Management**: React Hooks
- **Package Manager**: Yarn

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ 
- Yarn (önerilen) veya npm

### Adımlar
```bash
# Repository'yi klonla
git clone https://github.com/gokmency/testmaker.git
cd testmaker

# Bağımlılıkları yükle
yarn install

# Geliştirme sunucusunu başlat
yarn dev

# Tarayıcıda aç
open http://localhost:8080
```

## 📱 Kullanım

### 1. **PDF Yükleme**
- Sol panelden PDF dosyalarını sürükle & bırak
- Veya "Dosya Seç" butonuna tıkla
- Birden fazla PDF ekleyebilirsin

### 2. **Soru Seçimi**
- PDF'i seç ve "Soru Seç" moduna geç
- Fare ile kare çizerek soruları seç
- Onay/iptal butonlarıyla soruları yönet

### 3. **Test Oluşturma**
- Sağ panelde test bilgilerini doldur
- "Önizle" ile PDF'i kontrol et
- "İndir" ile test kitapçığını al

## 🎨 Ekran Görüntüleri

```
┌─────────────┬─────────────────┬─────────────┐
│ PDF Dosyaları │    PDF Viewer   │   Sorular   │
│             │                 │             │
│ • Matematik │ [PDF CONTENT]   │ 1. [IMG]    │
│ • Fizik     │                 │ 2. [IMG]    │
│ • Kimya     │ [Soru Seçimi]   │ 3. [IMG]    │
│             │                 │             │
│ [+ PDF Ekle]│                 │ [Önizle]    │
│             │                 │ [İndir]     │
└─────────────┴─────────────────┴─────────────┘
```

## 🔧 Geliştirme

### Proje Yapısı
```
src/
├── components/          # UI Components
│   ├── PDFSelector.tsx # PDF yönetimi
│   ├── PDFViewer.tsx   # PDF görüntüleme
│   ├── QuestionPanel.tsx # Soru yönetimi
│   └── ui/             # Shadcn/ui components
├── hooks/               # Custom hooks
│   └── usePDFExport.ts # PDF export logic
├── pages/               # Sayfa components
│   └── TestMaker.tsx   # Ana uygulama
├── types/               # TypeScript types
│   └── test.ts         # Interface definitions
└── styles/              # CSS styles
```

### Scripts
```bash
yarn dev          # Geliştirme sunucusu
yarn build        # Production build
yarn preview      # Build önizleme
yarn lint         # Linting kontrolü
```

## 🎯 Gelecek Özellikler

- [ ] **Soru Kategorileri** - Matematik, Fizik, Tarih vb.
- [ ] **Zorluk Seviyeleri** - Kolay, Orta, Zor
- [ ] **Soru Bankası** - Soruları kaydetme ve yönetme
- [ ] **Test Şablonları** - Hazır formatlar
- [ ] **İstatistikler** - Kullanım analizi
- [ ] **Paylaşım** - Test şablonlarını paylaşma

## 🤝 Katkıda Bulunma

1. Fork yap
2. Feature branch oluştur (`git checkout -b feature/amazing-feature`)
3. Commit yap (`git commit -m 'Add amazing feature'`)
4. Push yap (`git push origin feature/amazing-feature`)
5. Pull Request aç

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

**Gökmen** - [GitHub](https://github.com/gokmency)

---

⭐ Bu projeyi beğendiysen yıldız vermeyi unutma!