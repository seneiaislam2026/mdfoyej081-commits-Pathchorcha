import { WordItem } from './vocabularyData';

const baseTranslations: Partial<WordItem>[] = [
  {
    "word": "অতি ভক্তি চোরের লক্ষণ",
    "meaning": "Too much courtesy, too much craft",
    "example": "(BCS/Admission No. 1)"
  },
  {
    "word": "অতি লোভে তাঁতি নষ্ট",
    "meaning": "Grasp all, lose all",
    "example": "(BCS/Admission No. 2)"
  },
  {
    "word": "অভাবের স্বভাব নষ্ট",
    "meaning": "Necessity knows no law",
    "example": "(BCS/Admission No. 3)"
  },
  {
    "word": "অসারের তর্জন গর্জন সার",
    "meaning": "Empty vessels sound much",
    "example": "(BCS/Admission No. 4)"
  },
  {
    "word": "আপনা ভালো তো জগত ভালো",
    "meaning": "To the pure all things are pure",
    "example": "(BCS/Admission No. 5)"
  },
  {
    "word": "আপনি বাঁচলে বাপের নাম",
    "meaning": "Self-preservation is the first law of nature",
    "example": "(BCS/Admission No. 6)"
  },
  {
    "word": "আয় বুঝে ব্যয় কর",
    "meaning": "Cut your coat according to your cloth",
    "example": "(BCS/Admission No. 7)"
  },
  {
    "word": "ইচ্ছা থাকলে উপায় হয়",
    "meaning": "Where there is a will, there is a way",
    "example": "(BCS/Admission No. 8)"
  },
  {
    "word": "উঠন্তি মূলো পত্তনেই চেনা যায়",
    "meaning": "Morning shows the day",
    "example": "(BCS/Admission No. 9)"
  },
  {
    "word": "উলুবনে মুক্তো ছড়ানো",
    "meaning": "To cast pearls before swine",
    "example": "(BCS/Admission No. 10)"
  },
  {
    "word": "এক ঢিলে দুই পাখি মারা",
    "meaning": "To kill two birds with one stone",
    "example": "(BCS/Admission No. 11)"
  },
  {
    "word": "এক হাতে তালি বাজে না",
    "meaning": "It takes two to make a quarrel",
    "example": "(BCS/Admission No. 12)"
  },
  {
    "word": "কষ্ট না করলে কেষ্ট মেলে না",
    "meaning": "No pains, no gains",
    "example": "(BCS/Admission No. 13)"
  },
  {
    "word": "কাঁচায় না নোয়ালে বাঁশ, পাকলে করে ঠাস ঠাস",
    "meaning": "Strike the iron while it is hot",
    "example": "(BCS/Admission No. 14)"
  },
  {
    "word": "কাঁটা দিয়ে কাঁটা তোলা",
    "meaning": "To set a thief to catch a thief",
    "example": "(BCS/Admission No. 15)"
  },
  {
    "word": "কারো পৌষ মাস কারো সর্বনাশ",
    "meaning": "What is sport to the cat is death to the rat",
    "example": "(BCS/Admission No. 16)"
  },
  {
    "word": "গাইতে গাইতে গায়েন",
    "meaning": "Practice makes perfect",
    "example": "(BCS/Admission No. 17)"
  },
  {
    "word": "গঁয়ো যোগী ভিক পায় না",
    "meaning": "A prophet is not honored in his own country",
    "example": "(BCS/Admission No. 18)"
  },
  {
    "word": "ঘর পোড়া গরু সিঁদুরে মেঘ দেখলে ডরায়",
    "meaning": "A burnt child dreads the fire",
    "example": "(BCS/Admission No. 19)"
  },
  {
    "word": "চকচক করলেই সোনা হয় সম্পাদক",
    "meaning": "All that glitters is not gold",
    "example": "(BCS/Admission No. 20)"
  },
  {
    "word": "চাচা আপন প্রাণ বাঁচা",
    "meaning": "Every man for himself",
    "example": "(BCS/Admission No. 21)"
  },
  {
    "word": "চোরা না শোনে ধর্মের কাহিনী",
    "meaning": "A rogue is deaf to all good advice",
    "example": "(BCS/Admission No. 22)"
  },
  {
    "word": "জোর যার মুল্লুক তার",
    "meaning": "Might is right",
    "example": "(BCS/Admission No. 23)"
  },
  {
    "word": "তেলা মাথায় তেল দেওয়া",
    "meaning": "To carry coals to Newcastle",
    "example": "(BCS/Admission No. 24)"
  },
  {
    "word": "দশে মিলে করি কাজ, হারি জিতি নাহি লাজ",
    "meaning": "Two heads are better than one",
    "example": "(BCS/Admission No. 25)"
  },
  {
    "word": "দাঁত থাকতে দাঁতের মর্যাদা বোঝে না",
    "meaning": "Blessings are not valued till they are gone",
    "example": "(BCS/Admission No. 26)"
  },
  {
    "word": "দুষ্ট গরুর চেয়ে শূন্য গোয়াল ভালো",
    "meaning": "Better an empty house than an ill tenant",
    "example": "(BCS/Admission No. 27)"
  },
  {
    "word": "ধরি মাছ না ছুঁই পানি",
    "meaning": "A cat loves fish but is loath to wet her feet",
    "example": "(BCS/Admission No. 28)"
  },
  {
    "word": "নাই মামার চেয়ে কানা মামা ভালো",
    "meaning": "Something is better than nothing",
    "example": "(BCS/Admission No. 29)"
  },
  {
    "word": "নাচতে না জানলে উঠান বাঁকা",
    "meaning": "A bad workman quarrels with his tools",
    "example": "(BCS/Admission No. 30)"
  },
  {
    "word": "নানা মুনির নানা মত",
    "meaning": "Many men, many minds",
    "example": "(BCS/Admission No. 31)"
  },
  {
    "word": "নিজের চরকায় তেল দাও",
    "meaning": "Oil your own machine",
    "example": "(BCS/Admission No. 32)"
  },
  {
    "word": "পাপের ধন প্রায়শ্চিত্তে যায়",
    "meaning": "Ill got, ill spent",
    "example": "(BCS/Admission No. 33)"
  },
  {
    "word": "বজ্র আঁটুনি ফস্কা গেরো",
    "meaning": "Penny wise, pound foolish",
    "example": "(BCS/Admission No. 34)"
  },
  {
    "word": "বাপ কা বেটা",
    "meaning": "Like father, like son",
    "example": "(BCS/Admission No. 35)"
  },
  {
    "word": "ভেবে করিও কাজ",
    "meaning": "Look before you leap",
    "example": "(BCS/Admission No. 36)"
  },
  {
    "word": "মশা মারতে কামান দাগা",
    "meaning": "To break a butterfly on a wheel",
    "example": "(BCS/Admission No. 37)"
  },
  {
    "word": "মরার উপর খাঁড়ার ঘা",
    "meaning": "To add insult to injury",
    "example": "(BCS/Admission No. 38)"
  },
  {
    "word": "যার জ্বালা সেই বোঝে",
    "meaning": "The wearer best knows where the shoe pinches",
    "example": "(BCS/Admission No. 39)"
  },
  {
    "word": "যেমন কর্ম তেমন ফল",
    "meaning": "As you sow, so you reap",
    "example": "(BCS/Admission No. 40)"
  },
  {
    "word": "রক্তের টান বড় টান",
    "meaning": "Blood is thicker than water",
    "example": "(BCS/Admission No. 41)"
  },
  {
    "word": "সবুরে মেওয়া ফলে",
    "meaning": "Patience has its reward",
    "example": "(BCS/Admission No. 42)"
  },
  {
    "word": "হাতে পাঁজি মঙ্গলবার",
    "meaning": "Procrastination is the thief of time",
    "example": "(BCS/Admission No. 43)"
  },
  {
    "word": "বিপদে বন্ধুর পরিচয়",
    "meaning": "A friend in need is a friend indeed",
    "example": "(BCS/Admission No. 44)"
  },
  {
    "word": "জ্ঞানী সম্পদ",
    "meaning": "Knowledge is power",
    "example": "(BCS/Admission No. 45)"
  },
  {
    "word": "সময়ের এক ফোঁড় অসময়ের দশ ফোঁড়",
    "meaning": "A stitch in time saves nine",
    "example": "(BCS/Admission No. 46)"
  },
  {
    "word": "সে অঙ্কে কাঁচা",
    "meaning": "He is weak in Math",
    "example": "(BCS/Admission No. 47)"
  },
  {
    "word": "সকাল থেকে গুঁড়ি গুঁড়ি বৃষ্টি হচ্ছে",
    "meaning": "It has been drizzling since morning",
    "example": "(BCS/Admission No. 48)"
  },
  {
    "word": "আমি তাকে দিয়ে কাজটা করালাম",
    "meaning": "I made him do the work",
    "example": "(BCS/Admission No. 49)"
  },
  {
    "word": "গুজবে কান দিও না",
    "meaning": "Do not pay heed to rumors",
    "example": "(BCS/Admission No. 50)"
  },
  {
    "word": "অতি ভক্তি চোরের লক্ষণ",
    "meaning": "Too much courtesy, too much craft",
    "example": "(BCS/Admission No. 51)"
  },
  {
    "word": "অতি লোভে তাঁতি নষ্ট",
    "meaning": "Grasp all, lose all",
    "example": "(BCS/Admission No. 52)"
  },
  {
    "word": "অভাবের স্বভাব নষ্ট",
    "meaning": "Necessity knows no law",
    "example": "(BCS/Admission No. 53)"
  },
  {
    "word": "অসারের তর্জন গর্জন সার",
    "meaning": "Empty vessels sound much",
    "example": "(BCS/Admission No. 54)"
  },
  {
    "word": "আপনা ভালো তো জগত ভালো",
    "meaning": "To the pure all things are pure",
    "example": "(BCS/Admission No. 55)"
  },
  {
    "word": "আপনি বাঁচলে বাপের নাম",
    "meaning": "Self-preservation is the first law of nature",
    "example": "(BCS/Admission No. 56)"
  },
  {
    "word": "আয় বুঝে ব্যয় কর",
    "meaning": "Cut your coat according to your cloth",
    "example": "(BCS/Admission No. 57)"
  },
  {
    "word": "ইচ্ছা থাকলে উপায় হয়",
    "meaning": "Where there is a will, there is a way",
    "example": "(BCS/Admission No. 58)"
  },
  {
    "word": "উঠন্তি মূলো পত্তনেই চেনা যায়",
    "meaning": "Morning shows the day",
    "example": "(BCS/Admission No. 59)"
  },
  {
    "word": "উলুবনে মুক্তো ছড়ানো",
    "meaning": "To cast pearls before swine",
    "example": "(BCS/Admission No. 60)"
  },
  {
    "word": "এক ঢিলে দুই পাখি মারা",
    "meaning": "To kill two birds with one stone",
    "example": "(BCS/Admission No. 61)"
  },
  {
    "word": "এক হাতে তালি বাজে না",
    "meaning": "It takes two to make a quarrel",
    "example": "(BCS/Admission No. 62)"
  },
  {
    "word": "কষ্ট না করলে কেষ্ট মেলে না",
    "meaning": "No pains, no gains",
    "example": "(BCS/Admission No. 63)"
  },
  {
    "word": "কাঁচায় না নোয়ালে বাঁশ, পাকলে করে ঠাস ঠাস",
    "meaning": "Strike the iron while it is hot",
    "example": "(BCS/Admission No. 64)"
  },
  {
    "word": "কাঁটা দিয়ে কাঁটা তোলা",
    "meaning": "To set a thief to catch a thief",
    "example": "(BCS/Admission No. 65)"
  },
  {
    "word": "কারো পৌষ মাস কারো সর্বনাশ",
    "meaning": "What is sport to the cat is death to the rat",
    "example": "(BCS/Admission No. 66)"
  },
  {
    "word": "গাইতে গাইতে গায়েন",
    "meaning": "Practice makes perfect",
    "example": "(BCS/Admission No. 67)"
  },
  {
    "word": "গঁয়ো যোগী ভিক পায় না",
    "meaning": "A prophet is not honored in his own country",
    "example": "(BCS/Admission No. 68)"
  },
  {
    "word": "ঘর পোড়া গরু সিঁদুরে মেঘ দেখলে ডরায়",
    "meaning": "A burnt child dreads the fire",
    "example": "(BCS/Admission No. 69)"
  },
  {
    "word": "চকচক করলেই সোনা হয় সম্পাদক",
    "meaning": "All that glitters is not gold",
    "example": "(BCS/Admission No. 70)"
  },
  {
    "word": "চাচা আপন প্রাণ বাঁচা",
    "meaning": "Every man for himself",
    "example": "(BCS/Admission No. 71)"
  },
  {
    "word": "চোরা না শোনে ধর্মের কাহিনী",
    "meaning": "A rogue is deaf to all good advice",
    "example": "(BCS/Admission No. 72)"
  },
  {
    "word": "জোর যার মুল্লুক তার",
    "meaning": "Might is right",
    "example": "(BCS/Admission No. 73)"
  },
  {
    "word": "তেলা মাথায় তেল দেওয়া",
    "meaning": "To carry coals to Newcastle",
    "example": "(BCS/Admission No. 74)"
  },
  {
    "word": "দশে মিলে করি কাজ, হারি জিতি নাহি লাজ",
    "meaning": "Two heads are better than one",
    "example": "(BCS/Admission No. 75)"
  },
  {
    "word": "দাঁত থাকতে দাঁতের মর্যাদা বোঝে না",
    "meaning": "Blessings are not valued till they are gone",
    "example": "(BCS/Admission No. 76)"
  },
  {
    "word": "দুষ্ট গরুর চেয়ে শূন্য গোয়াল ভালো",
    "meaning": "Better an empty house than an ill tenant",
    "example": "(BCS/Admission No. 77)"
  },
  {
    "word": "ধরি মাছ না ছুঁই পানি",
    "meaning": "A cat loves fish but is loath to wet her feet",
    "example": "(BCS/Admission No. 78)"
  },
  {
    "word": "নাই মামার চেয়ে কানা মামা ভালো",
    "meaning": "Something is better than nothing",
    "example": "(BCS/Admission No. 79)"
  },
  {
    "word": "নাচতে না জানলে উঠান বাঁকা",
    "meaning": "A bad workman quarrels with his tools",
    "example": "(BCS/Admission No. 80)"
  },
  {
    "word": "নানা মুনির নানা মত",
    "meaning": "Many men, many minds",
    "example": "(BCS/Admission No. 81)"
  },
  {
    "word": "নিজের চরকায় তেল দাও",
    "meaning": "Oil your own machine",
    "example": "(BCS/Admission No. 82)"
  },
  {
    "word": "পাপের ধন প্রায়শ্চিত্তে যায়",
    "meaning": "Ill got, ill spent",
    "example": "(BCS/Admission No. 83)"
  },
  {
    "word": "বজ্র আঁটুনি ফস্কা গেরো",
    "meaning": "Penny wise, pound foolish",
    "example": "(BCS/Admission No. 84)"
  },
  {
    "word": "বাপ কা বেটা",
    "meaning": "Like father, like son",
    "example": "(BCS/Admission No. 85)"
  },
  {
    "word": "ভেবে করিও কাজ",
    "meaning": "Look before you leap",
    "example": "(BCS/Admission No. 86)"
  },
  {
    "word": "মশা মারতে কামান দাগা",
    "meaning": "To break a butterfly on a wheel",
    "example": "(BCS/Admission No. 87)"
  },
  {
    "word": "মরার উপর খাঁড়ার ঘা",
    "meaning": "To add insult to injury",
    "example": "(BCS/Admission No. 88)"
  },
  {
    "word": "যার জ্বালা সেই বোঝে",
    "meaning": "The wearer best knows where the shoe pinches",
    "example": "(BCS/Admission No. 89)"
  },
  {
    "word": "যেমন কর্ম তেমন ফল",
    "meaning": "As you sow, so you reap",
    "example": "(BCS/Admission No. 90)"
  },
  {
    "word": "রক্তের টান বড় টান",
    "meaning": "Blood is thicker than water",
    "example": "(BCS/Admission No. 91)"
  },
  {
    "word": "সবুরে মেওয়া ফলে",
    "meaning": "Patience has its reward",
    "example": "(BCS/Admission No. 92)"
  },
  {
    "word": "হাতে পাঁজি মঙ্গলবার",
    "meaning": "Procrastination is the thief of time",
    "example": "(BCS/Admission No. 93)"
  },
  {
    "word": "বিপদে বন্ধুর পরিচয়",
    "meaning": "A friend in need is a friend indeed",
    "example": "(BCS/Admission No. 94)"
  },
  {
    "word": "জ্ঞানী সম্পদ",
    "meaning": "Knowledge is power",
    "example": "(BCS/Admission No. 95)"
  },
  {
    "word": "সময়ের এক ফোঁড় অসময়ের দশ ফোঁড়",
    "meaning": "A stitch in time saves nine",
    "example": "(BCS/Admission No. 96)"
  },
  {
    "word": "সে অঙ্কে কাঁচা",
    "meaning": "He is weak in Math",
    "example": "(BCS/Admission No. 97)"
  },
  {
    "word": "সকাল থেকে গুঁড়ি গুঁড়ি বৃষ্টি হচ্ছে",
    "meaning": "It has been drizzling since morning",
    "example": "(BCS/Admission No. 98)"
  },
  {
    "word": "আমি তাকে দিয়ে কাজটা করালাম",
    "meaning": "I made him do the work",
    "example": "(BCS/Admission No. 99)"
  },
  {
    "word": "গুজবে কান দিও না",
    "meaning": "Do not pay heed to rumors",
    "example": "(BCS/Admission No. 100)"
  },
  {
    "word": "অতি ভক্তি চোরের লক্ষণ",
    "meaning": "Too much courtesy, too much craft",
    "example": "(BCS/Admission No. 101)"
  },
  {
    "word": "অতি লোভে তাঁতি নষ্ট",
    "meaning": "Grasp all, lose all",
    "example": "(BCS/Admission No. 102)"
  },
  {
    "word": "অভাবের স্বভাব নষ্ট",
    "meaning": "Necessity knows no law",
    "example": "(BCS/Admission No. 103)"
  },
  {
    "word": "অসারের তর্জন গর্জন সার",
    "meaning": "Empty vessels sound much",
    "example": "(BCS/Admission No. 104)"
  },
  {
    "word": "আপনা ভালো তো জগত ভালো",
    "meaning": "To the pure all things are pure",
    "example": "(BCS/Admission No. 105)"
  },
  {
    "word": "আপনি বাঁচলে বাপের নাম",
    "meaning": "Self-preservation is the first law of nature",
    "example": "(BCS/Admission No. 106)"
  },
  {
    "word": "আয় বুঝে ব্যয় কর",
    "meaning": "Cut your coat according to your cloth",
    "example": "(BCS/Admission No. 107)"
  },
  {
    "word": "ইচ্ছা থাকলে উপায় হয়",
    "meaning": "Where there is a will, there is a way",
    "example": "(BCS/Admission No. 108)"
  },
  {
    "word": "উঠন্তি মূলো পত্তনেই চেনা যায়",
    "meaning": "Morning shows the day",
    "example": "(BCS/Admission No. 109)"
  },
  {
    "word": "উলুবনে মুক্তো ছড়ানো",
    "meaning": "To cast pearls before swine",
    "example": "(BCS/Admission No. 110)"
  },
  {
    "word": "এক ঢিলে দুই পাখি মারা",
    "meaning": "To kill two birds with one stone",
    "example": "(BCS/Admission No. 111)"
  },
  {
    "word": "এক হাতে তালি বাজে না",
    "meaning": "It takes two to make a quarrel",
    "example": "(BCS/Admission No. 112)"
  },
  {
    "word": "কষ্ট না করলে কেষ্ট মেলে না",
    "meaning": "No pains, no gains",
    "example": "(BCS/Admission No. 113)"
  },
  {
    "word": "কাঁচায় না নোয়ালে বাঁশ, পাকলে করে ঠাস ঠাস",
    "meaning": "Strike the iron while it is hot",
    "example": "(BCS/Admission No. 114)"
  },
  {
    "word": "কাঁটা দিয়ে কাঁটা তোলা",
    "meaning": "To set a thief to catch a thief",
    "example": "(BCS/Admission No. 115)"
  },
  {
    "word": "কারো পৌষ মাস কারো সর্বনাশ",
    "meaning": "What is sport to the cat is death to the rat",
    "example": "(BCS/Admission No. 116)"
  },
  {
    "word": "গাইতে গাইতে গায়েন",
    "meaning": "Practice makes perfect",
    "example": "(BCS/Admission No. 117)"
  },
  {
    "word": "গঁয়ো যোগী ভিক পায় না",
    "meaning": "A prophet is not honored in his own country",
    "example": "(BCS/Admission No. 118)"
  },
  {
    "word": "ঘর পোড়া গরু সিঁদুরে মেঘ দেখলে ডরায়",
    "meaning": "A burnt child dreads the fire",
    "example": "(BCS/Admission No. 119)"
  },
  {
    "word": "চকচক করলেই সোনা হয় সম্পাদক",
    "meaning": "All that glitters is not gold",
    "example": "(BCS/Admission No. 120)"
  },
  {
    "word": "চাচা আপন প্রাণ বাঁচা",
    "meaning": "Every man for himself",
    "example": "(BCS/Admission No. 121)"
  },
  {
    "word": "চোরা না শোনে ধর্মের কাহিনী",
    "meaning": "A rogue is deaf to all good advice",
    "example": "(BCS/Admission No. 122)"
  },
  {
    "word": "জোর যার মুল্লুক তার",
    "meaning": "Might is right",
    "example": "(BCS/Admission No. 123)"
  },
  {
    "word": "তেলা মাথায় তেল দেওয়া",
    "meaning": "To carry coals to Newcastle",
    "example": "(BCS/Admission No. 124)"
  },
  {
    "word": "দশে মিলে করি কাজ, হারি জিতি নাহি লাজ",
    "meaning": "Two heads are better than one",
    "example": "(BCS/Admission No. 125)"
  },
  {
    "word": "দাঁত থাকতে দাঁতের মর্যাদা বোঝে না",
    "meaning": "Blessings are not valued till they are gone",
    "example": "(BCS/Admission No. 126)"
  },
  {
    "word": "দুষ্ট গরুর চেয়ে শূন্য গোয়াল ভালো",
    "meaning": "Better an empty house than an ill tenant",
    "example": "(BCS/Admission No. 127)"
  },
  {
    "word": "ধরি মাছ না ছুঁই পানি",
    "meaning": "A cat loves fish but is loath to wet her feet",
    "example": "(BCS/Admission No. 128)"
  },
  {
    "word": "নাই মামার চেয়ে কানা মামা ভালো",
    "meaning": "Something is better than nothing",
    "example": "(BCS/Admission No. 129)"
  },
  {
    "word": "নাচতে না জানলে উঠান বাঁকা",
    "meaning": "A bad workman quarrels with his tools",
    "example": "(BCS/Admission No. 130)"
  },
  {
    "word": "নানা মুনির নানা মত",
    "meaning": "Many men, many minds",
    "example": "(BCS/Admission No. 131)"
  },
  {
    "word": "নিজের চরকায় তেল দাও",
    "meaning": "Oil your own machine",
    "example": "(BCS/Admission No. 132)"
  },
  {
    "word": "পাপের ধন প্রায়শ্চিত্তে যায়",
    "meaning": "Ill got, ill spent",
    "example": "(BCS/Admission No. 133)"
  },
  {
    "word": "বজ্র আঁটুনি ফস্কা গেরো",
    "meaning": "Penny wise, pound foolish",
    "example": "(BCS/Admission No. 134)"
  },
  {
    "word": "বাপ কা বেটা",
    "meaning": "Like father, like son",
    "example": "(BCS/Admission No. 135)"
  },
  {
    "word": "ভেবে করিও কাজ",
    "meaning": "Look before you leap",
    "example": "(BCS/Admission No. 136)"
  },
  {
    "word": "মশা মারতে কামান দাগা",
    "meaning": "To break a butterfly on a wheel",
    "example": "(BCS/Admission No. 137)"
  },
  {
    "word": "মরার উপর খাঁড়ার ঘা",
    "meaning": "To add insult to injury",
    "example": "(BCS/Admission No. 138)"
  },
  {
    "word": "যার জ্বালা সেই বোঝে",
    "meaning": "The wearer best knows where the shoe pinches",
    "example": "(BCS/Admission No. 139)"
  },
  {
    "word": "যেমন কর্ম তেমন ফল",
    "meaning": "As you sow, so you reap",
    "example": "(BCS/Admission No. 140)"
  },
  {
    "word": "রক্তের টান বড় টান",
    "meaning": "Blood is thicker than water",
    "example": "(BCS/Admission No. 141)"
  },
  {
    "word": "সবুরে মেওয়া ফলে",
    "meaning": "Patience has its reward",
    "example": "(BCS/Admission No. 142)"
  },
  {
    "word": "হাতে পাঁজি মঙ্গলবার",
    "meaning": "Procrastination is the thief of time",
    "example": "(BCS/Admission No. 143)"
  },
  {
    "word": "বিপদে বন্ধুর পরিচয়",
    "meaning": "A friend in need is a friend indeed",
    "example": "(BCS/Admission No. 144)"
  },
  {
    "word": "জ্ঞানী সম্পদ",
    "meaning": "Knowledge is power",
    "example": "(BCS/Admission No. 145)"
  },
  {
    "word": "সময়ের এক ফোঁড় অসময়ের দশ ফোঁড়",
    "meaning": "A stitch in time saves nine",
    "example": "(BCS/Admission No. 146)"
  },
  {
    "word": "সে অঙ্কে কাঁচা",
    "meaning": "He is weak in Math",
    "example": "(BCS/Admission No. 147)"
  },
  {
    "word": "সকাল থেকে গুঁড়ি গুঁড়ি বৃষ্টি হচ্ছে",
    "meaning": "It has been drizzling since morning",
    "example": "(BCS/Admission No. 148)"
  },
  {
    "word": "আমি তাকে দিয়ে কাজটা করালাম",
    "meaning": "I made him do the work",
    "example": "(BCS/Admission No. 149)"
  },
  {
    "word": "গুজবে কান দিও না",
    "meaning": "Do not pay heed to rumors",
    "example": "(BCS/Admission No. 150)"
  },
  {
    "word": "অতি ভক্তি চোরের লক্ষণ",
    "meaning": "Too much courtesy, too much craft",
    "example": "(BCS/Admission No. 151)"
  },
  {
    "word": "অতি লোভে তাঁতি নষ্ট",
    "meaning": "Grasp all, lose all",
    "example": "(BCS/Admission No. 152)"
  },
  {
    "word": "অভাবের স্বভাব নষ্ট",
    "meaning": "Necessity knows no law",
    "example": "(BCS/Admission No. 153)"
  },
  {
    "word": "অসারের তর্জন গর্জন সার",
    "meaning": "Empty vessels sound much",
    "example": "(BCS/Admission No. 154)"
  },
  {
    "word": "আপনা ভালো তো জগত ভালো",
    "meaning": "To the pure all things are pure",
    "example": "(BCS/Admission No. 155)"
  },
  {
    "word": "আপনি বাঁচলে বাপের নাম",
    "meaning": "Self-preservation is the first law of nature",
    "example": "(BCS/Admission No. 156)"
  },
  {
    "word": "আয় বুঝে ব্যয় কর",
    "meaning": "Cut your coat according to your cloth",
    "example": "(BCS/Admission No. 157)"
  },
  {
    "word": "ইচ্ছা থাকলে উপায় হয়",
    "meaning": "Where there is a will, there is a way",
    "example": "(BCS/Admission No. 158)"
  },
  {
    "word": "উঠন্তি মূলো পত্তনেই চেনা যায়",
    "meaning": "Morning shows the day",
    "example": "(BCS/Admission No. 159)"
  },
  {
    "word": "উলুবনে মুক্তো ছড়ানো",
    "meaning": "To cast pearls before swine",
    "example": "(BCS/Admission No. 160)"
  },
  {
    "word": "এক ঢিলে দুই পাখি মারা",
    "meaning": "To kill two birds with one stone",
    "example": "(BCS/Admission No. 161)"
  },
  {
    "word": "এক হাতে তালি বাজে না",
    "meaning": "It takes two to make a quarrel",
    "example": "(BCS/Admission No. 162)"
  },
  {
    "word": "কষ্ট না করলে কেষ্ট মেলে না",
    "meaning": "No pains, no gains",
    "example": "(BCS/Admission No. 163)"
  },
  {
    "word": "কাঁচায় না নোয়ালে বাঁশ, পাকলে করে ঠাস ঠাস",
    "meaning": "Strike the iron while it is hot",
    "example": "(BCS/Admission No. 164)"
  },
  {
    "word": "কাঁটা দিয়ে কাঁটা তোলা",
    "meaning": "To set a thief to catch a thief",
    "example": "(BCS/Admission No. 165)"
  },
  {
    "word": "কারো পৌষ মাস কারো সর্বনাশ",
    "meaning": "What is sport to the cat is death to the rat",
    "example": "(BCS/Admission No. 166)"
  },
  {
    "word": "গাইতে গাইতে গায়েন",
    "meaning": "Practice makes perfect",
    "example": "(BCS/Admission No. 167)"
  },
  {
    "word": "গঁয়ো যোগী ভিক পায় না",
    "meaning": "A prophet is not honored in his own country",
    "example": "(BCS/Admission No. 168)"
  },
  {
    "word": "ঘর পোড়া গরু সিঁদুরে মেঘ দেখলে ডরায়",
    "meaning": "A burnt child dreads the fire",
    "example": "(BCS/Admission No. 169)"
  },
  {
    "word": "চকচক করলেই সোনা হয় সম্পাদক",
    "meaning": "All that glitters is not gold",
    "example": "(BCS/Admission No. 170)"
  },
  {
    "word": "চাচা আপন প্রাণ বাঁচা",
    "meaning": "Every man for himself",
    "example": "(BCS/Admission No. 171)"
  },
  {
    "word": "চোরা না শোনে ধর্মের কাহিনী",
    "meaning": "A rogue is deaf to all good advice",
    "example": "(BCS/Admission No. 172)"
  },
  {
    "word": "জোর যার মুল্লুক তার",
    "meaning": "Might is right",
    "example": "(BCS/Admission No. 173)"
  },
  {
    "word": "তেলা মাথায় তেল দেওয়া",
    "meaning": "To carry coals to Newcastle",
    "example": "(BCS/Admission No. 174)"
  },
  {
    "word": "দশে মিলে করি কাজ, হারি জিতি নাহি লাজ",
    "meaning": "Two heads are better than one",
    "example": "(BCS/Admission No. 175)"
  },
  {
    "word": "দাঁত থাকতে দাঁতের মর্যাদা বোঝে না",
    "meaning": "Blessings are not valued till they are gone",
    "example": "(BCS/Admission No. 176)"
  },
  {
    "word": "দুষ্ট গরুর চেয়ে শূন্য গোয়াল ভালো",
    "meaning": "Better an empty house than an ill tenant",
    "example": "(BCS/Admission No. 177)"
  },
  {
    "word": "ধরি মাছ না ছুঁই পানি",
    "meaning": "A cat loves fish but is loath to wet her feet",
    "example": "(BCS/Admission No. 178)"
  },
  {
    "word": "নাই মামার চেয়ে কানা মামা ভালো",
    "meaning": "Something is better than nothing",
    "example": "(BCS/Admission No. 179)"
  },
  {
    "word": "নাচতে না জানলে উঠান বাঁকা",
    "meaning": "A bad workman quarrels with his tools",
    "example": "(BCS/Admission No. 180)"
  },
  {
    "word": "নানা মুনির নানা মত",
    "meaning": "Many men, many minds",
    "example": "(BCS/Admission No. 181)"
  },
  {
    "word": "নিজের চরকায় তেল দাও",
    "meaning": "Oil your own machine",
    "example": "(BCS/Admission No. 182)"
  },
  {
    "word": "পাপের ধন প্রায়শ্চিত্তে যায়",
    "meaning": "Ill got, ill spent",
    "example": "(BCS/Admission No. 183)"
  },
  {
    "word": "বজ্র আঁটুনি ফস্কা গেরো",
    "meaning": "Penny wise, pound foolish",
    "example": "(BCS/Admission No. 184)"
  },
  {
    "word": "বাপ কা বেটা",
    "meaning": "Like father, like son",
    "example": "(BCS/Admission No. 185)"
  },
  {
    "word": "ভেবে করিও কাজ",
    "meaning": "Look before you leap",
    "example": "(BCS/Admission No. 186)"
  },
  {
    "word": "মশা মারতে কামান দাগা",
    "meaning": "To break a butterfly on a wheel",
    "example": "(BCS/Admission No. 187)"
  },
  {
    "word": "মরার উপর খাঁড়ার ঘা",
    "meaning": "To add insult to injury",
    "example": "(BCS/Admission No. 188)"
  },
  {
    "word": "যার জ্বালা সেই বোঝে",
    "meaning": "The wearer best knows where the shoe pinches",
    "example": "(BCS/Admission No. 189)"
  },
  {
    "word": "যেমন কর্ম তেমন ফল",
    "meaning": "As you sow, so you reap",
    "example": "(BCS/Admission No. 190)"
  },
  {
    "word": "রক্তের টান বড় টান",
    "meaning": "Blood is thicker than water",
    "example": "(BCS/Admission No. 191)"
  },
  {
    "word": "সবুরে মেওয়া ফলে",
    "meaning": "Patience has its reward",
    "example": "(BCS/Admission No. 192)"
  },
  {
    "word": "হাতে পাঁজি মঙ্গলবার",
    "meaning": "Procrastination is the thief of time",
    "example": "(BCS/Admission No. 193)"
  },
  {
    "word": "বিপদে বন্ধুর পরিচয়",
    "meaning": "A friend in need is a friend indeed",
    "example": "(BCS/Admission No. 194)"
  },
  {
    "word": "জ্ঞানী সম্পদ",
    "meaning": "Knowledge is power",
    "example": "(BCS/Admission No. 195)"
  },
  {
    "word": "সময়ের এক ফোঁড় অসময়ের দশ ফোঁড়",
    "meaning": "A stitch in time saves nine",
    "example": "(BCS/Admission No. 196)"
  },
  {
    "word": "সে অঙ্কে কাঁচা",
    "meaning": "He is weak in Math",
    "example": "(BCS/Admission No. 197)"
  },
  {
    "word": "সকাল থেকে গুঁড়ি গুঁড়ি বৃষ্টি হচ্ছে",
    "meaning": "It has been drizzling since morning",
    "example": "(BCS/Admission No. 198)"
  },
  {
    "word": "আমি তাকে দিয়ে কাজটা করালাম",
    "meaning": "I made him do the work",
    "example": "(BCS/Admission No. 199)"
  },
  {
    "word": "গুজবে কান দিও না",
    "meaning": "Do not pay heed to rumors",
    "example": "(BCS/Admission No. 200)"
  },
  {
    "word": "অতি ভক্তি চোরের লক্ষণ",
    "meaning": "Too much courtesy, too much craft",
    "example": "(BCS/Admission No. 201)"
  },
  {
    "word": "অতি লোভে তাঁতি নষ্ট",
    "meaning": "Grasp all, lose all",
    "example": "(BCS/Admission No. 202)"
  },
  {
    "word": "অভাবের স্বভাব নষ্ট",
    "meaning": "Necessity knows no law",
    "example": "(BCS/Admission No. 203)"
  },
  {
    "word": "অসারের তর্জন গর্জন সার",
    "meaning": "Empty vessels sound much",
    "example": "(BCS/Admission No. 204)"
  },
  {
    "word": "আপনা ভালো তো জগত ভালো",
    "meaning": "To the pure all things are pure",
    "example": "(BCS/Admission No. 205)"
  },
  {
    "word": "আপনি বাঁচলে বাপের নাম",
    "meaning": "Self-preservation is the first law of nature",
    "example": "(BCS/Admission No. 206)"
  },
  {
    "word": "আয় বুঝে ব্যয় কর",
    "meaning": "Cut your coat according to your cloth",
    "example": "(BCS/Admission No. 207)"
  },
  {
    "word": "ইচ্ছা থাকলে উপায় হয়",
    "meaning": "Where there is a will, there is a way",
    "example": "(BCS/Admission No. 208)"
  },
  {
    "word": "উঠন্তি মূলো পত্তনেই চেনা যায়",
    "meaning": "Morning shows the day",
    "example": "(BCS/Admission No. 209)"
  },
  {
    "word": "উলুবনে মুক্তো ছড়ানো",
    "meaning": "To cast pearls before swine",
    "example": "(BCS/Admission No. 210)"
  },
  {
    "word": "এক ঢিলে দুই পাখি মারা",
    "meaning": "To kill two birds with one stone",
    "example": "(BCS/Admission No. 211)"
  },
  {
    "word": "এক হাতে তালি বাজে না",
    "meaning": "It takes two to make a quarrel",
    "example": "(BCS/Admission No. 212)"
  },
  {
    "word": "কষ্ট না করলে কেষ্ট মেলে না",
    "meaning": "No pains, no gains",
    "example": "(BCS/Admission No. 213)"
  },
  {
    "word": "কাঁচায় না নোয়ালে বাঁশ, পাকলে করে ঠাস ঠাস",
    "meaning": "Strike the iron while it is hot",
    "example": "(BCS/Admission No. 214)"
  },
  {
    "word": "কাঁটা দিয়ে কাঁটা তোলা",
    "meaning": "To set a thief to catch a thief",
    "example": "(BCS/Admission No. 215)"
  },
  {
    "word": "কারো পৌষ মাস কারো সর্বনাশ",
    "meaning": "What is sport to the cat is death to the rat",
    "example": "(BCS/Admission No. 216)"
  },
  {
    "word": "গাইতে গাইতে গায়েন",
    "meaning": "Practice makes perfect",
    "example": "(BCS/Admission No. 217)"
  },
  {
    "word": "গঁয়ো যোগী ভিক পায় না",
    "meaning": "A prophet is not honored in his own country",
    "example": "(BCS/Admission No. 218)"
  },
  {
    "word": "ঘর পোড়া গরু সিঁদুরে মেঘ দেখলে ডরায়",
    "meaning": "A burnt child dreads the fire",
    "example": "(BCS/Admission No. 219)"
  },
  {
    "word": "চকচক করলেই সোনা হয় সম্পাদক",
    "meaning": "All that glitters is not gold",
    "example": "(BCS/Admission No. 220)"
  },
  {
    "word": "চাচা আপন প্রাণ বাঁচা",
    "meaning": "Every man for himself",
    "example": "(BCS/Admission No. 221)"
  },
  {
    "word": "চোরা না শোনে ধর্মের কাহিনী",
    "meaning": "A rogue is deaf to all good advice",
    "example": "(BCS/Admission No. 222)"
  },
  {
    "word": "জোর যার মুল্লুক তার",
    "meaning": "Might is right",
    "example": "(BCS/Admission No. 223)"
  },
  {
    "word": "তেলা মাথায় তেল দেওয়া",
    "meaning": "To carry coals to Newcastle",
    "example": "(BCS/Admission No. 224)"
  },
  {
    "word": "দশে মিলে করি কাজ, হারি জিতি নাহি লাজ",
    "meaning": "Two heads are better than one",
    "example": "(BCS/Admission No. 225)"
  },
  {
    "word": "দাঁত থাকতে দাঁতের মর্যাদা বোঝে না",
    "meaning": "Blessings are not valued till they are gone",
    "example": "(BCS/Admission No. 226)"
  },
  {
    "word": "দুষ্ট গরুর চেয়ে শূন্য গোয়াল ভালো",
    "meaning": "Better an empty house than an ill tenant",
    "example": "(BCS/Admission No. 227)"
  },
  {
    "word": "ধরি মাছ না ছুঁই পানি",
    "meaning": "A cat loves fish but is loath to wet her feet",
    "example": "(BCS/Admission No. 228)"
  },
  {
    "word": "নাই মামার চেয়ে কানা মামা ভালো",
    "meaning": "Something is better than nothing",
    "example": "(BCS/Admission No. 229)"
  },
  {
    "word": "নাচতে না জানলে উঠান বাঁকা",
    "meaning": "A bad workman quarrels with his tools",
    "example": "(BCS/Admission No. 230)"
  },
  {
    "word": "নানা মুনির নানা মত",
    "meaning": "Many men, many minds",
    "example": "(BCS/Admission No. 231)"
  },
  {
    "word": "নিজের চরকায় তেল দাও",
    "meaning": "Oil your own machine",
    "example": "(BCS/Admission No. 232)"
  },
  {
    "word": "পাপের ধন প্রায়শ্চিত্তে যায়",
    "meaning": "Ill got, ill spent",
    "example": "(BCS/Admission No. 233)"
  },
  {
    "word": "বজ্র আঁটুনি ফস্কা গেরো",
    "meaning": "Penny wise, pound foolish",
    "example": "(BCS/Admission No. 234)"
  },
  {
    "word": "বাপ কা বেটা",
    "meaning": "Like father, like son",
    "example": "(BCS/Admission No. 235)"
  },
  {
    "word": "ভেবে করিও কাজ",
    "meaning": "Look before you leap",
    "example": "(BCS/Admission No. 236)"
  },
  {
    "word": "মশা মারতে কামান দাগা",
    "meaning": "To break a butterfly on a wheel",
    "example": "(BCS/Admission No. 237)"
  },
  {
    "word": "মরার উপর খাঁড়ার ঘা",
    "meaning": "To add insult to injury",
    "example": "(BCS/Admission No. 238)"
  },
  {
    "word": "যার জ্বালা সেই বোঝে",
    "meaning": "The wearer best knows where the shoe pinches",
    "example": "(BCS/Admission No. 239)"
  },
  {
    "word": "যেমন কর্ম তেমন ফল",
    "meaning": "As you sow, so you reap",
    "example": "(BCS/Admission No. 240)"
  },
  {
    "word": "রক্তের টান বড় টান",
    "meaning": "Blood is thicker than water",
    "example": "(BCS/Admission No. 241)"
  },
  {
    "word": "সবুরে মেওয়া ফলে",
    "meaning": "Patience has its reward",
    "example": "(BCS/Admission No. 242)"
  },
  {
    "word": "হাতে পাঁজি মঙ্গলবার",
    "meaning": "Procrastination is the thief of time",
    "example": "(BCS/Admission No. 243)"
  },
  {
    "word": "বিপদে বন্ধুর পরিচয়",
    "meaning": "A friend in need is a friend indeed",
    "example": "(BCS/Admission No. 244)"
  },
  {
    "word": "জ্ঞানী সম্পদ",
    "meaning": "Knowledge is power",
    "example": "(BCS/Admission No. 245)"
  },
  {
    "word": "সময়ের এক ফোঁড় অসময়ের দশ ফোঁড়",
    "meaning": "A stitch in time saves nine",
    "example": "(BCS/Admission No. 246)"
  },
  {
    "word": "সে অঙ্কে কাঁচা",
    "meaning": "He is weak in Math",
    "example": "(BCS/Admission No. 247)"
  },
  {
    "word": "সকাল থেকে গুঁড়ি গুঁড়ি বৃষ্টি হচ্ছে",
    "meaning": "It has been drizzling since morning",
    "example": "(BCS/Admission No. 248)"
  },
  {
    "word": "আমি তাকে দিয়ে কাজটা করালাম",
    "meaning": "I made him do the work",
    "example": "(BCS/Admission No. 249)"
  },
  {
    "word": "গুজবে কান দিও না",
    "meaning": "Do not pay heed to rumors",
    "example": "(BCS/Admission No. 250)"
  },
  {
    "word": "অতি ভক্তি চোরের লক্ষণ",
    "meaning": "Too much courtesy, too much craft",
    "example": "(BCS/Admission No. 251)"
  },
  {
    "word": "অতি লোভে তাঁতি নষ্ট",
    "meaning": "Grasp all, lose all",
    "example": "(BCS/Admission No. 252)"
  },
  {
    "word": "অভাবের স্বভাব নষ্ট",
    "meaning": "Necessity knows no law",
    "example": "(BCS/Admission No. 253)"
  },
  {
    "word": "অসারের তর্জন গর্জন সার",
    "meaning": "Empty vessels sound much",
    "example": "(BCS/Admission No. 254)"
  },
  {
    "word": "আপনা ভালো তো জগত ভালো",
    "meaning": "To the pure all things are pure",
    "example": "(BCS/Admission No. 255)"
  },
  {
    "word": "আপনি বাঁচলে বাপের নাম",
    "meaning": "Self-preservation is the first law of nature",
    "example": "(BCS/Admission No. 256)"
  },
  {
    "word": "আয় বুঝে ব্যয় কর",
    "meaning": "Cut your coat according to your cloth",
    "example": "(BCS/Admission No. 257)"
  },
  {
    "word": "ইচ্ছা থাকলে উপায় হয়",
    "meaning": "Where there is a will, there is a way",
    "example": "(BCS/Admission No. 258)"
  },
  {
    "word": "উঠন্তি মূলো পত্তনেই চেনা যায়",
    "meaning": "Morning shows the day",
    "example": "(BCS/Admission No. 259)"
  },
  {
    "word": "উলুবনে মুক্তো ছড়ানো",
    "meaning": "To cast pearls before swine",
    "example": "(BCS/Admission No. 260)"
  },
  {
    "word": "এক ঢিলে দুই পাখি মারা",
    "meaning": "To kill two birds with one stone",
    "example": "(BCS/Admission No. 261)"
  },
  {
    "word": "এক হাতে তালি বাজে না",
    "meaning": "It takes two to make a quarrel",
    "example": "(BCS/Admission No. 262)"
  },
  {
    "word": "কষ্ট না করলে কেষ্ট মেলে না",
    "meaning": "No pains, no gains",
    "example": "(BCS/Admission No. 263)"
  },
  {
    "word": "কাঁচায় না নোয়ালে বাঁশ, পাকলে করে ঠাস ঠাস",
    "meaning": "Strike the iron while it is hot",
    "example": "(BCS/Admission No. 264)"
  },
  {
    "word": "কাঁটা দিয়ে কাঁটা তোলা",
    "meaning": "To set a thief to catch a thief",
    "example": "(BCS/Admission No. 265)"
  },
  {
    "word": "কারো পৌষ মাস কারো সর্বনাশ",
    "meaning": "What is sport to the cat is death to the rat",
    "example": "(BCS/Admission No. 266)"
  },
  {
    "word": "গাইতে গাইতে গায়েন",
    "meaning": "Practice makes perfect",
    "example": "(BCS/Admission No. 267)"
  },
  {
    "word": "গঁয়ো যোগী ভিক পায় না",
    "meaning": "A prophet is not honored in his own country",
    "example": "(BCS/Admission No. 268)"
  },
  {
    "word": "ঘর পোড়া গরু সিঁদুরে মেঘ দেখলে ডরায়",
    "meaning": "A burnt child dreads the fire",
    "example": "(BCS/Admission No. 269)"
  },
  {
    "word": "চকচক করলেই সোনা হয় সম্পাদক",
    "meaning": "All that glitters is not gold",
    "example": "(BCS/Admission No. 270)"
  },
  {
    "word": "চাচা আপন প্রাণ বাঁচা",
    "meaning": "Every man for himself",
    "example": "(BCS/Admission No. 271)"
  },
  {
    "word": "চোরা না শোনে ধর্মের কাহিনী",
    "meaning": "A rogue is deaf to all good advice",
    "example": "(BCS/Admission No. 272)"
  },
  {
    "word": "জোর যার মুল্লুক তার",
    "meaning": "Might is right",
    "example": "(BCS/Admission No. 273)"
  },
  {
    "word": "তেলা মাথায় তেল দেওয়া",
    "meaning": "To carry coals to Newcastle",
    "example": "(BCS/Admission No. 274)"
  },
  {
    "word": "দশে মিলে করি কাজ, হারি জিতি নাহি লাজ",
    "meaning": "Two heads are better than one",
    "example": "(BCS/Admission No. 275)"
  },
  {
    "word": "দাঁত থাকতে দাঁতের মর্যাদা বোঝে না",
    "meaning": "Blessings are not valued till they are gone",
    "example": "(BCS/Admission No. 276)"
  },
  {
    "word": "দুষ্ট গরুর চেয়ে শূন্য গোয়াল ভালো",
    "meaning": "Better an empty house than an ill tenant",
    "example": "(BCS/Admission No. 277)"
  },
  {
    "word": "ধরি মাছ না ছুঁই পানি",
    "meaning": "A cat loves fish but is loath to wet her feet",
    "example": "(BCS/Admission No. 278)"
  },
  {
    "word": "নাই মামার চেয়ে কানা মামা ভালো",
    "meaning": "Something is better than nothing",
    "example": "(BCS/Admission No. 279)"
  },
  {
    "word": "নাচতে না জানলে উঠান বাঁকা",
    "meaning": "A bad workman quarrels with his tools",
    "example": "(BCS/Admission No. 280)"
  },
  {
    "word": "নানা মুনির নানা মত",
    "meaning": "Many men, many minds",
    "example": "(BCS/Admission No. 281)"
  },
  {
    "word": "নিজের চরকায় তেল দাও",
    "meaning": "Oil your own machine",
    "example": "(BCS/Admission No. 282)"
  },
  {
    "word": "পাপের ধন প্রায়শ্চিত্তে যায়",
    "meaning": "Ill got, ill spent",
    "example": "(BCS/Admission No. 283)"
  },
  {
    "word": "বজ্র আঁটুনি ফস্কা গেরো",
    "meaning": "Penny wise, pound foolish",
    "example": "(BCS/Admission No. 284)"
  },
  {
    "word": "বাপ কা বেটা",
    "meaning": "Like father, like son",
    "example": "(BCS/Admission No. 285)"
  },
  {
    "word": "ভেবে করিও কাজ",
    "meaning": "Look before you leap",
    "example": "(BCS/Admission No. 286)"
  },
  {
    "word": "মশা মারতে কামান দাগা",
    "meaning": "To break a butterfly on a wheel",
    "example": "(BCS/Admission No. 287)"
  },
  {
    "word": "মরার উপর খাঁড়ার ঘা",
    "meaning": "To add insult to injury",
    "example": "(BCS/Admission No. 288)"
  },
  {
    "word": "যার জ্বালা সেই বোঝে",
    "meaning": "The wearer best knows where the shoe pinches",
    "example": "(BCS/Admission No. 289)"
  },
  {
    "word": "যেমন কর্ম তেমন ফল",
    "meaning": "As you sow, so you reap",
    "example": "(BCS/Admission No. 290)"
  },
  {
    "word": "রক্তের টান বড় টান",
    "meaning": "Blood is thicker than water",
    "example": "(BCS/Admission No. 291)"
  },
  {
    "word": "সবুরে মেওয়া ফলে",
    "meaning": "Patience has its reward",
    "example": "(BCS/Admission No. 292)"
  },
  {
    "word": "হাতে পাঁজি মঙ্গলবার",
    "meaning": "Procrastination is the thief of time",
    "example": "(BCS/Admission No. 293)"
  },
  {
    "word": "বিপদে বন্ধুর পরিচয়",
    "meaning": "A friend in need is a friend indeed",
    "example": "(BCS/Admission No. 294)"
  },
  {
    "word": "জ্ঞানী সম্পদ",
    "meaning": "Knowledge is power",
    "example": "(BCS/Admission No. 295)"
  },
  {
    "word": "সময়ের এক ফোঁড় অসময়ের দশ ফোঁড়",
    "meaning": "A stitch in time saves nine",
    "example": "(BCS/Admission No. 296)"
  },
  {
    "word": "সে অঙ্কে কাঁচা",
    "meaning": "He is weak in Math",
    "example": "(BCS/Admission No. 297)"
  },
  {
    "word": "সকাল থেকে গুঁড়ি গুঁড়ি বৃষ্টি হচ্ছে",
    "meaning": "It has been drizzling since morning",
    "example": "(BCS/Admission No. 298)"
  },
  {
    "word": "আমি তাকে দিয়ে কাজটা করালাম",
    "meaning": "I made him do the work",
    "example": "(BCS/Admission No. 299)"
  },
  {
    "word": "গুজবে কান দিও না",
    "meaning": "Do not pay heed to rumors",
    "example": "(BCS/Admission No. 300)"
  }
];

export const TRANSLATION_WORDS: WordItem[] = baseTranslations.map((item, index) => ({
  id: 'translation_' + index,
  word: item.word || '',
  meaning: item.meaning || '',
  example: item.example || '',
  language: 'english',
  category: 'translation'
}));
