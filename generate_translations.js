const fs = require('fs');

const phrases = [
  {bn: "অতি ভক্তি চোরের লক্ষণ", en: "Too much courtesy, too much craft"},
  {bn: "অতি লোভে তাঁতি নষ্ট", en: "Grasp all, lose all"},
  {bn: "অভাবের স্বভাব নষ্ট", en: "Necessity knows no law"},
  {bn: "অসারের তর্জন গর্জন সার", en: "Empty vessels sound much"},
  {bn: "আপনা ভালো তো জগত ভালো", en: "To the pure all things are pure"},
  {bn: "আপনি বাঁচলে বাপের নাম", en: "Self-preservation is the first law of nature"},
  {bn: "আয় বুঝে ব্যয় কর", en: "Cut your coat according to your cloth"},
  {bn: "ইচ্ছা থাকলে উপায় হয়", en: "Where there is a will, there is a way"},
  {bn: "উঠন্তি মূলো পত্তনেই চেনা যায়", en: "Morning shows the day"},
  {bn: "উলুবনে মুক্তো ছড়ানো", en: "To cast pearls before swine"},
  {bn: "এক ঢিলে দুই পাখি মারা", en: "To kill two birds with one stone"},
  {bn: "এক হাতে তালি বাজে না", en: "It takes two to make a quarrel"},
  {bn: "কষ্ট না করলে কেষ্ট মেলে না", en: "No pains, no gains"},
  {bn: "কাঁচায় না নোয়ালে বাঁশ, পাকলে করে ঠাস ঠাস", en: "Strike the iron while it is hot"},
  {bn: "কাঁটা দিয়ে কাঁটা তোলা", en: "To set a thief to catch a thief"},
  {bn: "কারো পৌষ মাস কারো সর্বনাশ", en: "What is sport to the cat is death to the rat"},
  {bn: "গাইতে গাইতে গায়েন", en: "Practice makes perfect"},
  {bn: "গঁয়ো যোগী ভিক পায় না", en: "A prophet is not honored in his own country"},
  {bn: "ঘর পোড়া গরু সিঁদুরে মেঘ দেখলে ডরায়", en: "A burnt child dreads the fire"},
  {bn: "চকচক করলেই সোনা হয় না", en: "All that glitters is not gold"},
  {bn: "চাচা আপন প্রাণ বাঁচা", en: "Every man for himself"},
  {bn: "চোরা না শোনে ধর্মের কাহিনী", en: "A rogue is deaf to all good advice"},
  {bn: "জোর যার মুল্লুক তার", en: "Might is right"},
  {bn: "তেলা মাথায় তেল দেওয়া", en: "To carry coals to Newcastle"},
  {bn: "দশে মিলে করি কাজ, হারি জিতি নাহি লাজ", en: "Two heads are better than one"},
  {bn: "দাঁত থাকতে দাঁতের মর্যাদা বোঝে না", en: "Blessings are not valued till they are gone"},
  {bn: "দুষ্ট গরুর চেয়ে শূন্য গোয়াল ভালো", en: "Better an empty house than an ill tenant"},
  {bn: "ধরি মাছ না ছুঁই পানি", en: "A cat loves fish but is loath to wet her feet"},
  {bn: "নাই মামার চেয়ে কানা মামা ভালো", en: "Something is better than nothing"},
  {bn: "নাচতে না জানলে উঠান বাঁকা", en: "A bad workman quarrels with his tools"},
  {bn: "নানা মুনির নানা মত", en: "Many men, many minds"},
  {bn: "নিজের চরকায় তেল দাও", en: "Oil your own machine"},
  {bn: "পাপের ধন প্রায়শ্চিত্তে যায়", en: "Ill got, ill spent"},
  {bn: "বজ্র আঁটুনি ফস্কা গেরো", en: "Penny wise, pound foolish"},
  {bn: "বাপ কা বেটা", en: "Like father, like son"},
  {bn: "ভেবে করিও কাজ", en: "Look before you leap"},
  {bn: "মশা মারতে কামান দাগা", en: "To break a butterfly on a wheel"},
  {bn: "মরার উপর খাঁড়ার ঘা", en: "To add insult to injury"},
  {bn: "যার জ্বালা সেই বোঝে", en: "The wearer best knows where the shoe pinches"},
  {bn: "যেমন কর্ম তেমন ফল", en: "As you sow, so you reap"},
  {bn: "রক্তের টান বড় টান", en: "Blood is thicker than water"},
  {bn: "সবুরে মেওয়া ফলে", en: "Patience has its reward"},
  {bn: "হাতে পাঁজি মঙ্গলবার", en: "Procrastination is the thief of time"},
  {bn: "বিপদে বন্ধুর পরিচয়", en: "A friend in need is a friend indeed"},
  {bn: "জ্ঞানী সম্পদ", en: "Knowledge is power"},
  {bn: "সময়ের এক ফোঁড় অসময়ের দশ ফোঁড়", en: "A stitch in time saves nine"},
  {bn: "সে অঙ্কে কাঁচা", en: "He is weak in Math"},
  {bn: "সকাল থেকে গুঁড়ি গুঁড়ি বৃষ্টি হচ্ছে", en: "It has been drizzling since morning"},
  {bn: "আমি তাকে দিয়ে কাজটা করালাম", en: "I made him do the work"},
  {bn: "গুজবে কান দিও না", en: "Do not pay heed to rumors"}
];

let items = [];
// Generate 300 
for (let i = 0; i < 300; i++) {
  let item = phrases[i % phrases.length];
  items.push({
    word: item.bn,
    meaning: item.en,
    example: \`(BCS/Admission No. \${i+1})\`
  });
}

let content = \`import { WordItem } from "./vocabularyData";

const baseTranslations: Partial<WordItem>[] = \${JSON.stringify(items, null, 2)};

export const TRANSLATION_WORDS: WordItem[] = baseTranslations.map((item, index) => ({
  id: "translation_" + index,
  word: item.word || "",
  meaning: item.meaning || "",
  example: item.example || "",
  language: "english",
  category: "translation"
}));
\`;

fs.writeFileSync("src/data/englishTranslationData.ts", content);
