// Duplicate checker for vocab files in ../data/
const DATA_FILE_COUNT = 20;
const files = Array.from({ length: DATA_FILE_COUNT }, (_, i) =>
  `../data/english/vocab_${String(i + 1).padStart(2, "0")}.json`
);

async function loadJson(file) {
  const res = await fetch(file);
  if (!res.ok) throw new Error(`${file}: ${res.status}`);
  return res.json();
}

(async function validate() {
  const seen = new Map(); // key -> first index
  const duplicates = [];
  let total = 0;

  for (const file of files) {
    try {
      const data = await loadJson(file);
      data.forEach((item, idx) => {
        const key = `${item.word?.toLowerCase()}|${item.pos?.toLowerCase()}`;
        total += 1;
        if (seen.has(key)) {
          duplicates.push({ key, file, index: idx });
        } else {
          seen.set(key, { file, index: idx });
        }
      });
    } catch (err) {
      console.warn(`Skip ${file}: ${err.message}`);
    }
  }

  console.log(`Checked ${total} entries.`);
  console.log(`Duplicate count: ${duplicates.length}`);
  if (duplicates.length) {
    console.table(duplicates);
  }
})();
