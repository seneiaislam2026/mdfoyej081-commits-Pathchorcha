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
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  VolumeX,
  HelpCircle as QuizIcon,
  BookOpen as ReadingIcon,
  Award,
  Languages,
  RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface WordItem {
  id: string;
  word: string;
  language: "english" | "bangla";
  category: "vocabulary" | "synonym" | "antonym" | "samarthok" | "ek_kothay" | "analogy";
  pronunciation?: string;
  meaning: string;
  synonyms: string[];
  antonyms: string[];
  example?: string;
}

const ENGLISH_WORDS: WordItem[] = [
  {
    id: "eng_1",
    word: "Abundant",
    language: "english",
    category: "vocabulary",
    pronunciation: "অ্যাব্যান্ডেন্ট / আবানডেন্ট",
    meaning: "প্রচুর, আধিক্যপূর্ণ (Plentiful, existing in large quantities)",
    synonyms: ["Plentiful", "Ample", "Copious", "Bountiful"],
    antonyms: ["Scarce", "Sparse", "Meager", "Deficient"],
    example: "The region has abundant natural resources."
  },
  {
    id: "eng_2",
    word: "Benevolent",
    language: "english",
    category: "vocabulary",
    pronunciation: "বেনেভোলেন্ট",
    meaning: "দয়ালু, পরোপকারী (Kind, well-meaning, and kindly)",
    synonyms: ["Kind", "Generous", "Altruistic", "Philanthropic"],
    antonyms: ["Malevolent", "Miserly", "Cruel", "Hostile"],
    example: "A benevolent donor funded the new school building."
  },
  {
    id: "eng_3",
    word: "Candid",
    language: "english",
    category: "vocabulary",
    pronunciation: "ক্যান্ডিড",
    meaning: "অকপট, সরল, স্পষ্টভাষী (Truthful and straightforward; frank)",
    synonyms: ["Frank", "Honest", "Sincere", "Outspoken"],
    antonyms: ["Deceitful", "Evasive", "Artful", "Insincere"],
    example: "She gave a candid opinion about the new proposal."
  },
  {
    id: "eng_4",
    word: "Diligent",
    language: "english",
    category: "vocabulary",
    pronunciation: "ডিলিজেন্ট",
    meaning: "পরিশ্রমী, অধ্যবসায়ী (Hardworking and care in one's work)",
    synonyms: ["Industrious", "Assiduous", "Hardworking", "Sedulous"],
    antonyms: ["Lazy", "Indolent", "Idle", "Negligent"],
    example: "Only diligent students can secure top marks in exam."
  },
  {
    id: "eng_5",
    word: "Ephemeral",
    language: "english",
    category: "vocabulary",
    pronunciation: "ইফেমারাল",
    meaning: "ক্ষণস্থায়ী, অল্পক্ষণ টিকে থাকে এমন (Lasting for a very short time)",
    synonyms: ["Transient", "Fleeting", "Momentary", "Temporary"],
    antonyms: ["Eternal", "Permanent", "Perpetual", "Enduring"],
    example: "Fame in the digital world is often ephemeral."
  },
  {
    id: "eng_6",
    word: "Incite",
    language: "english",
    category: "synonym",
    pronunciation: "ইনসাইট",
    meaning: "উত্তেজিত করা, প্ররোচিত করা (Encourage or stir up violent behavior)",
    synonyms: ["Provoke", "Instigate", "Arouse", "Stimulate"],
    antonyms: ["Appease", "Pacify", "Dampen", "Deter"],
    example: "They were accused of trying to incite a riot."
  },
  {
    id: "eng_7",
    word: "Meticulous",
    language: "english",
    category: "synonym",
    pronunciation: "মেটিকিউলাস",
    meaning: "অতিশয় যত্নবান, নিখুঁত (Showing great attention to detail)",
    synonyms: ["Precise", "Detailed", "Scrupulous", "Fastidious"],
    antonyms: ["Careless", "Sloppy", "Negligent", "Casual"],
    example: "He was meticulous about keeping his records clean."
  },
  {
    id: "eng_8",
    word: "Obsolete",
    language: "english",
    category: "antonym",
    pronunciation: "অবসলিট",
    meaning: "অপ্রচলিত, সেকেলে (No longer produced or used; out of date)",
    synonyms: ["Outdated", "Archaic", "Antiquated", "Anachronistic"],
    antonyms: ["Modern", "Contemporary", "Current", "Novel"],
    example: "Floppy disks are obsolete data storage tools now."
  },
  {
    id: "eng_9",
    word: "Resilient",
    language: "english",
    category: "antonym",
    pronunciation: "রেজিলিয়েন্ট",
    meaning: "স্থিতিস্থাপক, ঘুরে দাঁড়াতে পারে এমন (Able to withstand or recover quickly)",
    synonyms: ["Buoyant", "Elastic", "Tough", "Hardy"],
    antonyms: ["Fragile", "Vulnerable", "Delicate", "Weak"],
    example: "The local economy proved surprisingly resilient."
  },
  {
    id: "eng_10",
    word: "Fire : Ashes :: Explosion : Destruction",
    language: "english",
    category: "analogy",
    pronunciation: "ফায়ার : অ্যাশেস • এক্সপ্লোশন : ডেস্ট্রাকশন",
    meaning: "আগুন পুড়ে ছাই হয়, তেমনি বিস্ফোরণে ধ্বংস নেমে আসে (Cause and Effect analogy)",
    synonyms: ["Cause-Effect", "Relationship"],
    antonyms: [],
    example: "Identify the similar relationship: Fire leads to ashes, as explosion leads to destruction."
  },
  {
    id: "eng_11",
    word: "Lover : Devotion :: Soldier : Loyalty",
    language: "english",
    category: "analogy",
    pronunciation: "লাভার : ডিভোশন • সোলজার : লয়ালটি",
    meaning: "প্রেমিকের বৈশিষ্ট্য ভক্তি, তেমনি সৈনিকের বৈশিষ্ট্য আনুগত্য (Characteristic analogy)",
    synonyms: ["Characteristic", "Relationship"],
    antonyms: [],
    example: "Devotion is to a lover as loyalty is to a soldier."
  }
];

const BANGLA_WORDS: WordItem[] = [
  {
    id: "bng_1",
    word: "অনল",
    language: "bangla",
    category: "samarthok",
    meaning: "আগুন, অগ্নি",
    synonyms: ["অগ্নি", "বহ্নি", "হুতাসন", "পাবক", "শিখা", "আগুন"],
    antonyms: ["জল", "বারি", "নীর", "সলিল"],
    example: "অনলের লেলিহান শিখা মুহূর্তেই সব ধ্বংস করে দিল।"
  },
  {
    id: "bng_2",
    word: "আকাশ",
    language: "bangla",
    category: "samarthok",
    meaning: "গগন, আসমান",
    synonyms: ["গগন", "অম্বর", "ব্যোম", "নভঃ", "আসমান", "অন্তরীক্ষ"],
    antonyms: ["পাতাল", "पृथ्वीवी", "ধরণী"],
    example: "শরতের নীল আকাশে সাদা মেঘের ভেলা খেলা করছে।"
  },
  {
    id: "bng_3",
    word: "पृथ्वीवी",
    language: "bangla",
    category: "samarthok",
    meaning: "জগৎ, ধরণী",
    synonyms: ["ধরণী", "বসুন্ধরা", "জগৎ", "ভূখণ্ড", "মেদিনী", "অখিল"],
    antonyms: ["আকাশ", "গগন", "মহাকাশ"],
    example: "আমাদের পৃথিবী সৌরজগতের সবচেয়ে বৈচিত্র্যময় গ্রহ।"
  },
  {
    id: "bng_4",
    word: "জল",
    language: "bangla",
    category: "samarthok",
    meaning: "পানি, সলিল",
    synonyms: ["বারি", "নীর", "সলিল", "পানি", "অপ", "তোয়"],
    antonyms: ["অনল", "অগ্নি", "মরুभूमि"],
    example: "জীবনের অপর নাম শুদ্ধ জল।"
  },
  {
    id: "bng_5",
    word: "তিমির",
    language: "bangla",
    category: "samarthok",
    meaning: "অন্ধকার, আঁধার",
    synonyms: ["অন্ধকার", "তমসা", "আঁধার", "তমিস্রা"],
    antonyms: ["আলো", "আলোক", "প্রভা", "দীপ্তি"],
    example: "তিমির বিদীর্ণ করে ভোরের সূর্যের আগমন ঘটল।"
  },
  {
    id: "bng_6",
    word: "উৎকর্ষ",
    language: "bangla",
    category: "antonym",
    meaning: "শ্রেষ্ঠত্ব, উন্নতি",
    synonyms: ["উন্নতি", "শ্রেষ্ঠত্ব", "প্রগতি", "বিকাশ"],
    antonyms: ["অপকর্ষ", "অবনতি", "অধঃপতন"],
    example: "শ্রম ও মেধার মাধ্যমে উৎকর্ষ অর্জন সম্ভব।"
  },
  {
    id: "bng_7",
    word: "কৃতজ্ঞ",
    language: "bangla",
    category: "antonym",
    meaning: "উপকার স্বীকার করে যে",
    synonyms: ["অনুগৃহীত", "কৃতার্থ", "উপকারস্বীকারকারী"],
    antonyms: ["কৃতঘ্ন", "অকৃতজ্ঞ", "উপকারহন্তা"],
    example: "বিপদের দিনে সাহায্যকারীর প্রতি সবসময় কৃতজ্ঞ থাকা উচিত।"
  },
  {
    id: "bng_8",
    word: "যা দীপ্তি পাচ্ছে",
    language: "bangla",
    category: "ek_kothay",
    meaning: "দেদীপ্যমান",
    synonyms: ["দেদীপ্যমান", "উজ্জ্বল"],
    antonyms: ["অন্ধকারাচ্ছন্ন"],
    example: "আকাশে দেদীপ্যমান নক্ষত্রটি দেখতে অত্যন্ত মনোহর।"
  },
  {
    id: "bng_9",
    word: "উপকার করার ইচ্ছা",
    language: "bangla",
    category: "ek_kothay",
    meaning: "চিকীর্ষা / উপচিকীর্ষা",
    synonyms: ["উপচিকীর্ষা", "পরোপকারলিপ্সা"],
    antonyms: ["অপচিকীর্ষা", "অনিষ্টেচ্ছা"],
    example: "মনীষীদের মনে জগতের সকলের উপচিকীর্ষা বিরাজ করে।"
  }
];

export default function Memorize() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<"english" | "bangla">("english");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dbWords, setDbWords] = useState<WordItem[]>([]);
  const [practiceMode, setPracticeMode] = useState(false);

  // States for Practice quiz & flashcard
  const [practiceType, setPracticeType] = useState<"flashcard" | "quiz">("flashcard");
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  // MCQ quiz states
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("mastered_words");
    return saved ? JSON.parse(saved) : [];
  });

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
        console.error("Error fetching Firestore vocabulary:", err);
        handleFirestoreError(err, OperationType.LIST, "vocabulary");
      }
    };
    fetchVocab();
  }, []);

  useEffect(() => {
    localStorage.setItem("mastered_words", JSON.stringify(masteredIds));
  }, [masteredIds]);

  const wordsList = [
    ...(lang === "english" ? ENGLISH_WORDS : BANGLA_WORDS),
    ...dbWords.filter(w => w.language === lang)
  ];
  
  const filteredWords = wordsList.filter((item) => {
    let matchCat = true;
    if (activeCategory === "mastered") {
      matchCat = masteredIds.includes(item.id);
    } else if (activeCategory !== "all") {
      matchCat = item.category === activeCategory;
    }

    let matchSearch = true;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      matchSearch = 
        item.word.toLowerCase().includes(q) || 
        item.meaning.toLowerCase().includes(q) ||
        item.synonyms.some(s => s.toLowerCase().includes(q)) ||
        (item.example && item.example.toLowerCase().includes(q)) || false;
    }

    return matchCat && matchSearch;
  });

  // Generate dynamic MCQ questions for Practice Mode
  const startPracticeQuiz = () => {
    if (filteredWords.length < 2) {
      // Not enough words, use baseline words list
      generateQuizFromPool(wordsList);
    } else {
      generateQuizFromPool(filteredWords);
    }
  };

  const generateQuizFromPool = (pool: WordItem[]) => {
    if (pool.length === 0) return;
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
    const questions = shuffled.map((item) => {
      // Find 3 incorrect answers from the entire pool
      const wrongPool = pool.filter(p => p.id !== item.id);
      const wrongMeanings = wrongPool.map(p => p.meaning);
      const distinctWrong = Array.from(new Set(wrongMeanings)).sort(() => 0.5 - Math.random()).slice(0, 3);
      
      const options = [item.meaning, ...distinctWrong];
      // Randomly shuffle options
      options.sort(() => 0.5 - Math.random());

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
    if (practiceMode && practiceType === "quiz") {
      startPracticeQuiz();
    }
  }, [practiceMode, practiceType, lang]);

  const toggleMastered = (id: string) => {
    if (masteredIds.includes(id)) {
      setMasteredIds(prev => prev.filter(x => x !== id));
    } else {
      setMasteredIds(prev => [...prev, id]);
    }
  };

  const getCategoryTitle = (cat: string) => {
    if (lang === "bangla") {
      switch (cat) {
        case "samarthok": return "সমার্থক শব্দ";
        case "antonym": return "বিপরীত শব্দ";
        case "ek_kothay": return "এক কথায় প্রকাশ";
        default: return "স্মরণীয় শব্দ";
      }
    } else {
      switch (cat) {
        case "vocabulary": return "Vocabulary";
        case "synonym": return "Synonym";
        case "antonym": return "Antonym";
        case "analogy": return "Analogy";
        default: return "Vocabulary";
      }
    }
  };

  const handleSpeech = (word: string) => {
    if (!window?.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const voiceTone = new SpeechSynthesisUtterance(word);
    voiceTone.lang = lang === "english" ? "en-US" : "bn-BD";
    window.speechSynthesis.speak(voiceTone);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-32">
      
      {/* Top Header Panel (Completely Fresh, Light, Modern & Simple) */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            
            {/* Left aligned: rounded beautiful back button and titles */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate("/dashboard")}
                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 shadow-xs flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer text-slate-500 shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-bengali text-slate-950 leading-tight">
                  মেমোরাইজিং পার্ট
                </h1>
                <p className="text-slate-400 font-bengali text-xs mt-0.5">
                  শব্দভাণ্ডার ও মেমোরি বুস্টার হাব • {filteredWords.length} টি আইটেম
                </p>
              </div>
            </div>

            {/* Right aligned: Slick compact search input inside the header directly */}
            {!practiceMode && (
              <div className="relative flex-1 sm:max-w-[240px] shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === "bangla" ? "শব্দ খোঁজ করুন..." : "Search vocabulary..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm font-bengali bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
                />
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 mt-6 flex-1 flex flex-col">
        
        <AnimatePresence mode="wait">
          {!practiceMode ? (
            
            /* Vocabulary Feed: Absolutely zero gap between cards (gap thakbe na, thakbe thin border) */
            <motion.div
              key="feed-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {filteredWords.length > 0 ? (
                <div className="bg-white rounded-[32px] border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden divide-y divide-slate-100">
                  {filteredWords.map((item, idx) => {
                    const isMastered = masteredIds.includes(item.id);

                    return (
                      <div
                        id={`vocab_item_${item.id}`}
                        key={item.id}
                        className={`transition-all p-5 flex flex-col md:flex-row gap-5 justify-between items-start ${
                          isMastered 
                            ? "bg-emerald-50/20 border-l-4 border-l-emerald-500" 
                            : "hover:bg-slate-50 border-l-4 border-l-transparent"
                        }`}
                      >
                        {/* Word & Pronunciation */}
                        <div className="w-full md:w-1/4 shrink-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-[10px] font-sans font-extrabold tracking-wider uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100/40">
                              {getCategoryTitle(item.category)}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-300">#{idx + 1}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <h3 className="text-lg sm:text-xl font-bold font-sans text-slate-900 tracking-tight leading-tight">
                              {item.word}
                            </h3>
                            <button 
                              onClick={() => handleSpeech(item.word)}
                              title="উচ্চারণ শুনুন" 
                              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>

                          {item.pronunciation && (
                            <p className="text-xs font-bengali font-bold text-indigo-600/90 mt-1 pl-1 flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 font-normal">উচ্চারণ:</span> {item.pronunciation}
                            </p>
                          )}
                        </div>

                        {/* Meanings, Synonyms, Antonyms, Example Phrase */}
                        <div className="flex-1 space-y-3.5 w-full">
                          
                          <div>
                            <p className="text-[10px] text-slate-450 font-extrabold uppercase tracking-wider font-sans leading-none mb-1 text-slate-400">
                              {lang === "bangla" ? "অর্থ" : "Definition"}
                            </p>
                            <p className={`text-base font-bold text-slate-800 leading-snug ${lang === "bangla" ? "font-bengali" : "font-sans"}`}>
                              {item.meaning}
                            </p>
                          </div>

                          {/* Dynamic Synonyms and Antonyms Pilling layouts */}
                          {(item.synonyms?.length > 0 || item.antonyms?.length > 0) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              
                              {item.synonyms?.length > 0 && (
                                <div className="bg-emerald-50/10 rounded-2xl px-3 py-2 border border-emerald-100/50">
                                  <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider block font-sans mb-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 
                                    {lang === "bangla" ? "সমার্থক শব্দ" : "Synonyms"}
                                  </span>
                                  <p className={`text-xs text-emerald-950 font-bold leading-normal ${lang === "bangla" ? "font-bengali" : "font-sans"}`}>
                                    {item.synonyms.join(", ")}
                                  </p>
                                </div>
                              )}
                              
                              {item.antonyms?.length > 0 && (
                                <div className="bg-rose-50/10 rounded-2xl px-3 py-2 border border-rose-100/50">
                                  <span className="text-[9px] text-rose-500 font-extrabold uppercase tracking-wider block font-sans mb-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> 
                                    {lang === "bangla" ? "বিপরীত শব্দ" : "Antonyms"}
                                  </span>
                                  <p className={`text-xs text-rose-955 font-bold leading-normal ${lang === "bangla" ? "font-bengali" : "font-sans"}`}>
                                    {item.antonyms.join(", ")}
                                  </p>
                                </div>
                              )}

                            </div>
                          )}

                          {item.example && (
                            <div className="border-l-[3px] border-indigo-100 pl-3.5 py-1">
                              <span className="text-[9px] text-slate-405 font-bold uppercase tracking-wider block font-sans mb-0.5 text-slate-400">
                                {lang === "bangla" ? "বাক্যে প্রয়োগ" : "Example Usage"}
                              </span>
                              <p className={`text-xs text-slate-500 italic leading-relaxed ${lang === "bangla" ? "font-bengali" : "font-sans"}`}>
                                "{item.example}"
                              </p>
                            </div>
                          )}

                        </div>

                        {/* Mark learned button indicator */}
                        <div className="w-full md:w-auto shrink-0 flex md:flex-col gap-1.5 pt-3 md:pt-1 border-t md:border-transparent border-slate-100 justify-end">
                          <button
                            onClick={() => toggleMastered(item.id)}
                            className={`h-9 px-4 whitespace-nowrap md:w-auto md:min-w-[130px] rounded-xl text-xs font-bold font-bengali flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                              isMastered
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-250/30"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50 shadow-xs"
                            }`}
                          >
                            <Check className={`w-3.5 h-3.5 ${isMastered ? "text-emerald-700 font-extrabold" : "text-slate-400"}`} />
                            <span>{lang === "bangla" ? "মুখস্থ হয়েছে" : "Learned"}</span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty state */
                <div className="text-center py-20 bg-white rounded-[32px] border border-slate-200/50 shadow-xs max-w-xl mx-auto">
                  <BookOpen className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                  <h4 className="font-bengali text-slate-800 text-base font-bold">
                    {lang === "bangla" ? "কোনো শব্দ খুঁজে পাওয়া যায়নি!" : "No vocabulary items match your active search filters."}
                  </h4>
                  <p className="text-slate-400 text-xs font-bengali mt-1 px-6">
                    {lang === "bangla" ? "অনুগ্রহ করে অন্য শব্দ টাইপ করুন বা অন্যান্য ফিল্টার পরিবর্তন করুন" : "Try searching using simplified words or changing filters."}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-5 font-bengali rounded-xl text-xs bg-indigo-50/50 text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                    onClick={() => {
                      setActiveCategory("all");
                      setSearchQuery("");
                    }}
                  >
                    {lang === "bangla" ? "সব শব্দ পুনরায় লোড করুন" : "Reset Filters"}
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            
            /* AMAZING Interactive Practice Mode (Flashcard card & MCQ kish) */
            <motion.div
              key="practice-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full"
            >
              {/* Practice Type Switcher Tabs */}
              <div className="flex bg-slate-100 p-1.5 rounded-full border border-slate-200/50 shadow-inner w-72 mb-8 bg-slate-200/40">
                <button
                  onClick={() => setPracticeType("flashcard")}
                  className={`flex-1 font-bengali font-bold rounded-full text-xs py-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    practiceType === "flashcard" 
                      ? "bg-white text-indigo-600 shadow-xs" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <ReadingIcon className="w-3.5 h-3.5" />
                  ফ্ল্যাশ কার্ড
                </button>
                <button
                  onClick={() => {
                    setPracticeType("quiz");
                    startPracticeQuiz();
                  }}
                  className={`flex-1 font-bengali font-bold rounded-full text-xs py-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    practiceType === "quiz" 
                      ? "bg-white text-indigo-600 shadow-xs" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <QuizIcon className="w-3.5 h-3.5" />
                  এমসিকিউ কুইজ
                </button>
              </div>

              {practiceType === "flashcard" ? (
                
                /* FLASHCARD FLIP COMPONENT */
                <div className="w-full flex flex-col items-center">
                  {wordsList.length > 0 ? (
                    (() => {
                      const wordItem = wordsList[currentFlashIndex];
                      const isMastered = masteredIds.includes(wordItem.id);

                      return (
                        <div className="w-full flex flex-col items-center">
                          {/* Instructions banner */}
                          <p className="text-slate-400 font-bengali text-xs mb-4">
                            কার্ডে টাচ করে অর্থ ও উচ্চারণ দেখুন
                          </p>

                          {/* 3D-effect flip card container */}
                          <div 
                            onClick={() => setCardFlipped(!cardFlipped)}
                            className="w-full h-80 cursor-pointer relative"
                            style={{ perspective: "1000px" }}
                          >
                            <motion.div 
                              className="w-full h-full relative"
                              animate={{ rotateY: cardFlipped ? 180 : 0 }}
                              transition={{ duration: 0.4, ease: "easeInOut" }}
                              style={{ transformStyle: "preserve-3d" }}
                            >
                              {/* FRONT OF THE CARD */}
                              <div 
                                className="absolute inset-0 bg-white rounded-[32px] p-8 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between"
                                style={{ backfaceVisibility: "hidden" }}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-sans font-extrabold tracking-wider uppercase text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/40">
                                    {getCategoryTitle(wordItem.category)}
                                  </span>
                                  <span className="text-xs font-mono font-bold text-slate-350">
                                    {currentFlashIndex + 1} / {wordsList.length}
                                  </span>
                                </div>

                                <div className="flex flex-col items-center gap-1.5 my-auto text-center">
                                  <h2 className="text-3xl sm:text-4xl font-extrabold font-sans text-slate-900 tracking-tight">
                                    {wordItem.word}
                                  </h2>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSpeech(wordItem.word);
                                    }}
                                    className="p-2.5 bg-indigo-50 hover:bg-indigo-100 rounded-full text-indigo-600 transition-all cursor-pointer mt-2"
                                    title="উচ্চারণ শুনুন"
                                  >
                                    <Volume2 className="w-5 h-5" />
                                  </button>
                                </div>

                                <div className="text-center text-[11px] text-slate-400 font-bengali font-bold">
                                  ফ্লিপ করতে টাচ করুন • TAP TO REVEAL
                                </div>
                              </div>

                              {/* BACK OF THE CARD */}
                              <div 
                                className="absolute inset-0 bg-indigo-950 text-white rounded-[32px] p-8 border border-indigo-900 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col justify-between"
                                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                              >
                                <div className="flex justify-between items-center text-indigo-200/80">
                                  <span className="text-[10px] uppercase font-bold tracking-widest font-sans">
                                    MEANING & ANTECEDENT
                                  </span>
                                  <span className="text-xs font-mono font-bold">
                                    {currentFlashIndex + 1} / {wordsList.length}
                                  </span>
                                </div>

                                <div className="my-auto space-y-4">
                                  <div className="text-center">
                                    <p className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest block font-sans mb-1.5">
                                      {lang === "bangla" ? "বাংলা অর্থ" : "Meaning"}
                                    </p>
                                    <p className={`text-xl sm:text-2xl font-extrabold leading-normal ${lang === "bangla" ? "font-bengali" : "font-sans"} text-white`}>
                                      {wordItem.meaning}
                                    </p>
                                  </div>

                                  {wordItem.pronunciation && (
                                    <div className="text-center bg-white/5 border border-white/10 rounded-xl py-1.5 px-3 w-fit mx-auto">
                                      <p className="text-xs font-bengali text-indigo-200/90 font-bold">
                                        <span className="text-indigo-400 font-normal text-[11px]">উচ্চারণের বাংলা:</span> {wordItem.pronunciation}
                                      </p>
                                    </div>
                                  )}

                                  {(wordItem.synonyms?.length > 0 || wordItem.antonyms?.length > 0) && (
                                    <div className="flex gap-4 justify-center flex-wrap pt-2">
                                      {wordItem.synonyms?.length > 0 && (
                                        <div className="text-center">
                                          <span className="text-[9px] text-emerald-400 font-black tracking-widest block uppercase mb-0.5">SYNONYMS</span>
                                          <span className="text-xs font-bold text-slate-100">{wordItem.synonyms.slice(0, 2).join(", ")}</span>
                                        </div>
                                      )}
                                      {wordItem.antonyms?.length > 0 && (
                                        <div className="text-center border-l border-white/15 pl-4">
                                          <span className="text-[9px] text-rose-450 text-red-300 font-black tracking-widest block uppercase mb-0.5">ANTONYMS</span>
                                          <span className="text-xs font-bold text-slate-100">{wordItem.antonyms.slice(0, 2).join(", ")}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="text-center text-[10px] text-indigo-305 text-indigo-300 font-bengali">
                                  পুনরায় ফ্লিপ করতে টাচ করুন
                                </div>
                              </div>
                            </motion.div>
                          </div>

                          {/* Navigation & Actions under the Flashcard */}
                          <div className="flex justify-between items-center w-full mt-6 gap-3">
                            <Button 
                              variant="outline"
                              onClick={() => {
                                setCardFlipped(false);
                                setCurrentFlashIndex(prev => (prev > 0 ? prev - 1 : wordsList.length - 1));
                              }}
                              className="rounded-xl border-slate-200 font-bengali font-bold hover:bg-slate-100 text-xs px-4"
                            >
                              পূর্ববর্তী কার্ড
                            </Button>

                            <button
                              onClick={() => toggleMastered(wordItem.id)}
                              className={`h-10 px-4 rounded-xl text-xs font-bold font-bengali flex items-center justify-center gap-1.5 cursor-pointer border transition-all ${
                                isMastered 
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <Check className={`w-3.5 h-3.5 ${isMastered ? "text-emerald-700" : "text-slate-400"}`} />
                              <span>{isMastered ? "মুখস্থ হয়েছে (Learned)" : "মুখস্থ হয়েছে চিহ্নিত করুন"}</span>
                            </button>

                            <Button 
                              variant="outline"
                              onClick={() => {
                                setCardFlipped(false);
                                setCurrentFlashIndex(prev => (prev < wordsList.length - 1 ? prev + 1 : 0));
                              }}
                              className="rounded-xl border-slate-200 font-bengali font-bold hover:bg-slate-100 text-xs px-4"
                            >
                              পরবর্তী কার্ড
                            </Button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-500 font-bengali text-sm font-bold">চর্চার জন্য কোনো শব্দ পাওয়া যায়নি।</p>
                    </div>
                  )}
                </div>

              ) : (
                
                /* EXQUISITE MCQ VOCABULARY QUIZ COMPONENT */
                <div className="w-full">
                  {quizQuestions.length > 0 ? (
                    !quizFinished ? (
                      (() => {
                        const qItem = quizQuestions[currentQuizIndex];
                        return (
                          <div className="w-full bg-white rounded-[32px] border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                            {/* Quiz Header Info */}
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                              <div>
                                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-3 py-1 rounded-full border">
                                  VOCAB TEST
                                </span>
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-400">
                                Question {currentQuizIndex + 1} of {quizQuestions.length}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
                              <div 
                                className="bg-indigo-600 h-full transition-all duration-300" 
                                style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                              />
                            </div>

                            {/* Question sentence */}
                            <div className="text-center my-6">
                              <p className="text-slate-400 font-bengali text-xs font-bold uppercase mb-1">নিচের শব্দটির সঠিক অর্থ কী?</p>
                              <h3 className="text-3xl font-extrabold font-sans text-slate-900 tracking-tight">
                                {qItem.word}
                              </h3>
                            </div>

                            {/* Options grid */}
                            <div className="grid grid-cols-1 gap-3 mt-8">
                              {qItem.options.map((option: string, oIdx: number) => {
                                const isSelected = selectedQuizOption === option;
                                const isCorrect = option === qItem.correctMeaning;
                                const hasAnswered = selectedQuizOption !== null;

                                let finalClass = "border-slate-200 hover:border-slate-350 bg-slate-50/30 hover:bg-slate-50 text-slate-800";
                                if (hasAnswered) {
                                  if (isCorrect) {
                                    finalClass = "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs";
                                  } else if (isSelected) {
                                    finalClass = "border-rose-500 bg-rose-50 text-rose-800 shadow-xs";
                                  } else {
                                    finalClass = "border-slate-100 bg-white text-slate-400 opacity-60";
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
                                    className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left font-bengali font-bold text-sm sm:text-base transition-all duration-200 cursor-pointer flex justify-between items-center ${finalClass}`}
                                  >
                                    <span>{option}</span>
                                    {hasAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                                    {hasAnswered && isSelected && !isCorrect && <X className="w-5 h-5 text-rose-600 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Actions footer */}
                            {selectedQuizOption && (
                              <div className="flex justify-end mt-6">
                                <Button
                                  onClick={() => {
                                    if (currentQuizIndex < quizQuestions.length - 1) {
                                      setCurrentQuizIndex(prev => prev + 1);
                                      setSelectedQuizOption(null);
                                    } else {
                                      setQuizFinished(true);
                                    }
                                  }}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bengali font-bold text-xs"
                                >
                                  {currentQuizIndex < quizQuestions.length - 1 ? "পরবর্তী প্রশ্ন" : "ফলাফল দেখুন"}
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      /* QUIZ RESULTS VIEW */
                      <div className="w-full bg-white rounded-[32px] border border-slate-200/80 p-8 shadow-sm text-center">
                        <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6">
                          <Award className="w-10 h-10" />
                        </div>
                        
                        <h3 className="text-2xl font-bengali font-extrabold text-slate-900 mb-2">কুইজ সম্পূর্ণ হয়েছে!</h3>
                        <p className="text-slate-500 font-bengali text-sm max-w-sm mx-auto mb-6">
                          আপনার মেমোরাইজিং স্কিল এবং শব্দকোষের উপর চমৎকার দখল যাচাই করা হয়েছে। নিচে আপনার ফলাফল দেখুন:
                        </p>

                        <div className="bg-slate-50 border rounded-2xl p-6 grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8">
                          <div className="text-center">
                            <span className="text-[11px] text-slate-400 font-bengali font-bold uppercase block">মোট প্রশ্ন</span>
                            <span className="text-2xl font-mono font-extrabold text-slate-800">{quizQuestions.length}</span>
                          </div>
                          <div className="text-center border-l">
                            <span className="text-[11px] text-slate-400 font-bengali font-bold uppercase block">সঠিক উত্তর</span>
                            <span className="text-2xl font-mono font-extrabold text-indigo-600">{quizScore}</span>
                          </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                          <Button 
                            variant="outline" 
                            onClick={() => startPracticeQuiz()}
                            className="rounded-xl font-bengali font-bold text-xs border-slate-20 w-fit shrink-0 py-5 flex items-center gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            আবার চেষ্টা করুন
                          </Button>
                          <Button 
                            onClick={() => setPracticeMode(false)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bengali font-bold text-xs px-6 py-5"
                          >
                            মেমোরাইজ ফিডে ফিরুন
                          </Button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-500 font-bengali text-sm font-bold">কুইজ সেশনের জন্য কোনো শব্দ পাওয়া যায়নি।</p>
                    </div>
                  )}
                </div>

              )}
            </motion.div>

          )}
        </AnimatePresence>

      </main>

      {/* Floating Lower Category Filter Bar (Placed Down Below, Keeping Top completely fresh!) */}
      {!practiceMode && (
        <div className="fixed bottom-[92px] inset-x-4 max-w-lg mx-auto bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_4px_30px_rgba(0,0,0,0.04)] px-4 py-2.5 flex items-center gap-1.5 overflow-x-auto z-45 scrollbar-none">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveCategory("all")}
            className={`rounded-full font-bengali text-xs font-bold h-7.5 px-3.5 transition-all shrink-0 cursor-pointer ${
              activeCategory === "all" 
                ? "bg-indigo-50 text-indigo-750 text-indigo-800 hover:bg-indigo-100 font-extrabold border border-indigo-150/40" 
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {lang === "bangla" ? `সব শব্দ (${wordsList.length})` : `All (${wordsList.length})`}
          </Button>
          
          {lang === "english" ? (
            <>
              {["vocabulary", "synonym", "antonym", "analogy"].map(cat => (
                <Button
                  key={cat}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full font-sans text-xs font-bold uppercase h-7.5 px-3.5 transition-all shrink-0 cursor-pointer ${
                    activeCategory === cat 
                      ? "bg-indigo-50 text-indigo-750 text-indigo-800 hover:bg-indigo-100 font-extrabold border border-indigo-150/40" 
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat === "vocabulary" ? "vocabulary" : cat === "synonym" ? "synonym" : cat === "antonym" ? "antonym" : "analogy"}
                </Button>
              ))}
            </>
          ) : (
            <>
              {["samarthok", "antonym", "ek_kothay"].map(cat => (
                <Button
                  key={cat}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full font-bengali text-xs font-bold h-7.5 px-3.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    activeCategory === cat 
                      ? "bg-indigo-50 text-indigo-750 text-indigo-800 hover:bg-indigo-100 font-extrabold border border-indigo-150/40" 
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat === "samarthok" ? "সমার্থক" : cat === "antonym" ? "বিপরীত" : "এক কথায়"}
                </Button>
              ))}
            </>
          )}

          <div className="h-4 w-[1px] bg-slate-200 mx-1 shrink-0"></div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveCategory("mastered")}
            className={`rounded-full font-bengali text-xs font-bold h-7.5 px-3 transition-all shrink-0 text-emerald-600 cursor-pointer ${
              activeCategory === "mastered" ? "bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-150/30" : "hover:bg-slate-100"
            }`}
          >
            ✓ {lang === "bangla" ? `মুখস্থ (${masteredIds.length})` : `Learned (${masteredIds.length})`}
          </Button>
        </div>
      )}

      {/* DURABLE STICKY BOTTOM NAVIGATION BAR (replaces পরীক্ষা/টপিক ভিত্তিক with English/বাংলা tabs dynamically!) */}
      <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto bg-white/95 backdrop-blur-md rounded-full border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.12)] h-16 flex justify-around items-center px-4 z-40">
        
        {/* Left Tab: English (originally positioned in place of 'পরীক্ষা') */}
        <button 
          onClick={() => {
            setLang("english");
            setPracticeMode(false);
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all relative cursor-pointer group h-full ${(!practiceMode && lang === "english") ? "text-indigo-600 scale-102" : "text-slate-400 hover:text-slate-500"}`}
        >
          <Languages className="w-[19px] h-[19px] shrink-0 group-hover:scale-105 transition-transform" />
          <span className="text-[11px] sm:text-xs font-bold tracking-tight">English</span>
          {(!practiceMode && lang === "english") && (
            <motion.div layoutId="lower_bottom_active" className="absolute bottom-1 w-8 h-1 bg-indigo-600 rounded-full" />
          )}
        </button>

        {/* Center Tab: বাংলা (originally positioned in place of 'টপিক ভিত্তিক') */}
        <button 
          onClick={() => {
            setLang("bangla");
            setPracticeMode(false);
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all relative cursor-pointer group h-full ${(!practiceMode && lang === "bangla") ? "text-indigo-600 scale-102" : "text-slate-400 hover:text-slate-500"}`}
        >
          <BookOpen className="w-[19px] h-[19px] shrink-0 group-hover:scale-105 transition-transform" />
          <span className="text-[11px] sm:text-xs font-bengali font-bold tracking-tight">বাংলা</span>
          {(!practiceMode && lang === "bangla") && (
            <motion.div layoutId="lower_bottom_active" className="absolute bottom-1 w-8 h-1 bg-indigo-600 rounded-full" />
          )}
        </button>

        {/* Right Tab: প্র্যাকটিস (stays "প্র্যাকটিস" is active of quizzing mode) */}
        <button 
          onClick={() => {
            setPracticeMode(true);
            setCardFlipped(false);
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all relative cursor-pointer group h-full ${(practiceMode) ? "text-indigo-600 scale-102" : "text-slate-400 hover:text-slate-500"}`}
        >
          <Sparkles className="w-[19px] h-[19px] shrink-0 group-hover:scale-105 transition-transform" strokeWidth={2.2} />
          <span className="text-[11px] sm:text-xs font-bengali font-bold tracking-tight">প্র্যাকটিস</span>
          {(practiceMode) && (
            <motion.div layoutId="lower_bottom_active" className="absolute bottom-1 w-8 h-1 bg-indigo-600 rounded-full" />
          )}
        </button>

      </div>

    </div>
  );
}
