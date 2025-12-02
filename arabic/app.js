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
    this.showPanel('intro');
  },
  
  async loadAllData() {
    const files = [
      'intro_01', 'vocab_01', 'grammar_01', 'quiz_01',
      'pronouns_01', 'demonstratives_01', 'colors_01', 'numbers_01', 'questions_01',
      'emsile_01', 'bina_01', 'maksud_01', 'sarf_01', 'nahiv_01',
      'islamic_terms_01', 'islamic_basics_01',
      'family_01', 'food_01', 'time_01', 'places_01', 'phrases_01', 'stories_01'
    ];
    
    for (const file of files) {
      try {
        const response = await fetch(`data/${file}.json`);
        if (response.ok) {
          this.data[file] = await response.json();
          console.log(`✓ Loaded: ${file}`);
        } else {
          console.warn(`✗ Failed to load: ${file} (${response.status})`);
        }
      } catch (e) {
        console.error(`✗ Error loading ${file}:`, e);
      }
    }
    
    // Kök dosyalarını dinamik yükle
    await this.loadRootsIndex();
    
    this.dataLoaded = true;
    console.log('All data loaded:', Object.keys(this.data));
  },
  
  async loadRootsIndex() {
    try {
      const response = await fetch('data/roots_index.json');
      if (!response.ok) return;
      
      const index = await response.json();
      this.data.roots_index = index;
      this.data.all_roots = [];
      
      // Her kök dosyasını yükle
      for (const rootFile of index.files) {
        try {
          const res = await fetch(`data/${rootFile.file}`);
          if (res.ok) {
            const data = await res.json();
            this.data[rootFile.id] = data;
            // Tüm kökleri birleştir
            if (data.roots) {
              this.data.all_roots.push(...data.roots);
            }
            console.log(`✓ Loaded roots: ${rootFile.id} (${data.roots?.length || 0} kök)`);
          }
        } catch (e) {
          console.error(`✗ Error loading ${rootFile.file}:`, e);
        }
      }
      
      console.log(`📚 Toplam ${this.data.all_roots.length} kök yüklendi`);
    } catch (e) {
      console.error('Roots index yüklenemedi:', e);
    }
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
  
  showPanel(panel) {
    this.currentPanel = panel;
    const content = document.getElementById('content');
    const pageTitle = document.getElementById('page-title');
    
    const panels = {
      intro: { title: 'Giriş', dataKey: 'intro_01', render: this.renderIntro },
      vocab: { title: 'Kelimeler', dataKey: 'vocab_01', render: this.renderVocab },
      pronouns: { title: 'Zamirler', dataKey: 'pronouns_01', render: this.renderBasicTopic },
      demonstratives: { title: 'İşaret İsimleri', dataKey: 'demonstratives_01', render: this.renderBasicTopic },
      colors: { title: 'Renkler', dataKey: 'colors_01', render: this.renderBasicTopic },
      numbers: { title: 'Sayılar', dataKey: 'numbers_01', render: this.renderBasicTopic },
      questions: { title: 'Soru Kelimeleri', dataKey: 'questions_01', render: this.renderBasicTopic },
      emsile: { title: 'Emsile (6 Bab)', dataKey: 'emsile_01', render: this.renderEmsile },
      bina: { title: 'Binâ', dataKey: 'bina_01', render: this.renderSarf },
      maksud: { title: 'Maksûd', dataKey: 'maksud_01', render: this.renderMaksud },
      sarf: { title: 'Sarf Dersleri', dataKey: 'sarf_01', render: this.renderSarf },
      nahiv: { title: 'Nahiv Dersleri', dataKey: 'nahiv_01', render: this.renderNahiv },
      grammar: { title: 'Gramer', dataKey: 'grammar_01', render: this.renderGrammar },
      roots: { title: 'Kök Ara', dataKey: 'vocab_01', render: this.renderRoots },
      patterns: { title: 'Veznler', dataKey: 'emsile_01', render: this.renderPatterns },
      islamic: { title: 'İslami Terimler', dataKey: 'islamic_terms_01', render: this.renderIslamic },
      quiz: { title: 'Quiz', dataKey: 'quiz_01', render: this.renderQuiz },
      roots50: { title: '50 Temel Kök', dataKey: 'common_50', render: this.renderRoots50 },
      family: { title: 'Aile', dataKey: 'family_01', render: this.renderCategoryList },
      food: { title: 'Yiyecek/İçecek', dataKey: 'food_01', render: this.renderCategoryList },
      time: { title: 'Zaman', dataKey: 'time_01', render: this.renderCategoryList },
      places: { title: 'Mekanlar', dataKey: 'places_01', render: this.renderCategoryList },
      phrases: { title: 'Günlük Kalıplar', dataKey: 'phrases_01', render: this.renderPhrases },
      stories: { title: 'Hikayeler', dataKey: 'stories_01', render: this.renderStories }
    };
    
    const config = panels[panel];
    if (!config) return;
    
    pageTitle.textContent = config.title;
    
    const panelData = this.data[config.dataKey];
    if (!panelData) {
      content.innerHTML = '<div class="placeholder"><div class="ar">لا توجد بيانات</div>Veri bulunamadı</div>';
      return;
    }
    
    config.render.call(this, panelData, content);
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
  
  renderCategoryList(data, container) {
    if (!data || !data.categories) {
      container.innerHTML = '<div class="placeholder">Veri bulunamadı</div>';
      return;
    }
    
    let html = '';
    
    // Meta bilgisi
    if (data.meta) {
      html += `<div class="section"><div class="section-title">${data.meta.title || ''}</div><p style="color: var(--text-dim);">Toplam: ${data.meta.totalItems || 0} kelime</p></div>`;
    }
    
    // Kategoriler
    data.categories.forEach(cat => {
      html += `<div class="section" style="margin-bottom: 24px;"><div class="section-title">${cat.nameAr || ''} | ${cat.name || ''}</div>`;
      html += '<div class="list">';
      
      cat.items.forEach(item => {
        html += `
          <div class="list-item">
            <div style="flex: 1;">
              <div class="list-ar">${item.word}${item.plural ? ` <span style="font-size: 14px; opacity: 0.6;">(ج: ${item.plural})</span>` : ''}</div>
              <div class="list-tr">${item.meaning}</div>
              ${item.example ? `<div style="font-size: 12px; color: var(--text-dim); margin-top: 4px; font-family: var(--font-ar);">${item.example}</div>` : ''}
            </div>
            <div style="text-align: right; font-size: 11px; color: var(--text-dim);">${item.trans || ''}</div>
          </div>
        `;
      });
      
      html += '</div></div>';
    });
    
    // Faydalı kalıplar
    if (data.usefulPhrases) {
      html += `<div class="section" style="margin-top: 32px;"><div class="section-title">💬 Faydalı Kalıplar</div>`;
      html += '<div class="list">';
      data.usefulPhrases.forEach(p => {
        html += `<div class="list-item"><div class="list-ar">${p.phrase}</div><div class="list-tr">${p.meaning}</div></div>`;
      });
      html += '</div></div>';
    }
    
    // Tatlar (food için)
    if (data.tastes) {
      html += `<div class="section" style="margin-top: 24px;"><div class="section-title">👅 Tatlar</div>`;
      html += '<div class="grid">';
      data.tastes.forEach(t => {
        html += `<div class="card"><div class="card-title">${t.word}</div><div class="card-sub">${t.meaning}</div></div>`;
      });
      html += '</div></div>';
    }
    
    container.innerHTML = html;
  },
  
  renderPhrases(data, container) {
    if (!data || !data.categories) {
      container.innerHTML = '<div class="placeholder">Veri bulunamadı</div>';
      return;
    }
    
    let html = '';
    
    // Meta
    if (data.meta) {
      html += `<div class="section"><div class="section-title">${data.meta.title || ''}</div></div>`;
    }
    
    // Kategoriler
    data.categories.forEach(cat => {
      html += `<div class="section" style="margin-bottom: 24px;"><div class="section-title">${cat.nameAr || ''} | ${cat.name || ''}</div>`;
      html += '<div class="phrases-list">';
      
      cat.items.forEach(item => {
        html += `
          <div class="phrase-card">
            <div class="phrase-ar">${item.phrase}</div>
            <div class="phrase-tr">${item.meaning}</div>
            ${item.response ? `<div class="phrase-response"><span style="color: var(--text-dim);">↩️ Cevap:</span> ${item.response}</div>` : ''}
            ${item.context ? `<div class="phrase-context">${item.context}</div>` : ''}
          </div>
        `;
      });
      
      html += '</div></div>';
    });
    
    // Durumsal kalıplar
    if (data.situationalPhrases) {
      html += `<div class="section" style="margin-top: 32px;"><div class="section-title">🎯 Durumsal Kalıplar</div>`;
      
      data.situationalPhrases.forEach(sit => {
        html += `<div class="situation-box"><div class="situation-title">${sit.situation}</div>`;
        html += '<div class="phrases-list">';
        sit.phrases.forEach(p => {
          html += `<div class="phrase-card small"><div class="phrase-ar">${p.phrase}</div><div class="phrase-tr">${p.meaning}</div></div>`;
        });
        html += '</div></div>';
      });
      
      html += '</div>';
    }
    
    container.innerHTML = html;
  },
  
  // Aktif hikaye durumu
  activeStory: null,
  
  renderStories(data, container) {
    if (!data || !data.stories) {
      container.innerHTML = '<div class="placeholder">Hikaye bulunamadı</div>';
      return;
    }
    
    // Eğer aktif hikaye varsa onu göster
    if (this.activeStory !== null) {
      this.renderSingleStory(data.stories[this.activeStory], container);
      return;
    }
    
    // Hikaye listesi
    let html = `
      <div class="section">
        <div class="section-title">${data.meta?.title || 'Hikayeler'}</div>
        <p style="color: var(--text-dim);">${data.meta?.description || ''}</p>
      </div>
      <div class="stories-grid">
    `;
    
    data.stories.forEach((story, index) => {
      html += `
        <div class="story-card" onclick="App.openStory(${index})">
          <div class="story-number">${story.id}</div>
          <div class="story-title-ar">${story.title}</div>
          <div class="story-title-tr">${story.titleTr}</div>
          <div class="story-info">${story.paragraphs.length} paragraf • ${story.vocabulary.length} kelime</div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
  },
  
  openStory(index) {
    this.activeStory = index;
    this.showPanel('stories');
  },
  
  closeStory() {
    this.activeStory = null;
    this.showPanel('stories');
  },
  
  renderSingleStory(story, container) {
    let html = `
      <div class="story-header">
        <button class="back-btn" onclick="App.closeStory()">← Geri</button>
        <div class="story-main-title">
          <div class="story-title-ar">${story.title}</div>
          <div class="story-title-tr">${story.titleTr}</div>
        </div>
      </div>
      
      <!-- Tab Navigation -->
      <div class="story-tabs">
        <button class="story-tab active" data-tab="text">📖 Metin</button>
        <button class="story-tab" data-tab="grammar">📐 Gramer Şerhi</button>
        <button class="story-tab" data-tab="vocab">📚 Kelime Tahlili</button>
      </div>
      
      <!-- Metin Tab -->
      <div class="story-tab-content active" id="tab-text">
        <div class="story-content">
    `;
    
    story.paragraphs.forEach((p, i) => {
      html += `
        <div class="story-paragraph">
          <div class="paragraph-num">${i + 1}</div>
          <div class="paragraph-ar">${p.arabic}</div>
          <div class="paragraph-tr">${p.turkish}</div>
        </div>
      `;
    });
    
    html += '</div>';
    
    // Ders / Hikayenin özü
    if (story.moral) {
      html += `
        <div class="story-moral">
          <div class="moral-label">📖 Hikayenin Dersi</div>
          <div class="moral-ar">${story.moral.arabic}</div>
          <div class="moral-tr">${story.moral.turkish}</div>
          ${story.moral.grammaticalNote ? `<div class="moral-grammar">${story.moral.grammaticalNote}</div>` : ''}
        </div>
      `;
    }
    
    html += '</div>';
    
    // Gramer Tab
    html += '<div class="story-tab-content" id="tab-grammar">';
    
    if (story.grammar && story.grammar.length > 0) {
      story.grammar.forEach(g => {
        html += `
          <div class="grammar-section">
            <div class="grammar-title">${g.title}</div>
            <div class="grammar-explanation">${g.explanation}</div>
            <div class="grammar-examples">
        `;
        
        g.examples.forEach(ex => {
          html += `
            <div class="grammar-example">
              <div class="example-ar">${ex.arabic}</div>
              <div class="example-analysis">${ex.analysis}</div>
              <div class="example-tr">${ex.turkish}</div>
            </div>
          `;
        });
        
        html += '</div></div>';
      });
    }
    
    html += '</div>';
    
    // Kelime Tahlili Tab
    html += '<div class="story-tab-content" id="tab-vocab">';
    html += '<div class="vocab-detailed-grid">';
    
    story.vocabulary.forEach(v => {
      html += `
        <div class="vocab-detailed-item">
          <div class="vocab-word-ar">${v.word}</div>
          <div class="vocab-details">
            <div class="vocab-row"><span class="vocab-label">Kök:</span> <span class="vocab-value ar-text">${v.root || '-'}</span></div>
            <div class="vocab-row"><span class="vocab-label">Vezin:</span> <span class="vocab-value ar-text">${v.pattern || '-'}</span></div>
            <div class="vocab-row"><span class="vocab-label">Tür:</span> <span class="vocab-value ar-text">${v.type || '-'}</span></div>
            <div class="vocab-row"><span class="vocab-label">Anlam:</span> <span class="vocab-value">${v.meaning}</span></div>
            ${v.conjugation ? `<div class="vocab-row"><span class="vocab-label">Tasrif:</span> <span class="vocab-value ar-text">${v.conjugation}</span></div>` : ''}
            ${v.plural ? `<div class="vocab-row"><span class="vocab-label">Çoğul:</span> <span class="vocab-value ar-text">${v.plural}</span></div>` : ''}
            ${v.opposite ? `<div class="vocab-row"><span class="vocab-label">Zıddı:</span> <span class="vocab-value ar-text">${v.opposite}</span></div>` : ''}
          </div>
        </div>
      `;
    });
    
    html += '</div></div>';
    
    container.innerHTML = html;
    
    // Tab switching
    container.querySelectorAll('.story-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.story-tab').forEach(t => t.classList.remove('active'));
        container.querySelectorAll('.story-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        container.querySelector('#tab-' + tab.dataset.tab).classList.add('active');
      });
    });
  },
  
  renderVocab(data, container) {
    let words = Array.isArray(data) ? data : [];
    
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
  
  renderBasicTopic(data, container) {
    if (!data || !Array.isArray(data)) {
      container.innerHTML = '<div class="placeholder">Veri bulunamadı</div>';
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
    let html = '';
    
    if (data.introduction) {
      html += `<div class="section"><div class="section-title">${data.introduction.title}</div><p style="color: var(--text-dim); margin-bottom: 16px;">${data.introduction.content}</p>`;
      html += '<div class="grid">';
      data.introduction.sigalar.slice(0, 6).map(s => {
        html += `<div class="card" style="padding: 12px;"><div style="font-size: 11px; color: var(--text-dim);">${s.no}. ${s.name}</div><div class="ar" style="font-size: 16px;">${s.nameAr}</div><div style="font-size: 12px; color: var(--text-dim);">${s.meaning}</div></div>`;
      });
      html += '</div></div>';
    }
    
    if (data.bablar) {
      data.bablar.forEach(bab => {
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
    // data: array of categories, each with items array
    if (!data || !Array.isArray(data) || data.length === 0) {
      container.innerHTML = '<div class="placeholder">Veri bulunamadı</div>';
      return;
    }
    
    let html = '';
    data.forEach(category => {
      const items = category.items || [];
      if (items.length === 0) return;
      
      html += `<div class="section"><div class="section-title">${category.category || ''}</div></div>`;
      html += '<div class="list">';
      items.forEach(t => {
        html += `
          <div class="list-item">
            <div>
              <div class="list-ar">${t.word || ''}</div>
              <div class="list-tr">${t.meaning_tr || ''}</div>
              ${t.definition ? `<div style="font-size: 12px; color: var(--text-dim); margin-top: 4px;">${t.definition}</div>` : ''}
            </div>
          </div>
        `;
      });
      html += '</div>';
    });
    
    container.innerHTML = html || '<div class="placeholder">Veri bulunamadı</div>';
  },
  
  renderRoots50(data, container) {
    // Tüm kökleri all_roots'tan al (birleştirilmiş)
    const allRoots = this.data.all_roots || [];
    const index = this.data.roots_index;
    
    if (allRoots.length === 0) {
      container.innerHTML = '<div class="placeholder">Kök verisi bulunamadı</div>';
      return;
    }
    
    let html = `
      <div class="section">
        <div class="section-title">🌳 Arapça Kök Koleksiyonu</div>
        <p style="color: var(--text-dim); margin-bottom: 8px;">Toplam ${allRoots.length} kök yüklendi</p>
        <p style="color: var(--text-dim); font-size: 12px; margin-bottom: 12px;">Bu kökler Kur'an'daki kelimelerin büyük çoğunluğunu kapsar</p>
    `;
    
    // Dosya listesi
    if (index?.files) {
      html += '<div class="roots-files">';
      index.files.forEach(f => {
        html += `<span class="roots-file-tag">📁 ${f.name} (${f.count})</span>`;
      });
      html += '</div>';
    }
    
    html += '</div>';
    
    // Arama kutusu
    html += `
      <div class="search-box" style="margin-bottom: 20px;">
        <input type="text" id="roots-search" placeholder="Kök ara... (örn: ك ت ب veya yazmak)" 
               style="width: 100%; padding: 12px 16px; background: var(--bg-lighter); border: 1px solid var(--border); 
                      border-radius: 8px; color: var(--text); font-size: 14px;">
      </div>
    `;
    
    html += '<div class="roots-grid" id="roots-container">';
    
    allRoots.forEach((root) => {
      html += `
        <div class="root-card" data-root="${root.root}" data-meaning="${root.meaning}">
          <div class="root-number">${root.id}</div>
          <div class="root-main">
            <div class="root-arabic">${root.root}</div>
            <div class="root-trans">${root.transliteration}</div>
          </div>
          <div class="root-meaning">${root.meaning}</div>
          <div class="root-freq">📊 ${root.frequency}x</div>
          <div class="root-examples">
            ${root.examples.map(ex => `<span class="root-ex">${ex}</span>`).join('')}
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Arama fonksiyonu
    const searchInput = document.getElementById('roots-search');
    const rootsContainer = document.getElementById('roots-container');
    
    searchInput?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const cards = rootsContainer.querySelectorAll('.root-card');
      
      cards.forEach(card => {
        const root = card.dataset.root?.toLowerCase() || '';
        const meaning = card.dataset.meaning?.toLowerCase() || '';
        const text = card.textContent.toLowerCase();
        
        if (!query || root.includes(query) || meaning.includes(query) || text.includes(query)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  },
  
  // Quiz State
  quizState: {
    currentCategory: null,
    currentQuestion: 0,
    score: 0,
    answered: false,
    questions: []
  },
  
  renderQuiz(data, container) {
    if (!data || !data.categories) {
      container.innerHTML = '<div class="placeholder">Quiz verisi bulunamadı</div>';
      return;
    }
    
    // Kategori seçim ekranı
    let html = `
      <div class="section">
        <div class="section-title">🧪 Arapça Quiz</div>
        <p style="color: var(--text-dim); margin-bottom: 20px;">Bir kategori seç ve bilgini test et!</p>
      </div>
      <div class="grid">
    `;
    
    data.categories.forEach(cat => {
      html += `
        <div class="card quiz-category" data-category="${cat.id}" onclick="App.startQuiz('${cat.id}')" style="cursor: pointer;">
          <div class="card-title">${cat.nameAr}</div>
          <div class="card-sub">${cat.name}</div>
          <div style="font-size: 12px; color: var(--text-dim); margin-top: 8px;">${cat.questions.length} soru</div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
  },
  
  startQuiz(categoryId) {
    const data = this.data.quiz_01;
    const category = data.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    // Soruları karıştır
    this.quizState = {
      currentCategory: category,
      currentQuestion: 0,
      score: 0,
      answered: false,
      questions: [...category.questions].sort(() => Math.random() - 0.5).slice(0, 10)
    };
    
    this.showQuizQuestion();
  },
  
  showQuizQuestion() {
    const { questions, currentQuestion, score } = this.quizState;
    const container = document.getElementById('content');
    
    if (currentQuestion >= questions.length) {
      this.showQuizResult();
      return;
    }
    
    const q = questions[currentQuestion];
    const progress = ((currentQuestion) / questions.length) * 100;
    
    let html = `
      <div class="quiz-container">
        <div class="quiz-header">
          <div class="quiz-progress">
            <div class="quiz-progress-bar" style="width: ${progress}%"></div>
          </div>
          <div class="quiz-info">
            <span>Soru ${currentQuestion + 1}/${questions.length}</span>
            <span>Skor: ${score}</span>
          </div>
        </div>
        
        <div class="quiz-question">
          <div class="quiz-q-text">${q.question}</div>
          ${q.questionAr ? `<div class="quiz-q-ar">${q.questionAr}</div>` : ''}
        </div>
        
        <div class="quiz-options">
    `;
    
    q.options.forEach((opt, i) => {
      html += `
        <button class="quiz-option" data-index="${i}" onclick="App.checkAnswer(${i})">
          <span class="quiz-option-letter">${String.fromCharCode(65 + i)}</span>
          <span class="quiz-option-text">${opt}</span>
        </button>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    this.quizState.answered = false;
  },
  
  checkAnswer(selectedIndex) {
    if (this.quizState.answered) return;
    this.quizState.answered = true;
    
    const q = this.quizState.questions[this.quizState.currentQuestion];
    const correct = q.answer === selectedIndex;
    
    if (correct) this.quizState.score++;
    
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((opt, i) => {
      opt.style.pointerEvents = 'none';
      if (i === q.answer) {
        opt.classList.add('correct');
      } else if (i === selectedIndex && !correct) {
        opt.classList.add('wrong');
      }
    });
    
    setTimeout(() => {
      this.quizState.currentQuestion++;
      this.showQuizQuestion();
    }, 1200);
  },
  
  showQuizResult() {
    const { score, questions, currentCategory } = this.quizState;
    const container = document.getElementById('content');
    const percentage = Math.round((score / questions.length) * 100);
    
    let emoji = '😢';
    let message = 'Daha fazla çalışman gerek!';
    if (percentage >= 90) { emoji = '🏆'; message = 'Mükemmel! Harikasın!'; }
    else if (percentage >= 70) { emoji = '😊'; message = 'Çok iyi! Aferin!'; }
    else if (percentage >= 50) { emoji = '🙂'; message = 'İyi! Biraz daha çalış!'; }
    
    container.innerHTML = `
      <div class="quiz-result">
        <div class="quiz-result-emoji">${emoji}</div>
        <div class="quiz-result-score">${score}/${questions.length}</div>
        <div class="quiz-result-percent">%${percentage}</div>
        <div class="quiz-result-message">${message}</div>
        <div class="quiz-result-category">${currentCategory.name}</div>
        <div class="quiz-buttons">
          <button class="quiz-btn" onclick="App.startQuiz('${currentCategory.id}')">Tekrar Dene</button>
          <button class="quiz-btn secondary" onclick="App.showPanel('quiz')">Kategoriler</button>
        </div>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
