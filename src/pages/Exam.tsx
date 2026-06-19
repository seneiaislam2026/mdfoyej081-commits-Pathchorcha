import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, increment, writeBatch, addDoc, serverTimestamp, limit } from "firebase/firestore";
import { CheckCircle2, Lightbulb, Clock, Target, AlertCircle, PlayCircle, ArrowLeft, BookOpen, Atom, Calculator, Users, Laptop, Lock, FileText, Timer, Brain, ChevronRight, Landmark, TestTube, Dna, TrendingUp, Factory, Globe, Building2, Trash2, Briefcase, ChevronDown, Check, FileEdit, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../lib/AuthContext";
import { getSubjectsForUser } from "../utils/subjects";
import { useIsPWA } from "../lib/useIsPWA";
import { ENGLISH_WORDS } from "../data/vocabularyData";

const mockSets = [
  { id: "mock-10", title: "ছোট মক টেস্ট", totalQuestions: 10, timeMinutes: 10 },
  { id: "mock-20", title: "মাঝারি মক টেস্ট", totalQuestions: 20, timeMinutes: 20 },
  { id: "mock-30", title: "বড় মক টেস্ট", totalQuestions: 30, timeMinutes: 30 },
];

const modelSets: any[] = [];

const subjectsByGroup: Record<string, {name: string, icon: any, color: string}[]> = {
  "common": [
    { name: "বাংলা", icon: <BookOpen className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-red-50 hover:border-red-200" },
    { name: "English", icon: <span className="font-bold text-[18px]">Aa</span>, color: "bg-indigo-50 hover:border-indigo-200" },
    { name: "তথ্য ও যোগাযোগ প্রযুক্তি", icon: <Laptop className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-blue-50 hover:border-blue-200" },
    { name: "মেমোরাইজিং পার্ট", icon: <Lightbulb className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-violet-50 hover:border-violet-200" },
  ],
  "বিজ্ঞান": [
    { name: "পদার্থবিজ্ঞান", icon: <Atom className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-purple-50 hover:border-purple-200" },
    { name: "রসায়ন", icon: <TestTube className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-pink-50 hover:border-pink-200" },
    { name: "উচ্চতর গণিত", icon: <span className="text-[18px] font-bold">π</span>, color: "bg-orange-50 hover:border-orange-200" },
    { name: "জীববিজ্ঞান", icon: <Dna className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-green-50 hover:border-green-200" },
  ],
  "ব্যবসায় শিক্ষা": [
    { name: "হিসাববিজ্ঞান", icon: <Calculator className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-blue-50 hover:border-blue-200" },
    { name: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা", icon: <Users className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-emerald-50 hover:border-emerald-200" },
    { name: "ফিন্যান্স ও ব্যাংকিং", icon: <TrendingUp className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-rose-50 hover:border-rose-200" },
    { name: "উৎপাদন ব্যবস্থাপনা ও বিপণন", icon: <Factory className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-yellow-50 hover:border-yellow-200" },
    { name: "ব্যবসায় উদ্যোগ", icon: <Briefcase className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-purple-50 hover:border-purple-200" },
  ],
  "মানবিক": [
    { name: "ইতিহাস", icon: <Landmark className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-amber-50 hover:border-amber-200" },
    { name: "ভূগোল", icon: <Globe className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-cyan-50 hover:border-cyan-200" },
    { name: "অর্থনীতি", icon: <TrendingUp className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-fuchsia-50 hover:border-fuchsia-200" },
    { name: "পৌরনীতি", icon: <Building2 className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-muted hover:border-slate-300" },
    { name: "যুক্তিবিদ্যা", icon: <Lightbulb className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-indigo-50 hover:border-indigo-200" },
    { name: "সমাজবিজ্ঞান", icon: <Users className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-teal-50 hover:border-teal-200" },
    { name: "ইসলামের ইতিহাস", icon: <BookOpen className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-green-50 hover:border-green-200" },
  ]
};

const mockQuestions = [
  {
    id: "q1",
    questionNumber: "১",
    text: "বাংলা সাহিত্যের প্রথম নিদর্শন কোনটি?",
    options: [
      { id: "ক", label: "চর্যাপদ" },
      { id: "খ", label: "শ্রীকৃষ্ণকীর্তন" },
      { id: "গ", label: "বৈষ্ণব পদাবলী" },
      { id: "ঘ", label: "মঙ্গলকাব্য" }
    ],
    correctOption: "ক",
    explanation: "চর্যাপদ বাংলা ভাষা ও সাহিত্যের প্রাচীনতম নিদর্শন। এটি পাল আমলে রচিত বৌদ্ধ সহজিয়াদের সাধনসংগীত।"
  },
  {
    id: "q2",
    questionNumber: "২",
    text: "কোন মুঘল সম্রাট বাংলার সুবাদার হিসেবে যুবরাজ মোহাম্মদ সুজাকে নিয়োগ করেন?",
    options: [
      { id: "ক", label: "সম্রাট আকবর" },
      { id: "খ", label: "সম্রাট জাহাঙ্গীর" },
      { id: "গ", label: "সম্রাট শাহজাহান" },
      { id: "ঘ", label: "সম্রাট আওরঙ্গজেব" }
    ],
    correctOption: "গ",
    explanation: "সম্রাট শাহজাহান ১৬৩৯ খ্রিষ্টাব্দে তাঁর দ্বিতীয় পুত্র শাহ সুজাকে বাংলার সুবাদার হিসেবে প্রেরণ করেন।"
  },
  {
    id: "q3",
    questionNumber: "৩",
    text: "মুক্তিযুদ্ধ চলাকালীন সময়ে বাংলাদেশের অস্থায়ী সরকার কবে গঠিত হয়?",
    options: [
      { id: "ক", label: "১০ এপ্রিল ১৯৭১" },
      { id: "খ", label: "১৭ এপ্রিল ১৯৭১" },
      { id: "গ", label: "২৬ মার্চ ১৯৭১" },
      { id: "ঘ", label: "২ মার্চ ১৯৭১" }
    ],
    correctOption: "ক",
    explanation: "১০ এপ্রিল ১৯৭১ তারিখে মুজিবনগরে বাংলাদেশের প্রথম সরকার বা অস্থায়ী সরকার গঠিত হয়। ১৭ এপ্রিল এই সরকার শপথ গ্রহণ করে।"
  }
];

function generateIncorrectSpellings(correctWord: string, count: number): string[] {
   const mutations = new Set<string>();
   const lower = correctWord.toLowerCase();

   // 1. Double common characters
   const doubleCandidates = ['c', 'm', 't', 's', 'l', 'p', 'r', 'n', 'd', 'e', 'a', 'o'];
   for (let char of doubleCandidates) {
      if (lower.includes(char) && !lower.includes(char + char)) {
         mutations.add(correctWord.replace(new RegExp(char, 'i'), char + char));
      }
   }

   // 2. Single common double characters
   const doubleChars = ['cc', 'mm', 'tt', 'ss', 'll', 'pp', 'rr', 'nn', 'dd', 'ee', 'oo'];
   for (let dbl of doubleChars) {
      if (lower.includes(dbl)) {
         mutations.add(correctWord.replace(new RegExp(dbl, 'i'), dbl[0]));
      }
   }

   // 3. Vowel shifts
   const vowels = ['a', 'e', 'i', 'o', 'u'];
   for (let i = 0; i < correctWord.length; i++) {
      const char = correctWord[i].toLowerCase();
      if (vowels.includes(char)) {
         for (let v of vowels) {
            if (v !== char) {
               const mutated = correctWord.slice(0, i) + (correctWord[i] === char ? v : v.toUpperCase()) + correctWord.slice(i + 1);
               mutations.add(mutated);
            }
         }
      }
   }

   // 4. Suffix typos
   mutations.add(correctWord + "n");
   mutations.add(correctWord + "e");
   if (correctWord.length > 4) {
      mutations.add(correctWord.slice(0, -1));
   }

   const list = Array.from(mutations).filter(w => w.toLowerCase() !== lower);
   return list.slice(0, count);
}

export const isSubjectMatch = (dbSubject: string | undefined, selectedSubject: string): boolean => {
  if (!dbSubject) return false;
  const dbSub = dbSubject.trim().toLowerCase();
  const selSub = selectedSubject.trim().toLowerCase();
  
  if (dbSub === selSub) return true;
  
  // Bangla
  if (selSub === "বাংলা") {
    return dbSub === "bangla" || dbSub === "বাংলা" || dbSub === "bengali";
  }
  if (selSub === "bangla") {
    return dbSub === "bangla" || dbSub === "বাংলা" || dbSub === "bengali";
  }
  
  // English
  if (selSub === "english" || selSub === "ইংরেজি" || selSub === "english grammar") {
    return dbSub === "english" || dbSub === "english grammar" || dbSub === "ইংরেজি" || dbSub === "ইংরেজি ব্যাকরণ";
  }
  
  // ICT
  if (selSub === "তথ্য ও যোগাযোগ প্রযুক্তি" || selSub === "ict" || selSub === "information and communication technology") {
    return dbSub === "তথ্য ও যোগাযোগ প্রযুক্তি" || dbSub === "ict" || dbSub === "information and communication technology" || dbSub === "information technology" || dbSub === "it";
  }
  
  // Memorizing Part
  if (selSub === "মেমোরাইজিং পার্ট" || selSub === "memorizing" || selSub === "memorizing part") {
    return dbSub === "মেমোরাইজিং পার্ট" || dbSub === "memorizing" || dbSub === "memorizing part" || dbSub === "vocab" || dbSub === "vocabulary";
  }
  
  // Science
  if (selSub === "পদার্থবিজ্ঞান" || selSub === "physics") return dbSub === "physics" || dbSub === "পদার্থবিজ্ঞান" || dbSub === "পদার্থ";
  if (selSub === "রসায়ন" || selSub === "রসায়ন" || selSub === "chemistry") return dbSub === "chemistry" || dbSub === "রসায়ন" || dbSub === "রসায়ন";
  if (selSub === "উচ্চতর গণিত" || selSub === "math" || selSub === "higher math") return dbSub === "math" || dbSub === "mathematics" || dbSub === "higher math" || dbSub === "উচ্চতর গণিত" || dbSub === "গণিত";
  if (selSub === "জীববিজ্ঞান" || selSub === "biology") return dbSub === "biology" || dbSub === "জীববিজ্ঞান";

  // Commerce
  if (selSub === "হিসাববিজ্ঞান") return dbSub === "accounting" || dbSub === "হিসাববিজ্ঞান";
  if (selSub === "ব্যবসায় সংগঠন ও ব্যবস্থাপনা" || selSub === "ব্যবস্থাপনা" || selSub === "ম্যানেজমেন্ট") return dbSub === "management" || dbSub === "ব্যবস্থাপনা" || dbSub === "ব্যবসায় সংগঠন ও ব্যবস্থাপনা" || dbSub === "ম্যানেজমেন্ট";
  if (selSub === "ফিন্যান্স" || selSub === "finance" || selSub === "ফিন্যান্স ও ব্যাংকিং") return dbSub === "finance" || dbSub === "ফিন্যান্স" || dbSub === "ফিন্যান্স ও ব্যাংকিং";
  
  // Arts/Humanities
  if (selSub === "ইতিহাস") return dbSub === "history" || dbSub === "ইতিহাস";
  if (selSub === "ভূগোল") return dbSub === "geography" || dbSub === "ভূগোল";
  if (selSub === "অর্থনীতি") return dbSub === "economics" || dbSub === "অর্থনীতি";
  if (selSub === "পৌরনীতি") return dbSub === "civics" || dbSub === "পৌরনীতি";
  if (selSub === "যুক্তিবিদ্যা") return dbSub === "logic" || dbSub === "যুক্তিবিদ্যা";
  if (selSub === "সমাজবিজ্ঞান") return dbSub === "sociology" || dbSub === "সমাজবিজ্ঞান";
  if (selSub === "ইসলামের ইতিহাস") return dbSub === "islamic history" || dbSub === "ইসলামের ইতিহাস" || dbSub === "history of islam";

  return dbSub.includes(selSub) || selSub.includes(dbSub);
};

export const getDbSubjectVariants = (subjectNames: string[]): string[] => {
  const variants = new Set<string>();
  subjectNames.forEach(sub => {
    variants.add(sub);
    const lower = sub.toLowerCase();
    if (lower === "বাংলা" || lower === "bangla") {
      variants.add("বাংলা");
      variants.add("Bangla");
      variants.add("bangla");
    } else if (lower === "english" || lower === "ইংরেজি" || lower === "english grammar") {
      variants.add("english");
      variants.add("English");
      variants.add("ইংরেজি");
      variants.add("English Grammar");
    } else if (lower === "তথ্য ও যোগাযোগ প্রযুক্তি" || lower === "ict") {
      variants.add("তথ্য ও যোগাযোগ প্রযুক্তি");
      variants.add("ICT");
      variants.add("ict");
    } else if (lower === "মেমোরাইজিং পার্ট" || lower === 'memorizing part') {
      variants.add("মেমোরাইজিং পার্ট");
      variants.add("Memorizing");
      variants.add("memorizing");
      variants.add("Memorizing Part");
    } else if (lower === "পদার্থবিজ্ঞান") {
      variants.add("Physics");
      variants.add("physics");
      variants.add("পদার্থবিজ্ঞান");
    } else if (lower === "রসায়ন" || lower === "রসায়ন") {
      variants.add("Chemistry");
      variants.add("chemistry");
      variants.add("রসায়ন");
      variants.add("রসায়ন");
    } else if (lower === "উচ্চতর গণিত") {
      variants.add("উচ্চতর গণিত");
      variants.add("Math");
      variants.add("math");
      variants.add("Higher Math");
    } else if (lower === "জীববিজ্ঞান") {
      variants.add("Biology");
      variants.add("biology");
      variants.add("জীববিজ্ঞান");
    } else if (lower === "হিসাববিজ্ঞান") {
      variants.add("Accounting");
      variants.add("accounting");
      variants.add("হিসাববিজ্ঞান");
    } else if (lower === "ব্যবসায় সংগঠন ও ব্যবস্থাপনা") {
      variants.add("ব্যবসায় সংগঠন ও ব্যবস্থাপনা");
      variants.add("Business Organization");
      variants.add("management");
      variants.add("Management");
    }
  });
  return Array.from(variants);
};

export const getSubjectDecoration = (name: string) => {
  const lower = name.toLowerCase();
  if (lower === "বাংলা" || lower === "bangla") {
    return {
      leftBg: "bg-[#eef6f2]",
      leftText: "text-[#008060]",
      leftIn: "অ",
      rightIllustration: (
        <svg className="w-16 h-12" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 45C35 44 26 42 16 45V18C26 15 35 17 40 18C45 17 54 15 64 18V45C54 42 45 44 40 45Z" fill="#aee0cc" stroke="#008060" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M40 18V45" stroke="#008060" strokeWidth="1.5"/>
          <path d="M20 24C26 22 32 23 36 24" stroke="#008060" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M20 30C26 28 32 29 36 30" stroke="#008060" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M20 36C26 34 32 35 36 36" stroke="#008060" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M60 24C54 22 48 23 44 24" stroke="#008060" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M60 30C54 28 48 29 44 30" stroke="#008060" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M60 36C54 34 48 35 44 36" stroke="#008060" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M38 38C44 32 50 20 62 10C54 18 48 28 44 38L42 43L38 38Z" fill="#008060" fillOpacity="0.8" stroke="#008060" strokeWidth="1" strokeLinejoin="round"/>
          <line x1="42" y1="43" x2="40" y2="48" stroke="#008060" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    };
  }
  if (lower === "english" || lower === "ইংরেজি" || lower === "english grammar") {
    return {
      leftBg: "bg-[#eef4fc]",
      leftText: "text-[#1e539c]",
      leftIn: "En",
      rightIllustration: (
        <svg className="w-16 h-12" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="22" y="12" width="36" height="38" rx="4" fill="#adcbf7" stroke="#1e539c" strokeWidth="1.5"/>
          <path d="M26 12V50" stroke="#1e539c" strokeWidth="1.5"/>
          <line x1="58" y1="16" x2="58" y2="46" stroke="#1e539c" strokeWidth="2" strokeLinecap="round"/>
          <text x="35" y="28" fill="#1e539c" fontSize="11" fontWeight="bold" fontFamily="sans-serif">A</text>
          <text x="44" y="42" fill="#1e539c" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Z</text>
          <line x1="39" y1="31" x2="43" y2="35" stroke="#1e539c" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      )
    };
  }
  if (lower === "তথ্য ও যোগাযোগ প্রযুক্তি" || lower === "ict") {
    return {
      leftBg: "bg-[#fff5ea]",
      leftText: "text-[#d97706]",
      leftIn: (
        <svg className="w-5 h-5 text-[#d97706]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m0 18c1.657 0 3-4.03 3-9s-1.343-9-3-9M3 9h18M3 15h18" />
        </svg>
      ),
      rightIllustration: (
        <svg className="w-16 h-12" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="15" width="34" height="23" rx="3" fill="#ffe3c4" stroke="#d97706" strokeWidth="1.5"/>
          <line x1="22" y1="23" x2="48" y2="23" stroke="#d97706" strokeWidth="1"/>
          <path d="M31 38H39L41 43H29L31 38Z" fill="#ffd19a" stroke="#d97706" strokeWidth="1.5"/>
          <rect x="48" y="24" width="14" height="23" rx="2" fill="#fffbeb" stroke="#d97706" strokeWidth="1.5"/>
          <circle cx="55" cy="43" r="1.5" fill="#d97706"/>
          <line x1="52" y1="27" x2="58" y2="27" stroke="#d97706" strokeWidth="1"/>
        </svg>
      )
    };
  }
  if (lower === "মেমোরাইজিং পার্ট" || lower.includes("memorizing")) {
    return {
      leftBg: "bg-[#f5f0fa]",
      leftText: "text-[#7c3aed]",
      leftIn: (
        <svg className="w-5 h-5 text-[#7c3aed]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      rightIllustration: (
        <svg className="w-16 h-12" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="22" y="12" width="28" height="34" rx="3" fill="#ebdcfc" stroke="#7c3aed" strokeWidth="1.5"/>
          <path d="M31 12V9H39V12" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="28" cy="20" r="1.5" fill="#7c3aed"/>
          <line x1="33" y1="20" x2="44" y2="20" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="28" cy="27" r="1.5" fill="#7c3aed"/>
          <line x1="33" y1="27" x2="44" y2="27" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="28" cy="34" r="1.5" fill="#7c3aed"/>
          <line x1="33" y1="34" x2="44" y2="34" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="50" cy="38" r="10" fill="#fff" stroke="#7c3aed" strokeWidth="1.5"/>
          <path d="M50 32V38H55" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    };
  }
  
  return {
    leftBg: "bg-muted",
    leftText: "text-slate-700",
    leftIn: "?",
    rightIllustration: (
      <svg className="w-16 h-12" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="24" y="15" width="32" height="30" rx="3" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5"/>
        <path d="M28 15V45" stroke="#64748b" strokeWidth="1.5"/>
        <line x1="34" y1="22" x2="48" y2="22" stroke="#cbd5e1" strokeWidth="1.5"/>
        <line x1="34" y1="28" x2="48" y2="28" stroke="#cbd5e1" strokeWidth="1.5"/>
        <line x1="34" y1="34" x2="44" y2="34" stroke="#cbd5e1" strokeWidth="1.5"/>
      </svg>
    )
  };
};

export default function Exam() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const isPWA = useIsPWA();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'model';
  const [dynamicModelSets, setDynamicModelSets] = useState<any[]>(type === 'mock' ? mockSets : modelSets);

  useEffect(() => {
    if (type !== 'model') {
      setDynamicModelSets(mockSets);
      return;
    }
    const fetchAdminSets = async () => {
      try {
        const examsRef = collection(db, "public_exams");
        const q = query(examsRef, where("type", "in", ["model_test", "live_model_test"]));
        const snap = await getDocs(q);
        const adminSets = snap.docs.map(d => {
           const data = d.data();
           return {
             id: d.id,
             title: data.title || "মডেল টেস্ট",
             totalQuestions: Array.isArray(data.questions) ? data.questions.length : 50,
             timeMinutes: data.duration || 45,
             isAdminExam: true,
             targetClass: data.targetClass || "সকল ক্লাস"
           };
        }).filter(set => {
           if (set.targetClass === "সকল ক্লাস") return true;
           if (!userData?.class) return true;
           
           const uClass = (userData.class || "").toLowerCase();
           const tClass = (set.targetClass || "").toLowerCase();
           
           if (uClass.includes(tClass) || tClass.includes(uClass)) return true;
           
           // specifically handle equivalents
           if (tClass.includes("এইচএসসি") && (uClass.includes("hsc") || uClass.includes("একাদশ") || uClass.includes("দ্বাদশ"))) return true;
           if (uClass.includes("এইচএসসি") && (tClass.includes("hsc") || tClass.includes("একাদশ") || tClass.includes("দ্বাদশ"))) return true;
           
           if (tClass.includes("দশম") && (uClass.includes("ssc") || uClass.includes("দশম"))) return true;
           if (uClass.includes("দশম") && (tClass.includes("ssc") || tClass.includes("দশম"))) return true;
           
           if (tClass.includes("নবম") && uClass.includes("nine")) return true;
           return false;
        });
        setDynamicModelSets([...adminSets, ...modelSets]);
      } catch (err) {
        console.error("Failed to fetch admin model sets:", err);
        setDynamicModelSets(modelSets);
      }
    };
    fetchAdminSets();
  }, [type]);

  const pageTitle = type === 'mock' ? 'মক টেস্ট অনুশীলন' : type === 'mistakes' ? 'ভুলগুলোর প্র্যাকটিস' : 'মডেল টেস্ট অনুশীলন';
  const pageDesc = type === 'mock' 
    ? 'অধ্যায়ভিত্তিক মক টেস্ট দিয়ে তোমার প্রস্তুতি যাচাই করো।' 
    : type === 'mistakes' ? 'আগের ভুল হওয়া প্রশ্নগুলো পুনরায় অনুশীলন করে নিজের দুর্বলতাগুলো কাটিয়ে ওঠো।' : 'নিচের মডেল টেস্টগুলো থেকে যে কোনো একটি বেছে নিয়ে পূর্ণাঙ্গ প্রস্তুতি যাচাই করো।';

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [activeSet, setActiveSet] = useState<string | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  
  const [mockCustomSubjects, setMockCustomSubjects] = useState<string[]>([]);
  const [mockCustomChapters, setMockCustomChapters] = useState<Record<string, string[]>>({});
  const [mockCustomQCount, setMockCustomQCount] = useState<number>(25);
  const [mockCustomTime, setMockCustomTime] = useState<number>(25);
  
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [dbQuestions, setDbQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleOfflineSync = async () => {
     setIsSyncing(true);
     setTimeout(() => setIsSyncing(false), 1000);
  };

  const [mockStep, setMockStep] = useState<number>(1);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [mockQuestionCounts, setMockQuestionCounts] = useState<Record<string, number>>({});
  const [showChaptersAccordion, setShowChaptersAccordion] = useState(false);
  const [topicError, setTopicError] = useState("");

  const [expandedChaps, setExpandedChaps] = useState<Record<string, boolean>>({});
  const [dynamicChaptersMap, setDynamicChaptersMap] = useState<Record<string, string[]>>({});
  const [cachedQs, setCachedQs] = useState<{hash: string, qs: any[]}>({hash: '', qs: []});

  const defaultChaptersMap: Record<string, string[]> = {
    "বাংলা": ["গদ্য", "পদ্য", "উপন্যাস ও নাটক", "ব্যাকরণ অংশ", "উচ্চারণের নিয়ম", "বানানের নিয়ম", "বাক্যতত্ত্ব", "সমার্থক শব্দ", "বিপরীত শব্দ", "এক কথায় প্রকাশ"],
    "English": ["Reading Comprehension", "Grammar (Admissions)", "Category: Vocabulary", "Category: Translation", "Category: Analogy", "Category: Appro. Prep.", "Category: Group Verb", "Category: Spelling", "Category: Class 6 English", "Category: Verb (3 Forms)", "Category: Idiom & Phrase", "Category: Synonym", "Category: Antonym"],
    "মেমোরাইজিং পার্ট": ["English Vocabulary", "Translation", "Analogy", "Appropriate Preposition", "Group Verb", "Spelling", "Idiom & Phrase", "Synonym", "Antonym", "সমার্থক শব্দ", "বিপরীত শব্দ", "এক কথায় প্রকাশ"],
    "সাধারণ জ্ঞান": ["বাংলাদেশ বিষয়াবলি", "আন্তর্জাতিক বিষয়াবলি", "সাম্প্রতিক বিষয়াবলি"],
    "পদার্থবিজ্ঞান": ["অধ্যায় ১: ভৌত জগৎ", "অধ্যায় ২: ভেক্টর", "অধ্যায় ৩: গতিবিদ্যা", "অধ্যায় ৪: নিউটনিয়ান বলবিদ্যা", "অধ্যায় ৫: কাজ, ক্ষমতা ও শক্তি", "অধ্যায় ৬: মহাকর্ষ ও অভিকর্ষ", "অধ্যায় ৭: পদার্থের গাঠনিক ধর্ম", "অধ্যায় ৮: পর্যাবৃত্ত গতি", "অধ্যায় ৯: আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব"],
    "রসায়ন": ["অধ্যায় ১: ল্যাবরেটরির নিরাপদ ব্যবহার", "অধ্যায় ২: গুণগত রসায়ন", "অধ্যায় ৩: মৌলের পর্যাবৃত্ত ধর্ম ও রাসায়নিক বন্ধন", "অধ্যায় ৪: রাসায়নিক পরিবর্তন", "অধ্যায় ৫: কর্মমুখী রসায়ন"],
    "উচ্চতর গণিত": ["ম্যাট্রিক্স ও নির্ণায়ক", "ভেক্টর", "সরলরেখা", "বৃত্ত", "বিন্যাস ও সমাবেশ", "ত্রিকোণমিতি", "অন্তরীকরণ", "যোগজীকরণ"],
    "জীববিজ্ঞান": ["কোষ ও এর গঠন", "কোষ বিভাজন", "কোষ রসায়ন", "অণুজীব", "শৈবাল ও ছত্রাক", "ব্রায়োফাইটা ও টেরিডোফাইটা", "নগ্নবীজী ও আবৃতবীজী উদ্ভিদ", "টিস্যু ও টিস্যুতন্ত্র", "উদ্ভিদ শারীরতত্ত্ব", "উদ্ভিদ প্রজনন", "জীবপ্রযুক্তি", "জীবের পরিবেশ, বিস্তার ও সংরক্ষণ"]
  };

  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      if (activeSet || selectedSubject || type === 'mistakes') {
        try {
          let allQs: any[] = [];

          const fetchHash = `${type}_${activeSet}_${selectedSubject}_${mockCustomSubjects.join(',')}`;
          if (cachedQs.hash === fetchHash) {
              allQs = [...cachedQs.qs];
          } else {
              if (type === 'mistakes') {
                 if (userData?.uid) {
                     try {
                         const mistakesRef = collection(db, "users", userData.uid, "mistakes");
                         const qQuery = query(mistakesRef, limit(30));
                         const snap = await getDocs(qQuery);
                         allQs = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
                     } catch (err) {
                         console.error("Failed to fetch mistakes from DB", err);
                     }
                 }
                 
                 if (allQs.length === 0) {
                     const userWrong = JSON.parse(localStorage.getItem(`pathcharcha_wrong_${userData?.uid}`) || "{}");
                     const wrongIds = Object.keys(userWrong);
                     if (wrongIds.length > 0) {
                         try {
                             const qBase = collection(db, "questions");
                             const chunkedIds = wrongIds.slice(0, 30);
                             const qQuery = query(qBase, where("__name__", "in", chunkedIds.slice(0, 10)));
                             const snap = await getDocs(qQuery);
                             allQs = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
                         } catch (err) {
                             console.error("Failed to fetch mistakes from DB (fallback)", err);
                         }
                     }
                 }
              } else {
                 let qBase = collection(db, "questions");
                 let qQuery: any = qBase;
                 
                 if (type === 'mock' && mockCustomSubjects.length > 0) {
                     // Note: Firebase 'in' max array size is 10
                     const expandedSubjects = getDbSubjectVariants(mockCustomSubjects);
                     const subSet = expandedSubjects.slice(0, 10);
                     qQuery = query(qBase, where("subject", "in", subSet));
                 } else if (selectedSubject && selectedSubject !== "সকল বিষয়") {
                     qQuery = query(qBase, where("subject", "==", selectedSubject));
                 }
    
                 try {
                    const snap = await getDocs(qQuery);
                    allQs = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
                 } catch(err) {
                    console.warn("Failed to fetch questions from DB, continuing with local data", err);
                 }
              }
              setCachedQs({hash: fetchHash, qs: [...allQs]});
          }

          if (type !== 'mistakes') {
             // Inject Dynamic Questions for English, Bangla, Memorizing Part
             if (type === 'mock' && mockCustomSubjects.some(s => s === 'English' || s === 'বাংলা' || s === 'মেমোরাইজিং পার্ট')) {
                const englishChapters = mockCustomChapters['English'] || [];
                const banglaChapters = mockCustomChapters['বাংলা'] || [];
                const memChapters = mockCustomChapters['মেমোরাইজিং পার্ট'] || [];
                
                const isAllEnglish = mockCustomSubjects.includes('English') && mockCustomChapters['English'] === undefined;
                const isAllBangla = mockCustomSubjects.includes('বাংলা') && mockCustomChapters['বাংলা'] === undefined;
                const isAllMem = mockCustomSubjects.includes('মেমোরাইজিং পার্ট') && mockCustomChapters['মেমোরাইজিং পার্ট'] === undefined;
                
                const engCatMapping: Record<string, string> = {
                  "Category: Vocabulary": "vocabulary", "English Vocabulary": "vocabulary",
                  "Category: Translation": "translation", "Translation": "translation",
                  "Category: Analogy": "analogy", "Analogy": "analogy",
                  "Category: Appro. Prep.": "appropriate_preposition", "Appropriate Preposition": "appropriate_preposition",
                  "Category: Group Verb": "group_verb", "Group Verb": "group_verb",
                  "Category: Spelling": "spelling", "Spelling": "spelling",
                  "Category: Class 6 English": "class_6_vocabulary",
                  "Category: Verb (3 Forms)": "verb_forms",
                  "Category: Idiom & Phrase": "idiom_phrase", "Idiom & Phrase": "idiom_phrase",
                  "Category: Synonym": "synonym", "Synonym": "synonym",
                  "Category: Antonym": "antonym", "Antonym": "antonym"
                };

                const banCatMapping: Record<string, string> = {
                  "সমার্থক শব্দ": "samarthok",
                  "বিপরীত শব্দ": "antonym", // some bangla antonyms are coded as antonym but language bangla
                  "এক কথায় প্রকাশ": "ek_kothay"
                };

                const catsToInject: {cat: string, lang: string, chapter: string, originalSub: string}[] = [];
                
                Object.keys(engCatMapping).forEach(uiCat => {
                   if (isAllEnglish || englishChapters.includes(uiCat)) catsToInject.push({cat: engCatMapping[uiCat], lang: 'english', chapter: uiCat, originalSub: 'English'});
                   if (isAllMem || memChapters.includes(uiCat)) catsToInject.push({cat: engCatMapping[uiCat], lang: 'english', chapter: uiCat, originalSub: 'মেমোরাইজিং পার্ট'});
                });

                Object.keys(banCatMapping).forEach(uiCat => {
                   if (isAllBangla || banglaChapters.includes(uiCat)) catsToInject.push({cat: banCatMapping[uiCat], lang: 'bangla', chapter: uiCat, originalSub: 'বাংলা'});
                   if (isAllMem || memChapters.includes(uiCat)) catsToInject.push({cat: banCatMapping[uiCat], lang: 'bangla', chapter: uiCat, originalSub: 'মেমোরাইজিং পার্ট'});
                });

                if (catsToInject.length > 0) {
                   catsToInject.forEach(({cat, lang, chapter, originalSub}) => {
                      const filteredWords = ENGLISH_WORDS.filter(w => w.category === cat && w.language === lang);
                      filteredWords.forEach(word => {
                         let qText = `What is the meaning of "${word.word}"?`;
                         let correctAnswer = word.meaning || "Unknown";
                         let wrongAnswers: string[] = [];

                         if (lang === 'bangla') {
                            if (cat === 'samarthok') {
                               qText = `"${word.word}" এর সমার্থক শব্দ কোনটি?`;
                            } else if (cat === 'antonym') {
                               qText = `"${word.word}" এর বিপরীত শব্দ কোনটি?`;
                            } else if (cat === 'ek_kothay') {
                               qText = `"${word.word}" এর এক কথায় প্রকাশ কোনটি?`;
                            } else {
                               qText = `"${word.word}" এর অর্থ কী?`;
                            }
                            
                            correctAnswer = word.meaning || "Unknown";
                            const allMeanings = ENGLISH_WORDS.filter(w => w.category === cat && w.language === lang).map(w => w.meaning).filter(Boolean);
                            const optionsSet = new Set<string>();
                            optionsSet.add(correctAnswer);
                            
                            let attempts = 0;
                            while (optionsSet.size < 4 && allMeanings.length >= 4 && attempts < 100) {
                               const randomMeaning = allMeanings[Math.floor(Math.random() * allMeanings.length)] || "None";
                               optionsSet.add(randomMeaning);
                               attempts++;
                            }
                            if (optionsSet.size < 4) {
                                optionsSet.add("কোনটিই নয়"); optionsSet.add("ক ও খ উভয়ই"); optionsSet.add("অন্যান্য");
                            }
                            wrongAnswers = Array.from(optionsSet).filter(o => o !== correctAnswer).slice(0, 3);

                         } else {
                            // LANGUAGE IS ENGLISH
                            if (cat === 'spelling') {
                               qText = `Choose the correct spelling:`;
                               correctAnswer = word.word;
                               
                               let parsedWrongs: string[] = [];
                               if (word.example && word.example.includes("Incorrect:")) {
                                  const parts = word.example.split("Incorrect:");
                                  if (parts.length > 1) {
                                     const incorrectStr = parts[1].trim();
                                     parsedWrongs = incorrectStr.split(/[,/;\s]+/).map(s => s.trim().replace(/[|.*?"'()]/g, "")).filter(s => s && s.toLowerCase() !== word.word.toLowerCase());
                                  }
                               }
                               
                               const generatorWrongs = generateIncorrectSpellings(word.word, 4);
                               const mergedWrongs = Array.from(new Set([...parsedWrongs, ...generatorWrongs])).filter(w => w && w.toLowerCase() !== word.word.toLowerCase());
                               wrongAnswers = mergedWrongs.slice(0, 3);

                            } else if (cat === 'synonym' || cat === 'vocabulary') {
                               qText = `What is the synonym of "${word.word}"?`;
                               
                               const maybeSyn = (word.synonyms && word.synonyms.length > 0) ? word.synonyms[0].trim() : "";
                               if (maybeSyn && !/[\u0980-\u09FF]/.test(maybeSyn)) {
                                  correctAnswer = maybeSyn;
                               } else {
                                  correctAnswer = word.word + " (Synonym)";
                                }
                               
                               const allSynonyms = ENGLISH_WORDS.filter(w => w.language === 'english' && w.category !== 'spelling' && w.synonyms && w.synonyms.length > 0)
                                  .map(w => w.synonyms![0].trim())
                                  .filter(s => s && !/[\u0980-\u09FF]/.test(s) && s.toLowerCase() !== word.word.toLowerCase() && s.toLowerCase() !== correctAnswer.toLowerCase());
                               
                               const uniqueWrongs = Array.from(new Set(allSynonyms));
                               wrongAnswers = uniqueWrongs.sort(() => Math.random() - 0.5).slice(0, 3);
                               if (wrongAnswers.length < 3) {
                                 wrongAnswers = ["Increase", "Suppress", "Prolong"].filter(w => w.toLowerCase() !== correctAnswer.toLowerCase()).slice(0, 3);
                               }

                            } else if (cat === 'antonym') {
                               qText = `What is the antonym of "${word.word}"?`;
                               
                               const maybeAnt = (word.antonyms && word.antonyms.length > 0) ? word.antonyms[0].trim() : "";
                               if (maybeAnt && !/[\u0980-\u09FF]/.test(maybeAnt)) {
                                  correctAnswer = maybeAnt;
                               } else {
                                  correctAnswer = word.word + " (Antonym)";
                               }
                               
                               const allAntonyms = ENGLISH_WORDS.filter(w => w.language === 'english' && w.category !== 'spelling' && w.antonyms && w.antonyms.length > 0)
                                  .map(w => w.antonyms![0].trim())
                                  .filter(s => s && !/[\u0980-\u09FF]/.test(s) && s.toLowerCase() !== word.word.toLowerCase() && s.toLowerCase() !== correctAnswer.toLowerCase());
                               
                               const uniqueWrongs = Array.from(new Set(allAntonyms));
                               wrongAnswers = uniqueWrongs.sort(() => Math.random() - 0.5).slice(0, 3);
                               if (wrongAnswers.length < 3) {
                                 wrongAnswers = ["Mitigate", "Diminish", "Enhance"].filter(w => w.toLowerCase() !== correctAnswer.toLowerCase()).slice(0, 3);
                               }

                            } else if (cat === 'appropriate_preposition') {
                               const parts = word.word.split(' ');
                               const prep = parts[parts.length - 1] || "by";
                               correctAnswer = prep.toLowerCase();
                               
                               let sentence = word.example ? word.example.split('(')[0].trim() : `We must ${word.word} the rules.`;
                               const regex = new RegExp(`\\b${prep}\\b`, 'i');
                               sentence = sentence.replace(regex, "___");
                               qText = `Fill in the blank with the appropriate preposition: ${sentence}`;
                               
                               const prepCandidates = ["to", "by", "for", "with", "at", "in", "of", "from", "on", "into", "upon"];
                               wrongAnswers = prepCandidates.filter(p => p !== correctAnswer).sort(() => Math.random() - 0.5).slice(0, 3);

                            } else if (cat === 'group_verb') {
                               const parts = word.word.split(' ');
                               const prep = parts[parts.length - 1] || "out";
                               correctAnswer = prep.toLowerCase();
                               
                               let sentence = word.example ? word.example.split('(')[0].trim() : `Please ${word.word} a doctor.`;
                               const regex = new RegExp(`\\b${prep}\\b`, 'i');
                               sentence = sentence.replace(regex, "___");
                               qText = `Fill in the blank with the correct word for phrasal verb: ${sentence}`;
                               
                               const particleCandidates = ["in", "off", "out", "up", "down", "with", "to", "by", "over", "away"];
                               wrongAnswers = particleCandidates.filter(p => p !== correctAnswer).sort(() => Math.random() - 0.5).slice(0, 3);

                             } else if (cat === 'idiom_phrase') {
                                qText = `What is the meaning of the idiom/phrase "${word.word}"?`;
                                
                                let englishMeaning = "";
                                if (word.example && word.example.trim() !== "") {
                                   englishMeaning = word.example.trim();
                                } else if (word.meaning && word.meaning.includes("(")) {
                                   const m = word.meaning.match(/\(([^)]+)\)/);
                                   if (m) englishMeaning = m[1].trim();
                                }
                                
                                if (englishMeaning && englishMeaning.length > 2 && !/[\u0980-\u09FF]/.test(englishMeaning)) {
                                   correctAnswer = englishMeaning;
                                } else {
                                   correctAnswer = word.word + " (Meaning)";
                                }
                                
                                const allIdiomMeanings = ENGLISH_WORDS.filter(w => w.category === 'idiom_phrase').map(w => {
                                   if (w.example && w.example.trim() !== "") return w.example.trim();
                                   if (w.meaning && w.meaning.includes("(")) {
                                      const m = word.meaning.match(/\(([^)]+)\)/);
                                      if (m) return m[1].trim();
                                   }
                                   return "";
                                }).filter(m => m && !/[\u0980-\u09FF]/.test(m) && m.toLowerCase() !== correctAnswer.toLowerCase());
                                
                                const uniqueWrongs = Array.from(new Set(allIdiomMeanings));
                                wrongAnswers = uniqueWrongs.sort(() => Math.random() - 0.5).slice(0, 3);
                                if (wrongAnswers.length < 3) {
                                  wrongAnswers = ["A difficult situation", "An easy choice", "To fail completely"].filter(w => w.toLowerCase() !== correctAnswer.toLowerCase()).slice(0, 3);
                                }

                             } else if (cat === 'translation') {
                                qText = `Choose the correct translation: "${word.word}"`;
                                correctAnswer = word.meaning;
                                
                                const allTranslations = ENGLISH_WORDS.filter(w => w.category === 'translation').map(w => w.meaning).filter(Boolean);
                                wrongAnswers = Array.from(new Set(allTranslations)).filter(t => t !== correctAnswer).sort(() => Math.random() - 0.5).slice(0, 3);

                             } else if (cat === 'analogy') {
                                qText = `Complete the analogy: ${word.word}`;
                                correctAnswer = word.meaning;
                                
                                const allAnalogies = ENGLISH_WORDS.filter(w => w.category === 'analogy').map(w => w.meaning).filter(Boolean);
                                wrongAnswers = Array.from(new Set(allAnalogies)).filter(a => a !== correctAnswer).sort(() => Math.random() - 0.5).slice(0, 3);

                             } else {
                                qText = `Choose the correct meaning for "${word.word}":`;
                                correctAnswer = word.meaning;
                                const allMeanings = ENGLISH_WORDS.filter(w => w.category === cat && w.language === lang).map(w => w.meaning).filter(Boolean);
                                wrongAnswers = Array.from(new Set(allMeanings)).filter(m => m !== correctAnswer).sort(() => Math.random() - 0.5).slice(0, 3);
                             }
                          }

                          const optionsSet = new Set<string>();
                          optionsSet.add(correctAnswer);
                          wrongAnswers.forEach(o => optionsSet.add(o));
                          
                          const extraDistractors = ["None of the above", "All of the above", "Both A and B"];
                          let extraIdx = 0;
                          while (optionsSet.size < 4 && extraIdx < extraDistractors.length) {
                             optionsSet.add(extraDistractors[extraIdx++]);
                          }
                          
                          const optionsArray = Array.from(optionsSet).slice(0, 4).sort(() => Math.random() - 0.5);
                          const correctIdx = optionsArray.indexOf(correctAnswer);
                          const correctOptStr = ["ক", "খ", "গ", "ঘ"][correctIdx >= 0 ? correctIdx : 0];

                          allQs.push({
                             id: `dyn_${originalSub}_${chapter}_${lang}_${word.id || Math.random().toString().slice(2)}`,
                             subject: originalSub,
                             chapter: chapter,
                             text: qText,
                             options: optionsArray.map((opt, i) => ({ id: ["ক", "খ", "গ", "ঘ"][i], label: opt })),
                             correctOption: correctOptStr,
                             explanation: word.example ? String(word.example) : (lang === 'bangla' ? `সঠিক উত্তর: ${correctAnswer}` : `Correct answer is: ${correctAnswer}`)
                          });
                       });
                    });
                 }
             }
          }
          
          const topicsMap: Record<string, Set<string>> = {};
          allQs.forEach(q => {
             const sub = q.subject;
             if (!sub) return;
             const qChap = q.chapter || q.chapter_name || q.topic || q.chapterName || q.chapter_no || q.title;
             const finalChap = (qChap && typeof qChap === 'string' && qChap.trim() !== '') ? qChap : "সাধারণ প্রশ্ন";
             q._computedChapter = finalChap;
             if (!topicsMap[sub]) topicsMap[sub] = new Set();
             topicsMap[sub].add(finalChap);
          });
          const topicsObj: Record<string, string[]> = {};
          Object.keys(topicsMap).forEach(k => {
             topicsObj[k] = Array.from(topicsMap[k]);
          });
          if (type === 'mock') {
              setDynamicChaptersMap(topicsObj);
          }

          let finalQs = allQs;
          
          if (type === 'mock' && mockCustomSubjects.length > 0) {
             // Chapter filtering is now moved to the subject distribution loop above/below
             finalQs = finalQs;
          }

          if (type !== 'mistakes') {
            finalQs = finalQs.sort(() => Math.random() - 0.5);
          } else {
            finalQs = finalQs.sort((a, b) => {
               const idA = a.id || "";
               const idB = b.id || "";
               return idA.localeCompare(idB, undefined, {numeric: true, sensitivity: 'base'});
            });
          }
          
          let numQuestions = 10;
          if (type === 'mock' || type === 'mistakes') {
             const counts = activeSet.split('-');
             if (counts.length >= 2 && !isNaN(parseInt(counts[1]))) {
                numQuestions = parseInt(counts[1]);
             }
          } else {
             const setList = modelSets;
             const setInfo = setList.find(s => s.id === activeSet);
             numQuestions = setInfo ? setInfo.totalQuestions : 50;
          }
          
          let selectedQs: any[] = [];
          if (type === 'mock' && mockCustomSubjects.length > 0) {
             mockCustomSubjects.forEach(sub => {
                let subQs = finalQs.filter((q:any) => isSubjectMatch(q.subject, sub));
                
                subQs = subQs.filter((q: any) => {
                    const defaultChapsForSub = topicsObj[sub] && topicsObj[sub].length > 0 ? topicsObj[sub] : (defaultChaptersMap[sub] || ["সাধারণ প্রশ্ন"]);
                    const subjectChapters = mockCustomChapters[sub] || [];
                    if (subjectChapters.length === 0) return false;
                    
                    const hasNoDefaultChapters = !defaultChaptersMap[sub] || defaultChaptersMap[sub].length === 0;
                    if (hasNoDefaultChapters && subjectChapters.includes("সাধারণ প্রশ্ন")) return true;

                    const qChapter = q._computedChapter || "সাধারণ প্রশ্ন";
                    return subjectChapters.some((c: string) => qChapter.includes(String(c)) || String(c).includes(qChapter));
                });
                
                const count = mockQuestionCounts[sub] || Math.floor(numQuestions / mockCustomSubjects.length) || 25;
                selectedQs.push(...subQs.slice(0, count));
             });
             selectedQs = selectedQs.sort(() => Math.random() - 0.5);
          } else {
             selectedQs = finalQs.slice(0, numQuestions);
          }
          
          if (!selectedQs || selectedQs.length === 0) {
             console.warn("No questions resulted from slice/filters.");
          }

          setDbQuestions((selectedQs || []).map((q: any, idx) => ({
             id: q.id || `q_${Math.random()}`,
             questionNumber: (idx + 1).toString(),
             text: q.text || "Untitled Question",
             options: Array.isArray(q.options) ? q.options : [],
             correctOption: q.correctOption || "ক",
             explanation: q.explanation || ""
          })));

        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    if (activeSet || selectedSubject) {
       loadQuestions();
    }
  }, [type, activeSet, selectedSubject, mockCustomSubjects, mockCustomChapters, mockQuestionCounts]);

  const [dbSubjects, setDbSubjects] = useState<any[]>([]);

  useEffect(() => {
    // Fetch dynamic subjects from DB so all uploaded subjects appear in Mock test
    const fetchDbSubjects = async () => {
      try {
        const snap = await getDocs(collection(db, "subjects"));
        const data: any[] = [];
        snap.forEach(doc => data.push(doc.data()));
        setDbSubjects(data);
      } catch (err) {
        console.warn("Could not fetch DB subjects", err);
      }
    };
    fetchDbSubjects();
  }, []);

  const allowedSubjects = getSubjectsForUser(userData?.class, userData?.group);

  const defaultSubjects = [
    ...subjectsByGroup["common"], 
    ...(subjectsByGroup[userData?.group] || subjectsByGroup["মানবিক"])
  ].filter(sub => {
    // English mapping handling
    const normalizedName = sub.name === "English" || sub.name === "English Grammar" ? "ইংরেজি" : sub.name;
    const isAllowed = allowedSubjects.includes(normalizedName) || allowedSubjects.includes(sub.name);
    // Let's also include "মেমোরাইজিং পার্ট", "তথ্য ও যোগাযোগ প্রযুক্তি" mapping to "ICT" etc.
    const isAllowedCustom = sub.name === "মেমোরাইজিং পার্ট" || sub.name === "তথ্য ও যোগাযোগ প্রযুক্তি";
    return isAllowed || isAllowedCustom;
  });

  const dbSubjectExtracted = dbSubjects.map(s => ({
    name: s.name,
    icon: <BookOpen className="w-[22px] h-[22px]" strokeWidth={2} />,
    color: "bg-muted hover:border-slate-200"
  })).filter(sub => {
      const normalizedName = sub.name === "English" || sub.name === "English Grammar" ? "ইংরেজি" : sub.name;
      return allowedSubjects.includes(normalizedName) || allowedSubjects.includes(sub.name);
  });

  const mergedSubjects = [...defaultSubjects];
  dbSubjectExtracted.forEach(dbSub => {
    if (!mergedSubjects.some(s => s.name === dbSub.name)) {
      mergedSubjects.push(dbSub);
    }
  });

  const displaySubjects = mergedSubjects;
  
  const handleSelect = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setSelectedOptions(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    let currentScore = 0;
    let correctQs = 0;
    let attemptedQs = 0;

    dbQuestions.forEach(q => {
      const selectedOpt = selectedOptions[q.id];
      if (selectedOpt) {
        attemptedQs++;
        if (selectedOpt === q.correctOption) {
          currentScore += 10;
          correctQs++;
        } else if (userData?.group === "এডমিশন" || userData?.group === "admission") {
          currentScore -= 2.5; // Negative marking 0.25 of total marks
        }
      }
    });
    setScore(currentScore);
    setIsSubmitted(true);

    if (userData?.uid) {
      try {
        // Update user stats
        const today = new Date();
        const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        let newStreak = userData?.progress?.streak || 0;
        let lastDate = userData?.lastExamDate;
        
        if (lastDate !== todayStr) {
           const yesterday = new Date(today);
           yesterday.setDate(yesterday.getDate() - 1);
           const yesterdayStr = yesterday.getFullYear() + '-' + String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + String(yesterday.getDate()).padStart(2, '0');
           
           if (lastDate === yesterdayStr) {
               newStreak += 1;
           } else {
               newStreak = 1; // start new streak
           }
        }

        const totalQs = dbQuestions.length;
        const prevSolved = userData?.progress?.totalSolved || 0;
        const newTotalSolved = prevSolved + attemptedQs;
        const currentAccuracy = userData?.progress?.accuracy || 0;
        const totalCorrectHistoric = (currentAccuracy / 100) * prevSolved;
        const newAccuracy = newTotalSolved > 0 ? Math.round(((totalCorrectHistoric + correctQs) / newTotalSolved) * 100) : 0;

        const timeSpentSecs = (initialTime !== null && remainingTime !== null && initialTime >= remainingTime) ? (initialTime - remainingTime) : 0;
        const timeSpentMins = Math.round(timeSpentSecs / 60);

        const userRef = doc(db, "users", userData.uid);
        await updateDoc(userRef, {
          points: increment(currentScore),
          totalExams: increment(1),
          lastExamDate: todayStr,
          "progress.streak": newStreak,
          "progress.totalSolved": newTotalSolved,
          "progress.accuracy": newAccuracy,
          "progress.totalCorrect": increment(correctQs),
          "progress.totalTimeSpent": increment(timeSpentMins)
        });
        
        // Manage mistakes subcollection
        const batch = writeBatch(db);
        let batchCount = 0;
        
        dbQuestions.forEach(q => {
          if (batchCount > 450) return; // firebase limit is 500
          const mistakeRef = doc(db, "users", userData.uid, "mistakes", q.id);
          
          // if option was selected and it's wrong -> add to mistakes
          if (selectedOptions[q.id] && selectedOptions[q.id] !== q.correctOption) {
             batch.set(mistakeRef, {
                ...q,
                failedAt: Date.now()
             });
             batchCount++;
          } 
          // if they answered correctly now, let's remove it from mistakes!
          else if (selectedOptions[q.id] === q.correctOption) {
             batch.delete(mistakeRef);
             batchCount++;
          }
        });
        
        if (batchCount > 0) {
           await batch.commit();
        }
        
        // Save test score history for trends
        await addDoc(collection(db, "users", userData.uid, "exam_results"), {
          type: type || "unknown",
          subject: selectedSubject || "Mixed",
          score: currentScore,
          total: dbQuestions.length * 10,
          timestamp: serverTimestamp()
        });

      } catch (err) {
        console.error("Error saving exam results:", err);
      }
    }
  };

  const isCorrect = (questionId: string, optionId: string) => {
    const q = dbQuestions.find((mq: any) => mq.id === questionId);
    return isSubmitted && optionId === q?.correctOption;
  };
  
  const isIncorrect = (questionId: string, optionId: string) => {
    const q = dbQuestions.find((mq: any) => mq.id === questionId);
    return isSubmitted && selectedOptions[questionId] === optionId && optionId !== q?.correctOption;
  };
  
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [initialTime, setInitialTime] = useState<number | null>(null);

  // Timer effect
  useEffect(() => {
    if (activeSet && remainingTime !== null && remainingTime > 0 && !isSubmitted) {
      const timerId = setInterval(() => {
        setRemainingTime(prev => prev! - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (remainingTime === 0 && !isSubmitted) {
       handleSubmit();
    }
  }, [activeSet, remainingTime, isSubmitted]);

  // Handle active set timer
  useEffect(() => {
      if(activeSet) {
          if (type === 'mock') {
              const counts = activeSet.split('-');
              if (counts.length >= 3 && !isNaN(parseInt(counts[2]))) {
                  const t = parseInt(counts[2]) * 60;
                  setRemainingTime(t);
                  setInitialTime(t);
              } else if (counts.length >= 2 && !isNaN(parseInt(counts[1]))) {
                  const numQ = parseInt(counts[1]);
                  const t = numQ * 60;
                  setRemainingTime(t); // 1 minute per question fallback
                  setInitialTime(t);
              }
          } else if (type === 'model') {
              const setInfo = dynamicModelSets.find(s => s.id === activeSet);
              if(setInfo) {
                  const t = setInfo.timeMinutes * 60;
                  setRemainingTime(t);
                  setInitialTime(t);
              }
          }
      } else {
          setRemainingTime(null);
          setInitialTime(null);
      }
  }, [activeSet, dynamicModelSets, type]);

  const formatTime = (timeInSeconds: number | null) => {
      if(timeInSeconds === null) return "00:00";
      const m = Math.floor(timeInSeconds / 60);
      const s = timeInSeconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timeLeft = formatTime(remainingTime);

  const toggleChapExpand = (sub: string) => {
    setExpandedChaps(p => ({...p, [sub]: !p[sub]}));
  };

  if (type === 'mock' && !activeSet) {
    if (mockStep === 1) {
      return (
        <div className="w-full max-w-7xl mx-auto pb-32 px-4 sm:px-6 md:px-8 pt-8 font-bengali min-h-screen bg-background">
          {/* Centered High Fidelity Card */}
          <div className="max-w-xl mx-auto bg-card p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.015)] space-y-6">
            
            {/* Top Back bar */}
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate("/dashboard")} 
                  className="h-10 w-10 bg-muted hover:bg-slate-100 active:scale-95 border border-slate-200/50 rounded-full flex items-center justify-center text-slate-700 transition-all shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 animate-in fade-in" />
                </button>
                <span className="text-[19px] sm:text-xl font-extrabold text-foreground font-bengali">টপিক সিলেক্ট করো</span>
              </div>
              <div className="bg-[#e4efe9] text-[#008060] px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide">১/২ স্টেপস</div>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-2">
              <div className="h-1.5 flex-1 bg-[#008060] rounded-full"></div>
              <div className="h-1.5 flex-1 bg-slate-100 rounded-full"></div>
            </div>

            {/* Sub-header instruction */}
            <div className="font-bengali">
              <h2 className="text-[18px] sm:text-xl font-extrabold text-slate-900 leading-snug">যে বিষয়গুলো পড়তে চাও,</h2>
              <p className="text-sm font-bold text-slate-400 mt-1">সেগুলো ট্যাপ করে টিক চিহ্নে সিলেক্ট করো</p>
            </div>

            {/* Subject List displaying */}
            <div className="space-y-3.5">
               {displaySubjects.map(sub => {
                  const isSelected = mockCustomSubjects.includes(sub.name);
                  const deco = getSubjectDecoration(sub.name);
                  return (
                    <div 
                      key={sub.name}
                      onClick={() => {
                         if (!isSelected) {
                            setMockCustomSubjects(prev => [...prev, sub.name]);
                            setMockCustomChapters(prev => ({...prev, [sub.name]: []}));
                            setExpandedChaps(prev => ({...prev, [sub.name]: true}));
                         } else {
                            setMockCustomSubjects(prev => prev.filter(s => s !== sub.name));
                            setMockCustomChapters(prev => { const n = {...prev}; delete n[sub.name]; return n; });
                         }
                      }}
                      className={`group relative flex items-center justify-between p-4 bg-card border rounded-2xl cursor-pointer select-none transition-all duration-300 ${isSelected ? 'border-[#008060] ring-1 ring-[#008060] shadow-sm bg-emerald-50/5' : 'border-slate-150 hover:border-slate-300 hover:bg-muted/40'}`}
                    >
                      {/* Left: Checkmark box and name */}
                      <div className="flex items-center gap-3.5">
                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${isSelected ? 'bg-[#008060] border-[#008060] scale-105 shadow-sm' : 'border-slate-300 bg-card group-hover:border-slate-400'}`}>
                          {isSelected && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                        </div>
                        
                        <div className={`flex items-center justify-center h-10 w-10 rounded-xl font-bold ${deco.leftBg} ${deco.leftText}`}>
                          {deco.leftIn}
                        </div>
                        
                        <div>
                          <span className={`text-[16px] font-extrabold text-foreground transition-colors ${isSelected ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>{sub.name}</span>
                          <p className="text-[11px] text-slate-400 font-medium">পরীক্ষামুখী বিশেষ অধ্যায়সমূহ</p>
                        </div>
                      </div>
                      
                      {/* Right: Tiny dynamic illustration */}
                      <div className="opacity-85 group-hover:opacity-100 transition-opacity shrink-0">
                        {deco.rightIllustration}
                      </div>
                    </div>
                  );
               })}
            </div>

            {/* Expandable Chapters section */}
            {mockCustomSubjects.length > 0 && (
               <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 pt-4 border-t border-slate-100">
                  <div className="font-extrabold text-foreground text-[16px]">সিলেক্টেড বিষয়ের অধ্যায়সমূহ:</div>
                  {mockCustomSubjects.map(subject => {
                     const availableChapters = dynamicChaptersMap[subject] && dynamicChaptersMap[subject].length > 0 ? dynamicChaptersMap[subject] : (defaultChaptersMap[subject] || ["সাধারণ প্রশ্ন"]);
                     const subjectChapters = mockCustomChapters[subject] || [];
                     const isExpanded = expandedChaps[subject] !== false; // default to true
                     const isAllSelected = availableChapters.length > 0 && subjectChapters.length === availableChapters.length;
                     
                     return (
                       <div key={subject} className="bg-muted/50 rounded-2xl border border-slate-150 overflow-hidden">
                          {/* Subject Header */}
                          <div className="p-3.5 flex items-center gap-3 justify-between bg-muted">
                             <div className="flex items-center gap-2.5">
                               <button 
                                 onClick={() => {
                                   setTopicError("");
                                   if (isAllSelected) {
                                      setMockCustomChapters(prev => ({...prev, [subject]: []}));
                                   } else {
                                      setMockCustomChapters(prev => ({...prev, [subject]: [...availableChapters]}));
                                   }
                                 }}
                                 className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isAllSelected ? 'bg-[#008060] border-[#008060]' : 'bg-card border-slate-300'}`}
                               >
                                  {isAllSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                               </button>
                               <span className="font-extrabold text-foreground text-sm">{subject}</span>
                             </div>
                             
                             <div className="flex items-center gap-2">
                               <span className="text-xs font-bold text-slate-500 bg-slate-200/50 px-2 py-1 rounded-md">{subjectChapters.length}/{availableChapters.length} চ্যাপ্টার</span>
                               <button onClick={() => toggleChapExpand(subject)} className="p-1 hover:bg-slate-200/50 rounded-full transition-colors">
                                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                               </button>
                             </div>
                          </div>
                          
                          {/* Chapters Accordion Content */}
                          {isExpanded && (
                             <div className="px-3 pb-3.5 bg-card space-y-1.5 border-t border-slate-150/40 pt-3 max-h-48 overflow-y-auto">
                                {availableChapters.map(chap => {
                                   const chapSelected = subjectChapters.includes(chap);
                                   return (
                                     <div 
                                       key={chap} 
                                       onClick={() => {
                                           setTopicError("");
                                           setMockCustomChapters(prev => {
                                               const current = prev[subject] || [];
                                               const updated = current.includes(chap) ? current.filter(c => c !== chap) : [...current, chap];
                                               return {...prev, [subject]: updated};
                                           });
                                       }}
                                       className="flex items-center bg-muted/30 border border-slate-100 hover:border-slate-200 p-2.5 rounded-xl hover:bg-muted/80 transition-colors cursor-pointer select-none"
                                     >
                                        <div
                                          className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition-all ${chapSelected ? 'bg-[#008060] border-[#008060]' : 'bg-card border-slate-300'}`}
                                        >
                                           {chapSelected && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                                        </div>
                                        <span className={`text-[13.5px] font-bold leading-snug ml-2.5 flex-1 ${chapSelected ? 'text-foreground' : 'text-slate-500'}`}>{chap}</span>
                                     </div>
                                   )
                                })}
                             </div>
                          )}
                       </div>
                     );
                  })}
               </div>
            )}

            {/* Custom Questions count selectors */}
            {mockCustomSubjects.length > 0 && (
              <div className="space-y-3 pt-2">
                 <div className="flex items-center justify-between gap-3 bg-muted border border-slate-150 rounded-2xl p-4.5">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-foreground text-sm">প্রশ্ন সংখ্যা নির্ধারণ করো</span>
                      <p className="text-[11px] text-slate-400 font-bold">মোট কয়টি প্রশ্নের উত্তর দিবে</p>
                    </div>
                    <div className="flex items-center border border-slate-200 bg-card rounded-xl overflow-hidden shadow-xs h-10 px-1">
                      <button 
                        onClick={() => setMockCustomQCount(prev => Math.max(5, prev - 5))}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-muted rounded-lg active:scale-90 font-extrabold transition-all"
                      >
                        -
                      </button>
                      <input 
                         type="number" 
                         value={mockCustomQCount} 
                         onChange={(e) => setMockCustomQCount(parseInt(e.target.value) || 25)} 
                         className="w-12 text-center bg-transparent border-none outline-none font-extrabold text-foreground text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button 
                        onClick={() => setMockCustomQCount(prev => Math.min(100, prev + 5))}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-muted rounded-lg active:scale-90 font-extrabold transition-all"
                      >
                        +
                      </button>
                    </div>
                 </div>

                 {topicError && (
                    <div className="text-[#008060] bg-emerald-50 border border-emerald-200/50 p-3 rounded-xl font-bold text-xs text-center animate-in fade-in">
                       {topicError}
                    </div>
                 )}

                 {/* Premium next button */}
                 <button 
                    onClick={() => {
                       setTopicError("");
                       const canProceed = mockCustomSubjects.length > 0 && mockCustomSubjects.every(s => (mockCustomChapters[s] || []).length > 0);
                       if (!canProceed) {
                          setTopicError("অনুগ্রহ করে প্রতিটি বিষয়ের জন্য অন্তত একটি অধ্যায় সিলেক্ট করো।");
                          return;
                       }
                       if (mockCustomSubjects.length > 0) {
                         const newCounts = { ...mockQuestionCounts };
                         mockCustomSubjects.forEach(s => {
                            if (!newCounts[s]) newCounts[s] = Math.ceil(mockCustomQCount / mockCustomSubjects.length);
                         });
                         setMockQuestionCounts(newCounts);
                         setMockStep(2);
                       }
                    }}
                    className="w-full py-4 bg-[#008060] cursor-pointer text-white font-extrabold rounded-2xl hover:bg-[#006e52] hover:shadow-md transition-all active:scale-98 text-center text-[16px] tracking-wide"
                 >
                    পরবর্তী →
                 </button>
              </div>
            )}
          </div>
        </div>
      );
    } else if (mockStep === 2) {
      return (
        <div className="w-full max-w-7xl mx-auto pb-40 relative z-0 min-h-screen bg-background animate-in fade-in slide-in-from-right-4 font-bengali">
          <div className="flex items-center justify-between mb-8 px-4 sm:px-6 pt-6">
            <div className="flex items-center gap-4">
               <button 
                  onClick={() => setMockStep(1)} 
                  className="w-11 h-11 bg-card rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 hover:bg-muted transition-colors"
               >
                 <ArrowLeft className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
               </button>
               <span className="text-[22px] font-extrabold text-[#1E2B4C] select-none">নিশ্চিত করো</span>
            </div>
            <div className="bg-[#E6F4EA] text-[#008060] px-3.5 py-1.5 rounded-full text-[13px] font-black tracking-wide select-none">২/২ স্টেপস</div>
          </div>

          {/* Progress Lines */}
          <div className="flex gap-2 mb-10 items-center px-4 sm:px-6">
              <div className="h-1.5 flex-1 bg-[#008060] rounded-full"></div>
              <div className="h-1.5 flex-1 bg-[#008060] rounded-full"></div>
          </div>

          <div className="px-4 sm:px-6 space-y-4">
             {/* Heading */}
             <div className="mb-6">
                 <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-1.5 h-[22px] bg-[#008060] rounded-full"></div>
                      <h2 className="text-[19px] sm:text-[20px] font-extrabold text-[#1E2B4C] select-none">সিলেক্টেড বিষয় ({mockCustomSubjects.length})</h2>
                 </div>
                 <p className="text-slate-500 text-[13px] sm:text-[14px] ml-4 select-none">যে বিষয় নিয়ে পরীক্ষা দিতে চান সেটিই সিলেক্ট করুন</p>
             </div>
             
             {/* Cards */}
             <div className="flex flex-col gap-4">
                {mockCustomSubjects.map(sub => (
                   <div key={sub} className="bg-card p-4 sm:p-5 rounded-[20px] border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
                       <div className="flex items-center gap-4 sm:gap-5">
                           <div className="w-16 h-16 rounded-full bg-[#E6F4EA] flex items-center justify-center relative shrink-0">
                               <div className="w-8 h-8 grid grid-cols-2 grid-rows-2 gap-[2px]">
                                   <div className="bg-[#008060] rounded flex items-center justify-center text-white font-extrabold text-[12px] pb-[1px]">+</div>
                                   <div className="bg-[#008060] rounded flex items-center justify-center text-white font-extrabold text-[12px] pb-[1px]">-</div>
                                   <div className="bg-[#008060] rounded flex items-center justify-center text-white font-extrabold text-[12px] pb-[1px]">×</div>
                                   <div className="bg-[#008060] rounded flex items-center justify-center text-white font-extrabold text-[12px] pb-[1px]">=</div>
                               </div>
                               <div className="absolute top-1 right-1 w-1 h-1 bg-amber-400 rounded-full"></div>
                               <div className="absolute bottom-2 -left-1 w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                               <div className="absolute top-4 -right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full pointer-events-none"></div>
                           </div>
                           <div>
                               <div className="font-extrabold text-[#1E2B4C] text-[16px] sm:text-[17px] mb-2">{sub}</div>
                               <div className="border border-slate-200 rounded-[10px] flex items-center bg-card overflow-hidden w-fit shadow-sm h-9">
                                   <input 
                                       type="number" 
                                       value={mockQuestionCounts[sub] || 25} 
                                       onChange={(e) => setMockQuestionCounts(p => ({...p, [sub]: parseInt(e.target.value) || 0}))} 
                                       className="bg-transparent border-none outline-none font-extrabold text-[#008060] text-[16px] w-[46px] text-center h-full appearance-none m-0 p-0"
                                   />
                                   <div className="w-[1px] h-[50%] bg-slate-200"></div>
                                   <div className="bg-card flex items-center text-muted-foreground font-bold px-2.5 h-full text-[13px]">
                                       মিনিট <ChevronDown className="w-3.5 h-3.5 ml-1 text-foreground" strokeWidth={3} />
                                   </div>
                               </div>
                           </div>
                       </div>
                       
                       <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-[#f2fcf5] flex items-center justify-center shrink-0 border border-emerald-50">
                              <div className="w-7 h-7 rounded-full bg-[#008060] flex items-center justify-center text-white shadow-sm">
                                  <Check className="w-4 h-4" strokeWidth={3} />
                              </div>
                          </div>
                          <div className="absolute top-0 right-[-4px] w-1 h-1 bg-amber-400 rounded-full"></div>
                          <div className="absolute bottom-1 left-[-4px] w-1 h-1 bg-amber-400 rounded-full"></div>
                          <div className="absolute top-6 left-[-10px] w-1 h-1 bg-[#008060] rounded-full"></div>
                       </div>
                   </div>
                ))}
             </div>

             <div className="bg-card rounded-[20px] border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-4 flex items-center justify-between cursor-pointer hover:bg-muted mt-2 transition-colors" onClick={() => {
                setMockStep(1);
                setShowChaptersAccordion(true);
             }}>
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-[14px] bg-[#E6F4EA] flex items-center justify-center shrink-0">
                         <FileEdit className="w-5 h-5 text-[#008060]" />
                    </div>
                    <div>
                         <div className="font-extrabold text-[#1E2B4C] text-[14px] sm:text-[15px] mb-0.5">সিলেক্টেড টপিকস দেখতে এখানে ট্যাপ করো</div>
                         <div className="text-slate-500 text-[12px]">সিলেবাস থেকে টপিকস দেখে নিতে পারবেন</div>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" strokeWidth={2.5} />
             </div>
          </div>
          
          {/* Bottom Card Area */}
          <div className="fixed sm:static bottom-0 left-0 w-full sm:mt-10 p-4 sm:px-6 z-20 flex justify-center pb-6">
              <div className="w-full max-w-7xl mx-auto bg-card p-4 rounded-[28px] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] sm:shadow-[0_4px_30px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col gap-3.5">
                  <div className="bg-[#f8fafc] rounded-[20px] px-4 py-3.5 flex items-center justify-between border border-slate-100/60 relative overflow-hidden h-[68px]">
                       <div className="flex items-center gap-3 relative z-10 pl-1">
                            <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center shadow-sm border border-slate-100">
                                 <Clock className="w-4 h-4 text-[#008060]" strokeWidth={2.5} />
                            </div>
                            <span className="font-extrabold text-[#1E2B4C] text-[16px]">মোট সময়</span>
                       </div>
                       <div className="flex items-center gap-1.5 relative z-10 pr-2">
                            <span className="font-extrabold text-[#008060] text-xl">২৫</span>
                            <span className="font-extrabold text-[#008060] text-[16px]">মিনিট</span>
                       </div>
                       <div className="absolute right-[-4px] sm:right-4 top-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none">
                            <Timer className="w-20 h-20 text-[#008060]" strokeWidth={2} />
                       </div>
                  </div>

                  <button 
                       onClick={() => {
                           const totalQ = Object.values(mockQuestionCounts).reduce((a,b) => a+b, 0);
                           setActiveSet(`mock-${totalQ}-25`);
                       }}
                       className="w-full h-[56px] cursor-pointer bg-[#008060] text-white font-extrabold rounded-[20px] hover:bg-[#007050] transition-colors active:scale-[0.98] text-[17px] flex items-center justify-center gap-2 relative overflow-hidden"
                  >
                       <div className="absolute left-6 top-1/2 -translate-y-1/2 flex gap-1.5 opacity-20 pointer-events-none">
                            <div className="flex flex-col gap-1.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-card"></div>
                                 <div className="w-1.5 h-1.5 rounded-full bg-card"></div>
                                 <div className="w-1.5 h-1.5 rounded-full bg-card"></div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-card"></div>
                                 <div className="w-1.5 h-1.5 rounded-full bg-card"></div>
                                 <div className="w-1.5 h-1.5 rounded-full bg-card"></div>
                            </div>
                       </div>

                       <span>পরীক্ষা শুরু করো</span>
                       <ArrowRight className="w-5 h-5 ml-1" strokeWidth={2.5} />

                       <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-1.5 opacity-20 transform scale-x-[-1] pointer-events-none">
                            <div className="flex flex-col gap-1.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-card"></div>
                                 <div className="w-1.5 h-1.5 rounded-full bg-card"></div>
                                 <div className="w-1.5 h-1.5 rounded-full bg-card"></div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-card"></div>
                                 <div className="w-1.5 h-1.5 rounded-full bg-card"></div>
                                 <div className="w-1.5 h-1.5 rounded-full bg-card"></div>
                            </div>
                       </div>
                  </button>
              </div>
          </div>
        </div>
      )
    }
  }

  // Screen 2: Test Sets Selection
  if (!activeSet) {
    if (type === 'model') {
       return (
         <div className="max-w-2xl mx-auto py-8 px-4 relative z-0 bg-[#F8FAFC]">
           {/* Top Navigation Bar Mockup */}
           <div className="flex items-center justify-between mb-8">
              {/* Back Button */}
              <button 
                 onClick={() => navigate("/dashboard")} 
                 className="w-11 h-11 rounded-2xl bg-card border border-slate-100 shadow-sm hover:shadow flex items-center justify-center text-muted-foreground hover:text-slate-900 transition-all active:scale-95 cursor-pointer"
              >
                 <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Capsule Handle */}
              <div className="w-16 h-1.5 bg-slate-200 rounded-full"></div>

              {/* Bell Button */}
              <div className="w-11 h-11 rounded-2xl bg-card border border-slate-100 shadow-sm flex items-center justify-center text-muted-foreground relative">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                 </svg>
                 <span className="absolute top-[12px] right-[12px] w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white"></span>
              </div>
           </div>

           {/* Header Row */}
           <div className="flex flex-row items-center justify-between gap-2 sm:gap-6 mb-8 mt-4 text-left">
              <div className="flex-1 mt-2">
                 <h1 className="text-[32px] sm:text-[40px] font-bengali font-extrabold text-[#0C1E36] leading-tight select-none whitespace-nowrap">
                    মডেল টেস্ট
                 </h1>
                 <h2 className="text-[32px] sm:text-[40px] font-bengali font-extrabold text-[#EC9D00] mt-1 leading-none select-none whitespace-nowrap">
                    অনুশীলন
                 </h2>
                 <div className="flex items-center justify-start gap-1.5 sm:gap-2 mt-4 text-[#008060] font-bold font-bengali">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#008060] shrink-0" strokeWidth={2.5} />
                    <span className="text-[12px] sm:text-[15px] tracking-wide">সাফল্যের পথে এক ধাপ এগিয়ে</span>
                 </div>
              </div>
              
              {/* Clipboard Illustration */}
              <div className="relative w-36 h-36 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center select-none pointer-events-none -mr-2 sm:mr-0">
                 {/* Soft backdrop circle */}
                 <div className="absolute w-28 h-28 sm:w-40 sm:h-40 bg-[#E6F4EA] rounded-full blur-[8px] -z-10 opacity-80"></div>
                 <div className="absolute w-24 h-24 sm:w-36 sm:h-36 bg-[#ECFDF5] rounded-full -z-10"></div>
                 
                 {/* Floating accents */}
                 <div className="absolute top-2 left-4 sm:left-6 text-emerald-400 animate-pulse">
                    <svg width="12" height="12" className="sm:w-[14px] sm:h-[14px]" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/>
                    </svg>
                 </div>
                 <div className="absolute bottom-6 right-2 sm:right-4 text-emerald-300">
                    <svg width="14" height="14" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/>
                    </svg>
                 </div>
                 <div className="absolute top-1/2 right-2 sm:right-4 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-indigo-200 rounded-full"></div>
                 <div className="absolute bottom-8 left-2 sm:left-4 text-[#008060] font-black text-sm sm:text-lg select-none pointer-events-none">+</div>

                 {/* Premium SVG Clipboard */}
                 <svg viewBox="0 0 200 200" fill="none" className="w-[100px] h-[100px] sm:w-[125px] sm:h-[125px] drop-shadow-md">
                    {/* Clipboard template back */}
                    <rect x="42" y="32" width="116" height="136" rx="14" fill="white" stroke="#008060" strokeWidth="4" />
                    {/* Clipboard top clip */}
                    <path d="M86 32V25c0-1.6 1.4-3 3-3h22c1.6 0 3 1.4 3 3v7" fill="#0C1E36" />
                    <circle cx="100" cy="25" r="3" fill="white" />
                    
                    {/* Checklist 1 */}
                    <rect x="58" y="60" width="16" height="16" rx="4" fill="#E6F4EA" stroke="#008060" strokeWidth="2" />
                    <path d="M62 67l2.5 2.5 4.5-4.5" stroke="#008060" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="84" y1="68" x2="136" y2="68" stroke="#0C1E36" strokeWidth="4.5" strokeLinecap="round" />
                    
                    {/* Checklist 2 */}
                    <rect x="58" y="90" width="16" height="16" rx="4" fill="#E6F4EA" stroke="#008060" strokeWidth="2" />
                    <path d="M62 97l2.5 2.5 4.5-4.5" stroke="#008060" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="84" y1="98" x2="136" y2="98" stroke="#0C1E36" strokeWidth="4.5" strokeLinecap="round" />
                    
                    {/* Checklist 3 */}
                    <rect x="58" y="120" width="16" height="16" rx="4" fill="#E6F4EA" stroke="#008060" strokeWidth="2" />
                    <path d="M62 127l2.5 2.5 4.5-4.5" stroke="#008060" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="84" y1="128" x2="136" y2="128" stroke="#0C1E36" strokeWidth="4.5" strokeLinecap="round" />
                    
                    {/* Stylized pencil */}
                    <g transform="translate(142, 106) rotate(-28)">
                       <rect x="0" y="0" width="11" height="46" rx="2.5" fill="#008060" />
                       <rect x="4" y="0" width="3" height="46" fill="#059669" />
                       <path d="M0 0 L5.5 -10 L11 0 Z" fill="#FBBF24" />
                       <path d="M3.5 -6 L5.5 -10 L7.5 -6 Z" fill="#0C1E36" />
                       <rect x="0" y="41" width="11" height="5" rx="1" fill="#E2E8F0" />
                    </g>
                 </svg>
              </div>
           </div>



           {/* Cards List */}
           <div className="flex flex-col gap-4 mb-8">
             {dynamicModelSets.map((set, idx) => {
                const bnIdx = (idx + 1).toString().padStart(2, '0').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
                return (
                   <motion.div
                      key={set.id}
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                         if (set.isAdminExam) {
                            navigate(`/public-exam/${set.id}`);
                         } else {
                            setActiveSet(set.id);
                         }
                      }}
                      className="cursor-pointer bg-card border border-[#F1F5F9] hover:border-emerald-200 hover:shadow-md shadow-sm rounded-3xl p-4 flex items-center justify-between group transition-all"
                   >
                      <div className="flex items-center gap-4">
                         {/* Mint Green Document Backdrop */}
                         <div className="relative shrink-0 w-14 h-14 rounded-2xl bg-[#E6F4EA] flex items-center justify-center border border-emerald-50">
                            {/* Document Pencil SVG */}
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#008060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                               <polyline points="14 2 14 8 20 8" />
                               <line x1="16" y1="13" x2="8" y2="13" strokeWidth="1.5" />
                               <line x1="16" y1="17" x2="8" y2="17" strokeWidth="1.5" />
                            </svg>
                            {/* Numerical mini-badge */}
                            <div className="absolute -bottom-1 -left-1 w-[22px] h-[22px] rounded-full bg-[#008060] text-white font-bold text-[11px] flex items-center justify-center shadow-md border-2 border-white pl-0.5 pt-0.5">
                               {bnIdx}
                            </div>
                         </div>

                         <div className="text-left pl-1">
                            <h3 className="text-[16px] sm:text-[18px] font-bengali font-bold text-[#1E2B4C] mb-1.5 group-hover:text-[#008060] transition-colors leading-tight">
                                {set.title}
                            </h3>
                            <div className="flex items-center gap-3 text-slate-400 font-bengali text-xs">
                               <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{
                                     set.timeMinutes >= 60 
                                         ? `${Math.floor(set.timeMinutes / 60)} ঘণ্টা ${set.timeMinutes % 60 > 0 ? `${set.timeMinutes % 60} মিনিট` : ''}`.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)])
                                         : `${set.timeMinutes} মিনিট`.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)])
                                  }</span>
                               </div>
                               <span className="text-slate-300">|</span>
                               <div className="flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{set.totalQuestions.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)])} নম্বর</span>
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Accent Chevron Circle Button */}
                      <div className="w-10 h-10 rounded-full bg-[#E6F4EA] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-all">
                         <ChevronRight className="w-5 h-5 text-[#008060] stroke-[2.5]" />
                      </div>
                   </motion.div>
                );
             })}
           </div>

           {/* Padding to prevent content from hiding behind fixed nav */}
           <div className="h-28" />

           {/* Mobile Prototype Bottom Navigation Menu */}
           <div className="fixed bottom-6 left-0 right-0 z-50 px-4 pointer-events-none">
             <div className="pointer-events-auto border-t-0 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-[32px] p-3 flex justify-around items-center gap-2 max-w-[400px] mx-auto border border-slate-100">
              <div className="flex flex-col items-center gap-1.5 cursor-pointer text-[#008060]">
                 <div className="px-3 py-1 rounded-xl bg-[#E6F4EA] flex items-center justify-center">
                    <BookOpen className="w-5 h-5" strokeWidth={2.5} />
                 </div>
                 <span className="text-xs font-bengali font-bold select-none">মডেল টেস্ট</span>
              </div>
              <div className="flex flex-col items-center gap-1 cursor-pointer text-slate-400 hover:text-muted-foreground transition-colors" onClick={() => navigate("/leaderboard")}>
                 <div className="p-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <line x1="18" y1="20" x2="18" y2="10" />
                       <line x1="12" y1="20" x2="12" y2="4" />
                       <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                 </div>
                 <span className="text-xs font-bengali font-medium select-none">পারফরম্যান্স</span>
              </div>
              <div className="flex flex-col items-center gap-1 cursor-pointer text-slate-400 hover:text-muted-foreground transition-colors" onClick={() => navigate("/dashboard")}>
                 <div className="p-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                 </div>
                 <span className="text-xs font-bengali font-medium select-none">সেভড</span>
              </div>
              <div className="flex flex-col items-center gap-1 cursor-pointer text-slate-400 hover:text-muted-foreground transition-colors" onClick={() => navigate("/profile")}>
                 <div className="p-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                       <circle cx="12" cy="7" r="4" />
                    </svg>
                 </div>
                 <span className="text-xs font-bengali font-medium select-none">প্রোফাইল</span>
              </div>
            </div>
          </div>
        </div>
       );
    }

    return (
      <div className="max-w-4xl mx-auto py-12 px-4 relative z-0">
        <button 
          onClick={() => navigate("/dashboard")} 
          className="absolute top-4 left-4 sm:top-6 sm:left-4 flex items-center text-muted-foreground font-bengali font-bold hover:text-slate-900 transition-colors z-50 cursor-pointer p-2 bg-card/50 backdrop-blur-sm rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 mr-1.5" /> ফিরে যান
        </button>
        <div className="text-center mb-12 mt-8">
          <h2 className="text-3xl font-bengali font-bold text-foreground mb-4">{pageTitle}</h2>



          <p className="text-slate-500 font-bengali text-lg max-w-xl mx-auto">
            {pageDesc}
          </p>
        </div>

        {type === 'mistakes' && (
          <div className="max-w-xl mx-auto bg-card p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden text-center">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-rose-400"></div>
             <h3 className="text-2xl font-bengali font-bold text-foreground mb-6">ভুলগুলোর প্র্যাকটিস</h3>
             <p className="font-bengali text-slate-500 mb-8">যে প্রশ্নগুলো আগে পরীক্ষা দিতে গিয়ে ভুল হয়েছে, সেগুলো পুনরায় অনুশীলন করো। সর্বোচ্চ ২০টি প্রশ্ন দেয়া হবে।</p>
             <button 
                onClick={() => setActiveSet(`mistakes-20`)}
                className="bg-red-500 text-white font-bengali font-bold px-8 py-4 rounded-2xl hover:bg-red-600 transition-colors shadow-md cursor-pointer"
             >
                শুরু করুন
             </button>
          </div>
        )}
      </div>
    );
  }

  // Determine initial time text
  let initialTimeText = "২৫ মিনিট";
  if (type === 'mock') {
      const counts = activeSet?.split('-') || [];
      if (counts.length >= 3 && !isNaN(parseInt(counts[2]))) {
          initialTimeText = parseInt(counts[2]).toLocaleString('bn-BD') + " মিনিট";
      } else if (counts.length >= 2 && !isNaN(parseInt(counts[1]))) {
          initialTimeText = parseInt(counts[1]).toLocaleString('bn-BD') + " মিনিট";
      }
  } else if (type === 'model') {
      const setInfo = dynamicModelSets.find(s => s.id === activeSet);
      if (setInfo) {
          initialTimeText = setInfo.timeMinutes.toLocaleString('bn-BD') + " মিনিট";
      }
  } else if (type === 'mistakes') {
      initialTimeText = "আনলিমিটেড";
  }

  const cleanOptionText = (text: any) => {
    if (typeof text !== 'string') return text;
    let cleaned = text.replace(/\s*-\s*বিগত পাবলিক পরীক্ষার আসা প্রশ্ন ভিত্তিক/g, '');
    cleaned = cleaned.replace(/\s*\([^)]*(BCS|GRE|Level|Job|Bank|DU|JU|RU|Unit|Medical|বিগত)[^)]*\)/gi, '');
    return cleaned.trim();
  };

  // Screen 3: Exam Player
  return (
    <div className={`w-full flex flex-col font-bengali ${!isSubmitted ? 'pb-24' : 'pb-20'}`}>
      {/* Top Section */}
      <div className="w-full bg-card py-3.5 sm:py-5 px-4 sm:px-8 mb-6 sm:mb-10 text-center relative border-b border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button 
               onClick={() => { setActiveSet(null); setIsSubmitted(false); setSelectedOptions({}); setRemainingTime(null); }}
               className="w-10 h-10 -ml-2 rounded-full hover:bg-muted flex items-center justify-center transition-colors relative z-10"
            >
               <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none w-full px-12">
              <h2 className="text-[19px] sm:text-[22px] font-bold text-slate-900 leading-tight">
                {type === 'mock' ? 'মক পরীক্ষা' : type === 'mistakes' ? 'ভুলগুলোর প্র্যাকটিস' : 'মডেল টেস্ট'}
              </h2>
              {remainingTime !== null && (
                <p className="text-slate-500 font-medium text-[13.5px] sm:text-[14px] mt-0.5">
                  সময়: <span className="font-mono font-bold text-slate-700">{initialTimeText}</span>
                </p>
              )}
            </div>
            <div className="w-10 h-10"></div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        {/* Main Question Area */}
        <main className="bg-transparent overflow-visible mb-8 flex-1 flex flex-col pt-2 sm:pt-4 md:pt-6">
        
        {isSubmitted && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-gradient-to-br from-[#ebfcf0] to-[#f4fdf6] border border-[#aae1c2] rounded-[32px] p-8 text-center shadow-sm"
          >
            <h3 className="text-2xl font-bold font-bengali text-[#0e5c2f] mb-3">পরীক্ষা সম্পন্ন হয়েছে!</h3>
            <div className="flex justify-center flex-wrap gap-4 mt-6">
              <div className="bg-card rounded-2xl p-5 shadow-sm min-w-[140px] border border-[#d1f0df]">
                <p className="text-sm font-bengali text-slate-500 mb-1">মোট প্রশ্ন</p>
                <p className="text-4xl font-mono font-bold text-foreground">{dbQuestions.length}</p>
              </div>
              <div className="bg-card rounded-2xl p-5 shadow-sm min-w-[140px] border border-[#d1f0df]">
                <p className="text-sm font-bengali text-slate-500 mb-1">সঠিক উত্তর</p>
                <p className="text-4xl font-mono font-bold text-[#147e42]">{score / 10}</p>
              </div>
              <div className="bg-card rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(249,115,22,0.3)] min-w-[140px] border border-orange-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-500"></div>
                <p className="text-sm font-bengali text-slate-500 mb-1">প্রাপ্ত পয়েন্ট</p>
                <p className="text-4xl font-mono font-bold text-orange-500">+{score}</p>
              </div>
            </div>
            <p className="font-bengali text-sm text-[#147e42] mt-6 bg-[#d1f0df]/50 inline-block px-4 py-2 rounded-full border border-[#b2e7ca]/50">
              আপনার পয়েন্টগুলো লিডারবোর্ডে যুক্ত করা হয়েছে। লিডারবোর্ডে আপনার অবস্থান দেখুন!
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => {
                  setActiveSet(null); 
                  setIsSubmitted(false); 
                  setSelectedOptions({}); 
                  setRemainingTime(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bengali font-bold px-8 py-5.5 h-12 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm border-0"
              >
                <ArrowLeft className="w-5 h-5" /> সেট তালিকায় ফিরে যান
              </Button>
            </div>
          </motion.div>
        )}

        <div className="space-y-12">
          {isLoading ? (
             <div className="text-center py-20">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
               <p className="text-slate-500 font-bengali">প্রশ্ন লোড হচ্ছে...</p>
             </div>
          ) : dbQuestions.length === 0 ? (
             <div className="text-center py-20">
               <p className="text-slate-500 font-bengali">কোনো প্রশ্ন পাওয়া যায়নি।</p>
             </div>
          ) : (
         <>
        <div className="space-y-6 sm:space-y-8">
          {dbQuestions.map((q, idx) => (
            <div key={q.id ? `q_${q.id}_${idx}` : `q_fallback_${idx}`} className="question-block bg-card rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
               {/* Question Header */}
               <div className="mb-6">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs md:text-sm font-bold tracking-wide">
                     প্রশ্ন {q.questionNumber}
                   </div>
                 </div>
                 <h2 className="text-[17px] md:text-xl font-bengali font-bold text-foreground leading-relaxed md:leading-snug">
                   {cleanOptionText(q.text)}
                 </h2>
               </div>

               {/* Options */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-2">
                 {(() => {
                    let formattedOptions: any[] = [];
                    if (Array.isArray(q.options)) {
                       formattedOptions = q.options.map((opt, i) => {
                          if (typeof opt === 'string') return { id: ["ক", "খ", "গ", "ঘ"][i] || i.toString(), label: cleanOptionText(opt) };
                          return { ...opt, id: opt.id || ["ক", "খ", "গ", "ঘ"][i] || i.toString(), label: cleanOptionText(opt.label || opt.text) };
                       });
                    } else if (q.options && typeof q.options === 'object') {
                       formattedOptions = Object.keys(q.options).map(k => ({ id: k, text: q.options[k], label: cleanOptionText(q.options[k]) }));
                    }
                    return formattedOptions;
                 })().map((option: any, optIdx: number) => {
                   const optionId = option.id !== undefined && option.id !== null ? option.id.toString() : optIdx.toString();
                   const selected = selectedOptions[q.id] === optionId;
                   const correct = isCorrect(q.id, optionId);
                   const wrong = isIncorrect(q.id, optionId);
                   const qWasSkipped = !selectedOptions[q.id];
                   
                   let containerClass = "bg-card border-slate-200 hover:border-slate-300 hover:bg-muted border-[1.5px] text-slate-700 shadow-sm";
                   let labelBg = "bg-slate-100 text-muted-foreground border border-slate-200";
                   
                   if (selected && !isSubmitted) {
                     containerClass = "bg-blue-50/50 border-blue-500 border-[1.5px] text-blue-900 shadow-md ring-4 ring-blue-500/10";
                     labelBg = "bg-blue-500 text-white border border-blue-600 shadow-inner";
                   } else if (isSubmitted && correct && qWasSkipped) {
                     containerClass = "bg-orange-50 border-orange-400 border-[1.5px] text-orange-800 shadow-md ring-4 ring-orange-500/10";
                     labelBg = "bg-orange-500 text-white border border-orange-600 shadow-inner";
                   } else if (correct) {
                     containerClass = "bg-[#f2fbf5] border-[#4bb063] border-[1.5px] text-[#2c7a3f] shadow-md ring-4 ring-[#4bb063]/10";
                     labelBg = "bg-[#4bb063] text-white border border-[#3e9552] shadow-inner";
                   } else if (wrong) {
                     containerClass = "bg-red-50 border-red-500 border-[1.5px] text-red-900 shadow-sm ring-4 ring-red-500/10";
                     labelBg = "bg-red-500 text-white border border-red-600 shadow-inner";
                   }

                   return (
                     <motion.div 
                       key={`${q.id || 'q'}_${idx}_opt_${optionId}_${optIdx}`}
                       whileHover={!isSubmitted ? { scale: 1.01 } : {}}
                       whileTap={!isSubmitted ? { scale: 0.98 } : {}}
                       transition={{ type: "spring", stiffness: 400, damping: 25 }}
                       onClick={() => handleSelect(q.id, optionId)}
                       className={`
                         flex flex-row items-center rounded-2xl cursor-pointer transition-all p-3 md:p-3.5 relative
                         ${containerClass}
                       `}
                     >
                       <div className={`
                         w-9 h-9 md:w-10 md:h-10 flex-shrink-0 flex items-center justify-center font-bold text-sm md:text-base transition-colors rounded-xl
                         ${labelBg}
                       `}>
                         {correct ? (
                           <CheckCircle2 className="w-5 h-5 text-white drop-shadow-sm" />
                         ) : (
                           option.id === 'A' ? 'ক' : option.id === 'B' ? 'খ' : option.id === 'C' ? 'গ' : option.id === 'D' ? 'ঘ' : option.id === '1' ? 'ক' : option.id === '2' ? 'খ' : option.id === '3' ? 'গ' : option.id === '4' ? 'ঘ' : option.id
                         )}
                       </div>
                       
                       <span className={`font-bengali font-medium text-[15px] md:text-base px-3 md:px-4 flex-1 ${correct ? 'font-bold' : ''}`}>
                         {option.label}
                       </span>

                       {wrong && (
                         <motion.div 
                           initial={{ scale: 0 }}
                           animate={{ scale: 1 }}
                           className="absolute right-4 text-red-500 bg-card rounded-full shadow-sm"
                         >
                           <AlertCircle className="w-5 h-5 text-red-500" />
                         </motion.div>
                       )}
                     </motion.div>
                   );
                 })}
               </div>

               {/* Explanation Section */}
               <AnimatePresence>
                 {isSubmitted && (
                   <motion.div
                     initial={{ opacity: 0, height: 0, marginTop: 0 }}
                     animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                     className="bg-indigo-50/70 border border-indigo-100 rounded-[24px] p-5 shadow-sm overflow-hidden"
                   >
                     {userData?.isPro ? (
                       <div className="flex gap-4">
                         <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0 shadow-inner">
                           <Brain className="w-5 h-5" />
                         </div>
                         <div className="flex-1 text-foreground">
                           <h4 className="font-bold text-lg mb-1.5 font-bengali flex items-center">
                             ব্যাখ্যা
                           </h4>
                           <p className="leading-relaxed text-slate-700 font-bengali text-[15px]">
                             {q.explanation}
                           </p>
                         </div>
                       </div>
                     ) : (
                       <div className="flex flex-col items-center justify-center text-center py-2">
                          <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center mb-3 shadow-inner">
                             <Lock className="w-5 h-5 text-slate-400" />
                          </div>
                          <h4 className="font-bold text-foreground mb-2 font-bengali">ব্যাখ্যা দেখতে প্রো সাবস্ক্রিপশন প্রয়োজন</h4>
                          <p className="text-muted-foreground font-bengali text-sm mb-4 max-w-sm">
                            সব প্রশ্নের বিস্তারিত ব্যাখ্যা ও আরও অনেক সুবিধা পেতে আজই প্রো মেম্বারশিপে আপগ্রেড করুন।
                          </p>
                          <Link to="/subscription">
                            <Button size="sm" className="bg-gradient-to-r from-[#ffa726] to-[#e65100] hover:from-[#f57c00] hover:to-[#d84315] text-white rounded-full font-bengali font-bold border-0 shadow-md px-6">
                              আপগ্রেড করুন
                            </Button>
                          </Link>
                       </div>
                     )}
                   </motion.div>
                 )}
               </AnimatePresence>

            </div>
          ))}
        </div>

        {!isSubmitted && (
         <div className="fixed bottom-0 left-0 w-full z-50 bg-[#005B4F] shadow-[0_-4px_10px_rgba(0,0,0,0.1)] text-white">
           <div className="w-full max-w-7xl mx-auto flex items-center justify-between h-[60px] px-2 pb-1">
              <div 
                className="flex flex-col items-center justify-center min-w-[70px] cursor-pointer" 
                onClick={() => { setActiveSet(null); setIsSubmitted(false); setSelectedOptions({}); setRemainingTime(null); }}
              >
                 <div className="w-5 h-5 text-white flex items-center justify-center mb-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                 </div>
                 <span className="font-mono text-[11px] font-bold leading-none">{timeLeft}</span>
              </div>
              
              <div className="flex-1 flex justify-center border-l border-r border-[#1a6d63] h-[40px] items-center">
                 <button 
                   onClick={() => { handleSubmit(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                   className="w-full h-full font-bengali font-bold text-[16px] text-white tracking-wide active:scale-95 transition-transform"
                 >
                    সাবমিট করো
                 </button>
              </div>

              <div className="font-mono text-[14px] font-bold min-w-[70px] text-center flex items-center justify-center">
                 {Object.keys(selectedOptions).length}/{dbQuestions.length}
              </div>
           </div>
         </div>
        )}
         </>
        )}
        </div>
      </main>
      </div>

    </div>
  );
}

