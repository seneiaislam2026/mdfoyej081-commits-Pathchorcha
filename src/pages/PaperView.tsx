import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

import { managementMCQs } from "../data/managementMcqs";

export default function PaperView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const title = searchParams.get("title");
  const classGroup = searchParams.get("classGroup");
  const university = searchParams.get("university");
  const subjectParam = searchParams.get("subject");

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedAns, setRevealedAns] = useState<Record<string, boolean>>({});
  const [selectedAns, setSelectedAns] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, "questions"));
        if (title && title !== "Subject-wise Questions") {
          q = query(q, where("title", "==", title));
        } else if (classGroup && university) {
          q = query(q, where("classGroup", "==", classGroup));
          if (classGroup === "Admission") {
            q = query(q, where("university", "==", university));
          } else {
            q = query(q, where("class", "==", university));
          }
          if (subjectParam) {
            q = query(q, where("subject", "==", subjectParam));
          }
        } else if (subjectParam) {
          q = query(q, where("subject", "==", subjectParam));
        }
        
        const snap = await getDocs(q);
        let results: any[] = [];
        snap.forEach(doc => {
          const data = doc.data();
          if (title === "Subject-wise Questions" && data.title) return; // Skip questions that belong to a specific paper
          results.push({ id: doc.id, ...data });
        });

        // Insert local management MCQs if title matches (or all if we want to filter later)
        let localQ = managementMCQs as any[];
        if (title && title !== "Subject-wise Questions") {
          localQ = localQ.filter(m => m.title === title);
        } else if (classGroup && university) {
          localQ = localQ.filter(m => !m.classGroup || m.classGroup === classGroup || true);
          if (classGroup === "Admission") {
            localQ = localQ.filter(m => !m.university || m.university === university);
          } else {
            localQ = localQ.filter(m => !m.class || m.class === university);
          }
        }
        if (subjectParam) {
          localQ = localQ.filter(m => m.subject === subjectParam);
        }
        results = [...results, ...localQ];
        
        // Remove duplicates by question text
        const unique = new Map();
        results.forEach(r => {
          // Normalize correct option by checking multiple possible field names
          r.correctOption = r.correctOption || r.correct_answer || r.correctAnswer || r.answer;
          
          if (unique.has(r.text)) {
            const existing = unique.get(r.text);
            // Keep the one that has an explanation, or correct option
            if ((r.explanation && !existing.explanation) || (r.correctOption && !existing.correctOption)) {
              unique.set(r.text, r);
            }
          } else {
            unique.set(r.text, r);
          }
        });
        const deduplicatedResults = Array.from(unique.values());
        
        // Sort by question_no if available
        deduplicatedResults.sort((a, b) => (a.question_no || 0) - (b.question_no || 0));
        setQuestions(deduplicatedResults);
      } catch (err) {
        console.error("Error fetching paper questions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [title, classGroup, university]);

  // Group by subjects
  const subjects = questions.reduce((acc, q) => {
    const sub = q.subject || "সাধারণ জ্ঞান";
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(q);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4 bg-white p-4 rounded-[24px] shadow-sm border border-slate-100">
        <button 
          onClick={() => navigate(-1)}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bengali font-bold text-slate-800">
            {title === "Subject-wise Questions" ? `${subjectParam || "বিষয়ভিত্তিক"} MCQ` : (title || "প্রশ্নমালা")}
          </h1>
          <p className="text-slate-500 text-sm font-bengali">{questions.length} টি প্রশ্ন</p>
        </div>
      </div>

      <div className="space-y-12">
        {Object.entries<any[]>(subjects).map(([sub, qs]) => (
          <div key={sub} className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bengali font-bold text-primary mb-8 pb-4 border-b border-slate-100 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-16 after:bg-primary">
              {sub}
            </h2>
            
            <div className="space-y-12">
              {qs.map((q, idx) => (
                <div key={`${q.id || "q"}-${idx}`} className="relative">
                  {/* Decorative line for options list */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary text-white px-2.5 py-0.5 rounded-full text-xs font-bold font-bengali">
                        প্রশ্ন {q.question_no || idx + 1}
                      </span>
                    </div>
                    <h4 className="text-xl md:text-[22px] font-bold text-slate-800 font-bengali leading-snug">
                      {q.text}
                    </h4>
                  </div>
                  
                  <div className="grid gap-3 pl-2 md:pl-4">
                    {(Array.isArray(q.options) ? q.options : Object.keys(q.options || {}).map(k => ({ id: k, label: q.options[k], text: q.options[k] }))).map((opt: any, optIdx: number) => {
                      const isSelected = selectedAns[q.id || q.text] === opt.id;
                      const isCorrect = q.correctOption === opt.id;
                      const isRevealed = revealedAns[q.id || q.text] || selectedAns[q.id || q.text];

                      let optionClass = 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 cursor-pointer';
                      let letterClass = 'bg-slate-100 text-slate-700';

                      if (isRevealed) {
                        optionClass = 'bg-white border-slate-200 text-slate-400 opacity-60 cursor-default';
                        letterClass = 'bg-slate-100 text-slate-400';
                        if (isCorrect) {
                          optionClass = 'bg-[#f2fbf5] border-[#4bb063] text-[#2c7a3f] shadow-sm cursor-default';
                          letterClass = 'bg-[#4bb063] text-white';
                        } else if (isSelected) {
                          optionClass = 'bg-red-50 border-red-500 text-red-700 shadow-sm cursor-default';
                          letterClass = 'bg-red-500 text-white';
                        }
                      }

                      // Handle both 'A'/'B' and 'ক'/'খ' formats
                      let displayLetter = opt.id;
                      if (opt.id === 'A') displayLetter = 'ক';
                      else if (opt.id === 'B') displayLetter = 'খ';
                      else if (opt.id === 'C') displayLetter = 'গ';
                      else if (opt.id === 'D') displayLetter = 'ঘ';

                      return (
                        <div 
                          key={`${q.id || q.text}-${optIdx}`} 
                          onClick={() => {
                            if (!isRevealed) {
                              setSelectedAns(prev => ({ ...prev, [q.id || q.text]: opt.id }));
                              setRevealedAns(prev => ({ ...prev, [q.id || q.text]: true }));
                            }
                          }}
                          className={`flex flex-row items-center rounded-[14px] transition-all min-h-[44px] md:min-h-[48px] relative border-[1.5px] ${optionClass}`}
                        >
                          <div className={`w-10 md:w-11 h-full flex-shrink-0 flex items-center justify-center font-bold text-[13px] md:text-sm font-bengali border-r border-[rgba(0,0,0,0.05)] rounded-l-[12.5px] transition-colors ${letterClass}`}>
                            {displayLetter}
                          </div>
                          <div className="font-bengali font-medium text-[15px] px-3 py-2 flex-1 relative">
                            {opt.label || opt.text}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="mt-4 pl-2 md:pl-4">
                    <button 
                      onClick={() => setRevealedAns(prev => ({ ...prev, [q.id || q.text]: !prev[q.id || q.text] }))}
                      className="text-sm font-bengali text-primary font-bold hover:underline"
                    >
                      {revealedAns[q.id || q.text] || selectedAns[q.id || q.text] ? "উত্তর লুকান" : "উত্তর দেখুন"}
                    </button>
                    
                    {(revealedAns[q.id || q.text] || selectedAns[q.id || q.text]) && (
                      <div className="mt-3 bg-slate-50 border border-slate-100 rounded-2xl p-4 md:p-5">
                        <p className="font-bengali text-slate-800 mb-2 font-medium">
                          <span className="font-bold text-green-700">সঠিক উত্তর:</span> {
                            q.correctOption === 'A' ? 'ক' : 
                            q.correctOption === 'B' ? 'খ' : 
                            q.correctOption === 'C' ? 'গ' : 
                            q.correctOption === 'D' ? 'ঘ' : q.correctOption
                          }
                        </p>
                        {q.explanation && (
                          <div className="pt-3 mt-3 border-t border-slate-200">
                             <p className="text-sm font-bengali text-slate-600 leading-relaxed flex items-start gap-2">
                               <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                               <span><span className="font-bold text-slate-700">ব্যাখ্যা:</span> {q.explanation}</span>
                             </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
