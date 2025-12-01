// Arabic Learning App - Fasih Arabic (الفصحى)
// Modern Standard Arabic vocabulary and grammar study tool

const VOCAB_FILES = [
  "data/vocab_01.json",
];

const GRAMMAR_FILES = [
  "data/grammar_01.json",
];

const SARF_FILES = [
  "data/sarf_01.json",
];

const NAHIV_FILES = [
  "data/nahiv_01.json",
];

const EMSILE_FILES = [
  "data/emsile_01.json",
];

const BINA_FILES = [
  "data/bina_01.json",
];

const MAKSUD_FILES = [
  "data/maksud_01.json",
];

const INTRO_FILES = [
  "data/intro_01.json",
];

const BASIC_FILES = {
  pronouns: "data/pronouns_01.json",
  demonstratives: "data/demonstratives_01.json",
  colors: "data/colors_01.json",
  numbers: "data/numbers_01.json",
  questions: "data/questions_01.json",
};

const ISLAMIC_FILES = [
  "data/islamic_terms_01.json",
  "data/islamic_basics_01.json",
];

let allData = [];
let filteredData = [];
let currentItem = null;
let grammarTopics = [];
let sarfTopics = [];
let nahivTopics = [];
let emsileBabs = [];
let binaForms = [];
let maksudCategories = [];
let introData = null;
let basicData = {};
let islamicData = [];
let grammarLoaded = false;
let sarfLoaded = false;
let nahivLoaded = false;
let emsileLoaded = false;
let binaLoaded = false;
let maksudLoaded = false;
let introLoaded = false;
let basicLoaded = false;
let islamicLoaded = false;
let ttsVoice = null;
let timerInterval = null;
let timerEndAt = null;
let timerRemainingMs = 0;
let timerRunning = false;
let audioCtx = null;

// Arabic verb patterns (الأوزان)
const VERB_PATTERNS = [
  { form: "I", arabic: "فَعَلَ", meaning: "Temel anlam", example: "كَتَبَ", exampleMeaning: "yazdı" },
  { form: "II", arabic: "فَعَّلَ", meaning: "Yoğunlaştırma/Geçişli yapma", example: "كَتَّبَ", exampleMeaning: "yazdırdı" },
  { form: "III", arabic: "فَاعَلَ", meaning: "Karşılıklı eylem", example: "كَاتَبَ", exampleMeaning: "yazıştı" },
  { form: "IV", arabic: "أَفْعَلَ", meaning: "Geçişli yapma", example: "أَكْتَبَ", exampleMeaning: "yazdırdı" },
  { form: "V", arabic: "تَفَعَّلَ", meaning: "Dönüşlü (II'nin)", example: "تَكَتَّبَ", exampleMeaning: "yazılmış oldu" },
  { form: "VI", arabic: "تَفَاعَلَ", meaning: "Karşılıklı dönüşlü", example: "تَكَاتَبَ", exampleMeaning: "birbirleriyle yazıştı" },
  { form: "VII", arabic: "اِنْفَعَلَ", meaning: "Edilgen/Dönüşlü", example: "اِنْكَتَبَ", exampleMeaning: "yazıldı" },
  { form: "VIII", arabic: "اِفْتَعَلَ", meaning: "Dönüşlü/Karşılıklı", example: "اِكْتَتَبَ", exampleMeaning: "abone oldu" },
  { form: "IX", arabic: "اِفْعَلَّ", meaning: "Renk/Kusur", example: "اِحْمَرَّ", exampleMeaning: "kızardı" },
  { form: "X", arabic: "اِسْتَفْعَلَ", meaning: "İsteme/Talep etme", example: "اِسْتَكْتَبَ", exampleMeaning: "yazmasını istedi" },
];

// Helper functions
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function shuffleOptions(options, answerIndex) {
  const indices = options.map((_, idx) => idx);
  shuffleArray(indices);
  const shuffledOptions = indices.map((i) => options[i]);
  const newAnswerIndex = indices.indexOf(answerIndex);
  return { options: shuffledOptions, answer: newAnswerIndex };
}

// TTS for Arabic
function pickTtsVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const arabic = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("ar"));
  const preferred =
    arabic.find((v) => /natural|premium/i.test(v.name)) ||
    arabic.find((v) => /arabic/i.test(v.name)) ||
    arabic[0] ||
    null;
  ttsVoice = preferred;
  return ttsVoice;
}

function speakText(text) {
  if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  const voice = ttsVoice || pickTtsVoice();
  if (voice) {
    utter.voice = voice;
    utter.lang = voice.lang || "ar-SA";
  } else {
    utter.lang = "ar-SA";
  }
  utter.rate = 0.85;
  utter.pitch = 1;
  utter.volume = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// Timer functions
function updateTimerDisplay(ms) {
  if (!els.timerRemaining) return;
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  els.timerRemaining.textContent = `${minutes}:${seconds}`;
}

function setTimerStatus(text) {
  if (els.timerStatus) els.timerStatus.textContent = text;
}

function syncTimerToSelection() {
  const minutes = Number(els.timerDuration?.value || 0);
  const ms = Math.max(0, minutes * 60 * 1000);
  timerRemainingMs = ms;
  timerEndAt = null;
  timerRunning = false;
  updateTimerDisplay(ms);
  if (els.timerStart) els.timerStart.textContent = "ابدأ | Start";
}

function toggleTimer() {
  if (timerRunning) {
    pauseTimer();
    return;
  }
  if (timerRemainingMs <= 0) {
    syncTimerToSelection();
  }
  if (timerRemainingMs <= 0) return;
  resumeTimer();
}

function resumeTimer() {
  timerEndAt = Date.now() + timerRemainingMs;
  timerRunning = true;
  if (els.timerStart) els.timerStart.textContent = "إيقاف | Pause";
  setTimerStatus("الوقت بدأ! | Süre başladı!");
  tickTimer();
  timerInterval = setInterval(tickTimer, 500);
}

function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerRemainingMs = Math.max(0, timerEndAt ? timerEndAt - Date.now() : timerRemainingMs);
  timerRunning = false;
  updateTimerDisplay(timerRemainingMs);
  if (els.timerStart) els.timerStart.textContent = "استمر | Resume";
  setTimerStatus("متوقف | Durduruldu.");
}

function resetTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerRunning = false;
  timerEndAt = null;
  syncTimerToSelection();
  setTimerStatus("جاهز للبدء | Hazırsan başlat.");
}

function tickTimer() {
  if (!timerRunning || !timerEndAt) return;
  const remaining = Math.max(0, timerEndAt - Date.now());
  timerRemainingMs = remaining;
  updateTimerDisplay(remaining);
  if (remaining <= 0) {
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning = false;
    timerEndAt = null;
    if (els.timerStart) els.timerStart.textContent = "ابدأ | Start";
    setTimerStatus("انتهى الوقت! أحسنت! | Süre tamamlandı!");
    playTimerChime();
  }
}

function getAudioContext() {
  if (audioCtx) return audioCtx;
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = new Ctx();
  return audioCtx;
}

function playTimerChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.8);
}

// DOM Elements
const els = {
  status: document.getElementById("status"),
  timerDuration: document.getElementById("timer-duration"),
  timerStart: document.getElementById("timer-start"),
  timerReset: document.getElementById("timer-reset"),
  timerRemaining: document.getElementById("timer-remaining"),
  timerStatus: document.getElementById("timer-status"),
  card: document.getElementById("card"),
  nextBtnCard: document.getElementById("next-btn-card"),
  word: document.getElementById("word"),
  transliteration: document.getElementById("transliteration"),
  pos: document.getElementById("pos"),
  level: document.getElementById("level"),
  root: document.getElementById("root"),
  pattern: document.getElementById("pattern"),
  definitionAr: document.getElementById("definition-ar"),
  definitionTr: document.getElementById("definition-tr"),
  definitionEn: document.getElementById("definition-en"),
  sentences: document.getElementById("sentences"),
  relatedWords: document.getElementById("related-words"),
  quizQuestion: document.getElementById("quiz-question"),
  quizOptions: document.getElementById("quiz-options"),
  quizResult: document.getElementById("quiz-result"),
  vocabSpeak: document.getElementById("vocab-speak"),
  loadBtn: document.getElementById("load-btn"),
  nextBtn: document.getElementById("next-btn"),
  levelFilter: document.getElementById("level-filter"),
  categoryFilter: document.getElementById("category-filter"),
  grammarBtn: document.getElementById("grammar-btn"),
  grammarPanel: document.getElementById("grammar-panel"),
  grammarTopic: document.getElementById("grammar-topic"),
  grammarDetail: document.getElementById("grammar-detail"),
  grammarStatus: document.getElementById("grammar-status"),
  grammarFilter: document.getElementById("grammar-filter"),
  grammarMeta: document.getElementById("grammar-meta"),
  rootsBtn: document.getElementById("roots-btn"),
  rootsPanel: document.getElementById("roots-panel"),
  rootSearch: document.getElementById("root-search"),
  rootSearchBtn: document.getElementById("root-search-btn"),
  rootResults: document.getElementById("root-results"),
  patternsBtn: document.getElementById("patterns-btn"),
  patternsPanel: document.getElementById("patterns-panel"),
  patternsGrid: document.getElementById("patterns-grid"),
  patternDetail: document.getElementById("pattern-detail"),
  // Sarf elements
  sarfBtn: document.getElementById("sarf-btn"),
  sarfPanel: document.getElementById("sarf-panel"),
  sarfTopic: document.getElementById("sarf-topic"),
  sarfDetail: document.getElementById("sarf-detail"),
  sarfMeta: document.getElementById("sarf-meta"),
  // Nahiv elements
  nahivBtn: document.getElementById("nahiv-btn"),
  nahivPanel: document.getElementById("nahiv-panel"),
  nahivTopic: document.getElementById("nahiv-topic"),
  nahivDetail: document.getElementById("nahiv-detail"),
  nahivMeta: document.getElementById("nahiv-meta"),
  // Basics elements
  basicsBtn: document.getElementById("basics-btn"),
  basicsPanel: document.getElementById("basics-panel"),
  basicsContent: document.getElementById("basics-content"),
  // Islamic elements
  islamicBtn: document.getElementById("islamic-btn"),
  islamicPanel: document.getElementById("islamic-panel"),
  islamicCategory: document.getElementById("islamic-category"),
  islamicSearch: document.getElementById("islamic-search"),
  islamicContent: document.getElementById("islamic-content"),
  // Intro elements
  introBtn: document.getElementById("intro-btn"),
  introPanel: document.getElementById("intro-panel"),
  introContent: document.getElementById("intro-content"),
  // Emsile elements
  emsileBtn: document.getElementById("emsile-btn"),
  emsilePanel: document.getElementById("emsile-panel"),
  emsileSelect: document.getElementById("emsile-select"),
  emsileContent: document.getElementById("emsile-content"),
  // Bina elements
  binaBtn: document.getElementById("bina-btn"),
  binaPanel: document.getElementById("bina-panel"),
  binaSelect: document.getElementById("bina-select"),
  binaContent: document.getElementById("bina-content"),
  // Maksud elements
  maksudBtn: document.getElementById("maksud-btn"),
  maksudPanel: document.getElementById("maksud-panel"),
  maksudSelect: document.getElementById("maksud-select"),
  maksudContent: document.getElementById("maksud-content"),
};

// Status update
function setStatus(msg) {
  if (els.status) els.status.textContent = msg;
}

// Hide all panels
function hideAllPanels() {
  els.card?.classList.add("hidden");
  els.grammarPanel?.classList.add("hidden");
  els.rootsPanel?.classList.add("hidden");
  els.patternsPanel?.classList.add("hidden");
  els.sarfPanel?.classList.add("hidden");
  els.nahivPanel?.classList.add("hidden");
  els.basicsPanel?.classList.add("hidden");
  els.islamicPanel?.classList.add("hidden");
  els.introPanel?.classList.add("hidden");
  els.emsilePanel?.classList.add("hidden");
  els.binaPanel?.classList.add("hidden");
  els.maksudPanel?.classList.add("hidden");
}

// Load vocabulary data
async function loadData() {
  setStatus("جاري التحميل... | Yükleniyor...");
  allData = [];
  
  for (const file of VOCAB_FILES) {
    try {
      const res = await fetch(file);
      if (!res.ok) continue;
      const json = await res.json();
      if (Array.isArray(json)) {
        allData.push(...json);
      }
    } catch (e) {
      console.warn(`Could not load ${file}:`, e);
    }
  }
  
  if (allData.length === 0) {
    setStatus("لا توجد بيانات | Veri bulunamadı.");
    return;
  }
  
  applyFilters();
  setStatus(`تم تحميل ${allData.length} كلمة | ${allData.length} kelime yüklendi.`);
}

// Apply filters
function applyFilters() {
  const levelVal = els.levelFilter?.value || "ALL";
  const categoryVal = els.categoryFilter?.value || "ALL";
  
  filteredData = allData.filter((item) => {
    const levelMatch = levelVal === "ALL" || item.level === levelVal;
    const categoryMatch = categoryVal === "ALL" || item.pos === categoryVal;
    return levelMatch && categoryMatch;
  });
  
  shuffleArray(filteredData);
}

// Show next word
function showNextWord() {
  if (filteredData.length === 0) {
    setStatus("لا توجد كلمات | Kelime yok. Önce yükle.");
    return;
  }
  
  hideAllPanels();
  els.card?.classList.remove("hidden");
  
  currentItem = filteredData[Math.floor(Math.random() * filteredData.length)];
  renderWord(currentItem);
}

// Render word card
function renderWord(item) {
  if (!item) return;
  
  els.word.textContent = item.word || "";
  els.transliteration.textContent = item.transliteration || "";
  els.pos.textContent = item.pos || "";
  els.level.textContent = item.level || "";
  els.root.textContent = item.root || "";
  els.pattern.textContent = item.pattern || "";
  els.definitionAr.textContent = item.definition_ar || "";
  els.definitionTr.textContent = item.definition_tr || "";
  els.definitionEn.textContent = item.definition_en || "";
  
  // Sentences
  els.sentences.innerHTML = "";
  if (item.sentences && item.sentences.length > 0) {
    item.sentences.forEach((s) => {
      const li = document.createElement("li");
      if (typeof s === "object") {
        li.innerHTML = `<span class="arabic-text">${s.ar || ""}</span><br><small>${s.tr || ""}</small>`;
      } else {
        li.textContent = s;
      }
      els.sentences.appendChild(li);
    });
  }
  
  // Related words
  els.relatedWords.innerHTML = "";
  if (item.related && item.related.length > 0) {
    item.related.forEach((r) => {
      const div = document.createElement("div");
      div.className = "related-word";
      if (typeof r === "object") {
        div.innerHTML = `${r.word || ""}<small>${r.meaning || ""}</small>`;
      } else {
        div.textContent = r;
      }
      els.relatedWords.appendChild(div);
    });
  }
  
  // Quiz
  els.quizResult.textContent = "";
  els.quizOptions.innerHTML = "";
  
  if (item.quiz) {
    els.quizQuestion.textContent = item.quiz.question || "";
    const { options, answer } = shuffleOptions(item.quiz.options || [], item.quiz.answer || 0);
    
    options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.addEventListener("click", () => handleQuizAnswer(btn, idx, answer));
      els.quizOptions.appendChild(btn);
    });
  }
}

// Handle quiz answer
function handleQuizAnswer(btn, selected, correct) {
  const buttons = els.quizOptions.querySelectorAll("button");
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === correct) b.classList.add("correct");
    if (i === selected && selected !== correct) b.classList.add("wrong");
  });
  
  els.quizResult.textContent = selected === correct 
    ? "✓ صحيح! | Doğru!" 
    : "✗ خطأ | Yanlış";
  els.quizResult.style.color = selected === correct ? "var(--success)" : "var(--error)";
}

// Load grammar
async function loadGrammar() {
  if (grammarLoaded) return;
  
  grammarTopics = [];
  for (const file of GRAMMAR_FILES) {
    try {
      const res = await fetch(file);
      if (!res.ok) continue;
      const json = await res.json();
      if (Array.isArray(json)) {
        grammarTopics.push(...json);
      }
    } catch (e) {
      console.warn(`Could not load ${file}:`, e);
    }
  }
  
  grammarLoaded = true;
  populateGrammarTopics();
}

// Populate grammar dropdown
function populateGrammarTopics() {
  if (!els.grammarTopic) return;
  
  els.grammarTopic.innerHTML = '<option value="">اختر موضوعاً | Konu seç</option>';
  grammarTopics.forEach((topic, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = topic.topic || `Topic ${idx + 1}`;
    els.grammarTopic.appendChild(opt);
  });
  
  els.grammarMeta.textContent = `${grammarTopics.length} مواضيع`;
  els.grammarStatus.textContent = grammarTopics.length > 0 
    ? "اختر موضوعاً | Bir konu seç." 
    : "لا توجد مواضيع | Konu yok.";
}

// Show grammar detail
function showGrammarDetail(idx) {
  const topic = grammarTopics[idx];
  if (!topic) return;
  
  els.grammarDetail.classList.remove("hidden");
  els.grammarDetail.innerHTML = `
    <h4>${topic.topic || ""} <span class="tag level">${topic.level || ""}</span></h4>
    <p>${topic.description || ""}</p>
    ${topic.pattern ? `<p><strong>القاعدة | Kalıp:</strong><br><span class="arabic-text">${topic.pattern}</span></p>` : ""}
    ${topic.examples && topic.examples.length > 0 ? `
      <h4>أمثلة | Örnekler</h4>
      <ul class="arabic-list">
        ${topic.examples.map(e => `<li>${e}</li>`).join("")}
      </ul>
    ` : ""}
    ${topic.tips && topic.tips.length > 0 ? `
      <h4>نصائح | İpuçları</h4>
      <ul>
        ${topic.tips.map(t => `<li>${t}</li>`).join("")}
      </ul>
    ` : ""}
    ${topic.mistakes && topic.mistakes.length > 0 ? `
      <h4>أخطاء شائعة | Yaygın Hatalar</h4>
      <ul>
        ${topic.mistakes.map(m => `<li style="color: var(--error)">${m}</li>`).join("")}
      </ul>
    ` : ""}
    ${topic.note ? `<p class="note">${topic.note}</p>` : ""}
  `;
}

// Toggle grammar panel
function toggleGrammar() {
  hideAllPanels();
  els.grammarPanel?.classList.remove("hidden");
  loadGrammar();
}

// Toggle roots panel
function toggleRoots() {
  hideAllPanels();
  els.rootsPanel?.classList.remove("hidden");
}

// Search roots
function searchRoots() {
  const query = els.rootSearch?.value.trim() || "";
  if (!query) return;
  
  const results = allData.filter(item => item.root && item.root.includes(query));
  
  els.rootResults.innerHTML = "";
  if (results.length === 0) {
    els.rootResults.innerHTML = '<p class="note">لم يتم العثور على نتائج | Sonuç bulunamadı.</p>';
    return;
  }
  
  const grouped = {};
  results.forEach(item => {
    if (!grouped[item.root]) grouped[item.root] = [];
    grouped[item.root].push(item);
  });
  
  Object.entries(grouped).forEach(([root, words]) => {
    const div = document.createElement("div");
    div.className = "root-result-item";
    div.innerHTML = `
      <h4>${root}</h4>
      <div class="root-words-list">
        ${words.map(w => `<span class="related-word">${w.word}<small>${w.definition_tr || w.definition_en || ""}</small></span>`).join("")}
      </div>
    `;
    els.rootResults.appendChild(div);
  });
}

// Toggle patterns panel
function togglePatterns() {
  hideAllPanels();
  els.patternsPanel?.classList.remove("hidden");
  renderPatterns();
}

// Render verb patterns
function renderPatterns() {
  if (!els.patternsGrid) return;
  
  els.patternsGrid.innerHTML = "";
  VERB_PATTERNS.forEach((p, idx) => {
    const div = document.createElement("div");
    div.className = "pattern-card";
    div.innerHTML = `
      <div class="form-number">Form ${p.form}</div>
      <div class="form-arabic">${p.arabic}</div>
      <div class="form-meaning">${p.meaning}</div>
    `;
    div.addEventListener("click", () => showPatternDetail(idx));
    els.patternsGrid.appendChild(div);
  });
}

// Show pattern detail
function showPatternDetail(idx) {
  const p = VERB_PATTERNS[idx];
  if (!p) return;
  
  // Update active state
  document.querySelectorAll(".pattern-card").forEach((card, i) => {
    card.classList.toggle("active", i === idx);
  });
  
  els.patternDetail.classList.remove("hidden");
  els.patternDetail.innerHTML = `
    <h4>الوزن ${p.form}: ${p.arabic}</h4>
    <p><strong>Anlam:</strong> ${p.meaning}</p>
    <p><strong>Örnek:</strong> <span class="arabic-text">${p.example}</span> - ${p.exampleMeaning}</p>
    <p class="note">Bu kalıptaki kelimeler benzer anlam nüansları taşır.</p>
  `;
}

// Filter grammar topics
function filterGrammarTopics() {
  const query = els.grammarFilter?.value.toLowerCase() || "";
  const options = els.grammarTopic?.querySelectorAll("option") || [];
  
  options.forEach((opt, idx) => {
    if (idx === 0) return; // Skip placeholder
    const topic = grammarTopics[opt.value];
    if (!topic) return;
    
    const match = 
      (topic.topic && topic.topic.toLowerCase().includes(query)) ||
      (topic.description && topic.description.toLowerCase().includes(query));
    
    opt.style.display = match || !query ? "" : "none";
  });
}

// ============ SARF (Morphology) ============
async function loadSarf() {
  if (sarfLoaded) return;
  
  sarfTopics = [];
  for (const file of SARF_FILES) {
    try {
      const res = await fetch(file);
      if (!res.ok) continue;
      const json = await res.json();
      if (Array.isArray(json)) {
        sarfTopics.push(...json);
      }
    } catch (e) {
      console.warn(`Could not load ${file}:`, e);
    }
  }
  
  sarfLoaded = true;
  populateSarfTopics();
}

function populateSarfTopics() {
  if (!els.sarfTopic) return;
  
  els.sarfTopic.innerHTML = '<option value="">اختر موضوعاً | Konu seç</option>';
  sarfTopics.forEach((topic, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = topic.topic || `Sarf ${idx + 1}`;
    els.sarfTopic.appendChild(opt);
  });
  
  if (els.sarfMeta) els.sarfMeta.textContent = `${sarfTopics.length} مواضيع`;
}

function showSarfDetail(idx) {
  const topic = sarfTopics[idx];
  if (!topic) return;
  
  els.sarfDetail.classList.remove("hidden");
  els.sarfDetail.innerHTML = `
    <h4>${topic.topic || ""} <span class="tag level">${topic.level || ""}</span></h4>
    <p>${topic.description || ""}</p>
    ${topic.pattern ? `<p><strong>الوزن | Kalıp:</strong><br><span class="arabic-text">${topic.pattern}</span></p>` : ""}
    ${topic.conjugation ? `
      <h4>التصريف | Çekim</h4>
      <div class="conjugation-table">
        ${Object.entries(topic.conjugation).map(([k,v]) => `<div class="conj-row"><span class="conj-label">${k}:</span> <span class="arabic-text">${v}</span></div>`).join("")}
      </div>
    ` : ""}
    ${topic.examples && topic.examples.length > 0 ? `
      <h4>أمثلة | Örnekler</h4>
      <ul class="arabic-list">
        ${topic.examples.map(e => `<li>${e}</li>`).join("")}
      </ul>
    ` : ""}
    ${topic.tips && topic.tips.length > 0 ? `
      <h4>نصائح | İpuçları</h4>
      <ul>
        ${topic.tips.map(t => `<li>${t}</li>`).join("")}
      </ul>
    ` : ""}
    ${topic.mistakes && topic.mistakes.length > 0 ? `
      <h4>أخطاء شائعة | Yaygın Hatalar</h4>
      <ul>
        ${topic.mistakes.map(m => `<li style="color: var(--error)">${m}</li>`).join("")}
      </ul>
    ` : ""}
    ${topic.note ? `<p class="note">${topic.note}</p>` : ""}
  `;
}

function toggleSarf() {
  hideAllPanels();
  els.sarfPanel?.classList.remove("hidden");
  loadSarf();
}

// ============ NAHIV (Syntax) ============
async function loadNahiv() {
  if (nahivLoaded) return;
  
  nahivTopics = [];
  for (const file of NAHIV_FILES) {
    try {
      const res = await fetch(file);
      if (!res.ok) continue;
      const json = await res.json();
      if (Array.isArray(json)) {
        nahivTopics.push(...json);
      }
    } catch (e) {
      console.warn(`Could not load ${file}:`, e);
    }
  }
  
  nahivLoaded = true;
  populateNahivTopics();
}

function populateNahivTopics() {
  if (!els.nahivTopic) return;
  
  els.nahivTopic.innerHTML = '<option value="">اختر موضوعاً | Konu seç</option>';
  nahivTopics.forEach((topic, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = topic.topic || `Nahiv ${idx + 1}`;
    els.nahivTopic.appendChild(opt);
  });
  
  if (els.nahivMeta) els.nahivMeta.textContent = `${nahivTopics.length} مواضيع`;
}

function showNahivDetail(idx) {
  const topic = nahivTopics[idx];
  if (!topic) return;
  
  els.nahivDetail.classList.remove("hidden");
  els.nahivDetail.innerHTML = `
    <h4>${topic.topic || ""} <span class="tag level">${topic.level || ""}</span></h4>
    <p>${topic.description || ""}</p>
    ${topic.pattern ? `<p><strong>القاعدة | Kural:</strong><br><span class="arabic-text">${topic.pattern}</span></p>` : ""}
    ${topic.examples && topic.examples.length > 0 ? `
      <h4>أمثلة | Örnekler</h4>
      <ul class="arabic-list">
        ${topic.examples.map(e => `<li>${e}</li>`).join("")}
      </ul>
    ` : ""}
    ${topic.tips && topic.tips.length > 0 ? `
      <h4>نصائح | İpuçları</h4>
      <ul>
        ${topic.tips.map(t => `<li>${t}</li>`).join("")}
      </ul>
    ` : ""}
    ${topic.mistakes && topic.mistakes.length > 0 ? `
      <h4>أخطاء شائعة | Yaygın Hatalar</h4>
      <ul>
        ${topic.mistakes.map(m => `<li style="color: var(--error)">${m}</li>`).join("")}
      </ul>
    ` : ""}
    ${topic.note ? `<p class="note">${topic.note}</p>` : ""}
  `;
}

function toggleNahiv() {
  hideAllPanels();
  els.nahivPanel?.classList.remove("hidden");
  loadNahiv();
}

// ============ BASICS (Pronouns, Colors, Numbers, etc.) ============
async function loadBasics() {
  if (basicLoaded) return;
  
  for (const [key, file] of Object.entries(BASIC_FILES)) {
    try {
      const res = await fetch(file);
      if (!res.ok) continue;
      const json = await res.json();
      basicData[key] = json;
    } catch (e) {
      console.warn(`Could not load ${file}:`, e);
    }
  }
  
  basicLoaded = true;
}

function renderBasicsTab(tab) {
  const data = basicData[tab];
  if (!data || !els.basicsContent) return;
  
  let html = "";
  data.forEach(category => {
    html += `<div class="basics-category">
      <h4>${category.category || ""}</h4>
      ${category.note ? `<p class="note">${category.note}</p>` : ""}
    `;
    
    if (category.items) {
      html += '<div class="basics-items">';
      category.items.forEach(item => {
        // Handle different item structures
        const word = item.word || item.word_m || "";
        const wordF = item.word_f || "";
        const trans = item.transliteration || "";
        const meaningTr = item.meaning_tr || "";
        const meaningEn = item.meaning_en || "";
        const examples = item.examples || item.example_ar ? [item.example_ar] : [];
        
        html += `<div class="basics-item">
          <div class="basics-word arabic-text">${word}${wordF ? ` / ${wordF}` : ""}</div>
          <div class="basics-trans">${trans}</div>
          <div class="basics-meaning">${meaningTr}</div>
          ${meaningEn ? `<div class="basics-meaning-en">${meaningEn}</div>` : ""}
          ${examples && examples.length > 0 ? `
            <div class="basics-examples">
              ${(Array.isArray(examples) ? examples : [examples]).slice(0, 2).map(e => `<small>${e}</small>`).join("<br>")}
            </div>
          ` : ""}
        </div>`;
      });
      html += '</div>';
    }
    
    if (category.rules) {
      html += '<div class="basics-rules">';
      category.rules.forEach(rule => {
        html += `<div class="rule-item">
          <strong>${rule.title || rule.range || ""}:</strong> ${rule.rule || ""}
          ${rule.example ? `<br><span class="arabic-text">${rule.example}</span>` : ""}
        </div>`;
      });
      html += '</div>';
    }
    
    html += '</div>';
  });
  
  els.basicsContent.innerHTML = html;
}

function toggleBasics() {
  hideAllPanels();
  els.basicsPanel?.classList.remove("hidden");
  loadBasics().then(() => {
    renderBasicsTab("pronouns");
  });
}

// ============ ISLAMIC TERMS ============
async function loadIslamic() {
  if (islamicLoaded) return;
  
  islamicData = [];
  for (const file of ISLAMIC_FILES) {
    try {
      const res = await fetch(file);
      if (!res.ok) continue;
      const json = await res.json();
      if (Array.isArray(json)) {
        islamicData.push(...json);
      }
    } catch (e) {
      console.warn(`Could not load ${file}:`, e);
    }
  }
  
  islamicLoaded = true;
  populateIslamicCategories();
  renderIslamicContent();
}

function populateIslamicCategories() {
  if (!els.islamicCategory) return;
  
  els.islamicCategory.innerHTML = '<option value="ALL">الكل | Tümü</option>';
  islamicData.forEach((cat, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = cat.category || `Category ${idx + 1}`;
    els.islamicCategory.appendChild(opt);
  });
}

function renderIslamicContent(filterIdx = "ALL", searchQuery = "") {
  if (!els.islamicContent) return;
  
  const query = searchQuery.toLowerCase();
  let html = "";
  
  islamicData.forEach((cat, idx) => {
    if (filterIdx !== "ALL" && parseInt(filterIdx) !== idx) return;
    
    const filteredItems = (cat.items || []).filter(item => {
      if (!query) return true;
      return (
        (item.word && item.word.includes(query)) ||
        (item.meaning_tr && item.meaning_tr.toLowerCase().includes(query)) ||
        (item.meaning_en && item.meaning_en.toLowerCase().includes(query)) ||
        (item.transliteration && item.transliteration.toLowerCase().includes(query))
      );
    });
    
    if (filteredItems.length === 0 && filterIdx === "ALL") return;
    
    html += `<div class="islamic-category">
      <h4>${cat.category || ""}</h4>
      <div class="islamic-items">`;
    
    filteredItems.forEach(item => {
      html += `<div class="islamic-item">
        <div class="islamic-word arabic-text">${item.word || ""}</div>
        <div class="islamic-trans">${item.transliteration || ""}</div>
        <div class="islamic-meaning">${item.meaning_tr || ""}</div>
        ${item.definition ? `<div class="islamic-def">${item.definition}</div>` : ""}
        ${item.root ? `<div class="islamic-root">الجذر: ${item.root}</div>` : ""}
      </div>`;
    });
    
    html += '</div></div>';
  });
  
  els.islamicContent.innerHTML = html || '<p class="note">لا توجد نتائج | Sonuç bulunamadı.</p>';
}

function toggleIslamic() {
  hideAllPanels();
  els.islamicPanel?.classList.remove("hidden");
  loadIslamic();
}

// ============ INTRO (Fasih Arabic Introduction) ============
async function loadIntro() {
  if (introLoaded) return;
  
  for (const file of INTRO_FILES) {
    try {
      const res = await fetch(file);
      if (!res.ok) continue;
      const json = await res.json();
      introData = json;
    } catch (e) {
      console.warn(`Could not load ${file}:`, e);
    }
  }
  
  introLoaded = true;
  renderIntro();
}

function renderIntro() {
  if (!introData || !els.introContent) return;
  
  let html = "";
  
  // Meta info
  if (introData.meta) {
    html += `<div class="intro-meta">
      <h2>${introData.meta.title || ""}</h2>
      <p>${introData.meta.description || ""}</p>
    </div>`;
  }
  
  // Sections
  if (introData.sections) {
    introData.sections.forEach(section => {
      html += `<div class="intro-section" id="intro-${section.id}">
        <h3 class="intro-section-title">${section.title} <span class="arabic-text">${section.titleAr || ""}</span></h3>`;
      
      // Content array
      if (section.content) {
        section.content.forEach(item => {
          if (item.heading) {
            html += `<h4 class="intro-heading">${item.heading}</h4>`;
          }
          if (item.text) {
            html += `<p class="intro-text">${item.text}</p>`;
          }
          if (item.textAr) {
            html += `<p class="intro-text arabic-text">${item.textAr}</p>`;
          }
          if (item.list) {
            html += '<ul class="intro-list">';
            item.list.forEach(li => {
              html += `<li>${li}</li>`;
            });
            html += '</ul>';
          }
          
          // Alphabet
          if (item.alphabet) {
            html += '<div class="intro-alphabet">';
            item.alphabet.forEach(letter => {
              html += `<div class="intro-letter">
                <span class="letter-ar">${letter.letter}</span>
                <span class="letter-name">${letter.name}</span>
                <span class="letter-trans">${letter.translit}</span>
                <span class="letter-sound">${letter.sound}</span>
              </div>`;
            });
            html += '</div>';
          }
          
          // Vowels
          if (item.vowels) {
            html += '<div class="intro-vowels">';
            item.vowels.forEach(v => {
              html += `<div class="intro-vowel">
                <span class="vowel-symbol">${v.symbol}</span>
                <span class="vowel-name">${v.name}</span>
                <span class="vowel-sound">${v.sound}</span>
                <span class="vowel-example">${v.example}</span>
              </div>`;
            });
            html += '</div>';
          }
          
          // Categories (word types)
          if (item.categories) {
            html += '<div class="intro-categories">';
            item.categories.forEach(cat => {
              html += `<div class="intro-cat-item">
                <div class="intro-cat-name">${cat.name} <span class="arabic-text">${cat.nameAr}</span></div>
                <div class="intro-cat-desc">${cat.description}</div>
                <div class="intro-cat-examples">
                  ${cat.examples.map(e => `<span class="arabic-text">${e}</span>`).join(" ")}
                </div>
              </div>`;
            });
            html += '</div>';
          }
          
          // Genders
          if (item.genders) {
            html += '<div class="intro-genders">';
            item.genders.forEach(g => {
              html += `<div class="intro-gender-item">
                <div class="intro-gender-type">${g.type} <span class="arabic-text">${g.typeAr}</span></div>
                <div class="intro-gender-rule">${g.rule}</div>
                <div class="intro-gender-examples">
                  ${g.examples.map(e => `<span class="arabic-text">${e}</span>`).join(" ")}
                </div>
              </div>`;
            });
            html += '</div>';
          }
          
          // Numbers (singular, dual, plural)
          if (item.numbers) {
            html += '<div class="intro-numbers">';
            item.numbers.forEach(n => {
              html += `<div class="intro-number-item">
                <div class="intro-number-type">${n.type} <span class="arabic-text">${n.typeAr}</span></div>
                ${n.rule ? `<div class="intro-number-rule">${n.rule}</div>` : ""}
                <div class="intro-number-example">${n.example || (n.examples ? n.examples.join(" | ") : "")}</div>
              </div>`;
            });
            html += '</div>';
          }
          
          // Dialect example
          if (item.example && item.example.fusha) {
            html += `<div class="intro-dialect-box">
              <div class="intro-dialect-fusha">
                <span class="label">Fasih:</span>
                <span class="arabic-text">${item.example.fusha}</span>
                <span class="meaning">(${item.example.meaning})</span>
              </div>
              <div class="intro-dialect-compare">
                <span>🇪🇬 ${item.example.egyptian}</span>
                <span>🇸🇾 ${item.example.levantine}</span>
                <span>🇸🇦 ${item.example.gulf}</span>
              </div>
            </div>`;
          }
        });
      }
      
      // Sentence examples
      if (section.content && section.content.some(c => c.examples)) {
        section.content.forEach(c => {
          if (c.examples) {
            html += '<div class="intro-sentence-examples">';
            c.examples.forEach(ex => {
              html += `<div class="intro-sentence">
                <div class="intro-sentence-ar arabic-text">${ex.ar}</div>
                <div class="intro-sentence-tr">${ex.tr}</div>
                ${ex.analysis ? `<div class="intro-sentence-analysis">${ex.analysis}</div>` : ""}
              </div>`;
            });
            html += '</div>';
          }
        });
      }
      
      // Verb tense examples
      if (section.content && section.content.some(c => c.examples && c.examples[0]?.ar)) {
        // Already handled above
      }
      
      // Learning path phases
      if (section.content && section.content.some(c => c.phase)) {
        html += '<div class="intro-learning-path">';
        section.content.forEach(phase => {
          if (phase.phase) {
            html += `<div class="intro-phase">
              <div class="intro-phase-title">${phase.phase}</div>
              <ul class="intro-phase-tasks">
                ${phase.tasks.map(t => `<li>${t}</li>`).join("")}
              </ul>
            </div>`;
          }
        });
        html += '</div>';
      }
      
      // Tips
      if (section.content && section.content.some(c => c.tip)) {
        html += '<div class="intro-tips">';
        section.content.forEach(t => {
          if (t.tip) {
            html += `<div class="intro-tip">
              <span class="tip-icon">${t.icon}</span>
              <span class="tip-text">${t.tip}</span>
            </div>`;
          }
        });
        html += '</div>';
      }
      
      // Essential vocabulary
      if (section.content && section.content.some(c => c.category && c.words)) {
        html += '<div class="intro-vocab-section">';
        section.content.forEach(cat => {
          if (cat.category && cat.words) {
            html += `<div class="intro-vocab-cat">
              <h4>${cat.category}</h4>
              <div class="intro-vocab-items">`;
            cat.words.forEach(w => {
              html += `<div class="intro-vocab-item">
                <span class="arabic-text">${w.ar}</span>
                <span class="translit">${w.translit}</span>
                <span class="meaning">${w.tr}</span>
              </div>`;
            });
            html += '</div></div>';
          }
        });
        html += '</div>';
      }
      
      // Phrases
      if (section.phrases) {
        html += '<div class="intro-phrases">';
        section.phrases.forEach(p => {
          html += `<div class="intro-phrase">
            <div class="phrase-ar arabic-text">${p.ar}</div>
            <div class="phrase-translit">${p.translit}</div>
            <div class="phrase-tr">${p.tr}</div>
            ${p.reply && p.reply !== "-" ? `<div class="phrase-reply">↩ ${p.reply}</div>` : ""}
          </div>`;
        });
        html += '</div>';
      }
      
      html += '</div>'; // end intro-section
    });
  }
  
  els.introContent.innerHTML = html;
}

function toggleIntro() {
  hideAllPanels();
  els.introPanel?.classList.remove("hidden");
  loadIntro();
}

// =====================================
// EMSILE - الأمثلة (6 Bab Sülasi Mücerred)
// =====================================
async function loadEmsile() {
  if (emsileLoaded) return;
  
  for (const file of EMSILE_FILES) {
    try {
      const res = await fetch(file);
      if (!res.ok) continue;
      const json = await res.json();
      if (json.babs && Array.isArray(json.babs)) {
        emsileBabs.push(...json.babs);
      }
    } catch (e) {
      console.warn(`Could not load ${file}:`, e);
    }
  }
  
  emsileLoaded = true;
  populateEmsileSelect();
  if (emsileBabs.length > 0) {
    renderEmsileContent(0);
  }
}

function populateEmsileSelect() {
  if (!els.emsileSelect) return;
  els.emsileSelect.innerHTML = emsileBabs.map((bab, i) => 
    `<option value="${i}">${bab.babName} - ${bab.babNameAr} (${bab.pattern})</option>`
  ).join("");
}

function renderEmsileContent(babIndex) {
  if (!els.emsileContent || !emsileBabs[babIndex]) return;
  
  const bab = emsileBabs[babIndex];
  let html = `
    <div class="emsile-bab">
      <div class="emsile-header">
        <h3 class="arabic-text">${bab.babNameAr}</h3>
        <div class="emsile-pattern">${bab.pattern} <span class="arabic-text">${bab.patternAr}</span></div>
        <div class="emsile-feature"><span class="label">Özellik:</span> ${bab.feature}</div>
      </div>
      
      <div class="emsile-examples">
        <h4>Örnek Fiiller</h4>
        <div class="emsile-examples-grid">`;
  
  bab.examples.forEach(ex => {
    html += `
      <div class="emsile-example-card">
        <div class="ex-word arabic-text">${ex.root}</div>
        <div class="ex-meaning">${ex.meaning}</div>
      </div>`;
  });
  
  html += `</div></div>`;
  
  // Sigalar (Conjugation Forms)
  if (bab.sigalar) {
    html += `<div class="emsile-sigalar">
      <h4>صِيَغ الفعل | Sığa Tablosu</h4>`;
    
    bab.sigalar.forEach(siga => {
      html += `
        <div class="emsile-siga-block">
          <div class="siga-header">
            <span class="siga-name">${siga.name}</span>
            <span class="siga-name-ar arabic-text">${siga.nameAr}</span>
          </div>`;
      
      if (siga.tasrifler) {
        html += `<div class="siga-conjugations">`;
        siga.tasrifler.forEach(t => {
          html += `
            <div class="siga-row">
              <span class="siga-person">${t.person}</span>
              <span class="siga-form arabic-text">${t.form}</span>
              <span class="siga-meaning">${t.meaning}</span>
            </div>`;
        });
        html += `</div>`;
      }
      
      html += `</div>`;
    });
    
    html += `</div>`;
  }
  
  html += `</div>`;
  
  els.emsileContent.innerHTML = html;
}

function toggleEmsile() {
  hideAllPanels();
  els.emsilePanel?.classList.remove("hidden");
  loadEmsile();
}

// =====================================
// BİNA - البناء (Mezid Fiiller II-X)
// =====================================
async function loadBina() {
  if (binaLoaded) return;
  
  for (const file of BINA_FILES) {
    try {
      const res = await fetch(file);
      if (!res.ok) continue;
      const json = await res.json();
      if (json.forms && Array.isArray(json.forms)) {
        binaForms.push(...json.forms);
      }
    } catch (e) {
      console.warn(`Could not load ${file}:`, e);
    }
  }
  
  binaLoaded = true;
  populateBinaSelect();
  if (binaForms.length > 0) {
    renderBinaContent(0);
  }
}

function populateBinaSelect() {
  if (!els.binaSelect) return;
  els.binaSelect.innerHTML = binaForms.map((form, i) => 
    `<option value="${i}">${form.formName} (${form.formNumber}) - ${form.patternAr}</option>`
  ).join("");
}

function renderBinaContent(formIndex) {
  if (!els.binaContent || !binaForms[formIndex]) return;
  
  const form = binaForms[formIndex];
  let html = `
    <div class="bina-form">
      <div class="bina-header">
        <h3>${form.formName} <span class="form-number">${form.formNumber}</span></h3>
        <div class="bina-pattern">
          <span class="arabic-text">${form.patternAr}</span>
          <span class="translit">${form.pattern}</span>
        </div>
        <div class="bina-meaning-change">
          <span class="label">Anlam Değişimi:</span> ${form.meaningChange}
        </div>
      </div>
      
      <div class="bina-examples">
        <h4>Örnekler</h4>
        <div class="bina-examples-grid">`;
  
  form.examples.forEach(ex => {
    html += `
      <div class="bina-example-card">
        <div class="bina-ex-header">
          <span class="bina-root arabic-text">${ex.root}</span>
          <span class="bina-root-meaning">${ex.rootMeaning}</span>
        </div>
        <div class="bina-ex-mazi">
          <span class="label">Mazi:</span>
          <span class="arabic-text">${ex.mazi}</span>
          <span class="translit">(${ex.maziTranslit})</span>
        </div>
        <div class="bina-ex-muzari">
          <span class="label">Muzari:</span>
          <span class="arabic-text">${ex.muzari}</span>
          <span class="translit">(${ex.muzariTranslit})</span>
        </div>
        <div class="bina-ex-masdar">
          <span class="label">Masdar:</span>
          <span class="arabic-text">${ex.masdar}</span>
          <span class="translit">(${ex.masdarTranslit})</span>
        </div>
        <div class="bina-ex-meaning">${ex.meaning}</div>
      </div>`;
  });
  
  html += `</div></div></div>`;
  
  els.binaContent.innerHTML = html;
}

function toggleBina() {
  hideAllPanels();
  els.binaPanel?.classList.remove("hidden");
  loadBina();
}

// =====================================
// MAKSUD - المقصود (İlletli ve Muzaaf Fiiller)
// =====================================
async function loadMaksud() {
  if (maksudLoaded) return;
  
  for (const file of MAKSUD_FILES) {
    try {
      const res = await fetch(file);
      if (!res.ok) continue;
      const json = await res.json();
      if (json.categories && Array.isArray(json.categories)) {
        maksudCategories.push(...json.categories);
      }
    } catch (e) {
      console.warn(`Could not load ${file}:`, e);
    }
  }
  
  maksudLoaded = true;
  populateMaksudSelect();
  if (maksudCategories.length > 0) {
    renderMaksudContent(0);
  }
}

function populateMaksudSelect() {
  if (!els.maksudSelect) return;
  els.maksudSelect.innerHTML = maksudCategories.map((cat, i) => 
    `<option value="${i}">${cat.name} - ${cat.nameAr}</option>`
  ).join("");
}

function renderMaksudContent(catIndex) {
  if (!els.maksudContent || !maksudCategories[catIndex]) return;
  
  const cat = maksudCategories[catIndex];
  let html = `
    <div class="maksud-category">
      <div class="maksud-header">
        <h3>${cat.name} <span class="arabic-text">${cat.nameAr}</span></h3>
        <p class="maksud-desc">${cat.description}</p>
      </div>`;
  
  if (cat.subcategories) {
    html += `<div class="maksud-subcategories">`;
    
    cat.subcategories.forEach(sub => {
      html += `
        <div class="maksud-subcat">
          <div class="maksud-subcat-header">
            <h4>${sub.name} <span class="arabic-text">${sub.nameAr}</span></h4>
            <p class="maksud-subcat-desc">${sub.description}</p>
          </div>
          
          <div class="maksud-examples">`;
      
      sub.examples.forEach(ex => {
        html += `
          <div class="maksud-example-card">
            <div class="maksud-ex-word arabic-text">${ex.verb}</div>
            <div class="maksud-ex-forms">
              <span class="label">Mazi:</span> <span class="arabic-text">${ex.mazi}</span>
              <span class="label">Muzari:</span> <span class="arabic-text">${ex.muzari}</span>
            </div>
            <div class="maksud-ex-meaning">${ex.meaning}</div>
            ${ex.note ? `<div class="maksud-ex-note">📝 ${ex.note}</div>` : ""}
          </div>`;
      });
      
      html += `</div>`;
      
      // Rules
      if (sub.rules) {
        html += `
          <div class="maksud-rules">
            <h5>Kurallar</h5>
            <ul>
              ${sub.rules.map(r => `<li>${r}</li>`).join("")}
            </ul>
          </div>`;
      }
      
      html += `</div>`;
    });
    
    html += `</div>`;
  }
  
  html += `</div>`;
  
  els.maksudContent.innerHTML = html;
}

function toggleMaksud() {
  hideAllPanels();
  els.maksudPanel?.classList.remove("hidden");
  loadMaksud();
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Timer
  syncTimerToSelection();
  els.timerStart?.addEventListener("click", toggleTimer);
  els.timerReset?.addEventListener("click", resetTimer);
  els.timerDuration?.addEventListener("change", syncTimerToSelection);
  
  // Load & navigate
  els.loadBtn?.addEventListener("click", loadData);
  els.nextBtn?.addEventListener("click", showNextWord);
  els.nextBtnCard?.addEventListener("click", showNextWord);
  
  // Filters
  els.levelFilter?.addEventListener("change", applyFilters);
  els.categoryFilter?.addEventListener("change", applyFilters);
  
  // TTS
  els.vocabSpeak?.addEventListener("click", () => {
    if (currentItem?.word) speakText(currentItem.word);
  });
  
  // Grammar
  els.grammarBtn?.addEventListener("click", toggleGrammar);
  els.grammarTopic?.addEventListener("change", (e) => {
    const idx = parseInt(e.target.value, 10);
    if (!isNaN(idx)) showGrammarDetail(idx);
  });
  els.grammarFilter?.addEventListener("input", filterGrammarTopics);
  
  // Roots
  els.rootsBtn?.addEventListener("click", toggleRoots);
  els.rootSearchBtn?.addEventListener("click", searchRoots);
  els.rootSearch?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchRoots();
  });
  
  // Patterns
  els.patternsBtn?.addEventListener("click", togglePatterns);
  
  // Sarf
  els.sarfBtn?.addEventListener("click", toggleSarf);
  els.sarfTopic?.addEventListener("change", (e) => {
    const idx = parseInt(e.target.value, 10);
    if (!isNaN(idx)) showSarfDetail(idx);
  });
  
  // Nahiv
  els.nahivBtn?.addEventListener("click", toggleNahiv);
  els.nahivTopic?.addEventListener("change", (e) => {
    const idx = parseInt(e.target.value, 10);
    if (!isNaN(idx)) showNahivDetail(idx);
  });
  
  // Basics
  els.basicsBtn?.addEventListener("click", toggleBasics);
  document.querySelectorAll(".basics-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      document.querySelectorAll(".basics-tab").forEach(t => t.classList.remove("active"));
      e.target.classList.add("active");
      const tabName = e.target.dataset.tab;
      if (tabName) renderBasicsTab(tabName);
    });
  });
  
  // Islamic
  els.islamicBtn?.addEventListener("click", toggleIslamic);
  els.islamicCategory?.addEventListener("change", (e) => {
    renderIslamicContent(e.target.value, els.islamicSearch?.value || "");
  });
  els.islamicSearch?.addEventListener("input", (e) => {
    renderIslamicContent(els.islamicCategory?.value || "ALL", e.target.value);
  });
  
  // Intro
  els.introBtn?.addEventListener("click", toggleIntro);
  
  // Emsile
  els.emsileBtn?.addEventListener("click", toggleEmsile);
  els.emsileSelect?.addEventListener("change", (e) => {
    const babIndex = parseInt(e.target.value, 10);
    renderEmsileContent(babIndex);
  });
  
  // Bina
  els.binaBtn?.addEventListener("click", toggleBina);
  els.binaSelect?.addEventListener("change", (e) => {
    const formIndex = parseInt(e.target.value, 10);
    renderBinaContent(formIndex);
  });
  
  // Maksud
  els.maksudBtn?.addEventListener("click", toggleMaksud);
  els.maksudSelect?.addEventListener("change", (e) => {
    const catIndex = parseInt(e.target.value, 10);
    renderMaksudContent(catIndex);
  });
  
  // Load TTS voices
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = pickTtsVoice;
    pickTtsVoice();
  }
});
