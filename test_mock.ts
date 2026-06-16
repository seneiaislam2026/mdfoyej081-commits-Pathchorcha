import { ENGLISH_WORDS } from "./src/data/vocabularyData";

const catMapping: Record<string, string> = {
                  "Category: Vocabulary": "vocabulary",
                  "Category: Translation": "translation",
                  "Category: Analogy": "analogy",
                  "Category: Appro. Prep.": "appropriate_preposition",
                  "Category: Group Verb": "group_verb",
                  "Category: Spelling": "spelling",
                  "Category: Class 6 English": "class_6_vocabulary",
                  "Category: Verb (3 Forms)": "verb_forms",
                  "Category: Idiom & Phrase": "idiom_phrase",
                  "Category: Synonym": "synonym",
                  "Category: Antonym": "antonym"
                };

let allQs: any[] = [];
const mockCustomChapters = {
   'English': ['Category: Vocabulary']
};
const englishChapters = mockCustomChapters['English'] || [];
const isAllSelected = englishChapters.length === 0;

const catsToInject: string[] = [];
Object.keys(catMapping).forEach(uiCat => {
   if (isAllSelected || englishChapters.includes(uiCat)) {
      catsToInject.push(catMapping[uiCat]);
   }
});

console.log("Cats to inject:", catsToInject);

if (catsToInject.length > 0) {
   const filteredWords = ENGLISH_WORDS.filter(w => catsToInject.includes(w.category || ''));
   console.log("Filtered words count:", filteredWords.length);
   
   filteredWords.slice(0, 5).forEach(word => {
      let qText = `What is the meaning of "${word.word}"?`;
      if (word.category === 'translation') qText = `Choose the correct translation: "${word.word}"`;
      else if (word.category === 'analogy') qText = `Complete the analogy: ${word.word}`;
      else if (word.category === 'appropriate_preposition') qText = `Fill in the blank: ${word.word}`;
      else if (word.category === 'idiom_phrase') qText = `What is the meaning of the idiom "${word.word}"?`;
      else if (word.category === 'spelling') qText = `Find the correct spelling related to meaning: ${word.meaning}`;
      else if (word.category === 'synonym') qText = `What is the synonym of "${word.word}"?`;
      else if (word.category === 'antonym') qText = `What is the antonym of "${word.word}"?`;
      
      const optionsSet = new Set<string>();
      const meaning = word.meaning || "Unknown";
      optionsSet.add(meaning);
      
      const allMeanings = ENGLISH_WORDS.filter(w => w.category === word.category).map(w => w.meaning).filter(Boolean);
      
      let attempts = 0;
      while (optionsSet.size < 4 && allMeanings.length >= 4 && attempts < 50) {
         const randomMeaning = allMeanings[Math.floor(Math.random() * allMeanings.length)] || "None";
         optionsSet.add(randomMeaning);
         attempts++;
      }
      if (optionsSet.size < 4) {
          optionsSet.add("Unknown"); optionsSet.add("None of the above"); optionsSet.add("Both A and B");
      }
      
      const optionsArray = Array.from(optionsSet).slice(0, 4).sort(() => Math.random() - 0.5);
      const correctIdx = optionsArray.indexOf(meaning);
      const correctOptStr = ["ক", "খ", "গ", "ঘ"][correctIdx >= 0 ? correctIdx : 0];

      allQs.push({
         id: `dyn_eng_${word.id}_${Math.random()}`,
         subject: "English",
         chapter: Object.keys(catMapping).find(k => catMapping[k] === word.category) || "Category: Vocabulary",
         text: qText,
         options: optionsArray.map((opt, i) => `${["ক", "খ", "গ", "ঘ"][i]}. ${opt}`),
         correctOption: correctOptStr,
         explanation: word.example ? String(word.example) : `Correct answer is: ${meaning}`
      });
   });
}

console.log("English Qs Generated:", allQs.length);

// Then filtering it down
let finalQs = allQs;
let mockCustomSubjects = ['English'];
let selectedQs: any[] = [];

mockCustomSubjects.forEach(sub => {
    let subQs = finalQs.filter((q:any) => q.subject === sub);
    console.log(`SubQs before filter chapter for ${sub}:`, subQs.length);
    subQs = subQs.filter((q: any) => {
        const subjectChapters = mockCustomChapters[sub] || [];
        if (subjectChapters.length === 0) return true;
        const qChapter = q.chapter || q.chapter_name || q.topic || q.chapterName || q.chapter_no || q.title || "অধ্যায় ১";
        return subjectChapters.includes(qChapter) || subjectChapters.some(c => qChapter.includes(c) || c.includes(qChapter));
    });
    console.log(`SubQs after filter chapter for ${sub}:`, subQs.length);
});

