import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

import { managementMCQs } from "../data/managementMcqs";
import { hscIctCQ } from "../data/hscIctCqData";

export default function PaperView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const title = searchParams.get("title");
  const classGroup = searchParams.get("classGroup");
  const university = searchParams.get("university");
  const subjectParam = searchParams.get("subject");
  const format = searchParams.get("format");

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
          
          // Subject filter
          if (subjectParam && data.subject && data.subject.toLowerCase() !== subjectParam.toLowerCase()) return;

          let is_cq = data.is_cq === true;
          let is_k_vandar = data.is_k_vandar === true;
          let is_kh_vandar = data.is_kh_vandar === true;
          
          if (format) {
            if (format === "MCQ" && is_cq) return;
            if (format === "CQ" && (!is_cq || is_k_vandar || is_kh_vandar)) return;
            if (format === "KaBhandar" && !is_k_vandar) return;
            if (format === "KhaBhandar" && !is_kh_vandar) return;
          }

          results.push({ id: doc.id, ...data });
        });

        // Insert local questions
        let localQ = [...(managementMCQs as any[]), ...(hscIctCQ as any[])];
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
        
        if (format) {
          localQ = localQ.filter(data => {
            let is_cq = data.is_cq === true;
            let is_k_vandar = data.is_k_vandar === true;
            let is_kh_vandar = data.is_kh_vandar === true;
            
            if (format === "MCQ" && is_cq) return false;
            if (format === "CQ" && (!is_cq || is_k_vandar || is_kh_vandar)) return false;
            if (format === "KaBhandar" && !is_k_vandar) return false;
            if (format === "KhaBhandar" && !is_kh_vandar) return false;
            return true;
          });
        }
        
        results = [...results, ...localQ];
        
        // Remove duplicates by question text
        const unique = new Map();
        results.forEach(r => {
          // Normalize correct option by checking multiple possible field names
          r.correctOption = r.correctOption || r.correct_answer || r.correctAnswer || r.answer;
          
          const key = r.text || r.question || r.id;
          if (unique.has(key)) {
            const existing = unique.get(key);
            // Keep the one that has an explanation, or correct option
            if ((r.explanation && !existing.explanation) || (r.correctOption && !existing.correctOption)) {
              unique.set(key, r);
            }
          } else {
            unique.set(key, r);
          }
        });
        const deduplicatedResults = Array.from(unique.values());
        
        // Sort by question_no if available, fallback to createdAt timestamp
        deduplicatedResults.sort((a, b) => {
          const aNo = Number(a.question_no);
          const bNo = Number(b.question_no);
          if (aNo && bNo && aNo !== bNo) return aNo - bNo;
          
          if (a.createdAt && b.createdAt) {
             const tA = typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : a.createdAt;
             const tB = typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : b.createdAt;
             return tA - tB;
          }
          return 0;
        });
        setQuestions(deduplicatedResults);
      } catch (err) {
        console.error("Error fetching paper questions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [title, classGroup, university, subjectParam, format]);

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
    <div className="min-h-screen bg-background font-sans pb-24">
      {/* Header */}
      <div className="px-4 pt-4 md:px-8 md:pt-8 max-w-4xl mx-auto">
        <div className="bg-card border border-slate-200 shadow-sm px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between rounded-3xl">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 flex items-center justify-center rounded-full transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
          </button>
          <div className="text-center w-full px-4">
            <h1 className="font-bengali font-bold text-lg sm:text-xl text-foreground line-clamp-1">
              {title === "Subject-wise Questions" ? `${subjectParam || "বিষয়ভিত্তিক"} MCQ` : (title || "প্রশ্নমালা")}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-bengali mt-0.5">{questions.length} টি প্রশ্ন</p>
          </div>
          <div className="w-10 opacity-0 pointer-events-none"></div>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
        {(() => {
          let globalQIndex = 0;
          return Object.entries<any[]>(subjects).map(([sub, qs]) => (
            <div key={sub} className="bg-card rounded-2xl p-5 md:p-8 shadow-sm border border-slate-200/60">
              <h2 className="text-xl font-bengali font-bold text-foreground mb-6 pb-3 border-b border-slate-100 inline-block px-1">
                {sub}
              </h2>
              
              <div className="space-y-10">
                {qs.map((q) => {
                  globalQIndex++;
                  const qSerial = q.question_no || globalQIndex;
                  return (
                    <div key={`${q.id || "q"}-${globalQIndex}`} className="relative border-b border-slate-50 pb-8 last:border-0 last:pb-0">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-slate-100 text-muted-foreground px-2 py-0.5 rounded text-sm font-bold font-bengali">
                        প্রশ্ন {qSerial}
                      </span>
                    </div>
                    <h4 className="text-[18px] md:text-[20px] font-bold text-foreground font-bengali leading-snug whitespace-pre-wrap">
                      {q.text || q.question}
                    </h4>
                  </div>
                  
                  {(q.is_k_vandar || q.is_kh_vandar) ? (
                    <div className="pl-2 md:pl-4 mt-4">
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                        <button 
                          onClick={() => setRevealedAns(prev => ({ ...prev, [q.id || q.text]: !prev[q.id || q.text] }))}
                          className="text-sm font-bengali text-emerald-700 font-bold hover:underline mb-2 flex items-center gap-1.5"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          {revealedAns[q.id || q.text] ? "উত্তর লুকান" : "উত্তর দেখুন"}
                        </button>
                        {revealedAns[q.id || q.text] && (
                          <div className="mt-3 pt-3 border-t border-emerald-100/50">
                           <p className="text-[15px] font-bengali text-slate-700 leading-relaxed whitespace-pre-wrap">
                             {q.answer || q.details || "কোনো উত্তর দেওয়া নেই"}
                           </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : q.is_cq ? (
                    <div className="grid gap-4 pl-2 md:pl-4 mt-4">
                      {['ক', 'খ', 'গ', 'ঘ'].map((key) => {
                        const ansData = q.answers?.[key];
                        if (!ansData) return null;
                        const isRevealed = revealedAns[`${q.id || q.text}-${key}`];
                        return (
                          <div key={key} className="bg-muted border border-slate-200 rounded-xl p-4">
                            <h5 className="font-bengali font-bold text-foreground text-[16px] mb-2">
                              {key}. {ansData.question}
                            </h5>
                            <button 
                              onClick={() => setRevealedAns(prev => ({ ...prev, [`${q.id || q.text}-${key}`]: !prev[`${q.id || q.text}-${key}`] }))}
                              className="text-sm font-bengali text-primary font-bold hover:underline mb-2 flex items-center gap-1.5"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                              {isRevealed ? "উত্তর লুকান" : "উত্তর দেখুন"}
                            </button>
                            {isRevealed && (
                              <div className="mt-3 bg-card border border-slate-100 rounded-lg p-3.5">
                               <p className="text-[15px] font-bengali text-slate-700 leading-relaxed whitespace-pre-wrap">
                                 {ansData.answer}
                               </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-3 pl-2 md:pl-4">
                        {(Array.isArray(q.options) ? q.options : Object.keys(q.options || {}).map(k => ({ id: k, label: q.options[k], text: q.options[k] }))).map((opt: any, optIdx: number) => {
                          const optionId = opt.id || String(optIdx);
                          const isSelected = selectedAns[q.id || q.text] === optionId;
                          const isCorrect = String(q.correctOption) === optionId || String(q.correctOption) === String(optIdx);
                          const isRevealed = revealedAns[q.id || q.text] || selectedAns[q.id || q.text];

                          let optionClass = 'bg-card border-slate-200 text-foreground hover:border-slate-300 cursor-pointer';
                          let letterClass = 'bg-slate-100 text-slate-700';

                          if (isRevealed) {
                            optionClass = 'bg-card border-slate-200 text-slate-400 opacity-60 cursor-default';
                            letterClass = 'bg-slate-100 text-slate-400';
                            if (isCorrect) {
                              optionClass = 'bg-[#f2fbf5] border-[#4bb063] text-[#2c7a3f] shadow-sm cursor-default';
                              letterClass = 'bg-[#4bb063] text-white';
                            } else if (isSelected) {
                              optionClass = 'bg-red-50 border-red-500 text-red-700 shadow-sm cursor-default';
                              letterClass = 'bg-red-500 text-white';
                            }
                          }

                          let displayLetter = opt.id;
                          // Use index-based Bengali letters only if no display letter exists or if it's explicitly '1', '2', '3', '4' etc and not English
                          const isEnglish = String(q.subject || title || "").toLowerCase().includes("english");
                          if (!displayLetter || (['1','2','3','4'].includes(displayLetter))) {
                            if (isEnglish) {
                              const engLetters = ['A', 'B', 'C', 'D', 'E'];
                              displayLetter = engLetters[optIdx] || String(optIdx + 1);
                            } else {
                              if (optIdx === 0) displayLetter = 'ক';
                              else if (optIdx === 1) displayLetter = 'খ';
                              else if (optIdx === 2) displayLetter = 'গ';
                              else if (optIdx === 3) displayLetter = 'ঘ';
                              else if (optIdx === 4) displayLetter = 'ঙ';
                              else displayLetter = String(optIdx + 1);
                            }
                          } else if (!isEnglish && (displayLetter === 'A' || displayLetter === 'B' || displayLetter === 'C' || displayLetter === 'D')) {
                              if (optIdx === 0) displayLetter = 'ক';
                              else if (optIdx === 1) displayLetter = 'খ';
                              else if (optIdx === 2) displayLetter = 'গ';
                              else if (optIdx === 3) displayLetter = 'ঘ';
                              else if (optIdx === 4) displayLetter = 'ঙ';
                          }

                          return (
                            <div 
                              key={`${q.id || q.text}-${optIdx}`} 
                              onClick={() => {
                                if (!isRevealed) {
                                  setSelectedAns(prev => ({ ...prev, [q.id || q.text]: optionId }));
                                  setRevealedAns(prev => ({ ...prev, [q.id || q.text]: true }));
                                }
                              }}
                              className={`flex flex-row items-center rounded-[14px] transition-all min-h-[44px] md:min-h-[48px] relative border-[1.5px] ${optionClass}`}
                            >
                              <div className={`w-10 md:w-11 h-full flex-shrink-0 flex items-center justify-center font-bold text-[13px] md:text-sm font-bengali border-r border-[rgba(0,0,0,0.05)] rounded-l-[12.5px] transition-colors ${letterClass}`}>
                                {displayLetter}
                              </div>
                              <div className="font-bengali font-medium text-[15px] px-3 py-2 flex-1 relative whitespace-pre-wrap">
                                {opt.label || opt.text || opt.value || (typeof opt === 'string' ? opt : "")}
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
                          <div className="mt-3 bg-muted border border-slate-100 rounded-2xl p-4 md:p-5">
                            <p className="font-bengali text-foreground mb-2 font-medium">
                              <span className="font-bold text-green-700">সঠিক উত্তর:</span> {
                                q.correctOption === 'A' ? 'ক' : 
                                q.correctOption === 'B' ? 'খ' : 
                                q.correctOption === 'C' ? 'গ' : 
                                q.correctOption === 'D' ? 'ঘ' : q.correctOption
                              }
                            </p>
                            {q.explanation && (
                              <div className="pt-3 mt-3 border-t border-slate-200">
                                 <p className="text-sm font-bengali text-muted-foreground leading-relaxed flex items-start gap-2">
                                   <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                   <span><span className="font-bold text-slate-700">ব্যাখ্যা:</span> {q.explanation}</span>
                                 </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  </div>
                );
              })}
            </div>
          </div>
        ))})()}
      </div>
    </div>
  );
}
