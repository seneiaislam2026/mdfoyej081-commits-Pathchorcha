import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, BookOpen, ArrowLeft, ArrowRight, PenTool, LayoutList, AlertCircle, Clock, Calendar, Download, Trophy, Sparkles, CheckCircle2, ChevronRight, Brain, Library, Languages, Monitor, Calculator, Atom, FlaskConical, Dna, Globe, Map as MapIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ALL_NOTES } from "./Notes";
import { useAuth } from "../lib/AuthContext";
import { useIsPWA } from "../lib/useIsPWA";
import { getDocs, collection, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";

const getPaperDate = (title: string) => {
  if (title.includes("25-26") || title.includes("২৫-২৬")) return "২৪ জানু, ২০২৬";
  if (title.includes("24-25") || title.includes("২৪-২৫")) return "১২ এপ্রিল, ২০২৫";
  if (title.includes("23-24") || title.includes("২৩-২৪")) return "১১ জুন, ২০২৪";
  if (title.includes("22-23") || title.includes("২২-২৩")) return "০৭ নভে, ২০২৪";
  if (title.includes("21-22") || title.includes("২১-২২")) return "২৫ সেপ্টে, ২০২৩";
  if (title.includes("20-21") || title.includes("২০-২১")) return "০৩ অক্টো, ২০২৪";
  if (title.includes("19-20") || title.includes("১৯-২০")) return "০৩ অক্টো, ২০২৪";
  if (title.includes("18-19") || title.includes("১৮-১৯")) return "১৩ জানু, ২০২৬";
  return "২৪ জানু, ২০২৬";
};

const formatPaperTitle = (title: string, activeClass: string) => {
  let cleaned = title.replace(/\(MCQ\)/gi, "").replace(/\(CQ\)/gi, "").trim();
  
  if (activeClass.includes("রাজশাহী") || activeClass.toLowerCase().includes("ru")) {
    const yearMatch = cleaned.match(/(?:২০)?([০-৯0-9]{2})[-–](?:২০)?([০-৯0-9]{2})/);
    if (yearMatch) {
      return `RU B ${yearMatch[1]}-${yearMatch[2]}`;
    }
    // Handle specific standard strings
    if (cleaned.includes("২৩-২৪")) return "RU B 23-24";
    if (cleaned.includes("২২-২৩")) return "RU B 22-23";
    if (cleaned.includes("২১-২২")) return "RU B 21-22";
    if (cleaned.includes("২০-২১")) return "RU B 20-21";
    if (cleaned.includes("১৯-২০")) return "RU B 19-20";
    if (cleaned.includes("১৮-১৯")) return "RU B 18-19";
    return `RU B ${cleaned}`;
  }
  
  if (activeClass.includes("ঢাকা") || activeClass.toLowerCase().includes("du")) {
    const yearMatch = cleaned.match(/(?:২০)?([০-৯0-9]{2})[-–](?:২০)?([০-৯0-9]{2})/);
    if (yearMatch) {
      return `DU C ${yearMatch[1]}-${yearMatch[2]}`;
    }
  }

  return cleaned;
};

const getBengaliLetter = (letter: string) => {
  switch (letter.toUpperCase()) {
    case 'A': return 'ক';
    case 'B': return 'খ';
    case 'C': return 'গ';
    case 'D': return 'ঘ';
    default: return letter;
  }
};

const getTopicsForSubject = (subject: string) => {
  if (subject === "বাংলা") return [
    { name: "বাংলা ভাষার ব্যাকরণ ও শব্দভাণ্ডার", count: 42, difficulty: "সহজ" },
    { name: "গদ্য (সোনার তরী, মাসি-পিসি)", count: 28, difficulty: "মাঝারি" },
    { name: "পদ্য (ঐকতান, ১৮ বছর বয়স)", count: 35, difficulty: "কঠিন" },
    { name: "উচ্চারণ ও বানানরীতি", count: 18, difficulty: "সহজ" }
  ];
  if (subject === "English") return [
    { name: "Parts of Speech & Identifications", count: 50, difficulty: "সহজ" },
    { name: "Prepositions & Idioms", count: 30, difficulty: "কঠিন" },
    { name: "Right Form of Verbs & Agreement", count: 45, difficulty: "মাঝারি" },
    { name: "Synonyms & Antonyms", count: 32, difficulty: "মাঝারি" }
  ];
  if (subject === "Math" || subject === "গণিত" || subject === "উচ্চতর গণিত") return [
    { name: "ম্যাট্রিক্স ও নির্ণায়ক", count: 35, difficulty: "সহজ" },
    { name: "ত্রিকোণমিতি", count: 40, difficulty: "মাঝারি" },
    { name: "ক্যালকুলাস (অন্তরীকরণ ও যোগজীকরণ)", count: 55, difficulty: "কঠিন" },
    { name: "বীজগণিত ও সম্ভাব্যতা", count: 25, difficulty: "সহজ" }
  ];
  // Default general topics
  return [
    { name: "মেকানিক্স ও গতিবিদ্যা", count: 25, difficulty: "মাঝারি" },
    { name: "তড়িৎ বিশ্লেষণ ও তড়িৎ রসায়ন", count: 20, difficulty: "সহজ" },
    { name: "জৈব রসায়ন ও বিক্রিয়া", count: 30, difficulty: "কঠিন" },
    { name: "কোষ ও জিনতত্ত্ব", count: 22, difficulty: "মাঝারি" }
  ];
};

const filters = {
  classes: ["Class 6-8", "Class 9", "SSC", "HSC", "Admission"],
  subclasses: {
    "Class 6-8": ["Class 6", "Class 7", "Class 8"],
    "Admission": ["ঢাকা বিশ্ববিদ্যালয়", "রাজশাহী বিশ্ববিদ্যালয়", "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়", "গুচ্ছ (GST)", "মেডিকেল", "প্রকৌশল", "জাতীয় বিশ্ববিদ্যালয়"]
  },
  subjects: ["বাংলা", "English", "Math", "Physics", "Chemistry", "Biology"],
  difficulties: ["সহজ", "মাঝারি", "কঠিন"],
};

const getSubjectsByGroup = (group?: string, classGroup?: string) => {
  const common = ["বাংলা", "English", "ICT"];
  if (classGroup === "Class 6-8" || classGroup === "Class 9") {
     return ["বাংলা", "English", "গণিত", "সাধারণ বিজ্ঞান", "বাংলাদেশ ও বিশ্বপরিচয়", "ধর্ম"];
  }
  
  if (group === "মানবিক" || group === "Arts") {
    return [...common, "ইতিহাস", "পৌরনীতি", "ভূগোল", "অর্থনীতি", "যুক্তিবিদ্যা", "সমাজবিজ্ঞান"];
  } else if (group === "বাণিজ্য" || group?.includes("ব্যবসায়") || group?.includes("ব্যবসায়") || group?.includes("Commerce") || group?.includes("Business")) {
    return [...common, "হিসাববিজ্ঞান", "ব্যবসায় সংগঠন", "ফিন্যান্স", "উৎপাদন ব্যবস্থাপনা"];
  }
  // Default to science
  return [...common, "উচ্চতর গণিত", "পদার্থবিজ্ঞান", "রসায়ন", "রসায়ন", "জীববিজ্ঞান", "Math", "Physics", "Chemistry", "Biology"];
};

const mapUserClassToGroup = (cls?: string) => {
  if (cls === "এডমিশন") return "Admission";
  if (cls === "দশম শ্রেণী") return "SSC";
  if (cls === "একাদশ শ্রেণী" || cls === "দ্বাদশ শ্রেণী") return "HSC";
  if (cls === "নবম শ্রেণী") return "Class 9";
  if (cls === "৬ষ্ঠ শ্রেণী" || cls === "৭ম শ্রেণী" || cls === "৮ম শ্রেণী" || cls === "৬ষ্ঠ থেকে ৮ম শ্রেণী") return "Class 6-8";
  return "HSC";
};

const getUniversitiesByGroup = (group?: string) => {
  const commonBefore = [
    { name: "ঢাকা বিশ্ববিদ্যালয়", short: "ঢাবি", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/39/University_of_Dhaka_logo.svg/512px-University_of_Dhaka_logo.svg.png" },
    { name: "রাজশাহী বিশ্ববিদ্যালয়", short: "রাবি", logo: "/logo.png" },
    { name: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়", short: "জাবি", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Jahangirnagar_University_logo.svg/512px-Jahangirnagar_University_logo.svg.png" },
    { name: "চট্টগ্রাম বিশ্ববিদ্যালয়", short: "চবি", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/23/University_of_Chittagong_logo.svg/512px-University_of_Chittagong_logo.svg.png" },
    { name: "কুমিল্লা বিশ্ববিদ্যালয়", short: "কুবি", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Comilla_University_logo.svg/512px-Comilla_University_logo.svg.png" },
    { name: "গুচ্ছ (GST)", short: "গুচ্ছ", logo: "https://cdn-icons-png.flaticon.com/512/8076/8076045.png" },
  ];

  const nu = { name: "জাতীয় বিশ্ববিদ্যালয়", short: "জাতীয়", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/National_University%2C_Bangladesh_Logo.svg/512px-National_University%2C_Bangladesh_Logo.svg.png" };

  if (group === "বিজ্ঞান" || !group) {
    return [
      ...commonBefore,
      { name: "মেডিকেল", short: "মেডিকেল", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Star_of_life2.svg/512px-Star_of_life2.svg.png" },
      { name: "প্রকৌশল", short: "প্রকৌশল", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/96/BUET_LOGO.svg/512px-BUET_LOGO.svg.png" },
      nu
    ];
  }
  return [...commonBefore, nu];
};


const TOPICS_METADATA: Record<string, any> = {
  "বাংলা": { name: "বাংলা সাহিত্য", icon: Library, count: "২২৩", desc: "রবীন্দ্রনাথ, নজরুল, আধুনিক সাহিত্য ও ব্যাকরণ", bg: "bg-emerald-50", iconColor: "text-emerald-500" },
  "English": { name: "English", icon: Languages, count: "১০৮", desc: "English Grammar, Tense, Voice Change", bg: "bg-purple-50", iconColor: "text-purple-500" },
  "ICT": { name: "ICT", icon: Monitor, count: "৮৯", desc: "কম্পিউটার বেসিক, হার্ডওয়্যার, সফটওয়্যার", bg: "bg-blue-50", iconColor: "text-blue-500" },
  "উচ্চতর গণিত": { name: "উচ্চতর গণিত", icon: Calculator, count: "৯৮", desc: "ম্যাট্রিক্স, ডিটারমিনেন্ট, ক্যালকুলাস", bg: "bg-amber-50", iconColor: "text-amber-500" },
  "গণিত": { name: "গণিত", icon: Calculator, count: "৮৫", desc: "পাটিগণিত, বীজগণিত, পরিমিতি", bg: "bg-amber-50", iconColor: "text-amber-500" },
  "পদার্থবিজ্ঞান": { name: "পদার্থবিজ্ঞান", icon: Atom, count: "৭৬", desc: "যান্ত্রিক, তরঙ্গ, তাপগতিবিদ্যা", bg: "bg-indigo-50", iconColor: "text-indigo-500" },
  "রসায়ন": { name: "রসায়ন", icon: FlaskConical, count: "৬৪", desc: "জৈব রসায়ন, অজৈব রসায়ন, গাণিতিক রসায়ন", bg: "bg-rose-50", iconColor: "text-rose-500" },
  "রসায়ন": { name: "রসায়ন", icon: FlaskConical, count: "৬৪", desc: "জৈব রসায়ন, অজৈব রসায়ন, গাণিতিক রসায়ন", bg: "bg-rose-50", iconColor: "text-rose-500" },
  "জীববিজ্ঞান": { name: "জীববিজ্ঞান", icon: Dna, count: "৫৮", desc: "উদ্ভিদবিজ্ঞান, প্রাণিবিজ্ঞান, জেনেটিক্স", bg: "bg-emerald-50", iconColor: "text-emerald-500" },
  "ইতিহাস": { name: "ইতিহাস", icon: Globe, count: "৫৫", desc: "প্রাচীন, মধ্যযুগ, আধুনিক ইতিহাস", bg: "bg-orange-50", iconColor: "text-orange-500" },
  "ভূগোল": { name: "ভূগোল", icon: MapIcon, count: "৪২", desc: "ভূ-প্রাকৃতিক, মানচিত্র, বাংলাদেশ ও বিশ্ব ভূগোল", bg: "bg-cyan-50", iconColor: "text-cyan-500" }
};

import { managementMCQs } from "../data/managementMcqs";

export default function QuestionBank() {
  const { userData } = useAuth();
  const isPWA = useIsPWA();
  const navigate = useNavigate();
  const initialClassGroup = mapUserClassToGroup(userData?.class);
  const [activeClassGroup, setActiveClassGroup] = useState(initialClassGroup);
  const [activeClass, setActiveClass] = useState(initialClassGroup === "Admission" ? "ঢাকা বিশ্ববিদ্যালয়" : (initialClassGroup === "Class 6-8" ? "Class 6" : initialClassGroup));
  const [questionFormat, setQuestionFormat] = useState<"MCQ" | "CQ" | null>(initialClassGroup === "Admission" ? "MCQ" : null);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab") as "bank" | "topics" | "practice" | null;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"bank" | "topics" | "practice">(tabParam || "bank");

  useEffect(() => {
    if (tabParam === "practice" || tabParam === "topics" || tabParam === "bank") {
      setActiveSubTab(tabParam);
    }
  }, [tabParam]);
  
  const [activeTopicSubject, setActiveTopicSubject] = useState<string>("বাংলা");
  const [selectedTopicAnswers, setSelectedTopicAnswers] = useState<Record<string, string>>({});
  const [revealedTopicAnswers, setRevealedTopicAnswers] = useState<Record<string, boolean>>({});
  
  // Interactive practice engine states
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const checkOffline = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', checkOffline);
    window.addEventListener('offline', checkOffline);
    return () => {
      window.removeEventListener('online', checkOffline);
      window.removeEventListener('offline', checkOffline);
    };
  }, []);

  const handleOfflineSync = async () => {
    setIsSyncing(true);
    try {
      const { collection, getDocs } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");
      await getDocs(collection(db, "questions"));
      alert("অফলাইন ব্যবহারের জন্য সকল প্রশ্ন ডাউনলোড করা হয়েছে! এখন ইন্টারনেট ছাড়াই নোটস দেখতে পারবেন।");
    } catch(e) {
      console.error("Offline sync failed", e);
      alert("ডাউনলোড করতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ চেক করুন।");
    } finally {
      setIsSyncing(false);
    }
  };

  const dynamicSubjects = getSubjectsByGroup(userData?.group, activeClassGroup);

  useEffect(() => {
    if (questionFormat === "CQ" && activeClassGroup === "Admission") {
      setActiveClassGroup("HSC");
      setActiveClass("HSC");
    }
  }, [questionFormat, activeClassGroup]);

  // Auto-merge duplicate exams based on user instructions
  useEffect(() => {
    async function runFix() {
      try {
        const qTarget = query(collection(db, "questions"), where("title", "==", "ঢাবি সি ইউনিট ২৫-২৬ (MCQ)"));
        const snapTarget = await getDocs(qTarget);
        if (snapTarget.docs.length > 0) {
          const qBase = query(collection(db, "questions"), where("title", "==", "ঢাবি সি ২০২৫-২০২৬ (MCQ)"));
          const snapBase = await getDocs(qBase);
          let baseCount = snapBase.docs.length > 0 ? snapBase.docs.length : 36;
          
          let { writeBatch } = await import("firebase/firestore");
          const batch = writeBatch(db);
          let updated = 0;
          snapTarget.docs.forEach((doc, idx) => {
            batch.update(doc.ref, { 
              title: "ঢাবি সি ২০২৫-২০২৬ (MCQ)",
              question_no: baseCount + idx + 1
            });
            updated++;
          });
          await batch.commit();
          window.location.reload();
        }
      } catch(e) {
        console.error(e);
      }
    }
    runFix();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      try {
        let q = query(collection(db, "questions"), where("classGroup", "==", activeClassGroup));
        if (activeClassGroup === "Admission" && activeClass) {
          q = query(q, where("university", "==", activeClass));
        } else if (activeClassGroup !== "Admission" && activeClass) {
          q = query(q, where("class", "==", activeClass));
        }
        const snap = await getDocs(q);
        let results: any[] = [];
        snap.forEach(doc => results.push({ id: doc.id, ...doc.data() }));

        // Insert local management MCQs if we are in Admission classGroup (filter locally to match)
        let filteredLocal = (managementMCQs as any[]).filter(m => m.classGroup === activeClassGroup);
        if (activeClassGroup === "Admission" && activeClass) {
          filteredLocal = filteredLocal.filter(m => !m.university || m.university === activeClass);
        } else if (activeClassGroup !== "Admission" && activeClass) {
          filteredLocal = filteredLocal.filter(m => !m.class || m.class === activeClass);
        }
        results = [...results, ...filteredLocal];

        // Group by title
        const grouped = results.reduce((acc, q) => {
          const t = q.title || "Subject-wise Questions";
          if (!acc[t]) acc[t] = [];
          acc[t].push(q);
          return acc;
        }, {} as Record<string, any[]>);
        
        const papers = Object.keys(grouped).map(title => {
          const unique = new Map();
          grouped[title].forEach((r: any) => {
            r.correctOption = r.correctOption || r.correct_answer || r.correctAnswer || r.answer;
            if (unique.has(r.text)) {
              const existing = unique.get(r.text);
              if ((r.explanation && !existing.explanation) || (r.correctOption && !existing.correctOption)) {
                unique.set(r.text, r);
              }
            } else {
              unique.set(r.text, r);
            }
          });
          const deduplicatedQuestions = Array.from(unique.values());
          
          return {
            title,
            questions: deduplicatedQuestions
          };
        });

        setQuestionsList(papers);
      } catch (err) {
        console.error("Error fetching questions", err);
      } finally {
        setLoadingQuestions(false);
      }
    };
    if (questionFormat) {
      fetchQuestions();
    }
  }, [activeClassGroup, activeClass, selectedSubjects, questionFormat]);

  const toggleSubject = (s: string) => {
    setSelectedSubjects(prev => 
      prev.includes(s) ? prev.filter(sub => sub !== s) : [...prev, s]
    );
  };

  const renderBottomNav = () => (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200/80 py-3.5 px-6 flex justify-around items-center z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.03)] rounded-t-[28px] max-w-lg mx-auto">
      <button 
        onClick={() => {
          setActiveSubTab("bank");
          setQuizStarted(false);
        }}
        className={`flex-1 flex flex-col items-center gap-1 transition-all relative cursor-pointer ${activeSubTab === "bank" ? "text-blue-600 scale-102" : "text-slate-400 hover:text-slate-500"}`}
      >
        <BookOpen className="w-5 h-5 shrink-0" />
        <span className="text-[11px] sm:text-xs font-bengali font-bold">নোটস</span>
        {activeSubTab === "bank" && (
          <motion.div layoutId="bottom_indicator" className="absolute bottom-[-15px] inset-x-8 h-1 bg-blue-500 rounded-full" />
        )}
      </button>

      <button 
        onClick={() => {
          setActiveSubTab("topics");
          setQuizStarted(false);
        }}
        className={`flex-1 flex flex-col items-center gap-1 transition-all relative cursor-pointer ${activeSubTab === "topics" ? "text-emerald-600 scale-102" : "text-slate-400 hover:text-slate-500"}`}
      >
        <LayoutList className="w-5 h-5 shrink-0" />
        <span className="text-[11px] sm:text-xs font-bengali font-bold">টপিক ভিত্তিক নোটস</span>
        {activeSubTab === "topics" && (
          <motion.div layoutId="bottom_indicator" className="absolute bottom-[-15px] inset-x-8 h-1 bg-emerald-500 rounded-full" />
        )}
      </button>

      <button 
        onClick={() => {
          setActiveSubTab("practice");
          setQuizStarted(false);
        }}
        className={`flex-1 flex flex-col items-center gap-1 transition-all relative cursor-pointer ${activeSubTab === "practice" ? "text-emerald-600 scale-102" : "text-slate-400 hover:text-slate-500"}`}
      >
        <PenTool className="w-5 h-5 shrink-0" />
        <span className="text-[11px] sm:text-xs font-bengali font-bold">প্র্যাকটিস</span>
        {activeSubTab === "practice" && (
          <motion.div layoutId="bottom_indicator" className="absolute bottom-[-15px] inset-x-12 h-1 bg-emerald-500 rounded-full" />
        )}
      </button>
    </div>
  );

  if (!questionFormat) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bengali font-bold text-slate-800 mb-4">কী ধরনের প্রশ্ন অনুশীলন করতে চাও?</h2>
          
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
            {activeClassGroup === "Admission" 
              ? "তোমার প্রস্তুতির ধরনের উপর ভিত্তি করে ক্যাটাগরি নির্বাচন করো। এখানে তুমি বহুনির্বাচনি (MCQ) প্রশ্ন পাবে।"
              : "তোমার প্রস্তুতির ধরনের উপর ভিত্তি করে ক্যাটাগরি নির্বাচন করো। এখানে তুমি বহুনির্বাচনি (MCQ) এবং সৃজনশীল (CQ) दोन्ही ধরনের প্রশ্ন পাবে।"
            }
          </p>
        </div>

        <div className={`grid ${activeClassGroup === "Admission" ? 'grid-cols-1 max-w-md' : 'md:grid-cols-2'} gap-6 max-w-2xl mx-auto`}>
          <motion.div
            whileHover={{ scale: 1.02, translateY: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setQuestionFormat("MCQ")}
            className="cursor-pointer bg-white border-2 border-slate-100 hover:border-primary/50 shadow-sm hover:shadow-md p-8 rounded-[32px] text-center transition-all group"
          >
            <div className="bg-primary/10 w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
              <LayoutList className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bengali font-bold text-slate-800 mb-2">MCQ প্রশ্ন</h3>
            <p className="text-slate-500 font-bengali">বহুনির্বাচনি প্রশ্ন এবং মডেল টেস্ট</p>
          </motion.div>

          {activeClassGroup !== "Admission" && (
            <motion.div
              whileHover={{ scale: 1.02, translateY: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setQuestionFormat("CQ")}
              className="cursor-pointer bg-white border-2 border-slate-100 hover:border-secondary/50 shadow-sm hover:shadow-md p-8 rounded-[32px] text-center transition-all group"
            >
              <div className="bg-secondary/10 w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/20 transition-colors">
                <PenTool className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-2xl font-bengali font-bold text-slate-800 mb-2">CQ প্রশ্ন</h3>
              <p className="text-slate-500 font-bengali">সৃজনশীল বা লিখিত প্রশ্নমালা</p>
            </motion.div>
          )}
        </div>
        {renderBottomNav()}
      </div>
    );
  }

  if (activeClassGroup === "Admission" && !selectedUniversity && activeSubTab === "bank") {
    return (
      <div className="max-w-4xl mx-auto py-4 px-4 pb-24 flex flex-col font-sans">
        {/* Modern styled Header */}
        <div className="flex items-center justify-between py-4 border-b border-slate-100/80 mb-6 bg-[#F8FAFC]/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
            <button 
             onClick={() => {
               // Resets question format back to selection
               setQuestionFormat(null);
             }}
             className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center hover:bg-slate-50 hover:text-blue-700 hover:border-slate-300 transition-all cursor-pointer text-slate-600 shrink-0"
             title="পেছনে যান"
            >
             <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-blue-600 font-sans">
                ভর্তি পরীক্ষা • Admission
              </span>
              <h2 className="text-[15px] sm:text-[18px] font-bengali font-extrabold text-slate-800 leading-tight">
                বিশ্ববিদ্যালয় নির্বাচন করো
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
          {getUniversitiesByGroup(userData?.group).map(uni => {
            return (
              <motion.button
                whileHover={{ scale: 1.025, translateY: -2 }}
                whileTap={{ scale: 0.975 }}
                key={uni.name}
                onClick={() => {
                  setSelectedUniversity(uni.name);
                  setActiveClass(uni.name);
                }}
                className="flex flex-col items-center justify-center p-6 rounded-[28px] border border-slate-200/60 hover:border-blue-200 hover:bg-blue-50/5 hover:shadow-md transition-all bg-white shadow-xs group cursor-pointer"
              >
                <div className="w-16 h-16 flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105">
                  <img 
                    src={uni.logo} 
                    alt={uni.short} 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/icon-192.png";
                    }}
                    className="w-16 h-16 object-contain" 
                  />
                </div>
                <span className="font-bengali font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">{uni.short}</span>
              </motion.button>
            );
          })}
        </div>
        {renderBottomNav()}
      </div>
    );
  }

  const handleStartPracticeQuiz = () => {
    // Gather all questions from papers
    let allQs: any[] = [];
    questionsList.forEach((p: any) => {
      if (p.questions && p.questions.length > 0) {
        allQs = [...allQs, ...p.questions];
      }
    });

    if (allQs.length === 0) {
      alert("অনুশীলনের জন্য কোনো প্রশ্ন উপলব্ধ নেই।");
      return;
    }

    // Shuffle and pick 10 questions
    const shuffled = [...allQs].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(10, shuffled.length));

    setQuizQuestions(selected);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setSelectedQuizAnswer(null);
    setQuizAnswered(false);
    setQuizFinished(false);
    setQuizStarted(true);
  };

  const handleSelectQuizOption = (optionKey: string, correctOption: string) => {
    if (quizAnswered) return;
    setSelectedQuizAnswer(optionKey);
    setQuizAnswered(true);
    
    // Normalize correct option
    const isCorrect = optionKey.trim().toLowerCase() === correctOption.trim().toLowerCase();
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedQuizAnswer(null);
    setQuizAnswered(false);
    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const getCleanOptionText = (text: string) => {
    if (!text) return "";
    return text.toString().replace(/^[A-Da-d][\s.:)•-]+/, "").trim();
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 relative min-h-[80vh] flex flex-col font-sans">
      {/* Dynamic Header modeled after screenshot 3 */}
      <div className="flex items-center justify-between py-4 border-b border-slate-100/80 mb-5 bg-[#F8FAFC]/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
          <button 
           onClick={() => {
             if (activeClassGroup === "Admission" && selectedUniversity && activeSubTab === "bank") {
               setSelectedUniversity(null);
             } else {
               navigate("/dashboard");
             }
           }}
           className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center hover:bg-slate-50 hover:text-blue-700 hover:border-slate-300 transition-all cursor-pointer text-slate-600 shrink-0"
           title="ফিরে যান"
          >
           <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-blue-600 font-sans">
              {activeSubTab === "bank" ? "প্রশ্নপত্র • Question Bank" : activeSubTab === "topics" ? "টপিক ভিত্তিক • Topics" : "প্র্যাকটিস • Practice Engine"}
            </span>
            <h2 className="text-[14px] sm:text-[17px] font-bengali font-extrabold text-slate-800 leading-tight truncate">
              {activeSubTab === "topics" 
                ? "বিষয়ভিত্তিক প্রশ্নমালা" 
                : (activeClass === "ঢাকা বিশ্ববিদ্যালয়" 
                   ? "ঢাকা বিশ্ববিদ্যালয় C Unit নোটস" 
                   : (activeClass === "রাজশাহী বিশ্ববিদ্যালয়" 
                      ? "রাজশাহী বিশ্ববিদ্যালয় B Unit নোটস" 
                      : `${activeClass} নোটস`))}
            </h2>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {activeClass === "রাজশাহী বিশ্ববিদ্যালয়" && (
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-8 h-8 object-contain rounded-full shadow-xs bg-white p-0.5 border" 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/icon-192.png";
              }}
            />
          )}
        </div>
      </div>

      {/* Main View switching based on active bottom sub-tab */}
      <div className="flex-1 w-full px-1">
        <AnimatePresence mode="wait">
          {activeSubTab === "bank" && (
            <motion.div 
              key="bank-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {loadingQuestions ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-400"></div>
                </div>
              ) : questionsList.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-[32px] border border-slate-100 shadow-sm">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-bengali text-sm text-slate-500">এই বিভাগে কোনো প্রশ্নপত্র পাওয়া যায়নি।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {questionsList.map((paper, idx) => (
                    <Link 
                      key={idx}
                      to={`/paperview?title=${encodeURIComponent(paper.title)}&classGroup=${encodeURIComponent(activeClassGroup)}`}
                      className="bg-white p-5 sm:p-6 rounded-[28px] border border-slate-200/70 hover:border-blue-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex items-center justify-between gap-4 group relative overflow-hidden"
                    >
                      {/* Left accent bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-full scale-y-75 group-hover:scale-y-100 transition-transform duration-300" />
                      
                      <div className="space-y-2 flex-1 pl-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 text-[10px] font-sans font-extrabold px-3 py-1 rounded-full border border-blue-500/15 uppercase tracking-widest shadow-2xs">
                            {questionFormat}
                          </span>
                          <span className="text-[11px] text-slate-500 font-sans flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {getPaperDate(paper.title)}
                          </span>
                        </div>
                        <h4 className="font-bengali text-slate-900 font-extrabold text-base sm:text-lg group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                          {formatPaperTitle(paper.title, activeClass)}
                        </h4>
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs sm:text-[13px] font-bengali font-semibold">
                          <div className="p-1 rounded-lg bg-slate-50 text-slate-500 border border-slate-100">
                            <BookOpen className="w-3.5 h-3.5" />
                          </div>
                          <span>{paper.questions?.length || 0} টি প্রশ্ন</span>
                        </div>
                      </div>
                      
                      <div className="w-11 h-11 rounded-full bg-slate-50/80 border border-slate-100 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-md transition-all duration-300">
                        <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeSubTab === "topics" && (
            <motion.div 
              key="topics-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Hero Banner matched to user design */}
              <div className="relative bg-[#EBECFF]/50 rounded-[32px] p-6 sm:p-8 overflow-hidden flex flex-row items-center justify-between gap-6">
                {/* Decorative blobs */}
                <div className="absolute top-[-20%] left-[-10%] w-[200px] h-[200px] bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-30%] right-[-10%] w-[250px] h-[250px] bg-purple-200/50 rounded-full blur-3xl pointer-events-none" />
                
                <div className="space-y-3 z-10 hidden sm:block">
                  <div className="inline-flex items-center gap-1.5 text-indigo-700 font-sans text-xs font-bold uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    টপিক ভিত্তিক • TOPICS
                  </div>
                  <h2 className="font-bengali text-2xl sm:text-3xl font-extrabold text-[#0F2744] tracking-tight leading-tight">
                    বিষয়ভিত্তিক প্রশ্নমালা
                  </h2>
                  <p className="text-sm font-bengali text-slate-600 max-w-sm leading-relaxed">
                    আপনার পছন্দের বিষয় নির্বাচন করে বহুনির্বাচনী প্রশ্ন (MCQ) প্র্যাকটিস করুন
                  </p>
                </div>

                <div className="space-y-3 z-10 sm:hidden flex-1">
                  <div className="inline-flex items-center gap-1.5 text-indigo-700 font-sans text-[10px] font-bold uppercase tracking-wider">
                    <ArrowLeft className="w-3.5 h-3.5" onClick={() => setActiveSubTab("bank")} />
                    টপিক ভিত্তিক • TOPICS
                  </div>
                  <h2 className="font-bengali text-xl font-extrabold text-[#0F2744] tracking-tight leading-tight">
                    বিষয়ভিত্তিক প্রশ্নমালা
                  </h2>
                  <p className="text-xs font-bengali text-slate-600 max-w-xs leading-relaxed">
                    আপনার পছন্দের বিষয় নির্বাচন করে বহুনির্বাচনী প্রশ্ন (MCQ) প্র্যাকটিস করুন
                  </p>
                </div>

                {/* Vector / Abstract Illo */}
                <div className="z-10 relative shrink-0">
                  <div className="w-20 h-24 sm:w-28 sm:h-32 relative bg-white/60 backdrop-blur-sm rounded-xl border border-white shadow-[10px_10px_30px_rgba(0,0,0,0.05)] flex items-center justify-center skew-x-[-10deg] rotate-6 transform">
                     <Library className="w-10 h-10 sm:w-14 sm:h-14 text-indigo-400 rotate-[-6deg] skew-x-[10deg]" />
                     <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center rotate-[-6deg] skew-x-[10deg]">
                       <Sparkles className="w-4 h-4 text-emerald-500" />
                     </div>
                  </div>
                </div>
              </div>

              {/* Search inside the subject page */}
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  type="search" 
                  placeholder="বিষয় খুঁজুন..." 
                  className="pl-12 pr-14 font-bengali bg-white border-none shadow-[0_2px_15px_rgba(0,0,0,0.04)] rounded-[20px] h-14 text-base placeholder:text-slate-400" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-500 hover:text-[#0F2744] transition-colors">
                  <Filter className="w-4 h-4" />
                  <span className="font-bengali text-sm font-semibold hidden sm:inline">ফিল্টার</span>
                </button>
              </div>

              {/* Topic Cards List */}
              <div className="grid gap-4 mt-6">
                {dynamicSubjects
                  .filter(sub => !searchQuery || sub.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(sub => {
                    const meta = TOPICS_METADATA[sub] || { 
                      name: sub, 
                      icon: BookOpen, 
                      count: "১৫", 
                      desc: `${sub} বিষয়ের গুরুত্বপূর্ণ সকল বহুনির্বাচনী প্রশ্ন (MCQ)`, 
                      bg: "bg-slate-50", 
                      iconColor: "text-slate-500" 
                    };
                    const IconComp = meta.icon;
                    return (
                      <Link 
                        key={sub} 
                        to={`/paper?title=${encodeURIComponent("Subject-wise Questions")}&subject=${encodeURIComponent(sub)}&classGroup=${encodeURIComponent(activeClassGroup || "")}&university=${encodeURIComponent(activeClass || "")}`}
                        className="bg-white p-4 sm:p-5 rounded-[24px] border border-slate-100/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-200 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between gap-4 group"
                      >
                         <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                           <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] flex items-center justify-center ${meta.bg} ${meta.iconColor} shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                             <IconComp className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.5} />
                           </div>
                           <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                             <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                               <h4 className="font-bengali font-bold text-slate-800 text-base sm:text-[19px] group-hover:text-[#0F2744] transition-colors truncate mb-1">
                                 {meta.name}
                               </h4>
                               <span className="font-bengali text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full shrink-0">
                                 {meta.count} টপিকস
                               </span>
                             </div>
                             <p className="font-bengali text-[13px] sm:text-[14px] text-slate-500 leading-snug font-medium truncate sm:whitespace-normal sm:line-clamp-2 pr-2">
                               {meta.desc}
                             </p>
                           </div>
                         </div>
                         <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0F2744] group-hover:translate-x-1 transition-all shrink-0 mr-1" />
                      </Link>
                    )
                })}
              </div>
            </motion.div>
          )}
          {activeSubTab === "practice" && (
            <motion.div 
              key="practice-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {!quizStarted ? (
                <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-200/90 shadow-xs text-center max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
                    <Trophy className="w-8 h-8" />
                  </div>
                  
                  <h3 className="font-bengali font-bold text-slate-800 text-xl sm:text-2xl mb-2">
                    ডেইলি কুইজ প্র্যাকটিস
                  </h3>
                  <p className="font-bengali text-slate-500 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
                    আপনার সিলেক্ট করা পরীক্ষার উপর ভিত্তি করে ১০টি র্যান্ডম এমসিকিউ সমাধান করে দ্রুত নিজের প্রস্তুতি ঝালাই করুন!
                  </p>

                  <Button
                    onClick={handleStartPracticeQuiz}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bengali font-bold px-8 py-5 h-12 w-full text-sm shadow-sm transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" /> কুইজ শুরু করুন
                  </Button>
                </div>
              ) : quizFinished ? (
                <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-200/90 shadow-xs text-center max-w-lg mx-auto space-y-6">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Trophy className="w-11 h-11" />
                    </div>
                    {/* Pulsing visual glow */}
                    <span className="absolute inset-0 w-20 h-20 bg-emerald-400/20 rounded-full animate-ping pointer-events-none" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-bengali font-bold text-slate-800 text-xl sm:text-2xl">
                      কুইজ সম্পন্ন হয়েছে!
                    </h3>
                    <p className="font-bengali text-sm text-slate-500">আপনার স্কোর নিচে দেওয়া হলো</p>
                  </div>

                  {/* Core scorecard displays */}
                  <div className="bg-slate-50 rounded-2xl p-4 flex justify-around items-center border border-slate-100/80">
                    <div className="text-center">
                      <span className="block text-2xl font-black text-emerald-600 font-sans">{quizScore} / {quizQuestions.length}</span>
                      <span className="text-[11px] font-bengali font-semibold text-slate-400">সঠিক উত্তর</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div className="text-center">
                      <span className="block text-2xl font-black text-slate-700 font-sans">
                        {Math.round((quizScore / quizQuestions.length) * 100)}%
                      </span>
                      <span className="text-[11px] font-bengali font-semibold text-slate-400">সাফল্যের হার</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleStartPracticeQuiz}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bengali font-semibold py-4 h-11 text-xs"
                    >
                      আবার খেলুন
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuizStarted(false);
                        setQuizFinished(false);
                      }}
                      className="flex-1 rounded-2xl border-slate-200 text-slate-600 text-xs font-bengali font-semibold py-4 h-11 bg-white hover:bg-slate-50"
                    >
                      কুইজ বন্ধ করুন
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-xs max-w-lg mx-auto space-y-6">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bengali font-bold text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-full">
                      এমসিকিউ প্র্যাকটিস
                    </span>
                    <span className="text-xs font-semibold text-slate-500 font-sans">
                      Question {currentQuizIndex + 1} of {quizQuestions.length}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>

                  {/* Display active question content carefully */}
                  {quizQuestions[currentQuizIndex] && (
                    <div className="space-y-5">
                      <h4 className="font-bengali text-slate-800 text-base sm:text-lg font-bold leading-normal">
                        {quizQuestions[currentQuizIndex].text}
                      </h4>

                      <div className="flex flex-col gap-2.5">
                        {['A', 'B', 'C', 'D'].map((optionKey) => {
                          const optionText = quizQuestions[currentQuizIndex][`option${optionKey}`] || quizQuestions[currentQuizIndex][`option_${optionKey.toLowerCase()}`];
                          if (!optionText) return null;
                          
                          const isSelected = selectedQuizAnswer === optionKey;
                          const correctAns = quizQuestions[currentQuizIndex].correctOption || quizQuestions[currentQuizIndex].correct_answer || quizQuestions[currentQuizIndex].correctAnswer || quizQuestions[currentQuizIndex].answer;
                          const isCorrectOption = optionKey.trim().toLowerCase() === correctAns?.trim()?.toLowerCase();
                          
                          let optionStyle = "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300";
                          if (quizAnswered) {
                            if (isCorrectOption) {
                              optionStyle = "border-green-200 bg-green-50 text-green-800 font-semibold shadow-xs shadow-green-100";
                            } else if (isSelected) {
                              optionStyle = "border-rose-200 bg-rose-50 text-rose-800 font-semibold";
                            } else {
                              optionStyle = "border-slate-100 bg-slate-50/50 text-slate-400 opacity-60";
                            }
                          }

                          return (
                            <button
                              key={optionKey}
                              disabled={quizAnswered}
                              onClick={() => handleSelectQuizOption(optionKey, correctAns)}
                              className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm transition-all duration-150 font-bengali flex items-start gap-3 ${optionStyle}`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border text-[11px] font-sans font-bold ${isSelected ? "bg-current text-white" : "border-slate-300 text-slate-500"}`}>
                                {optionKey}
                              </span>
                              <span className="flex-1">{getCleanOptionText(optionText)}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Quiz Options Feedback Action Row */}
                      {quizAnswered && (
                        <div className="pt-2 flex flex-col gap-3">
                          {quizQuestions[currentQuizIndex].explanation && (
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs font-bengali text-slate-600 leading-relaxed">
                              <span className="font-bold text-slate-800 block mb-1">💡 ব্যাখ্যা:</span>
                              {quizQuestions[currentQuizIndex].explanation}
                            </div>
                          )}

                          <Button
                            onClick={handleNextQuizQuestion}
                            className="w-full bg-[#FFB800] hover:bg-[#E5A600] text-slate-900 rounded-2xl py-4 h-11 text-xs font-bengali font-bold shadow-xs transition-colors"
                          >
                            পরবর্তী প্রশ্ন
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {renderBottomNav()}
    </div>
  );
}
