# Contributing Guide

Thanks for your interest! This is a static, data-driven project. Please keep files lightweight and consistent.

## How to contribute
1. **Fork & clone** the repo.
2. **Add/update data** in `data/<lang>/` following existing schemas (vocab, chunks, sentences, readings, exams, grammar). Use ASCII and keep JSON valid.
3. **Update mappings** in `app.js` if you add new files (e.g., `exam_09.json`, `examples_07.json`).
4. **Test locally**: open `index.html` in a browser; try Load Data, Sentences filters, Exams.
5. **Open a PR** with a clear summary and any data sources if used.

## Standards
- Keep entries CEFR A2–B2 as applicable; avoid duplicates.
- Short, clear definitions; quizzes must include the correct index.
- For translations, keep them concise and accurate.

## Reporting issues
Open an issue with steps to reproduce, expected vs. actual behavior, and browser/OS details.
