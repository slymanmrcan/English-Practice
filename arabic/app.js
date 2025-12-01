// Arabic Learning App - Fasih Arabic (الفصحى)
// Modern Standard Arabic vocabulary and grammar study tool

const VOCAB_FILES = [
  "data/vocab_01.json",
];

const GRAMMAR_FILES = [
  "data/grammar_01.json",
];

let allData = [];
let filteredData = [];
let currentItem = null;
let grammarTopics = [];
let grammarLoaded = false;
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
  
  // Load TTS voices
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = pickTtsVoice;
    pickTtsVoice();
  }
});
