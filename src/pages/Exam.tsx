import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Lightbulb, Clock, Target, AlertCircle, PlayCircle, ArrowLeft, BookOpen, Atom, Calculator, Users, Laptop, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../lib/AuthContext";

const mockSets = [
  { id: "mock-1", title: "মক টেস্ট - ১ (অধ্যায় ১-৩)", totalQuestions: 20, timeMinutes: 15 },
  { id: "mock-2", title: "মক টেস্ট - ২ (অধ্যায় ৪-৬)", totalQuestions: 20, timeMinutes: 15 },
  { id: "mock-3", title: "মক টেস্ট - ৩ (সম্পূর্ণ বই)", totalQuestions: 30, timeMinutes: 20 },
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

  const userGroup = userData?.group || "বিজ্ঞান";
  const displaySubjects = [
    ...subjectsByGroup["common"], 
    ...(subjectsByGroup[userGroup] || subjectsByGroup["বিজ্ঞান"])
  ];
  
  const handleSelect = (questionId: string, optionId: string) => {
    if (isSubmitted) return;
    setSelectedOptions(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const isCorrect = (questionId: string, optionId: string) => {
    const q = mockQuestions.find(mq => mq.id === questionId);
    return isSubmitted && optionId === q?.correctOption;
  };
  
  const isIncorrect = (questionId: string, optionId: string) => {
    const q = mockQuestions.find(mq => mq.id === questionId);
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
          const setInfo = sets.find(s => s.id === activeSet);
          if(setInfo) {
              setRemainingTime(setInfo.timeMinutes * 60);
          }
      } else {
          setRemainingTime(null);
      }
  }, [activeSet, sets]);

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

         <div className="mb-6">
            <h3 className="text-xl font-bengali font-bold text-slate-700 text-center relative after:content-[''] after:block after:w-16 after:h-1 after:bg-secondary after:mx-auto after:mt-2 after:rounded-full">
               বিষয় ভিত্তিক
            </h3>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           {displaySubjects.map((subject, idx) => (
             <motion.div
               key={idx}
               whileHover={{ scale: 1.02, translateY: -2 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => setSelectedSubject(subject.name)}
               className={`cursor-pointer bg-white border border-slate-100 ${subject.color} shadow-sm hover:shadow-md p-4 rounded-2xl transition-all flex items-center justify-center gap-4 group`}
             >
               <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                 {subject.icon}
               </div>
               <h4 className="font-bengali font-bold text-slate-800 flex-1">{subject.name}</h4>
             </motion.div>
           ))}
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
      </div>
    );
  }

  // Screen 3: Exam Player
  return (
    <div className="max-w-4xl mx-auto pb-16 px-4">
      {/* Top Section */}
      <div className="sticky top-[86px] sm:top-[88px] z-40 bg-[#F8FAFC] py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-4">
        <div className="flex items-center justify-between bg-white shadow-sm p-2.5 sm:p-4 rounded-[24px] sm:rounded-xl border border-slate-200 max-w-4xl mx-auto w-full">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
            <button 
             onClick={() => { setActiveSet(null); setIsSubmitted(false); setSelectedOptions({}); setRemainingTime(null); }}
             className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
            >
             <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            </button>
            <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-full shrink-0">
              <span className="text-slate-700 text-[11px] sm:text-sm font-bengali font-bold whitespace-nowrap">
                {type === 'mock' && selectedSubject ? 'মক টেস্ট' : 'মডেল টেস্ট'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1.5 sm:space-x-4 shrink-0">
            <div className="flex items-center bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-blue-100">
               <span className="text-[10px] sm:text-xs text-blue-700 font-bold font-bengali whitespace-nowrap">
                  বাকি: {mockQuestions.length - Object.keys(selectedOptions).length}
               </span>
            </div>
            <div className="flex items-center text-orange-600 bg-orange-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-mono text-[11px] sm:text-sm font-bold shrink-0 border border-orange-100">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 shrink-0" />
              {timeLeft}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="font-bengali text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-bold px-2.5 sm:px-4 shrink-0 text-[11px] sm:text-sm h-7 sm:h-9 rounded-full whitespace-nowrap"
              onClick={() => { setActiveSet(null); setIsSubmitted(false); setSelectedOptions({}); setRemainingTime(null); }}
            >
              শেষ করুন
            </Button>
          </div>
        </div>
      </div>

      {/* Main Question Area */}
      <main className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden mb-8 flex-1 flex flex-col p-6 md:p-8">
        
        <div className="space-y-12">
          {mockQuestions.map((q) => (
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
                 {q.options.map((option) => {
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
      </main>

    </div>
  );
}

