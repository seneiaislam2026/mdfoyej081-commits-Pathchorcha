import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Check, 
  Sparkles, 
  Search, 
  Volume2, 
  ArrowLeft,
  X,
  VolumeX,
  HelpCircle as QuizIcon,
  BookOpen as ReadingIcon,
  Award,
  Languages,
  RotateCcw,
  Plus,
  HelpCircle,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Bell,
  LogOut,
  Bookmark,
  Brain,
  Link as LinkIcon,
  Layers,
  Shuffle,
  Quote,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { ENGLISH_WORDS, BANGLA_WORDS, WordItem } from "../data/vocabularyData";

export default function Memorize() {
  const navigate = useNavigate();
  
  // Custom structured steps workflow
  const [selectedLanguage, setSelectedLanguage] = useState<"english" | "bangla" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbWords, setDbWords] = useState<WordItem[]>([]);
  const [practiceMode, setPracticeMode] = useState(false); // false = Flashcard, true = MCQ Quiz
  const [visibleCount, setVisibleCount] = useState(15);
  const [activeTab, setActiveTab] = useState<"all" | "bookmarked" | "mastered">("all");

  // MCQ test states
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("mastered_words");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("bookmarked_words");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch words in real-time from Firestore
  useEffect(() => {
    const fetchVocab = async () => {
      try {
        const snap = await getDocs(collection(db, "vocabulary"));
        const list: WordItem[] = [];
        snap.forEach(docSnap => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            word: d.word || "",
            language: (d.language === "bangla" ? "bangla" : "english"),
            category: (d.category || "vocabulary") as any,
            pronunciation: d.pronunciation || "",
            meaning: d.meaning || "",
            synonyms: Array.isArray(d.synonyms) ? d.synonyms : [],
            antonyms: Array.isArray(d.antonyms) ? d.antonyms : [],
            example: d.example || ""
          });
        });
        setDbWords(list);
      } catch (err) {
        console.error("Error loading DB vocabulary:", err);
      }
    };
    fetchVocab();
  }, []);

  useEffect(() => {
    localStorage.setItem("mastered_words", JSON.stringify(masteredIds));
  }, [masteredIds]);

  useEffect(() => {
    localStorage.setItem("bookmarked_words", JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    setVisibleCount(15);
  }, [selectedLanguage, searchQuery, activeTab]);

  // Merge static arrays with client uploaded DB words
  const wordsList = [
    ...ENGLISH_WORDS,
    ...BANGLA_WORDS,
    ...dbWords
  ];

  // Perform search keywords and language filter
  const filteredWords = wordsList.filter((item) => {
    if (item.language !== selectedLanguage) return false;
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    
    if (activeTab === "mastered" && !masteredIds.includes(item.id)) return false;
    if (activeTab === "bookmarked" && !bookmarkedIds.includes(item.id)) return false;
    if (activeTab === "all" && masteredIds.includes(item.id)) return false;

    let matchSearch = true;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      matchSearch =
        item.word.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.synonyms.some(s => s.toLowerCase().includes(q)) ||
        (item.example && item.example.toLowerCase().includes(q)) || false;
    }
    return matchSearch;
  });

  // Start MCQ quiz engine
  const startPracticeQuiz = () => {
    const pool = filteredWords.length > 1 ? filteredWords : wordsList;
    if (pool.length === 0) return;
    
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
    const questions = shuffled.map((item) => {
      const wrongPool = pool.filter(p => p.id !== item.id);
      const wrongMeanings = wrongPool.map(p => p.meaning);
      const distinctWrong = Array.from(new Set(wrongMeanings)).sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [item.meaning, ...distinctWrong].sort(() => 0.5 - Math.random());

      return {
        word: item.word,
        correctMeaning: item.meaning,
        options,
        id: item.id
      };
    });
    setQuizQuestions(questions);
    setCurrentQuizIndex(0);
    setSelectedQuizOption(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  useEffect(() => {
    if (practiceMode) {
      startPracticeQuiz();
    }
  }, [practiceMode, searchQuery]);

  const toggleMastered = (id: string) => {
    setMasteredIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case "samarthok": return "সমার্থক শব্দ";
      case "antonym": return "বিপরীত শব্দ";
      case "ek_kothay": return "এক কথায় প্রকাশ";
      case "vocabulary": return "Vocabulary";
      case "synonym": return "Synonym";
      case "analogy": return "Analogy";
      case "appropriate_preposition": return "Appro. Prep.";
      case "group_verb": return "Group Verb";
      default: return "Vocabulary";
    }
  };

  const getCategoryIcon = (cat: string, className: string = "w-6 h-6 text-indigo-500 group-hover:text-white") => {
    switch(cat) {
      case "vocabulary": return <Brain className={className} />;
      case "samarthok": return <Layers className={className} />;
      case "synonym": return <Layers className={className} />;
      case "antonym": return <Shuffle className={className} />;
      case "ek_kothay": return <Quote className={className} />;
      case "analogy": return <LinkIcon className={className} />;
      case "appropriate_preposition": return <LinkIcon className={className} />;
      case "group_verb": return <Layers className={className} />;
      default: return <BookOpen className={className} />;
    }
  };

  const getCategoryStyle = (cat: string) => {
    switch(cat) {
      case "vocabulary": return { bg: "bg-purple-100", text: "text-purple-600", light: "bg-purple-50", border: "hover:border-purple-200" };
      case "analogy": return { bg: "bg-blue-100", text: "text-blue-600", light: "bg-blue-50", border: "hover:border-blue-200" };
      case "appropriate_preposition": return { bg: "bg-green-100", text: "text-green-600", light: "bg-green-50", border: "hover:border-green-200" };
      case "group_verb": return { bg: "bg-orange-100", text: "text-orange-600", light: "bg-orange-50", border: "hover:border-orange-200" };
      
      case "samarthok": return { bg: "bg-cyan-100", text: "text-cyan-600", light: "bg-cyan-50", border: "hover:border-cyan-200" };
      case "synonym": return { bg: "bg-cyan-100", text: "text-cyan-600", light: "bg-cyan-50", border: "hover:border-cyan-200" };
      case "antonym": return { bg: "bg-rose-100", text: "text-rose-600", light: "bg-rose-50", border: "hover:border-rose-200" };
      case "ek_kothay": return { bg: "bg-teal-100", text: "text-teal-600", light: "bg-teal-50", border: "hover:border-teal-200" };
      
      default: return { bg: "bg-indigo-100", text: "text-indigo-600", light: "bg-indigo-50", border: "hover:border-indigo-200" };
    }
  };

  const handleSpeech = (wordText: string, langType: string) => {
    if (!window?.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const voiceTone = new SpeechSynthesisUtterance(wordText);
    voiceTone.lang = langType === "english" ? "en-US" : "bn-BD";
    voiceTone.rate = 0.9; // Just slightly slower for clarity
    window.speechSynthesis.speak(voiceTone);
  };

  const renderHighlightedExample = (exampleText: string, searchWord: string) => {
    if (!searchWord) return exampleText;
    try {
      const escapedSearchWord = searchWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts = exampleText.split(new RegExp(`(${escapedSearchWord})`, "gi"));
      return (
        <>
          {parts.map((part, index) => 
            part.toLowerCase() === searchWord.toLowerCase() ? (
              <span key={index} className="text-[#0EA5E9] font-extrabold underline decoration-sky-200">
                {part}
              </span>
            ) : (
              part
            )
          )}
        </>
      );
    } catch {
      return exampleText;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-32">
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 flex flex-col justify-start">
        
        {/* Header Layout */}
        {selectedLanguage && (
          selectedCategory ? (
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-2xl mb-4 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery("");
                  setPracticeMode(false);
                }}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 hover:bg-slate-50 border-b-4 border-b-slate-200 active:scale-95 transition-all text-slate-700 shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => setPracticeMode(true)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${practiceMode ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                  title="MCQ Quiz"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => { setActiveTab("all"); setPracticeMode(false); }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab === 'all' && !practiceMode ? 'bg-[#0F2744] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                  title="All Words"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => { setActiveTab("bookmarked"); setPracticeMode(false); }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab === 'bookmarked' && !practiceMode ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                  title="Bookmarked"
                >
                  <Bookmark className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => { setActiveTab("mastered"); setPracticeMode(false); }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab === 'mastered' && !practiceMode ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                  title="Memorized"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-2">
              <button
                onClick={() => setSelectedLanguage(null)}
                className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-200/50 rounded-full transition-all active:scale-95 -ml-2"
              >
                <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>
          )
        )}

        {!selectedLanguage ? (
          <div className="flex-1 flex flex-col items-center justify-center relative w-full pt-4 pb-10">
            {/* Background patterns */}
            <div className="absolute top-10 left-0 w-24 h-24 pointer-events-none opacity-40">
               <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                 <defs>
                   <pattern id="dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                     <circle fill="#94A3B8" cx="2" cy="2" r="2"></circle>
                   </pattern>
                 </defs>
                 <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)"></rect>
               </svg>
            </div>
            <div className="absolute -top-4 -right-12 w-48 h-48 pointer-events-none opacity-60 mix-blend-multiply">
               <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                 <circle cx="100" cy="100" r="100" fill="#E0F2FE" />
                 <defs>
                   <pattern id="bigdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                     <circle fill="#BAE6FD" cx="3" cy="3" r="3"></circle>
                   </pattern>
                 </defs>
                 <rect x="0" y="0" width="100%" height="100%" fill="url(#bigdots)"></rect>
               </svg>
            </div>

            {/* Hero Header */}
            <div className="flex flex-col items-center mb-8 relative z-10 w-full text-center mt-6">
              <div className="relative mb-6 flex items-center justify-center">
                {/* Decorative shapes */}
                <div className="absolute -left-6 -top-2 w-4 h-4 text-emerald-400 opacity-60">✧</div>
                <div className="absolute -left-12 top-20 w-5 h-5 text-amber-400">✦</div>
                <div className="absolute -right-8 top-10 w-4 h-4 text-sky-400 opacity-70">✧</div>
                <div className="absolute right-2 -bottom-2 w-3 h-3 text-emerald-400 rotate-45">✨</div>
                
                {/* Illustration replacement: Smart Owl Mascot */}
                <div className="w-64 h-64 relative ml-8">
                  <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Soft background blob */}
                    <path d="M100 20 C 155 20 180 50 180 100 C 180 155 145 185 100 185 C 55 185 20 155 20 100 C 20 50 45 20 100 20 Z" fill="#EFF6FF" />
                    
                    {/* Sparkles */}
                    <path d="M40 70 L 43 75 L 48 78 L 43 81 L 40 86 L 37 81 L 32 78 L 37 75 Z" fill="#FBBF24"/>
                    <path d="M150 50 L 152 55 L 157 57 L 152 59 L 150 64 L 148 59 L 143 57 L 148 55 Z" fill="#34D399"/>
                    <circle cx="160" cy="120" r="4" fill="#A78BFA"/>
                    <circle cx="45" cy="135" r="3" fill="#F472B6"/>
                    
                    {/* Owl Base Shape */}
                    <path d="M60 150 C 50 100 55 60 100 60 C 145 60 150 100 140 150 C 135 180 65 180 60 150 Z" fill="#3B82F6" />
                    
                    {/* Light Belly */}
                    <path d="M70 145 C 65 105 75 80 100 80 C 125 80 135 105 130 145 C 125 165 75 165 70 145 Z" fill="#BAE6FD" />
                    
                    {/* Feathers (scallops) on Belly */}
                    <path d="M92 105 Q 100 112 108 105" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    <path d="M85 120 Q 93 127 100 120 Q 107 127 115 120" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    <path d="M92 135 Q 100 142 108 135" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

                    {/* Left Wing (Pointing/Thinking) */}
                    <path d="M55 130 C 45 110 50 90 65 85 C 65 110 70 120 85 135" fill="#2563EB" />
                    <circle cx="85" cy="135" r="6" fill="#1D4ED8" /> {/* Hand connecting */}
                    
                    {/* Right Wing (Relaxed) */}
                    <path d="M145 130 C 155 110 150 90 135 85 C 135 110 130 120 125 135 Z" fill="#2563EB" />

                    {/* Owl Ears */}
                    <path d="M60 70 L 65 45 L 85 60 Z" fill="#2563EB" />
                    <path d="M140 70 L 135 45 L 115 60 Z" fill="#2563EB" />

                    {/* Eye Sockets (Darker Blue) */}
                    <circle cx="80" cy="75" r="20" fill="#2563EB" />
                    <circle cx="120" cy="75" r="20" fill="#2563EB" />
                    
                    {/* Eyes */}
                    <circle cx="80" cy="75" r="16" fill="#FFFFFF" />
                    <circle cx="120" cy="75" r="16" fill="#FFFFFF" />
                    
                    {/* Pupils */}
                    <circle cx="82" cy="73" r="7" fill="#1E293B" />
                    <circle cx="84" cy="71" r="2.5" fill="#FFFFFF" />
                    
                    <circle cx="118" cy="73" r="7" fill="#1E293B" />
                    <circle cx="120" cy="71" r="2.5" fill="#FFFFFF" />

                    {/* Eyebrows (Smart expression) */}
                    <path d="M62 58 Q 80 50 88 58" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none"/>
                    <path d="M138 58 Q 120 50 112 58" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none"/>

                    {/* Beak */}
                    <path d="M96 85 L 104 85 L 100 98 Z" fill="#F59E0B" />
                    <path d="M100 85 L 104 85 L 100 98 Z" fill="#D97706" />

                    {/* Graduation Cap */}
                    <path d="M100 15 L 145 30 L 100 45 L 55 30 Z" fill="#1E293B" />
                    <path d="M75 38 L 75 52 C 75 60 125 60 125 52 L 125 38 Z" fill="#334155" />
                    
                    {/* Tassel */}
                    <path d="M100 30 C 120 35 140 45 140 60" stroke="#FBBF24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M137 60 L 143 60 L 140 70 Z" fill="#FBBF24" />
                    <circle cx="100" cy="30" r="4" fill="#F59E0B" />

                    {/* Thought Bubble */}
                    <circle cx="65" cy="45" r="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                    <circle cx="50" cy="32" r="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                    <circle cx="35" cy="15" r="16" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                    <text x="35" y="23" fontFamily="sans-serif" fontWeight="900" fontSize="22" fill="#3B82F6" textAnchor="middle">?</text>
                  </svg>
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-[36px] font-bengali font-extrabold text-[#0D2A4B] mb-3 tracking-tight">
                বিষয় নির্বাচন করুন।
              </h1>
              <p className="text-[#64748B] font-bengali text-lg sm:text-[20px] mb-6">
                আপনি কোনটি চর্চা করতে চান?
              </p>
              
              {/* Underline Decorative */}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <div className="h-1.5 w-16 bg-[#3B82F6] rounded-full"></div>
                <div className="h-1.5 w-2.5 bg-[#3B82F6] rounded-full"></div>
              </div>
            </div>

            {/* Cards container */}
            <div className="flex flex-col gap-5 w-full relative z-10 px-2 sm:px-4">
              
              {/* English Card */}
              <button 
                onClick={() => setSelectedLanguage("english")}
                className="bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 transition-all group overflow-hidden relative cursor-pointer w-full text-left"
              >
                <div className="flex items-center gap-5 sm:gap-8 relative z-10 w-full">
                  {/* Illustration */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 flex items-center justify-center">
                     <svg width="100%" height="100%" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <rect x="65" y="15" width="50" height="75" rx="4" fill="#2563EB" transform="rotate(15 65 15)"/>
                       <path d="M5 80 L 60 85 L 60 25 L 5 20 Z" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="2.5" strokeLinejoin="round"/>
                       <path d="M115 80 L 60 85 L 60 25 L 115 20 Z" fill="#F8FAFC" stroke="#1E3A8A" strokeWidth="2.5" strokeLinejoin="round"/>
                       <path d="M15 72 L 55 76" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
                       <path d="M105 72 L 65 76" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
                       <text x="25" y="60" fontFamily="sans-serif" fontWeight="900" fontSize="32" fill="#1E40AF" transform="rotate(5 25 60)">A</text>
                       <text x="75" y="60" fontFamily="sans-serif" fontWeight="900" fontSize="32" fill="#1E40AF" transform="rotate(-5 75 60)">Z</text>
                       <path d="M115 55 L 135 55 L 128 90 L 122 90 Z" fill="#10B981" stroke="#047857" strokeWidth="1.5"/>
                       <line x1="118" y1="55" x2="114" y2="35" stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
                       <line x1="128" y1="55" x2="132" y2="40" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round"/>
                     </svg>
                  </div>
                  
                  <div className="flex flex-col items-start justify-center flex-1">
                    <div className="w-12 h-12 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-1.5 sm:mb-2 border border-blue-100">
                      <span className="text-[#2563EB] text-2xl font-black">A</span>
                    </div>
                    <h3 className="text-[20px] sm:text-[24px] font-bengali font-extrabold text-[#0D2A4B] tracking-tight leading-tight">ইংরেজি শব্দকোষ</h3>
                  </div>
                  
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2563EB] rounded-full flex items-center justify-center text-white shadow-md group-hover:bg-[#1D4ED8] group-hover:scale-105 transition-all flex-shrink-0">
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                  </div>
                </div>
              </button>

              {/* Bangla Card */}
              <button 
                onClick={() => setSelectedLanguage("bangla")}
                className="bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 transition-all group overflow-hidden relative cursor-pointer w-full text-left"
              >
                 <div className="flex items-center gap-5 sm:gap-8 relative z-10 w-full">
                  {/* Illustration */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 flex items-center justify-center">
                    <svg width="100%" height="100%" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <rect x="15" y="72" width="65" height="14" rx="2" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5"/>
                       <rect x="15" y="76" width="60" height="6" fill="#FFFFFF"/>
                       
                       <rect x="20" y="58" width="60" height="14" rx="2" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.5"/>
                       <rect x="20" y="62" width="55" height="6" fill="#FFFFFF"/>
                       
                       <rect x="18" y="44" width="55" height="14" rx="2" fill="#10B981" stroke="#047857" strokeWidth="1.5"/>
                       <rect x="18" y="48" width="50" height="6" fill="#FFFFFF"/>
                       
                       <path d="M80 85 L 98 20 L 132 30 L 114 95 Z" fill="#FCD34D" stroke="#D97706" strokeWidth="2" strokeLinejoin="round"/>
                       <path d="M85 80 L 100 25 L 128 32 L 113 87 Z" fill="#FEF08A"/>
                       <text x="96" y="68" fontFamily="sans-serif" fontWeight="900" fontSize="34" fill="#047857" transform="rotate(18 96 68)">অ</text>
                       
                       <path d="M 8 60 L 25 60 L 20 90 L 13 90 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
                       <line x1="12" y1="60" x2="4" y2="40" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round"/>
                       <line x1="20" y1="60" x2="26" y2="45" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round"/>
                     </svg>
                  </div>
                  
                  <div className="flex flex-col items-start justify-center flex-1">
                    <div className="w-12 h-12 bg-[#ECFDF5] rounded-full flex items-center justify-center mb-1.5 sm:mb-2 border border-green-100">
                      <span className="text-[#10B981] text-2xl font-black mt-1">অ</span>
                    </div>
                    <h3 className="text-[20px] sm:text-[24px] font-bengali font-extrabold text-[#0D2A4B] tracking-tight leading-tight">বাংলা শব্দকোষ</h3>
                  </div>
                  
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#10B981] rounded-full flex items-center justify-center text-white shadow-md group-hover:bg-[#059669] group-hover:scale-105 transition-all flex-shrink-0">
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                  </div>
                </div>
              </button>

            </div>
          </div>
        ) : !selectedCategory ? (
          <div className="flex-1 flex flex-col items-center justify-start gap-6 px-4 pt-4 pb-8">
             <div className="text-center mb-2">
              <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                <BookOpen className="w-8 h-8 text-slate-600" />
              </div>
              <h2 className="text-2xl font-bengali font-extrabold text-[#0D2A4B] mb-2">ক্যাটাগরি নির্বাচন করুন</h2>
              <p className="text-slate-500 font-bengali text-sm">
                {selectedLanguage === "english" ? "ইংরেজি" : "বাংলা"} ভাষার কোন অংশটি পড়তে চান?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
              {Array.from(new Set(wordsList.filter(w => w.language === selectedLanguage).map(w => w.category || 'vocabulary'))).map(cat => {
                const style = getCategoryStyle(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`bg-white border-[1.5px] border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 ${style.border}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}>
                        {getCategoryIcon(cat, `w-6 h-6 ${style.text}`)}
                      </div>
                      <span className="font-sans font-bold text-slate-800 text-[15px]">{getCategoryTitle(cat)}</span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${style.light}`}>
                      <ChevronRight className={`w-4 h-4 ${style.text}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 px-1.5 mt-2">
              <span className="text-sm font-bengali font-extrabold text-slate-600">
                {activeTab === "bookmarked" ? "বুকমার্ক করা শব্দ" : activeTab === "mastered" ? "মুখস্থ হয়েছে" : "শব্দের তালিকা"}
              </span>
              <div className="w-10 h-[22px] bg-[#0F2744] rounded-full flex items-center justify-center text-white font-mono font-black text-xs shadow-xs">
                {filteredWords.length}
              </div>
            </div>

            {/* Output area */}
        {filteredWords.length > 0 ? (
          !practiceMode ? (
            <div className="w-full flex flex-col gap-6">
              {filteredWords.slice(0, visibleCount).map((wordItem, idx) => {
                const isMastered = masteredIds.includes(wordItem.id);

                  return (
                    <div key={wordItem.id} className="w-full flex flex-col">
                      <div className="bg-white rounded-[32px] p-6 border border-slate-150/90 shadow-[0_12px_45px_rgba(0,0,0,0.032)] flex flex-col gap-5 overflow-hidden">
                        
                        {/* Sub categorization and hash index indicator */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] sm:text-[11px] font-sans font-extrabold tracking-widest uppercase text-[#5B21B6] bg-[#F1ECFE] px-3 py-1 rounded-full">
                            {getCategoryTitle(wordItem.category)}
                          </span>
                          <span className="text-xs font-mono font-extrabold text-slate-350">#{idx + 1}</span>
                        </div>

                      {/* Word rendering with custom TTS speaker and handmade SVG Illustrations */}
                      <div className="flex justify-between items-start min-h-[120px] relative">
                        <div className="flex-1 pr-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-2xl sm:text-3xl font-black font-sans text-[#0D2A4B] tracking-tight leading-tight select-all">
                              {wordItem.word}
                            </h2>
                            <button
                              onClick={() => handleSpeech(wordItem.word, wordItem.language)}
                              className="p-1 px-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-lg cursor-pointer transition-all active:scale-90"
                              title="উচ্চারণ শুনুন"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleBookmark(wordItem.id)}
                              className={`p-1 px-1.5 rounded-lg cursor-pointer transition-all active:scale-90 flex items-center justify-center ${bookmarkedIds.includes(wordItem.id) ? 'bg-amber-100 text-amber-600 shadow-sm' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-amber-500'}`}
                              title={bookmarkedIds.includes(wordItem.id) ? "বুকমার্ক সরানো" : "বুকমার্ক করুন"}
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setMasteredIds(prev => 
                                  prev.includes(wordItem.id) ? prev.filter(x => x !== wordItem.id) : [...prev, wordItem.id]
                                );
                              }}
                              className={`p-1 px-1.5 rounded-lg cursor-pointer transition-all active:scale-90 flex items-center justify-center ${masteredIds.includes(wordItem.id) ? 'bg-emerald-100 text-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-emerald-500'}`}
                              title={masteredIds.includes(wordItem.id) ? "মুখস্থ তালিকা থেকে সরান" : "মুখস্থ হয়েছে"}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </div>

                          {wordItem.pronunciation && (
                            <p className="text-xs sm:text-[13px] font-black font-bengali text-slate-400 mt-2">
                              উচ্চারণ: <span className="text-[#0EA5E9] ml-1">{wordItem.pronunciation}</span>
                            </p>
                          )}
                        </div>

                        {/* Handcrafted dynamic visual representing each selected item's conceptual meaning */}
                        <div className="shrink-0 -mt-2.5 -mr-3">
                          <WordIllustration word={wordItem.word} />
                        </div>
                      </div>

                      {/* DEFINITION SECTION BOX - ALWAYS SHOWN FOR ENGLISH, AND FOR BANGLA ONLY IF EK_KOTHAY */}
                      {(wordItem.language === "english" || wordItem.category === "ek_kothay") && (
                        <div className="bg-[#FAF5FF] border border-[#F3E8FF] rounded-[22px] p-4 flex gap-3.5 items-start">
                          <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-[#8B5CF6]" />
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8B5CF6] font-black tracking-wider uppercase block mb-0.5">
                              {wordItem.language === "english" ? (wordItem.category === "analogy" ? "RELATED PAIR" : (wordItem.category === "appropriate_preposition" || wordItem.category === "group_verb") ? "BENGALI MEANING" : "DEFINITION") : "এক কথায় প্রকাশ"}
                            </span>
                            <h4 className="font-bengali text-base font-extrabold text-[#7C3AED] leading-snug">
                              {wordItem.meaning.split("(")[0].trim()}
                            </h4>
                            {wordItem.meaning.includes("(") && (
                              <p className="text-[11px] sm:text-xs text-slate-500 font-sans mt-0.5 italic leading-tight">
                                ({wordItem.meaning.split("(")[1]}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SYNONYMS & ANTONYMS COLUMN LAYOUT */}
                      {((wordItem.language === "english" && !["analogy", "appropriate_preposition", "group_verb"].includes(wordItem.category)) || (wordItem.language === "bangla" && wordItem.category !== "ek_kothay")) && (
                        <div className="grid grid-cols-2 gap-3.5">
                          {/* Synonyms with check indicator */}
                          <div className={`bg-[#F0FDF4] border border-[#DCFCE7] rounded-[22px] p-4 flex flex-col gap-1.5 ${wordItem.language === 'bangla' && wordItem.category !== 'samarthok' ? 'opacity-50 grayscale' : ''}`}>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <div className="w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 text-white" strokeWidth={4} />
                              </div>
                              <span className="text-[10px] text-[#166534] font-black tracking-wider uppercase">
                                {wordItem.language === "english" ? "SYNONYMS" : "সমার্থক শব্দ"}
                              </span>
                            </div>
                            <p className="text-xs sm:text-[13px] font-bold text-emerald-950 leading-snug font-bengali">
                              {wordItem.language === "english" 
                                ? (wordItem.synonyms?.length > 0 ? wordItem.synonyms.join(", ") : "Not Applicable")
                                : (wordItem.category === "samarthok" ? wordItem.meaning : "প্রযোজ্য নয়")}
                            </p>
                          </div>

                          {/* Antonyms wtih cross indicator */}
                          <div className={`bg-[#FEF2F2] border border-[#FEE2E2] rounded-[22px] p-4 flex flex-col gap-1.5 ${wordItem.language === 'bangla' && wordItem.category !== 'antonym' ? 'opacity-50 grayscale' : ''}`}>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
                                <X className="w-3 h-3 text-white" strokeWidth={4} />
                              </div>
                              <span className="text-[10px] text-rose-850 font-black tracking-wider uppercase">
                                {wordItem.language === "english" ? "ANTONYMS" : "বিপরীত শব্দ"}
                              </span>
                            </div>
                            <p className="text-xs sm:text-[13px] font-bold text-rose-955 leading-snug font-bengali">
                              {wordItem.language === "english"
                                ? (wordItem.antonyms?.length > 0 ? wordItem.antonyms.join(", ") : "Not Applicable")
                                : (wordItem.category === "antonym" ? wordItem.meaning : "প্রযোজ্য নয়")}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* EXAMPLE SAMPLES SECTION WITH KEYWORD BLUE SELES HIGHLIGHTING */}
                      {wordItem.example && (
                        <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-[22px] p-4 flex gap-3.5 items-start">
                          <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white shrink-0 text-lg font-serif font-bold">
                            “
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] text-[#1D4ED8] font-black tracking-wider uppercase block mb-0.5">
                              {wordItem.language === "english" ? (wordItem.category === "analogy" ? "RATIONALE" : "EXAMPLE USAGE") : "উৎস ও উদাহরণ"}
                            </span>
                            <p className="text-xs sm:text-[13px] font-semibold text-slate-600 leading-relaxed italic">
                              "{renderHighlightedExample(wordItem.example, wordItem.word)}"
                            </p>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Navigation controllers under detailed card */}
                    <div className="flex justify-center items-center mt-2 w-full">
                      <button
                        onClick={() => toggleMastered(wordItem.id)}
                        className={`h-10 px-6 max-w-[240px] w-full rounded-xl text-xs font-bold font-bengali flex items-center justify-center gap-2 cursor-pointer border transition-all ${
                          isMastered 
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                            : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50 shadow-xs"
                        }`}
                      >
                        <Check className={`w-4 h-4 ${isMastered ? "text-emerald-700 font-bold scale-110" : "text-slate-400"}`} strokeWidth={2.5} />
                        <span>{isMastered ? "মুখস্থ হয়েছে চিহ্নিত" : "মুখস্থ হয়েছে?"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredWords.length > visibleCount && (
                <div className="flex justify-center mt-3 mb-6">
                  <Button
                    onClick={() => setVisibleCount((prev) => prev + 25)}
                    className="font-bengali font-extrabold px-8 py-6 rounded-2xl bg-[#0F2744] text-white hover:bg-[#1a3d66] shadow-[0_4px_14px_rgba(15,39,68,0.25)] hover:scale-[1.02] active:scale-95 transition-all text-sm w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2"
                  >
                    আরো শব্দ লোড করুন ({filteredWords.length - visibleCount}টি বাকি)
                  </Button>
                </div>
              )}
            </div>
            ) : (
              /* MCQ PRACTICE SCREEN */
              <div className="w-full">
                {quizQuestions.length > 0 ? (
                  !quizFinished ? (
                    (() => {
                      const qItem = quizQuestions[currentQuizIndex];
                      return (
                        <div className="bg-white rounded-[32px] p-6 border border-slate-200/80 shadow-sm flex flex-col">
                          
                          <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-4 pb-3 border-b">
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2.5 py-0.5 rounded-full border">
                              VOCAB QUIZ PRACTICE
                            </span>
                            <span>Question {currentQuizIndex + 1} of {quizQuestions.length}</span>
                          </div>

                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
                            <div 
                              className="bg-indigo-600 h-full transition-all duration-300" 
                              style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                            />
                          </div>

                          <div className="text-center my-4">
                            <span className="text-[11px] text-slate-400 font-bengali font-bold block mb-1">শব্দটির সঠিক অর্থ কোনটি?</span>
                            <h3 className="text-2xl sm:text-3xl font-black text-[#0D2A4B] leading-tight select-all">
                              {qItem.word}
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 gap-3 mt-8">
                            {qItem.options.map((option: string, oIdx: number) => {
                              const isSelected = selectedQuizOption === option;
                              const isCorrect = option === qItem.correctMeaning;
                              const hasAnswered = selectedQuizOption !== null;

                              let finalClass = "border-slate-200 bg-slate-50/20 hover:bg-slate-50 text-slate-800";
                              if (hasAnswered) {
                                if (isCorrect) {
                                  finalClass = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                                } else if (isSelected) {
                                  finalClass = "border-rose-500 bg-rose-50 text-rose-850 font-bold";
                                } else {
                                  finalClass = "border-slate-100 bg-white text-slate-350 opacity-55";
                                }
                              }

                              return (
                                <button
                                  key={oIdx}
                                  disabled={hasAnswered}
                                  onClick={() => {
                                    setSelectedQuizOption(option);
                                    if (option === qItem.correctMeaning) {
                                      setQuizScore(prev => prev + 1);
                                    }
                                  }}
                                  className={`w-full p-4 rounded-xl border-2 text-left font-bengali font-semibold text-sm transition-all duration-150 cursor-pointer flex justify-between items-center ${finalClass}`}
                                >
                                  <span>{option}</span>
                                  {hasAnswered && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
                                  {hasAnswered && isSelected && !isCorrect && <X className="w-5 h-5 text-rose-600 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>

                          {selectedQuizOption !== null && (
                            <button
                              onClick={() => {
                                if (currentQuizIndex < quizQuestions.length - 1) {
                                  setCurrentQuizIndex(prev => prev + 1);
                                  setSelectedQuizOption(null);
                                } else {
                                  setQuizFinished(true);
                                }
                              }}
                              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bengali font-bold text-xs py-3.5 rounded-xl cursor-pointer transition-all active:scale-98"
                            >
                              {currentQuizIndex < quizQuestions.length - 1 ? "পরবর্তী প্রশ্ন →" : "ফলাফল দেখুন 🏁"}
                            </button>
                          )}

                        </div>
                      );
                    })()
                  ) : (
                    <div className="bg-white rounded-[32px] border border-slate-200/80 p-8 shadow-sm text-center">
                      <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                        <Award className="w-10 h-10" />
                      </div>
                      
                      <h3 className="text-xl sm:text-2xl font-bengali font-black text-slate-300 text-slate-800 mb-2">কুইজ সেশন সমাপ্ত!</h3>
                      <p className="text-slate-500 font-bengali text-xs max-w-sm mx-auto mb-6">
                        আপনার মেমোরাইজিং স্কিল এবং শব্দকোষের উপর চমৎকার প্রস্তুতি যাচাই সম্পন্ন হয়েছে।
                      </p>

                      <div className="bg-slate-50 border rounded-2xl p-5 grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bengali font-bold uppercase block">মোট প্রশ্ন</span>
                          <span className="text-2xl font-mono font-extrabold text-slate-800">{quizQuestions.length}</span>
                        </div>
                        <div className="border-l border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bengali font-bold uppercase block">সطلب সঠিক</span>
                          <span className="text-2xl font-mono font-extrabold text-emerald-600">{quizScore}</span>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-center">
                        <Button 
                          variant="outline" 
                          onClick={() => startPracticeQuiz()}
                          className="rounded-xl font-bengali font-bold text-xs border-slate-200"
                        >
                          পুনরায় শুরু করুন
                        </Button>
                        <Button 
                          onClick={() => setPracticeMode(false)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bengali font-bold text-xs"
                        >
                          কার্ড চর্চায় ফিরুন
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                    <p className="text-slate-400 font-bengali text-xs">কুইজ সেশনের জন্য কোনো শব্দ পাওয়া যায়নি।</p>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="w-full bg-white rounded-3xl p-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                 <Search className="w-8 h-8 text-slate-400" />
               </div>
               <p className="text-slate-500 font-bengali font-bold text-center">কোনো শব্দ পাওয়া যায়নি!</p>
               <p className="text-xs text-slate-400 font-bengali text-center mt-1">ভিন্ন কিছু লিখে খুঁজুন</p>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}

// HANDY STYLISH ILLUSTRATIONS COMPONENT INSIDE FILE
export function WordIllustration({ word }: { word: string }) {
  // Use a single, unified "memorize" icon for all words to keep it clean and beautiful
  const emoji = "💡";

  return (
    <div className="w-[82px] h-[82px] sm:w-[98px] sm:h-[98px] flex items-center justify-center bg-gradient-to-tr from-amber-50 to-orange-50 rounded-full border-[4px] border-white shadow-xs relative">
      <div className="absolute inset-0 rounded-full bg-[#F59E0B]/10 blur-xl"></div>
      <span className="text-[42px] sm:text-[50px] drop-shadow-sm select-none hover:scale-110 transition-transform duration-300 z-10">{emoji}</span>
    </div>
  );
}
