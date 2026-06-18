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

  const BOARDS = ["ঢাকা বোর্ড", "রাজশাহী বোর্ড", "যশোর বোর্ড", "কুমিল্লা বোর্ড", "চট্টগ্রাম বোর্ড", "সিলেট বোর্ড", "বরিশাল বোর্ড", "দিনাজপুর বোর্ড", "ময়মনসিংহ বোর্ড"];
  const YEARS = Array.from({ length: 11 }, (_, i) => (new Date().getFullYear() - i).toString());
  const CLASSES = ["৯ম শ্রেনী", "১০ম শ্রেনী", "একাদশ", "দ্বাদশ"];
  const SUBJECTS = ["Bangla", "English", "General Knowledge", "Physics", "Chemistry", "Biology", "Higher Math", "ICT", "Accounting", "Management"];

  const [formData, setFormData] = useState({
    boardName: BOARDS[0],
    boardYear: YEARS[0],
    classLevel: CLASSES[3],
    subject: SUBJECTS[3],
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
      // Validate
      for (const q of questions) {
        if (!q.text.trim()) throw new Error("Please fill in all question text fields.");
        for (const opt of q.options) {
          if (!opt.label.trim()) throw new Error("Please fill in all option fields.");
        }
      }

      const promises = questions.map(q => 
        addDoc(collection(db, "questions"), {
          text: q.text,
          options: q.options,
          correctOption: q.correctOption,
          explanation: q.explanation,
          subject: formData.subject,
          isBoardQuestion: true,
          boardName: formData.boardName,
          boardYear: formData.boardYear,
          classLevel: formData.classLevel,
          title: `${formData.boardName} - ${formData.boardYear}`, 
          createdAt: serverTimestamp()
        })
      );

      await Promise.all(promises);
      
      setSuccess(true);
      setQuestions([
        {
          text: "",
          options: [{ id: "A", label: "" }, { id: "B", label: "" }, { id: "C", label: "" }, { id: "D", label: "" }],
          correctOption: "A",
          explanation: "",
        }
      ]);
      
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

            <div className="space-y-6">
              {questions.map((q, index) => (
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
              ))}
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
              <Button 
                type="button" 
                variant="outline" 
                onClick={addQuestionField}
                className="font-bengali border-dashed border-2 hover:bg-slate-50 flex items-center gap-2 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                আরেকটি প্রশ্ন যুক্ত করুন
              </Button>
              
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
