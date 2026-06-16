import { ENGLISH_WORDS } from "./src/data/vocabularyData";

let allQs: any[] = [];
const mockCustomSubjects = ['মেমোরাইজিং পার্ট'];
const mockCustomChapters = {
    'মেমোরাইজিং পার্ট': ['English Vocabulary', 'Translation']
};

const engCatMapping: Record<string, string> = {
  "English Vocabulary": "vocabulary",
  "Translation": "translation",
};

const catsToInject: {cat: string, lang: string, chapter: string, originalSub: string}[] = [];
                
const isAllMem = false;
const memChapters = mockCustomChapters['মেমোরাইজিং পার্ট'] || [];
Object.keys(engCatMapping).forEach(uiCat => {
    if (isAllMem || memChapters.includes(uiCat)) catsToInject.push({cat: engCatMapping[uiCat], lang: 'english', chapter: uiCat, originalSub: 'মেমোরাইজিং পার্ট'});
});

console.log("Cats to Inject:", catsToInject);

if (catsToInject.length > 0) {
   catsToInject.forEach(({cat, lang, chapter, originalSub}) => {
      const filteredWords = ENGLISH_WORDS.filter(w => w.category === cat && w.language === lang);
      filteredWords.slice(0,5).forEach(word => {
         allQs.push({
            subject: originalSub,
            chapter: chapter,
         });
      });
   });
}

console.log("allQs after inject:", allQs.length);

mockCustomSubjects.forEach(sub => {
    let subQs = allQs.filter((q:any) => q.subject === sub);
    console.log("subQs b4 chap filter:", subQs.length);
    subQs = subQs.filter((q: any) => {
        const subjectChapters = mockCustomChapters[sub] || [];
        if (subjectChapters.length === 0) return true;
        const qChapter = q.chapter || q.chapter_name || q.topic || q.chapterName || q.chapter_no || q.title || "অধ্যায় ১";
        return subjectChapters.includes(qChapter) || subjectChapters.some(c => qChapter.includes(c) || c.includes(qChapter));
    });
    console.log("subQs after chap filter:", subQs.length);
});
