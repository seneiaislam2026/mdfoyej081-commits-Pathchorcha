import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Check, AlertCircle, HelpCircle } from 'lucide-react';

export default function BoardQuestionsCreator() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [uploadMode, setUploadMode] = useState<"manual" | "bulk">("manual");
  const [bulkJson, setBulkJson] = useState("");

  const BOARDS = ["ঢাকা বোর্ড", "রাজশাহী বোর্ড", "যশোর বোর্ড", "কুমিল্লা বোর্ড", "চট্টগ্রাম বোর্ড", "সিলেট বোর্ড", "বরিশাল বোর্ড", "দিনাজপুর বোর্ড", "ময়মনসিংহ বোর্ড"];
  const YEARS = Array.from({ length: 11 }, (_, i) => (new Date().getFullYear() - i).toString());
  const SUBJECTS = [
    "Bangla 1st Paper", "Bangla 2nd Paper", 
    "English 1st Paper", "English 2nd Paper", 
    "Physics 1st Paper", "Physics 2nd Paper",
    "Chemistry 1st Paper", "Chemistry 2nd Paper",
    "Higher Math 1st Paper", "Higher Math 2nd Paper",
    "Biology 1st Paper", "Biology 2nd Paper",
    "ICT", "Accounting 1st Paper", "Accounting 2nd Paper", 
    "Management 1st Paper", "Management 2nd Paper"
  ];
  const FORMATS = ["MCQ", "CQ", "KaBhandar", "KhaBhandar"];

  const [formData, setFormData] = useState({
    boardName: BOARDS[0],
    boardYear: YEARS[0],
    subject: SUBJECTS[4], // Physics 1st Paper
    format: FORMATS[0],
    university: ""
  });

  const [targets, setTargets] = useState({
    hsc: true,
    class11: false,
    class12: false,
    admission: false,
    ssc: false
  });

  const handleTargetChange = (key: keyof typeof targets) => {
    setTargets({
      ...targets,
      [key]: !targets[key]
    });
  };

  const [questions, setQuestions] = useState([
    {
      text: "",
      options: [{ id: "A", label: "" }, { id: "B", label: "" }, { id: "C", label: "" }, { id: "D", label: "" }],
      correctOption: "A",
      explanation: "",
    }
  ]);

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQs = [...questions];
    updatedQs[index] = { ...updatedQs[index], [field]: value };
    setQuestions(updatedQs);
  };

  const handleOptionChange = (qIndex: number, optId: string, value: string) => {
    const updatedQs = [...questions];
    const optIndex = updatedQs[qIndex].options.findIndex(o => o.id === optId);
    if (optIndex !== -1) {
      updatedQs[qIndex].options[optIndex].label = value;
    }
    setQuestions(updatedQs);
  };

  const addQuestionField = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: [{ id: "A", label: "" }, { id: "B", label: "" }, { id: "C", label: "" }, { id: "D", label: "" }],
        correctOption: "A",
        explanation: "",
      }
    ]);
  };

  const removeQuestionField = (index: number) => {
    const updatedQs = questions.filter((_, i) => i !== index);
    setQuestions(updatedQs);
  };

  const submitQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      let questionsToSubmit = [];

      if (uploadMode === "bulk") {
        if (!bulkJson.trim()) throw new Error("Please paste JSON array of questions.");
        try {
          const parsed = JSON.parse(bulkJson);
          if (!Array.isArray(parsed)) throw new Error("JSON must be an array of questions.");
          questionsToSubmit = parsed;
        } catch (jsonErr: any) {
          throw new Error("Invalid JSON format: " + jsonErr.message);
        }
      } else {
        // Validate manual
        for (const q of questions) {
          if (!q.text.trim()) throw new Error("Please fill in all question text fields.");
          for (const opt of q.options) {
            if (!opt.label.trim()) throw new Error("Please fill in all option fields.");
          }
        }
        questionsToSubmit = questions;
      }

      const activeTargets = Object.entries(targets).filter(([_, val]) => val).map(([key]) => key);
      if (activeTargets.length === 0) {
        throw new Error("অনুগ্রহ করে অন্তত একটি টার্গেট ক্যাটাগরি সিলেক্ট করুন।");
      }

      const targetMappings: { classGroup: string; class: string; university?: string; label: string }[] = [];
      if (targets.hsc) targetMappings.push({ classGroup: "HSC", class: "HSC", label: "এইচএসসি" });
      if (targets.class11) targetMappings.push({ classGroup: "HSC", class: "Class 11", label: "একাদশ" });
      if (targets.class12) targetMappings.push({ classGroup: "HSC", class: "Class 12", label: "দ্বাদশ" });
      if (targets.ssc) targetMappings.push({ classGroup: "SSC", class: "Class 10", label: "এসএসসি" });
      if (targets.admission) targetMappings.push({ classGroup: "Admission", class: "Admission", university: formData.university, label: "এডমিশন" });

      const classLevelMap: Record<string, string> = {
        "HSC": "এইচএসসি (একাদশ-দ্বাদশ)",
        "Class 11": "এইচএসসি (একাদশ শ্রেনী)",
        "Class 12": "এইচএসসি (দ্বাদশ শ্রেনী)",
        "Class 10": "১০ম শ্রেনী",
        "Admission": "এইচএসসি (একাদশ-দ্বাদশ)"
      };

      const promises: Promise<any>[] = [];

      questionsToSubmit.forEach((q, index) => {
        let is_cq = formData.format === "CQ";
        let is_k_vandar = formData.format === "KaBhandar";
        let is_kh_vandar = formData.format === "KhaBhandar";

        // Super robust text parsing
        const qText = q.text || q.question || q.q || q.questionText || q.title || "";

        // Super robust options parsing
        let formattedOptions: { id: string; label: string }[] = [];
        if (!is_cq && !is_k_vandar && !is_kh_vandar) {
          if (q.options) {
            if (Array.isArray(q.options)) {
              if (q.options.length > 0) {
                if (typeof q.options[0] === 'string') {
                  // Array of strings
                  const ids = ['A', 'B', 'C', 'D', 'E'];
                  formattedOptions = q.options.map((optLabel: string, idx: number) => ({
                    id: ids[idx] || String(idx + 1),
                    label: optLabel
                  }));
                } else if (typeof q.options[0] === 'object' && q.options[0] !== null) {
                  // Array of objects
                  formattedOptions = q.options.map((opt: any, idx: number) => {
                    const id = opt.id || opt.key || String(idx + 1);
                    const label = opt.label || opt.text || opt.value || opt.option || "";
                    return { id, label };
                  });
                }
              }
            } else if (typeof q.options === 'object' && q.options !== null) {
              // Map/Object of options
              formattedOptions = Object.keys(q.options).map((key) => ({
                id: key,
                label: q.options[key]
              }));
            }
          } else {
            // Check for individual option keys in the item
            const optA = q.optionA || q.option_a || q.a || q.ক || q.option1 || q["১"] || "";
            const optB = q.optionB || q.option_b || q.b || q.খ || q.option2 || q["২"] || "";
            const optC = q.optionC || q.option_c || q.c || q.গ || q.option3 || q["৩"] || "";
            const optD = q.optionD || q.option_d || q.d || q.ঘ || q.option4 || q["৪"] || "";
            
            if (optA || optB || optC || optD) {
              formattedOptions = [
                { id: "A", label: String(optA).trim() },
                { id: "B", label: String(optB).trim() },
                { id: "C", label: String(optC).trim() },
                { id: "D", label: String(optD).trim() }
              ];
            }
          }
        }

        // If options are still empty for MCQ, default to A, B, C, D placeholders
        if (!is_cq && !is_k_vandar && !is_kh_vandar && formattedOptions.length === 0) {
          formattedOptions = [
            { id: "A", label: "" },
            { id: "B", label: "" },
            { id: "C", label: "" },
            { id: "D", label: "" }
          ];
        }

        // Super robust correctOption parsing
        let correctOption = "A";
        const rawCorrect = q.correctOption !== undefined ? q.correctOption : (q.correct_answer || q.correctAnswer || q.answer || q.correct || "A");
        
        if (rawCorrect !== undefined && rawCorrect !== null) {
          if (typeof rawCorrect === 'number') {
            // It's an index
            if (rawCorrect >= 0 && rawCorrect < formattedOptions.length) {
              correctOption = formattedOptions[rawCorrect].id;
            } else {
              correctOption = String(rawCorrect);
            }
          } else if (typeof rawCorrect === 'string') {
            const trimmed = rawCorrect.trim();
            // Check if it matches an option ID directly
            if (formattedOptions.some(o => o.id === trimmed)) {
              correctOption = trimmed;
            } else {
              // Check if it matches the label of an option
              const matched = formattedOptions.find(o => o.label === trimmed);
              if (matched) {
                correctOption = matched.id;
              } else {
                correctOption = trimmed;
              }
            }
          }
        }

        // Handle correctOptionIndex if provided explicitly
        const idxVal = q.correctOptionIndex !== undefined ? q.correctOptionIndex : q.correct_option_index;
        if (idxVal !== undefined && typeof idxVal === 'number') {
          if (idxVal >= 0 && idxVal < formattedOptions.length) {
            correctOption = formattedOptions[idxVal].id;
          }
        }

        // Retrieve option label text fields for compatibility
        const optionA = formattedOptions.find(o => o.id === 'A' || o.id === 'ক')?.label || "";
        const optionB = formattedOptions.find(o => o.id === 'B' || o.id === 'খ')?.label || "";
        const optionC = formattedOptions.find(o => o.id === 'C' || o.id === 'গ')?.label || "";
        const optionD = formattedOptions.find(o => o.id === 'D' || o.id === 'ঘ')?.label || "";

        // Add to batch for each targeted category
        for (const mapping of targetMappings) {
          const classLevelVal = classLevelMap[mapping.class] || "এইচএসসি (একাদশ-দ্বাদশ)";
          
          let uniName = "";
          if (mapping.university) {
            if (mapping.university === "DU") uniName = "ঢাকা বিশ্ববিদ্যালয়";
            else if (mapping.university === "RU") uniName = "রাজশাহী বিশ্ববিদ্যালয়";
            else if (mapping.university === "JU") uniName = "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়";
            else if (mapping.university === "CU") uniName = "চট্টগ্রাম বিশ্ববিদ্যালয়";
            else if (mapping.university === "GST") uniName = "গুচ্ছ (GST)";
            else uniName = mapping.university;
          }

          promises.push(
            addDoc(collection(db, "questions"), {
              text: qText,
              options: is_cq ? [] : formattedOptions,
              optionA: is_cq ? "" : optionA,
              optionB: is_cq ? "" : optionB,
              optionC: is_cq ? "" : optionC,
              optionD: is_cq ? "" : optionD,
              correctOption: is_cq ? "" : correctOption,
              explanation: q.explanation || q.details || "",
              subject: formData.subject,
              is_cq: is_cq,
              is_k_vandar: is_k_vandar,
              is_kh_vandar: is_kh_vandar,
              isBoardQuestion: true,
              boardName: formData.boardName,
              boardYear: formData.boardYear,
              classLevel: classLevelVal,
              classGroup: mapping.classGroup,
              class: mapping.class,
              university: uniName,
              title: `${formData.boardName} ${formData.boardYear}`, 
              question_no: index + 1,
              createdAt: serverTimestamp()
            })
          );
        }
      });

      await Promise.all(promises);
      
      setSuccess(true);
      if (uploadMode === "manual") {
        setQuestions([
          {
            text: "",
            options: [{ id: "A", label: "" }, { id: "B", label: "" }, { id: "C", label: "" }, { id: "D", label: "" }],
            correctOption: "A",
            explanation: "",
          }
        ]);
      } else {
        setBulkJson("");
      }
      
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to add questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-indigo-100 shadow-sm rounded-2xl overflow-hidden mt-4">
        <CardHeader className="bg-indigo-50/50 border-b border-indigo-50 pb-4 p-6">
          <CardTitle className="font-bengali text-indigo-900">বোর্ড প্রশ্ন যোগ করুন</CardTitle>
          <CardDescription className="font-bengali text-indigo-600/80">শ্রেণী, বিষয় ও বোর্ড সিলেক্ট করে সাল অনুযায়ী প্রশ্ন যুক্ত করুন</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={submitQuestions} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-muted rounded-xl border border-slate-100">
              <div>
                <label className="block text-sm font-bold font-bengali mb-1.5 text-slate-700">বিষয়</label>
                <select className="flex h-10 w-full rounded-lg border border-slate-200 bg-card px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20" 
                  value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                   {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold font-bengali mb-1.5 text-slate-700">ফরম্যাট</label>
                <select className="flex h-10 w-full rounded-lg border border-slate-200 bg-card px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20" 
                  value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}>
                   {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold font-bengali mb-1.5 text-slate-700">বোর্ড</label>
                <select className="flex h-10 w-full rounded-lg border border-slate-200 bg-card px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 font-bengali" 
                  value={formData.boardName} onChange={e => setFormData({...formData, boardName: e.target.value})}>
                   {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold font-bengali mb-1.5 text-slate-700">সাল</label>
                <select className="flex h-10 w-full rounded-lg border border-slate-200 bg-card px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20" 
                  value={formData.boardYear} onChange={e => setFormData({...formData, boardYear: e.target.value})}>
                   {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3 p-5 bg-indigo-50/20 rounded-xl border border-indigo-150/30">
              <label className="block text-sm font-bold font-bengali text-indigo-950">টার্গেট ক্যাটাগরি (একসাথে একাধিক সিলেক্ট করতে পারবেন)</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-bengali text-sm font-medium text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={targets.hsc} 
                    onChange={() => handleTargetChange("hsc")}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  এইচএসসি (HSC)
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bengali text-sm font-medium text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={targets.class11} 
                    onChange={() => handleTargetChange("class11")}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  একাদশ শ্রেণী (Class 11)
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bengali text-sm font-medium text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={targets.class12} 
                    onChange={() => handleTargetChange("class12")}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  দ্বাদশ শ্রেণী (Class 12)
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bengali text-sm font-medium text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={targets.admission} 
                    onChange={() => handleTargetChange("admission")}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  এডমিশন (Admission)
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bengali text-sm font-medium text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={targets.ssc} 
                    onChange={() => handleTargetChange("ssc")}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  এসএসসি (SSC)
                </label>
              </div>

              {targets.admission && (
                <div className="pt-2 max-w-xs animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="block text-xs font-bold font-bengali mb-1.5 text-slate-500">এডমিশন ইউনিভার্সিটি কোড</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-card px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500/20 font-sans" 
                    value={formData.university} 
                    onChange={e => setFormData({...formData, university: e.target.value})}
                  >
                    <option value="">কোনো নির্দিষ্ট বিশ্ববিদ্যালয় নেই (ঐচ্ছিক)</option>
                    <option value="DU">DU (ঢাকা বিশ্ববিদ্যালয়)</option>
                    <option value="RU">RU (রাজশাহী বিশ্ববিদ্যালয়)</option>
                    <option value="JU">JU (জাহাঙ্গীরনগর বিশ্ববিদ্যালয়)</option>
                    <option value="CU">CU (চট্টগ্রাম বিশ্ববিদ্যালয়)</option>
                    <option value="GST">GST (গুচ্ছ ভর্তি পরীক্ষা)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-4 border-b border-slate-200 pb-4">
              <label className="flex items-center gap-2 cursor-pointer font-bengali text-sm font-bold text-slate-700">
                <input 
                  type="radio" 
                  name="uploadMode" 
                  value="manual" 
                  checked={uploadMode === "manual"} 
                  onChange={() => setUploadMode("manual")} 
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                ম্যানুয়াল এন্ট্রি
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bengali text-sm font-bold text-slate-700">
                <input 
                  type="radio" 
                  name="uploadMode" 
                  value="bulk" 
                  checked={uploadMode === "bulk"} 
                  onChange={() => setUploadMode("bulk")} 
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                Bulk JSON আপলোড
              </label>
            </div>

            <div className="space-y-6">
              {uploadMode === "manual" ? questions.map((q, index) => (
                <div key={index} className="p-5 border border-slate-200 rounded-xl bg-card shadow-sm relative group">
                  {questions.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeQuestionField(index)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <h4 className="font-bold text-foreground mb-4 font-bengali flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs">{index + 1}</span>
                    প্রশ্ন ও অপশন
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-muted-foreground font-bengali">প্রশ্ন</label>
                      <textarea 
                        required
                        className="w-full min-h-[80px] p-3 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-bengali"
                        placeholder="এখানে প্রশ্ন টাইপ করুন..."
                        value={q.text}
                        onChange={(e) => handleQuestionChange(index, "text", e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map(opt => (
                        <div key={opt.id}>
                          <label className="block text-xs font-semibold mb-1 text-slate-500">Option {opt.id}</label>
                          <input 
                            required
                            type="text"
                            className="w-full p-2.5 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-bengali"
                            placeholder={`অপশন ${opt.id}`}
                            value={opt.label}
                            onChange={(e) => handleOptionChange(index, opt.id, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <div className="w-full sm:w-1/3">
                        <label className="block text-sm font-medium mb-1 text-muted-foreground font-bengali">সঠিক উত্তর</label>
                        <select 
                          className="w-full p-2.5 text-sm rounded-lg border border-slate-200 bg-muted focus:ring-2 focus:ring-indigo-500/20 font-bold"
                          value={q.correctOption}
                          onChange={(e) => handleQuestionChange(index, "correctOption", e.target.value)}
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>
                      <div className="w-full sm:w-2/3">
                        <label className="block text-sm font-medium mb-1 text-muted-foreground font-bengali">ব্যাখ্যা (Optional)</label>
                        <input 
                          type="text"
                          className="w-full p-2.5 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-bengali"
                          placeholder="সঠিক উত্তরের ব্যাখ্যা..."
                          value={q.explanation}
                          onChange={(e) => handleQuestionChange(index, "explanation", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-5 border border-slate-200 rounded-xl bg-card shadow-sm">
                  <h4 className="font-bold text-foreground mb-4 font-bengali">JSON Array ইনপুট দিন</h4>
                  <textarea 
                    required
                    className="w-full min-h-[300px] p-4 text-sm font-mono rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-muted"
                    placeholder={`[\n  {\n    "text": "প্রশ্ন ১",\n    "options": [\n      {"id": "A", "label": "অপশন ক"},\n      {"id": "B", "label": "অপশন খ"},\n      {"id": "C", "label": "অপশন গ"},\n      {"id": "D", "label": "অপশন ঘ"}\n    ],\n    "correctOption": "A",\n    "explanation": "ব্যাখ্যা"\n  }\n]`}
                    value={bulkJson}
                    onChange={(e) => setBulkJson(e.target.value)}
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100 font-bengali text-sm font-medium">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-3 border border-emerald-100 font-bengali text-sm font-medium animate-in fade-in">
                <Check className="w-5 h-5 shrink-0" />
                সফলভাবে প্রশ্নগুলো সেভ হয়েছে!
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-slate-100 pt-6">
              {uploadMode === "manual" ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addQuestionField}
                  className="font-bengali border-dashed border-2 hover:bg-muted flex items-center gap-2 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  আরেকটি প্রশ্ন যুক্ত করুন
                </Button>
              ) : (
                <div />
              )}
              
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-sm font-bengali w-full sm:w-auto"
              >
                {loading ? "সেভিং..." : "সবগুলো সেভ করুন"}
              </Button>
            </div>
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
