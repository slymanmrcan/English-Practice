// Arabic Learning App - Minimal Version
// =====================================

const App = {
  currentPanel: null,
  data: {},
  dataLoaded: false,
  
  async init() {
    await this.loadAllData();
    this.bindNavigation();
    this.showPanel('intro'); // Default panel
  },
  
  async loadAllData() {
    const files = [
      'intro_01', 'vocab_01', 'grammar_01',
      'pronouns_01', 'demonstratives_01', 'colors_01', 'numbers_01', 'questions_01',
      'emsile_01', 'bina_01', 'maksud_01', 'sarf_01', 'nahiv_01',
      'islamic_terms_01', 'islamic_basics_01'
    ];
    
    console.log('Veriler yükleniyor...');
    
    for (const file of files) {
      try {
        const response = await fetch(`data/${file}.json`);
        if (response.ok) {
          this.data[file] = await response.json();
          console.log(`✓ ${file} yüklendi`);
        } else {
          console.warn(`✗ ${file} bulunamadı (${response.status})`);
        }
      } catch (error) {
        console.warn(`✗ ${file} yüklenemedi:`, error.message);
      }
    }
    
    this.dataLoaded = true;
    console.log('Veri yükleme tamamlandı:', Object.keys(this.data));
  },
  
  bindNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.dataset.panel;
        this.showPanel(panel);
        
        // Update active state
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  },
  
  async showPanel(panel) {
    this.currentPanel = panel;
    const content = document.getElementById('content');
    const pageTitle = document.getElementById('page-title');
    const selector = document.getElementById('selector');
    
    // Panel configurations
    const panels = {
      intro: { title: 'Giriş', dataKey: 'intro_01', render: this.renderIntro },
      vocab: { title: 'Kelimeler', dataKey: 'vocab_01', render: this.renderVocab, hasSelector: true },
      basics: { title: 'Temel Konular', dataKey: 'pronouns_01', render: this.renderBasics, hasSelector: true },
      emsile: { title: 'Emsile', dataKey: 'emsile_01', render: this.renderSarf },
      bina: { title: 'Binâ', dataKey: 'bina_01', render: this.renderSarf },
      maksud: { title: 'Maksûd', dataKey: 'maksud_01', render: this.renderSarf },
      sarf: { title: 'Sarf Dersleri', dataKey: 'sarf_01', render: this.renderSarf },
      nahiv: { title: 'Nahiv Dersleri', dataKey: 'nahiv_01', render: this.renderNahiv },
      grammar: { title: 'Gramer', dataKey: 'grammar_01', render: this.renderGrammar },
      roots: { title: 'Kök Ara', dataKey: 'vocab_01', render: this.renderRoots },
      patterns: { title: 'Veznler', dataKey: 'emsile_01', render: this.renderPatterns },
      islamic: { title: 'İslami Terimler', dataKey: 'islamic_terms_01', render: this.renderIslamic }
    };
    
    const config = panels[panel];
    if (!config) return;
    
    pageTitle.textContent = config.title;
    
    // Show/hide selector
    if (config.hasSelector) {
      selector.classList.remove('hidden');
      this.setupSelector(panel);
    } else {
      selector.classList.add('hidden');
    }
    
    // Get data and render
    const panelData = this.data[config.dataKey];
    if (!panelData) {
      content.innerHTML = `<div class="placeholder"><div class="ar">خطأ</div>Veri bulunamadı: ${config.dataKey}</div>`;
      return;
    }
    
    config.render.call(this, panelData, content);
  },
  
  setupSelector(panel) {
    const selector = document.getElementById('selector');
    selector.innerHTML = '';
    
    const options = {
      vocab: [
        { value: 'all', text: 'Tüm Kelimeler' },
        { value: 'verbs', text: 'Fiiller' },
        { value: 'nouns', text: 'İsimler' },
        { value: 'particles', text: 'Harfler' }
      ],
      basics: [
        { value: 'pronouns', text: 'Zamirler' },
        { value: 'demonstratives', text: 'İşaret İsimleri' },
        { value: 'colors', text: 'Renkler' },
        { value: 'numbers', text: 'Sayılar' },
        { value: 'questions', text: 'Soru Kelimeleri' }
      ]
    };
    
    (options[panel] || []).forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      selector.appendChild(option);
    });
    
    selector.onchange = () => this.showPanel(panel);
  },
  
  // ============ RENDER FUNCTIONS ============
  
  renderIntro(intro, container) {
    if (!intro) {
      container.innerHTML = '<div class="placeholder">Giriş verisi bulunamadı</div>';
      return;
    }
    
    let html = '';
    
    // Welcome
    if (intro.welcome) {
      html += `
        <div class="intro-section">
          <div class="intro-title">
            <span class="ar">${intro.welcome.arabic || ''}</span>
            ${intro.welcome.title || 'Hoş Geldiniz'}
          </div>
          <p style="color: var(--text-dim); margin-bottom: 16px;">${intro.welcome.description || ''}</p>
        </div>
      `;
    }
    
    // Alphabet
    if (intro.alphabet && intro.alphabet.letters) {
      html += `
        <div class="intro-section">
          <div class="intro-title">
            <span class="ar">الحروف</span>
            Arap Alfabesi
          </div>
          <div class="alphabet-grid">
            ${intro.alphabet.letters.map(l => `
              <div class="letter-box">
                <div class="letter-ar">${l.arabic}</div>
                <div class="letter-name">${l.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // Harekeler
    if (intro.harekeler && intro.harekeler.items) {
      html += `
        <div class="intro-section">
          <div class="intro-title">
            <span class="ar">الحركات</span>
            Harekeler
          </div>
          <div class="grid">
            ${intro.harekeler.items.map(h => `
              <div class="card">
                <div class="card-title">${h.arabic || h.symbol}</div>
                <div class="card-sub">${h.name}</div>
                <div class="card-row">
                  <span class="card-label">Okunuş</span>
                  <span class="card-value tr">${h.okunus || h.pronunciation || ''}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">Örnek</span>
                  <span class="card-value">${h.ornek || h.example || ''}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // Temel Kurallar
    if (intro.temelKurallar && intro.temelKurallar.items) {
      html += `
        <div class="intro-section">
          <div class="intro-title">
            <span class="ar">القواعد</span>
            Temel Kurallar
          </div>
          <div class="list">
            ${intro.temelKurallar.items.map(k => `
              <div class="list-item">
                <span class="list-ar">${k.kural || k.arabic || ''}</span>
                <span class="list-tr">${k.aciklama || k.explanation || ''}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    container.innerHTML = html || '<div class="placeholder">İçerik hazırlanıyor...</div>';
  },
  
  renderVocab(vocab, container) {
    if (!vocab || !vocab.kelimeler) {
      container.innerHTML = '<div class="placeholder">Kelime verisi bulunamadı</div>';
      return;
    }
    
    const selector = document.getElementById('selector');
    const filter = selector.value;
    
    let words = vocab.kelimeler;
    if (filter && filter !== 'all') {
      const typeMap = { verbs: 'fiil', nouns: 'isim', particles: 'harf' };
      words = words.filter(w => w.tur === typeMap[filter]);
    }
    
    const html = `
      <div class="grid">
        ${words.map(w => `
          <div class="card" onclick="App.toggleCard(this)">
            <div class="card-title">${w.arapca}</div>
            <div class="card-sub">${w.tur || 'kelime'}</div>
            <div class="card-row">
              <span class="card-label">Türkçe</span>
              <span class="card-value tr">${w.turkce}</span>
            </div>
            ${w.kok ? `
            <div class="card-row">
              <span class="card-label">Kök</span>
              <span class="card-value">${w.kok}</span>
            </div>
            ` : ''}
            <div class="card-details">
              ${w.ornek ? `
              <div class="card-row">
                <span class="card-label">Örnek</span>
                <span class="card-value">${w.ornek}</span>
              </div>
              ` : ''}
              ${w.ornekTr ? `
              <div class="card-row">
                <span class="card-label">Çeviri</span>
                <span class="card-value tr">${w.ornekTr}</span>
              </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.innerHTML = html;
  },
  
  renderBasics(_, container) {
    const selector = document.getElementById('selector');
    const section = selector.value || 'pronouns';
    
    const sectionData = this.data[section + '_01'];
    if (!sectionData) {
      container.innerHTML = '<div class="placeholder">Veri bulunamadı</div>';
      return;
    }
    
    let items = sectionData.items || sectionData.zamirler || sectionData.isimler || sectionData.renkler || sectionData.sayilar || sectionData.sorular || [];
    
    const html = `
      <div class="detail">
        <div class="detail-header">
          <div class="detail-title">${sectionData.titleAr || ''}</div>
          <div class="detail-sub">${sectionData.title || ''}</div>
        </div>
        ${sectionData.description ? `<p style="margin-bottom: 16px; color: var(--text-dim);">${sectionData.description}</p>` : ''}
        <div class="grid">
          ${items.map(item => `
            <div class="card">
              <div class="card-title">${item.arapca || item.arabic || ''}</div>
              <div class="card-row">
                <span class="card-label">Türkçe</span>
                <span class="card-value tr">${item.turkce || item.turkish || ''}</span>
              </div>
              ${item.okunuş || item.okunush ? `
              <div class="card-row">
                <span class="card-label">Okunuş</span>
                <span class="card-value tr">${item.okunuş || item.okunush}</span>
              </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  },
  
  renderSarf(fileData, container) {
    if (!fileData) {
      container.innerHTML = '<div class="placeholder">Sarf verisi bulunamadı</div>';
      return;
    }
    
    let html = '';
    
    // Title section
    if (fileData.title || fileData.kitapAdi) {
      html += `
        <div class="detail">
          <div class="detail-header">
            <div class="detail-title">${fileData.titleAr || fileData.arapca || ''}</div>
            <div class="detail-sub">${fileData.title || fileData.kitapAdi || ''}</div>
          </div>
          ${fileData.description || fileData.aciklama ? `<p style="margin-bottom: 16px; color: var(--text-dim);">${fileData.description || fileData.aciklama}</p>` : ''}
        </div>
      `;
    }
    
    // Bablar (chapters)
    const bablar = fileData.bablar || fileData.babs || fileData.chapters || [];
    if (bablar.length > 0) {
      html += `
        <div class="section" style="margin-top: 24px;">
          <div class="section-title">Bablar</div>
          <div class="grid">
            ${bablar.map((bab, i) => `
              <div class="card" onclick="App.showBabDetail(${i})">
                <div class="card-title">${bab.vezin || bab.arabic || bab.pattern || ''}</div>
                <div class="card-sub">${bab.isim || bab.name || `Bab ${i + 1}`}</div>
                ${bab.ornek || bab.example ? `
                <div class="card-row">
                  <span class="card-label">Örnek</span>
                  <span class="card-value">${bab.ornek || bab.example}</span>
                </div>
                ` : ''}
                ${bab.anlam || bab.meaning ? `
                <div class="card-row">
                  <span class="card-label">Anlam</span>
                  <span class="card-value tr">${bab.anlam || bab.meaning}</span>
                </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // Veznler (patterns)
    const veznler = fileData.veznler || fileData.patterns || [];
    if (veznler.length > 0) {
      html += `
        <div class="section" style="margin-top: 24px;">
          <div class="section-title">Veznler</div>
          <div class="list">
            ${veznler.map(v => `
              <div class="list-item">
                <span class="list-ar">${v.vezin || v.arabic || v.pattern || ''}</span>
                <span class="list-tr">${v.anlam || v.meaning || v.turkce || ''}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // Fiiller (verbs)
    const fiiller = fileData.fiiller || fileData.verbs || [];
    if (fiiller.length > 0) {
      html += `
        <div class="section" style="margin-top: 24px;">
          <div class="section-title">Örnek Fiiller</div>
          <div class="grid">
            ${fiiller.map(f => `
              <div class="card">
                <div class="card-title">${f.mazi || f.arabic || ''}</div>
                <div class="card-sub">${f.anlam || f.meaning || ''}</div>
                ${f.muzari ? `
                <div class="card-row">
                  <span class="card-label">Muzari</span>
                  <span class="card-value">${f.muzari}</span>
                </div>
                ` : ''}
                ${f.masdar ? `
                <div class="card-row">
                  <span class="card-label">Masdar</span>
                  <span class="card-value">${f.masdar}</span>
                </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // Dersler (lessons)
    const dersler = fileData.dersler || fileData.lessons || [];
    if (dersler.length > 0) {
      html += `
        <div class="section" style="margin-top: 24px;">
          <div class="section-title">Dersler</div>
          <div class="list">
            ${dersler.map((d, i) => `
              <div class="list-item" onclick="App.showLesson('sarf', ${i})">
                <span class="list-ar">${d.titleAr || d.arabic || ''}</span>
                <span class="list-tr">${d.title || `Ders ${i + 1}`}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    container.innerHTML = html || '<div class="placeholder">İçerik hazırlanıyor...</div>';
  },
  
  renderNahiv(nahiv, container) {
    if (!nahiv) {
      container.innerHTML = '<div class="placeholder">Nahiv verisi bulunamadı</div>';
      return;
    }
    
    let html = `
      <div class="detail">
        <div class="detail-header">
          <div class="detail-title">${nahiv.titleAr || 'النحو'}</div>
          <div class="detail-sub">${nahiv.title || 'Nahiv Dersleri'}</div>
        </div>
        ${nahiv.description ? `<p style="margin-bottom: 16px; color: var(--text-dim);">${nahiv.description}</p>` : ''}
      </div>
    `;
    
    // Konular
    const konular = nahiv.konular || nahiv.topics || nahiv.dersler || [];
    if (konular.length > 0) {
      html += `
        <div class="section" style="margin-top: 24px;">
          <div class="section-title">Konular</div>
          <div class="list">
            ${konular.map((k, i) => `
              <div class="list-item" onclick="App.showLesson('nahiv', ${i})">
                <span class="list-ar">${k.titleAr || k.arabic || ''}</span>
                <span class="list-tr">${k.title || k.konu || `Konu ${i + 1}`}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // İrab Kuralları
    const irab = nahiv.irab || nahiv.irabiKurallar || [];
    if (irab.length > 0) {
      html += `
        <div class="section" style="margin-top: 24px;">
          <div class="section-title">İrab Kuralları</div>
          <div class="grid">
            ${irab.map(rule => `
              <div class="card">
                <div class="card-title">${rule.arabic || rule.kural || ''}</div>
                <div class="card-sub">${rule.isim || rule.name || ''}</div>
                <div class="card-row">
                  <span class="card-label">Açıklama</span>
                  <span class="card-value tr">${rule.aciklama || rule.explanation || ''}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    container.innerHTML = html || '<div class="placeholder">İçerik hazırlanıyor...</div>';
  },
  
  renderGrammar(grammar, container) {
    if (!grammar) {
      container.innerHTML = '<div class="placeholder">Gramer verisi bulunamadı</div>';
      return;
    }
    
    let html = `
      <div class="detail">
        <div class="detail-header">
          <div class="detail-title">${grammar.titleAr || 'القواعد'}</div>
          <div class="detail-sub">${grammar.title || 'Arapça Gramer'}</div>
        </div>
      </div>
    `;
    
    // Topics
    const topics = grammar.topics || grammar.konular || [];
    if (topics.length > 0) {
      html += `
        <div class="section" style="margin-top: 24px;">
          <div class="section-title">Gramer Konuları</div>
          <div class="grid">
            ${topics.map(t => `
              <div class="card" onclick="App.toggleCard(this)">
                <div class="card-title">${t.titleAr || t.arabic || ''}</div>
                <div class="card-sub">${t.title || t.konu || ''}</div>
                <div class="card-details">
                  <p style="color: var(--text-dim);">${t.explanation || t.aciklama || ''}</p>
                  ${t.examples ? `
                  <div style="margin-top: 12px;">
                    ${t.examples.map(ex => `
                      <div class="card-row">
                        <span class="card-value">${ex.arabic || ex.arapca || ''}</span>
                        <span class="card-value tr">${ex.turkish || ex.turkce || ''}</span>
                      </div>
                    `).join('')}
                  </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    container.innerHTML = html || '<div class="placeholder">İçerik hazırlanıyor...</div>';
  },
  
  renderRoots(_, container) {
    const html = `
      <div class="search-box">
        <input type="text" class="search-input" id="root-search" placeholder="Kök harf girin (örn: ك ت ب)">
        <button class="search-btn" onclick="App.searchRoot()">Ara</button>
      </div>
      <div id="root-results">
        <div class="placeholder">
          <div class="ar">الجذر</div>
          Aramak için yukarıya kök harfleri girin
        </div>
      </div>
    `;
    container.innerHTML = html;
  },
  
  searchRoot() {
    const input = document.getElementById('root-search').value.trim();
    const results = document.getElementById('root-results');
    
    if (!input) {
      results.innerHTML = '<div class="placeholder">Lütfen kök harfleri girin</div>';
      return;
    }
    
    // Search in vocab data
    const vocab = this.data.vocab_01;
    if (!vocab || !vocab.kelimeler) {
      results.innerHTML = '<div class="placeholder">Kelime verisi yüklenemedi</div>';
      return;
    }
    
    const found = vocab.kelimeler.filter(w => w.kok && w.kok.includes(input));
    
    if (found.length === 0) {
      results.innerHTML = `<div class="placeholder">
        <div class="ar">${input}</div>
        Bu kökten türemiş kelime bulunamadı
      </div>`;
      return;
    }
    
    results.innerHTML = `
      <div class="note">
        <strong>${input}</strong> kökünden ${found.length} kelime bulundu
      </div>
      <div class="grid">
        ${found.map(w => `
          <div class="card">
            <div class="card-title">${w.arapca}</div>
            <div class="card-sub">${w.tur || 'kelime'}</div>
            <div class="card-row">
              <span class="card-label">Türkçe</span>
              <span class="card-value tr">${w.turkce}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },
  
  renderPatterns(emsile, container) {
    if (!emsile) {
      container.innerHTML = '<div class="placeholder">Vezin verisi bulunamadı</div>';
      return;
    }
    
    const bablar = emsile.bablar || emsile.babs || [];
    
    let html = `
      <div class="detail">
        <div class="detail-header">
          <div class="detail-title">الأوزان</div>
          <div class="detail-sub">Fiil Veznleri</div>
        </div>
        <p style="margin-bottom: 16px; color: var(--text-dim);">Arapça fiillerin kalıpları ve çekimleri</p>
      </div>
      <div class="section" style="margin-top: 24px;">
        <div class="section-title">Mücerred Bablar</div>
        <div class="grid">
          ${bablar.map(bab => `
            <div class="card" onclick="App.toggleCard(this)">
              <div class="card-title">${bab.vezin || bab.pattern || ''}</div>
              <div class="card-sub">${bab.isim || bab.name || ''}</div>
              <div class="card-row">
                <span class="card-label">Örnek</span>
                <span class="card-value">${bab.ornek || bab.example || ''}</span>
              </div>
              <div class="card-details">
                ${bab.anlam ? `
                <div class="card-row">
                  <span class="card-label">Anlam</span>
                  <span class="card-value tr">${bab.anlam}</span>
                </div>
                ` : ''}
                ${bab.muzari ? `
                <div class="card-row">
                  <span class="card-label">Muzari</span>
                  <span class="card-value">${bab.muzari}</span>
                </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    container.innerHTML = html || '<div class="placeholder">İçerik hazırlanıyor...</div>';
  },
  
  renderIslamic(islamic, container) {
    if (!islamic) {
      container.innerHTML = '<div class="placeholder">İslami terim verisi bulunamadı</div>';
      return;
    }
    
    const terms = islamic.terms || islamic.terimler || islamic.items || [];
    
    let html = `
      <div class="detail">
        <div class="detail-header">
          <div class="detail-title">${islamic.titleAr || 'المصطلحات الإسلامية'}</div>
          <div class="detail-sub">${islamic.title || 'İslami Terimler'}</div>
        </div>
      </div>
      <div class="grid" style="margin-top: 24px;">
        ${terms.map(t => `
          <div class="card" onclick="App.toggleCard(this)">
            <div class="card-title">${t.arabic || t.arapca || ''}</div>
            <div class="card-sub">${t.category || t.kategori || ''}</div>
            <div class="card-row">
              <span class="card-label">Türkçe</span>
              <span class="card-value tr">${t.turkish || t.turkce || ''}</span>
            </div>
            <div class="card-details">
              ${t.explanation || t.aciklama ? `
              <p style="color: var(--text-dim);">${t.explanation || t.aciklama}</p>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.innerHTML = html || '<div class="placeholder">İçerik hazırlanıyor...</div>';
  },
  
  // ============ HELPER FUNCTIONS ============
  
  toggleCard(element) {
    element.classList.toggle('expanded');
  },
  
  showBabDetail(index) {
    // Could be expanded to show full bab details
    console.log('Show bab:', index);
  },
  
  showLesson(type, index) {
    // Could be expanded to show full lesson content
    console.log('Show lesson:', type, index);
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
