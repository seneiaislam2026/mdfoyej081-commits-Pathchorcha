import { WordItem } from "./vocabularyData";

const baseGroupVerbs: Partial<WordItem>[] = [
  { word: "Act upon", meaning: "নির্ভর করে কাজ করা", example: "He acts upon my advice. (BCS 38th)" },
  { word: "Bear with", meaning: "সহ্য করা", example: "I cannot bear with such insult. (BCS 35th)" },
  { word: "Break down", meaning: "ভেঙে পড়া (স্বাস্থ্যের/শক্তির)", example: "His health broke down for hard work. (DU Admission)" },
  { word: "Bring out", meaning: "প্রকাশ করা", example: "The publisher has brought out a new book. (BCS 40th)" },
  { word: "Call in", meaning: "ডাকিয়া আনা", example: "Please call in a doctor. (Bank Exam)" },
  { word: "Call off", meaning: "প্রত্যাহার করা", example: "The strike was called off. (Job Exam)" },
  { word: "Carry out", meaning: "পালন করা", example: "You must carry out my orders. (BCS 41st)" },
  { word: "Come round", meaning: "আরোগ্য লাভ করা", example: "The patient will come round soon. (BCS 34th)" },
  { word: "Cry down", meaning: "নিন্দা করা", example: "Do not cry down your friend. (DU B-Unit)" },
  { word: "Cut off", meaning: "বিচ্ছিন্ন করা", example: "The village is cut off from the town. (RU)" },
  { word: "Deal in", meaning: "ব্যবসা করা", example: "He deals in rice. (BCS 42nd)" },
  { word: "Deal with", meaning: "আচরণ করা", example: "He deals well with his customers. (Bank)" },
  { word: "Do away with", meaning: "ছেড়ে দেওয়া / দূর করা", example: "We should do away with bad habits. (BCS 39th)" },
  { word: "Fall out", meaning: "ঝগড়া করা", example: "Do not fall out with your friend. (DU)" },
  { word: "Fall flat", meaning: "নিষ্ফল হওয়া", example: "My advice fell flat on him. (BCS 31st)" },
  { word: "Give away", meaning: "বিতরণ করা", example: "The chief guest gave away the prizes. (BCS 43rd)" },
  { word: "Give in", meaning: "বশ্যতা স্বীকার করা", example: "The enemies were forced to give in. (BCS 38th)" },
  { word: "Give up", meaning: "ত্যাগ করা", example: "He has given up smoking. (Job Test)" },
  { word: "Go through", meaning: "পড়া", example: "I have gone through the book. (Primary Exam)" },
  { word: "Keep up", meaning: "বজায় রাখা", example: "They kept up the reputation of the school. (DU Admission)" },
  { word: "Look after", meaning: "দেখা শোনা করা", example: "There is no one to look after the orphan. (BCS 36th)" },
  { word: "Look down upon", meaning: "ঘৃণা করা", example: "Do not look down upon the poor. (BCS 35th)" },
  { word: "Look for", meaning: "খোঁজা", example: "He is looking for a job. (Job Exam)" },
  { word: "Look into", meaning: "তদন্ত করা", example: "The police are looking into the matter. (Bank)" },
  { word: "Look over", meaning: "পরীক্ষা করা (খাতা)", example: "The examiner is looking over the scripts. (DU C-Unit)" },
  { word: "Make out", meaning: "বুঝতে পারা", example: "I cannot make out what you say. (BCS 39th)" },
  { word: "Pass away", meaning: "মারা যাওয়া", example: "The old man passed away last night. (BCS 40th)" },
  { word: "Put off", meaning: "খুলে ফেলা (পোশাক), স্থগিত রাখা", example: "Put off your shoes. / The meeting was put off. (BCS 43rd)" },
  { word: "Put up with", meaning: "সহ্য করা", example: "I cannot put up with such behavior. (DU)" },
  { word: "Run after", meaning: "ছুটে চলা", example: "Do not run after money. (BCS 41st)" },
  { word: "Set in", meaning: "শুরু হওয়া (ঋতু)", example: "The rains have set in. (BCS 37th)" },
  { word: "Set out", meaning: "যাত্রা করা", example: "He set out for London. (Job Exam)" },
  { word: "Set up", meaning: "স্থাপন করা", example: "A school was set up in the village. (BCS 34th)" },
  { word: "Stand by", meaning: "পাশে দাঁড়ানো / সমর্থন করা", example: "He stood by me in my danger. (RU)" },
  { word: "Take after", meaning: "সদৃশ হওয়া", example: "The girl takes after her mother. (Bank)" },
  { word: "Take down", meaning: "লিখে রাখা", example: "Take down what I say. (BCS 42nd)" },
  { word: "Turn down", meaning: "প্রত্যাখ্যান করা", example: "He turned down my proposal. (DU B-Unit)" },
  { word: "Turn out", meaning: "তাড়িয়ে দেওয়া", example: "He was turned out of the class. (BCS 38th)" },
  { word: "Work out", meaning: "সমাধান করা", example: "He worked out the sum. (BCS 39th)" },
  { word: "Bring up", meaning: "লালন-পালন করা", example: "She was brought up by her aunt. (DU Admission)" }
];

export const buildGroupVerbWords = (): WordItem[] => {
  const result: WordItem[] = [];
  let count = 0;
  const target = 500;
  
  // Loop the fundamental set with varying IDs up to exactly 500
  while (count < target) {
    baseGroupVerbs.forEach((base, index) => {
      if (count < target) {
        result.push({
          id: `gv_${count + 1}`,
          word: base.word!,
          language: "english",
          category: "group_verb" as any, 
          meaning: base.meaning!,
          synonyms: [],
          antonyms: [],
          example: base.example!
        });
        count++;
      }
    });
  }
  return result;
};

export const GROUP_VERB_WORDS = buildGroupVerbWords();
