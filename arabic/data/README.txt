Arabic (Fasih) Learning Module
================================

Bu klasör Fasih Arapça (العربية الفصحى - Modern Standard Arabic) öğrenimi için özel olarak tasarlanmıştır.

Dosya Yapısı:
-------------
data/
├── vocab_01.json      # Temel kelimeler (A1-A2)
├── vocab_02.json      # Orta seviye kelimeler (B1)
├── grammar_01.json    # Dilbilgisi konuları
└── ...

vocab_XX.json Formatı:
----------------------
{
  "word": "كِتَاب",           // Arapça kelime (harekeli)
  "transliteration": "kitāb", // Latin harflerle yazım
  "level": "A1",              // Seviye: A1, A2, B1, B2
  "pos": "noun",              // Kelime türü: noun, verb, adjective, particle, phrase
  "root": "ك ت ب",           // Üç harfli kök (Arapça'ya özgü)
  "pattern": "فِعَال",         // Vezin kalıbı
  "definition_ar": "...",     // Arapça tanım
  "definition_tr": "...",     // Türkçe tanım
  "definition_en": "...",     // İngilizce tanım
  "sentences": [
    { "ar": "...", "tr": "..." }  // Örnek cümleler
  ],
  "related": [                // İlişkili kelimeler (aynı kökten)
    { "word": "كَاتِب", "meaning": "yazar" }
  ],
  "quiz": {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "answer": 0
  }
}

grammar_XX.json Formatı:
------------------------
{
  "topic": "الضمائر | Zamirler",
  "level": "A1",
  "description": "Açıklama (Türkçe)",
  "pattern": "Dilbilgisi kalıbı",
  "examples": ["örnek 1", "örnek 2"],
  "tips": ["ipucu 1", "ipucu 2"],
  "mistakes": ["yaygın hata 1"],
  "note": "Ek not"
}

Özellikler:
-----------
- RTL (sağdan sola) desteği
- Arapça fontlar (Noto Naskh Arabic, Amiri)
- Kök sistemi (الجذور) araması
- Fiil kalıpları (الأوزان) tablosu
- Text-to-Speech Arapça desteği
- Türkçe ve İngilizce açıklamalar

Notlar:
-------
- Harekeler (تشكيل) öğrenme aşamasında çok önemlidir
- Her kelimenin kökünü öğrenmek kelime hazinesini genişletir
- 10 fiil kalıbını (Form I-X) tanımak anlama becerisini artırır
