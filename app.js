const DATA_FILE_COUNT = 20;
const LANG_PATHS = {
  english: "data/english",
  germany: "data/germany",
  russion: "data/russion",
  french: "data/french",
};
let currentLang = "english";

const GRAMMAR_FILES = {
  english: [
    "data/english/grammar_01.json",
    "data/english/grammar_02.json",
    "data/english/grammar_03.json",
    "data/english/grammar_04.json",
    "data/english/grammar_05.json",
    "data/english/grammar_06.json",
  ],
  germany: [
    "data/germany/grammar_01.json",
    "data/germany/grammar_02.json",
    "data/germany/grammar_03.json",
    "data/germany/grammar_04.json",
  ],
  russion: [
    "data/russion/grammar_01.json",
    "data/russion/grammar_02.json",
    "data/russion/grammar_03.json",
    "data/russion/grammar_04.json",
  ],
  french: [
    "data/french/grammar_01.json",
    "data/french/grammar_02.json",
    "data/french/grammar_03.json",
    "data/french/grammar_04.json",
  ],
};

let allData = [];
let filteredData = [];
let currentItem = null;
let grammarTopics = [];
let chunkItems = [];
let currentChunk = null;
let exampleItems = [];
let exampleFiltered = [];
let currentExample = null;
let readingItems = [];
let currentReading = null;
let examItems = [];
let currentExam = null;
let examIndex = 0;
let examScore = 0;
let examFinished = false;
let examKeyLoaded = null;
let ttsVoice = null;
let timerInterval = null;
let timerEndAt = null;
let timerRemainingMs = 0;
let timerRunning = false;
let audioCtx = null;

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function shuffleExamOptions(options, answerIndex) {
  const indices = options.map((_, idx) => idx);
  shuffleArray(indices);
  const shuffledOptions = indices.map((i) => options[i]);
  const newAnswerIndex = indices.indexOf(answerIndex);
  return { options: shuffledOptions, answer: newAnswerIndex };
}

function pickTtsVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("en"));
  const preferred =
    english.find((v) => /natural|premium|us|uk/i.test(v.name)) ||
    english.find((v) => /english/i.test(v.name)) ||
    english[0] ||
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
    utter.lang = voice.lang || "en-US";
  } else {
    utter.lang = "en-US";
  }
  utter.rate = 0.95;
  utter.pitch = 1;
  utter.volume = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

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
  if (els.timerStart) els.timerStart.textContent = "Start";
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
  if (els.timerStart) els.timerStart.textContent = "Pause";
  setTimerStatus("Süre başladı. İyi çalışmalar!");
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
  if (els.timerStart) els.timerStart.textContent = "Resume";
  setTimerStatus("Durduruldu.");
}

function resetTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerRunning = false;
  timerEndAt = null;
  syncTimerToSelection();
  setTimerStatus("Hazırsan başlat.");
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
    if (els.timerStart) els.timerStart.textContent = "Start";
    setTimerStatus("Süre tamamlandı! Harika iş çıkardın.");
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

const els = {
  status: document.getElementById("status"),
  loadHint: document.getElementById("load-hint"),
  timerDuration: document.getElementById("timer-duration"),
  timerStart: document.getElementById("timer-start"),
  timerReset: document.getElementById("timer-reset"),
  timerRemaining: document.getElementById("timer-remaining"),
  timerStatus: document.getElementById("timer-status"),
  card: document.getElementById("card"),
  nextBtnCard: document.getElementById("next-btn-card"),
  word: document.getElementById("word"),
  pos: document.getElementById("pos"),
  level: document.getElementById("level"),
  definition: document.getElementById("definition"),
  sentences: document.getElementById("sentences"),
  collocation: document.getElementById("collocation"),
  quizQuestion: document.getElementById("quiz-question"),
  quizOptions: document.getElementById("quiz-options"),
  quizResult: document.getElementById("quiz-result"),
  vocabSpeak: document.getElementById("vocab-speak"),
  loadBtn: document.getElementById("load-btn"),
  nextBtn: document.getElementById("next-btn"),
  levelFilter: document.getElementById("level-filter"),
  grammarLang: document.getElementById("grammar-lang"),
  grammarList: document.getElementById("grammar-list"),
  grammarTopic: document.getElementById("grammar-topic"),
  grammarDetail: document.getElementById("grammar-detail"),
  grammarStatus: document.getElementById("grammar-status"),
  vocabLang: document.getElementById("vocab-lang"),
  grammarPanel: document.getElementById("grammar-panel"),
  grammarBtn: document.getElementById("grammar-btn"),
  examplesBtn: document.getElementById("examples-btn"),
  chunksBtn: document.getElementById("chunks-btn"),
  chunkCard: document.getElementById("chunk-card"),
  chunkText: document.getElementById("chunk-text"),
  chunkLevel: document.getElementById("chunk-level"),
  chunkExample: document.getElementById("chunk-example"),
  chunkTr: document.getElementById("chunk-tr"),
  chunkNext: document.getElementById("chunk-next"),
  exampleCard: document.getElementById("example-card"),
  exampleTopic: document.getElementById("example-topic"),
  exampleLevel: document.getElementById("example-level"),
  exampleSentence: document.getElementById("example-sentence"),
  exampleTr: document.getElementById("example-tr"),
  exampleNote: document.getElementById("example-note"),
  exampleNext: document.getElementById("example-next"),
  exampleSpeak: document.getElementById("example-speak"),
  exampleLevelFilter: document.getElementById("example-level-filter"),
  exampleTopicFilter: document.getElementById("example-topic-filter"),
  readingBtn: document.getElementById("reading-btn"),
  readingPanel: document.getElementById("reading-panel"),
  readingLang: document.getElementById("reading-lang"),
  readingStatus: document.getElementById("reading-status"),
  readingCard: document.getElementById("reading-card"),
  readingTitle: document.getElementById("reading-title"),
  readingLevel: document.getElementById("reading-level"),
  readingText: document.getElementById("reading-text"),
  readingGlossary: document.getElementById("reading-glossary"),
  readingNext: document.getElementById("reading-next"),
  examBtn: document.getElementById("exam-btn"),
  examPanel: document.getElementById("exam-panel"),
  examSelect: document.getElementById("exam-select"),
  examStart: document.getElementById("exam-start"),
  examNext: document.getElementById("exam-next"),
  examCard: document.getElementById("exam-card"),
  examQuestion: document.getElementById("exam-question"),
  examOptions: document.getElementById("exam-options"),
  examFeedback: document.getElementById("exam-feedback"),
  examSummary: document.getElementById("exam-summary"),
  examScore: document.getElementById("exam-score"),
  examTotal: document.getElementById("exam-total"),
  examStatus: document.getElementById("exam-status"),
};

els.loadBtn.addEventListener("click", loadAllData);
els.nextBtn.addEventListener("click", () => goNextWord());
els.nextBtnCard?.addEventListener("click", () => goNextWord());
els.levelFilter.addEventListener("change", () => {
  filterByLevel(els.levelFilter.value);
  showRandomCard();
});
els.grammarLang.addEventListener("change", () => loadGrammar(els.grammarLang.value));
if (els.grammarTopic) {
  els.grammarTopic.addEventListener("change", (e) => {
    const id = e.target.value;
    const topic = grammarTopics.find((t, idx) => String(idx) === id);
    renderGrammarDetail(topic);
  });
}
els.vocabLang.addEventListener("change", (e) => {
  currentLang = e.target.value;
  // keep grammar in sync with selected vocab language
  if (els.grammarLang.value !== currentLang) {
    els.grammarLang.value = currentLang;
  }
  grammarTopics = [];
  renderGrammarStatus("Select a language to load grammar.");
  // reset vocab/chunk state on language change
  chunkItems = [];
  renderChunk(null);
  exampleItems = [];
  exampleFiltered = [];
  if (els.exampleTopicFilter) els.exampleTopicFilter.value = "";
  if (els.exampleLevelFilter) els.exampleLevelFilter.value = "ALL";
  renderExample(null);
  examItems = [];
  resetExamUI();
  filteredData = [];
  allData = [];
  els.card.classList.add("hidden");
  els.status.textContent = "Language changed. Press Load Data to fetch vocabulary.";
  els.loadHint?.classList.remove("hidden");
  readingItems = [];
  currentReading = null;
  if (els.grammarPanel) els.grammarPanel.classList.add("hidden");
  if (els.readingPanel) els.readingPanel.classList.add("hidden");
  els.readingCard.classList.add("hidden");
  renderReadingStatus("Select a language to load readings.");
});
els.grammarBtn.addEventListener("click", () => showGrammarPanel());
els.chunksBtn.addEventListener("click", () => showChunkCard());
els.examplesBtn.addEventListener("click", () => showExampleCard());
els.chunkNext.addEventListener("click", () => renderChunk(randomChunk()));
els.exampleNext.addEventListener("click", () => renderExample(randomExample()));
els.exampleLevelFilter?.addEventListener("change", () => applyExampleFilters());
els.exampleTopicFilter?.addEventListener("input", () => applyExampleFilters());
els.examBtn.addEventListener("click", () => showExamPanel());
els.examStart?.addEventListener("click", () => startExam());
els.examNext?.addEventListener("click", () => nextExamQuestion());
els.examSelect?.addEventListener("change", () => {
  resetExamUI();
  if (els.examStatus) els.examStatus.textContent = "Exam selected. Press Start.";
});
els.vocabSpeak?.addEventListener("click", () => speakText(currentItem?.word));
els.exampleSpeak?.addEventListener("click", () =>
  speakText(currentExample ? currentExample.sentence : "")
);
els.readingBtn.addEventListener("click", () => showReadingPanel());
els.readingLang.addEventListener("change", () => {
  readingItems = [];
  renderReading(null);
  loadReadings(els.readingLang.value);
});
els.readingNext.addEventListener("click", () => renderReading(randomReading()));
els.timerStart?.addEventListener("click", () => toggleTimer());
els.timerReset?.addEventListener("click", () => resetTimer());
els.timerDuration?.addEventListener("change", () => {
  if (!timerRunning) {
    syncTimerToSelection();
    setTimerStatus("Hazırsan başlat.");
  }
});

function goNextWord() {
  if (!filteredData.length) {
    els.status.textContent = "Press Load Data first, then Next Word.";
    els.card.classList.add("hidden");
    return;
  }
  els.chunkCard.classList.add("hidden");
  els.exampleCard.classList.add("hidden");
  if (els.examPanel) els.examPanel.classList.add("hidden");
  if (els.readingPanel) els.readingPanel.classList.add("hidden");
  showRandomCard();
}

els.grammarLang.value = currentLang;
els.readingLang.value = currentLang;
if (els.exampleLevelFilter) els.exampleLevelFilter.value = "ALL";
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.addEventListener("voiceschanged", pickTtsVoice);
  pickTtsVoice();
}
syncTimerToSelection();
setTimerStatus("Hazırsan başlat.");

async function loadAllData() {
  els.status.textContent = "Loading data...";
  allData = [];
  const duplicates = new Set();
  const seen = new Set();
  const basePath = LANG_PATHS[currentLang] || LANG_PATHS.english;
  const dataFiles = Array.from({ length: DATA_FILE_COUNT }, (_, i) =>
    `${basePath}/vocab_${String(i + 1).padStart(2, "0")}.json`
  );

  for (const file of dataFiles) {
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      for (const item of json) {
        const key = `${item.word?.toLowerCase()}|${item.pos?.toLowerCase()}`;
        if (seen.has(key)) duplicates.add(key);
        seen.add(key);
        allData.push(item);
      }
    } catch (err) {
      console.warn(`Failed to load ${file}: ${err.message}`);
    }
  }

  if (duplicates.size > 0) {
    console.warn(`Duplicates detected (${duplicates.size}):`, Array.from(duplicates));
  }

  if (allData.length === 0) {
    els.status.textContent = "No data loaded.";
    els.card.classList.add("hidden");
    return;
  }

  filterByLevel(els.levelFilter.value);
  els.card.classList.add("hidden");
  els.status.textContent = `Loaded ${allData.length} items (${currentLang}). Next Word ile başla.`;
  els.loadHint?.classList.add("hidden");
}

function filterByLevel(level) {
  if (level === "ALL") {
    filteredData = [...allData];
  } else {
    filteredData = allData.filter((item) => item.level === level);
  }
}

function showRandomCard() {
  els.chunkCard.classList.add("hidden");
  els.exampleCard.classList.add("hidden");
  if (els.examPanel) els.examPanel.classList.add("hidden");
  if (els.grammarPanel) els.grammarPanel.classList.add("hidden");
  if (els.readingPanel) els.readingPanel.classList.add("hidden");
  if (!filteredData.length) {
    els.card.classList.add("hidden");
    els.status.textContent = "No items match this filter.";
    return;
  }
  currentItem = randomCard(filteredData);
  renderCard(currentItem);
  els.card.classList.remove("hidden");
}

function randomCard(data) {
  return data[Math.floor(Math.random() * data.length)];
}

function renderCard(item) {
  els.word.textContent = item.word;
  els.pos.textContent = item.pos;
  els.level.textContent = item.level;
  els.definition.textContent = item.definition;

  els.sentences.innerHTML = "";
  (item.sentences || []).forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    els.sentences.appendChild(li);
  });

  els.collocation.textContent = item.collocation || "";

  els.quizQuestion.textContent = item.quiz?.question || "";
  els.quizOptions.innerHTML = "";
  els.quizResult.textContent = "";

  (item.quiz?.options || []).forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.addEventListener("click", () => handleQuizAnswer(idx));
    els.quizOptions.appendChild(btn);
  });
}

function handleQuizAnswer(selectedIndex) {
  const correctIndex = currentItem?.quiz?.answer;
  const buttons = Array.from(els.quizOptions.children);
  buttons.forEach((btn, idx) => {
    btn.classList.remove("correct", "wrong");
    if (idx === correctIndex) btn.classList.add("correct");
    if (idx === selectedIndex && idx !== correctIndex) btn.classList.add("wrong");
  });
  const isCorrect = selectedIndex === correctIndex;
  els.quizResult.textContent = isCorrect ? "Correct!" : "Try again.";
  els.quizResult.style.color = isCorrect ? "var(--success)" : "var(--error)";
}

async function loadGrammar(lang) {
  const files = GRAMMAR_FILES[lang] || [];
  grammarTopics = [];
  renderGrammarStatus(
    files.length === 0 ? "No grammar topics for this language yet." : "Loading grammar..."
  );
  if (!files.length) {
    renderGrammar();
    return;
  }
  for (const file of files) {
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      grammarTopics.push(...json);
    } catch (err) {
      console.warn(`Grammar load failed: ${file} - ${err.message}`);
    }
  }
  renderGrammarStatus(
    grammarTopics.length === 0 ? "No grammar loaded." : `Loaded ${grammarTopics.length} topics.`
  );
  renderGrammar();
}

function renderGrammar() {
  if (!els.grammarTopic) return;
  els.grammarTopic.innerHTML = '<option value="">Select a topic</option>';
  if (!grammarTopics.length) {
    renderGrammarDetail(null);
    return;
  }
  grammarTopics.forEach((topic, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx);
    opt.textContent = topic.topic || "Topic";
    els.grammarTopic.appendChild(opt);
  });
  renderGrammarDetail(null);
}

function renderGrammarDetail(topic) {
  if (!els.grammarDetail) return;
  if (!topic) {
    els.grammarDetail.classList.add("hidden");
    els.grammarDetail.innerHTML = "";
    return;
  }
  els.grammarDetail.classList.remove("hidden");
  const pattern = topic.pattern ? `<p><strong>Pattern:</strong> ${topic.pattern}</p>` : "";
  const tips =
    topic.tips && topic.tips.length
      ? `<p><strong>Tips:</strong></p><ul>${topic.tips
          .map((t) => `<li>${t}</li>`)
          .join("")}</ul>`
      : "";
  const mistakes =
    (topic.mistakes && topic.mistakes.length) || (topic.commonMistakes && topic.commonMistakes.length)
      ? `<p><strong>Watch out:</strong></p><ul>${(topic.mistakes || topic.commonMistakes || [])
          .map((m) => `<li>${m}</li>`)
          .join("")}</ul>`
      : "";
  els.grammarDetail.innerHTML = `
    <div class="grammar-detail-header">
      <h4>${topic.topic || "Topic"}</h4>
      <span class="tag level">${topic.level || ""}</span>
    </div>
    <p>${topic.description || ""}</p>
    ${pattern}
    <p><strong>Examples:</strong></p>
    <ul>${(topic.examples || []).map((ex) => `<li>${ex}</li>`).join("")}</ul>
    ${tips}
    ${mistakes}
    <p class="note">${topic.note || ""}</p>
  `;
}

function renderGrammarStatus(text) {
  els.grammarStatus.textContent = text;
}

function showGrammarPanel() {
  if (els.grammarPanel) els.grammarPanel.classList.remove("hidden");
  els.card.classList.add("hidden");
  els.chunkCard.classList.add("hidden");
  els.exampleCard.classList.add("hidden");
  if (els.examPanel) els.examPanel.classList.add("hidden");
  if (els.readingPanel) els.readingPanel.classList.add("hidden");
  if (!grammarTopics.length || els.grammarLang.value !== currentLang) {
    els.grammarLang.value = currentLang;
    loadGrammar(currentLang);
  }
}

// Chunks
const CHUNK_FILES = {
  english: [
    "data/english/chunks_01.json",
    "data/english/chunks_02.json",
    "data/english/chunks_03.json",
    "data/english/chunks_04.json",
    "data/english/chunks_05.json",
    "data/english/chunks_06.json",
    "data/english/chunks_07.json",
    "data/english/chunks_08.json",
    "data/english/chunks_09.json",
    "data/english/chunks_10.json",
  ],
  germany: [],
  russion: [],
  french: [],
};

const EXAMPLE_FILES = {
  english: [
    "data/english/examples_01.json",
    "data/english/examples_02.json",
    "data/english/examples_03.json",
    "data/english/examples_04.json",
    "data/english/examples_05.json",
    "data/english/examples_06.json",
  ],
  germany: [],
  russion: [],
  french: [],
};

const READING_FILES = {
  english: [
    "data/english/readings_01.json",
    "data/english/readings_02.json",
    "data/english/readings_03.json",
    "data/english/readings_04.json",
    "data/english/readings_05.json",
    "data/english/readings_06.json",
    "data/english/readings_07.json",
    "data/english/readings_08.json",
    "data/english/readings_09.json",
    "data/english/readings_10.json",
  ],
  germany: [],
  russion: [],
  french: [],
};

async function loadChunks(lang) {
  const files = CHUNK_FILES[lang] || [];
  chunkItems = [];
  if (!files.length) {
    renderChunk(null);
    return;
  }
  for (const file of files) {
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      chunkItems.push(...json);
    } catch (err) {
      console.warn(`Chunk load failed: ${file} - ${err.message}`);
    }
  }
  shuffleArray(chunkItems);
  renderChunk(randomChunk());
}

function randomChunk() {
  if (!chunkItems.length) return null;
  return chunkItems[Math.floor(Math.random() * chunkItems.length)];
}

function renderChunk(item) {
  if (!item) {
    els.chunkCard.classList.add("hidden");
    return;
  }
  currentChunk = item;
  els.chunkText.textContent = item.chunk || "";
  els.chunkLevel.textContent = item.level || "";
  els.chunkExample.textContent = item.example || "";
  els.chunkTr.textContent = item.tr || "";
  els.chunkCard.classList.remove("hidden");
}

async function showChunkCard() {
  if (!chunkItems.length) {
    await loadChunks(currentLang);
  }
  // Hide vocab card when focusing on chunks
  els.card.classList.add("hidden");
  els.exampleCard.classList.add("hidden");
  if (els.examPanel) els.examPanel.classList.add("hidden");
  if (els.grammarPanel) els.grammarPanel.classList.add("hidden");
  if (els.readingPanel) els.readingPanel.classList.add("hidden");
  renderChunk(randomChunk());
}

async function loadExamples(lang) {
  const files = EXAMPLE_FILES[lang] || [];
  exampleItems = [];
  if (!files.length) {
    exampleFiltered = [];
    renderExample(null);
    return;
  }
  for (const file of files) {
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      exampleItems.push(...json);
    } catch (err) {
      console.warn(`Example load failed: ${file} - ${err.message}`);
    }
  }
  shuffleArray(exampleItems);
  applyExampleFilters();
}

function randomExample() {
  if (!exampleFiltered.length) return null;
  return exampleFiltered[Math.floor(Math.random() * exampleFiltered.length)];
}

function renderExample(item) {
  if (!item) {
    els.exampleCard.classList.add("hidden");
    return;
  }
  currentExample = item;
  els.exampleTopic.textContent = item.topic || "Example";
  els.exampleLevel.textContent = item.level || "";
  els.exampleSentence.textContent = item.sentence || "";
  els.exampleTr.textContent = item.tr || "";
  els.exampleNote.textContent = item.note || "";
  els.exampleCard.classList.remove("hidden");
}

function applyExampleFilters() {
  const level = els.exampleLevelFilter?.value || "ALL";
  const topicQuery = (els.exampleTopicFilter?.value || "").toLowerCase();
  exampleFiltered = exampleItems.filter((ex) => {
    const levelOk = level === "ALL" ? true : ex.level === level;
    const topicOk = topicQuery
      ? (ex.topic || "").toLowerCase().includes(topicQuery) ||
        (ex.sentence || "").toLowerCase().includes(topicQuery)
      : true;
    return levelOk && topicOk;
  });
  renderExample(randomExample());
}

async function showExampleCard() {
  if (!exampleItems.length) {
    await loadExamples(currentLang);
  }
  els.card.classList.add("hidden");
  els.chunkCard.classList.add("hidden");
  if (els.examPanel) els.examPanel.classList.add("hidden");
  if (els.grammarPanel) els.grammarPanel.classList.add("hidden");
  if (els.readingPanel) els.readingPanel.classList.add("hidden");
  applyExampleFilters();
}

async function loadReadings(lang) {
  const files = READING_FILES[lang] || [];
  readingItems = [];
  renderReadingStatus(files.length === 0 ? "No readings for this language yet." : "Loading...");
  if (!files.length) {
    renderReading(null);
    return;
  }
  for (const file of files) {
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      readingItems.push(...json);
    } catch (err) {
      console.warn(`Reading load failed: ${file} - ${err.message}`);
    }
  }
  shuffleArray(readingItems);
  renderReadingStatus(
    readingItems.length === 0 ? "No readings loaded." : `Loaded ${readingItems.length} readings.`
  );
  renderReading(randomReading());
}

function randomReading() {
  if (!readingItems.length) return null;
  return readingItems[Math.floor(Math.random() * readingItems.length)];
}

function renderReading(item) {
  if (!item) {
    els.readingCard.classList.add("hidden");
    return;
  }
  currentReading = item;
  els.readingTitle.textContent = item.title || "Reading";
  els.readingLevel.textContent = item.level || "";
  els.readingText.textContent = item.text || "";
  els.readingGlossary.innerHTML = (item.glossary || [])
    .map((g) => `<li><strong>${g.word}:</strong> ${g.meaning}</li>`)
    .join("");
  els.readingCard.classList.remove("hidden");
}

function renderReadingStatus(text) {
  els.readingStatus.textContent = text;
}

async function showReadingPanel() {
  els.readingPanel.classList.remove("hidden");
  els.card.classList.add("hidden");
  els.chunkCard.classList.add("hidden");
  els.exampleCard.classList.add("hidden");
  if (els.examPanel) els.examPanel.classList.add("hidden");
  if (els.grammarPanel) els.grammarPanel.classList.add("hidden");
  if (!readingItems.length || els.readingLang.value !== currentLang) {
    els.readingLang.value = currentLang;
    await loadReadings(currentLang);
  }
}
const EXAM_FILES = {
  english: {
    exam_01: "data/english/exam_01.json",
    exam_02: "data/english/exam_02.json",
    exam_03: "data/english/exam_03.json",
    exam_04: "data/english/exam_04.json",
    exam_05: "data/english/exam_05.json",
    exam_06: "data/english/exam_06.json",
    exam_07: "data/english/exam_07.json",
    exam_08: "data/english/exam_08.json",
    exam_09: "data/english/exam_09.json",
    exam_10: "data/english/exam_10.json",
  },
  germany: {},
  russion: {},
  french: {},
};
function resetExamUI() {
  examItems = [];
  currentExam = null;
  examIndex = 0;
  examScore = 0;
  examFinished = false;
  examKeyLoaded = null;
  if (els.examCard) els.examCard.classList.add("hidden");
  if (els.examSummary) els.examSummary.classList.add("hidden");
  if (els.examFeedback) els.examFeedback.textContent = "";
  if (els.examStatus) els.examStatus.textContent = "Select Exam to start.";
  updateExamSummary();
}

async function loadExamSet(lang, key) {
  const map = EXAM_FILES[lang] || {};
  const file = map[key];
  resetExamUI();
  if (!file) {
    if (els.examStatus) els.examStatus.textContent = "No exam available for this language.";
    return;
  }
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    examItems = await res.json();
    shuffleArray(examItems);
    examKeyLoaded = key;
    if (els.examStatus)
      els.examStatus.textContent = `Loaded ${examItems.length} questions. Press Start.`;
    els.examTotal.textContent = examItems.length;
  } catch (err) {
    console.warn(`Exam load failed: ${file} - ${err.message}`);
    if (els.examStatus) els.examStatus.textContent = "Exam load failed.";
  }
}

function startExam() {
  const key = els.examSelect?.value;
  if (!key) {
    if (els.examStatus) els.examStatus.textContent = "Choose an exam set first.";
    return;
  }
  if (!examItems.length || examFinished || examKeyLoaded !== key) {
    loadExamSet(currentLang, key).then(() => {
      if (examItems.length) beginExamFlow();
    });
  } else {
    beginExamFlow();
  }
}

function beginExamFlow() {
  examIndex = 0;
  examScore = 0;
  examFinished = false;
  renderExamQuestion();
  updateExamSummary();
}

function renderExamQuestion() {
  if (!examItems.length) {
    if (els.examStatus) els.examStatus.textContent = "Load an exam first.";
    return;
  }
  if (examIndex >= examItems.length) {
    finishExam();
    return;
  }
  currentExam = examItems[examIndex];
  els.examQuestion.textContent = `${examIndex + 1}. ${currentExam.question || ""}`;
  els.examOptions.innerHTML = "";
  els.examFeedback.textContent = "";
  const shuffled = shuffleExamOptions(currentExam.options || [], currentExam.answer);
  currentExam = { ...currentExam, options: shuffled.options, answer: shuffled.answer };
  currentExam.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.addEventListener("click", () => handleExamAnswer(idx));
    els.examOptions.appendChild(btn);
  });
  els.examCard.classList.remove("hidden");
  if (els.examStatus)
    els.examStatus.textContent = `Question ${examIndex + 1} of ${examItems.length}`;
}

function handleExamAnswer(selected) {
  if (examFinished) return;
  const correct = currentExam?.answer;
  const buttons = Array.from(els.examOptions.children);
  buttons.forEach((btn, idx) => {
    btn.classList.remove("correct", "wrong");
    if (idx === correct) btn.classList.add("correct");
    if (idx === selected && idx !== correct) btn.classList.add("wrong");
  });
  if (selected === correct) {
    examScore += 1;
    els.examFeedback.textContent = "Correct";
    els.examFeedback.style.color = "var(--success)";
  } else {
    els.examFeedback.textContent = "Incorrect";
    els.examFeedback.style.color = "var(--error)";
  }
  updateExamSummary();
}

function nextExamQuestion() {
  if (!examItems.length) return;
  if (examIndex < examItems.length - 1) {
    examIndex += 1;
    renderExamQuestion();
  } else {
    finishExam();
  }
}

function finishExam() {
  examFinished = true;
  els.examCard.classList.add("hidden");
  els.examSummary.classList.remove("hidden");
  if (els.examStatus) els.examStatus.textContent = "Exam finished.";
  updateExamSummary();
}

function updateExamSummary() {
  if (els.examScore) els.examScore.textContent = examScore;
  if (els.examTotal) els.examTotal.textContent = examItems.length || 0;
}

async function showExamPanel() {
  els.examPanel.classList.remove("hidden");
  els.card.classList.add("hidden");
  els.chunkCard.classList.add("hidden");
  els.exampleCard.classList.add("hidden");
  if (els.grammarPanel) els.grammarPanel.classList.add("hidden");
  if (els.readingPanel) els.readingPanel.classList.add("hidden");
  if (!examItems.length) {
    const key = els.examSelect?.value || "exam_01";
    if (els.examSelect && !els.examSelect.value) els.examSelect.value = key;
    await loadExamSet(currentLang, key);
  }
}
