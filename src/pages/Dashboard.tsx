import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  Target,
  CheckCircle2,
  TrendingUp,
  Trophy,
  ArrowRight,
  BookOpen,
  Atom,
  Calculator,
  MessageCircleQuestion,
  HelpCircle,
  Code2,
  Crown,
  Clock, LayoutList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../lib/AuthContext";
import { useIsPWA } from "../lib/useIsPWA";

function getDailyChallenge(group: string | undefined, isAdmission: boolean) {
  const epoch = new Date('2024-01-01').getTime();
  const now = new Date().getTime();
  let dayIndex = Math.floor((now - epoch) / (1000 * 60 * 60 * 24));
  
  // For admission, speed up syllabus progression by 3x (6 months vs 2 months)
  if (isAdmission) {
     dayIndex = dayIndex * 3;
  }
  
  // Group subjects by group
  const syllabus: Record<string, { subject: string, chapters: number }[]> = {
     "বিজ্ঞান": [
        { subject: "এইচএসসি পদার্থবিজ্ঞান", chapters: 10 },
        { subject: "এইচএসসি রসায়ন", chapters: 10 },
        { subject: "এইচএসসি উচ্চতর গণিত", chapters: 10 },
        { subject: "এইচএসসি জীববিজ্ঞান", chapters: 10 },
     ],
     "মানবিক": [
        { subject: "এইচএসসি ইতিহাস", chapters: 10 },
        { subject: "এইচএসসি পৌরনীতি", chapters: 10 },
        { subject: "এইচএসসি যুক্তিবিদ্যা", chapters: 10 },
        { subject: "এইচএসসি ভূগোল", chapters: 10 },
     ],
     "বাণিজ্য": [
        { subject: "এইচএসসি হিসাববিজ্ঞান", chapters: 10 },
        { subject: "এইচএসসি ব্যবসায় সংগঠন", chapters: 10 },
        { subject: "এইচএসসি ফিন্যান্স", chapters: 10 },
        { subject: "এইচএসসি উৎপাদন ব্যবস্থাপনা", chapters: 10 },
     ]
  };
  
  const userGroup = (group && syllabus[group]) ? group : "বিজ্ঞান";
  const groupSyllabus = syllabus[userGroup];
  
  let totalChapters = 0;
  groupSyllabus.forEach((s: any) => totalChapters += s.chapters);
  
  // Assume to cover in 180 days for regular, 60 days for admission
  const daysPerChapter = isAdmission ? (60 / totalChapters) : (180 / totalChapters);
  
  let currentChapterIndex = Math.floor(dayIndex / daysPerChapter) % totalChapters;
  
  let runningSum = 0;
  for (let s of groupSyllabus) {
     if (currentChapterIndex < runningSum + s.chapters) {
        const chapNum = currentChapterIndex - runningSum + 1;
        return { subject: s.subject, chapterTitle: `অধ্যায় ${chapNum}: মডেল টেস্ট` };
     }
     runningSum += s.chapters;
  }
  
  return { subject: "সাধারণ জ্ঞান", chapterTitle: "অধ্যায় ১: মডেল টেস্ট" };
}

export default function Dashboard() {
  const { userData } = useAuth();
  const isPWA = useIsPWA();
  const [syncingOffline, setSyncingOffline] = useState(false);
  const [publicExams, setPublicExams] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [showPromoPopup, setShowPromoPopup] = useState(false);

  useEffect(() => {
    async function listenSettings() {
      const { doc, onSnapshot } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");
      return onSnapshot(doc(db, "settings", "general"), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setSettings(data);
          
          // Show popup if active, user is not pro, and hasn't dismissed in current session
          const dismissedThisSession = sessionStorage.getItem("dismissedPromoPopup");
          if (data?.popupActive && !userData?.isPro && !dismissedThisSession) {
            setShowPromoPopup(true);
          }
        }
      });
    }
    let unsub: any;
    listenSettings().then(u => unsub = u);
    return () => { if (unsub) unsub(); };
  }, [userData?.isPro]);
  useEffect(() => {
    async function fetchPublicExams() {
      try {
        const { collection, getDocs, limit, query, orderBy, where } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase");
        const q = query(collection(db, "public_exams"), where("active", "==", true), orderBy("createdAt", "desc"), limit(40));
        const snap = await getDocs(q);
        setPublicExams(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) { console.error("ERR", error); }
    }
    fetchPublicExams();
  }, []);


  const quickStats = [
    {
      title: "মোট প্রশ্ন সমাধান",
      value: "০",
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "নির্ভুলতা (Accuracy)",
      value: "০%",
      icon: <Target className="w-5 h-5" />,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      title: "টানা চর্চা (Streak)",
      value: "০ দিন",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      title: "র‍্যাঙ্কিং",
      value: "-",
      icon: <Trophy className="w-5 h-5" />,
      color: "text-secondary",
      bg: "bg-yellow-50",
    },
  ];

  const userClass = userData?.class || "";
  const eligibleExams = publicExams.filter((exam) => {
    if (!exam.targetClass || exam.targetClass === "সকল ক্লাস") {
      return true;
    }
    return exam.targetClass === userClass;
  });

  const liveExams = eligibleExams.filter((exam) => !exam.type || exam.type === "public");
  const liveModelTests = eligibleExams.filter((exam) => exam.type === "live_model_test");

  const cards = [
    {
      title: "নোটস",
      description: "বিষয়ভিত্তিক সাজানো\nগুরুত্বপূর্ণ নোটস",
      link: "/notes",
      bgContent: "bg-[#f4fbf4]",
      borderColor: "border-[#bce5c0]",
      textColor: "text-[#187829]",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#358742]/10 translate-y-3 rounded-[20px] blur-md"></div>
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-[#4db05c] to-[#298a37] rounded-lg flex items-center justify-center shadow-lg border-b-[5px] border-[#1b5e20] before:absolute before:inset-y-[6px] before:inset-x-3 before:bg-white before:rounded-sm before:opacity-95">
            <div className="w-[14px] h-[3px] bg-[#e0e0e0] absolute top-[28px] left-[18px] rounded-full opacity-100"></div>
            <div className="w-[18px] h-[3px] bg-[#e0e0e0] absolute top-[40px] left-[18px] rounded-full opacity-100"></div>
            <div className="w-[14px] h-[3px] bg-[#e0e0e0] absolute top-[52px] left-[18px] rounded-full opacity-100"></div>
            <div className="w-[18px] h-[3px] bg-[#e0e0e0] absolute top-[28px] right-[18px] rounded-full opacity-100"></div>
            <div className="w-[14px] h-[3px] bg-[#e0e0e0] absolute top-[40px] right-[18px] rounded-full opacity-100"></div>
            <div className="w-[18px] h-[3px] bg-[#e0e0e0] absolute top-[52px] right-[18px] rounded-full opacity-100"></div>
            <div className="w-[2px] h-[75%] bg-gradient-to-r from-gray-200 to-gray-300 absolute left-1/2 -translate-x-1/2 z-20 shadow-sm rounded-full"></div>
          </div>
        </div>
      ),
    },
    {
      title: "প্রশ্ন ব্যাংক",
      description: "হাজারো প্রশ্ন\nঅনুশীলন করুন",
      link: "/bank",
      bgContent: "bg-[#f5f8ff]",
      borderColor: "border-[#c4d4f8]",
      textColor: "text-[#1b4db3]",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1b4db3]/10 translate-y-3 rounded-[20px] blur-md"></div>
          <div className="relative z-10 w-16 h-20 bg-gradient-to-br from-[#3b7cf6] to-[#1244ac] rounded-[10px] shadow-lg border-b-[5px] border-[#0c2d73] flex flex-col items-center">
            <div className="w-[30px] h-[10px] bg-[#f0f4ff] rounded-b-md mb-2 shadow-sm relative z-20 border-b border-[#c4d4f8]"></div>
            <div className="w-[30px] h-[3px] bg-white/70 rounded-full mb-2 flex items-center justify-start">
              <div className="w-[6px] h-[6px] bg-[#0c2d73] rounded-full absolute -left-3 border-2 border-white"></div>
            </div>
            <div className="w-[30px] h-[3px] bg-white/70 rounded-full mb-2 flex items-center justify-start">
              <div className="w-[6px] h-[6px] bg-[#0c2d73] rounded-full absolute -left-3 border-2 border-white"></div>
            </div>
            <div className="w-[30px] h-[3px] bg-white/70 rounded-full mb-2 flex items-center justify-start">
              <div className="w-[6px] h-[6px] bg-[#0c2d73] rounded-full absolute -left-3 border-2 border-white"></div>
            </div>
            <div className="absolute -bottom-2 -right-3 w-10 h-10 bg-[#3b7cf6] border-[3px] border-white rounded-full flex items-center justify-center shadow-md">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "মক টেস্ট",
      description: "অধ্যায়ভিত্তিক\nমক টেস্ট দিন",
      link: "/exam?type=mock",
      bgContent: "bg-[#fdf4ff]",
      borderColor: "border-[#f0abfc]",
      textColor: "text-[#c026d3]",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#c026d3]/20 translate-y-3 rounded-[24px] blur-md"></div>
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-[#e879f9] to-[#c026d3] rounded-[20px] shadow-lg border-b-[5px] border-[#86198f] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <div className="absolute top-2 right-2 w-3 h-3 bg-white/40 rounded-full"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 bg-white/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-[12px] shadow-inner flex flex-col items-center justify-center gap-1.5 p-2">
              <div className="flex w-full items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 shrink-0"></div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full"></div>
              </div>
              <div className="flex w-full items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-purple-500 bg-purple-100 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "মডেল টেস্ট",
      description: "মডেল টেস্ট দিয়ে\nপ্রস্তুতি যাচাই করুন",
      link: "/exam?type=model",
      bgContent: "bg-[#fff8f0]",
      borderColor: "border-[#fce3c7]",
      textColor: "text-[#e86a10]",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#e86a10]/20 translate-y-3 rounded-[24px] blur-md"></div>
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-[#ffa726] to-[#e65100] rounded-[20px] shadow-lg border-b-[5px] border-[#bf360c] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <div className="absolute top-2 right-2 w-3 h-3 bg-white/40 rounded-full"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 bg-white/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-[12px] shadow-inner flex shrink-0 items-center justify-center overflow-hidden">
              <div className="w-full flex flex-col gap-1.5 p-2 px-3">
                <div className="flex items-center gap-1.5 border-b border-orange-100 pb-1.5">
                  <span className="w-2.5 h-2.5 bg-orange-400 rounded-full flex-shrink-0"></span>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full"></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-slate-200 rounded-full flex-shrink-0"></span>
                  <div className="h-1.5 w-8 bg-slate-200 rounded-full"></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-slate-200 rounded-full flex-shrink-0"></span>
                  <div className="h-1.5 w-6 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-[#ffb74d] to-[#ef6c00] rounded-full border-4 border-white shadow-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "মেমোরাইজিং পার্ট",
      description: "সমার্থক, বিপরীত ও\nশব্দকোষ চর্চা করুন",
      link: "/memorize",
      bgContent: "bg-[#f5f3ff]",
      borderColor: "border-[#ddd6fe]",
      textColor: "text-[#8b5cf6]",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#8b5cf6]/20 translate-y-3 rounded-[24px] blur-md"></div>
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] rounded-[20px] shadow-lg border-b-[5px] border-[#5b21b6] flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-300">
             <div className="absolute top-2 right-2 w-3 h-3 bg-white/40 rounded-full"></div>
             <div className="absolute bottom-3 left-3 w-4 h-4 bg-white/20 rounded-full"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-[12px] shadow-inner flex shrink-0 items-center justify-center overflow-hidden font-sans text-3xl">
                🧠
             </div>
             <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-[#c4b5fd] to-[#8b5cf6] rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-white" />
             </div>
          </div>
        </div>
      ),
    },
    {
      title: "ভুলের প্র্যাকটিস",
      description: "পুর্বে ভুল হওয়া\nপ্রশ্নগুলোর পুনরাবৃত্তি",
      link: "/exam?type=mistakes",
      bgContent: "bg-[#fff1f2]",
      borderColor: "border-[#fecdd3]",
      textColor: "text-[#e11d48]",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#e11d48]/20 translate-y-3 rounded-[24px] blur-md"></div>
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-[#fb7185] to-[#e11d48] rounded-[20px] shadow-lg border-b-[5px] border-[#9f1239] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <div className="absolute top-2 right-2 w-3 h-3 bg-white/40 rounded-full"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 bg-white/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-[12px] shadow-inner flex items-center justify-center">
              <span className="text-3xl">🔄</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "ডাউট সলভিং",
      description: "যেকোনো প্রশ্নের উত্তর জানুন\nএবং আলোচনা করুন",
      link: "/doubts",
      bgContent: "bg-[#f0fdff]",
      borderColor: "border-[#bbf7d0]",
      textColor: "text-[#0ea5e9]",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#0ea5e9]/20 translate-y-3 rounded-[24px] blur-md"></div>
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-[#38bdf8] to-[#0284c7] rounded-[20px] shadow-lg border-b-[5px] border-[#0369a1] flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-300">
             <div className="absolute top-2 right-2 w-3 h-3 bg-white/40 rounded-full"></div>
             <div className="absolute bottom-3 left-3 w-4 h-4 bg-white/20 rounded-full"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-[12px] shadow-inner flex shrink-0 items-center justify-center overflow-hidden">
                <BrainCircuit className="w-8 h-8 text-[#0284c7]" />
             </div>
             <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-[#7dd3fc] to-[#0284c7] rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                <MessageCircleQuestion className="w-5 h-5 text-white" />
             </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-8 pb-10 mt-1 md:mt-4">
      {/* Pro Banner for Non-Pro Users */}
      {!userData?.isPro && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#fff4e6] to-[#ffecb3] border border-[#ffd54f] p-5 sm:p-6 rounded-[24px] shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <Crown className="w-6 h-6 text-[#ffa726]" />
            </div>
            <div>
              <h3 className="font-bengali font-bold text-slate-800 text-lg sm:text-xl">
                প্রো মেম্বারশিপে আপগ্রেড করুন!
              </h3>
              <p className="font-bengali text-slate-700 text-sm sm:text-base mt-1">
                সব প্রশ্নের বিস্তারিত ব্যাখ্যা ও আনলিমিটেড (Unlimited) মক টেস্ট
                দিতে আজই প্রো মেম্বার হোন।
              </p>
            </div>
          </div>
          <Link
            to="/subscription"
            className="w-full sm:w-auto shrink-0 mt-2 sm:mt-0"
          >
            <Button className="w-full bg-gradient-to-r from-[#ffa726] to-[#e65100] hover:from-[#f57c00] hover:to-[#d84315] text-white rounded-full font-bengali font-bold shadow-md shadow-orange-500/20 px-6 h-12">
              আপগ্রেড করুন
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Main Feature Cards */}
      <section className="flex overflow-x-auto lg:grid lg:grid-cols-3 xl:grid-cols-5 md:grid-cols-2 gap-5 md:gap-8 snap-x pb-6 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
            className="w-[85vw] max-w-[320px] md:w-auto md:max-w-none md:min-w-0 snap-center shrink-0"
          >
            <Link to={card.link} className="block h-full group">
              <div
                className={`h-full ${card.bgContent} border-[2px] ${card.borderColor} rounded-[32px] p-8 pb-10 flex flex-col items-center text-center transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] relative overflow-hidden`}
              >
                {/* 3D Icon Container */}
                <div className="mb-6 z-10 transition-transform duration-500 group-hover:scale-105">
                  {card.icon}
                </div>

                <h3
                  className={`text-[32px] font-bengali font-bold mb-4 ${card.textColor} tracking-wide z-10`}
                >
                  {card.title}
                </h3>

                <div className="w-full h-[1px] bg-black/5 rounded-full mb-5 z-10"></div>

                <p className="text-[17px] font-bengali font-medium text-[#4b5563] whitespace-pre-line leading-[1.7] z-10 tracking-wide">
                  {card.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Live Public Exams Banner */}
      {liveExams && liveExams.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-2xl font-bengali font-bold text-slate-900 flex items-center gap-2">
               <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
               চলমান লাইভ এক্সাম (পাবলিক এক্সাম)
             </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveExams.map((exam) => (
              <Link to={`/public-exam/${exam.id}`} key={exam.id}>
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-3xl border border-indigo-100/50 shadow-sm relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full -translate-y-8 translate-x-8 blur-xl"></div>
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span> লাইভ
                      </span>
                      {exam.targetClass && (
                        <span className="px-2.5 py-1 rounded-full bg-indigo-150/50 border border-indigo-200/40 text-indigo-700 text-[10px] font-bold font-bengali">
                          {exam.targetClass}
                        </span>
                      )}
                    </div>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-500">
                      <Trophy className="w-5 h-5" />
                    </div>
                  </div>
                  <h4 className="font-bengali font-bold text-lg text-slate-800 mb-1 relative z-10 leading-snug">{exam.title}</h4>
                  <div className="flex items-center gap-3 text-slate-500 text-sm font-medium mt-3 relative z-10">
                     <span className="flex items-center gap-1 opacity-80"><Clock className="w-4 h-4"/> {exam.duration} মিনিট</span>
                     <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                     <span className="flex items-center gap-1 opacity-80"><LayoutList className="w-4 h-4"/> {exam.questions ? exam.questions.length : 0} প্রশ্ন</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div
              className={`w-10 h-10 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 font-mono mb-0.5">
                {stat.value}
              </p>
              <p className="text-xs font-bengali font-medium text-slate-500">
                {stat.title}
              </p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Offline Sync Banner - Only show in PWA */}
      {isPWA && (
        <section>
          <motion.div
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.4, delay: 0.3 }}
             className="bg-[#f0f9ff] border border-[rgba(14,165,233,0.3)] p-5 sm:p-6 rounded-[24px] shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between"
          >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white flex items-center justify-center rounded-full text-blue-500 shadow-sm shrink-0">
                  <BookOpen className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="font-bengali font-bold text-slate-800 text-lg">
                     অফলাইন মোড
                  </h3>
                  <p className="font-bengali text-slate-600 text-sm mt-1">
                     ইন্টারনেট সংযোগ ছাড়াই প্রশ্ন ব্যাংক, মক টেস্ট এবং নোটস অ্যাক্সেস করতে ডেটা সেভ করে রাখুন।
                  </p>
               </div>
            </div>
            <Button 
              onClick={async () => {
                if (syncingOffline) return;
                setSyncingOffline(true);
                try {
                  const { collection, getDocs, limit, query } = await import("firebase/firestore");
                  const { db } = await import("../lib/firebase");
                  // Fetch basic data to cache for offline use (server-first to guarantee latest)
                  await getDocs(query(collection(db, "questions"), limit(200)));
                  await getDocs(query(collection(db, "public_exams"), limit(20)));
                  alert("অফলাইন ব্যবহারের জন্য সব ডেটা সেভ করা হয়েছে!");
                } catch(e: any) {
                  console.error("Offline sync failed", e);
                  alert("ডাউনলোড করতে সমস্যা হয়েছে: " + (e.message || "Unknown error"));
                } finally {
                  setSyncingOffline(false);
                }
              }}
              variant="outline"
              disabled={syncingOffline}
              className="w-full sm:w-auto shrink-0 mt-2 sm:mt-0 font-bengali border-blue-500 text-blue-600 hover:bg-blue-50 bg-white"
            >
               {syncingOffline ? "সেভ হচ্ছে..." : "ডেটা সেভ করুন"}
            </Button>
          </motion.div>
        </section>
      )}

      {/* Live Model Test */}
      {liveModelTests && liveModelTests.length > 0 && (
        <section className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-5 sm:p-6 my-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold font-bengali text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#f59e0b] rounded-full"></span>
              লাইভ মডেল টেস্ট
            </h2>
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">MODEL TEST LIVE</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveModelTests.map((exam, idx) => (
               <motion.div 
                 key={exam.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.3, delay: idx * 0.1 }}
               >
                 <Link to={`/public-exam/${exam.id}`}>
                   <div className="bg-slate-50 hover:bg-slate-100 hover:shadow-md transition-all rounded-[20px] p-4 sm:p-5 border border-slate-100 flex justify-between items-center group h-full">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-slate-800 text-[15px] sm:text-[16px] leading-snug group-hover:text-primary transition-colors font-bengali">{exam.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-[12px] sm:text-xs text-slate-500 mt-2.5 font-medium font-bengali">
                          <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200"><Clock className="w-3.5 h-3.5 text-orange-500" /> {exam.duration} মি.</span>
                          <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200"><HelpCircle className="w-3.5 h-3.5 text-blue-500" /> {exam.questions?.length || 0} টি প্রশ্ন</span>
                          {exam.targetClass && (
                            <span className="flex items-center gap-1.5 bg-indigo-50/70 border border-indigo-150 px-2.5 py-1 rounded-md text-indigo-700 font-bold">{exam.targetClass}</span>
                          )}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-primary group-hover:border-primary transition-all">
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:-rotate-45 transition-all" />
                      </div>
                   </div>
                 </Link>
               </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* AI Assistant Banner */}
      <section>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-primary to-[#18398a] rounded-[32px] p-6 md:p-8 shadow-lg shadow-primary/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

          <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
              <BrainCircuit className="w-8 h-8 text-secondary" />
            </div>
            <div>
              <div className="bg-white text-slate-800 text-base font-bengali font-bold py-2 px-5 rounded-2xl rounded-tl-sm shadow-md inline-block">
                আজ কী শিখতে চাও?
              </div>
              <p className="text-white/80 font-bengali text-sm mt-1.5 ml-1">
                AI টিউটরের সাহায্যে তোমার পড়া আরও সহজ করো
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-start w-full md:w-auto gap-3 relative z-10 shrink-0">
            <Link to="/tutor" className="flex-auto md:flex-none max-w-full">
              <Button
                size="lg"
                variant="secondary"
                className="w-full font-bengali bg-white text-primary hover:bg-slate-50 rounded-xl shadow-sm border-0 font-bold px-4 sm:px-6 whitespace-nowrap"
              >
                <HelpCircle className="w-4 h-4 mr-2 shrink-0" /> <span className="truncate">AI টিউটর</span>
              </Button>
            </Link>
            <Link to="/doubts" className="flex-auto md:flex-none max-w-full">
              <Button
                size="lg"
                className="w-full font-bengali bg-secondary hover:bg-secondary/90 text-primary rounded-xl shadow-sm font-bold px-4 sm:px-6 whitespace-nowrap"
              >
                <MessageCircleQuestion className="w-4 h-4 mr-2 shrink-0" /> <span className="truncate">শিক্ষককে প্রশ্ন করো</span>
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Bottom Main Content */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Challenge */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[220px] relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-yellow-50 to-transparent pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 h-full">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider mb-3">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>{" "}
                Daily Challenge
              </div>
              <h3 className="text-2xl font-bengali font-bold text-slate-900 mb-2 leading-tight">
                {(() => {
                  const challenge = getDailyChallenge(userData?.group, userData?.class === "এডমিশন");
                  return (
                     <>
                        {challenge.subject} <br />
                        {challenge.chapterTitle}
                     </>
                  );
                })()}
              </h3>
              <p className="font-bengali text-slate-500 text-sm mb-6 max-w-sm">
                ২৫টি গুরুত্বপূর্ণ বহুনির্বাচনি প্রশ্ন। সময়: ২০ মিনিট। নিজেকে
                যাচাই করো এখনই!
              </p>

              <Link to="/exam">
                <Button className="bg-primary hover:bg-primary/95 text-white font-bengali rounded-full px-6 h-11 shadow-md hover:shadow-lg transition-all active:scale-95">
                  শুরু করুন <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="hidden md:flex shrink-0 w-40 h-40 bg-white rounded-full border-[6px] border-slate-50 shadow-inner items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-secondary/30 animate-[spin_20s_linear_infinite]"></div>
              <Target className="w-16 h-16 text-secondary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Leaderboard Snippet */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bengali font-bold text-lg text-slate-800">
              শীর্ষ শিক্ষার্থী (আজ)
            </h3>
            <Link
              to="/leaderboard"
              className="text-xs text-primary font-bold hover:underline"
            >
              সব দেখুন
            </Link>
          </div>

          <div className="space-y-4 flex-1 flex flex-col items-center justify-center text-center text-slate-500">
            <p className="font-bengali text-sm bg-slate-50 p-4 rounded-xl w-full">
              আরও শিক্ষার্থী যোগ দিলে লিডারবোর্ড চালু হবে।
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic Campaign Startup Pop-up Modal */}
      <AnimatePresence>
        {showPromoPopup && settings && (
          <div className="fixed inset-0 bg-[#070E1B]/75 backdrop-blur-md z-9999 flex items-center justify-center p-4 font-sans text-left">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white border-none w-full max-w-md rounded-[36px] overflow-hidden shadow-2xl relative flex flex-col font-bengali"
            >
              {/* Premium Gradient Hero section */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-red-500 p-8 text-center text-white relative">
                <button
                  onClick={() => {
                    setShowPromoPopup(false);
                    sessionStorage.setItem("dismissedPromoPopup", "true");
                  }}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white transition-colors cursor-pointer border-none outline-none text-xs"
                >
                  ✕
                </button>
                <span className="text-5xl mb-3 block animate-bounce">🎁</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {settings.popupTitle || "উৎসব স্পেশাল ক্যাম্পেইন অফার! 🌟"}
                </h2>
                <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-xs mx-auto leading-relaxed">
                  সাবস্ক্রাইব করে আজই খুলে ফেলুন প্রিমিয়াম মেম্বারশিপের সকল দরজা!
                </p>
              </div>

              {/* Promo code area & features */}
              <div className="p-6 sm:p-8 space-y-6 flex flex-col">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5 text-center">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest font-sans">ACTIVE DISCOUNT COUPON</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono bg-orange-100 text-orange-900 px-4 py-1.5 rounded-xl text-lg sm:text-xl font-bold tracking-wider select-text border border-orange-200">
                      {settings.popupCoupon || "PRO20"}
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(settings.popupCoupon || "PRO20");
                        alert("কুপন কোডটি কপি করা হয়েছে! 🏷️");
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer border-none"
                    >
                      কপি করুন
                    </button>
                  </div>
                  {settings.discountPercentage > 0 && (
                    <p className="text-xs text-red-500 font-bold shrink-0">
                      🏷️ এই কোড ব্যবহারে {settings.discountPercentage}% অতিরিক্ত ছাড় কার্যকর!
                    </p>
                  )}
                </div>

                <div className="space-y-3.5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans text-left">👑 প্রো ইউজারদের স্পেশাল বেনিফিটস:</p>
                  <ul className="space-y-2.5 text-slate-600 text-xs sm:text-sm font-medium text-left">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 shrink-0 select-none">✔</span>
                      <span>১০,০০০+ প্রশ্নের বিস্তারিত ব্যাখ্যা ও কুইজ সমাধান।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 shrink-0 select-none">✔</span>
                      <span>সকল অধ্যায়ভিত্তিক ও সাজেশন্স ভিত্তিক স্পেশাল মক টেস্ট।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 shrink-0 select-none">✔</span>
                      <span>ভুল উত্তরের প্র্যাকটিস এবং প্রফেশনাল মেজারমেন্ট গ্রাফ।</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-100 text-amber-900 text-xs leading-relaxed font-semibold text-center">
                  {settings.popupMessage || "সকল প্রো প্ল্যানে বিশেষ অফার সক্রিয় পেতে আজই আমাদের সাথে যুক্ত হয়ে যান।"}
                </div>

                {/* Subscriptions navigation trigger */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPromoPopup(false);
                      sessionStorage.setItem("dismissedPromoPopup", "true");
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 h-12 rounded-full font-bold transition-all text-xs cursor-pointer border-none"
                  >
                    পরে দেখব
                  </button>
                  <Link to="/subscription" className="flex-1" onClick={() => {
                    setShowPromoPopup(false);
                    sessionStorage.setItem("dismissedPromoPopup", "true");
                  }}>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white h-12 rounded-full font-bold shadow-md shadow-orange-500/25 border-none text-xs">
                      {settings.popupButtonText || "প্রো মেম্বার হোন"}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
