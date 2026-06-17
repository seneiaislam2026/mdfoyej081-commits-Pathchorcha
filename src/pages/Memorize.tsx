import { useState, useEffect, useMemo } from "react";
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
  ChevronRight,
  PenTool,
  Lock,
  Crown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { db } from "../lib/firebase";
import { collection, getDocs, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { ENGLISH_WORDS, BANGLA_WORDS, WordItem } from "../data/vocabularyData";
import { useAuth } from "../lib/AuthContext";

export default function Memorize() {
  const navigate = useNavigate();
  const { userData, previewClass } = useAuth();
  // Custom structured steps workflow

  const [selectedLanguage, setSelectedLanguage] = useState<"english" | "bangla" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbWords, setDbWords] = useState<WordItem[]>([]);
  const [practiceMode, setPracticeMode] = useState(false); // false = Flashcard, true = MCQ Quiz
  const [askedQuizItemIds, setAskedQuizItemIds] = useState<string[]>([]);
  const initialCount = userData?.isPro ? 30 : 15;
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [activeTab, setActiveTab] = useState<"all" | "bookmarked" | "mastered">("all");

  // MCQ test states
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Fetch from Firebase (or localStorage for guests) when user loads
  useEffect(() => {
    const fetchSavedData = async () => {
      if (userData?.uid) {
        try {
          const snap = await getDoc(doc(db, "users", userData.uid));
          if (snap.exists()) {
            const data = snap.data();
            if (data.masteredWords) setMasteredIds(data.masteredWords);
            if (data.bookmarkedWords) setBookmarkedIds(data.bookmarkedWords);
          }
        } catch (err) {
          console.error("Failed to fetch saved words from profile: ", err);
        }
      } else {
        try {
          const mSaved = localStorage.getItem("mastered_words_guest");
          if (mSaved) setMasteredIds(JSON.parse(mSaved));
          const bSaved = localStorage.getItem("bookmarked_words_guest");
          if (bSaved) setBookmarkedIds(JSON.parse(bSaved));
        } catch {}
      }
    };
    fetchSavedData();
  }, [userData?.uid]);

  // Fetch words in real-time from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "vocabulary"), (snap) => {
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
    }, (err) => {
      console.error("Error loading DB vocabulary realtime:", err);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userData?.uid) {
      localStorage.setItem("mastered_words_guest", JSON.stringify(masteredIds));
    }
  }, [masteredIds, userData?.uid]);

  useEffect(() => {
    if (!userData?.uid) {
      localStorage.setItem("bookmarked_words_guest", JSON.stringify(bookmarkedIds));
    }
  }, [bookmarkedIds, userData?.uid]);

  useEffect(() => {
    setVisibleCount(initialCount);
  }, [selectedLanguage, searchQuery, activeTab, initialCount]);

  // Merge static arrays with client uploaded DB words, de-duplicating by ID
  const allWordsList = useMemo(() => {
    const rawList = [
      ...ENGLISH_WORDS,
      ...BANGLA_WORDS,
      ...dbWords
    ];
    const map = new Map();
    rawList.forEach(w => {
      map.set(w.id, w);
    });
    return Array.from(map.values());
  }, [dbWords]);

  const wordsList = useMemo(() => {
    return allWordsList.filter((w) => {
      const effectiveClass = previewClass || userData?.class;
      
      const isClass6Target = effectiveClass === "৬ষ্ঠ থেকে ৮ম শ্রেণী" || effectiveClass === "৬ষ্ঠ শ্রেণী" || effectiveClass === "৭ম শ্রেণী" || effectiveClass === "৮ম শ্রেণী";
      const isClass6Vocab = w.category === "class_6_vocabulary" || w.category === "verb_forms";
      if (isClass6Vocab && !isClass6Target) return false;
      if (!isClass6Vocab && isClass6Target) return false;

      const isHSCTarget = effectiveClass === "এইচএসসি" || effectiveClass === "একাদশ শ্রেণী" || effectiveClass === "দ্বাদশ শ্রেণী";
      const isHSCVocab = w.category === "paragraph";
      if (isHSCVocab && !isHSCTarget) return false;
      
      return true;
    });
  }, [allWordsList, previewClass, userData?.class]);

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
    const pool = wordsList.filter(w => 
      masteredIds.includes(w.id) && 
      w.language === (selectedLanguage || "english") &&
      (!selectedCategory || selectedCategory === "all" || w.category === selectedCategory)
    );
    
    // Attempt to use unasked questions first
    let unaskedPool = pool.filter(w => !askedQuizItemIds.includes(w.id));
    if (unaskedPool.length < 4) {
       // If exhausted, reset and just use the whole pool again
       unaskedPool = pool;
       setAskedQuizItemIds([]);
    }

    if (unaskedPool.length < 4) {
      setQuizQuestions([]);
      return;
    }
    
    const shuffled = [...unaskedPool].sort(() => 0.5 - Math.random()).slice(0, 20);
    setAskedQuizItemIds(prev => {
        // If we reset this pass, just return newly asked
        if (unaskedPool.length === pool.length) return shuffled.map(q => q.id);
        return [...prev, ...shuffled.map(q => q.id)];
    });

    const questions = shuffled.map((item) => {
      const wrongPool = pool.filter(p => p.id !== item.id);
      
    const isFillInBlank = item.category === "appropriate_preposition" || item.category === "group_verb";
    
    const getAnswerWord = (p: any) => {
      const raw = p.word.replace(/\(.*\)/g, '').trim();
      if (raw.includes('/')) {
        const parts = raw.split(' ').pop().split('/');
        for (const part of parts) {
          if (p.example && new RegExp('\\b' + part + '\\b', 'i').test(p.example)) return part;
        }
        return parts[0];
      }
      return raw.split(' ').pop() || "";
    };

    let questionType = "MEANING";
    let corMeaning = "";
    let wordDisplay = item.word;
    
    const getRandomWord = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)].split(',')[0].trim();
    const cleanMeaning = (m: string) => m.split('(')[0].split('-')[0].trim();

    if (isFillInBlank) {
      questionType = "FILL_BLANK";
      const ansPrep = getAnswerWord(item);
      corMeaning = ansPrep.toLowerCase();
      
      let qText = item.example || item.word;
      const blankRegex = new RegExp('\\b' + ansPrep + '\\b', 'i');
      if (blankRegex.test(qText)) {
        qText = qText.replace(blankRegex, '_______');
      } else {
        qText = qText.replace(new RegExp(ansPrep, 'i'), '_______');
      }
      wordDisplay = qText;
    } else {
      const hasSynonyms = item.synonyms && item.synonyms.length > 0;
      const hasAntonyms = item.antonyms && item.antonyms.length > 0;
      
      questionType = Math.random() > 0.5 ? "SYNONYM" : "ANTONYM";
      if (questionType === "SYNONYM" && !hasSynonyms && hasAntonyms) {
          questionType = "ANTONYM";
      } else if (questionType === "ANTONYM" && !hasAntonyms && hasSynonyms) {
          questionType = "SYNONYM";
      } else if (!hasSynonyms && !hasAntonyms) {
          questionType = "MEANING";
      }
      
      if (questionType === "SYNONYM") corMeaning = getRandomWord(item.synonyms);
      else if (questionType === "ANTONYM") corMeaning = getRandomWord(item.antonyms);
      else corMeaning = cleanMeaning(item.meaning);
    }
    
    const getWrongOption = (p: any, type: string) => {
      if (type === "FILL_BLANK") {
         return getAnswerWord(p).toLowerCase();
      }
      if (type === "SYNONYM" || type === "ANTONYM") {
        if (p.synonyms && p.synonyms.length > 0) return getRandomWord(p.synonyms);
        if (p.antonyms && p.antonyms.length > 0) return getRandomWord(p.antonyms);
        return p.word;
      }
      return cleanMeaning(p.meaning);
    };
    
    const wrongMeanings = wrongPool.map(p => getWrongOption(p, questionType));
    const distinctWrong = Array.from(new Set(wrongMeanings)).filter(m => m !== corMeaning && m !== "").sort(() => 0.5 - Math.random()).slice(0, 3);
    
    // Fill from wordsList if short
    let fallbackAttempts = 0;
    while (distinctWrong.length < 3 && fallbackAttempts < 50) {
      fallbackAttempts++;
      const fallbackWord = wordsList[Math.floor(Math.random() * wordsList.length)];
      if (isFillInBlank) {
         if (fallbackWord.category !== item.category) continue;
      } else {
         if (fallbackWord.language !== "english" || fallbackWord.category === "appropriate_preposition" || fallbackWord.category === "group_verb") continue;
      }
      const fallbackWrong = getWrongOption(fallbackWord, questionType);
      if (fallbackWrong && fallbackWrong !== corMeaning && !distinctWrong.includes(fallbackWrong)) {
        distinctWrong.push(fallbackWrong);
      }
    }
    
    const options = [corMeaning, ...distinctWrong].sort(() => 0.5 - Math.random());

    return {
      word: wordDisplay,
      correctMeaning: corMeaning,
      options,
      questionType,
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

  const toggleMastered = async (id: string) => {
    const newIds = masteredIds.includes(id) ? masteredIds.filter(x => x !== id) : [...masteredIds, id];
    setMasteredIds(newIds);
    if (userData?.uid) {
      try {
        await updateDoc(doc(db, "users", userData.uid), { masteredWords: newIds });
      } catch (e) {
        console.error("Error updating mastered words", e);
      }
    }
  };

  const toggleBookmark = async (id: string) => {
    const newIds = bookmarkedIds.includes(id) ? bookmarkedIds.filter(x => x !== id) : [...bookmarkedIds, id];
    setBookmarkedIds(newIds);
    if (userData?.uid) {
      try {
        await updateDoc(doc(db, "users", userData.uid), { bookmarkedWords: newIds });
      } catch (e) {
        console.error("Error updating bookmarked words", e);
      }
    }
  };

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case "samarthok": return selectedLanguage === "english" ? "Synonym" : "সমার্থক শব্দ";
      case "antonym": return selectedLanguage === "english" ? "Antonym" : "বিপরীত শব্দ";
      case "ek_kothay": return "এক কথায় প্রকাশ";
      case "paribhashik": return "পারিভাষিক শব্দ";
      case "bagdhara": return "বাগধারা";
      case "vocabulary": return "Vocabulary";
      case "synonym": return "Synonym";
      case "analogy": return "Analogy";
      case "appropriate_preposition": return "Appro. Prep.";
      case "group_verb": return "Group Verb";
      case "spelling": return "Spelling";
      case "class_6_vocabulary": return "Class 6 English";
      case "verb_forms": return "Verb (3 Forms)";
      case "paragraph": return "HSC Paragraphs";
      case "idiom_phrase": return "Idiom & Phrase";
      case "translation": return "Translation";
      default: return "Vocabulary";
    }
  };

  const wordMeaningMap = useMemo(() => {
    const map = new Map<string, string>();
    // First pass: Populate all actual defined meanings
    allWordsList.forEach(w => {
      if (w.language === "english" && w.meaning) {
        const cleanMeaning = w.meaning.split("(")[0].split("-")[0].replace(/[a-zA-Z]/g, '').trim();
        if (cleanMeaning) {
          map.set(w.word.toLowerCase().trim(), cleanMeaning);
        }
      }
    });
    // Second pass: Infer missing synonyms from the root word
    allWordsList.forEach(w => {
      if (w.language === "english" && w.synonyms && w.meaning) {
        const cleanMeaning = w.meaning.split("(")[0].split("-")[0].replace(/[a-zA-Z]/g, '').trim();
        w.synonyms.forEach(s => {
          const sl = s.toLowerCase().trim();
          if (!map.has(sl) && cleanMeaning) {
            map.set(sl, cleanMeaning);
          }
        });
      }
    });
    return map;
  }, [allWordsList]);

  const renderSynonymsAntonyms = (words: string[], type: "synonym" | "antonym", currentWordMeaning?: string) => {
    if (!words || words.length === 0) return "Not Applicable";
    
    const groups: { meaning: string; wList: string[] }[] = [];
    words.forEach(s => {
      const w = s.trim();
      const sl = w.toLowerCase();
      let m = wordMeaningMap.get(sl) || "";
      
      // Fallback to parent meaning if still missing (useful for synonyms that don't appear elsewhere)
      if (!m && type === "synonym" && currentWordMeaning) {
        m = currentWordMeaning.split("(")[0].split("-")[0].replace(/[a-zA-Z]/g, '').trim();
      }

      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.meaning === m) {
        lastGroup.wList.push(w);
      } else {
        groups.push({ meaning: m, wList: [w] });
      }
    });

    return (
      <div className="leading-relaxed mt-0.5 flex flex-wrap gap-x-1 break-words">
        {groups.map((group, idx) => (
           <span key={idx} className="inline break-words">
             <span className="font-bold">{group.wList.join(", ")}</span>
             {group.meaning && <span className="text-[12.5px] md:text-[13px] font-medium font-bengali opacity-85 ml-1.5">({group.meaning})</span>}
             {idx < groups.length - 1 && <span className="mr-1.5 opacity-60 font-medium">, </span>}
           </span>
        ))}
      </div>
    );
  };

  const getCategoryIcon = (cat: string, className: string = "w-6 h-6 text-indigo-500 group-hover:text-white") => {
    switch(cat) {
      case "vocabulary": return <Brain className={className} />;
      case "samarthok": return <Layers className={className} />;
      case "synonym": return <Layers className={className} />;
      case "antonym": return <Shuffle className={className} />;
      case "ek_kothay": return <Quote className={className} />;
      case "paribhashik": return <BookOpen className={className} />;
      case "bagdhara": return <Quote className={className} />;
      case "analogy": return <LinkIcon className={className} />;
      case "appropriate_preposition": return <LinkIcon className={className} />;
      case "group_verb": return <Layers className={className} />;
      case "spelling": return <PenTool className={className} />;
      case "class_6_vocabulary": return <BookOpen className={className} />;
      case "verb_forms": return <Shuffle className={className} />;
      case "paragraph": return <Quote className={className} />;
      case "idiom_phrase": return <Quote className={className} />;
      case "translation": return <BookOpen className={className} />;
      default: return <BookOpen className={className} />;
    }
  };

  const getCategoryStyle = (cat: string) => {
    switch(cat) {
      case "vocabulary": return { bg: "bg-purple-100", text: "text-purple-600", light: "bg-purple-50", border: "hover:border-purple-200" };
      case "spelling": return { bg: "bg-indigo-100", text: "text-indigo-600", light: "bg-indigo-50", border: "hover:border-indigo-200" };
      case "translation": return { bg: "bg-sky-100", text: "text-sky-600", light: "bg-sky-50", border: "hover:border-sky-200" };
      case "analogy": return { bg: "bg-blue-100", text: "text-blue-600", light: "bg-blue-50", border: "hover:border-blue-200" };
      case "appropriate_preposition": return { bg: "bg-green-100", text: "text-green-600", light: "bg-green-50", border: "hover:border-green-200" };
      case "group_verb": return { bg: "bg-orange-100", text: "text-orange-600", light: "bg-orange-50", border: "hover:border-orange-200" };
      case "paragraph": return { bg: "bg-emerald-100", text: "text-emerald-600", light: "bg-emerald-50", border: "hover:border-emerald-200" };
      case "idiom_phrase": return { bg: "bg-yellow-100", text: "text-yellow-600", light: "bg-yellow-50", border: "hover:border-yellow-200" };
      
      case "samarthok": return { bg: "bg-cyan-100", text: "text-cyan-600", light: "bg-cyan-50", border: "hover:border-cyan-200" };
      case "synonym": return { bg: "bg-cyan-100", text: "text-cyan-600", light: "bg-cyan-50", border: "hover:border-cyan-200" };
      case "antonym": return { bg: "bg-rose-100", text: "text-rose-600", light: "bg-rose-50", border: "hover:border-rose-200" };
      case "ek_kothay": return { bg: "bg-teal-100", text: "text-teal-600", light: "bg-teal-50", border: "hover:border-teal-200" };
      case "paribhashik": return { bg: "bg-fuchsia-100", text: "text-fuchsia-600", light: "bg-fuchsia-50", border: "hover:border-fuchsia-200" };
      case "bagdhara": return { bg: "bg-orange-100", text: "text-orange-600", light: "bg-orange-50", border: "hover:border-orange-200" };
      
      case "class_6_vocabulary": return { bg: "bg-pink-100", text: "text-pink-600", light: "bg-pink-50", border: "hover:border-pink-200" };
      case "verb_forms": return { bg: "bg-amber-100", text: "text-amber-600", light: "bg-amber-50", border: "hover:border-amber-200" };

      default: return { bg: "bg-indigo-100", text: "text-indigo-600", light: "bg-indigo-50", border: "hover:border-indigo-200" };
    }
  };

  const handleSpeech = (wordText: string, langType: string) => {
    if (!window?.speechSynthesis) return;
    
    // Always cancel to prevent queuing up and stuck speech
    window.speechSynthesis.cancel();

    // A slight delay ensures the cancel has completely cleared the queue before speaking
    setTimeout(() => {
      const voiceTone = new SpeechSynthesisUtterance(wordText);
      voiceTone.lang = langType === "english" ? "en-US" : "bn-BD";
      voiceTone.rate = 0.9; 
      
      window.speechSynthesis.speak(voiceTone);
    }, 50);
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
        {!selectedLanguage ? (
          <div className="mb-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-200/50 rounded-full transition-all active:scale-95 -ml-2 cursor-pointer"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
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
                className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-200/50 rounded-full transition-all active:scale-95 -ml-2 cursor-pointer"
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
            <div className="flex flex-col items-center mb-4 sm:mb-6 relative z-10 w-full text-center mt-2">
              <h1 className="text-2xl sm:text-3xl font-bengali font-extrabold text-[#0D2A4B] mb-2 tracking-tight">
                বিষয় নির্বাচন করুন।
              </h1>
              <p className="text-[#64748B] font-bengali text-base sm:text-lg mb-4">
                আপনি কোনটি চর্চা করতে চান?
              </p>
              
              {/* Underline Decorative */}
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <div className="h-1.5 w-16 bg-[#3B82F6] rounded-full"></div>
                <div className="h-1.5 w-2.5 bg-[#3B82F6] rounded-full"></div>
              </div>
            </div>

            {/* Cards container */}
            <div className="flex flex-col gap-5 w-full relative z-10 px-2 sm:px-4">
              
              {/* English Card */}
              <button 
                onClick={() => setSelectedLanguage("english")}
                className="bg-white rounded-[20px] sm:rounded-[32px] p-4 sm:p-8 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 transition-all group overflow-hidden relative cursor-pointer w-full text-left"
              >
                <div className="flex items-center gap-4 sm:gap-8 relative z-10 w-full">
                  {/* Illustration */}
                  <div className="w-16 h-16 sm:w-28 sm:h-28 flex-shrink-0 flex items-center justify-center">
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
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-1 sm:mb-2 border border-blue-100">
                      <span className="text-[#2563EB] text-xl sm:text-2xl font-black">A</span>
                    </div>
                    <h3 className="text-lg sm:text-[24px] font-bengali font-extrabold text-[#0D2A4B] tracking-tight leading-loose sm:leading-tight">ইংরেজি শব্দকোষ</h3>
                  </div>
                  
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#2563EB] rounded-full flex items-center justify-center text-white shadow-md group-hover:bg-[#1D4ED8] group-hover:scale-105 transition-all flex-shrink-0">
                    <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={2.5} />
                  </div>
                </div>
              </button>

              {/* Bangla Card */}
              <button 
                onClick={() => setSelectedLanguage("bangla")}
                className="bg-white rounded-[20px] sm:rounded-[32px] p-4 sm:p-8 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 transition-all group overflow-hidden relative cursor-pointer w-full text-left"
              >
                 <div className="flex items-center gap-4 sm:gap-8 relative z-10 w-full">
                  {/* Illustration */}
                  <div className="w-16 h-16 sm:w-28 sm:h-28 flex-shrink-0 flex items-center justify-center">
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
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ECFDF5] rounded-full flex items-center justify-center mb-1 sm:mb-2 border border-green-100">
                      <span className="text-[#10B981] text-xl sm:text-2xl font-black mt-0.5 sm:mt-1">অ</span>
                    </div>
                    <h3 className="text-lg sm:text-[24px] font-bengali font-extrabold text-[#0D2A4B] tracking-tight leading-loose sm:leading-tight">বাংলা শব্দকোষ</h3>
                  </div>
                  
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#10B981] rounded-full flex items-center justify-center text-white shadow-md group-hover:bg-[#059669] group-hover:scale-105 transition-all flex-shrink-0">
                    <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={2.5} />
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
              {Array.from(new Set(wordsList.filter(w => w.language === selectedLanguage).map(w => w.category || 'vocabulary')))
                .filter(cat => cat !== 'synonym' && !(selectedLanguage === 'english' && (cat === 'antonym' || cat === 'samarthok')))
                .map(cat => {
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
                      <div className={`bg-white p-6 sm:p-8 flex flex-col gap-5 overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.032)] ${wordItem.category === 'paragraph' ? '-mx-4 sm:mx-0 w-[calc(100%+2rem)] sm:w-full rounded-none sm:rounded-[32px] border-y sm:border border-slate-150/90' : 'rounded-[32px] border border-slate-150/90'}`}>
                        
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

                      {/* DEFINITION SECTION BOX - ALWAYS SHOWN FOR ENGLISH, AND FOR BANGLA ONLY IF EK_KOTHAY, PARIBHASHIK OR BAGDHARA */}
                      {(wordItem.language === "english" || wordItem.category === "ek_kothay" || wordItem.category === "paribhashik" || wordItem.category === "bagdhara") && wordItem.category !== "paragraph" && (
                        <div className="bg-[#FAF5FF] border border-[#F3E8FF] rounded-[22px] p-4 flex gap-3.5 items-start">
                          <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-[#8B5CF6]" />
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8B5CF6] font-black tracking-wider uppercase block mb-0.5">
                              {wordItem.language === "english" ? (wordItem.category === "analogy" ? "RELATED PAIR" : (wordItem.category === "appropriate_preposition" || wordItem.category === "group_verb") ? "BENGALI MEANING" : "DEFINITION") : (wordItem.category === "ek_kothay" ? "এক কথায় প্রকাশ" : wordItem.category === "bagdhara" ? "অর্থ" : "পারিভাষিক শব্দ")}
                            </span>
                            <>
                              <h4 className="font-bengali text-base font-extrabold text-[#7C3AED] leading-snug">
                                {wordItem.meaning.split("(")[0].trim()}
                              </h4>
                              {wordItem.meaning.includes("(") && (
                                <p className="text-[11px] sm:text-xs text-slate-500 font-sans mt-0.5 italic leading-tight">
                                  ({wordItem.meaning.split("(")[1]}
                                </p>
                              )}
                            </>
                          </div>
                        </div>
                      )}

                      {/* PARAGRAPH CONTENT BOX */}
                      {wordItem.category === "paragraph" && (
                        <div className="w-[calc(100%+3rem)] -mx-6 sm:w-full sm:mx-0 bg-[#F8FAFC] border-y sm:border border-slate-200 sm:rounded-[24px] p-5 px-6 sm:p-8 relative">
                           <div className="flex items-center gap-2 mb-5">
                             <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                               <BookOpen className="w-4 h-4 text-emerald-600" />
                             </div>
                             <span className="text-xs sm:text-sm text-emerald-700 font-extrabold tracking-widest uppercase">
                               PARAGRAPH CONTENT
                             </span>
                           </div>
                           <div className="font-sans text-[16px] sm:text-[18px] text-slate-800 leading-[1.8] text-justify">
                             {wordItem.meaning.split('\n\n').filter(Boolean).map((para, idx) => (
                               <p key={idx} className="mb-4 last:mb-0 indent-8">{para}</p>
                             ))}
                           </div>
                        </div>
                      )}

                      {/* SPELLING HINT */}
                      {wordItem.category === "spelling" && wordItem.synonyms && wordItem.synonyms.length > 0 && (
                        <div className="bg-[#F3E8FF] border border-[#E9D5FF] rounded-[22px] p-4 flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 rounded-full bg-[#A855F7] flex items-center justify-center shrink-0">
                              <Sparkles className="w-3 h-3 text-white" strokeWidth={4} />
                            </div>
                            <span className="text-[10px] text-[#7E22CE] font-black tracking-wider uppercase">
                              SPELLING HINT
                            </span>
                          </div>
                          <p className="text-sm sm:text-base font-bold text-[#4C1D95] leading-snug">
                            {wordItem.synonyms.join(" • ")}
                          </p>
                        </div>
                      )}

                      {/* SYNONYMS & ANTONYMS COLUMN LAYOUT */}
                      {((wordItem.language === "english" && !["analogy", "appropriate_preposition", "group_verb", "spelling", "class_6_vocabulary", "paragraph", "idiom_phrase", "translation"].includes(wordItem.category)) || (wordItem.language === "bangla" && !["ek_kothay", "spelling", "paribhashik", "bagdhara"].includes(wordItem.category))) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {/* Synonyms / V2 with check indicator */}
                          <div className={`bg-[#F0FDF4] border border-[#DCFCE7] rounded-[22px] p-4 flex flex-col gap-1.5 ${wordItem.language === 'bangla' && wordItem.category !== 'samarthok' ? 'opacity-50 grayscale' : ''}`}>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <div className="w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 text-white" strokeWidth={4} />
                              </div>
                              <span className="text-[10px] text-[#166534] font-black tracking-wider uppercase">
                                {wordItem.category === "verb_forms" ? "PAST FORM (V2)" : wordItem.language === "english" ? "SYNONYMS" : "সমার্থক শব্দ"}
                              </span>
                            </div>
                            <div className="text-xs sm:text-[13px] font-bold text-emerald-950 leading-snug font-bengali">
                              {wordItem.language === "english" 
                                ? (wordItem.synonyms?.length > 0 ? renderSynonymsAntonyms(wordItem.synonyms, "synonym", wordItem.meaning) : "Not Applicable")
                                : (wordItem.category === "samarthok" ? wordItem.meaning : "প্রযোজ্য নয়")}
                            </div>
                          </div>

                          {/* Antonyms / V3 with cross indicator */}
                          <div className={`bg-[#FEF2F2] border border-[#FEE2E2] rounded-[22px] p-4 flex flex-col gap-1.5 ${wordItem.language === 'bangla' && wordItem.category !== 'antonym' ? 'opacity-50 grayscale' : ''}`}>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
                                <X className="w-3 h-3 text-white" strokeWidth={4} />
                              </div>
                              <span className="text-[10px] text-rose-850 font-black tracking-wider uppercase">
                                {wordItem.category === "verb_forms" ? "PAST PARTICIPLE (V3)" : wordItem.language === "english" ? "ANTONYMS" : "বিপরীত শব্দ"}
                              </span>
                            </div>
                            <div className="text-xs sm:text-[13px] font-bold text-rose-955 leading-snug font-bengali">
                              {wordItem.language === "english"
                                ? (wordItem.antonyms?.length > 0 ? renderSynonymsAntonyms(wordItem.antonyms, "antonym", wordItem.meaning) : "Not Applicable")
                                : (wordItem.category === "antonym" ? wordItem.meaning : "প্রযোজ্য নয়")}
                            </div>
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
                <div className="flex justify-center mt-3 mb-6 w-full px-2">
                  {userData?.isPro ? (
                    <Button
                      onClick={() => setVisibleCount((prev) => prev + 50)}
                      className="font-bengali font-extrabold px-8 py-6 rounded-2xl bg-[#0F2744] text-white hover:bg-[#1a3d66] shadow-[0_4px_14px_rgba(15,39,68,0.25)] hover:scale-[1.02] active:scale-95 transition-all text-sm w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2"
                    >
                      আরো শব্দ লোড করুন ({filteredWords.length - visibleCount}টি বাকি)
                    </Button>
                  ) : (
                    <div className="w-full max-w-2xl bg-gradient-to-br from-orange-50 to-[#FFB800]/10 border border-orange-200/60 rounded-[32px] p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center text-center mt-4 mb-2 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Crown className="w-32 h-32 text-orange-500" />
                      </div>
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(234,88,12,0.1)] mb-4 sm:mb-5 relative z-10 border border-orange-100">
                        <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-[#EA580C]" />
                      </div>
                      <h3 className="font-bengali text-lg sm:text-xl md:text-2xl font-extrabold text-[#9A3412] mb-2 sm:mb-3 relative z-10 tracking-tight">সম্পূর্ণ শব্দকোষ আনলক করুন</h3>
                      <p className="text-orange-900/70 font-bengali text-xs sm:text-[13px] md:text-sm font-semibold mb-6 sm:mb-8 max-w-md relative z-10 leading-relaxed px-4">
                        ফ্রি একাউন্টে সীমিত সংখ্যক শব্দ দেখার সুযোগ রয়েছে। হাজারো শব্দের প্রো ডিকশনারি ও কুইজ আনলক করতে নির্দিষ্ট প্ল্যান নির্বাচন করুন।
                      </p>
                      <button onClick={() => navigate("/profile")} className="relative z-10 w-full sm:w-auto">
                        <div className="bg-gradient-to-br from-[#FFB800] to-[#F59E0B] hover:from-[#E5A600] hover:to-[#D97706] text-white font-bengali font-extrabold rounded-xl px-8 py-4 sm:py-4.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center border-0 text-[13px] sm:text-sm">
                          <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> প্রো সাবস্ক্রিপশন নিন 
                        </div>
                      </button>
                    </div>
                  )}
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
                            <div className="mb-4">
                              <span className="text-xs sm:text-[13px] text-indigo-700 font-sans font-bold inline-block px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm uppercase tracking-wide">
                                {qItem.questionType === 'SYNONYM' ? 'Choose the correct synonym' : 
                                 qItem.questionType === 'ANTONYM' ? 'Choose the correct antonym' : 
                                 qItem.questionType === 'FILL_BLANK' ? 'Fill in the blank' : 
                                 'Choose the correct meaning'}
                              </span>
                            </div>
                            <h3 className={`font-black text-[#0D2A4B] leading-tight select-all tracking-tight ${qItem.questionType === 'FILL_BLANK' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-4xl'}`}>
                              {qItem.word}
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 gap-3.5 mt-8">
                            {qItem.options.map((option: string, oIdx: number) => {
                              const isSelected = selectedQuizOption === option;
                              const isCorrect = option === qItem.correctMeaning;
                              const hasAnswered = selectedQuizOption !== null;

                              let finalClass = "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 shadow-sm";
                              if (hasAnswered) {
                                if (isCorrect) {
                                  finalClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-md shadow-emerald-500/10";
                                } else if (isSelected) {
                                  finalClass = "border-rose-500 bg-rose-50 text-rose-900 font-bold border-2";
                                } else {
                                  finalClass = "border-slate-100 bg-slate-50 text-slate-400 opacity-60";
                                }
                              }

                              const optionLabel = String.fromCharCode(65 + oIdx);

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
                                  className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex justify-between items-center group ${finalClass} ${!hasAnswered ? "hover:-translate-y-0.5 active:translate-y-0" : ""}`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${hasAnswered ? (isCorrect ? 'bg-emerald-500 text-white' : (isSelected ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-500')) : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700'}`}>
                                      {optionLabel}
                                    </div>
                                    <span className={`font-bengali text-[15px] sm:text-base leading-snug ${hasAnswered && (isCorrect || isSelected) ? 'font-black' : 'font-semibold'}`}>{option}</span>
                                  </div>
                                  {hasAnswered && isCorrect && <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />}
                                  {hasAnswered && isSelected && !isCorrect && <X className="w-6 h-6 text-rose-500 shrink-0" />}
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
                    <div className="bg-white rounded-[32px] border border-slate-200/80 p-8 sm:p-10 shadow-xl shadow-slate-200/40 text-center max-w-md mx-auto relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />
                      
                      <div className="w-24 h-24 rounded-full bg-gradient-to-b from-emerald-100 to-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg shadow-emerald-500/10 relative z-10">
                        <Award className="w-12 h-12" />
                      </div>
                      
                      <h3 className="text-2xl sm:text-3xl font-bengali font-black text-slate-800 mb-3 relative z-10">কুইজ সেশন সমাপ্ত!</h3>
                      <p className="text-slate-500 font-bengali text-sm max-w-xs mx-auto mb-8 relative z-10 leading-relaxed">
                        আপনার মেমোরাইজিং স্কিল চমৎকার! এভাবে চর্চা চালিয়ে যান।
                      </p>

                      <div className="bg-white border border-slate-100 rounded-3xl p-6 grid grid-cols-2 gap-4 mx-auto mb-8 relative z-10 shadow-sm">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-[11px] text-slate-400 font-bengali font-bold uppercase tracking-wider mb-1">মোট প্রশ্ন</span>
                          <span className="text-4xl font-black text-slate-700">{quizQuestions.length}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center border-l-2 border-slate-50">
                          <span className="text-[11px] text-emerald-500 font-bengali font-bold uppercase tracking-wider mb-1">সঠিক উত্তর</span>
                          <span className="text-4xl font-black text-emerald-500">{quizScore}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
                        <Button 
                          variant="outline" 
                          onClick={() => startPracticeQuiz()}
                          className="rounded-xl font-bengali font-bold border-slate-200 py-6 text-sm text-slate-600 hover:bg-slate-50 w-full sm:w-auto"
                        >
                          পুনরায় শুরু করুন
                        </Button>
                        <Button 
                          onClick={() => setPracticeMode(false)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bengali font-bold py-6 text-sm shadow-md shadow-indigo-600/20 w-full sm:w-auto"
                        >
                          কার্ড চর্চায় ফিরুন
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 flex flex-col items-center p-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Lock className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 font-bengali mb-2">ইংরেজি শব্দ মুখস্থ নেই</h3>
                    <p className="text-slate-500 font-bengali text-sm mb-6 max-w-sm text-center leading-relaxed">
                      কুইজ দেওয়ার জন্য অন্তত ৪টি ইংরেজি শব্দ 'মুখস্থ হয়েছে' (Mastered) তালিকায় থাকতে হবে। অনুগ্রহ করে কিছু ইংরেজি শব্দ মুখস্থ করুন।
                    </p>
                    <Button 
                      onClick={() => setPracticeMode(false)}
                      className="bg-[#0F2744] hover:bg-[#1a3d66] text-white rounded-xl font-bengali font-bold px-6 py-5 shadow-lg shadow-[#0F2744]/20"
                    >
                      শব্দকোষে ফিরে যান
                    </Button>
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
