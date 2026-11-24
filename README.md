# QR Kod Tasarımcı

Tarayıcıda çalışan, ücretsiz bir QR kod tasarımcı. Sunucu, hesap ya da kurulum gerekmez; her şey
sayfanın içinde, bilgisayarında çalışır. Canlı hâli: <https://romsoft.com.tr/qr/>

## Özellikler

- **8 içerik türü:** web adresi/metin, Wi-Fi bağlantısı, kartvizit (kişi), telefon, e-posta,
  WhatsApp mesajı, SMS, konum.
- **Tasarım:** kod rengi, arka plan, nokta ve köşe biçimi, ortaya logo, hata düzeltme seviyesi
  (kontrast düşükse uyarı verir).
- **Hazır şablonlar:** Romsoft Kırmızı (varsayılan) ve Siyah.
- **Çıktı:** PNG, SVG ve PDF; 300 ile 2000 piksel arası boyut; kare, 4:3, 3:4, 16:9, 9:16 oranları;
  kodun altına ya da üstüne yazı.
- **Türkçe ve İngilizce** arayüz.
- **Gizlilik:** girdiğin içerik (Wi-Fi şifresi dahil) ve logon hiçbir yere gönderilmez ve saklanmaz.
  Tarayıcıda yalnızca tasarım ayarların hatırlanır.

> Üretilen kodu telefonunla bir kez okutup kontrol et. Tarayıcı içi doğrulama gerçek bir telefonun
> okumasını temsil etmez.

## Çalıştırma

Derleme adımı yoktur. Depoyu indirip `index.html` dosyasını tarayıcıda aç, ya da herhangi bir
statik sunucudan yayınla:

```bash
python -m http.server 8000
```

| Dosya | Görevi |
| --- | --- |
| `index.html` | Sayfa ve arayüz |
| `qr.js` | Kod üretimi, içerik türleri, dışa aktarma |
| `qr.html`, `style2.css` | Eski sayfa ve stil dosyası |
| `vendor/` | Üçüncü taraf kütüphaneler (CDN kullanılmaz), bkz. [THIRD-PARTY.md](THIRD-PARTY.md) |

## Lisans

Kod [MIT](LICENSE) lisanslıdır. "Romsoft" adı, logosu ve markası bu lisansın kapsamı dışındadır.
