import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, BookOpen, User, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

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
  
  const [exam, setExam] = useState<PublicExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [studentName, setStudentName] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Mock questions for public exams if not dynamically fetched
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const fetchExam = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "public_exams", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as PublicExamData;
          setExam({ id: docSnap.id, ...data });
          setTimeLeft(data.duration * 60);
          
          if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
            setQuestions(data.questions);
          } else {
            // Generate 10 mock questions for this public test if no real questions are available
            const mockQ = Array.from({ length: 10 }).map((_, i) => ({
              id: `q${i+1}`,
              text: `${data.title} - প্রশ্ন তালিকা ${i+1}. নিচের কোনটি সঠিক?`,
              options: [
                { id: "A", label: "ক" },
                { id: "B", label: "খ" },
                { id: "C", label: "গ" },
                { id: "D", label: "ঘ" }
              ],
              correctOption: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)]
            }));
            setQuestions(mockQ);
          }
        } else {
          setError("এই পরীক্ষার লিংকটি সঠিক নয় অথবা এক্সপায়ার হয়ে গেছে।");
        }
      } catch (e) {
        console.error(e);
        setError("Error fetching exam details.");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

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

  const handleStart = () => {
    if (!studentName.trim()) {
      alert("দয়াকরে আপনার নাম লিখুন।");
      return;
    }
    setIsStarted(true);
  };

  const calculateScore = () => {
    let s = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctId || selectedAnswers[idx] === q.correctOption) {
        s++;
      }
    });
    return s;
  };

  const handleSubmit = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setIsSubmitted(true);
    
    try {
      await addDoc(collection(db, "public_exam_results"), {
        examId: id,
        studentName,
        score: finalScore,
        total: questions.length,
        submittedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Failed to save result", e);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bengali">লোডিং...</div>;
  }

  if (error || !exam || !exam.active) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 font-bengali">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">দুঃখিত!</h2>
        <p className="text-slate-600 mb-6">{error || "এই পরীক্ষাটি বর্তমানে বন্ধ আছে।"}</p>
        <Button onClick={() => navigate("/")}>হোম পেজে ফিরে যান</Button>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-bengali">
        <Card className="w-full max-w-md border-0 shadow-lg rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">{exam.title}</h2>
            <div className="flex items-center justify-center text-slate-500 gap-2 mb-8">
              <Clock className="w-4 h-4" />
              <span>সময়: {exam.duration} মিনিট</span>
              <span className="mx-2">•</span>
              <span>পূর্ণমান: {questions.length}</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">আপনার নাম দিন</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    placeholder="ইংরেজিতে বা বাংলায় নাম লিখুন" 
                    className="pl-10 h-12 bg-slate-50 border-slate-200"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleStart} className="w-full h-12 text-lg disabled:opacity-50" disabled={!studentName.trim()}>
                পরীক্ষা শুরু করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-bengali">
        <Card className="w-full max-w-md border-0 shadow-lg rounded-3xl overflow-hidden text-center">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">অভিনন্দন, {studentName}!</h2>
            <p className="text-slate-600 mb-6">আপনার পরীক্ষা সম্পন্ন হয়েছে।</p>
            
            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">আপনার প্রাপ্ত নম্বর</p>
              <h3 className="text-4xl font-bold text-primary">
                {score} <span className="text-xl text-slate-400">/ {questions.length}</span>
              </h3>
            </div>
            
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full h-12">
              আবার চেষ্টা করুন
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-bengali">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-slate-800 hidden sm:block">{exam.title}</h1>
            <p className="text-xs text-slate-500">পরীক্ষার্থী: {studentName}</p>
          </div>
          
          <div className="bg-orange-50 text-orange-600 font-mono font-bold px-4 py-2 rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 pb-24">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-500">প্রশ্ন {currentQuestion + 1} / {questions.length}</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all rounded-full" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Area */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100"
        >
          <h3 className="text-xl leading-relaxed text-slate-800 mb-8 font-medium">
            {currentQuestion + 1}. {currentQ.text}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((option: any) => {
              const isSelected = selectedAnswers[currentQuestion] === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: option.id })}
                  className={`w-full flex items-center p-4 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-slate-100 hover:border-slate-200 bg-white"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mr-4 shrink-0 transition-colors ${
                    isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {option.id}
                  </div>
                  <span className="text-left font-medium text-slate-700">{option.label || option.text}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20 shadow-lg">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12"
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(prev => prev - 1)}
          >
            পূর্ববর্তী
          </Button>
          
          {currentQuestion === questions.length - 1 ? (
            <Button 
              className="flex-1 h-12 bg-green-600 hover:bg-green-700"
              onClick={handleSubmit}
            >
              সাবমিট করুন
            </Button>
          ) : (
            <Button 
              className="flex-1 h-12"
              onClick={() => setCurrentQuestion(prev => prev + 1)}
            >
              পরবর্তী
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
