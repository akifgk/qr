/* Romsoft QR kod tasarımcı — arayüz ve üretim mantığı.
   Kütüphaneler vendor/ altında (qr-code-styling, jsPDF); dışarıdan yüklenen bir şey yok. */
(function () {
    'use strict';

    const $ = id => document.getElementById(id);
    const store = {
        get(k) { try { return localStorage.getItem(k); } catch { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch { /* özel pencere vb. */ } },
        del(k) { try { localStorage.removeItem(k); } catch { /* */ } }
    };
    const FONT = "'Archivo','Segoe UI',Arial,sans-serif";
    const KAYIT = 'romsoft.qr.v2';

    let lang = store.get('romsoft.lang') || ((navigator.language || 'tr').startsWith('tr') ? 'tr' : 'en');
    if (lang !== 'tr' && lang !== 'en') lang = 'tr';

    /* ---------- Metinler ----------
       Sayfadaki sabit Türkçe metinler HTML'de durur (ilk açılışta yakalanır); burada
       yalnız JS'in ürettiği Türkçe metinler ile bütün İngilizce karşılıklar var. */
    const TR = {
        'pn.red': 'Romsoft Kırmızı', 'pn.black': 'Romsoft Siyah', 'pn.nebula': 'Romsoft Nebula',
        'pn.neon': 'Neon', 'pn.gold': 'Altın', 'pn.emerald': 'Zümrüt', 'pn.dark': 'Siyah zemin',
        'shape': 'Şekil', 'ctype': 'Renk türü', 'c.single': 'Tek renk', 'c.grad': 'Geçişli (gradyan)',
        'c.color': 'Renk', 'c.start': 'Başlangıç rengi', 'c.end': 'Bitiş rengi',
        'gr.type': 'Geçiş türü', 'gr.lin': 'Doğrusal', 'gr.rad': 'Dairesel', 'gr.angle': 'Geçiş açısı',
        'custom.sq': 'Köşe çerçevesine özel tasarım', 'custom.cd': 'Köşe noktasına özel tasarım',
        'sh.rounded': 'Yuvarlatılmış', 'sh.dots': 'Noktalar', 'sh.classy': 'Klasik', 'sh.classyr': 'Klasik yumuşak',
        'sh.square': 'Kare', 'sh.extra': 'Çok yuvarlak',
        'sq.extra': 'Yuvarlak köşeli', 'sq.square': 'Kare', 'sq.dot': 'Daire',
        'cd.dot': 'Daire', 'cd.square': 'Kare',
        'f.url': 'Web adresi veya metin', 'f.ssid': 'Ağ adı', 'f.pass': 'Şifre', 'f.sec': 'Güvenlik',
        'f.nopass': 'Şifresiz', 'f.name': 'Ad', 'f.surname': 'Soyad', 'f.phone': 'Telefon',
        'f.email': 'E-posta', 'f.org': 'Firma', 'f.web': 'Web sitesi', 'f.subject': 'Konu',
        'f.msg': 'Mesaj (isteğe bağlı)', 'f.lat': 'Enlem', 'f.lon': 'Boylam', 'f.to': 'Alıcı e-posta',
        'empty': 'Kodu oluşturmak için içerik alanlarını doldurun.',
        'toolong': 'İçerik bu kod için çok uzun; kısaltın.',
        'lib': 'QR kütüphanesi yüklenemedi; sayfayı yenileyin.',
        'verify': 'Kodu kullanmadan veya basmadan önce telefonunuzla okutarak kontrol edin.',
        'uy.low': 'Desen ile zemin arasındaki kontrast düşük; bazı telefonlar bu kodu okuyamayabilir.',
        'uy.inv': 'Açık desen koyu zeminde: bazı eski tarayıcılar bunu okuyamaz; basmadan önce telefonla deneyin.',
        'uy.gap': 'Kenar boşluğu yok: kodu basarken çevresinde boş bir alan bırakın.',
        'err.dl': 'İndirme hazırlanamadı; tekrar deneyin.',
        'err.pdf': 'PDF oluşturulamadı; bağlantınızı kontrol edip tekrar deneyin ya da PNG/SVG indirin.',
        'err.logo': 'Lütfen bir görsel dosyası seçin.',
        'alt': 'QR kod önizlemesi'
    };
    const EN = {
        'title': 'Free QR Code Designer - Romsoft',
        'nav.home': 'Home', 'nav.products': 'Products', 'nav.shop': 'Store', 'nav.about': 'About', 'nav.contact': 'Contact',
        'h1.a': 'QR code', 'h1.b': 'designer',
        'intro': 'Match your QR code to your brand colors, put your logo in the middle, add a caption, and download it free as PNG, SVG or PDF.',
        'presets': 'Ready-made styles',
        's1': '1. QR code content', 's2': '2. Pattern', 's3': '3. Corner frames', 's4': '4. Corner dots',
        's5': '5. Background', 's6': '6. Logo', 's7': '7. Spacing and caption',
        'type': 'Content type', 'size': 'Download size (pixels for the QR)',
        't.url': 'Web address / text', 't.wifi': 'Wi-Fi connection', 't.vcard': 'Contact card', 't.tel': 'Phone',
        't.mail': 'E-mail', 't.wa': 'WhatsApp message', 't.sms': 'SMS', 't.geo': 'Location',
        'bgcolor': 'Background color', 'transparent': 'Transparent background',
        'logo.up': 'Upload a logo', 'logo.desc': 'PNG, JPG or SVG (square works best)',
        'logo.size': 'Logo size', 'logo.margin': 'Logo margin', 'logo.hide': 'Hide the pattern behind the logo',
        'logo.note': 'Logo added: error correction was raised to the highest level (H), so the area the logo covers does not break scanning.',
        'ratio': 'Image ratio', 'r.sq': 'Square (1:1)', 'gap': 'Margin',
        'g.none': 'None', 'g.s': 'Narrow', 'g.m': 'Medium', 'g.l': 'Wide',
        'cap': 'Caption next to the code', 'cap.ph': 'Scan for the menu', 'cap.pos': 'Caption position',
        'p.bottom': 'Below the code', 'p.top': 'Above the code',
        'cap.note': 'Leave the caption empty to show only the code. The ratio is completed by adding space around the code.',
        'preview': 'Live preview',
        'dl.png': 'Download as PNG', 'dl.svg': 'Download as SVG (vector)', 'dl.pdf': 'Download as PDF',
        'reset': 'Reset settings', 'privacy': 'Privacy',
        'pn.red': 'Romsoft Red', 'pn.black': 'Romsoft Black', 'pn.nebula': 'Romsoft Nebula',
        'pn.neon': 'Neon', 'pn.gold': 'Gold', 'pn.emerald': 'Emerald', 'pn.dark': 'Black background',
        'shape': 'Shape', 'ctype': 'Color type', 'c.single': 'Single color', 'c.grad': 'Gradient',
        'c.color': 'Color', 'c.start': 'Start color', 'c.end': 'End color',
        'gr.type': 'Gradient type', 'gr.lin': 'Linear', 'gr.rad': 'Radial', 'gr.angle': 'Gradient angle',
        'custom.sq': 'Custom corner frame design', 'custom.cd': 'Custom corner dot design',
        'sh.rounded': 'Rounded', 'sh.dots': 'Dots', 'sh.classy': 'Classy', 'sh.classyr': 'Soft classy',
        'sh.square': 'Square', 'sh.extra': 'Extra rounded',
        'sq.extra': 'Rounded corners', 'sq.square': 'Square', 'sq.dot': 'Circle',
        'cd.dot': 'Circle', 'cd.square': 'Square',
        'f.url': 'Web address or text', 'f.ssid': 'Network name', 'f.pass': 'Password', 'f.sec': 'Security',
        'f.nopass': 'No password', 'f.name': 'First name', 'f.surname': 'Last name', 'f.phone': 'Phone',
        'f.email': 'E-mail', 'f.org': 'Company', 'f.web': 'Website', 'f.subject': 'Subject',
        'f.msg': 'Message (optional)', 'f.lat': 'Latitude', 'f.lon': 'Longitude', 'f.to': 'Recipient e-mail',
        'empty': 'Fill in the content fields to create the code.',
        'toolong': 'The content is too long for a QR code; shorten it.',
        'lib': 'The QR library could not be loaded; reload the page.',
        'verify': 'Scan the code with your phone to check it before you use or print it.',
        'uy.low': 'Contrast between the pattern and the background is low; some phones may not read this code.',
        'uy.inv': 'Light pattern on a dark background: some older scanners cannot read this; test with a phone before printing.',
        'uy.gap': 'No margin: leave an empty area around the code when you print it.',
        'err.dl': 'Could not prepare the download; try again.',
        'err.pdf': 'Could not create the PDF; check your connection and try again, or download PNG/SVG.',
        'err.logo': 'Please choose an image file.',
        'alt': 'QR code preview'
    };

    function tx(key, el) {
        const d = lang === 'en' ? EN : TR;
        if (d[key] != null) return d[key];
        return el && el.dataset.tr != null ? el.dataset.tr : key;
    }
    const t = key => tx(key, null);

    function cevir(kok) {
        kok.querySelectorAll('[data-i18n]').forEach(el => {
            if (el.dataset.tr == null) el.dataset.tr = el.textContent;
            el.textContent = tx(el.dataset.i18n, el);
        });
        kok.querySelectorAll('[data-i18n-ph]').forEach(el => {
            if (el.dataset.trPh == null) el.dataset.trPh = el.getAttribute('placeholder') || '';
            el.setAttribute('placeholder', lang === 'en' && EN[el.dataset.i18nPh] ? EN[el.dataset.i18nPh] : el.dataset.trPh);
        });
    }

    /* ---------- Hazır şablonlar ---------- */
    const PRESETLER = [
        { id: 'kirmizi', ad: 'pn.red', nokta: 'linear-gradient(135deg,#ff3131,#a30f0f)',
          dot: { sekil: 'rounded', mode: 'gradient', g1: '#FF3131', g2: '#A30F0F', gangle: 45 },
          sq: { sekil: 'extra-rounded', mode: 'single', c1: '#111111' },
          cd: { sekil: 'dot', mode: 'single', c1: '#FF3131' }, bg: '#FFFFFF' },
        { id: 'siyah', ad: 'pn.black', nokta: '#111111',
          dot: { sekil: 'rounded', mode: 'single', c1: '#111111' },
          sq: { sekil: 'extra-rounded', mode: 'single', c1: '#FF3131' },
          cd: { sekil: 'dot', mode: 'single', c1: '#111111' }, bg: '#FFFFFF' },
        { id: 'nebula', ad: 'pn.nebula', nokta: 'linear-gradient(135deg,#6c5ce7,#74b9ff)',
          dot: { sekil: 'rounded', mode: 'gradient', g1: '#6C5CE7', g2: '#74B9FF', gangle: 45 }, bg: '#FFFFFF' },
        { id: 'neon', ad: 'pn.neon', nokta: 'linear-gradient(135deg,#ff007f,#00f0ff)',
          dot: { sekil: 'classy', mode: 'gradient', g1: '#FF007F', g2: '#00F0FF', gangle: 45 },
          sq: { sekil: 'extra-rounded', mode: 'single', c1: '#00F0FF' },
          cd: { sekil: 'dot', mode: 'single', c1: '#FF007F' }, bg: '#05050A' },
        { id: 'altin', ad: 'pn.gold', nokta: 'linear-gradient(135deg,#fbbf24,#d4af37)',
          dot: { sekil: 'classy-rounded', mode: 'single', c1: '#D4AF37' },
          sq: { sekil: 'square', mode: 'single', c1: '#FBBF24' },
          cd: { sekil: 'dot', mode: 'single', c1: '#FBBF24' }, bg: '#0A0A14' },
        { id: 'zumrut', ad: 'pn.emerald', nokta: 'linear-gradient(135deg,#00cec9,#81ecec)',
          dot: { sekil: 'dots', mode: 'single', c1: '#00CEC9' },
          sq: { sekil: 'dot', mode: 'single', c1: '#81ECEC' },
          cd: { sekil: 'dot', mode: 'single', c1: '#00CEC9' }, bg: '#FFFFFF' },
        { id: 'siyahzemin', ad: 'pn.dark', nokta: '#ffffff',
          dot: { sekil: 'square', mode: 'single', c1: '#FFFFFF' }, bg: '#000000' }
    ];
    const VARSAYILAN_PRESET = 'kirmizi';
    let aktifPreset = null;

    /* ---------- Biçim grupları (desen / köşe çerçevesi / köşe noktası) ---------- */
    const SEKILLER = {
        dot: [['rounded', 'sh.rounded'], ['dots', 'sh.dots'], ['classy', 'sh.classy'], ['classy-rounded', 'sh.classyr'], ['square', 'sh.square'], ['extra-rounded', 'sh.extra']],
        sq: [['extra-rounded', 'sq.extra'], ['square', 'sq.square'], ['dot', 'sq.dot']],
        cd: [['dot', 'cd.dot'], ['square', 'cd.square']]
    };

    function renkSatiri(id, anahtar) {
        return `<div class="color-group"><label class="form-label" for="${id}" data-i18n="${anahtar}">${TR[anahtar]}</label>
            <div class="color-picker-container"><input type="color" id="${id}" value="#111111">
            <input type="text" id="${id}-text" class="color-text-input" value="#111111" maxlength="7" aria-label="${TR[anahtar]} (kod)"></div></div>`;
    }

    function grupKur(p) {
        const ozel = p !== 'dot';
        const sekiller = SEKILLER[p].map(([v, k]) => `<option value="${v}" data-i18n="${k}">${TR[k]}</option>`).join('');
        $('grup-' + p).innerHTML = `
            ${ozel ? `<div class="toggle-container"><span data-i18n="custom.${p}">${TR['custom.' + p]}</span>
                <label class="switch"><input type="checkbox" id="${p}-ozel"><span class="slider"></span></label></div>` : ''}
            <div id="${p}-govde" class="grup-govde">
                <div><label class="form-label" for="${p}-sekil" data-i18n="shape">${TR.shape}</label>
                    <select id="${p}-sekil" class="select-input">${sekiller}</select></div>
                <div><label class="form-label" for="${p}-mode" data-i18n="ctype">${TR.ctype}</label>
                    <select id="${p}-mode" class="select-input">
                        <option value="single" data-i18n="c.single">${TR['c.single']}</option>
                        <option value="gradient" data-i18n="c.grad">${TR['c.grad']}</option></select></div>
                <div id="${p}-tek">${renkSatiri(p + '-c1', 'c.color')}</div>
                <div id="${p}-grad" class="grup-govde">
                    <div class="form-row">${renkSatiri(p + '-g1', 'c.start')}${renkSatiri(p + '-g2', 'c.end')}</div>
                    <div class="form-row">
                        <div><label class="form-label" for="${p}-gtype" data-i18n="gr.type">${TR['gr.type']}</label>
                            <select id="${p}-gtype" class="select-input">
                                <option value="linear" data-i18n="gr.lin">${TR['gr.lin']}</option>
                                <option value="radial" data-i18n="gr.rad">${TR['gr.rad']}</option></select></div>
                        <div class="range-wrapper"><div class="range-header"><span data-i18n="gr.angle">${TR['gr.angle']}</span>
                            <span class="range-value" id="${p}-gangle-v">45°</span></div>
                            <input type="range" id="${p}-gangle" class="range-input" min="0" max="360" value="45" aria-label="${TR['gr.angle']}"></div>
                    </div>
                </div>
            </div>`;
    }

    function presetGrid() {
        $('presets-grid').innerHTML = PRESETLER.map(p => `
            <button type="button" class="preset-btn" id="preset-${p.id}" data-preset="${p.id}">
                <span class="preset-preview-dot" style="background:${p.nokta}"></span>
                <span class="preset-name" data-i18n="${p.ad}">${TR[p.ad]}</span></button>`).join('');
    }

    function setRenk(id, deger) {
        $(id).value = deger.toLowerCase();
        $(id + '-text').value = deger.toUpperCase();
    }

    function grupUygula(p, g) {
        $(p + '-sekil').value = g.sekil;
        $(p + '-mode').value = g.mode;
        if (g.c1) setRenk(p + '-c1', g.c1);
        if (g.g1) setRenk(p + '-g1', g.g1);
        if (g.g2) setRenk(p + '-g2', g.g2);
        $(p + '-gtype').value = g.gtype || 'linear';
        $(p + '-gangle').value = g.gangle != null ? g.gangle : 45;
    }

    function presetUygula(id) {
        const p = PRESETLER.find(x => x.id === id);
        if (!p) return;
        grupUygula('dot', p.dot);
        for (const k of ['sq', 'cd']) {
            $(k + '-ozel').checked = !!p[k];
            if (p[k]) grupUygula(k, p[k]);
        }
        setRenk('bg-color', p.bg);
        $('bg-seffaf').checked = false;
        aktifPreset = id;
        presetIsaretle();
    }

    function presetIsaretle() {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === aktifPreset));
    }

    /* ---------- İçerik türleri ---------- */
    const TURLER = {
        url: [{ id: 'f-metin', lbl: 'f.url', ph: 'https://romsoft.com.tr', def: 'https://romsoft.com.tr' }],
        wifi: [{ id: 'f-ssid', lbl: 'f.ssid' }, { id: 'f-sifre', lbl: 'f.pass' },
            { id: 'f-guv', lbl: 'f.sec', sec: [['WPA', null, 'WPA / WPA2 / WPA3'], ['WEP', null, 'WEP'], ['nopass', 'f.nopass']] }],
        vcard: [{ id: 'f-ad', lbl: 'f.name' }, { id: 'f-soyad', lbl: 'f.surname' }, { id: 'f-tel', lbl: 'f.phone', tip: 'tel', ph: '05xx xxx xx xx' },
            { id: 'f-eposta', lbl: 'f.email', tip: 'email' }, { id: 'f-firma', lbl: 'f.org' }, { id: 'f-web', lbl: 'f.web', ph: 'https://' }],
        tel: [{ id: 'f-tel', lbl: 'f.phone', tip: 'tel', ph: '05xx xxx xx xx' }],
        mail: [{ id: 'f-to', lbl: 'f.to', tip: 'email' }, { id: 'f-konu', lbl: 'f.subject' }, { id: 'f-mesaj', lbl: 'f.msg', alan: true }],
        wa: [{ id: 'f-tel', lbl: 'f.phone', tip: 'tel', ph: '05xx xxx xx xx' }, { id: 'f-mesaj', lbl: 'f.msg', alan: true }],
        sms: [{ id: 'f-tel', lbl: 'f.phone', tip: 'tel', ph: '05xx xxx xx xx' }, { id: 'f-mesaj', lbl: 'f.msg', alan: true }],
        geo: [{ id: 'f-lat', lbl: 'f.lat', ph: '37.0662' }, { id: 'f-lon', lbl: 'f.lon', ph: '37.3833' }]
    };
    const alanDeger = {};

    function alanlariKur() {
        const tur = $('tur').value;
        $('tur-alanlar').innerHTML = TURLER[tur].map(f => {
            let giris;
            if (f.sec) {
                giris = `<select id="${f.id}" class="select-input">${f.sec.map(([v, k, ad]) =>
                    `<option value="${v}"${k ? ` data-i18n="${k}"` : ''}>${k ? TR[k] : ad}</option>`).join('')}</select>`;
            } else if (f.alan) {
                giris = `<textarea id="${f.id}" class="form-input" rows="2"></textarea>`;
            } else {
                giris = `<input type="${f.tip || 'text'}" id="${f.id}" class="form-input"${f.ph ? ` placeholder="${f.ph}"` : ''}>`;
            }
            return `<div><label class="form-label" for="${f.id}" data-i18n="${f.lbl}">${TR[f.lbl]}</label>${giris}</div>`;
        }).join('');
        TURLER[tur].forEach(f => {
            const e = $(f.id);
            const v = alanDeger[tur + f.id] != null ? alanDeger[tur + f.id] : (f.def || '');
            if (v !== '') e.value = v;
        });
        cevir($('tur-alanlar'));
    }

    function icerikVeri() {
        const tur = $('tur').value;
        const v = id => ($(id) ? $(id).value : '').trim();
        const kacis = s => s.replace(/([\\;,:"])/g, '\\$1');
        const vc = s => s.replace(/([\\;,])/g, '\\$1').replace(/\r?\n/g, '\\n');
        const sayilar = s => s.replace(/[^\d+]/g, '');
        switch (tur) {
            case 'url': return v('f-metin');
            case 'wifi': {
                if (!v('f-ssid')) return '';
                const guv = $('f-guv').value;
                return `WIFI:T:${guv};S:${kacis(v('f-ssid'))};` + (guv !== 'nopass' && v('f-sifre') ? `P:${kacis(v('f-sifre'))};` : '') + ';';
            }
            case 'vcard': {
                if (!v('f-ad') && !v('f-soyad')) return '';
                const s = ['BEGIN:VCARD', 'VERSION:3.0', `N:${vc(v('f-soyad'))};${vc(v('f-ad'))};;;`, `FN:${vc((v('f-ad') + ' ' + v('f-soyad')).trim())}`];
                if (v('f-firma')) s.push('ORG:' + vc(v('f-firma')));
                if (v('f-tel')) s.push('TEL;TYPE=CELL:' + sayilar(v('f-tel')));
                if (v('f-eposta')) s.push('EMAIL:' + v('f-eposta'));
                if (v('f-web')) s.push('URL:' + v('f-web'));
                s.push('END:VCARD');
                return s.join('\n');
            }
            case 'tel': {
                const n = sayilar(v('f-tel'));
                return n.replace(/\D/g, '').length >= 3 ? 'tel:' + n : '';
            }
            case 'mail': {
                if (!v('f-to').includes('@')) return '';
                const q = [];
                if (v('f-konu')) q.push('subject=' + encodeURIComponent(v('f-konu')));
                if (v('f-mesaj')) q.push('body=' + encodeURIComponent(v('f-mesaj')));
                return 'mailto:' + v('f-to') + (q.length ? '?' + q.join('&') : '');
            }
            case 'wa': {
                let n = v('f-tel').replace(/\D/g, '');
                if (n.startsWith('00')) n = n.slice(2);
                else if (n.startsWith('0') && n.length === 11) n = '90' + n.slice(1);
                else if (n.length === 10) n = '90' + n;
                if (n.length < 10) return '';
                return 'https://wa.me/' + n + (v('f-mesaj') ? '?text=' + encodeURIComponent(v('f-mesaj')) : '');
            }
            case 'sms': {
                const n = sayilar(v('f-tel'));
                return n.replace(/\D/g, '').length >= 3 ? `SMSTO:${n}:${v('f-mesaj')}` : '';
            }
            case 'geo': {
                const la = parseFloat(v('f-lat').replace(',', '.')), lo = parseFloat(v('f-lon').replace(',', '.'));
                if (!(la >= -90 && la <= 90 && lo >= -180 && lo <= 180)) return '';
                return `geo:${la},${lo}`;
            }
        }
        return '';
    }

    /* ---------- Seçenekler ---------- */
    let logoDataUrl = '';

    function renkSecenek(p) {
        if ($(p + '-mode').value === 'single') return { color: $(p + '-c1').value, gradient: null };
        return {
            color: null,
            gradient: {
                type: $(p + '-gtype').value,
                rotation: (Math.PI * parseInt($(p + '-gangle').value, 10)) / 180,
                colorStops: [{ offset: 0, color: $(p + '-g1').value }, { offset: 1, color: $(p + '-g2').value }]
            }
        };
    }

    function ilkNokta() {
        return $('dot-mode').value === 'single' ? $('dot-c1').value : $('dot-g1').value;
    }

    function kodSecenek(veri) {
        const dotTip = $('dot-sekil').value;
        const yuvarlak = ['dots', 'rounded', 'classy-rounded'].includes(dotTip);
        const sq = $('sq-ozel').checked
            ? { type: $('sq-sekil').value, ...renkSecenek('sq') }
            : { type: yuvarlak ? 'extra-rounded' : 'square', color: ilkNokta(), gradient: null };
        const cd = $('cd-ozel').checked
            ? { type: $('cd-sekil').value, ...renkSecenek('cd') }
            : { type: yuvarlak ? 'dot' : 'square', color: ilkNokta(), gradient: null };
        return {
            data: veri,
            qrOptions: { errorCorrectionLevel: logoDataUrl ? 'H' : 'Q' },
            dotsOptions: { type: dotTip, ...renkSecenek('dot') },
            cornersSquareOptions: sq,
            cornersDotOptions: cd,
            backgroundOptions: { color: $('bg-seffaf').checked ? 'transparent' : $('bg-color').value },
            image: logoDataUrl,
            imageOptions: {
                hideBackgroundDots: $('logo-gizle').checked,
                imageSize: parseFloat($('logo-boyut').value),
                margin: parseInt($('logo-bosluk').value, 10),
                crossOrigin: 'anonymous'
            }
        };
    }

    /* ---------- Çerçeve: oran + boşluk + yazı ---------- */
    function parlaklik(hex) {
        const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
            .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    }
    const kontrast = (a, b) => { const x = parlaklik(a), y = parlaklik(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

    function cerceveSecenek() {
        const [a, b] = $('oran').value.split(':').map(Number);
        const seffaf = $('bg-seffaf').checked;
        const bg = $('bg-color').value;
        return {
            oran: [a, b], bosluk: parseFloat($('bosluk').value), yazi: $('yazi').value.trim(),
            ust: $('yazi-yer').value === 'ust', seffaf, bg,
            yaziRenk: seffaf || parlaklik(bg) > 0.4 ? '#111111' : '#ffffff'
        };
    }

    let olcCtx = null;
    function yaziGenisligi(metin, px) {
        olcCtx = olcCtx || document.createElement('canvas').getContext('2d');
        olcCtx.font = `600 ${px}px ${FONT}`;
        return olcCtx.measureText(metin).width;
    }

    function yerlesim(S, o) {
        const m = S * o.bosluk;
        let fs = 0, band = 0;
        if (o.yazi) {
            const maks = (S + 2 * m) * 0.92;
            fs = S * 0.075;
            const w = yaziGenisligi(o.yazi, fs);
            if (w > maks) fs *= maks / w;
            band = fs * 2.4;
        }
        const cw = S + 2 * m, ch = S + 2 * m + band, r = o.oran[0] / o.oran[1];
        const W = Math.round(Math.max(cw, ch * r)), H = Math.round(Math.max(ch, cw / r));
        const x0 = (W - cw) / 2, y0 = (H - ch) / 2;
        return {
            W, H, fs, tx: W / 2,
            qx: x0 + m, qy: y0 + m + (o.yazi && o.ust ? band : 0),
            ty: !o.yazi ? 0 : (o.ust ? y0 + m + band / 2 : y0 + m + S + band / 2)
        };
    }

    const NS = 'http://www.w3.org/2000/svg';
    function cerceveSvg(qrSvgMetni, S, o) {
        const L = yerlesim(S, o);
        const ic = new DOMParser().parseFromString(qrSvgMetni, 'image/svg+xml').documentElement;
        ic.setAttribute('viewBox', `0 0 ${S} ${S}`);
        ic.setAttribute('x', L.qx); ic.setAttribute('y', L.qy);
        ic.setAttribute('width', S); ic.setAttribute('height', S);
        const dis = document.createElementNS(NS, 'svg');
        dis.setAttribute('xmlns', NS);
        dis.setAttribute('viewBox', `0 0 ${L.W} ${L.H}`);
        dis.setAttribute('width', L.W); dis.setAttribute('height', L.H);
        if (!o.seffaf) {
            const r = document.createElementNS(NS, 'rect');
            r.setAttribute('width', L.W); r.setAttribute('height', L.H); r.setAttribute('fill', o.bg);
            dis.appendChild(r);
        }
        dis.appendChild(document.importNode(ic, true));
        if (o.yazi) {
            const tt = document.createElementNS(NS, 'text');
            tt.setAttribute('x', L.tx); tt.setAttribute('y', L.ty);
            tt.setAttribute('text-anchor', 'middle'); tt.setAttribute('dominant-baseline', 'central');
            tt.setAttribute('font-family', FONT); tt.setAttribute('font-weight', '600');
            tt.setAttribute('font-size', L.fs.toFixed(2)); tt.setAttribute('fill', o.yaziRenk);
            tt.textContent = o.yazi;
            dis.appendChild(tt);
        }
        return { el: dis, str: new XMLSerializer().serializeToString(dis), W: L.W, H: L.H };
    }

    async function cerceveKanvas(S, veri, o, beyazZemin) {
        const kod = new QRCodeStyling({ ...kodSecenek(veri), width: S, height: S, type: 'canvas' });
        const bmp = await createImageBitmap(await kod.getRawData('png'));
        const L = yerlesim(S, o);
        const cv = document.createElement('canvas');
        cv.width = L.W; cv.height = L.H;
        const x = cv.getContext('2d');
        if (beyazZemin || !o.seffaf) { x.fillStyle = o.seffaf ? '#ffffff' : o.bg; x.fillRect(0, 0, L.W, L.H); }
        x.drawImage(bmp, L.qx, L.qy, S, S);
        if (o.yazi) {
            x.font = `600 ${L.fs}px ${FONT}`;
            x.textAlign = 'center'; x.textBaseline = 'middle';
            x.fillStyle = o.yaziRenk;
            x.fillText(o.yazi, L.tx, L.ty);
        }
        return cv;
    }

    /* ---------- Önizleme, uyarılar, okuma denemesi ---------- */
    let sira = 0, ciz_zamani = 0;

    function bosGoster(metin) {
        $('onizleme').innerHTML = `<p class="onizleme-bos">${metin}</p>`;
        $('uyari').hidden = true;
        for (const id of ['indir-png', 'indir-svg', 'indir-pdf']) $(id).disabled = true;
    }

    function uyarilar() {
        const liste = [];
        const renkler = [];
        const ekle = p => {
            if ($(p + '-mode').value === 'single') renkler.push($(p + '-c1').value);
            else renkler.push($(p + '-g1').value, $(p + '-g2').value);
        };
        ekle('dot');
        if ($('sq-ozel').checked) ekle('sq');
        if ($('cd-ozel').checked) ekle('cd');
        if (!$('bg-seffaf').checked) {
            const bg = $('bg-color').value;
            const enKotu = Math.min(...renkler.map(r => kontrast(r, bg)));
            const koyuZemin = parlaklik(bg) < Math.min(...renkler.map(parlaklik));
            if (enKotu < 3) liste.push('uy.low');
            else if (koyuZemin) liste.push('uy.inv');
        }
        if (parseFloat($('bosluk').value) === 0) liste.push('uy.gap');
        const ul = $('uyari');
        ul.innerHTML = liste.map(k => `<li>${t(k)}</li>`).join('');
        ul.hidden = !liste.length;
    }

    async function ciz() {
        const benim = ++sira;
        if (typeof QRCodeStyling === 'undefined') { bosGoster(t('lib')); return; }
        const veri = icerikVeri();
        if (!veri) { bosGoster(t('empty')); return; }
        const o = cerceveSecenek();
        try {
            const kod = new QRCodeStyling({ ...kodSecenek(veri), width: 300, height: 300, type: 'svg' });
            const metin = await (await kod.getRawData('svg')).text();
            if (benim !== sira) return;
            const c = cerceveSvg(metin, 300, o);
            c.el.removeAttribute('width'); c.el.removeAttribute('height');
            c.el.setAttribute('role', 'img'); c.el.setAttribute('aria-label', t('alt'));
            c.el.style.cssText = 'display:block;width:100%;height:auto;max-height:560px';
            $('onizleme').replaceChildren(c.el);
            for (const id of ['indir-png', 'indir-svg', 'indir-pdf']) $(id).disabled = false;
            uyarilar();
        } catch {
            if (benim === sira) bosGoster(t('toolong'));
        }
    }

    function planla() {
        clearTimeout(ciz_zamani);
        ciz_zamani = setTimeout(ciz, 120);
    }

    /* ---------- İndirme ---------- */
    function dosyaIndir(blob, ad) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = ad;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
    }

    let jsPdfSozu = null;
    function jsPdfYukle() {
        if (window.jspdf) return Promise.resolve();
        if (!jsPdfSozu) {
            jsPdfSozu = new Promise((tamam, hata) => {
                const s = document.createElement('script');
                s.src = 'vendor/jspdf.umd.min.js?v=2.5.1';
                s.onload = tamam;
                s.onerror = () => { jsPdfSozu = null; hata(new Error('jsPDF')); };
                document.head.appendChild(s);
            });
        }
        return jsPdfSozu;
    }

    async function indir(bicim) {
        const veri = icerikVeri();
        if (!veri) return;
        const durum = $('indir-durum');
        const dugmeler = ['indir-png', 'indir-svg', 'indir-pdf'].map($);
        dugmeler.forEach(b => { b.disabled = true; });
        durum.hidden = true;
        const S = parseInt($('boyut').value, 10);
        const o = cerceveSecenek();
        const ad = 'romsoft-qr-' + Date.now();
        try {
            if (bicim === 'svg') {
                const kod = new QRCodeStyling({ ...kodSecenek(veri), width: S, height: S, type: 'svg' });
                const metin = await (await kod.getRawData('svg')).text();
                const c = cerceveSvg(metin, S, o);
                dosyaIndir(new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + c.str], { type: 'image/svg+xml' }), ad + '.svg');
            } else if (bicim === 'png') {
                const cv = await cerceveKanvas(S, veri, o, false);
                dosyaIndir(await new Promise(r => cv.toBlob(r, 'image/png')), ad + '.png');
            } else {
                durum.dataset.hata = 'err.pdf';
                const [cv] = await Promise.all([cerceveKanvas(S, veri, o, true), jsPdfYukle()]);
                const uzun = 150;
                const pw = cv.width >= cv.height ? uzun : uzun * cv.width / cv.height;
                const ph = cv.width >= cv.height ? uzun * cv.height / cv.width : uzun;
                const doc = new window.jspdf.jsPDF({ unit: 'mm', format: [pw, ph], orientation: pw > ph ? 'l' : 'p' });
                doc.addImage(cv.toDataURL('image/png'), 'PNG', 0, 0, pw, ph, undefined, 'FAST');
                doc.save(ad + '.pdf');
            }
        } catch {
            durum.textContent = t(bicim === 'pdf' ? 'err.pdf' : 'err.dl');
            durum.hidden = false;
        } finally {
            dugmeler.forEach(b => { b.disabled = false; });
        }
    }

    /* ---------- Görünüm, saklama, sıfırlama ---------- */
    function gorunum() {
        for (const p of ['dot', 'sq', 'cd']) {
            const gecisli = $(p + '-mode').value === 'gradient';
            $(p + '-tek').hidden = gecisli;
            $(p + '-grad').hidden = !gecisli;
            if (p !== 'dot') $(p + '-govde').hidden = !$(p + '-ozel').checked;
        }
        document.querySelectorAll('input[type=range]').forEach(r => {
            const v = $(r.id + '-v');
            if (!v) return;
            v.textContent = r.id === 'logo-boyut' ? parseFloat(r.value).toFixed(2)
                : r.id === 'logo-bosluk' ? r.value + ' px'
                : r.id.endsWith('gangle') ? r.value + '°' : r.value;
        });
        $('logo-not').hidden = !logoDataUrl;
        $('logo-ad-kutu').style.display = logoDataUrl ? 'flex' : 'none';
        $('bg-color').parentElement.classList.toggle('pasif', $('bg-seffaf').checked);
    }

    function kayitliElemanlar() {
        return [...document.querySelectorAll('.settings-panel input, .settings-panel select')]
            .filter(e => e.id && !e.id.startsWith('f-') && e.id !== 'logo-dosya' && e.id !== 'tur');
    }
    function anlik() {
        const d = {};
        kayitliElemanlar().forEach(e => { d[e.id] = e.type === 'checkbox' ? e.checked : e.value; });
        d.__preset = aktifPreset;
        return d;
    }
    function uygula(d) {
        kayitliElemanlar().forEach(e => {
            if (!(e.id in d)) return;
            if (e.type === 'checkbox') e.checked = !!d[e.id];
            else e.value = d[e.id];
        });
        aktifPreset = d.__preset || null;
        presetIsaretle();
    }
    function kaydet() { store.set(KAYIT, JSON.stringify(anlik())); }

    let ILK = null;

    function logoKaldir() {
        $('logo-dosya').value = '';
        logoDataUrl = '';
    }

    function sifirla() {
        store.del(KAYIT);
        uygula(ILK);
        logoKaldir();
        for (const k of Object.keys(alanDeger)) delete alanDeger[k];
        $('tur').value = 'url';
        alanlariKur();
        gorunum();
        planla();
    }

    function ceviriUygula() {
        document.documentElement.lang = lang;
        document.title = lang === 'en' ? EN.title : (document.documentElement.dataset.trTitle || document.title);
        document.querySelectorAll('.lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
        cevir(document.body);
    }

    /* ---------- Olaylar ---------- */
    function baglantilar() {
        document.addEventListener('input', degisti);
        document.addEventListener('change', degisti);

        $('presets-grid').addEventListener('click', e => {
            const b = e.target.closest('.preset-btn');
            if (!b) return;
            presetUygula(b.dataset.preset);
            gorunum(); kaydet(); planla();
        });

        $('logo-dosya').addEventListener('change', e => {
            const f = e.target.files[0];
            if (!f) return;
            if (!f.type.startsWith('image/')) {
                e.target.value = '';
                const d = $('indir-durum'); d.textContent = t('err.logo'); d.hidden = false;
                return;
            }
            $('indir-durum').hidden = true;
            $('logo-ad').textContent = f.name;
            const r = new FileReader();
            r.onload = () => { logoDataUrl = r.result; gorunum(); planla(); };
            r.readAsDataURL(f);
        });
        $('logo-kaldir').addEventListener('click', () => { logoKaldir(); gorunum(); planla(); });

        $('indir-png').addEventListener('click', () => indir('png'));
        $('indir-svg').addEventListener('click', () => indir('svg'));
        $('indir-pdf').addEventListener('click', () => indir('pdf'));
        $('sifirla').addEventListener('click', sifirla);

        document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => {
            lang = b.dataset.lang;
            store.set('romsoft.lang', lang);
            ceviriUygula();
            planla();
        }));

        if (document.fonts && document.fonts.ready) document.fonts.ready.then(planla);
    }

    function degisti(e) {
        const el = e.target;
        if (!el || !el.id) return;
        if (el.id === 'logo-dosya') return;
        // renk seçici ↔ renk kodu eşleşmesi
        if (el.type === 'color') {
            $(el.id + '-text').value = el.value.toUpperCase();
        } else if (el.classList.contains('color-text-input')) {
            let v = el.value.trim();
            if (!v.startsWith('#')) v = '#' + v;
            if (!/^#[0-9a-f]{6}$/i.test(v)) return;
            $(el.id.replace(/-text$/, '')).value = v.toLowerCase();
            el.value = v.toUpperCase();
        }
        if (el.id === 'tur') { alanlariKur(); }
        else if (el.id.startsWith('f-')) {
            alanDeger[$('tur').value + el.id] = el.value;
        } else if (/^(dot|sq|cd|bg)-/.test(el.id)) {
            aktifPreset = null; presetIsaretle();
        }
        gorunum();
        if (el.id !== 'tur' && !el.id.startsWith('f-')) kaydet();
        planla();
    }

    /* ---------- Başlangıç ---------- */
    function basla() {
        document.documentElement.dataset.trTitle = document.title;
        presetGrid();
        for (const p of ['dot', 'sq', 'cd']) grupKur(p);
        alanlariKur();
        cevir(document.body);          // Türkçe metinleri yakalar
        ceviriUygula();
        presetUygula(VARSAYILAN_PRESET);
        gorunum();
        ILK = anlik();
        try {
            const k = store.get(KAYIT);
            if (k) { uygula(JSON.parse(k)); }
        } catch { /* bozuk kayıt: varsayılanla devam */ }
        gorunum();
        baglantilar();
        if (document.fonts && document.fonts.load) document.fonts.load("600 20px Archivo").catch(() => {});
        ciz();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla);
    else basla();
})();
