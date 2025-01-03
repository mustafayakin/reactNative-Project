# Hasta Tahlil Uygulaması

Bu proje, doktorların hasta tahlillerini girmesi, düzenlemesi ve görüntülemesi için bir mobil uygulama geliştirilmesini amaçlamaktadır. Uygulama Firebase Realtime Database kullanılarak geliştirilmiştir ve React Native ile tasarlanmıştır.

---

## Uygulama Özellikleri

### 1. Kullanıcı Seçimi
- Doktor, kullanıcı adıyla bir hasta araması yapabilir.
- Hasta arama sırasında, arama kutusuna yazılmaya başlandığında uygun hastalar liste şeklinde aşağıda görüntülenir.
- Hasta seçildikten sonra, seçilen hasta bilgileri temizlenebilir.
- Hasta temizleme işlemi sonrası yeniden kullanıcı seçimi yapılabilir.

### 2. Tahlil Listesi
- Hasta seçildiğinde, o hastaya ait tüm tahliller eski tarihten yeni tarihe sıralanarak listelenir.
- Liste içerisinde:
  - Tahlil tarihi "Tarihli Tahlil" ifadesiyle gösterilir.
  - Tahlilin üzerine tıklandığında tahlil detayları açılır.
  - Tahliller bir önceki tahlile göre kıyaslanır:
    - Artış gösteren değerler yeşil yukarı ok ile.
    - Azalan değerler kırmızı aşağı ok ile.
    - Aynı kalan değerler gri yatay çizgi ile.
    - Daha önce olmayan bir değer girildiğinde turuncu soru işareti ile belirtilir.

### 3. Tahlil Detayları
- Tahlilin detayları açıldığında, şu bilgiler gösterilir:
  - Tahlil değerleri (IgA, IgG vb.)
  - Doktor notu (notes)
- Detaylar ekranında "Düzenle" ve "Sil" butonları bulunur:
  - **Düzenle:** Tahlil düzenleme ekranı açılır. Burada doktor tahlil değerlerini ve notları düzenleyebilir.
  - **Sil:** Tahlil Firebase’den tamamen kaldırılır.

### 4. Tahlil Düzenleme
- Doktor tahlil düzenlerken:
  - Kullanıcı `user_id` bilgisi düzenlenemez.
  - Tüm tahlil değerleri ve doktor notu düzenlenebilir.
  - Düzenleme tamamlandığında Firebase Realtime Database’e kaydedilir.
  - Düzenleme sonrası ekran temizlenir ve hasta listesi yeniden başlatılır.

---

## Kullanılan Teknolojiler ve Kütüphaneler
- **React Native**: Mobil uygulama geliştirme.
- **Firebase Realtime Database**: Tahlil verilerinin saklanması ve yönetimi.
- **React Native FlatList**: Tahlil listesinin performanslı şekilde görüntülenmesi.
- **React Native ScrollView**: Tahlil düzenleme ekranında kaydırma özelliği.
- **React Native Community DateTimePicker**: Tarih seçimi için.

---

## Kurulum Adımları

1. **Gereksinimler:**
   - Node.js ve npm/yarn kurulu olmalı.
   - Firebase projesi oluşturulmuş ve konfigürasyon ayarları alınmış olmalı.

2. **Depoyu Klonlayın:**
   ```bash
   git clone https://github.com/mustafayakin/reactNative-Project
   cd reactNative-Project
---

## Firebase Veritabanı Yapısı

1. **Users Table:**

"users": {
  "user_id_1": {
    "name": "Ali",
    "yetki_id": 0
  },
  "user_id_2": {
    "name": "Veli",
    "yetki_id": 0
  }
}

2. **Test Table:**

"tests": {
  "test_id_1": {
    "user_id": "user_id_1",
    "test_date": "2024-01-01",
    "IgG": 12.5,
    "IgG1": 5.8,
    "IgG2": 4.3,
    "IgG3": 1.2,
    "IgG4": 0.7,
    "IgA": 10.4,
    "IgA1": 7.8,
    "IgA2": 2.3,
    "IgM": 6.5,
    "notes": "Değerler normal."
  }
}

---

---

