import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Lightbulb, Clock, Target, AlertCircle, PlayCircle, ArrowLeft, BookOpen, Atom, Calculator, Users, Laptop, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../lib/AuthContext";

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
    { name: "বাংলা", icon: <BookOpen className="w-8 h-8 text-red-500" />, color: "bg-red-50 hover:border-red-200" },
    { name: "English", icon: <span className="font-bold text-xl text-indigo-500">Aa</span>, color: "bg-indigo-50 hover:border-indigo-200" },
    { name: "তথ্য ও যোগাযোগ প্রযুক্তি", icon: <Laptop className="w-8 h-8 text-blue-500" />, color: "bg-blue-50 hover:border-blue-200" },
  ],
  "বিজ্ঞান": [
    { name: "পদার্থবিজ্ঞান", icon: <Atom className="w-8 h-8 text-purple-500" />, color: "bg-purple-50 hover:border-purple-200" },
    { name: "রসায়ন", icon: <span className="text-2xl pt-1">🧪</span>, color: "bg-pink-50 hover:border-pink-200" },
    { name: "উচ্চতর গণিত", icon: <span className="text-2xl pt-1 font-bold text-orange-500">π</span>, color: "bg-orange-50 hover:border-orange-200" },
    { name: "জীববিজ্ঞান", icon: <span className="text-2xl pt-1">🧬</span>, color: "bg-green-50 hover:border-green-200" },
  ],
  "ব্যবসায় শিক্ষা": [
    { name: "হিসাববিজ্ঞান", icon: <Calculator className="w-8 h-8 text-blue-500" />, color: "bg-blue-50 hover:border-blue-200" },
    { name: "ব্যবসায় সংগঠন", icon: <Users className="w-8 h-8 text-green-600" />, color: "bg-emerald-50 hover:border-emerald-200" },
    { name: "ফিন্যান্স", icon: <span className="text-2xl pt-1">💹</span>, color: "bg-rose-50 hover:border-rose-200" },
    { name: "উৎপাদন ব্যবস্থাপনা", icon: <span className="text-2xl pt-1 px-1">🏭</span>, color: "bg-yellow-50 hover:border-yellow-200" },
  ],
  "মানবিক": [
    { name: "ইতিহাস", icon: <span className="text-2xl pt-1">🏛️</span>, color: "bg-amber-50 hover:border-amber-200" },
    { name: "ভূগোল", icon: <span className="text-2xl pt-1">🌍</span>, color: "bg-cyan-50 hover:border-cyan-200" },
    { name: "অর্থনীতি", icon: <span className="text-2xl pt-1 px-1">৳</span>, color: "bg-fuchsia-50 hover:border-fuchsia-200" },
    { name: "পৌরনীতি", icon: <span className="text-2xl pt-1 px-1">⚖️</span>, color: "bg-slate-50 hover:border-slate-300" },
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
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'model';
  const sets = type === 'mock' ? mockSets : modelSets;
  const pageTitle = type === 'mock' ? 'মক টেস্ট অনুশীলন' : 'মডেল টেস্ট অনুশীলন';
  const pageDesc = type === 'mock' 
    ? 'অধ্যায়ভিত্তিক মক টেস্ট দিয়ে তোমার প্রস্তুতি যাচাই করো।' 
    : 'নিচের মডেল টেস্টগুলো থেকে যে কোনো একটি বেছে নিয়ে পূর্ণাঙ্গ প্রস্তুতি যাচাই করো।';

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [activeSet, setActiveSet] = useState<string | null>(null);
  
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [dbQuestions, setDbQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      if ((type === 'mock' && activeSet && selectedSubject) || (type === 'model' && activeSet)) {
        setIsLoading(true);
        try {
          const { collection, getDocs, query, where } = await import("firebase/firestore");
          const { db } = await import("../lib/firebase");
          let qBase = collection(db, "questions");
          let qQuery: any = qBase;
          if (type === 'mock' && selectedSubject !== "সকল বিষয়") {
            qQuery = query(qBase, where("subject", "==", selectedSubject));
          }
          // Note: for model tests or "সকল বিষয়" it fetches all. Warning: could be large.
          // Firebase limit typically easily handles a few thousands in one query.
          const snap = await getDocs(qQuery);
          const allQs = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
          
          // Shuffle
          const shuffled = allQs.sort(() => Math.random() - 0.5);
          
          let numQuestions = 10;
          if (type === 'mock') {
             const counts = activeSet.split('-');
             if (counts.length === 2 && !isNaN(parseInt(counts[1]))) {
                numQuestions = parseInt(counts[1]);
             }
          } else {
             const setList = modelSets;
             const setInfo = setList.find(s => s.id === activeSet);
             numQuestions = setInfo ? setInfo.totalQuestions : 50;
          }
          
          const selectedQs = shuffled.slice(0, numQuestions);
          
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
        const { doc, updateDoc, increment } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase");
        const userRef = doc(db, "users", userData.uid);
        await updateDoc(userRef, {
          points: increment(currentScore),
          totalExams: increment(1)
        });
      } catch (err) {
        console.error("Error updating score:", err);
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
      <div className="max-w-4xl mx-auto py-12 px-4">
         <div className="text-center mb-10">
           <h2 className="text-3xl font-bengali font-bold text-slate-800 mb-4">{pageTitle}</h2>
           <p className="text-slate-500 font-bengali text-lg max-w-xl mx-auto mb-8">
             {pageDesc}
           </p>

           <Button 
             variant="default" 
             size="lg" 
             onClick={() => setSelectedSubject("সকল বিষয়")}
             className="font-bengali bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 rounded-full px-8 mb-4 h-12"
           >
             শুরু করুন সকল বিষয় একসাথে
           </Button>
         </div>

         <div className="mb-10 text-center">
            <h3 className="text-2xl font-bengali font-bold text-slate-800 inline-block relative after:content-[''] after:absolute after:-bottom-3 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1.5 after:bg-secondary after:rounded-full">
               বিষয় ভিত্তিক
            </h3>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
           {displaySubjects.map((subject, idx) => {
             // Extract just the bg color, e.g. "bg-red-50"
             const baseColor = subject.color.split(' ')[0];
             return (
               <motion.div
                 key={idx}
                 whileHover={{ scale: 1.05, translateY: -5 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => setSelectedSubject(subject.name)}
                 className="cursor-pointer bg-white border border-slate-100 hover:border-slate-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] p-5 sm:p-6 rounded-3xl transition-all duration-300 flex flex-col items-center text-center gap-4 group relative overflow-hidden"
               >
                 <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ease-out ${baseColor.replace('50', '500')}`}></div>
                 <div className={`w-16 h-16 sm:w-20 sm:h-20 ${baseColor} border border-white ring-4 ring-slate-50/50 rounded-2xl shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 ease-out relative z-10`}>
                   {subject.icon}
                 </div>
                 <h4 className="font-bengali font-bold text-slate-800 text-sm sm:text-base relative z-10 leading-snug group-hover:text-primary transition-colors">{subject.name}</h4>
               </motion.div>
             );
           })}
         </div>
      </div>
    );
  }

  // Screen 2: Test Sets Selection
  if (!activeSet) {
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
          <p className="text-slate-500 font-bengali text-lg max-w-xl mx-auto">
            {type === 'mock' ? `নিচের সেটগুলো থেকে যে কোনো একটি বেছে নিয়ে প্রস্তুতি যাচাই করো।` : pageDesc}
          </p>
        </div>

        {type === 'mock' ? (
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
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sets.map((set) => (
              <motion.div
                key={set.id}
                whileHover={{ scale: 1.02, translateY: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSet(set.id)}
                className="cursor-pointer bg-white border border-slate-100 hover:border-primary/50 shadow-sm hover:shadow-md p-6 rounded-[24px] transition-all flex flex-col items-center text-center group relative overflow-hidden"
              >
                <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <PlayCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bengali font-bold text-slate-800 mb-2">{set.title}</h3>
                <div className="flex gap-4 text-slate-500 font-bengali text-sm mt-auto">
                   <span>⏱️ {set.timeMinutes} মিনিট</span>
                   <span>📝 {set.totalQuestions} প্রশ্ন</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Screen 3: Exam Player
  return (
    <div className="w-full max-w-4xl mx-auto pb-20 px-0 sm:px-4 pt-0 sm:pt-4">
      {/* Top Section */}
      <div className="sticky top-[88px] z-40 bg-white sm:bg-transparent py-2 sm:py-4 px-2 sm:px-0 mb-0 sm:mb-4 sm:border-0 shadow-sm sm:shadow-none">
        <div className="flex items-center justify-between gap-x-2 bg-white sm:shadow-sm p-2 sm:p-4 rounded-xl sm:border sm:border-slate-200 w-full overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex items-center space-x-2 overflow-hidden shrink-0">
            <button 
             onClick={() => { setActiveSet(null); setIsSubmitted(false); setSelectedOptions({}); setRemainingTime(null); }}
             className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
            >
             <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0 overflow-x-auto pl-2" style={{ scrollbarWidth: 'none' }}>
            <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 shrink-0">
               <span className="text-xs sm:text-sm text-blue-700 font-bold font-bengali whitespace-nowrap">
                  বাকি: {dbQuestions.length - Object.keys(selectedOptions).length}
               </span>
            </div>
            <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full font-mono text-xs sm:text-sm font-bold shrink-0 border border-orange-100">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 shrink-0" />
              {timeLeft}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className={`font-bengali font-bold px-3 sm:px-4 shrink-0 text-xs sm:text-sm h-8 sm:h-9 rounded-full whitespace-nowrap ${isSubmitted ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-red-600 border-red-200 hover:bg-red-50'}`}
              onClick={() => {
                if (isSubmitted) {
                   setActiveSet(null); setIsSubmitted(false); setSelectedOptions({}); setRemainingTime(null);
                } else {
                   setIsSubmitted(true);
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              {isSubmitted ? 'ফিরে যান' : 'শেষ করুন'}
            </Button>
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
          dbQuestions.map((q) => (
            <div key={q.id} className="question-block border-b border-slate-100 pb-10 last:border-0 last:pb-0">
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
                 {q.options.map((option: any) => {
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
                       key={option.id}
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
                     className="bg-[#fff9e6] border-2 border-[#fcd34d] rounded-[24px] p-5 shadow-sm overflow-hidden"
                   >
                     {userData?.isPro ? (
                       <div className="flex gap-4">
                         <div className="w-10 h-10 bg-[#fbbf24] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">
                           <Lightbulb className="w-6 h-6" />
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
          ))
          )}
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
      </main>

    </div>
  );
}

