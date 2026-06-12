import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Lightbulb, Clock, Target, AlertCircle, PlayCircle, ArrowLeft, BookOpen, Atom, Calculator, Users, Laptop, Lock, FileText, Timer, Brain, ChevronRight, Landmark, TestTube, Dna, TrendingUp, Factory, Globe, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../lib/AuthContext";
import { useIsPWA } from "../lib/useIsPWA";

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
  ],
  "বিজ্ঞান": [
    { name: "পদার্থবিজ্ঞান", icon: <Atom className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-purple-50 hover:border-purple-200" },
    { name: "রসায়ন", icon: <TestTube className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-pink-50 hover:border-pink-200" },
    { name: "উচ্চতর গণিত", icon: <span className="text-[18px] font-bold">π</span>, color: "bg-orange-50 hover:border-orange-200" },
    { name: "জীববিজ্ঞান", icon: <Dna className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-green-50 hover:border-green-200" },
  ],
  "ব্যবসায় শিক্ষা": [
    { name: "হিসাববিজ্ঞান", icon: <Calculator className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-blue-50 hover:border-blue-200" },
    { name: "ব্যবসায় সংগঠন", icon: <Users className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-emerald-50 hover:border-emerald-200" },
    { name: "ফিন্যান্স", icon: <TrendingUp className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-rose-50 hover:border-rose-200" },
    { name: "উৎপাদন ব্যবস্থাপনা", icon: <Factory className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-yellow-50 hover:border-yellow-200" },
  ],
  "মানবিক": [
    { name: "ইতিহাস", icon: <Landmark className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-amber-50 hover:border-amber-200" },
    { name: "ভূগোল", icon: <Globe className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-cyan-50 hover:border-cyan-200" },
    { name: "অর্থনীতি", icon: <TrendingUp className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-fuchsia-50 hover:border-fuchsia-200" },
    { name: "পৌরনীতি", icon: <Building2 className="w-[22px] h-[22px]" strokeWidth={2} />, color: "bg-slate-50 hover:border-slate-300" },
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
  const { userData } = useAuth();
  const isPWA = useIsPWA();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'model';
  const sets = type === 'mock' ? mockSets : modelSets;
  const pageTitle = type === 'mock' ? 'মক টেস্ট অনুশীলন' : type === 'mistakes' ? 'ভুলগুলোর প্র্যাকটিস' : 'মডেল টেস্ট অনুশীলন';
  const pageDesc = type === 'mock' 
    ? 'অধ্যায়ভিত্তিক মক টেস্ট দিয়ে তোমার প্রস্তুতি যাচাই করো।' 
    : type === 'mistakes' ? 'আগের ভুল হওয়া প্রশ্নগুলো পুনরায় অনুশীলন করে নিজের দুর্বলতাগুলো কাটিয়ে ওঠো।' : 'নিচের মডেল টেস্টগুলো থেকে যে কোনো একটি বেছে নিয়ে পূর্ণাঙ্গ প্রস্তুতি যাচাই করো।';

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [activeSet, setActiveSet] = useState<string | null>(null);
  
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [dbQuestions, setDbQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

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
      // Fetch all questions to cache them for offline use
      await getDocs(collection(db, "questions"));
      alert("অফলাইন ব্যবহারের জন্য সকল প্রশ্ন ডাউনলোড করা হয়েছে! এখন ইন্টারনেট ছাড়াও মডেল টেস্ট দিতে পারবেন।");
    } catch(e) {
      console.error("Offline sync failed", e);
      alert("ডাউনলোড করতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ চেক করুন।");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const loadQuestions = async () => {
      if ((type === 'mock' && activeSet && selectedSubject) || (type === 'model' && activeSet) || (type === 'mistakes' && activeSet)) {
        setIsLoading(true);
        try {
          const { collection, getDocs, query, where } = await import("firebase/firestore");
          const { db } = await import("../lib/firebase");
          
          let allQs: any[] = [];
          
          if (type === 'mistakes' && userData?.uid) {
             const mistakeSnap = await getDocs(collection(db, "users", userData.uid, "mistakes"));
             allQs = mistakeSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
          } else {
             let qBase = collection(db, "questions");
             let qQuery: any = qBase;
             if (type === 'mock' && selectedSubject !== "সকল বিষয়") {
               qQuery = query(qBase, where("subject", "==", selectedSubject));
             }
             const snap = await getDocs(qQuery);
             allQs = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
          }
          
          let finalQs = allQs;
          if (type !== 'mistakes') {
            finalQs = allQs.sort(() => Math.random() - 0.5);
          } else {
            finalQs = allQs.sort((a, b) => {
               const idA = a.id || "";
               const idB = b.id || "";
               return idA.localeCompare(idB, undefined, {numeric: true, sensitivity: 'base'});
            });
          }
          
          let numQuestions = 10;
          if (type === 'mock' || type === 'mistakes') {
             const counts = activeSet.split('-');
             if (counts.length === 2 && !isNaN(parseInt(counts[1]))) {
                numQuestions = parseInt(counts[1]);
             }
          } else {
             const setList = modelSets;
             const setInfo = setList.find(s => s.id === activeSet);
             numQuestions = setInfo ? setInfo.totalQuestions : 50;
          }
          
          const selectedQs = finalQs.slice(0, numQuestions);
          
          setDbQuestions(selectedQs.map((q: any, idx) => ({
             id: q.id,
             questionNumber: (idx + 1).toString(),
             text: q.text,
             options: q.options || [],
             correctOption: q.correctOption,
             explanation: q.explanation || ""
          })));

        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    if (activeSet) {
       loadQuestions();
    }
  }, [type, activeSet, selectedSubject]);

  const userGroup = userData?.group || "বিজ্ঞান";
  const displaySubjects = [
    ...subjectsByGroup["common"], 
    ...(subjectsByGroup[userGroup] || subjectsByGroup["বিজ্ঞান"])
  ];
  
  const handleSelect = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setSelectedOptions(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    let currentScore = 0;
    dbQuestions.forEach(q => {
      if (selectedOptions[q.id] === q.correctOption) {
        currentScore += 10; // 10 points per correct answer
      }
    });
    setScore(currentScore);
    setIsSubmitted(true);

    if (userData?.uid) {
      try {
        const { doc, updateDoc, increment, writeBatch } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase");
        
        // Update user stats
        const userRef = doc(db, "users", userData.uid);
        await updateDoc(userRef, {
          points: increment(currentScore),
          totalExams: increment(1)
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
        const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
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

  // Timer effect
  useEffect(() => {
    if (activeSet && remainingTime !== null && remainingTime > 0 && !isSubmitted) {
      const timerId = setInterval(() => {
        setRemainingTime(prev => prev! - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (remainingTime === 0 && !isSubmitted) {
       setIsSubmitted(true);
    }
  }, [activeSet, remainingTime, isSubmitted]);

  // Handle active set timer
  useEffect(() => {
      if(activeSet) {
          if (type === 'mock') {
              const counts = activeSet.split('-');
              if (counts.length === 2 && !isNaN(parseInt(counts[1]))) {
                  const numQ = parseInt(counts[1]);
                  setRemainingTime(numQ * 60); // 1 minute per question
              }
          } else {
              const setInfo = sets.find(s => s.id === activeSet);
              if(setInfo) {
                  setRemainingTime(setInfo.timeMinutes * 60);
              }
          }
      } else {
          setRemainingTime(null);
      }
  }, [activeSet, sets, type]);

  const formatTime = (timeInSeconds: number | null) => {
      if(timeInSeconds === null) return "00:00";
      const m = Math.floor(timeInSeconds / 60);
      const s = timeInSeconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timeLeft = formatTime(remainingTime);

  // Screen 1: Subject Selection (for Mock Test only)
  if (type === 'mock' && !selectedSubject && !activeSet) {
    return (
      <div className="w-full max-w-[500px] mx-auto pb-32 sm:max-w-2xl lg:max-w-4xl px-4 sm:px-6 pt-6 font-bengali">
         
         {/* Hero Banner Section */}
         <div className="bg-[#F4F7FB] rounded-[20px] py-4 px-5 sm:px-6 sm:py-5 relative overflow-hidden mb-6 min-h-[110px] flex items-center">
            <div className="relative z-10 w-[65%] sm:w-[70%]">
              <h1 className="text-[22px] sm:text-[28px] font-bold text-[#0F2744] leading-normal mb-1">
                মক টেস্ট<span className="hidden sm:inline"><br/></span> <span className="sm:inline">অনুশীলন</span>
              </h1>
              <p className="text-[#64748B] text-[12px] sm:text-[14px] leading-snug mt-1">
                নিজেকে যাচাই করো অধ্যায়ভিত্তিক মক টেস্ট দিয়ে
              </p>
            </div>
            
            {/* SVG Illustration */}
            <div className="absolute -right-4 -top-2 sm:top-1 w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] sm:right-2 opacity-90 sm:opacity-100 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="70" cy="75" r="45" fill="#E8F0FE"/>
                
                {/* Decorative sparks */}
                <path d="M 35 45 L 30 35" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                <path d="M 45 30 L 35 25" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                <path d="M 55 20 L 50 10" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>

                <rect x="50" y="40" width="40" height="55" rx="4" fill="white" stroke="#0F2744" strokeWidth="2.5"/>
                <rect x="58" y="35" width="24" height="10" rx="3" fill="#0F2744"/>
                <rect x="62" y="33" width="16" height="3" rx="1.5" fill="white"/>
                
                <text x="70" y="55" fill="#0F2744" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">EXAM</text>
                
                <rect x="56" y="63" width="4" height="4" rx="1" stroke="#0F2744" strokeWidth="1.5"/>
                <line x1="64" y1="65" x2="76" y2="65" stroke="#0F2744" strokeWidth="1.5" strokeLinecap="round"/>
                
                <rect x="56" y="73" width="4" height="4" rx="1" stroke="#0F2744" strokeWidth="1.5"/>
                <line x1="64" y1="75" x2="76" y2="75" stroke="#0F2744" strokeWidth="1.5" strokeLinecap="round"/>
                
                <rect x="56" y="83" width="4" height="4" rx="1" stroke="#0F2744" strokeWidth="1.5"/>
                <line x1="64" y1="85" x2="72" y2="85" stroke="#0F2744" strokeWidth="1.5" strokeLinecap="round"/>

                <path d="M 55.5 64.5 L 57.5 66.5 L 61 62" stroke="#0F2744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                
                {/* Pencil */}
                <g transform="translate(80, 56) rotate(-35) scale(0.9)">
                  <path d="M 12 0 L 24 0 L 18 -18 Z" fill="#FACC15" stroke="#0F2744" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M 18 -18 L 16 -12 L 20 -12 Z" fill="#0F2744"/>
                  <rect x="12" y="0" width="12" height="28" fill="#FACC15" stroke="#0F2744" strokeWidth="2"/>
                  <rect x="12" y="28" width="12" height="6" fill="#F97316" stroke="#0F2744" strokeWidth="2"/>
                </g>
              </svg>
            </div>
         </div>

         {/* Heading */}
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-[20px] font-bold text-[#0F2744] flex flex-col relative">
               বিষয়ভিত্তিক
               <div className="w-10 h-[3px] bg-amber-400 mt-1 rounded-full"></div>
            </h2>
            <Button variant="ghost" className="text-slate-500 text-sm hover:text-slate-800 bg-white border border-slate-100 px-3 py-1.5 h-auto rounded-full font-medium">
               সব দেখুন &gt;
            </Button>
         </div>

         {/* Subjects Grid */}
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-20">
            {displaySubjects.slice(0, 8).map((subject, idx) => {
              // Extract colors from typical tailwind classes
              let iconBg = subject.color.split(' ')[0] || "bg-slate-50"; 
              let iconColor = subject.color.split(' ')[1] || "text-slate-500";
              
              // For custom styling resembling the design
              if (subject.name.includes("বাংলা")) { iconBg = "bg-rose-50"; iconColor = "text-rose-500"; }
              if (subject.name.includes("English") || subject.name.includes("ইংরেজি")) { iconBg = "bg-violet-50"; iconColor = "text-violet-500"; }
              if (subject.name.includes("তথ্য")) { iconBg = "bg-blue-50"; iconColor = "text-blue-500"; }
              if (subject.name.includes("হিসাববিজ্ঞান")) { iconBg = "bg-blue-50"; iconColor = "text-blue-500"; }
              if (subject.name.includes("ব্যবসায়")) { iconBg = "bg-emerald-50"; iconColor = "text-emerald-500"; }
              if (subject.name.includes("ফিন্যান্স")) { iconBg = "bg-emerald-50"; iconColor = "text-emerald-500"; }
              if (subject.name.includes("পৌরনীতি")) { iconBg = "bg-amber-50"; iconColor = "text-amber-500"; }
              
              // Map test counts to subjects visually (dummy numbers for UI copy matching if db varies)
              let testCount = "১০ টেস্ট";
              if(idx===0) testCount = "২০ টেস্ট";
              else if(idx===1) testCount = "১৮ টেস্ট";
              else if(idx===2) testCount = "১২ টেস্ট";
              else if(idx===3) testCount = "১৫ টেস্ট";
              else if(idx===4) testCount = "১০ টেস্ট";
              else if(idx===5) testCount = "৮ টেস্ট";
              else if(idx===6) testCount = "৯ টেস্ট";

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedSubject(subject.name)}
                  className="bg-white border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-md py-3 px-3 sm:px-4 rounded-[20px] transition-all flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
                >
                  <div className={`w-[40px] h-[40px] sm:w-[46px] sm:h-[46px] rounded-full ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
                    {subject.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-[#0F2744] text-[13px] sm:text-[14px] leading-tight mb-0.5 whitespace-normal break-words pr-1">{subject.name}</h4>
                     <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium">{testCount}</p>
                  </div>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              );
            })}
         </div>

         {/* Fixed Bottom Button */}
         <div className="fixed bottom-0 left-0 w-full p-4 sm:px-6 bg-gradient-to-t from-white via-white to-transparent pb-6 sm:pb-8 z-40 max-w-[500px] sm:max-w-2xl lg:max-w-4xl mx-auto md:left-1/2 md:-translate-x-1/2 md:pb-6">
            <Button 
               onClick={() => { setSelectedSubject("সকল বিষয়"); setActiveSet("mock-10"); }} 
               className="w-full h-[64px] rounded-[32px] bg-gradient-to-r from-[#17316E] to-[#2563EB] shadow-[0_8px_24px_rgba(37,99,235,0.25)] flex items-center justify-between px-3 hover:scale-[1.02] transition-transform"
            >
               <div className="flex items-center gap-3 pl-3">
                 <span className="text-[24px]">🚀</span>
                 <span className="text-white font-bold text-[18px]">দ্রুত মক টেস্ট শুরু করুন</span>
               </div>
               <div className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center text-[#2563EB] shrink-0 font-bold shadow-sm">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
               </div>
            </Button>
         </div>

      </div>
    );
  }

  // Screen 2: Test Sets Selection
  if (!activeSet) {
    if (type === 'model') {
       return (
         <div className="max-w-2xl mx-auto py-12 px-4">
           {/* Header */}
           <div className="text-center mb-10 relative">
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
             {sets.map((set, idx) => (
                <motion.div
                   key={set.id}
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => setActiveSet(set.id)}
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
      <div className="max-w-4xl mx-auto py-12 px-4">
        {type === 'mock' && (
           <div className="mb-6">
              <button 
                onClick={() => setSelectedSubject(null)}
                className="flex items-center text-primary font-bengali font-medium hover:underline px-4 py-2 bg-primary/10 rounded-full text-sm w-fit"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> পুনরায় বিষয় নির্বাচন করুন
              </button>
           </div>
        )}

        <div className="text-center mb-12">
          {type === 'mock' && selectedSubject && (
             <div className="inline-block bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full mb-4 font-bengali text-sm border border-primary/20">
               {selectedSubject}
             </div>
          )}
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
            {type === 'mock' ? `নিচের সেটগুলো থেকে যে কোনো একটি বেছে নিয়ে প্রস্তুতি যাচাই করো।` : pageDesc}
          </p>
        </div>

        {type === 'mistakes' ? (
          <div className="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden text-center">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-rose-400"></div>
             <h3 className="text-2xl font-bengali font-bold text-slate-800 mb-6">ভুলগুলোর প্র্যাকটিস</h3>
             <p className="font-bengali text-slate-500 mb-8">যে প্রশ্নগুলো আগে পরীক্ষা দিতে গিয়ে ভুল হয়েছে, সেগুলো পুনরায় অনুশীলন করো। সর্বোচ্চ ২০টি প্রশ্ন দেয়া হবে।</p>
             <button 
                onClick={() => setActiveSet(`mistakes-20`)}
                className="bg-red-500 text-white font-bengali font-bold px-8 py-4 rounded-2xl hover:bg-red-600 transition-colors shadow-md"
             >
                শুরু করুন
             </button>
          </div>
        ) : (
          <div className="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
             <h3 className="text-2xl font-bengali font-bold text-slate-800 mb-6 text-center">কয়টি প্রশ্নের পরীক্ষা দিতে চাও?</h3>
             
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {[10, 20, 25, 30, 40, 50].map(num => (
                   <button
                      key={num}
                      onClick={() => setActiveSet(`mock-${num}`)}
                      className="py-4 px-4 rounded-2xl font-bengali font-bold border border-slate-200 bg-slate-50 text-slate-600 hover:bg-primary/5 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-1 group"
                   >
                      <span className="text-2xl text-slate-800 group-hover:text-primary transition-colors">{num}</span>
                      <span className="text-sm text-slate-500 font-medium tracking-wide">টি প্রশ্ন</span>
                   </button>
                ))}
             </div>

             <div className="flex items-center gap-3">
                 <input 
                   type="number" 
                   min="5" 
                   max="200" 
                   placeholder="অন্যান্য (যেমন: ১৫)" 
                   className="flex-1 border border-slate-300 rounded-xl px-4 py-3 font-bengali outline-none focus:border-primary/50"
                   id="custom-q-count"
                   onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                         const val = (e.target as HTMLInputElement).value;
                         if(val && parseInt(val) > 0) setActiveSet(`mock-${val}`);
                      }
                   }}
                 />
                 <button 
                   onClick={() => {
                      const val = (document.getElementById('custom-q-count') as HTMLInputElement)?.value;
                      if(val && parseInt(val) > 0) setActiveSet(`mock-${val}`);
                   }}
                   className="bg-primary text-white font-bengali font-bold px-6 py-3 rounded-xl hover:bg-primary/90 flex-shrink-0 whitespace-nowrap"
                 >
                   শুরু করুন
                 </button>
             </div>
          </div>
        )}
      </div>
    );
  }

  // Screen 3: Exam Player
  return (
    <div className="w-full max-w-4xl mx-auto pb-20 px-0 sm:px-4 pt-0 sm:pt-4">
      {/* Top Section */}
      <div className="sticky top-[88px] z-40 bg-white sm:bg-transparent py-2 sm:py-4 px-1 sm:px-0 mb-0 sm:mb-4 sm:border-0 shadow-sm sm:shadow-none">
        <div className="max-w-[800px] mx-auto px-2 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-4 flex-1 min-w-0">
            <button 
             onClick={() => { setActiveSet(null); setIsSubmitted(false); setSelectedOptions({}); setRemainingTime(null); }}
             className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0"
            >
             <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
            </button>
            <div className="flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold rounded-full text-xs sm:text-sm border border-blue-100/50 shadow-xs shrink-0">
               <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" />
               <span className="font-bengali font-bold hidden xs:inline">বাকি:</span>
               <span className="font-mono text-xs sm:text-[15px] font-bold">{Math.max(0, dbQuestions.length - Object.keys(selectedOptions).length)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {isSubmitted ? (
              <div className="flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-emerald-50 text-emerald-800 font-bold rounded-full text-xs sm:text-sm border border-emerald-150 shadow-xs whitespace-nowrap">
                <span className="font-bengali">পরীক্ষা সম্পন্ন</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 font-bold rounded-full text-xs sm:text-sm border border-orange-100/50 shadow-xs font-mono shrink-0">
                   <Timer className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] text-orange-500 animate-pulse" />
                  <span>{timeLeft}</span>
                </div>
                
                <Button 
                  variant="default" 
                  size="sm" 
                  className="font-bengali font-bold px-3 sm:px-6 h-[34px] sm:h-[38px] shrink-0 text-xs sm:text-sm rounded-full whitespace-nowrap transition-all bg-red-100/60 hover:bg-red-100 text-red-700 border border-red-200 shadow-none"
                  onClick={() => {
                     setIsSubmitted(true);
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <span className="hidden sm:inline">পরীক্ষা </span>শেষ করুন
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Question Area */}
      <main className="bg-white sm:rounded-[32px] sm:shadow-sm sm:border sm:border-slate-100 overflow-hidden mb-8 flex-1 flex flex-col p-4 pt-6 sm:p-6 md:p-8">
        
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
        <div className="bg-white sm:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-0 m-0">
          {dbQuestions.map((q, idx) => (
            <div key={q.id || idx} className="question-block p-5 sm:p-8 border-b border-slate-100 last:border-b-0">
               {/* Question Header */}
               <div className="mb-4">
                 <div className="flex items-center gap-2 mb-2">
                   <span className="bg-primary text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
                     প্রশ্ন {q.questionNumber}
                   </span>
                 </div>
                 <h2 className="text-base font-bengali font-bold text-slate-800 leading-snug">
                   {q.text}
                 </h2>
               </div>

               {/* Options */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                 {(Array.isArray(q.options) ? q.options : Object.keys(q.options || {}).map(k => ({ id: k, text: q.options[k], label: q.options[k] }))).map((option: any, optIdx: number) => {
                   const selected = selectedOptions[q.id] === option.id;
                   const correct = isCorrect(q.id, option.id);
                   const wrong = isIncorrect(q.id, option.id);
                   
                   let containerClass = "bg-white border-slate-200 hover:border-primary border-[1.5px] text-slate-800 shadow-sm";
                   let labelBg = "bg-slate-100 text-slate-700";
                   
                   if (selected && !isSubmitted) {
                     containerClass = "bg-primary/5 border-primary border-[1.5px] text-slate-900";
                     labelBg = "bg-primary text-white";
                   } else if (correct) {
                     containerClass = "bg-[#f2fbf5] border-[#4bb063] border-[1.5px] text-[#2c7a3f] shadow-sm";
                     labelBg = "bg-[#4bb063] text-white";
                   } else if (wrong) {
                     containerClass = "bg-red-50 border-red-500 border-[1.5px] text-red-800 shadow-sm";
                     labelBg = "bg-red-500 text-white";
                   }

                   return (
                     <motion.div 
                       key={`${q.id || idx}-${option.id || optIdx}`}
                       whileHover={!isSubmitted ? { scale: 1.01 } : {}}
                       transition={{ type: "spring", stiffness: 400, damping: 25 }}
                       onClick={() => handleSelect(q.id, option.id)}
                       className={`
                         flex flex-row items-center rounded-[14px] cursor-pointer transition-all min-h-[44px] md:min-h-[48px] relative
                         ${containerClass}
                       `}
                     >
                       <div className={`
                         w-10 md:w-11 h-full self-stretch flex-shrink-0 flex items-center justify-center font-bold text-sm transition-colors border-r border-[rgba(0,0,0,0.05)] rounded-l-[12.5px]
                         ${labelBg}
                       `}>
                         {correct ? (
                           <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 fill-white text-[#4bb063]" />
                         ) : (
                           option.id
                         )}
                       </div>
                       
                       <span className="font-bengali font-medium text-[15px] px-3 py-2 flex-1">{option.label}</span>

                       {wrong && (
                         <motion.div 
                           initial={{ scale: 0 }}
                           animate={{ scale: 1 }}
                           className="absolute right-3 text-red-500"
                         >
                           <AlertCircle className="w-4 h-4 fill-red-50 text-red-500" />
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
          <div className="mt-8 flex justify-center border-t border-slate-100 pt-8">
            <Button 
              onClick={handleSubmit} 
              disabled={Object.keys(selectedOptions).length === 0}
              className="bg-primary hover:bg-primary/90 text-white px-10 font-bengali text-lg h-14 rounded-full shadow-lg shadow-primary/20 font-bold"
            >
              উত্তর চেক করুন
            </Button>
          </div>
        )}
         </>
        )}
        </div>
      </main>

    </div>
  );
}

