import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Clock, BookOpen, User, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, XCircle, ChevronDown, ChevronUp, Timer, FileText, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { useAuth } from "../lib/AuthContext";

interface PublicExamData {
  id: string;
  title: string;
  duration: number;
  active: boolean;
  type?: string;
  questions?: any[];
}

export default function PublicExam() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  const [exam, setExam] = useState<PublicExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [studentName, setStudentName] = useState(userData?.fullName || "");
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [expandedExplanation, setExpandedExplanation] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const isEventExam = exam?.type === "event_exam";

  useEffect(() => {
    const fetchExam = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "public_exams", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as PublicExamData;
          setExam({ id: docSnap.id, ...data });
          setTimeLeft((data.duration || 0) * 60);
          
          if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
            const mappedQs = data.questions.map((q: any, idx: number) => {
              const rawOptions = q.options || q.choices || [];
              const safeOptions = rawOptions.map((opt: any, i: number) => {
                if (typeof opt === 'string') {
                  return { id: String.fromCharCode(65 + i), label: opt };
                }
                return {
                  id: opt.id || String.fromCharCode(65 + i),
                  label: opt.label || opt.text || opt.value || ""
                };
              });
              
              let rawCorrect = q.correctOption ?? q.correctAnswer ?? q.answer ?? "A";
              if (safeOptions.length > 0) {
                 const matchedOpt = safeOptions.find((o: any, oIndex: number) => {
                    const c = String(rawCorrect).trim().toLowerCase();
                    const oid = String(o.id).trim().toLowerCase();
                    const olbl = String(o.label).trim().toLowerCase();
                    return oid === c || olbl === c || olbl.startsWith(c) || c.startsWith(oid) || String(oIndex) === c;
                 });
                 if (matchedOpt) {
                    rawCorrect = matchedOpt.id;
                 } else if (typeof rawCorrect === 'number' && safeOptions[rawCorrect]) {
                    rawCorrect = safeOptions[rawCorrect].id;
                 }
              }
              
              return {
                ...q,
                id: q.id || `q${idx}`,
                text: q.text || q.question || q.title || "No question provided.",
                options: safeOptions.length > 0 ? safeOptions : [
                  { id: "A", label: "Option A" },
                  { id: "B", label: "Option B" },
                  { id: "C", label: "Option C" },
                  { id: "D", label: "Option D" },
                ],
                correctOption: rawCorrect,
                explanation: q.explanation || q.desc || q.description || ""
              };
            });
            setQuestions(mappedQs);
          } else {
            const mockQ = Array.from({ length: 10 }).map((_, i) => ({
              id: `q${i+1}`,
              text: `${data.title} - Demo Question ${i+1}. Which one is correct?`,
              options: [
                { id: "A", label: "Option A" },
                { id: "B", label: "Option B" },
                { id: "C", label: "Option C" },
                { id: "D", label: "Option D" }
              ],
              correctOption: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)],
              explanation: "This is a demo question so it doesn't have a real explanation."
            }));
            setQuestions(mockQ);
          }
        } else {
          setError("Invalid or expired link.");
        }
      } catch (e) {
        console.error(e);
        setError("Error fetching exam.");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  useEffect(() => {
    if (userData?.fullName && !studentName) {
      setStudentName(userData.fullName);
    }
  }, [userData]);

  useEffect(() => {
    if (!isStarted || isSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isStarted, isSubmitted]);

  const fetchLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);
      const q = query(
        collection(db, "public_exam_results"),
        where("examId", "==", id),
        orderBy("score", "desc"),
        limit(10)
      );
      const tempSnaps = await getDocs(q);
      const board: any[] = [];
      tempSnaps.forEach((doc) => {
        board.push({ id: doc.id, ...doc.data() });
      });
      setLeaderboard(board);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleStart = () => {
    const finalName = studentName.trim() || userData?.fullName;
    if (!finalName) {
      alert("আপনার নাম প্রদান করুন।");
      return;
    }
    if (!studentName.trim() && finalName) {
      setStudentName(finalName);
    }
    setIsStarted(true);
  };

  const handleSubmit = async () => {
    let s = 0;
    let c = 0;
    let w = 0;
    let sk = 0;
    
    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      const correct = q.correctId || q.correctOption;
      
      if (!selected) {
        sk++;
      } else if (selected === correct) {
        c++;
        s++;
      } else {
        w++;
      }
    });
    
    setScore(s);
    setCorrectCount(c);
    setWrongCount(w);
    setSkippedCount(sk);
    setIsSubmitted(true);
    
    try {
      await addDoc(collection(db, "public_exam_results"), {
        examId: id,
        examTitle: exam?.title || "",
        studentName: studentName.trim() || userData?.fullName || "শিক্ষার্থী",
        score: s,
        correct: c,
        wrong: w,
        skipped: sk,
        total: questions.length,
        submittedAt: serverTimestamp()
      });
      fetchLeaderboard();

      if (userData?.uid) {
        const { doc, writeBatch, updateDoc, increment } = await import("firebase/firestore");
        
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

        const prevSolved = userData?.progress?.totalSolved || 0;
        const newTotalSolved = prevSolved + (c + w);
        const currentAccuracy = userData?.progress?.accuracy || 0;
        const totalCorrectHistoric = (currentAccuracy / 100) * prevSolved;
        const newAccuracy = newTotalSolved > 0 ? Math.round(((totalCorrectHistoric + c) / newTotalSolved) * 100) : 0;
        
        const totalDurationSecs = exam ? exam.duration * 60 : 0;
        const timeSpentSecs = totalDurationSecs > 0 ? Math.max(0, totalDurationSecs - timeLeft) : 0;
        const timeSpentMins = Math.round(timeSpentSecs / 60);

        const userRef = doc(db, "users", userData.uid);
        await updateDoc(userRef, {
          points: increment(s),
          totalExams: increment(1),
          lastExamDate: todayStr,
          "progress.streak": newStreak,
          "progress.totalSolved": newTotalSolved,
          "progress.accuracy": newAccuracy,
          "progress.totalCorrect": increment(c),
          "progress.totalTimeSpent": increment(timeSpentMins)
        });

        const batch = writeBatch(db);
        let batchCount = 0;
        
        questions.forEach((q, idx) => {
          if (batchCount > 450) return;
          const selected = selectedAnswers[idx];
          const correct = q.correctId || q.correctOption;
          
          const mistakeQId = q.id || `${id}_q_${idx}`;
          const mistakeRef = doc(db, "users", userData.uid, "mistakes", mistakeQId);
          
          if (selected && selected !== correct) {
            batch.set(mistakeRef, {
              ...q,
              id: mistakeQId,
              failedAt: Date.now()
            });
            batchCount++;
          } else if (selected === correct) {
            batch.delete(mistakeRef);
          }
        });
        await batch.commit();
      }
    } catch (e) {
      console.error("Failed to save result", e);
    }
  };

  // Auto-submit when user exits browser or switches tab
  const handleSubmitRef = React.useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    if (!isStarted || isSubmitted) return;

    const handleVisibilityAndExit = () => {
      if (document.visibilityState === "hidden") {
        handleSubmitRef.current();
      }
    };

    const handlePageHide = () => {
      handleSubmitRef.current();
    };

    document.addEventListener("visibilitychange", handleVisibilityAndExit);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityAndExit);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [isStarted, isSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const remainingQuestions = questions.length - Object.keys(selectedAnswers).length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bengali">Loading...</div>;
  }

  if (error || !exam || !exam.active) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted font-bengali">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Sorry!</h2>
        <p className="text-muted-foreground mb-6">{error || "This exam is currently closed."}</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const enToBnNumber = (num: number | string) => {
    const bnNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, (w) => bnNumbers[Number(w)]);
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-bengali relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent pointer-events-none"></div>

        {/* Top Brand Header */}
        <div className="bg-card px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm relative z-10">
           <div className="flex items-center">
             <button onClick={() => window.history.length > 2 ? navigate(-1) : navigate("/")} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0 mr-3">
               <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
             </button>
             <div className="font-bold text-2xl sm:text-[28px] tracking-tight flex items-center !leading-relaxed">
                <span className="text-[#1e293b]">শিক্ষা</span><span className="text-[#f59e0b]">ঙ্গন</span>
             </div>
           </div>
           {userData?.uid && (
             <Link to="/profile" className="w-[38px] h-[38px] rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-blue-100 flex items-center justify-center hover:shadow-md transition-shadow">
               {userData.photoURL ? (
                 <img src={userData.photoURL} alt={userData.fullName} className="w-full h-full object-cover" />
               ) : (
                 <User className="w-5 h-5 text-blue-600" />
               )}
             </Link>
           )}
        </div>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 pb-24 relative z-10 w-full">
          <Card className="w-full max-w-[460px] border-0 shadow-[0_20px_60px_rgb(0,0,0,0.06)] rounded-[32px] sm:rounded-[40px] bg-card relative z-10">
          <CardContent className="p-6 sm:p-10">
            {/* Custom SVG icon */}
            <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-2 relative left-2">
              <circle cx="70" cy="75" r="45" fill="#F0F5FF"/>
              
              <path d="M 87 23 L 83 31" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M 103 30 L 94 34" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M 108 45 L 98 45" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
              
              <rect x="50" y="40" width="36" height="50" rx="4" fill="white" stroke="#0F2744" strokeWidth="2.5"/>
              <rect x="58" y="34" width="20" height="10" rx="3" fill="#0F2744"/>
              <rect x="62" y="30" width="12" height="6" rx="2" fill="#0F2744"/>
              
              <text x="68" y="56" fill="#0F2744" fontSize="10" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">EXAM</text>
              
              <rect x="55" y="62" width="5" height="5" rx="1" stroke="#0F2744" strokeWidth="1.5"/>
              <line x1="64" y1="64" x2="74" y2="64" stroke="#0F2744" strokeWidth="1.5" strokeLinecap="round"/>
              
              <rect x="55" y="72" width="5" height="5" rx="1" stroke="#0F2744" strokeWidth="1.5"/>
              <line x1="64" y1="74" x2="72" y2="74" stroke="#0F2744" strokeWidth="1.5" strokeLinecap="round"/>
              
              <rect x="55" y="82" width="5" height="5" rx="1" stroke="#0F2744" strokeWidth="1.5"/>
              <line x1="64" y1="84" x2="70" y2="84" stroke="#0F2744" strokeWidth="1.5" strokeLinecap="round"/>

              <path d="M 54.5 63.5 L 56.5 65.5 L 59 61" stroke="#0F2744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 54.5 73.5 L 56.5 75.5 L 59 71" stroke="#0F2744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 54.5 83.5 L 56.5 85.5 L 59 81" stroke="#0F2744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

              <g transform="translate(68, 62) rotate(-35)">
                <path d="M 8 0 L 16 0 L 12 -12 Z" fill="#FACC15" stroke="#0F2744" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M 12 -12 L 10 -6 L 14 -6 Z" fill="#0F2744"/>
                <rect x="8" y="0" width="8" height="20" fill="#FACC15" stroke="#0F2744" strokeWidth="2"/>
                <rect x="8" y="20" width="8" height="6" fill="#F97316" stroke="#0F2744" strokeWidth="2"/>
              </g>
            </svg>

            <h2 className="text-[22px] sm:text-[26px] font-bold text-center text-[#0F2744] mb-4 leading-[1.35] px-2 uppercase tracking-tight">
              {exam.title}
            </h2>

            <div className="flex flex-row items-center justify-center text-[#0F2744] gap-4 sm:gap-6 mb-8 text-[15px] sm:text-[16px] font-bold">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#F0F5FF] flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-[#0F2744]" strokeWidth={2.5}/> 
                </div>
                <span>সময়: {enToBnNumber(exam.duration)} মিনিট</span>
              </div>
              <div className="w-[1.5px] h-5 bg-slate-200"></div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#F0F5FF] flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-[#0F2744]" strokeWidth={2.5}/> 
                </div>
                <span>মোট নম্বর: {enToBnNumber(questions.length)}</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-[#F4F6FB] rounded-[24px] p-5 flex flex-col items-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-[#E5EDF9] flex items-center justify-center shrink-0">
                     <User className="w-3.5 h-3.5 text-[#475569]" strokeWidth={2.5}/>
                  </div>
                  <span className="text-[#64748B] text-[15px] font-semibold">পরীক্ষার্থী</span>
                </div>

                {!userData?.fullName ? (
                   <div className="w-full mt-2 relative">
                      <Input 
                        placeholder="আপনার নাম লিখুন..." 
                        className="h-[52px] bg-card border-0 rounded-xl text-center text-lg shadow-sm focus:ring-0 font-bold text-[#0F2744] placeholder:text-slate-400 placeholder:font-normal"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                      />
                   </div>
                ) : (
                   <div className="text-[24px] font-bold text-[#0F2744] mt-1 tracking-tight">
                     {userData.fullName}
                   </div>
                )}
              </div>

              <Button 
                onClick={handleStart} 
                className={`w-full h-[64px] rounded-[24px] font-bold transition-all flex items-center justify-between px-2 drop-shadow-xl border border-white/5 ${(!userData?.fullName && !studentName.trim()) ? 'bg-slate-300 shadow-none' : 'bg-gradient-to-r from-[#03112B] to-[#0D2452] hover:from-[#020B1D] hover:to-[#051C3F] shadow-[0_8px_24px_rgba(5,28,63,0.3)]'}`}
                disabled={!userData?.fullName && !studentName.trim()}
              >
                <div className="flex items-center gap-3 pl-4 sm:pl-6">
                  <span className="text-[26px] drop-shadow-md pb-1">🚀</span>
                  <span className="text-[20px] text-white">পরীক্ষা শুরু করুন</span>
                </div>
                <div className={`w-[48px] h-[48px] rounded-[20px] flex items-center justify-center shrink-0 mr-0 transition-colors ${(!userData?.fullName && !studentName.trim()) ? 'bg-slate-200 text-slate-400' : 'bg-card text-[#0A2656]'}`}>
                   <ArrowRight className="w-6 h-6" strokeWidth={2.5} />
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-bengali pb-24">
      {/* Top Brand Header */}
      <div className="bg-card px-4 sm:px-6 py-3 sm:py-4 flex items-center border-b border-slate-100">
         <div className="font-bold text-2xl sm:text-[28px] tracking-tight flex items-center !leading-relaxed">
            <span className="text-[#1e293b]">শিক্ষা</span><span className="text-[#f59e0b]">ঙ্গন</span>
         </div>
      </div>

      {/* Sticky Action Bar */}
      <header className="bg-card border-y sticky top-0 z-50">
        <div className="max-w-[800px] mx-auto px-2 sm:px-4 h-14 sm:h-16 flex items-center justify-between overflow-x-auto no-scrollbar">
          
          <button onClick={() => navigate("/")} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-card border border-slate-200 shadow-sm flex items-center justify-center hover:bg-muted transition-colors shrink-0 mr-2">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
          </button>
          
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-nowrap">
             {isSubmitted ? (
               !isEventExam ? (
                 <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-green-50 text-green-700 font-semibold rounded-full text-[13px] sm:text-sm border border-green-200 shadow-sm whitespace-nowrap">
                   <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                   <span className="font-bengali font-bold hidden sm:inline">স্কোর:</span>
                   <span className="font-mono font-bold text-[14px] sm:text-[15px]">{score}/{questions.length}</span>
                 </div>
               ) : (
                 <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-rose-50 text-rose-700 font-semibold rounded-full text-[12px] sm:text-xs border border-rose-200 shadow-sm whitespace-nowrap font-bengali">
                   <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                   সফলভাবে জমা হয়েছে
                 </div>
               )
             ) : (
               <>
                 <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-full text-[12px] sm:text-[13px] border border-indigo-100/50 shadow-sm whitespace-nowrap tracking-tight">
                   <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" />
                   <span className="font-bengali font-bold hidden xs:inline">বাকি:</span>
                   <span className="font-mono font-bold">{remainingQuestions}</span>
                 </div>
    
                 <div className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-orange-50 text-orange-700 font-bold rounded-full text-[13px] sm:text-sm border border-orange-100/50 shadow-sm font-mono whitespace-nowrap">
                   <Timer className="w-[14px] h-[14px] text-orange-500 animate-pulse" />
                   {formatTime(timeLeft)}
                 </div>
               </>
             )}
             
             {!isSubmitted && (
               <Button variant="default" className="font-bengali font-bold rounded-full h-[32px] sm:h-[38px] px-3 sm:px-5 shadow-none text-[13px] sm:text-sm whitespace-nowrap ml-1 sm:ml-0 transition-all bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700" onClick={handleSubmit}>
                  শেষ করুন
               </Button>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[800px] mx-auto px-2 sm:px-6 mb-8 mt-6">
        
        {isSubmitted && (
          <div className="mb-8 bg-card border border-slate-100 rounded-[32px] p-6 sm:p-8 shadow-sm text-center">
             <h2 className="text-xl font-bold text-foreground mb-6">{studentName}, Final Result</h2>
             
             {isEventExam ? (
                <div className="max-w-md mx-auto my-6 p-6 bg-rose-50/40 border border-rose-100/60 rounded-3xl text-center">
                   <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                   </div>
                   <h3 className="text-lg font-bold font-bengali text-rose-950 mb-2">পরীক্ষা সফলভাবে সম্পন্ন হয়েছে!</h3>
                   <p className="text-sm font-bengali text-slate-600 leading-relaxed">
                      যেহেতু এটি একটি <strong>ইভেন্ট এক্সাম (Event Exam)</strong>, তাই পরীক্ষার ফলাফল এবং সঠিক উত্তরপত্র তাৎক্ষণিকভাবে দেখানো হবে না। ইভেন্ট শেষে লিডারবোর্ড ও নম্বর প্রকাশ করা হবে।
                   </p>
                </div>
             ) : (
                <>
                   <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8">
                      <div className="text-center">
                          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-[3px] sm:border-4 border-green-500 flex items-center justify-center mx-auto mb-2 bg-green-50">
                             <span className="text-xl sm:text-3xl font-bold text-green-600">{correctCount}</span>
                          </div>
                          <span className="text-xs sm:text-[15px] font-medium text-muted-foreground">Correct</span>
                      </div>
                      <div className="text-center">
                          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-[3px] sm:border-4 border-red-500 flex items-center justify-center mx-auto mb-2 bg-red-50">
                             <span className="text-xl sm:text-3xl font-bold text-red-600">{wrongCount}</span>
                          </div>
                          <span className="text-xs sm:text-[15px] font-medium text-muted-foreground">Wrong</span>
                      </div>
                      <div className="text-center">
                          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-[3px] sm:border-4 border-slate-300 flex items-center justify-center mx-auto mb-2 bg-muted">
                             <span className="text-xl sm:text-3xl font-bold text-muted-foreground">{skippedCount}</span>
                          </div>
                          <span className="text-xs sm:text-[15px] font-medium text-muted-foreground">Skipped</span>
                      </div>
                   </div>

                   <div className="bg-muted border border-slate-100 rounded-[20px] p-4 inline-flex items-center gap-3 flex-col sm:flex-row shadow-inner">
                      <span className="text-slate-500 font-medium text-sm sm:text-base">Total Score:</span>
                      <span className="text-2xl font-bold text-primary">{score} <span className="text-base text-slate-400">/ {questions.length}</span></span>
                   </div>
                </>
             )}
             <div className="mt-8 flex justify-center">
                <Button
                   onClick={() => navigate("/")}
                   className="bg-slate-900 hover:bg-black text-white font-bengali font-bold px-8 py-5.5 h-12 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm border-0 cursor-pointer"
                >
                   <ArrowLeft className="w-5 h-5" /> ড্যাশবোর্ডে ফিরে যান
                </Button>
             </div>
          </div>
        )}

        <div className="bg-card sm:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-0 m-0">
          {questions.map((q, idx) => {
            const isQuestionSubmitted = isSubmitted;
            const selected = selectedAnswers[idx];
            const correct = q.correctId || q.correctOption;
            const isCorrect = selected === correct;
            const isSkipped = !selected;

            let iconBg = "";
            if (isSkipped) iconBg = "bg-slate-100 text-slate-500";
            else if (isCorrect) iconBg = "bg-green-100 text-green-600";
            else iconBg = "bg-red-100 text-red-600";

            return (
             <div key={idx} className="p-5 sm:p-8 border-b border-slate-100 last:border-b-0">
                <div className="mb-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     {isQuestionSubmitted && !isEventExam && (
                       <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconBg} shadow-sm`}>
                          {isSkipped ? <AlertCircle className="w-4 h-4" /> : isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                       </div>
                     )}
                     <span className="inline-block px-4 py-1.5 bg-[#1e293b] text-white rounded-full text-[13px] font-bold shadow-sm">
                       প্রশ্ন {idx + 1}
                     </span>
                     {isQuestionSubmitted && isEventExam && selected && (
                       <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-100/50 font-bengali">
                         উত্তর দেওয়া হয়েছে
                       </span>
                     )}
                   </div>
                </div>
                <h3 className="text-[18px] sm:text-[20px] leading-relaxed text-[#0f172a] font-medium mb-6 whitespace-pre-line">
                  {q.text}
                </h3>

                <div className="space-y-3">
                  {(Array.isArray(q.options) ? q.options : Object.keys(q.options || {}).map(k => ({ id: k, text: q.options[k], label: q.options[k] }))).map((option: any, optIdx: number) => {
                    const isSelected = selectedAnswers[idx] === option.id;
                    const isThisCorrect = isQuestionSubmitted && (correct === option.id);
                    const qWasSkipped = !selectedAnswers[idx];
                    
                    let optStyle = "";
                    if (isQuestionSubmitted) {
                       if (isEventExam) {
                          if (isSelected) optStyle = "border-slate-800 bg-[#f8fafc] shadow-[0_0_0_1px_#1e293b]";
                          else optStyle = "border-slate-200 bg-muted/50 opacity-60";
                       } else {
                          if (isThisCorrect && qWasSkipped) optStyle = "border-orange-500 bg-orange-100 shadow-[0_0_0_1px_#f97316]";
                          else if (isThisCorrect) optStyle = "border-green-500 bg-green-100 shadow-[0_0_0_1px_#22c55e]";
                          else if (isSelected && !isThisCorrect) optStyle = "border-red-500 bg-red-100 shadow-[0_0_0_1px_#ef4444]";
                          else optStyle = "border-slate-200 bg-muted opacity-60";
                       }
                    } else {
                       if (isSelected) optStyle = "border-[#1e293b] bg-muted shadow-[0_0_0_1px_#1e293b]";
                       else optStyle = "border-slate-200 hover:border-slate-300 bg-card";
                    }

                    let badgeStyle = "";
                    if (isQuestionSubmitted) {
                       if (isEventExam) {
                          if (isSelected) badgeStyle = "bg-[#1e293b] text-white border-r-[#1e293b]";
                          else badgeStyle = "bg-slate-200 text-slate-400 border-slate-200";
                       } else {
                          if (isThisCorrect && qWasSkipped) badgeStyle = "bg-orange-600 text-white border-r-orange-600";
                          else if (isThisCorrect) badgeStyle = "bg-green-600 text-white border-r-green-600";
                          else if (isSelected && !isThisCorrect) badgeStyle = "bg-red-600 text-white border-r-red-600";
                          else badgeStyle = "bg-slate-200 text-slate-500 border-slate-200";
                       }
                    } else {
                       if (isSelected) badgeStyle = "bg-[#1e293b] text-white border-r-[#1e293b]";
                       else badgeStyle = "bg-[#f8fafc] text-foreground border-slate-200";
                    }

                    let textColor = "";
                    if (isQuestionSubmitted) {
                       if (isEventExam) {
                          textColor = isSelected ? "text-[#1e293b] font-bold" : "text-slate-400 font-medium";
                       } else {
                          if (isThisCorrect && qWasSkipped) textColor = "text-orange-900 font-bold";
                          else if (isThisCorrect) textColor = "text-green-900 font-bold";
                          else if (isSelected && !isThisCorrect) textColor = "text-red-900 font-bold";
                          else textColor = "text-muted-foreground font-medium";
                       }
                    } else {
                       textColor = isSelected ? 'text-[#1e293b] font-bold' : 'text-[#0f172a] font-medium';
                    }

                    return (
                      <button
                        key={`${q.id || idx}-${option.id || optIdx}`}
                        onClick={() => { if (!isQuestionSubmitted) setSelectedAnswers({ ...selectedAnswers, [idx]: option.id }) }}
                        disabled={isQuestionSubmitted}
                        className={`w-full flex items-stretch rounded-[16px] border-[1.5px] overflow-hidden transition-all text-left ${optStyle}`}
                      >
                        <div className={`w-[52px] flex items-center justify-center text-[15px] font-bold shrink-0 border-r-[1.5px] transition-colors ${badgeStyle}`}>
                          {option.id === 'A' || option.id === '1' ? 'ক' : option.id === 'B' || option.id === '2' ? 'খ' : option.id === 'C' || option.id === '3' ? 'গ' : option.id === 'D' || option.id === '4' ? 'ঘ' : option.id}
                        </div>
                        <div className="flex-1 p-4 px-5">
                          <span className={`text-[16px] sm:text-[17px] ${textColor}`}>
                            {option.label || option.text}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* Auto Explanation block if submitted */}
                {isQuestionSubmitted && q.explanation && !isEventExam && (
                  <div className="mt-6 p-5 sm:p-6 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl flex gap-3 sm:gap-4 shadow-sm">
                     <div className="w-8 h-8 sm:w-10 sm:h-10 bg-card border border-indigo-200/60 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                       <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                     </div>
                     <div className="flex-1 pt-0.5 sm:pt-1">
                       <h4 className="text-[14px] sm:text-[15px] font-bold text-indigo-900 mb-1.5">ব্যাখ্যা:</h4>
                       <div className="text-[14px] sm:text-[15px] leading-relaxed text-indigo-950/80 whitespace-pre-line">
                         {q.explanation}
                       </div>
                     </div>
                  </div>
                )}
             </div>
            );
          })}
        
        </div>

        {!isSubmitted && (
        <div className="pt-8 pb-8">
           <Button onClick={() => handleSubmit()} className="w-full h-[60px] rounded-[20px] text-lg font-bold bg-[#1e293b] hover:bg-slate-800 text-white shadow-md">
             পরীক্ষা জমা দিন
           </Button>
        </div>
        )}

        {isSubmitted && leaderboard.length > 0 && !isEventExam && (
          <div className="mt-8 mb-8 bg-card rounded-[32px] border border-slate-100 shadow-sm p-6 sm:p-8">
             <h3 className="text-xl sm:text-2xl font-bold text-foreground font-bengali text-center mb-6 flex items-center justify-center gap-2">
               <span>🏆</span> লিডারবোর্ড (Top 10)
             </h3>
             <div className="space-y-3">
               {leaderboard.map((user, idx) => (
                 <div key={user.id} className={`flex items-center justify-between border rounded-2xl p-4 ${idx === 0 ? 'bg-amber-50/50 border-amber-100' : idx === 1 ? 'bg-muted border-slate-200' : idx === 2 ? 'bg-orange-50/50 border-orange-100' : 'bg-muted border-slate-100'}`}>
                   <div className="flex items-center gap-4 min-w-0">
                     <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-base ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-200 text-muted-foreground' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-card border text-slate-500'}`}>
                       #{idx + 1}
                     </div>
                     <div className="min-w-0">
                       <div className="font-bold text-foreground text-base sm:text-lg truncate">{user.studentName}</div>
                     </div>
                   </div>
                   <div className="text-right shrink-0 pl-4">
                     <div className="font-bold text-lg text-primary">{user.score} <span className="text-sm text-slate-400 font-normal">/ {user.total}</span></div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
