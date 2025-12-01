// Arabic Learning App - Minimal Version
const App = {
  currentPanel: null,
  data: {},
  dataLoaded: false,
  
  init() {
    const initLoadBtn = document.getElementById('init-load-btn');
    if (initLoadBtn) {
      initLoadBtn.addEventListener('click', () => this.startApp());
    }
  },
  
  async startApp() {
    const initBtn = document.getElementById('init-load-btn');
    if (initBtn) initBtn.textContent = 'Yükleniyor...';
    
    await this.loadAllData();
    this.bindNavigation();
    this.bindSelector();
    this.showPanel('intro');
  },
  
  async loadAllData() {
    const files = [
      'intro_01', 'vocab_01', 'grammar_01',
      'pronouns_01', 'demonstratives_01', 'colors_01', 'numbers_01', 'questions_01',
      'emsile_01', 'bina_01', 'maksud_01', 'sarf_01', 'nahiv_01',
      'islamic_terms_01', 'islamic_basics_01'
    ];
    
    for (const file of files) {
      try {
        const response = await fetch(`data/${file}.json`);
        if (response.ok) {
          this.data[file] = await response.json();
        }
      } catch (e) {}
    }
    this.dataLoaded = true;
  },
  
  bindNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.dataset.panel;
        this.showPanel(panel);
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  },
  
  bindSelector() {
    const selector = document.getElementById('selector');
    if (selector) {
      selector.addEventListener('change', () => {
        this.showPanel(this.currentPanel);
      });
    }
  },
  
  showPanel(panel) {
    this.currentPanel = panel;
    const content = document.getElementById('content');
    const pageTitle = document.getElementById('page-title');
    const selector = document.getElementById('selector');
    
    const panels = {
      intro: { title: 'Giriş', dataKey: 'intro_01', render: this.renderIntro },
      vocab: { title: 'Kelimeler', dataKey: 'vocab_01', render: this.renderVocab, hasSelector: true, selectorType: 'vocab' },
      basics: { title: 'Temel Konular', dataKey: 'pronouns_01', render: this.renderBasics, hasSelector: true, selectorType: 'basics' },
      emsile: { title: 'Emsile', dataKey: 'emsile_01', render: this.renderEmsile, hasSelector: true, selectorType: 'emsile' },
      bina: { title: 'Binâ', dataKey: 'bina_01', render: this.renderSarf },
      maksud: { title: 'Maksûd', dataKey: 'maksud_01', render: this.renderMaksud },
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
    
    if (config.hasSelector) {
      selector.classList.remove('hidden');
      this.setupSelector(config.selectorType);
    } else {
      selector.classList.add('hidden');
    }
    
    const panelData = this.data[config.dataKey];
    if (!panelData) {
      content.innerHTML = '<div class="placeholder"><div class="ar">لا توجد بيانات</div>Veri bulunamadı</div>';
      return;
    }
    
    config.render.call(this, panelData, content);
  },
  
  setupSelector(type) {
    const selector = document.getElementById('selector');
    selector.innerHTML = '';
    
    const options = {
      vocab: [
        { value: 'all', text: 'Tüm Kelimeler' },
        { value: 'noun', text: 'İsimler' },
        { value: 'verb', text: 'Fiiller' },
        { value: 'particle', text: 'Harfler' }
      ],
      basics: [
        { value: 'pronouns_01', text: 'Zamirler' },
        { value: 'demonstratives_01', text: 'İşaret İsimleri' },
        { value: 'colors_01', text: 'Renkler' },
        { value: 'numbers_01', text: 'Sayılar' },
        { value: 'questions_01', text: 'Soru Kelimeleri' }
      ],
      emsile: [
        { value: 'all', text: 'Tüm Bablar' },
        { value: '1', text: '1. Bab - فَعَلَ يَفْعُلُ' },
        { value: '2', text: '2. Bab - فَعَلَ يَفْعِلُ' },
        { value: '3', text: '3. Bab - فَعَلَ يَفْعَلُ' },
        { value: '4', text: '4. Bab - فَعِلَ يَفْعَلُ' },
        { value: '5', text: '5. Bab - فَعُلَ يَفْعُلُ' },
        { value: '6', text: '6. Bab - فَعِلَ يَفْعِلُ' }
      ]
    };
    
    (options[type] || []).forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      selector.appendChild(option);
    });
  },
  
  // ========== RENDER FUNCTIONS ==========
  
  renderIntro(data, container) {
    let html = '';
    
    if (data.meta) {
      html += `<div class="section"><h2 style="color: var(--accent); margin-bottom: 8px;">${data.meta.title || ''}</h2><p style="color: var(--text-dim);">${data.meta.description || ''}</p></div>`;
    }
    
    if (data.sections) {
      data.sections.forEach(section => {
        html += `<div class="section" style="margin-top: 24px;"><div class="section-title">${section.titleAr || ''} - ${section.title || ''}</div>`;
        
        if (section.content) {
          section.content.forEach(item => {
            if (item.heading) html += `<h4 style="margin: 16px 0 8px; color: var(--accent);">${item.heading}</h4>`;
            if (item.text) html += `<p style="color: var(--text-dim); margin-bottom: 8px;">${item.text}</p>`;
            if (item.list) {
              html += '<ul style="list-style: none; padding: 0;">';
              item.list.forEach(li => html += `<li style="padding: 4px 0; color: var(--text-dim);">${li}</li>`);
              html += '</ul>';
            }
            if (item.alphabet) {
              html += '<div class="alphabet-grid">';
              item.alphabet.forEach(l => html += `<div class="letter-box"><div class="letter-ar">${l.letter}</div><div class="letter-name">${l.name}</div></div>`);
              html += '</div>';
            }
            if (item.vowels) {
              html += '<div class="grid">';
              item.vowels.forEach(v => html += `<div class="card"><div class="card-title">${v.symbol}</div><div class="card-sub">${v.name}</div><div class="card-row"><span class="card-label">Ses</span><span class="card-value tr">${v.sound}</span></div><div class="card-row"><span class="card-label">Örnek</span><span class="card-value">${v.example}</span></div></div>`);
              html += '</div>';
            }
            if (item.categories) {
              html += '<div class="grid">';
              item.categories.forEach(cat => html += `<div class="card"><div class="card-title">${cat.nameAr || ''}</div><div class="card-sub">${cat.name}</div><p style="font-size: 13px; color: var(--text-dim);">${cat.description}</p></div>`);
              html += '</div>';
            }
          });
        }
        html += '</div>';
      });
    }
    
    container.innerHTML = html || '<div class="placeholder">İçerik hazırlanıyor...</div>';
  },
  
  renderVocab(data, container) {
    let words = Array.isArray(data) ? data : [];
    const selector = document.getElementById('selector');
    const filter = selector.value;
    
    if (filter && filter !== 'all') {
      words = words.filter(w => w.pos === filter);
    }
    
    if (words.length === 0) {
      container.innerHTML = '<div class="placeholder">Kelime bulunamadı</div>';
      return;
    }
    
    let html = '<div class="list">';
    words.forEach(w => {
      html += `<div class="list-item"><div style="flex: 1;"><div class="list-ar">${w.word}</div><div class="list-tr">${w.definition_tr} <span style="opacity: 0.5;">(${w.pos})</span></div></div><div style="text-align: right; font-size: 12px; color: var(--text-dim);">${w.root || ''}<br>${w.level || ''}</div></div>`;
    });
    html += '</div>';
    
    container.innerHTML = html;
  },
  
  renderBasics(_, container) {
    const selector = document.getElementById('selector');
    let dataKey = selector.value;
    
    // Eğer value boş veya basics ise default ata
    if (!dataKey || dataKey === '' || !dataKey.includes('_01')) {
      dataKey = 'pronouns_01';
      selector.value = dataKey;
    }
    
    const data = this.data[dataKey];
    
    if (!data || !Array.isArray(data)) {
      container.innerHTML = `<div class="placeholder">Veri bulunamadı: ${dataKey}</div>`;
      return;
    }
    
    let html = '';
    data.forEach(category => {
      html += `<div class="section" style="margin-bottom: 24px;"><div class="section-title">${category.category || ''}</div>`;
      if (category.note) {
        html += `<p style="color: var(--text-dim); font-size: 13px; margin-bottom: 12px;">${category.note}</p>`;
      }
      if (category.items) {
        html += '<div class="list">';
        category.items.forEach(item => {
          // Renkler için özel format (word_m, word_f)
          const word = item.word || item.word_m || '';
          const wordF = item.word_f ? ` / ${item.word_f}` : '';
          const meaning = item.meaning_tr || '';
          const translit = item.transliteration || '';
          const example = item.example_ar || (item.examples ? item.examples[0] : '') || '';
          
          html += `<div class="list-item"><div><div class="list-ar">${word}${wordF}</div><div class="list-tr">${meaning}</div></div><div style="text-align: right; font-size: 12px;"><div style="color: var(--text-dim);">${translit}</div><div class="ar" style="font-size: 14px; color: var(--text-dim);">${example}</div></div></div>`;
        });
        html += '</div>';
      }
      html += '</div>';
    });
    
    container.innerHTML = html || '<div class="placeholder">Veri bulunamadı</div>';
  },
  
  renderEmsile(data, container) {
    const selector = document.getElementById('selector');
    const filter = selector.value;
    let html = '';
    
    if (data.introduction && filter === 'all') {
      html += `<div class="section"><div class="section-title">${data.introduction.title}</div><p style="color: var(--text-dim); margin-bottom: 16px;">${data.introduction.content}</p>`;
      html += '<div class="grid">';
      data.introduction.sigalar.slice(0, 6).map(s => {
        html += `<div class="card" style="padding: 12px;"><div style="font-size: 11px; color: var(--text-dim);">${s.no}. ${s.name}</div><div class="ar" style="font-size: 16px;">${s.nameAr}</div><div style="font-size: 12px; color: var(--text-dim);">${s.meaning}</div></div>`;
      });
      html += '</div></div>';
    }
    
    if (data.bablar) {
      const bablar = filter === 'all' ? data.bablar : data.bablar.filter(b => b.bab.toString() === filter);
      
      bablar.forEach(bab => {
        html += `<div class="section" style="margin-top: 24px;"><div class="section-title"><span class="ar">${bab.nameAr}</span> - ${bab.name}</div>`;
        html += `<div class="detail" style="margin-top: 12px;"><div class="detail-header"><div class="detail-title">${bab.pattern}</div><div class="detail-sub">${bab.patternName} - ${bab.description}</div></div></div>`;
        
        if (bab.examples && bab.examples.length > 0) {
          const ex = bab.examples[0];
          html += '<div class="grid" style="margin-top: 16px;">';
          html += `<div class="card"><div class="card-sub">Kök: ${ex.root}</div><div class="card-title">${ex.tasrif.mazi.word}</div><div class="card-row"><span class="card-label">Anlam</span><span class="card-value tr">${ex.meaning}</span></div><div class="card-row"><span class="card-label">Okunuş</span><span class="card-value tr">${ex.tasrif.mazi.translit}</span></div></div>`;
          if (ex.tasrif.muzari) html += `<div class="card"><div class="card-sub">Muzari</div><div class="card-title">${ex.tasrif.muzari.word}</div><div class="card-row"><span class="card-label">Anlam</span><span class="card-value tr">${ex.tasrif.muzari.meaning}</span></div></div>`;
          if (ex.tasrif.masdar) html += `<div class="card"><div class="card-sub">Masdar</div><div class="card-title">${ex.tasrif.masdar.word}</div><div class="card-row"><span class="card-label">Anlam</span><span class="card-value tr">${ex.tasrif.masdar.meaning}</span></div></div>`;
          html += '</div>';
          
          if (ex.tasrif.mazi.conjugation) {
            html += '<div style="margin-top: 16px;"><h4 style="color: var(--accent); margin-bottom: 8px;">Mazi Çekimi</h4><div class="list">';
            ex.tasrif.mazi.conjugation.forEach(c => {
              html += `<div class="list-item" style="padding: 8px 12px;"><span class="ar" style="font-size: 16px;">${c.person}</span><span class="ar" style="font-size: 18px; color: var(--accent);">${c.form}</span><span style="font-size: 12px; color: var(--text-dim);">${c.translit}</span></div>`;
            });
            html += '</div></div>';
          }
        }
        html += '</div>';
      });
    }
    
    container.innerHTML = html || '<div class="placeholder">Emsile verisi bulunamadı</div>';
  },
  
  renderSarf(data, container) {
    let html = '';
    
    // Array yapısı (sarf_01.json gibi)
    if (Array.isArray(data)) {
      html += '<div class="section"><div class="section-title">Sarf Konuları</div></div>';
      data.forEach(topic => {
        html += `
          <div class="section" style="margin-top: 20px; padding: 16px; background: var(--card-bg); border-radius: 12px;">
            <div class="section-title" style="font-size: 16px;">${topic.topic || ''}</div>
            <p style="color: var(--text-dim); font-size: 13px; margin: 8px 0;">${topic.description || ''}</p>
            ${topic.pattern ? `<div style="background: var(--bg); padding: 8px 12px; border-radius: 8px; margin: 8px 0; font-family: 'Amiri'; font-size: 15px;">${topic.pattern}</div>` : ''}
            ${topic.examples ? `
              <div style="margin-top: 12px;">
                <div style="font-size: 12px; color: var(--accent); margin-bottom: 6px;">Örnekler:</div>
                ${topic.examples.map(ex => `<div style="padding: 4px 0; font-size: 14px;">${ex}</div>`).join('')}
              </div>
            ` : ''}
            ${topic.tips ? `
              <div style="margin-top: 12px;">
                <div style="font-size: 12px; color: var(--accent); margin-bottom: 6px;">İpuçları:</div>
                ${topic.tips.map(tip => `<div style="padding: 2px 0; font-size: 13px; color: var(--text-dim);">• ${tip}</div>`).join('')}
              </div>
            ` : ''}
          </div>
        `;
      });
    }
    // Object yapısı (meta, bablar gibi - maksud)
    else if (data.meta) {
      html += `<div class="detail"><div class="detail-header"><div class="detail-title">${data.meta.title || ''}</div><div class="detail-sub">${data.meta.description || ''}</div></div></div>`;
      
      if (data.introduction) {
        html += `<div class="section" style="margin-top: 16px;"><p style="color: var(--text-dim);">${data.introduction.content || ''}</p></div>`;
        
        if (data.introduction.illet_types) {
          html += '<div class="grid" style="margin-top: 16px;">';
          data.introduction.illet_types.forEach(t => {
            html += `<div class="card"><div class="card-title">${t.nameAr || ''}</div><div class="card-sub">${t.name}</div><p style="font-size: 12px; color: var(--text-dim);">${t.meaning}</p><div style="font-size: 14px; color: var(--accent);">${t.example || ''}</div></div>`;
          });
          html += '</div>';
        }
      }
      
      if (data.bablar) {
        html += '<div class="section" style="margin-top: 24px;"><div class="section-title">Bablar</div><div class="grid">';
        data.bablar.forEach(bab => {
          html += `<div class="card"><div class="card-title">${bab.pattern || bab.vezin || ''}</div><div class="card-sub">${bab.name || bab.isim || ''}</div></div>`;
        });
        html += '</div></div>';
      }
    }
    
    container.innerHTML = html || '<div class="placeholder">Sarf verisi hazırlanıyor...</div>';
  },
  
  renderNahiv(data, container) {
    let html = '';
    
    // Array yapısı (nahiv_01.json)
    if (Array.isArray(data)) {
      html += '<div class="section"><div class="section-title">Nahiv Konuları</div></div>';
      data.forEach(topic => {
        html += `
          <div class="section" style="margin-top: 20px; padding: 16px; background: var(--card-bg); border-radius: 12px;">
            <div class="section-title" style="font-size: 16px;">${topic.topic || ''}</div>
            <p style="color: var(--text-dim); font-size: 13px; margin: 8px 0;">${topic.description || ''}</p>
            ${topic.pattern ? `<div style="background: var(--bg); padding: 8px 12px; border-radius: 8px; margin: 8px 0; font-size: 14px;">${topic.pattern}</div>` : ''}
            ${topic.examples ? `
              <div style="margin-top: 12px;">
                <div style="font-size: 12px; color: var(--accent); margin-bottom: 6px;">Örnekler:</div>
                ${topic.examples.map(ex => `<div style="padding: 4px 0; font-size: 14px;">${ex}</div>`).join('')}
              </div>
            ` : ''}
            ${topic.tips ? `
              <div style="margin-top: 12px;">
                <div style="font-size: 12px; color: var(--accent); margin-bottom: 6px;">Kurallar:</div>
                ${topic.tips.map(tip => `<div style="padding: 2px 0; font-size: 13px; color: var(--text-dim);">• ${tip}</div>`).join('')}
              </div>
            ` : ''}
          </div>
        `;
      });
    }
    // Object yapısı
    else if (data.meta) {
      html += `<div class="detail"><div class="detail-header"><div class="detail-title">${data.meta.title || 'Nahiv'}</div></div></div>`;
      if (data.topics || data.konular) {
        const topics = data.topics || data.konular || [];
        html += '<div class="list" style="margin-top: 16px;">';
        topics.forEach(t => html += `<div class="list-item"><span class="list-ar">${t.titleAr || ''}</span><span class="list-tr">${t.title || ''}</span></div>`);
        html += '</div>';
      }
    }
    
    container.innerHTML = html || '<div class="placeholder">Nahiv verisi hazırlanıyor...</div>';
  },
  
  renderGrammar(data, container) {
    let html = '<div class="section"><div class="section-title">Arapça Gramer</div></div>';
    
    // Array yapısı (grammar_01.json)
    if (Array.isArray(data)) {
      data.forEach(topic => {
        html += `
          <div class="section" style="margin-top: 20px; padding: 16px; background: var(--card-bg); border-radius: 12px;">
            <div class="section-title" style="font-size: 16px;">${topic.topic || ''}</div>
            <span style="font-size: 11px; background: var(--accent); color: var(--bg); padding: 2px 8px; border-radius: 4px;">${topic.level || ''}</span>
            <p style="color: var(--text-dim); font-size: 13px; margin: 12px 0;">${topic.description || ''}</p>
            ${topic.pattern ? `<div style="background: var(--bg); padding: 8px 12px; border-radius: 8px; margin: 8px 0; font-size: 14px;">${topic.pattern}</div>` : ''}
            ${topic.examples ? `
              <div style="margin-top: 12px;">
                <div style="font-size: 12px; color: var(--accent); margin-bottom: 6px;">Örnekler:</div>
                ${topic.examples.map(ex => `<div style="padding: 4px 0; font-size: 14px;">${ex}</div>`).join('')}
              </div>
            ` : ''}
            ${topic.tips ? `
              <div style="margin-top: 12px;">
                <div style="font-size: 12px; color: var(--accent); margin-bottom: 6px;">İpuçları:</div>
                ${topic.tips.map(tip => `<div style="padding: 2px 0; font-size: 13px; color: var(--text-dim);">• ${tip}</div>`).join('')}
              </div>
            ` : ''}
            ${topic.mistakes ? `
              <div style="margin-top: 12px;">
                <div style="font-size: 12px; color: #e57373; margin-bottom: 6px;">⚠️ Sık Yapılan Hatalar:</div>
                ${topic.mistakes.map(m => `<div style="padding: 2px 0; font-size: 13px; color: #e57373;">• ${m}</div>`).join('')}
              </div>
            ` : ''}
          </div>
        `;
      });
    }
    // Object yapısı
    else if (data.topics) {
      html += '<div class="grid" style="margin-top: 16px;">';
      data.topics.forEach(t => html += `<div class="card"><div class="card-title">${t.titleAr || ''}</div><div class="card-sub">${t.title || ''}</div></div>`);
      html += '</div>';
    }
    
    container.innerHTML = html;
  },
  
  renderMaksud(data, container) {
    let html = '';
    
    if (data.meta) {
      html += `
        <div class="detail">
          <div class="detail-header">
            <div class="detail-title">${data.meta.title || 'Maksud'}</div>
            <div class="detail-sub">${data.meta.description || ''}</div>
          </div>
        </div>
      `;
    }
    
    if (data.introduction) {
      html += `
        <div class="section" style="margin-top: 16px; padding: 16px; background: var(--card-bg); border-radius: 12px;">
          <div class="section-title">${data.introduction.title || ''}</div>
          <p style="color: var(--text-dim); font-size: 14px; margin: 12px 0;">${data.introduction.content || ''}</p>
      `;
      
      if (data.introduction.illet_harfleri) {
        html += `
          <div style="margin-top: 12px; padding: 12px; background: var(--bg); border-radius: 8px;">
            <div style="font-size: 13px; color: var(--accent); margin-bottom: 8px;">${data.introduction.illet_harfleri.title}</div>
            <div style="font-family: 'Amiri'; font-size: 20px; direction: rtl;">${data.introduction.illet_harfleri.letters.join(' - ')}</div>
            <div style="font-size: 12px; color: var(--text-dim); margin-top: 6px;">${data.introduction.illet_harfleri.note || ''}</div>
          </div>
        `;
      }
      
      if (data.introduction.illet_types) {
        html += '<div class="grid" style="margin-top: 16px;">';
        data.introduction.illet_types.forEach(t => {
          html += `
            <div class="card">
              <div class="card-title">${t.nameAr || ''}</div>
              <div class="card-sub">${t.name}</div>
              <p style="font-size: 12px; color: var(--text-dim); margin: 8px 0;">${t.meaning}</p>
              <div style="font-family: 'Amiri'; font-size: 16px; color: var(--accent);">${t.example || ''}</div>
              ${t.subtypes ? t.subtypes.map(st => `<div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">• ${st.name}: ${st.example}</div>`).join('') : ''}
            </div>
          `;
        });
        html += '</div>';
      }
      html += '</div>';
    }
    
    // Misal, Ecvef, Nakıs, Lefif, Muzaaf bölümleri
    const sections = ['misal', 'ecvef', 'nakis', 'lefif', 'muzaaf'];
    sections.forEach(section => {
      if (data[section]) {
        const sectionData = data[section];
        html += `
          <div class="section" style="margin-top: 24px;">
            <div class="section-title">${sectionData.title || section}</div>
            <p style="color: var(--text-dim); font-size: 13px; margin-bottom: 16px;">${sectionData.description || ''}</p>
        `;
        
        if (sectionData.types) {
          sectionData.types.forEach(type => {
            html += `
              <div style="margin-bottom: 20px; padding: 16px; background: var(--card-bg); border-radius: 12px;">
                <div style="font-size: 15px; font-weight: 600; color: var(--text);">${type.type || ''}</div>
                <div style="font-family: 'Amiri'; font-size: 18px; color: var(--accent); margin: 4px 0;">${type.typeAr || ''}</div>
                <p style="font-size: 12px; color: var(--text-dim);">${type.description || ''}</p>
            `;
            
            if (type.examples) {
              type.examples.forEach(ex => {
                html += `
                  <div style="margin-top: 12px; padding: 12px; background: var(--bg); border-radius: 8px;">
                    <div style="font-size: 11px; color: var(--text-dim);">Kök: ${ex.root || ''}</div>
                    <div style="font-size: 13px; margin: 4px 0;">${ex.meaning || ''}</div>
                `;
                
                if (ex.tasrif) {
                  const t = ex.tasrif;
                  html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; margin-top: 8px;">';
                  
                  if (t.mazi) html += `<div style="padding: 8px; background: var(--card-bg); border-radius: 6px;"><div style="font-size: 10px; color: var(--text-dim);">Mazi</div><div style="font-family: 'Amiri'; font-size: 16px;">${t.mazi.word || ''}</div><div style="font-size: 11px;">${t.mazi.meaning || ''}</div></div>`;
                  if (t.muzari) html += `<div style="padding: 8px; background: var(--card-bg); border-radius: 6px;"><div style="font-size: 10px; color: var(--text-dim);">Muzari</div><div style="font-family: 'Amiri'; font-size: 16px;">${t.muzari.word || ''}</div><div style="font-size: 11px;">${t.muzari.meaning || ''}</div>${t.muzari.note ? `<div style="font-size: 10px; color: var(--accent);">${t.muzari.note}</div>` : ''}</div>`;
                  if (t.emir) html += `<div style="padding: 8px; background: var(--card-bg); border-radius: 6px;"><div style="font-size: 10px; color: var(--text-dim);">Emir</div><div style="font-family: 'Amiri'; font-size: 16px;">${t.emir.word || ''}</div><div style="font-size: 11px;">${t.emir.meaning || ''}</div></div>`;
                  if (t.masdar) html += `<div style="padding: 8px; background: var(--card-bg); border-radius: 6px;"><div style="font-size: 10px; color: var(--text-dim);">Masdar</div><div style="font-family: 'Amiri'; font-size: 16px;">${t.masdar.word || ''}</div><div style="font-size: 11px;">${t.masdar.meaning || ''}</div></div>`;
                  if (t.ism_fail) html += `<div style="padding: 8px; background: var(--card-bg); border-radius: 6px;"><div style="font-size: 10px; color: var(--text-dim);">İsm-i Fail</div><div style="font-family: 'Amiri'; font-size: 16px;">${t.ism_fail.word || ''}</div><div style="font-size: 11px;">${t.ism_fail.meaning || ''}</div></div>`;
                  if (t.ism_meful) html += `<div style="padding: 8px; background: var(--card-bg); border-radius: 6px;"><div style="font-size: 10px; color: var(--text-dim);">İsm-i Mef'ul</div><div style="font-family: 'Amiri'; font-size: 16px;">${t.ism_meful.word || ''}</div><div style="font-size: 11px;">${t.ism_meful.meaning || ''}</div></div>`;
                  
                  html += '</div>';
                }
                
                html += '</div>';
              });
            }
            
            html += '</div>';
          });
        }
        
        html += '</div>';
      }
    });
    
    container.innerHTML = html || '<div class="placeholder">Maksud verisi hazırlanıyor...</div>';
  },

  renderRoots(data, container) {
    container.innerHTML = `<div class="search-box"><input type="text" class="search-input" id="root-search" placeholder="Kök girin (ك ت ب)"><button class="search-btn" onclick="App.searchRoot()">Ara</button></div><div id="root-results"><div class="placeholder"><div class="ar">الجذر</div>Kök harfleri girin</div></div>`;
  },
  
  searchRoot() {
    const input = document.getElementById('root-search').value.trim();
    const results = document.getElementById('root-results');
    const vocab = this.data.vocab_01;
    if (!input || !vocab) { results.innerHTML = '<div class="placeholder">Kök girin</div>'; return; }
    const found = vocab.filter(w => w.root && w.root.includes(input));
    if (found.length === 0) { results.innerHTML = `<div class="placeholder">${input} - bulunamadı</div>`; return; }
    results.innerHTML = `<div class="note">${found.length} kelime bulundu</div><div class="list">${found.map(w => `<div class="list-item"><div><div class="list-ar">${w.word}</div><div class="list-tr">${w.definition_tr}</div></div></div>`).join('')}</div>`;
  },
  
  renderPatterns(data, container) {
    let html = '<div class="detail"><div class="detail-header"><div class="detail-title">الأوزان - Veznler</div></div></div>';
    if (data.bablar) {
      html += '<div class="grid" style="margin-top: 16px;">';
      data.bablar.forEach(bab => html += `<div class="card"><div class="card-title">${bab.pattern}</div><div class="card-sub">${bab.name}</div><div class="card-row"><span class="card-value tr">${bab.description || ''}</span></div></div>`);
      html += '</div>';
    }
    container.innerHTML = html;
  },
  
  renderIslamic(data, container) {
    let items = Array.isArray(data) ? data : (data.terms || data.items || []);
    if (items.length === 0) { container.innerHTML = '<div class="placeholder">Veri bulunamadı</div>'; return; }
    container.innerHTML = `<div class="list">${items.map(t => `<div class="list-item"><div><div class="list-ar">${t.arabic || t.word || ''}</div><div class="list-tr">${t.turkish || t.meaning_tr || ''}</div></div></div>`).join('')}</div>`;
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
