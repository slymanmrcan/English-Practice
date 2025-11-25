Preview online at https://slymanmrcan.github.io/English-Practice/

# Multi-language Vocabulary & Exam Platform

Static, frontend-only web app for vocabulary, chunks, grammar, readings, sentences, and exam simulations. Runs on GitHub Pages—no backend required.

## Features
- Language toggle (English + placeholder dirs for German/Russian/French).
- Vocabulary with quiz, level filter, and optional TTS.
- Chunks (common phrases) with TR translations, random shuffle.
- Sentences (grammar examples) with level/topic filters, shuffle, and TTS.
- Grammar topics with patterns/tips/mistakes.
- Readings with glossaries.
- Exam mode with multiple EFSET-style sets (Exam 01–08), scoring, and selection per language.

## Data
All content lives in `data/`:
- `data/english/vocab_*.json` — vocab items.
- `data/english/chunks_*.json` — chunks with translations.
- `data/english/grammar_*.json` — grammar topics, patterns, tips.
- `data/english/readings_*.json` — reading passages with glossary.
- `data/english/examples_*.json` — sentence examples with TR and notes.
- `data/english/exam_*.json` — exam question sets.

Other language folders mirror the structure (can be expanded).

## Usage
Open `index.html` locally or host via GitHub Pages. Click **Load Data** for vocab, then use the top buttons to switch modes (Grammar, Sentences, Chunks, Reading, Exam). Exams are data-driven: pick a set and press Start.

## Notes
- TTS uses browser `speechSynthesis`; quality depends on available voices.
- Data fetches are static; no external APIs.
- UI is dark-themed, responsive, and single-page.

## Contributing
Add/edit JSON in `data/<lang>/`. Update `app.js` mappings if you add new files (vocab count, grammar, chunks, sentences, readings, exams). No build step required.

### How to contribute
1. Fork and clone the repo.
2. Add or update data files in `data/<lang>/` (keep schema consistent).
3. If you add new series (e.g., `examples_07.json` or `exam_09.json`), list them in `app.js` under the appropriate mapping.
4. Test locally by opening `index.html`.
5. Open a PR describing changes and data sources (if applicable).
