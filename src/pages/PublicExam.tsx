import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Clock, BookOpen, User, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, XCircle, ChevronDown, ChevronUp, Timer, FileText, Brain, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { useAuth } from "../lib/AuthContext";
import { TransparentLogo } from "../components/ui/TransparentLogo";

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

  const [mobileNumber, setMobileNumber] = useState("");
  const [isCheckingMobile, setIsCheckingMobile] = useState(false);

  const isEventExam = exam?.type === "event_exam" || 
    (exam?.title && (
      exam.title.toLowerCase().includes("mega") || 
      exam.title.toLowerCase().includes("মেগা") || 
      exam.title.toLowerCase().includes("event") || 
      exam.title.toLowerCase().includes("ইভেন্ট")
    ));

  useEffect(() => {
    const fetchExam = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "public_exams", id);
        const docSnap = await getDoc(docRef);
        let data: PublicExamData | null = null;
        let examId = id;

        if (docSnap.exists()) {
          data = docSnap.data() as PublicExamData;
          examId = docSnap.id;
        } else {
          // Fallback: search for case-insensitive ID match in public_exams
          const { collection, getDocs } = await import("firebase/firestore");
          const snap = await getDocs(collection(db, "public_exams"));
          const matchedDoc = snap.docs.find(
            doc => doc.id.toLowerCase() === id.toLowerCase()
          );
          if (matchedDoc) {
            data = matchedDoc.data() as PublicExamData;
            examId = matchedDoc.id;
          }
        }

        if (data) {
          setExam({ id: examId, ...data });
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



  const handleStart = async () => {
    const finalName = studentName.trim() || userData?.fullName;
    if (!finalName) {
      alert("আপনার নাম প্রদান করুন।");
      return;
    }
    if (isEventExam) {
      const cleanNum = mobileNumber.trim();
      if (!cleanNum || cleanNum.length < 11) {
        alert("অনুগ্রহ করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।");
        return;
      }

      try {
        setIsCheckingMobile(true);
        const { collection, getDocs, query, where } = await import("firebase/firestore");
        const checkExamId = exam?.id || id;
        
        // Robust case-insensitive check by querying both variants
        const qOriginal = query(
          collection(db, "public_exam_results"),
          where("examId", "==", checkExamId),
          where("mobileNumber", "==", cleanNum)
        );
        const snapOriginal = await getDocs(qOriginal);
        
        let hasTaken = !snapOriginal.empty;
        
        if (!hasTaken && checkExamId && checkExamId.toLowerCase() !== checkExamId) {
          const qLower = query(
            collection(db, "public_exam_results"),
            where("examId", "==", checkExamId.toLowerCase()),
            where("mobileNumber", "==", cleanNum)
          );
          const snapLower = await getDocs(qLower);
          hasTaken = !snapLower.empty;
        }

        if (hasTaken) {
          alert("দুঃখিত! এই মোবাইল নম্বরটি দিয়ে ইতিমধ্যে একবার পরীক্ষায় অংশ নেওয়া হয়েছে। একটি ইভেন্টে এক নম্বর দিয়ে একবারই কুইজ দেওয়া যাবে।");
          return;
        }
      } catch (err) {
        console.error("Error checking mobile duplicate:", err);
      } finally {
        setIsCheckingMobile(false);
      }
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
        examId: exam?.id || id,
        examTitle: exam?.title || "",
        studentName: studentName.trim() || userData?.fullName || "শিক্ষার্থী",
        mobileNumber: mobileNumber || "",
        score: s,
        correct: c,
        wrong: w,
        skipped: sk,
        total: questions.length,
        submittedAt: serverTimestamp()
      });

      if (userData?.uid && !isEventExam) {
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
          "progress.totalTimeSpent": increment(timeSpentMins),
          updatedAt: serverTimestamp()
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
      <div className="min-h-screen bg-[#F3F6FC] flex items-center justify-center p-3 sm:p-6 font-bengali relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-blue-200/20 blur-xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-indigo-200/20 blur-xl pointer-events-none animate-pulse"></div>

        <Card className="w-full max-w-[480px] border-0 shadow-[0_16px_50px_rgba(15,39,68,0.06)] rounded-[32px] sm:rounded-[36px] bg-white relative z-10 overflow-hidden">
          <CardContent className="p-5 sm:p-8 flex flex-col">
            {/* Top Brand Header inside card */}
            <div className="flex items-center justify-between w-full mb-6">
              <button 
                onClick={() => window.history.length > 2 ? navigate(-1) : navigate("/")} 
                className="w-11 h-11 rounded-full bg-white border border-slate-200/80 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all cursor-pointer hover:border-slate-300"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
              </button>
              
              <Link to="/" className="flex items-center h-[52px] sm:h-[62px] overflow-visible">
                <TransparentLogo
                  src="https://i.ibb.co/7dGVYGFD/SAVE-20260621-201151.jpg"
                  alt="বিদ্যায়ন"
                  className="h-[64px] sm:h-[76px] -my-1.5 w-auto object-contain block relative"
                />
              </Link>

              {userData?.uid ? (
                <Link to="/profile" className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 shadow-sm shrink-0 bg-blue-50 flex items-center justify-center hover:shadow-md transition-shadow">
                  {userData.photoURL ? (
                    <img src={userData.photoURL} alt={userData.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-blue-600" />
                  )}
                </Link>
              ) : (
                <div className="w-11 h-11"></div>
              )}
            </div>

            {/* Custom SVG exam illustration */}
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

            {/* Exam Title */}
            <h2 className="text-[23px] sm:text-[26px] font-extrabold text-center text-[#0F2744] mb-4 leading-snug px-1 tracking-tight">
              {exam.title}
            </h2>

            {/* Exam metadata row */}
            <div className="flex flex-row items-center justify-center text-[#0F2744] gap-4 sm:gap-5 mb-6 text-[15px] sm:text-[16px] font-bold">
              <div className="flex items-center gap-1.5 matches-clock text-[#1E40AF]">
                <Clock className="w-5 h-5 text-[#2563EB]" strokeWidth={2.5}/> 
                <span>সময়: {enToBnNumber(exam.duration)} মিনিট</span>
              </div>
              <div className="w-[1.5px] h-5 bg-slate-200"></div>
              <div className="flex items-center gap-1.5 matches-file text-[#1E40AF]">
                <FileText className="w-5 h-5 text-[#2563EB]" strokeWidth={2.5}/> 
                <span>মোট নম্বর: {enToBnNumber(questions.length)}</span>
              </div>
            </div>
            
            {/* Main Interactive Fields */}
            <div className="space-y-5">
              
              {/* Candidate Info Card */}
              <div className="bg-[#EDF4FF] border border-[#DDECFF] rounded-[24px] p-4.5 flex items-center gap-3.5 shadow-xs relative">
                <div className="w-12 h-12 rounded-full bg-[#D6E7FF] flex items-center justify-center text-blue-600 shrink-0">
                  <User className="w-6 h-6" strokeWidth={2.5}/>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-slate-400 text-[12px] font-bold uppercase tracking-wider block">পরীক্ষার্থী</span>
                  {!userData?.fullName ? (
                     <div className="w-full mt-1.5">
                        <Input 
                          placeholder="আপনার নাম লিখুন..." 
                          className="h-[38px] bg-white border border-blue-100 rounded-xl px-3 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-blue-400 font-bold text-[#0F2744] placeholder:text-slate-400 placeholder:font-normal"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                        />
                     </div>
                  ) : (
                     <span className="text-[19px] sm:text-[21px] font-extrabold text-[#0B1D33] tracking-tight truncate block leading-tight mt-0.5 animate-fade-in">
                       {userData?.fullName || studentName}
                     </span>
                  )}
                </div>

                {/* Achievement Badge */}
                <div className="shrink-0 pl-1">
                  <svg width="44" height="44" viewBox="0 0 48 48" fill="none" className="shrink-0 select-none">
                    <path d="M18 30 L13 43 L21 40 L24 31.5" fill="#5F88FC" />
                    <path d="M30 30 L35 43 L27 40 L24 31.5" fill="#5F88FC" />
                    <path d="M19.5 30 L16 43 L21 40" fill="#3B82F6" />
                    <path d="M28.5 30 L32 43 L27 40" fill="#3B82F6" />
                    
                    <circle cx="24" cy="22" r="14" fill="#4B77FF" />
                    <circle cx="24" cy="22" r="12" fill="#3B66FF" />
                    <path d="M24 14 L26.5 19.5 L32.5 20.2 L28 24.3 L29.3 30.2 L24 27.2 L18.7 30.2 L20 24.3 L15.5 20.2 L21.5 19.5 Z" fill="white" />
                  </svg>
                </div>
              </div>

              {/* Mobile Number Container */}
              {isEventExam && (
                <div className="bg-[#FFF4ED] border border-[#FFE1CE] rounded-[24px] p-4 sm:p-5 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFEFE5] rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex items-center gap-2 mb-3.5 pl-1 relative z-10">
                     <Phone className="w-5 h-5 text-orange-500" strokeWidth={2.5} />
                     <span className="text-[#803105] text-[15px] sm:text-[16px] font-extrabold tracking-tight">মোবাইল নম্বর</span>
                  </div>
                  <div className="relative z-10">
                     <Phone className="w-4 h-4 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
                     <Input 
                       type="tel"
                       placeholder="আপনার ১১ ডিজিটের মোবাইল নম্বর" 
                       className="pl-12 pr-14 h-[50px] sm:h-[56px] bg-white border border-[#FFEADB]/40 rounded-full text-base sm:text-lg font-mono font-bold text-[#0F2744] placeholder:text-slate-400 placeholder:font-normal placeholder:font-bengali shadow-xs focus-visible:ring-2 focus-visible:ring-orange-500/40"
                       value={mobileNumber}
                       disabled={isCheckingMobile}
                       onChange={(e) => {
                         const val = e.target.value.replace(/[^0-9]/g, '');
                         if (val.length <= 11) {
                           setMobileNumber(val);
                         }
                       }}
                     />
                     <button 
                       onClick={handleStart}
                       disabled={isCheckingMobile || (!userData?.fullName && !studentName.trim()) || (isEventExam && mobileNumber.length < 11)}
                       className={`w-[36px] h-[36px] sm:w-[42px] sm:h-[42px] rounded-full flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 transition-all shadow-sm ${(isCheckingMobile || (!userData?.fullName && !studentName.trim()) || (isEventExam && mobileNumber.length < 11)) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#FF5500] text-white hover:bg-[#E04B00] hover:scale-105 active:scale-95 cursor-pointer'}`}
                     >
                       <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                     </button>
                  </div>
                </div>
              )}

              {/* Start Button */}
              <Button 
                onClick={handleStart} 
                className={`w-full h-[62px] sm:h-[68px] rounded-[24px] font-bold font-bengali transition-all flex items-center justify-between px-3.5 sm:px-4.5 border border-white/10 ${(isCheckingMobile || (!userData?.fullName && !studentName.trim()) || (isEventExam && mobileNumber.length < 11)) ? 'bg-slate-300 shadow-none text-slate-400 cursor-not-allowed hover:bg-slate-300' : 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#4F46E5] hover:to-[#7C3AED] shadow-[0_10px_25px_rgba(99,102,241,0.3)] text-white hover:scale-[1.01] active:scale-95'}`}
                disabled={isCheckingMobile || (!userData?.fullName && !studentName.trim()) || (isEventExam && mobileNumber.length < 11)}
              >
                <div className="flex items-center gap-3 pl-2 sm:pl-3">
                  <span className="text-[26px] sm:text-[30px] animate-bounce">🚀</span>
                  <span className="text-[19px] sm:text-[21px] text-white font-extrabold tracking-tight">
                    {isCheckingMobile ? "যাচাই করা হচ্ছে..." : "পরীক্ষা শুরু করুন"}
                  </span>
                </div>
                <div className={`w-[40px] h-[40px] sm:w-[46px] sm:h-[46px] rounded-full flex items-center justify-center shrink-0 mr-0 transition-all ${(isCheckingMobile || (!userData?.fullName && !studentName.trim()) || (isEventExam && mobileNumber.length < 11)) ? 'bg-slate-200 text-slate-400' : 'bg-white text-[#6366F1] shadow-xs cursor-pointer'}`}>
                   <ArrowRight className="w-5 h-5" strokeWidth={3} />
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-bengali pb-24">
      {/* Sticky Action Bar */}
      <header className="bg-slate-50/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 py-3 sm:py-5 px-3 sm:px-6">
        <div className="max-w-[700px] mx-auto flex items-center justify-between gap-1 sm:gap-2">
          
          {/* Left Arrow Back Button (Mockup match) */}
          <button 
            onClick={() => {
              if (isSubmitted) {
                navigate("/");
              } else if (confirm("আপনি কি নিশ্চিতভাবে পরীক্ষা বাতিল করতে চান?")) {
                navigate("/");
              }
            }} 
            className="w-8.5 h-8.5 sm:w-11 sm:h-11 rounded-full bg-white border border-slate-200/80 flex items-center justify-center hover:bg-slate-50 transition-all shrink-0 cursor-pointer shadow-[0_3px_10px_rgba(0,0,0,0.04)]"
            aria-label="ফিরে যান"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" strokeWidth={2.5} />
          </button>
          
          {/* Violet capsule (Mockup match) */}
          <div className="bg-[#F1EEFB] border border-[#E9E4F8] rounded-full pr-2.5 pl-0.5 py-0.5 sm:py-1.5 flex items-center justify-center gap-1 sm:gap-2.5 text-[#5A45D4] shadow-[0_2px_8px_rgba(0,0,0,0.02)] select-none shrink-0">
            <div className="w-[24px] h-[24px] sm:w-[34px] sm:h-[34px] rounded-full bg-[#836CE7] flex items-center justify-center text-white shadow-[0_1.5px_6px_rgba(131,108,231,0.2)] flex-shrink-0">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2.5} />
            </div>
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 font-bold font-sans text-[11px] sm:text-[16px] text-[#5A45D4] leading-none mb-px">
              {isSubmitted ? (
                <span>{questions.length}</span>
              ) : (
                <span>{Object.keys(selectedAnswers).length}/{questions.length}</span>
              )}
              <ChevronDown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#836CE7] opacity-80" strokeWidth={2.5} />
            </div>
          </div>

          {/* Orange capsule (Mockup match) */}
          <div className="bg-[#FFF6ED] border border-[#FFEADA] rounded-full pr-2.5 pl-0.5 py-0.5 sm:py-1.5 flex items-center justify-center gap-1 sm:gap-2.5 text-[#EA580C] shadow-[0_2px_8px_rgba(0,0,0,0.02)] select-none shrink-0">
            <div className="w-[24px] h-[24px] sm:w-[34px] sm:h-[34px] rounded-full bg-[#FB923C] flex items-center justify-center text-white shadow-[0_1.5px_6px_rgba(251,146,60,0.2)] flex-shrink-0">
              <Timer className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" strokeWidth={2.5} />
            </div>
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 font-bold font-mono text-[11px] sm:text-[16px] text-[#EA580C] leading-none mb-px">
              <span>{isSubmitted ? "00:00" : formatTime(timeLeft)}</span>
              <ChevronDown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#FB923C] opacity-80" strokeWidth={2.5} />
            </div>
          </div>

          {/* Magenta "শেষ করুন" Button (Mockup match) */}
          {!isSubmitted ? (
            <button 
              onClick={handleSubmit} 
              className="bg-gradient-to-r from-[#FF1E6C] to-[#E60050] hover:from-[#E60050] hover:to-[#CC0040] text-white rounded-full pl-2.5 sm:pl-3.5 pr-0.5 py-0.5 sm:py-1.5 flex items-center justify-center gap-1 sm:gap-2.5 font-bengali font-bold text-[11px] sm:text-[15px] shadow-[0_4px_12px_rgba(230,0,80,0.22)] transition-all transform active:scale-95 cursor-pointer border border-[#FF3D83]/10 shrink-0"
            >
              <span className="leading-none mb-px">শেষ করুন</span>
              <div className="w-[24px] h-[24px] sm:w-[30px] sm:h-[30px] rounded-full bg-white flex items-center justify-center text-[#FF1E6C] shadow-inner">
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={3} />
              </div>
            </button>
          ) : (
            <div className="bg-[#E2E8F0] text-slate-500 rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 font-bengali font-bold text-[11px] sm:text-sm shadow-sm select-none shrink-0 text-center flex items-center justify-center">
              মূল্যায়ন সম্পন্ন
            </div>
          )}
          
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

        {(!isSubmitted || !isEventExam) && (
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
        )}

        {!isSubmitted && (
        <div className="pt-8 pb-8">
           <Button onClick={() => handleSubmit()} className="w-full h-[60px] rounded-[20px] text-lg font-bold bg-[#1e293b] hover:bg-slate-800 text-white shadow-md">
             পরীক্ষা জমা দিন
           </Button>
        </div>
        )}


      </main>
    </div>
  );
}
