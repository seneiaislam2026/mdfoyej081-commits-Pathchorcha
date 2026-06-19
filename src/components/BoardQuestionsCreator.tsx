import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Check, AlertCircle } from 'lucide-react';

export default function BoardQuestionsCreator() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [uploadMode, setUploadMode] = useState<"manual" | "bulk">("manual");
  const [bulkJson, setBulkJson] = useState("");

  const BOARDS = ["ঢাকা বোর্ড", "রাজশাহী বোর্ড", "যশোর বোর্ড", "কুমিল্লা বোর্ড", "চট্টগ্রাম বোর্ড", "সিলেট বোর্ড", "বরিশাল বোর্ড", "দিনাজপুর বোর্ড", "ময়মনসিংহ বোর্ড"];
  const YEARS = Array.from({ length: 11 }, (_, i) => (new Date().getFullYear() - i).toString());
  const CLASSES = ["৯ম শ্রেনী", "১০ম শ্রেনী", "একাদশ", "দ্বাদশ"];
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
    classLevel: CLASSES[3],
    subject: SUBJECTS[4], // Physics 1st Paper
    format: FORMATS[0]
  });

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

      let classGroup = "HSC";
      let mappedClass = formData.classLevel;

      if (formData.classLevel === "৯ম শ্রেনী" || formData.classLevel === "১০ম শ্রেনী") {
        classGroup = "SSC";
        mappedClass = formData.classLevel === "৯ম শ্রেনী" ? "Class 9" : "Class 10";
      } else if (formData.classLevel === "একাদশ" || formData.classLevel === "দ্বাদশ") {
        classGroup = "HSC";
        mappedClass = formData.classLevel === "একাদশ" ? "Class 11" : "Class 12";
      }

      const promises = questionsToSubmit.map((q, index) => {
        return addDoc(collection(db, "questions"), {
          text: q.text || "",
          options: q.options || [],
          correctOption: q.correctOption || "A",
          explanation: q.explanation || "",
          subject: formData.subject,
          is_cq: formData.format === "CQ",
          is_k_vandar: formData.format === "KaBhandar",
          is_kh_vandar: formData.format === "KhaBhandar",
          isBoardQuestion: true,
          boardName: formData.boardName,
          boardYear: formData.boardYear,
          classLevel: formData.classLevel,
          classGroup: classGroup,
          class: mappedClass,
          title: `${formData.boardName} ${formData.boardYear}`, 
          question_no: index + 1,
          createdAt: serverTimestamp()
        })
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
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <label className="block text-sm font-bold font-bengali mb-1.5 text-slate-700">ক্লাস</label>
                <select className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 font-bengali" 
                  value={formData.classLevel} onChange={e => setFormData({...formData, classLevel: e.target.value})}>
                   {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold font-bengali mb-1.5 text-slate-700">বিষয়</label>
                <select className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20" 
                  value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                   {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold font-bengali mb-1.5 text-slate-700">ফরম্যাট</label>
                <select className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20" 
                  value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}>
                   {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold font-bengali mb-1.5 text-slate-700">বোর্ড</label>
                <select className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 font-bengali" 
                  value={formData.boardName} onChange={e => setFormData({...formData, boardName: e.target.value})}>
                   {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold font-bengali mb-1.5 text-slate-700">সাল</label>
                <select className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20" 
                  value={formData.boardYear} onChange={e => setFormData({...formData, boardYear: e.target.value})}>
                   {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
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
                <div key={index} className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm relative group">
                  {questions.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeQuestionField(index)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <h4 className="font-bold text-slate-800 mb-4 font-bengali flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs">{index + 1}</span>
                    প্রশ্ন ও অপশন
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-600 font-bengali">প্রশ্ন</label>
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
                        <label className="block text-sm font-medium mb-1 text-slate-600 font-bengali">সঠিক উত্তর</label>
                        <select 
                          className="w-full p-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 font-bold"
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
                        <label className="block text-sm font-medium mb-1 text-slate-600 font-bengali">ব্যাখ্যা (Optional)</label>
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
                <div className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-4 font-bengali">JSON Array ইনপুট দিন</h4>
                  <textarea 
                    required
                    className="w-full min-h-[300px] p-4 text-sm font-mono rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50"
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
                  className="font-bengali border-dashed border-2 hover:bg-slate-50 flex items-center gap-2 w-full sm:w-auto"
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
