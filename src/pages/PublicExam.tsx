import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, BookOpen, User, CheckCircle2, AlertCircle, ArrowLeft, XCircle, ChevronDown, ChevronUp, Timer, FileText, Brain } from "lucide-react";
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
    } catch (e) {
      console.error("Failed to save result", e);
    }
  };

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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 font-bengali">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Sorry!</h2>
        <p className="text-slate-600 mb-6">{error || "This exam is currently closed."}</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-bengali pb-24">
        {/* Top Brand Header */}
        <div className="bg-white px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm">
           <div className="flex items-center">
             <button onClick={() => window.history.length > 2 ? navigate(-1) : navigate("/")} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0 mr-3">
               <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
             </button>
             <div className="font-bold text-2xl sm:text-[28px] tracking-tight flex items-center !leading-relaxed">
                <span className="text-[#1e293b]">শিক্ষা</span><span className="text-[#f59e0b]">ঙ্গন</span>
             </div>
           </div>
        </div>
        
        <main className="w-full max-w-md mx-auto p-4 sm:p-6 mt-6 sm:mt-12">
          <Card className="w-full border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:border sm:border-slate-100 rounded-[32px] sm:rounded-[40px] overflow-hidden bg-white">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-[#f1f5f9] text-[#0f172a] rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10" />
              </div>
              <h2 className="text-[22px] font-bold text-center text-[#1e293b] mb-4 leading-snug">{exam.title}</h2>
              <div className="flex items-center justify-center text-slate-500 gap-3 mb-10 text-[15px] font-medium">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Time: {exam.duration}m</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span>Total: {questions.length}</span>
              </div>
              
              <div className="space-y-6">
                {!userData?.fullName ? (
                  <div>
                    <label className="block text-[15px] font-semibold text-slate-700 mb-3 text-center">আপনার নাম প্রদান করুন</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input 
                        placeholder="আপনার নাম লিখুন..." 
                        className="pl-12 h-[56px] bg-white border-slate-200 rounded-2xl text-[16px] shadow-sm focus:border-slate-400 focus:ring-0"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                   <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                     <p className="text-slate-500 text-sm mb-1">পরীক্ষার্থী</p>
                     <p className="font-bold text-slate-800 text-lg">{userData.fullName}</p>
                   </div>
                )}
                <Button 
                  onClick={handleStart} 
                  className={`w-full h-[56px] text-lg rounded-[20px] shadow-md font-bold transition-colors text-white ${(!userData?.fullName && !studentName.trim()) ? 'bg-slate-300' : 'bg-[#1e293b] hover:bg-black'}`}
                  disabled={!userData?.fullName && !studentName.trim()}
                >
                  পরীক্ষা শুরু করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-bengali pb-24">
      {/* Top Brand Header */}
      <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 flex items-center border-b border-slate-100">
         <div className="font-bold text-2xl sm:text-[28px] tracking-tight flex items-center !leading-relaxed">
            <span className="text-[#1e293b]">শিক্ষা</span><span className="text-[#f59e0b]">ঙ্গন</span>
         </div>
      </div>

      {/* Sticky Action Bar */}
      <header className="bg-white border-y sticky top-0 z-20">
        <div className="max-w-[800px] mx-auto px-2 sm:px-4 h-14 sm:h-16 flex items-center justify-between overflow-x-auto no-scrollbar">
          
          <button onClick={() => navigate("/")} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0 mr-2">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
          </button>
          
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-nowrap">
             {isSubmitted ? (
               <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-green-50 text-green-700 font-semibold rounded-full text-[13px] sm:text-sm border border-green-200 shadow-sm whitespace-nowrap">
                 <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                 <span className="font-bengali font-bold hidden sm:inline">স্কোর:</span>
                 <span className="font-mono font-bold text-[14px] sm:text-[15px]">{score}/{questions.length}</span>
               </div>
             ) : (
               <>
                 <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-full text-[12px] sm:text-[13px] border border-indigo-100/50 shadow-sm whitespace-nowrap tracking-tight">
                   <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" />
                   <span className="font-bengali font-bold">বাকি:</span>
                   <span className="font-mono font-bold">{remainingQuestions}</span>
                 </div>
    
                 <div className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-orange-50 text-orange-700 font-bold rounded-full text-[13px] sm:text-sm border border-orange-100/50 shadow-sm font-mono whitespace-nowrap">
                   <Timer className="w-[14px] h-[14px] text-orange-500 animate-pulse" />
                   {formatTime(timeLeft)}
                 </div>
               </>
             )}
             
             <Button variant="default" className={`font-bengali font-bold rounded-full h-[32px] sm:h-[38px] px-3 sm:px-5 shadow-md text-[13px] sm:text-sm whitespace-nowrap ml-1 sm:ml-0 ${isSubmitted ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 text-white' : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'}`} onClick={() => isSubmitted ? navigate("/") : handleSubmit()}>
                {isSubmitted ? 'ফিরে যান' : 'শেষ করুন'}
             </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[800px] mx-auto px-2 sm:px-6 mb-8 mt-6">
        
        {isSubmitted && (
          <div className="mb-8 bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 shadow-sm text-center">
             <h2 className="text-xl font-bold text-slate-800 mb-6">{studentName}, Final Result</h2>
             
             <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8">
                <div className="text-center">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-[3px] sm:border-4 border-green-500 flex items-center justify-center mx-auto mb-2 bg-green-50">
                       <span className="text-xl sm:text-3xl font-bold text-green-600">{correctCount}</span>
                    </div>
                    <span className="text-xs sm:text-[15px] font-medium text-slate-600">Correct</span>
                </div>
                <div className="text-center">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-[3px] sm:border-4 border-red-500 flex items-center justify-center mx-auto mb-2 bg-red-50">
                       <span className="text-xl sm:text-3xl font-bold text-red-600">{wrongCount}</span>
                    </div>
                    <span className="text-xs sm:text-[15px] font-medium text-slate-600">Wrong</span>
                </div>
                <div className="text-center">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-[3px] sm:border-4 border-slate-300 flex items-center justify-center mx-auto mb-2 bg-slate-50">
                       <span className="text-xl sm:text-3xl font-bold text-slate-600">{skippedCount}</span>
                    </div>
                    <span className="text-xs sm:text-[15px] font-medium text-slate-600">Skipped</span>
                </div>
             </div>

             <div className="bg-slate-50 border border-slate-100 rounded-[20px] p-4 inline-flex items-center gap-3 flex-col sm:flex-row shadow-inner">
                <span className="text-slate-500 font-medium text-sm sm:text-base">Total Score:</span>
                <span className="text-2xl font-bold text-primary">{score} <span className="text-base text-slate-400">/ {questions.length}</span></span>
             </div>
          </div>
        )}

        <div className="bg-white sm:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-0 m-0">
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
                     {isQuestionSubmitted && (
                       <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconBg} shadow-sm`}>
                          {isSkipped ? <AlertCircle className="w-4 h-4" /> : isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                       </div>
                     )}
                     <span className="inline-block px-4 py-1.5 bg-[#1e293b] text-white rounded-full text-[13px] font-bold shadow-sm">
                       প্রশ্ন {idx + 1}
                     </span>
                   </div>
                </div>
                <h3 className="text-[18px] sm:text-[20px] leading-relaxed text-[#0f172a] font-medium mb-6 whitespace-pre-line">
                  {q.text}
                </h3>

                <div className="space-y-3">
                  {q.options.map((option: any) => {
                    const isSelected = selectedAnswers[idx] === option.id;
                    const isThisCorrect = isQuestionSubmitted && (correct === option.id);
                    
                    let optStyle = "";
                    if (isQuestionSubmitted) {
                       if (isThisCorrect) optStyle = "border-green-500 bg-green-100 shadow-[0_0_0_1px_#22c55e]";
                       else if (isSelected && !isThisCorrect) optStyle = "border-red-500 bg-red-100 shadow-[0_0_0_1px_#ef4444]";
                       else optStyle = "border-slate-200 bg-slate-50 opacity-60";
                    } else {
                       if (isSelected) optStyle = "border-[#1e293b] bg-slate-50 shadow-[0_0_0_1px_#1e293b]";
                       else optStyle = "border-slate-200 hover:border-slate-300 bg-white";
                    }

                    let badgeStyle = "";
                    if (isQuestionSubmitted) {
                       if (isThisCorrect) badgeStyle = "bg-green-600 text-white border-r-green-600";
                       else if (isSelected && !isThisCorrect) badgeStyle = "bg-red-600 text-white border-r-red-600";
                       else badgeStyle = "bg-slate-200 text-slate-500 border-slate-200";
                    } else {
                       if (isSelected) badgeStyle = "bg-[#1e293b] text-white border-r-[#1e293b]";
                       else badgeStyle = "bg-[#f8fafc] text-slate-800 border-slate-200";
                    }

                    let textColor = "";
                    if (isQuestionSubmitted) {
                       if (isThisCorrect) textColor = "text-green-900 font-bold";
                       else if (isSelected && !isThisCorrect) textColor = "text-red-900 font-bold";
                       else textColor = "text-slate-600 font-medium";
                    } else {
                       textColor = isSelected ? 'text-[#1e293b] font-bold' : 'text-[#0f172a] font-medium';
                    }

                    return (
                      <button
                        key={option.id}
                        onClick={() => { if (!isQuestionSubmitted) setSelectedAnswers({ ...selectedAnswers, [idx]: option.id }) }}
                        disabled={isQuestionSubmitted}
                        className={`w-full flex items-stretch rounded-[16px] border-[1.5px] overflow-hidden transition-all text-left ${optStyle}`}
                      >
                        <div className={`w-[52px] flex items-center justify-center text-[15px] font-bold shrink-0 border-r-[1.5px] transition-colors ${badgeStyle}`}>
                          {option.id}
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
                {isQuestionSubmitted && q.explanation && (
                  <div className="mt-6 p-5 sm:p-6 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl flex gap-3 sm:gap-4 shadow-sm">
                     <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-indigo-200/60 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
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

        {isSubmitted && leaderboard.length > 0 && (
          <div className="mt-8 mb-8 bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 sm:p-8">
             <h3 className="text-xl sm:text-2xl font-bold text-slate-800 font-bengali text-center mb-6 flex items-center justify-center gap-2">
               <span>🏆</span> লিডারবোর্ড (Top 10)
             </h3>
             <div className="space-y-3">
               {leaderboard.map((user, idx) => (
                 <div key={user.id} className={`flex items-center justify-between border rounded-2xl p-4 ${idx === 0 ? 'bg-amber-50/50 border-amber-100' : idx === 1 ? 'bg-slate-50 border-slate-200' : idx === 2 ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50 border-slate-100'}`}>
                   <div className="flex items-center gap-4 min-w-0">
                     <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-base ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-200 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-white border text-slate-500'}`}>
                       #{idx + 1}
                     </div>
                     <div className="min-w-0">
                       <div className="font-bold text-slate-800 text-base sm:text-lg truncate">{user.studentName}</div>
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
