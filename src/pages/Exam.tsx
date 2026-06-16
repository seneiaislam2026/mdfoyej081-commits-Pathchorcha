import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, increment, writeBatch, addDoc, serverTimestamp } from "firebase/firestore";
import { CheckCircle2, Lightbulb, Clock, Target, AlertCircle, PlayCircle, ArrowLeft, BookOpen, Atom, Calculator, Users, Laptop, Lock, FileText, Timer, Brain, ChevronRight, Landmark, TestTube, Dna, TrendingUp, Factory, Globe, Building2, Trash2, Briefcase } from "lucide-react";
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

const modelSets = [
  { id: "model-1", title: "মডেল টেস্ট - ১ (পূর্ণাঙ্গ)", totalQuestions: 50, timeMinutes: 45 },
  { id: "model-2", title: "মডেল টেস্ট - ২ (পূর্ণাঙ্গ)", totalQuestions: 50, timeMinutes: 45 },
  { id: "model-3", title: "মডেল টেস্ট - ৩ (পূর্ণাঙ্গ)", totalQuestions: 50, timeMinutes: 45 },
];

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
    { name: "পৌরনীতি", icon: <Building2 className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-slate-50 hover:border-slate-300" },
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
           };
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
                 const userWrong = JSON.parse(localStorage.getItem(`pathcharcha_wrong_${userData?.uid}`) || "{}");
                 const wrongIds = Object.keys(userWrong);
                 if (wrongIds.length > 0) {
                     try {
                         const qBase = collection(db, "questions");
                         const qQuery = query(qBase, where("__name__", "in", wrongIds.slice(0, 10)));
                         const snap = await getDocs(qQuery);
                         allQs = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
                     } catch {
                         // ignore
                     }
                 }
              } else {
                 let qBase = collection(db, "questions");
                 let qQuery: any = qBase;
                 
                 if (type === 'mock' && mockCustomSubjects.length > 0) {
                     // Note: Firebase 'in' max array size is 10
                     const subSet = mockCustomSubjects.slice(0, 10);
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
                         if (lang === 'bangla') {
                            if (cat === 'samarthok') qText = `"${word.word}" এর সমার্থক শব্দ কোনটি?`;
                            else if (cat === 'antonym') qText = `"${word.word}" এর বিপরীত শব্দ কোনটি?`;
                            else if (cat === 'ek_kothay') qText = `"${word.word}" এর এক কথায় প্রকাশ কোনটি?`;
                            else qText = `"${word.word}" এর অর্থ কী?`;
                         } else {
                            if (cat === 'translation') qText = `Choose the correct translation: "${word.word}"`;
                            else if (cat === 'analogy') qText = `Complete the analogy: ${word.word}`;
                            else if (cat === 'appropriate_preposition') qText = `Fill in the blank: ${word.word}`;
                            else if (cat === 'idiom_phrase') qText = `What is the meaning of the idiom "${word.word}"?`;
                            else if (cat === 'spelling') qText = `Find the correct spelling related to meaning: ${word.meaning}`;
                            else if (cat === 'synonym') qText = `What is the synonym of "${word.word}"?`;
                            else if (cat === 'antonym') qText = `What is the antonym of "${word.word}"?`;
                         }
                         
                         const optionsSet = new Set<string>();
                         const meaning = word.meaning || "Unknown";
                         optionsSet.add(meaning);
                         
                         const allMeanings = ENGLISH_WORDS.filter(w => w.category === cat && w.language === lang).map(w => w.meaning).filter(Boolean);
                         
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
                            id: `dyn_${originalSub}_${chapter}_${lang}_${word.id || Math.random().toString().slice(2)}`,
                            subject: originalSub,
                            chapter: chapter,
                            text: qText,
                            options: optionsArray.map((opt, i) => ({ id: ["ক", "খ", "গ", "ঘ"][i], label: opt })),
                            correctOption: correctOptStr,
                            explanation: word.example ? String(word.example) : (lang === 'bangla' ? `সঠিক উত্তর: ${meaning}` : `Correct answer is: ${meaning}`)
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
                let subQs = finalQs.filter((q:any) => q.subject === sub);
                
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
    color: "bg-slate-50 hover:border-slate-200"
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
        <div className="w-full max-w-7xl mx-auto pb-32 px-4 sm:px-6 md:px-8 pt-6 font-bengali relative z-0 min-h-screen bg-[#f8fafc]">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate("/dashboard")} className="flex items-center text-slate-800 font-bold transition-colors p-2 bg-transparent rounded-lg">
              <ArrowLeft className="w-5 h-5 mr-3" />
              <span className="text-lg">টপিক সিলেক্ট করো</span>
            </button>
            <div className="bg-[#e4efe9] text-[#008060] px-4 py-1.5 rounded-full text-[14px] font-extrabold tracking-wide">১/২ স্টেপস</div>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2 mb-8 items-center px-1">
              <div className="h-2 flex-1 bg-[#008060] rounded-full"></div>
              <div className="h-2 flex-1 bg-[#c5dfd6] rounded-full"></div>
          </div>

          {!showChaptersAccordion ? (
             <>
               <div className="flex flex-wrap gap-x-3 gap-y-4 mb-10 px-1">
                  {displaySubjects.map(sub => (
                     <button 
                       key={sub.name}
                       onClick={() => {
                          if (!mockCustomSubjects.includes(sub.name)) {
                             setMockCustomSubjects(prev => [...prev, sub.name]);
                          } else {
                             setMockCustomSubjects(prev => prev.filter(s => s !== sub.name));
                             setMockCustomChapters(prev => { const n = {...prev}; delete n[sub.name]; return n; });
                          }
                       }}
                       className={`flex items-center gap-3 px-5 py-3.5 bg-white border rounded-[16px] font-bold transition-all ${mockCustomSubjects.includes(sub.name) ? 'border-[#008060] shadow-sm' : 'border-slate-100 hover:border-slate-300'}`}
                     >
                        <div className={`w-5 h-5 rounded-[4px] border-[1.5px] flex items-center justify-center transition-colors ${mockCustomSubjects.includes(sub.name) ? 'bg-[#008060] border-[#008060]' : 'border-slate-300 bg-white'}`}>
                          {mockCustomSubjects.includes(sub.name) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                        </div>
                        <span className="text-[16px] text-slate-800">{sub.name}</span>
                     </button>
                  ))}
               </div>

               {mockCustomSubjects.length > 0 && (
                  <div 
                     onClick={() => setShowChaptersAccordion(true)}
                     className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors animate-in fade-in slide-in-from-bottom-2"
                  >
                     <span className="font-bold text-slate-800 text-[16px]">সিলেক্টেড টপিকস দেখতে এখানে ট্যাপ করো</span>
                     <ChevronRight className="w-6 h-6 text-slate-600" />
                  </div>
               )}
             </>
          ) : (
             <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 mb-40">
                {mockCustomSubjects.map(subject => {
                   const availableChapters = dynamicChaptersMap[subject] && dynamicChaptersMap[subject].length > 0 ? dynamicChaptersMap[subject] : (defaultChaptersMap[subject] || ["সাধারণ প্রশ্ন"]);
                   const subjectChapters = mockCustomChapters[subject] || [];
                   const isExpanded = expandedChaps[subject];
                   const isAllSelected = availableChapters.length > 0 && subjectChapters.length === availableChapters.length;
                   
                   return (
                     <div key={subject} className="bg-white rounded-[16px] border-b-2 border-slate-100 border-b-[#008060] shadow-sm overflow-hidden mb-4">
                        {/* Subject Header */}
                        <div className="p-4 flex items-center transition-colors">
                           <button 
                             onClick={() => {
                               setTopicError("");
                               if (isAllSelected) {
                                  setMockCustomChapters(prev => ({...prev, [subject]: []}));
                               } else {
                                  setMockCustomChapters(prev => ({...prev, [subject]: [...availableChapters]}));
                               }
                             }}
                             className={`w-5 h-5 rounded-[4px] border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${isAllSelected ? 'bg-[#008060] border-[#008060]' : 'bg-white border-slate-300'}`}
                           >
                              {isAllSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                           </button>
                           <span className="font-bold text-slate-800 text-[16px] ml-3 flex-1">{subject}</span>
                           <span className="text-[13px] font-bold text-slate-500 mr-2">{subjectChapters.length}/{availableChapters.length} চ্যাপ্টার</span>
                           <button onClick={() => toggleChapExpand(subject)} className="p-1">
                              <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                           </button>
                        </div>
                        
                        {/* Chapters Accordion Content */}
                        {isExpanded && (
                           <div className="px-4 pb-4 bg-white space-y-2 border-t border-slate-50 pt-2">
                              {availableChapters.map(chap => {
                                 const chapSelected = subjectChapters.includes(chap);
                                 return (
                                   <div key={chap} className="flex items-center bg-slate-50/50 p-3 rounded-[12px]">
                                      <button
                                        onClick={() => {
                                            setTopicError("");
                                            setMockCustomChapters(prev => {
                                                const current = prev[subject] || [];
                                                const updated = current.includes(chap) ? current.filter(c => c !== chap) : [...current, chap];
                                                return {...prev, [subject]: updated};
                                            });
                                        }}
                                        className={`w-5 h-5 rounded-[4px] border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${chapSelected ? 'bg-[#008060] border-[#008060]' : 'bg-white border-slate-300'}`}
                                      >
                                         {chapSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                                      </button>
                                      <span className={`text-[15px] font-bold leading-snug ml-3 flex-1 ${chapSelected ? 'text-slate-800' : 'text-slate-600'}`}>{chap}</span>
                                   </div>
                                 )
                              })}
                           </div>
                        )}
                     </div>
                   )
                })}
             </div>
          )}

          {/* Sticky Bottom Bar when in accordion mode */}
          {showChaptersAccordion && (
             <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 p-4 sm:p-6 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-10">
                <div className="max-w-7xl mx-auto">
                   <div className="flex items-center gap-3 bg-slate-100/50 rounded-[16px] p-3 mb-4">
                      <span className="font-bold text-slate-500 ml-2">প্রশ্নের সংখ্যা</span>
                      <input 
                         type="number" 
                         value={mockCustomQCount} 
                         onChange={(e) => setMockCustomQCount(parseInt(e.target.value) || 25)} 
                         className="bg-transparent border-none outline-none font-bold text-slate-800 flex-1 px-2"
                      />
                   </div>
                   {topicError && (
                      <div className="text-red-500 font-bold text-sm mb-3 mt-2 text-center animate-in fade-in">
                         {topicError}
                      </div>
                   )}
                   <div className="flex gap-4">
                      <button 
                         onClick={() => { setShowChaptersAccordion(false); setTopicError(""); }}
                         className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-extrabold rounded-[16px] hover:bg-slate-50 transition-colors"
                      >
                         + আরেকটি বিষয়
                      </button>
                      <button 
                         onClick={() => {
                            setTopicError("");
                            const canProceed = mockCustomSubjects.length > 0 && mockCustomSubjects.every(s => (mockCustomChapters[s] || []).length > 0);
                            if (!canProceed) {
                               setTopicError("অনুগ্রহ করে প্রতিটি বিষয়ের জন্য অন্তত একটি টপিক নির্বাচন করুন।");
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
                         className="flex-1 py-4 bg-[#008060] text-white font-extrabold rounded-[16px] hover:bg-[#006e52] transition-all shadow-md active:scale-95"
                      >
                         এগিয়ে যাও
                      </button>
                   </div>
                </div>
             </div>
          )}
        </div>
      )
    } else if (mockStep === 2) {
      return (
        <div className="w-full max-w-7xl mx-auto pb-32 px-4 sm:px-6 md:px-8 pt-6 font-bengali relative z-0 min-h-screen bg-[#f8fafc] animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setMockStep(1)} className="flex items-center text-slate-800 font-bold transition-colors p-2 bg-transparent rounded-lg">
              <ArrowLeft className="w-5 h-5 mr-3" />
              <span className="text-lg">নিশ্চিত করো</span>
            </button>
            <div className="bg-[#e4efe9] text-[#008060] px-4 py-1.5 rounded-full text-[14px] font-extrabold tracking-wide">২/২ স্টেপস</div>
          </div>

          <div className="flex gap-2 mb-8 items-center px-1">
              <div className="h-2 flex-1 bg-[#008060] rounded-full"></div>
              <div className="h-2 flex-1 bg-[#008060] rounded-full"></div>
          </div>

          {/* Configuration Area */}
          <div className="space-y-6">
             <div className="font-bold text-slate-800 text-[18px] mb-4">সিলেক্টেড বিষয় ({mockCustomSubjects.length})</div>
             
             <div className="grid grid-cols-2 gap-4">
                {mockCustomSubjects.map(sub => (
                   <div key={sub} className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-3">
                      <div className="font-bold text-slate-800 text-[16px]">{sub}</div>
                      <div className="bg-slate-100 flex items-center justify-between rounded-[12px] p-2 border border-slate-200">
                         <input 
                           type="number" 
                           value={mockQuestionCounts[sub] || 25} 
                           onChange={(e) => setMockQuestionCounts(p => ({...p, [sub]: parseInt(e.target.value) || 0}))} 
                           className="bg-transparent border-none outline-none font-bold text-slate-800 w-full px-2"
                         />
                         <span className="text-slate-500 font-bold px-2">টি</span>
                      </div>
                   </div>
                ))}
             </div>

             <div className="bg-white rounded-[20px] border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 mt-6" onClick={() => {
                setMockStep(1);
                setShowChaptersAccordion(true);
             }}>
                <span className="font-bold text-slate-800 text-[15px]">সিলেক্টেড টপিকস দেখতে এখানে ট্যাপ করো</span>
                <ChevronRight className="w-5 h-5 text-slate-400" />
             </div>

          </div>
          
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 p-4 sm:p-6 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-10">
             <div className="max-w-7xl mx-auto">
               <div className="bg-slate-100 rounded-[16px] p-4 flex items-center justify-between mb-4 border border-slate-200">
                  <span className="font-bold text-slate-800 text-[16px]">মোট সময়</span>
                  <div className="flex items-center w-24 justify-end">
                     <span className="font-bold text-slate-800 text-lg">২৫</span>
                     <span className="text-slate-500 font-bold px-2">মিনিট</span>
                  </div>
               </div>

               <button 
                  onClick={() => {
                     const totalQ = Object.values(mockQuestionCounts).reduce((a,b) => a+b, 0);
                     setActiveSet(`mock-${totalQ}-25`);
                  }}
                  className="w-full py-4.5 bg-[#008060] text-white font-extrabold rounded-[16px] hover:bg-[#006e52] transition-all shadow-md active:scale-95 text-[18px]"
               >
                  পরীক্ষা শুরু করো
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
         <div className="max-w-2xl mx-auto py-12 px-4 relative z-0">
           <button 
             onClick={() => navigate("/dashboard")}  
             className="absolute top-4 left-4 sm:top-6 sm:left-4 flex items-center text-slate-600 font-bengali font-bold hover:text-slate-900 transition-colors z-50 cursor-pointer p-2 bg-white/50 backdrop-blur-sm rounded-lg"
           >
             <ArrowLeft className="w-5 h-5 mr-1.5" /> ফিরে যান
           </button>
           {/* Header */}
           <div className="text-center mb-10 relative mt-8">
              <div className="flex justify-center mb-6">
                 {/* Circle with clipboard icon */}
                 <div className="w-[100px] h-[100px] rounded-full bg-slate-50 flex items-center justify-center relative shadow-sm border border-slate-100">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                       <rect x="9" y="3" width="6" height="4" rx="2"/>
                       <path d="M9 14h6"/>
                       <path d="M9 10h6"/>
                    </svg>
                    <div className="absolute bottom-2 -right-1 bg-white p-1 rounded-full shadow-sm">
                       <div className="bg-amber-400 p-2 rounded-full border-2 border-white">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                          </svg>
                       </div>
                    </div>
                    {/* Decorative dashes */}
                    <div className="absolute top-2 -left-2 text-amber-500 rotate-12">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12h-4"/>
                          <path d="M12 3v4"/>
                          <path d="M20 5l-2.5 2.5"/>
                       </svg>
                    </div>
                 </div>
              </div>

              <h2 className="text-[32px] sm:text-[40px] font-bengali font-extrabold mb-5 leading-tight">
                 <span className="text-slate-800">মডেল টেস্ট</span> <span className="text-[#FFB800]">অনুশীলন</span>
              </h2>

              <div className="flex items-center justify-center gap-3 text-slate-500 font-bengali font-medium mb-6">
                 <div className="w-12 sm:w-16 h-[1px] bg-slate-300"></div>
                 <div className="flex items-center gap-2">
                   <BookOpen className="w-4 h-4 text-slate-600" />
                   <span className="text-sm sm:text-base text-slate-600">সাফল্যের পথে এক ধাপ এগিয়ে</span>
                 </div>
                 <div className="w-12 sm:w-16 h-[1px] bg-slate-300"></div>
              </div>

              <p className="text-slate-500 font-bengali text-sm sm:text-base max-w-[90%] mx-auto leading-relaxed">
                 {pageDesc}
              </p>

              {/* Offline mode button */}
              <div className="flex items-center justify-center gap-3 mt-6">
                 {isOffline ? (
                   <span className="flex items-center gap-1.5 text-sm bg-orange-100 text-orange-700 font-bengali px-3 py-1 rounded-full shrink-0">
                     <AlertCircle className="w-4 h-4" /> অফলাইন মোড
                   </span>
                 ) : (
                   isPWA && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleOfflineSync} 
                      disabled={isSyncing}
                      className="font-bengali text-slate-600 rounded-full shrink-0"
                    >
                      <BookOpen className="w-4 h-4 mr-1.5" />
                      {isSyncing ? "ডাউনলোড হচ্ছে..." : "অফলাইনের জন্য সেভ করুন"}
                    </Button>
                   )
                 )}
              </div>
           </div>

           {/* Cards List */}
           <div className="flex flex-col gap-4 mb-6">
             {dynamicModelSets.map((set, idx) => (
                <motion.div
                   key={set.id}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => {
                      if (set.isAdminExam) {
                         navigate(`/public-exam/${set.id}`);
                      } else {
                         setActiveSet(set.id);
                      }
                   }}
                   className="cursor-pointer bg-white border border-slate-200 hover:border-slate-300 shadow-sm rounded-3xl p-4 sm:p-5 flex items-center justify-between group transition-all"
                >
                   <div className="flex items-center gap-5 sm:gap-6">
                      <div className="relative shrink-0">
                         {/* Document Icon Graphic */}
                         <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#F8FAFC"/>
                            <path d="M14 2v6h6" strokeWidth="1"/>
                            <path d="M8 13h8" strokeWidth="1.5"/>
                            <path d="M8 17h8" strokeWidth="1.5"/>
                            {/* tiny checkmarks */}
                            <path d="M8 9l1 1 2-2" strokeWidth="1.5" stroke="#10B981" />
                            <path d="M8 13l1 1 2-2" strokeWidth="1.5" stroke="#10B981" />
                         </svg>
                         {/* Pen */}
                         <div className="absolute -bottom-1 -right-2 text-amber-400 rotate-[15deg] bg-white rounded-full">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="#FBBF24" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                               <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                            </svg>
                         </div>
                         {/* Number Badge */}
                         <div className="absolute -bottom-1 -left-2 bg-[#0F172A] text-white font-mono font-bold text-sm sm:text-base px-2 py-0.5 rounded-lg shadow-md border-2 border-white tracking-widest pl-2.5">
                            {(idx + 1).toString().padStart(2, '0').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)])}
                         </div>
                      </div>

                      <div className="pl-2">
                         <h3 className="text-lg sm:text-xl font-bengali font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">
                             {set.title}
                         </h3>
                         <div className="flex flex-wrap items-center gap-3 text-slate-500 font-bengali text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5">
                               <Timer className="w-4 h-4 text-slate-400" />
                               <span>{
                                  set.timeMinutes >= 60 
                                      ? `${Math.floor(set.timeMinutes / 60)} ঘণ্টা ${set.timeMinutes % 60 > 0 ? `${set.timeMinutes % 60} মিনিট` : ''}`.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)])
                                      : `${set.timeMinutes} মিনিট`.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)])
                               }</span>
                            </div>
                            <div className="text-slate-300">|</div>
                            <div className="flex items-center gap-1.5">
                               <FileText className="w-4 h-4 text-slate-400" />
                               <span>{set.totalQuestions.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)])} নম্বর</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0F172A] border-[3px] border-amber-400 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                   </div>
                </motion.div>
             ))}
           </div>

           {/* Bottom Banner */}
           <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 mt-6 flex items-center gap-4 sm:gap-6 justify-center sm:justify-start text-center sm:text-left shadow-sm relative overflow-hidden">
               {/* Pattern */}
               <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                  <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="dotsBanner" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                        <circle fill="#0F172A" cx="2" cy="2" r="2"></circle>
                      </pattern>
                    </defs>
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#dotsBanner)"></rect>
                  </svg>
               </div>
               
               <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-transparent shrink-0">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <circle cx="12" cy="12" r="10" stroke="#0F172A" strokeWidth="2"/>
                     <circle cx="12" cy="12" r="6" stroke="#0F172A" strokeWidth="2"/>
                     <circle cx="12" cy="12" r="2" stroke="#0F172A" strokeWidth="2"/>
                     <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#0F172A" opacity="0.3" />
                  </svg>
               </div>
               <div className="relative z-10">
                  <div className="text-lg sm:text-xl font-bengali font-bold text-slate-800">
                     লক্ষ্য ঠিক রাখো,
                  </div>
                  <div className="text-xl sm:text-2xl font-bengali font-extrabold mt-0.5 relative inline-block">
                     <span className="text-[#FFB800]">সাফল্য</span> <span className="text-slate-800">হবেই তোমার!</span>
                     <span className="text-amber-400 absolute -right-6 top-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M2 12h4M18 12h4M12 2v4M12 18v4"/>
                        </svg>
                     </span>
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
          className="absolute top-4 left-4 sm:top-6 sm:left-4 flex items-center text-slate-600 font-bengali font-bold hover:text-slate-900 transition-colors z-50 cursor-pointer p-2 bg-white/50 backdrop-blur-sm rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 mr-1.5" /> ফিরে যান
        </button>
        <div className="text-center mb-12 mt-8">
          <h2 className="text-3xl font-bengali font-bold text-slate-800 mb-4">{pageTitle}</h2>

          <div className="flex items-center justify-center gap-3 mb-6">
             {isOffline ? (
               <span className="flex items-center gap-1.5 text-sm bg-orange-100 text-orange-700 font-bengali px-3 py-1 rounded-full shrink-0">
                 <AlertCircle className="w-4 h-4" /> অফলাইন মোড
               </span>
             ) : (
               isPWA && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleOfflineSync} 
                  disabled={isSyncing}
                  className="font-bengali text-slate-600 rounded-full shrink-0"
                >
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  {isSyncing ? "ডাউনলোড হচ্ছে..." : "অফলাইনের জন্য সেভ করুন"}
                </Button>
               )
             )}
          </div>

          <p className="text-slate-500 font-bengali text-lg max-w-xl mx-auto">
            {pageDesc}
          </p>
        </div>

        {type === 'mistakes' && (
          <div className="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden text-center">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-rose-400"></div>
             <h3 className="text-2xl font-bengali font-bold text-slate-800 mb-6">ভুলগুলোর প্র্যাকটিস</h3>
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
      <div className="w-full bg-white py-3.5 sm:py-5 px-4 sm:px-8 mb-6 sm:mb-10 text-center relative border-b border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button 
               onClick={() => { setActiveSet(null); setIsSubmitted(false); setSelectedOptions({}); setRemainingTime(null); }}
               className="w-10 h-10 -ml-2 rounded-full hover:bg-slate-50 flex items-center justify-center transition-colors relative z-10"
            >
               <ArrowLeft className="w-6 h-6 text-slate-800" />
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
              <div className="bg-white rounded-2xl p-5 shadow-sm min-w-[140px] border border-[#d1f0df]">
                <p className="text-sm font-bengali text-slate-500 mb-1">মোট প্রশ্ন</p>
                <p className="text-4xl font-mono font-bold text-slate-800">{dbQuestions.length}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm min-w-[140px] border border-[#d1f0df]">
                <p className="text-sm font-bengali text-slate-500 mb-1">সঠিক উত্তর</p>
                <p className="text-4xl font-mono font-bold text-[#147e42]">{score / 10}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(249,115,22,0.3)] min-w-[140px] border border-orange-100 relative overflow-hidden">
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
            <div key={q.id ? `q_${q.id}_${idx}` : `q_fallback_${idx}`} className="question-block bg-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
               {/* Question Header */}
               <div className="mb-6">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs md:text-sm font-bold tracking-wide">
                     প্রশ্ন {q.questionNumber}
                   </div>
                 </div>
                 <h2 className="text-[17px] md:text-xl font-bengali font-bold text-slate-800 leading-relaxed md:leading-snug">
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
                   
                   let containerClass = "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 border-[1.5px] text-slate-700 shadow-sm";
                   let labelBg = "bg-slate-100 text-slate-600 border border-slate-200";
                   
                   if (selected && !isSubmitted) {
                     containerClass = "bg-blue-50/50 border-blue-500 border-[1.5px] text-blue-900 shadow-md ring-4 ring-blue-500/10";
                     labelBg = "bg-blue-500 text-white border border-blue-600 shadow-inner";
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
                           option.id
                         )}
                       </div>
                       
                       <span className={`font-bengali font-medium text-[15px] md:text-base px-3 md:px-4 flex-1 ${correct ? 'font-bold' : ''}`}>
                         {option.label}
                       </span>

                       {wrong && (
                         <motion.div 
                           initial={{ scale: 0 }}
                           animate={{ scale: 1 }}
                           className="absolute right-4 text-red-500 bg-white rounded-full shadow-sm"
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
                         <div className="flex-1 text-slate-800">
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
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-inner">
                             <Lock className="w-5 h-5 text-slate-400" />
                          </div>
                          <h4 className="font-bold text-slate-800 mb-2 font-bengali">ব্যাখ্যা দেখতে প্রো সাবস্ক্রিপশন প্রয়োজন</h4>
                          <p className="text-slate-600 font-bengali text-sm mb-4 max-w-sm">
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

