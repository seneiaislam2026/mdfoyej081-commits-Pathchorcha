import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Briefcase, BookOpen, ArrowLeft, ArrowRight, PenTool, LayoutList, AlertCircle, Clock, Calendar, Download, Trophy, Sparkles, CheckCircle2, ChevronRight, Brain, Library, Languages, Monitor, Calculator, Atom, FlaskConical, Dna, Globe, Users, TrendingUp, Map as MapIcon, GraduationCap, Landmark, Server, X } from "lucide-react";
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
  if (classGroup === "Class 6-8") {
     return ["বাংলা", "English", "গণিত", "বাংলাদেশ ও বিশ্বপরিচয়", "ধর্ম"];
  }
  
  if (group === "মানবিক" || group === "Arts") {
    return [...common, "ইতিহাস", "পৌরনীতি", "ভূগোল", "অর্থনীতি", "যুক্তিবিদ্যা", "সমাজবিজ্ঞান", "ইসলামের ইতিহাস"];
  } else if (group === "বাণিজ্য" || group?.includes("ব্যবসায়") || group?.includes("ব্যবসায়") || group?.includes("Commerce") || group?.includes("Business")) {
    return [...common, "হিসাববিজ্ঞান", "ম্যানেজমেন্ট", "ফিন্যান্স", "উৎপাদন ব্যবস্থাপনা", "মার্কেটিং", "ব্যবসায় উদ্যোগ", "ব্যবসায় সংগঠন ও ব্যবস্থাপনা"];
  }
  // Default to non-science if science is requested/missed
  return common;
};

const mapUserClassToGroup = (cls?: string) => {
  if (!cls) return "HSC";
  const c = cls.toLowerCase();
  if (c === "এডমিশন" || c.includes("admission") || c.includes("ভর্তি") || c.includes("ভার্সিটি") || c.includes("মেডিকেল") || c.includes("ইঞ্জিনিয়ারিং") || c.includes("এডমিশন")) return "Admission";
  if (c === "দশম শ্রেণী" || c.includes("ssc") || c.includes("দশম") || c.includes("এসএসসি")) return "SSC";
  if (c === "এইচএসসি" || c === "hsc" || c === "একাদশ" || c === "একাদশ শ্রেণী" || c === "দ্বাদশ" || c === "দ্বাদশ শ্রেণী" || c.includes("hsc") || c.includes("এইচএসসি")) return "HSC";
  if (c === "নবম শ্রেণী" || c.includes("class 9") || c.includes("নবম") || c.includes("৯ম")) return "Class 9";
  if (c.includes("৬ষ্ঠ") || c.includes("৭ম") || c.includes("৮ম") || c.includes("class 6") || c.includes("class 7") || c.includes("class 8")) return "Class 6-8";
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
  const dkau = { name: "ঢাকা কৃষি বিশ্ববিদ্যালয়", short: "ঢাকেবি", logo: "https://cdn-icons-png.flaticon.com/512/8076/8076045.png" };

  if (group === "বিজ্ঞান" || !group) {
    return [
      ...commonBefore,
      { name: "মেডিকেল", short: "মেডিকেল", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Star_of_life2.svg/512px-Star_of_life2.svg.png" },
      { name: "প্রকৌশল", short: "প্রকৌশল", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/96/BUET_LOGO.svg/512px-BUET_LOGO.svg.png" },
      nu,
      dkau
    ];
  }
  return [...commonBefore, nu, dkau];
};


const TOPICS_METADATA: Record<string, any> = {
  "বাংলা": { name: "বাংলা সাহিত্য", icon: Library, count: "২২৩", desc: "রবীন্দ্রনাথ, নজরুল, আধুনিক সাহিত্য ও ব্যাকরণ", bg: "bg-emerald-50", iconColor: "text-emerald-500" },
  "English": { name: "English", icon: Languages, count: "১০৮", desc: "English Grammar, Tense, Voice Change", bg: "bg-purple-50", iconColor: "text-purple-500" },
  "ম্যানেজমেন্ট": { name: "ম্যানেজমেন্ট", icon: Briefcase, count: "৫০", desc: "ব্যবস্থাপনা, সংগঠন, ব্যবসায় নীতি", bg: "bg-blue-50", iconColor: "text-blue-500" },
  "হিসাববিজ্ঞান": { name: "হিসাববিজ্ঞান", icon: BookOpen, count: "০", desc: "হিসাববিজ্ঞান মূলনীতি, জাবেদা", bg: "bg-emerald-50", iconColor: "text-emerald-500" },
  "ICT": { name: "ICT", icon: Monitor, count: "৮৯", desc: "কম্পিউটার বেসিক, হার্ডওয়্যার, সফটওয়্যার", bg: "bg-blue-50", iconColor: "text-blue-500" },
  "উচ্চতর গণিত": { name: "উচ্চতর গণিত", icon: Calculator, count: "৯৮", desc: "ম্যাট্রিক্স, ডিটারমিনেন্ট, ক্যালকুলাস", bg: "bg-amber-50", iconColor: "text-amber-500" },
  "গণিত": { name: "গণিত", icon: Calculator, count: "৮৫", desc: "পাটিগণিত, বীজগণিত, পরিমিতি", bg: "bg-amber-50", iconColor: "text-amber-500" },
  "পদার্থবিজ্ঞান": { name: "পদার্থবিজ্ঞান", icon: Atom, count: "৭৬", desc: "যান্ত্রিক, তরঙ্গ, তাপগতিবিদ্যা", bg: "bg-indigo-50", iconColor: "text-indigo-500" },
  "রসায়ন": { name: "রসায়ন", icon: FlaskConical, count: "৬৪", desc: "জৈব রসায়ন, অজৈব রসায়ন, গাণিতিক রসায়ন", bg: "bg-rose-50", iconColor: "text-rose-500" },
  "রসায়ন": { name: "রসায়ন", icon: FlaskConical, count: "৬৪", desc: "জৈব রসায়ন, অজৈব রসায়ন, গাণিতিক রসায়ন", bg: "bg-rose-50", iconColor: "text-rose-500" },
  "জীববিজ্ঞান": { name: "জীববিজ্ঞান", icon: Dna, count: "৫৮", desc: "উদ্ভিদবিজ্ঞান, প্রাণিবিজ্ঞান, জেনেটিক্স", bg: "bg-emerald-50", iconColor: "text-emerald-500" },
  "ইতিহাস": { name: "ইতিহাস", icon: Globe, count: "৫৫", desc: "প্রাচীন, মধ্যযুগ, আধুনিক ইতিহাস", bg: "bg-orange-50", iconColor: "text-orange-500" },
  "ভূগোল": { name: "ভূগোল", icon: MapIcon, count: "৪২", desc: "ভূ-প্রাকৃতিক, মানচিত্র, বাংলাদেশ ও বিশ্ব ভূগোল", bg: "bg-cyan-50", iconColor: "text-cyan-500" },
  "পৌরনীতি": { name: "পৌরনীতি", icon: BookOpen, count: "৩৫", desc: "নাগরিক অধিকার, রাষ্ট্রবিজ্ঞান", bg: "bg-sky-50", iconColor: "text-sky-500" },
  "অর্থনীতি": { name: "অর্থনীতি", icon: Briefcase, count: "৩০", desc: "ব্যষ্টিক, সামষ্টিক অর্থনীতি", bg: "bg-fuchsia-50", iconColor: "text-fuchsia-500" },
  "যুক্তিবিদ্যা": { name: "যুক্তিবিদ্যা", icon: Library, count: "২০", desc: "যুক্তি ও সমাধান", bg: "bg-indigo-50", iconColor: "text-indigo-500" },
  "সমাজবিজ্ঞান": { name: "সমাজবিজ্ঞান", icon: Users, count: "২৫", desc: "সমাজ ও সম্প্রদায়", bg: "bg-teal-50", iconColor: "text-teal-500" },
  "ইসলামের ইতিহাস": { name: "ইসলামের ইতিহাস", icon: Globe, count: "১৫", desc: "খিলাফত ও শাসনকাল", bg: "bg-green-50", iconColor: "text-green-500" },
  "ফিন্যান্স": { name: "ফিন্যান্স", icon: TrendingUp, count: "৪০", desc: "অর্থায়ন ও ব্যাংকিং", bg: "bg-rose-50", iconColor: "text-rose-500" },
  "উৎপাদন ব্যবস্থাপনা": { name: "উৎপাদন ব্যবস্থাপনা", icon: Briefcase, count: "২০", desc: "শিল্প ও বাণিজ্য", bg: "bg-amber-50", iconColor: "text-amber-500" },
  "মার্কেটিং": { name: "মার্কেটিং", icon: Monitor, count: "১৮", desc: "বিপণন ও বাজার", bg: "bg-blue-50", iconColor: "text-blue-500" },
  "ব্যবসায় উদ্যোগ": { name: "ব্যবসায় উদ্যোগ", icon: Briefcase, count: "২৫", desc: "উদ্যোক্তা ও প্রতিষ্ঠান", bg: "bg-purple-50", iconColor: "text-purple-500" },
  "ব্যবসায় সংগঠন ও ব্যবস্থাপনা": { name: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা", icon: Library, count: "৩০", desc: "ব্যবসা সংগঠন", bg: "bg-cyan-50", iconColor: "text-cyan-500" }
};

import { managementMCQs } from "../data/managementMcqs";
import { hscIctCQ } from "../data/hscIctCqData";

export default function QuestionBank() {
  const { userData, previewClass, setPreviewClass } = useAuth();
  const isPWA = useIsPWA();
  const navigate = useNavigate();

  const [isContentRendered, setIsContentRendered] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsContentRendered(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const effectiveClass = previewClass || userData?.class;
  const initialClassGroup = mapUserClassToGroup(effectiveClass);
  const [activeClassGroup, setActiveClassGroup] = useState(initialClassGroup);
  const [activeClass, setActiveClass] = useState(initialClassGroup === "Admission" ? "ঢাকা বিশ্ববিদ্যালয়" : (initialClassGroup === "Class 6-8" ? "Class 6" : initialClassGroup));
  const is9To12 = initialClassGroup === "Class 9" || initialClassGroup === "SSC" || initialClassGroup === "HSC";
  const [questionFormat, setQuestionFormat] = useState<"MCQ" | "CQ" | null>(is9To12 ? "MCQ" : (initialClassGroup === "Admission" ? "MCQ" : null));

  useEffect(() => {
    const newGroup = mapUserClassToGroup(effectiveClass);
    setActiveClassGroup(newGroup);
    setActiveClass(newGroup === "Admission" ? "ঢাকা বিশ্ববিদ্যালয়" : (newGroup === "Class 6-8" ? "Class 6" : newGroup));
    const isNineToTwelve = newGroup === "Class 9" || newGroup === "SSC" || newGroup === "HSC";
    setQuestionFormat(isNineToTwelve ? "MCQ" : (newGroup === "Admission" ? "MCQ" : null));
  }, [effectiveClass]);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get("tab") as "bank" | "topics" | "practice" | "institutions" | null;
  const [searchQuery, setSearchQuery] = useState("");
  const isTab9To12 = initialClassGroup === "Class 9" || initialClassGroup === "SSC" || initialClassGroup === "HSC";
  const [activeSubTab, setActiveSubTab] = useState<"bank" | "topics" | "practice" | "institutions">(tabParam || (isTab9To12 ? "topics" : "bank"));

  useEffect(() => {
    if (tabParam === "practice" || tabParam === "topics" || tabParam === "bank" || tabParam === "institutions") {
      setActiveSubTab(tabParam);
    }
  }, [tabParam]);
  
  const [activeTopicSubject, setActiveTopicSubject] = useState<string>("বাংলা");
  const [selectedTopicAnswers, setSelectedTopicAnswers] = useState<Record<string, string>>({});
  const [revealedTopicAnswers, setRevealedTopicAnswers] = useState<Record<string, boolean>>({});
  const [selectedSubjectForModal, setSelectedSubjectForModal] = useState<{title: string, subtitle: string} | null>(null);
  
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
    // Auto-select MCQ for Admission since there is no CQ
    if (activeClassGroup === "Admission" && questionFormat === null) {
      setQuestionFormat("MCQ");
    }
  }, [questionFormat, activeClassGroup]);



  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      try {
        let q = query(collection(db, "questions"), where("classGroup", "==", activeClassGroup));
        const snap = await getDocs(q);
        let results: any[] = [];
        snap.forEach(doc => {
          const data = doc.data();
          if (activeClassGroup === "Admission" && activeClass) {
            const uni = data.university || "";
            const matchesUni = 
              uni === activeClass || 
              (activeClass === "ঢাকা বিশ্ববিদ্যালয়" && (uni === "DU" || uni.toLowerCase().includes("dhaka") || uni.includes("ঢাকা"))) ||
              (activeClass === "রাজশাহী বিশ্ববিদ্যালয়" && (uni === "RU" || uni.toLowerCase().includes("rajshahi") || uni.includes("রাজশাহী"))) ||
              (activeClass === "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়" && (uni === "JU" || uni.toLowerCase().includes("jahangir") || uni.includes("জাহাঙ্গীরনগর"))) ||
              (activeClass === "চট্টগ্রাম বিশ্ববিদ্যালয়" && (uni === "CU" || uni.toLowerCase().includes("chittagong") || uni.includes("চট্টগ্রাম"))) ||
              (activeClass === "কুমিল্লা বিশ্ববিদ্যালয়" && (uni === "CU" || uni.toLowerCase().includes("comilla") || uni.includes("কুমিল্লা"))) ||
              (activeClass === "গুচ্ছ (GST)" && (uni === "GST" || uni.toLowerCase().includes("gst") || uni.includes("গুচ্ছ")));
            if (!matchesUni) return;
          } else if (activeClassGroup === "Class 6-8" && activeClass) {
            if (data.class !== activeClass) return;
          }
          results.push({ id: doc.id, ...data });
        });

        // Insert local data
        let filteredLocal: any[] = [];
        if (questionFormat === "MCQ") {
          filteredLocal = (managementMCQs as any[]).filter(m => m.classGroup === activeClassGroup);
        } else if (questionFormat === "CQ") {
          filteredLocal = (hscIctCQ as any[]).filter(m => m.classGroup === activeClassGroup);
        } else {
          filteredLocal = [...(managementMCQs as any[]), ...(hscIctCQ as any[])].filter(m => m.classGroup === activeClassGroup);
        }
        
        if (activeClassGroup === "Admission" && activeClass) {
          filteredLocal = filteredLocal.filter(m => {
            const uni = m.university || "";
            return !uni || 
              uni === activeClass || 
              (activeClass === "ঢাকা বিশ্ববিদ্যালয়" && (uni === "DU" || uni.toLowerCase().includes("dhaka") || uni.includes("ঢাকা"))) ||
              (activeClass === "রাজশাহী বিশ্ববিদ্যালয়" && (uni === "RU" || uni.toLowerCase().includes("rajshahi") || uni.includes("রাজশাহী"))) ||
              (activeClass === "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়" && (uni === "JU" || uni.toLowerCase().includes("jahangir") || uni.includes("জাহাঙ্গীরনগর"))) ||
              (activeClass === "চট্টগ্রাম বিশ্ববিদ্যালয়" && (uni === "CU" || uni.toLowerCase().includes("chittagong") || uni.includes("চট্টগ্রাম"))) ||
              (activeClass === "কুমিল্লা বিশ্ববিদ্যালয়" && (uni === "CU" || uni.toLowerCase().includes("comilla") || uni.includes("কুমিল্লা"))) ||
              (activeClass === "গুচ্ছ (GST)" && (uni === "GST" || uni.toLowerCase().includes("gst") || uni.includes("গুচ্ছ")));
          });
        } else if (activeClassGroup === "Class 6-8" && activeClass) {
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

  const renderTopicsView9To12 = () => {
    return (
      <div className="w-full relative min-h-[100vh] bg-[#f8fafc] font-sans pb-40">
        <div className="max-w-xl mx-auto p-4 sm:p-6 flex flex-col">
          {/* Header */}
          <div className="flex flex-col pb-4 mb-2 bg-[#f8fafc] sticky top-0 z-50 pt-2">
            <div className="relative w-full flex items-center gap-3 mb-6">
              <button 
                onClick={() => navigate("/dashboard")} 
                className="shrink-0 w-12 sm:w-14 h-12 sm:h-14 bg-card hover:bg-muted flex items-center justify-center rounded-full shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-slate-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" strokeWidth={2.5} />
              </button>
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  type="search" 
                  placeholder="প্রশ্নব্যাংক খুঁজুন" 
                  className="pl-12 pr-14 font-bengali bg-card border-0 shadow-[0_2px_15px_rgba(0,0,0,0.04)] rounded-full h-12 sm:h-14 text-base placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-emerald-500 w-full" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-card shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-slate-700 hover:bg-muted transition-colors">
                  <div className="relative">
                    <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-start w-full relative h-[80px]">
              <div className="flex flex-col z-10">
                <h2 className="text-[26px] sm:text-[28px] font-bengali font-black text-[#1E2B4C] leading-none mb-1">
                  বিষয় ভিত্তিক
                </h2>
                <span className="text-[14px] sm:text-[15px] font-bengali text-slate-500">
                  সকল বিষয়ের প্রশ্নব্যাংক
                </span>
              </div>
              <div className="absolute right-[-10px] top-[-20px] w-36 h-32 pointer-events-none opacity-90 object-contain flex items-end justify-end">
                {/* Embedded illustration representation using minimal geometry/SVG as stand-in for the book illustration */}
                <svg viewBox="0 0 120 100" className="w-full h-full drop-shadow-md">
                  {/* Base shadow/background blob */}
                  <ellipse cx="60" cy="85" rx="55" ry="10" fill="#E2E8F0" opacity="0.6" />
                  
                  {/* Purple Book (Bottom) */}
                  <rect x="25" y="65" width="70" height="15" rx="2" fill="#5C5CBE" />
                  <rect x="25" y="68" width="70" height="9" fill="#FFFFFF" opacity="0.9" />
                  <rect x="25" y="65" width="70" height="15" rx="2" fill="none" stroke="#4B4BA8" strokeWidth="1" />
                  <rect x="25" y="65" width="4" height="15" fill="#3D3D8A" />
                  
                  {/* Red/Orange Book (Middle) */}
                  <rect x="30" y="52" width="60" height="13" rx="2" fill="#E65100" />
                  <rect x="30" y="55" width="60" height="7" fill="#FFFFFF" opacity="0.9" />
                  <rect x="30" y="52" width="60" height="13" rx="2" fill="none" stroke="#BF360C" strokeWidth="1" />
                  <rect x="30" y="52" width="4" height="13" fill="#9E2A0B" />
                  
                  {/* Blue Pencil Stand */}
                  <path d="M85 45 L95 45 L95 65 L85 65 Z" fill="#3B82F6" />
                  <path d="M85 65 Q90 68 95 65" fill="#2563EB" />
                  <rect x="87" y="25" width="3" height="20" fill="#FBBF24" />
                  <polygon points="87,25 90,20 88.5,15" fill="#475569" />
                  <rect x="91" y="30" width="3" height="15" fill="#EF4444" />
                  <polygon points="91,30 94,25 92.5,20" fill="#475569" />
                  
                  {/* Graduation Cap */}
                  <polygon points="50,20 85,32 50,44 15,32" fill="#1E293B" />
                  <polygon points="50,22 83,32 50,42 17,32" fill="#334155" />
                  <path d="M35 38 L35 52 Q50 58 65 52 L65 38" fill="#1E293B" />
                  <path d="M80 32 L80 48" fill="none" stroke="#FBBF24" strokeWidth="1.5" />
                  <circle cx="80" cy="48" r="2.5" fill="#FBBF24" />
                </svg>
              </div>
            </div>
          </div>

          {/* Grid Layout matching the specified subjects and colors */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 z-10 relative mt-2">
            {[
              { title: "বাংলা", subtitle: "১ম পত্র", subjectCode: "Bangla 1st Paper", count: "4+", bg: "bg-gradient-to-br from-[#87d853] to-[#71c33a]", letter: "অ", icon: BookOpen },
              { title: "বাংলা", subtitle: "২য় পত্র", subjectCode: "Bangla 2nd Paper", count: "149+", bg: "bg-gradient-to-br from-[#fda63a] to-[#ff8f00]", letter: "ব", icon: PenTool },
              { title: "ইংরেজি", subtitle: "১ম পত্র", subjectCode: "English 1st Paper", count: "3+", bg: "bg-gradient-to-br from-[#ff6b6b] to-[#fa5252]", letter: "A", icon: Languages },
              { title: "ইংরেজি", subtitle: "২য় পত্র", subjectCode: "English 2nd Paper", count: "149+", bg: "bg-gradient-to-br from-[#4ea5ff] to-[#3a8eed]", letter: "a", icon: BookOpen }, 
              { title: "একাউন্টিং", subtitle: "১ম পত্র", subjectCode: "Accounting 1st Paper", count: "3+", bg: "bg-gradient-to-br from-[#2ccfb6] to-[#1bb59e]", letter: "এ", icon: TrendingUp },
              { title: "একাউন্টিং", subtitle: "২য় পত্র", subjectCode: "Accounting 2nd Paper", count: "3+", bg: "bg-gradient-to-br from-[#a671ff] to-[#8d54ea]", letter: "অ", icon: Calculator },
              { title: "ICT", subtitle: "", subjectCode: "ICT", count: "20+", bg: "bg-gradient-to-br from-[#0891b2] to-[#0e7490]", letter: "I", icon: Monitor },
            ].map((subject, idx) => (
               <button 
                  key={idx} 
                  onClick={() => {
                    navigate(`/format?subject=${encodeURIComponent(subject.subjectCode)}&classGroup=${encodeURIComponent(activeClassGroup || "")}`);
                  }}
                  className={`${subject.bg} relative overflow-hidden rounded-[20px] p-4 sm:p-5 text-white flex flex-col justify-between aspect-[1.3/1] shadow-sm hover:shadow-md transition-all active:scale-95 text-left`}
               >
                 {/* Faded Letter Background */}
                 <span className="absolute -bottom-4 -right-1 text-[80px] sm:text-[90px] font-bengali font-black opacity-[0.15] leading-none pointer-events-none select-none">
                   {subject.letter}
                 </span>
                 
                 <div className="flex justify-between items-start relative z-10 w-full">
                   <div className="flex flex-col">
                     <span className="font-bengali font-extrabold text-[19px] sm:text-[21px] leading-tight drop-shadow-sm">{subject.title}</span>
                     <span className="font-bengali font-medium text-[13px] sm:text-[14px] opacity-90">{subject.subtitle}</span>
                   </div>
                   <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-card/95 flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                     <subject.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${subject.title === 'বাংলা' && subject.subtitle === '১ম পত্র' ? 'text-[#71c33a]' : subject.title === 'বাংলা' && subject.subtitle === '২য় পত্র' ? 'text-[#ff8f00]' : subject.title === 'ইংরেজি' && subject.subtitle === '১ম পত্র' ? 'text-[#fa5252]' : subject.title === 'ইংরেজি' && subject.subtitle === '২য় পত্র' ? 'text-[#3a8eed]' : subject.title === 'একাউন্টিং' && subject.subtitle === '১ম পত্র' ? 'text-[#1bb59e]' : 'text-[#8d54ea]'}`} strokeWidth={2.5} />
                   </div>
                 </div>
                 
                 <div className="mt-auto relative z-10">
                   <div className="bg-card text-foreground text-[12px] sm:text-[13px] font-bold px-3 py-1 rounded-md inline-flex items-center gap-1.5 shadow-sm">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                     {subject.count}
                   </div>
                 </div>
               </button>
            ))}
          </div>

          {/* Banner bottom */}
          <div className="mt-4 bg-[#f0f9f3] border border-[#d6eedf] rounded-[16px] p-3.5 sm:p-4 flex items-center gap-3">
             <div className="w-10 h-10 relative shrink-0">
               <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-sm">
                 <rect x="5" y="5" width="26" height="30" rx="3" fill="#FFFFFF" stroke="#008060" strokeWidth="1.5" />
                 <path d="M12 4 L24 4 L24 8 L12 8 Z" fill="#008060" />
                 <line x1="12" y1="15" x2="24" y2="15" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                 <line x1="12" y1="22" x2="24" y2="22" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                 <circle cx="28" cy="28" r="8" fill="#008060" />
                 <path d="M25 28 L27 30 L31 25" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
             </div>
             <div className="flex-1 min-w-0">
               <h4 className="font-bengali font-bold text-[#006047] text-[13px] sm:text-[15px] truncate">প্রতিদিন পড়ুন, নিয়মিত অনুশীলন করুন</h4>
               <p className="font-bengali text-slate-500 text-[11px] sm:text-[12px]">সাফল্য আপনার হাতের মুঠোয়</p>
             </div>
             <div className="w-7 h-7 rounded-full bg-[#008060] text-white flex items-center justify-center shrink-0 shadow-sm cursor-pointer hover:bg-[#006047] transition-colors">
               <ChevronRight className="w-4 h-4 ml-0.5" strokeWidth={3} />
             </div>
          </div>

        </div>



      </div>
    );
  };
  const renderBottomNav = () => {
    const is9To12Config = activeClassGroup === "Class 9" || activeClassGroup === "SSC" || activeClassGroup === "HSC";
    if (is9To12Config) {
      return (
        <div className="fixed bottom-0 inset-x-0 w-full z-50 transition-all bg-card border-t border-slate-200">
          <div className="flex items-center w-full max-w-md mx-auto">
            <button
              onClick={() => { setActiveSubTab("bank"); setQuizStarted(false); }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] sm:text-[12px] font-bengali font-bold transition-all relative z-10 ${activeSubTab === "bank" ? "text-[#008060]" : "text-slate-500 hover:text-slate-700"}`}
            >
              <CheckCircle2 className={`w-5 h-5 shrink-0 ${activeSubTab === "bank" ? "text-[#008060] fill-emerald-50" : "text-slate-400"}`} />
              মডেল টেস্ট
            </button>
            <button
              onClick={() => { setActiveSubTab("topics"); setQuizStarted(false); }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] sm:text-[12px] font-bengali font-bold transition-all relative z-10 ${activeSubTab === "topics" ? "text-[#008060]" : "text-slate-500 hover:text-slate-700"}`}
            >
              <LayoutList className={`w-5 h-5 shrink-0 ${activeSubTab === "topics" ? "text-[#008060] fill-emerald-50" : "text-slate-400"}`} />
              বিষয় ভিত্তিক
            </button>
            <button
              onClick={() => { setActiveSubTab("institutions"); setQuizStarted(false); }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] sm:text-[12px] font-bengali font-bold transition-all relative z-10 ${activeSubTab === "institutions" ? "text-[#008060]" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Landmark className={`w-5 h-5 shrink-0 ${activeSubTab === "institutions" ? "text-[#008060] fill-emerald-50" : "text-slate-400"}`} />
              প্রতিষ্ঠান ভিত্তিক
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="fixed bottom-0 inset-x-0 bg-card border-t border-slate-200/80 py-3.5 px-6 flex justify-around items-center z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.03)] rounded-t-[28px] max-w-lg mx-auto pb-safe">
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
          <span className="text-[11px] sm:text-xs font-bengali font-bold">টপিক ভিত্তিক</span>
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
  };

  if (!isContentRendered) {
    return (
      <div className="flex flex-col items-center justify-center p-20 opacity-50 min-h-screen">
        <div className="w-8 h-8 rounded-full border-4 border-[#0F2744]/20 border-t-[#0F2744] animate-spin mb-4" />
        <p className="font-bengali font-bold text-slate-500">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!questionFormat) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bengali font-bold text-foreground mb-4">কী ধরনের প্রশ্ন অনুশীলন করতে চাও?</h2>
          
          <div className="flex items-center justify-center gap-3 mb-6">
             {isOffline && (
               <span className="flex items-center gap-1.5 text-sm bg-orange-100 text-orange-700 font-bengali px-3 py-1 rounded-full shrink-0">
                 <AlertCircle className="w-4 h-4" /> অফলাইন মোড
               </span>
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
            className="cursor-pointer bg-card border-2 border-slate-100 hover:border-primary/50 shadow-sm hover:shadow-md p-8 rounded-[32px] text-center transition-all group"
          >
            <div className="bg-primary/10 w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
              <LayoutList className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bengali font-bold text-foreground mb-2">MCQ প্রশ্ন</h3>
            <p className="text-slate-500 font-bengali">বহুনির্বাচনি প্রশ্ন এবং মডেল টেস্ট</p>
          </motion.div>

          {activeClassGroup !== "Admission" && (
            <motion.div
              whileHover={{ scale: 1.02, translateY: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setQuestionFormat("CQ")}
              className="cursor-pointer bg-card border-2 border-slate-100 hover:border-secondary/50 shadow-sm hover:shadow-md p-8 rounded-[32px] text-center transition-all group"
            >
              <div className="bg-secondary/10 w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/20 transition-colors">
                <PenTool className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-2xl font-bengali font-bold text-foreground mb-2">CQ প্রশ্ন</h3>
              <p className="text-slate-500 font-bengali">সৃজনশীল বা লিখিত প্রশ্নমালা</p>
            </motion.div>
          )}
        </div>
        {renderBottomNav()}
      </div>
    );
  }

  if (activeClassGroup === "Admission" && !selectedUniversity && activeSubTab === "bank") {
    const getUniThemeInfo = (short: string) => {
        switch(short) {
            case "ঢাবি": return { icon: Calendar, theme: "bg-[#F0F7FF] text-[#1E6BFF]", line: "bg-[#1E6BFF]" };
            case "ঢাকেবি": return { icon: BookOpen, theme: "bg-[#FFF4E6] text-[#FF8C00]", line: "bg-[#FF8C00]" };
            case "রাবি": return { icon: BookOpen, theme: "bg-[#F0FDF4] text-[#10B981]", line: "bg-[#10B981]" };
            case "জাবি": return { icon: GraduationCap, theme: "bg-[#F5F3FF] text-[#8B5CF6]", line: "bg-[#8B5CF6]" };
            case "চবি": return { icon: Landmark, theme: "bg-[#FFFBEB] text-[#F59E0B]", line: "bg-[#F59E0B]" };
            case "কুবি": return { icon: PenTool, theme: "bg-[#FDF2F8] text-[#EC4899]", line: "bg-[#EC4899]" };
            case "গুচ্ছ": return { icon: Server, theme: "bg-[#F8FAFC] text-[#64748B]", line: "", disabled: true, textBelow: "আসছে শীঘ্রই" };
            case "মেডিকেল": return { icon: Dna, theme: "bg-[#FFE4E6] text-[#E11D48]", line: "bg-[#E11D48]" };
            case "প্রকৌশল": return { icon: Calculator, theme: "bg-[#E0F2FE] text-[#0284C7]", line: "bg-[#0284C7]" };
            case "জাতীয়": return { icon: Library, theme: "bg-[#F3E8FF] text-[#9333EA]", line: "bg-[#9333EA]" };
            default: return { icon: Sparkles, theme: "bg-slate-100 text-slate-500", line: "bg-muted0" };
        }
    };

    return (
      <div className="w-full relative min-h-[100vh] bg-[#f8fafc] font-sans pb-32">
        <div className="max-w-xl mx-auto p-4 sm:p-6 flex flex-col">
          {/* Header */}
          <div className="flex flex-col pb-6 border-b border-slate-200/50 mb-6 bg-[#f8fafc] sticky top-0 z-50 pt-2">
            <div className="flex items-center gap-4">
              <button 
               onClick={() => navigate("/dashboard")}
               className="w-11 h-11 rounded-full bg-card border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-center hover:bg-muted transition-all cursor-pointer text-slate-700 shrink-0"
              >
               <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <div className="flex flex-col">
                <span className="text-[12px] font-extrabold text-[#1E6BFF] uppercase tracking-widest mb-0.5">
                  ভর্তি পরীক্ষা • ADMISSION
                </span>
                <h2 className="text-[20px] sm:text-[24px] font-bengali font-extrabold text-[#1E2B4C] leading-tight">
                  বিশ্ববিদ্যালয় নির্বাচন করো
                </h2>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {getUniversitiesByGroup(userData?.group).map(uni => {
              const { icon: IconObj, theme, line, disabled, textBelow } = getUniThemeInfo(uni.short);
              
              return (
                <motion.button
                  whileHover={{ scale: disabled ? 1 : 1.02, translateY: disabled ? 0 : -2 }}
                  whileTap={{ scale: disabled ? 1 : 0.98 }}
                  key={uni.name}
                  onClick={() => {
                    if(!disabled) {
                      setSelectedUniversity(uni.name);
                      setActiveClass(uni.name);
                    }
                  }}
                  className={`relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-[24px] bg-card transition-all overflow-hidden border border-slate-100 ${disabled ? "opacity-90 cursor-not-allowed" : "cursor-pointer hover:border-slate-200"}`}
                  style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
                >
                  {/* Subtle corner marker for DHABI (like the design) */}
                  {uni.short === "ঢাবি" && (
                    <div className="absolute top-0 right-0 w-8 h-8 flex items-start justify-end rounded-bl-[20px] bg-[#1E6BFF] z-10 pointer-events-none">
                       <CheckCircle2 className="w-3.5 h-3.5 text-white m-[6px] opacity-90" strokeWidth={3} />
                    </div>
                  )}
                  
                  <div className={`relative w-[76px] h-[76px] rounded-full flex items-center justify-center mb-5 ${theme}`}>
                    {!disabled && (
                      <>
                        <div className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-current opacity-30"></div>
                        <div className="absolute bottom-2 left-0 w-1.5 h-1.5 rounded-full bg-current opacity-20"></div>
                        <div className="absolute top-3 right-0 w-1.5 h-1.5 rounded-full bg-current opacity-30"></div>
                        <div className="absolute -bottom-1 right-2 w-1 h-1 rounded-full bg-current opacity-20"></div>
                        <div className="absolute top-1/2 -left-3 w-1 h-1 rounded-full bg-current opacity-25"></div>
                        <div className="absolute top-1/4 -right-2 w-1.5 h-1.5 rounded-full bg-current opacity-20"></div>
                      </>
                    )}
                    
                    {uni.short === "ঢাবি" ? (
                      <img src="https://i.ibb.co/WQNnNVx/IMG-20260619-WA0020.jpg" alt="ঢাবি" className="w-[38px] h-[38px] object-contain drop-shadow-sm rounded-full" />
                    ) : uni.short === "রাবি" ? (
                      <img src="https://i.ibb.co/mr1nV4zQ/IMG-20260619-WA0022.jpg" alt="রাবি" className="w-[38px] h-[38px] object-contain drop-shadow-sm rounded-full" />
                    ) : uni.short === "জাবি" ? (
                      <img src="https://i.ibb.co/xq78dw8G/IMG-20260619-WA0023.jpg" alt="জাবি" className="w-[38px] h-[38px] object-contain drop-shadow-sm rounded-full" />
                    ) : uni.short === "চবি" ? (
                      <img src="https://i.ibb.co/jZHvJMj7/IMG-20260619-WA0021.jpg" alt="চবি" className="w-[38px] h-[38px] object-contain drop-shadow-sm rounded-full" />
                    ) : uni.short === "জাতীয়" ? (
                      <img src="https://i.ibb.co/Cd4T262/IMG-20260619-WA0024.jpg" alt="জাতীয়" className="w-[38px] h-[38px] object-contain drop-shadow-sm rounded-full" />
                    ) : uni.short === "কুবি" ? (
                      <img src="https://i.ibb.co/99NTPs1W/IMG-20260619-WA0025.jpg" alt="কুবি" className="w-[38px] h-[38px] object-contain drop-shadow-sm rounded-full" />
                    ) : uni.short === "ঢাকেবি" ? (
                      <img src="https://i.ibb.co/7dnGbBHN/IMG-20260619-WA0027.jpg" alt="ঢাকেবি" className="w-[38px] h-[38px] object-contain drop-shadow-sm rounded-full" />
                    ) : (
                      <IconObj className="w-8 h-8" strokeWidth={2.5} />
                    )}
                  </div>

                  <span className="font-bengali font-extrabold text-[#1E2B4C] text-[20px] mb-2">{uni.short}</span>
                  
                  {disabled ? (
                    <span className="text-[13px] font-bengali font-bold text-slate-400">{textBelow}</span>
                  ) : (
                    <div className={`h-[3px] w-8 rounded-full ${line}`}></div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Subject-wise Icons Grid for Admission Page */}
          <div className="mt-8 mb-6">
            <div className="flex flex-col gap-1 mb-5">
              <span className="text-[12px] font-extrabold text-blue-600 uppercase tracking-widest">
                টপিক ভিত্তিক • TOPICS
              </span>
              <h3 className="text-[20px] sm:text-[23px] font-bengali font-extrabold text-[#1E2B4C] leading-tight">
                অন্যান্য বিষয়ের প্রশ্নব্যাংক
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { title: "বাংলা", subtitle: "১ম পত্র", subjectCode: "Bangla 1st Paper", count: "4+", bg: "bg-gradient-to-br from-[#87d853] to-[#71c33a]", letter: "অ", icon: BookOpen },
                { title: "বাংলা", subtitle: "২য় পত্র", subjectCode: "Bangla 2nd Paper", count: "149+", bg: "bg-gradient-to-br from-[#fda63a] to-[#ff8f00]", letter: "ব", icon: PenTool },
                { title: "ইংরেজি", subtitle: "১ম পত্র", subjectCode: "English 1st Paper", count: "3+", bg: "bg-gradient-to-br from-[#ff6b6b] to-[#fa5252]", letter: "A", icon: Languages },
                { title: "ইংরেজি", subtitle: "২য় পত্র", subjectCode: "English 2nd Paper", count: "149+", bg: "bg-gradient-to-br from-[#4ea5ff] to-[#3a8eed]", letter: "a", icon: BookOpen }, 
                { title: "একাউন্টিং", subtitle: "১ম পত্র", subjectCode: "Accounting 1st Paper", count: "3+", bg: "bg-gradient-to-br from-[#2ccfb6] to-[#1bb59e]", letter: "এ", icon: TrendingUp },
                { title: "একাউন্টিং", subtitle: "২য় পত্র", subjectCode: "Accounting 2nd Paper", count: "3+", bg: "bg-gradient-to-br from-[#a671ff] to-[#8d54ea]", letter: "অ", icon: Calculator },
                { title: "ICT", subtitle: "", subjectCode: "ICT", count: "20+", bg: "bg-gradient-to-br from-[#0891b2] to-[#0e7490]", letter: "I", icon: Monitor },
              ].map((subject, idx) => (
                 <button 
                    key={idx} 
                    onClick={() => {
                      navigate(`/format?subject=${encodeURIComponent(subject.subjectCode)}&classGroup=HSC`);
                    }}
                    className={`${subject.bg} relative overflow-hidden rounded-[20px] p-4 sm:p-5 text-white flex flex-col justify-between aspect-[1.3/1] shadow-sm hover:shadow-md transition-all active:scale-95 text-left`}
                 >
                   {/* Faded Letter Background */}
                   <span className="absolute -bottom-4 -right-1 text-[80px] sm:text-[90px] font-bengali font-black opacity-[0.15] leading-none pointer-events-none select-none">
                     {subject.letter}
                   </span>
                   
                   <div className="flex justify-between items-start relative z-10 w-full">
                     <div className="flex flex-col">
                       <span className="font-bengali font-extrabold text-[19px] sm:text-[21px] leading-tight drop-shadow-sm">{subject.title}</span>
                       <span className="font-bengali font-medium text-[13px] sm:text-[14px] opacity-90">{subject.subtitle}</span>
                     </div>
                     <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-card/95 flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                       <subject.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${subject.title === 'বাংলা' && subject.subtitle === '১ম পত্র' ? 'text-[#71c33a]' : subject.title === 'বাংলা' && subject.subtitle === '২য় পত্র' ? 'text-[#ff8f00]' : subject.title === 'ইংরেজি' && subject.subtitle === '১ম পত্র' ? 'text-[#fa5252]' : subject.title === 'ইংরেজি' && subject.subtitle === '২য় পত্র' ? 'text-[#3a8eed]' : subject.title === 'একাউন্টিং' && subject.subtitle === '১ম পত্র' ? 'text-[#1bb59e]' : subject.title === 'একাউন্টিং' && subject.subtitle === '২য় পত্র' ? 'text-[#8d54ea]' : 'text-[#0891b2]'}`} strokeWidth={2.5} />
                     </div>
                   </div>
                   
                   <div className="mt-auto relative z-10">
                     <div className="bg-card text-foreground text-[12px] sm:text-[13px] font-bold px-3 py-1 rounded-md inline-flex items-center gap-1.5 shadow-sm">
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                       {subject.count}
                     </div>
                   </div>
                 </button>
              ))}
            </div>
          </div>
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
    const getNormalizedKey = (key: any) => {
      if (!key) return "";
      const k = String(key).trim().toUpperCase();
      if (k === 'A' || k === 'ক') return 'A';
      if (k === 'B' || k === 'খ') return 'B';
      if (k === 'C' || k === 'গ') return 'C';
      if (k === 'D' || k === 'ঘ') return 'D';
      return k;
    };
    
    const isCorrect = getNormalizedKey(optionKey) === getNormalizedKey(correctOption);
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

  const is9To12Render = activeClassGroup === "Class 9" || activeClassGroup === "SSC" || activeClassGroup === "HSC";
  if (is9To12Render && activeSubTab === "topics") {
    return (
      <>
        {renderTopicsView9To12()}
        {renderBottomNav()}
      </>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 relative min-h-[80vh] flex flex-col font-sans">
      {/* Dynamic Header modeled after screenshot 3 */}
      <div className="flex items-center justify-between py-4 border-b border-slate-150 mb-5 bg-[#F8FAFC] sticky top-0 z-50">
        <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
          <button 
           onClick={() => {
             if (activeClassGroup === "Admission" && selectedUniversity && activeSubTab === "bank") {
               setSelectedUniversity(null);
             } else {
               navigate("/dashboard");
             }
           }}
           className="w-10 h-10 rounded-full bg-card border border-slate-200/80 shadow-xs flex items-center justify-center hover:bg-muted hover:text-blue-700 hover:border-slate-300 transition-all cursor-pointer text-muted-foreground shrink-0"
           title="ফিরে যান"
          >
           <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-blue-600 font-sans">
              {activeSubTab === "bank" ? "প্রশ্নপত্র • Question Bank" : activeSubTab === "topics" ? "টপিক ভিত্তিক • Topics" : "প্র্যাকটিস • Practice Engine"}
            </span>
            <h2 className="text-[14px] sm:text-[17px] font-bengali font-extrabold text-foreground leading-tight truncate">
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
              className="w-8 h-8 object-contain rounded-full shadow-xs bg-card p-0.5 border" 
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
                <div className="bg-card p-12 text-center rounded-[32px] border border-slate-100 shadow-sm">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-bengali text-sm text-slate-500">এই বিভাগে কোনো প্রশ্নপত্র পাওয়া যায়নি।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {questionsList.filter(p => !p.title || p.title !== 'Subject-wise Questions').map((paper, idx) => (
                    <Link 
                      key={idx}
                      to={`/paperview?title=${encodeURIComponent(paper.title)}&classGroup=${encodeURIComponent(activeClassGroup)}`}
                      className="bg-card p-5 sm:p-6 rounded-[28px] border border-slate-200/70 hover:border-blue-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex items-center justify-between gap-4 group relative overflow-hidden"
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
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-[13px] font-bengali font-semibold">
                          <div className="p-1 rounded-lg bg-muted text-slate-500 border border-slate-100">
                            <BookOpen className="w-3.5 h-3.5" />
                          </div>
                          <span>{paper.questions?.length || 0} টি প্রশ্ন</span>
                        </div>
                      </div>
                      
                      <div className="w-11 h-11 rounded-full bg-muted/80 border border-slate-100 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-md transition-all duration-300">
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
                  <p className="text-sm font-bengali text-muted-foreground max-w-sm leading-relaxed">
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
                  <p className="text-xs font-bengali text-muted-foreground max-w-xs leading-relaxed">
                    আপনার পছন্দের বিষয় নির্বাচন করে বহুনির্বাচনী প্রশ্ন (MCQ) প্র্যাকটিস করুন
                  </p>
                </div>

                {/* Vector / Abstract Illo */}
                <div className="z-10 relative shrink-0">
                  <div className="w-20 h-24 sm:w-28 sm:h-32 relative bg-card/60 backdrop-blur-sm rounded-xl border border-white shadow-[10px_10px_30px_rgba(0,0,0,0.05)] flex items-center justify-center skew-x-[-10deg] rotate-6 transform">
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
                  className="pl-12 pr-14 font-bengali bg-card border-none shadow-[0_2px_15px_rgba(0,0,0,0.04)] rounded-[20px] h-14 text-base placeholder:text-slate-400" 
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
                      bg: "bg-muted", 
                      iconColor: "text-slate-500" 
                    };
                    const IconComp = meta.icon;
                    return (
                      <Link 
                        key={sub} 
                        to={`/paper?title=${encodeURIComponent("Subject-wise Questions")}&subject=${encodeURIComponent(sub)}&classGroup=${encodeURIComponent(activeClassGroup || "")}&university=${encodeURIComponent(activeClass || "")}`}
                        className="bg-card p-4 sm:p-5 rounded-[24px] border border-slate-100/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-200 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all flex items-center justify-between gap-4 group"
                      >
                         <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                           <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] flex items-center justify-center ${meta.bg} ${meta.iconColor} shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                             <IconComp className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.5} />
                           </div>
                           <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                             <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                               <h4 className="font-bengali font-bold text-foreground text-base sm:text-[19px] group-hover:text-[#0F2744] transition-colors truncate mb-1">
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
                <div className="bg-card rounded-[32px] p-6 sm:p-8 border border-slate-200/90 shadow-xs text-center max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
                    <Trophy className="w-8 h-8" />
                  </div>
                  
                  <h3 className="font-bengali font-bold text-foreground text-xl sm:text-2xl mb-2">
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
                <div className="bg-card rounded-[32px] p-6 sm:p-8 border border-slate-200/90 shadow-xs text-center max-w-lg mx-auto space-y-6">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Trophy className="w-11 h-11" />
                    </div>
                    {/* Pulsing visual glow */}
                    <span className="absolute inset-0 w-20 h-20 bg-emerald-400/20 rounded-full animate-ping pointer-events-none" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-bengali font-bold text-foreground text-xl sm:text-2xl">
                      কুইজ সম্পন্ন হয়েছে!
                    </h3>
                    <p className="font-bengali text-sm text-slate-500">আপনার স্কোর নিচে দেওয়া হলো</p>
                  </div>

                  {/* Core scorecard displays */}
                  <div className="bg-muted rounded-2xl p-4 flex justify-around items-center border border-slate-100/80">
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
                      className="flex-1 rounded-2xl border-slate-200 text-muted-foreground text-xs font-bengali font-semibold py-4 h-11 bg-card hover:bg-muted"
                    >
                      কুইজ বন্ধ করুন
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-3xl p-5 border border-slate-150 shadow-xs max-w-lg mx-auto space-y-6">
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
                      <h4 className="font-bengali text-foreground text-base sm:text-lg font-bold leading-normal">
                        {quizQuestions[currentQuizIndex].text}
                      </h4>

                      <div className="flex flex-col gap-2.5">
                        {['A', 'B', 'C', 'D'].map((optionKey) => {
                          const qItem = quizQuestions[currentQuizIndex];
                          const idx = ['A', 'B', 'C', 'D'].indexOf(optionKey);
                          let optionText = qItem[`option${optionKey}`] || qItem[`option_${optionKey.toLowerCase()}`];
                          if (!optionText && qItem.options) {
                            if (Array.isArray(qItem.options)) {
                              const found = qItem.options.find((o: any) => 
                                o.id === optionKey || 
                                o.id === optionKey.toLowerCase() || 
                                (optionKey === 'A' && o.id === 'ক') ||
                                (optionKey === 'B' && o.id === 'খ') ||
                                (optionKey === 'C' && o.id === 'গ') ||
                                (optionKey === 'D' && o.id === 'ঘ')
                              );
                              if (found) optionText = found.label || found.text;
                              else if (qItem.options[idx]) optionText = qItem.options[idx].label || qItem.options[idx].text;
                            } else if (typeof qItem.options === 'object') {
                              optionText = qItem.options[optionKey] || qItem.options[optionKey.toLowerCase()];
                              if (!optionText) {
                                const banglaKeys = ['ক', 'খ', 'গ', 'ঘ'];
                                const bKey = banglaKeys[idx];
                                if (bKey) optionText = qItem.options[bKey];
                              }
                            }
                          }
                          if (!optionText) return null;
                          
                          const isSelected = selectedQuizAnswer === optionKey;
                          const correctAns = qItem.correctOption || qItem.correct_answer || qItem.correctAnswer || qItem.answer;
                          
                          const getNormalizedKey = (k: any) => {
                            if (!k) return "";
                            const s = String(k).trim().toUpperCase();
                            if (s === 'A' || s === 'ক') return 'A';
                            if (s === 'B' || s === 'খ') return 'B';
                            if (s === 'C' || s === 'গ') return 'C';
                            if (s === 'D' || s === 'ঘ') return 'D';
                            return s;
                          };
                          
                          const isCorrectOption = getNormalizedKey(optionKey) === getNormalizedKey(correctAns);
                          
                          let optionStyle = "border-slate-200 bg-muted text-slate-700 hover:bg-slate-100/80 hover:border-slate-300";
                          if (quizAnswered) {
                            if (isCorrectOption) {
                              optionStyle = "border-green-200 bg-green-50 text-green-800 font-semibold shadow-xs shadow-green-100";
                            } else if (isSelected) {
                              optionStyle = "border-rose-200 bg-rose-50 text-rose-800 font-semibold";
                            } else {
                              optionStyle = "border-slate-100 bg-muted/50 text-slate-400 opacity-60";
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
                            <div className="bg-muted border border-slate-100 rounded-2xl p-3.5 text-xs font-bengali text-muted-foreground leading-relaxed">
                              <span className="font-bold text-foreground block mb-1">💡 ব্যাখ্যা:</span>
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
