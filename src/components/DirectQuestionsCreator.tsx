import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';

export default function DirectQuestionsCreator() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [bulkJson, setBulkJson] = useState("");

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

  const FORMATS = [
    { id: "MCQ", name: "MCQ (বহুনির্বাচনি)" },
    { id: "CQ", name: "CQ (সৃজনশীল)" },
    { id: "KaBhandar", name: "ক ভান্ডার (জ্ঞানমূলক)" },
    { id: "KhaBhandar", name: "খ ভান্ডার (অনুধাবনমূলক)" }
  ];

  const [formData, setFormData] = useState({
    subject: SUBJECTS[0],
    title: "", // chapter/paper name like "অপরিচিতা"
    format: "MCQ",
    university: "DU", // for Admission
  });

  const [targets, setTargets] = useState({
    hsc: true,
    class11: true,
    class12: true,
    admission: true,
    ssc: false,
  });

  const handleTargetChange = (key: keyof typeof targets) => {
    setTargets({
      ...targets,
      [key]: !targets[key]
    });
  };

  const submitQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (!formData.title.trim()) {
        throw new Error("দয়াকরে অধ্যায় বা বিষয়ের নাম (Title) লিখুন।");
      }

      const activeTargets = Object.entries(targets).filter(([_, val]) => val).map(([key]) => key);
      if (activeTargets.length === 0) {
        throw new Error("দয়াকরে কমপক্ষে একটি টার্গেট ক্লাস সিলেক্ট করুন।");
      }

      let questionsToSubmit: any[] = [];
      if (!bulkJson.trim()) {
        throw new Error("দয়াকরে JSON Array ফরম্যাটে প্রশ্নগুলো পেস্ট করুন।");
      }

      try {
        const parsed = JSON.parse(bulkJson.trim());
        if (!Array.isArray(parsed)) {
          throw new Error("JSON ইনপুট অবশ্যই একটি Array হতে হবে।");
        }
        questionsToSubmit = parsed;
      } catch (jsonErr: any) {
        throw new Error("ভুল JSON ফরম্যাট: " + jsonErr.message);
      }

      const colRef = collection(db, "questions");
      let count = 0;

      // Map targets to classGroup and class structures compatible with the database
      const targetMappings: { key: string; classGroup: string; class: string; university?: string }[] = [];
      if (targets.hsc) targetMappings.push({ key: "hsc", classGroup: "HSC", class: "HSC" });
      if (targets.class11) targetMappings.push({ key: "class11", classGroup: "HSC", class: "Class 11" });
      if (targets.class12) targetMappings.push({ key: "class12", classGroup: "HSC", class: "Class 12" });
      if (targets.ssc) targetMappings.push({ key: "ssc", classGroup: "SSC", class: "Class 10" });
      if (targets.admission) targetMappings.push({ key: "admission", classGroup: "Admission", class: "Admission", university: formData.university });

      for (const q of questionsToSubmit) {
        let is_cq = formData.format === "CQ";
        let is_k_vandar = formData.format === "KaBhandar";
        let is_kh_vandar = formData.format === "KhaBhandar";

        if (formData.format === "KaBhandar" || formData.format === "KhaBhandar") {
          is_cq = true;
        }

        const qText = q.text || q.question || q.q || q.questionText || "";
        if (!qText.trim()) continue;

        // Formulate options for MCQ
        let formattedOptions: { id: string; label: string }[] = [];
        if (!is_cq) {
          if (q.options) {
            if (Array.isArray(q.options)) {
              if (q.options.length > 0) {
                if (typeof q.options[0] === 'string') {
                  const ids = ['A', 'B', 'C', 'D', 'E'];
                  formattedOptions = q.options.map((optLabel: string, idx: number) => ({
                    id: ids[idx] || String(idx + 1),
                    label: optLabel
                  }));
                } else if (typeof q.options[0] === 'object' && q.options[0] !== null) {
                  formattedOptions = q.options.map((opt: any, idx: number) => {
                    const id = opt.id || opt.key || String(idx + 1);
                    const label = opt.label || opt.text || opt.value || opt.option || "";
                    return { id, label };
                  });
                }
              }
            } else if (typeof q.options === 'object' && q.options !== null) {
              formattedOptions = Object.keys(q.options).map((key) => ({
                id: key,
                label: q.options[key]
              }));
            }
          }

          if (formattedOptions.length === 0) {
            formattedOptions = [
              { id: "A", label: "" },
              { id: "B", label: "" },
              { id: "C", label: "" },
              { id: "D", label: "" }
            ];
          }
        }

        // Parse correctOption
        let correctOption = "A";
        const rawCorrect = q.correctOption !== undefined ? q.correctOption : (q.correct_answer || q.correctAnswer || q.answer || q.correct || "A");
        if (rawCorrect !== undefined && rawCorrect !== null) {
          if (typeof rawCorrect === 'number') {
            if (rawCorrect >= 0 && rawCorrect < formattedOptions.length) {
              correctOption = formattedOptions[rawCorrect].id;
            } else {
              correctOption = String(rawCorrect);
            }
          } else if (typeof rawCorrect === 'string') {
            const trimmed = rawCorrect.trim();
            if (formattedOptions.some(o => o.id === trimmed)) {
              correctOption = trimmed;
            } else {
              const matched = formattedOptions.find(o => o.label === trimmed);
              if (matched) {
                correctOption = matched.id;
              } else {
                correctOption = trimmed;
              }
            }
          }
        }

        // Try to normalize correctOption to A/B/C/D if it is ক/খ/গ/ঘ
        const getNormalizedKey = (k: any) => {
          if (!k) return "A";
          const s = String(k).trim().toUpperCase();
          if (s === "ক" || s === "A") return "A";
          if (s === "খ" || s === "B") return "B";
          if (s === "গ" || s === "C") return "C";
          if (s === "ঘ" || s === "D") return "D";
          return s;
        };
        correctOption = getNormalizedKey(correctOption);

        const optionA = formattedOptions.find(o => o.id === 'A' || o.id === 'ক')?.label || "";
        const optionB = formattedOptions.find(o => o.id === 'B' || o.id === 'খ')?.label || "";
        const optionC = formattedOptions.find(o => o.id === 'C' || o.id === 'গ')?.label || "";
        const optionD = formattedOptions.find(o => o.id === 'D' || o.id === 'ঘ')?.label || "";

        // For each target category, write a document in Firestore
        for (const mapping of targetMappings) {
          let uniName = "";
          if (mapping.university) {
            if (mapping.university === "DU") uniName = "ঢাকা বিশ্ববিদ্যালয়";
            else if (mapping.university === "RU") uniName = "রাজশাহী বিশ্ববিদ্যালয়";
            else if (mapping.university === "JU") uniName = "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়";
            else if (mapping.university === "CU") uniName = "চট্টগ্রাম বিশ্ববিদ্যালয়";
            else if (mapping.university === "GST") uniName = "গুচ্ছ (GST)";
            else uniName = mapping.university;
          }

          await addDoc(colRef, {
            text: qText,
            options: is_cq ? [] : formattedOptions,
            optionA: is_cq ? "" : optionA,
            optionB: is_cq ? "" : optionB,
            optionC: is_cq ? "" : optionC,
            optionD: is_cq ? "" : optionD,
            correctOption: is_cq ? "" : correctOption,
            explanation: q.explanation || q.details || "",
            subject: formData.subject,
            title: formData.title.trim(),
            is_cq: is_cq,
            is_k_vandar: is_k_vandar,
            is_kh_vandar: is_kh_vandar,
            isBoardQuestion: false, // directly uploaded question
            classGroup: mapping.classGroup,
            class: mapping.class,
            university: uniName,
            createdAt: serverTimestamp()
          });
          count++;
        }
      }

      setSuccess(true);
      setBulkJson("");
      setFormData({
        ...formData,
        title: ""
      });
      setTimeout(() => setSuccess(false), 3000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-purple-100 shadow-sm rounded-2xl overflow-hidden mt-4">
      <CardHeader className="bg-purple-50/50 border-b border-purple-50 pb-4 p-6">
        <CardTitle className="font-bengali text-purple-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" /> সরাসরি প্রশ্ন আপলোড করুন (JSON Array)
        </CardTitle>
        <CardDescription className="font-bengali text-purple-700/80">
          বোর্ড প্রশ্ন ছাড়া অধ্যায়ভিত্তিক সাধারণ MCQ বা CQ প্রশ্ন একযোগে HSC, একাদশ, দ্বাদশ এবং এডমিশন টার্গেটে আপলোড করুন।
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={submitQuestions} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-purple-50/30 rounded-xl border border-purple-100/50">
            <div>
              <label className="block text-sm font-bold font-bengali mb-1.5 text-slate-700">বিষয় নির্বাচন করুন</label>
              <select 
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-card px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 font-sans" 
                value={formData.subject} 
                onChange={e => setFormData({...formData, subject: e.target.value})}
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold font-bengali mb-1.5 text-slate-700">অধ্যায় / টপিকের নাম (Title)</label>
              <input 
                required
                type="text"
                placeholder="যেমন: অপরিচিতা, বহুপদী"
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-card px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 font-bengali" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold font-bengali mb-1.5 text-slate-700">প্রশ্ন ধরণ (Format)</label>
              <select 
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-card px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 font-bengali" 
                value={formData.format} 
                onChange={e => setFormData({...formData, format: e.target.value})}
              >
                {FORMATS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          </div>

          <div className="p-5 bg-card border border-slate-200 rounded-xl space-y-3">
            <label className="block text-sm font-bold font-bengali text-slate-700">
              টার্গেট ক্যাটাগরি সিলেক্ট করুন (একসাথে সব সিলেক্ট করতে পারেন)
            </label>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bengali text-sm font-medium text-slate-700">
                <input 
                  type="checkbox" 
                  checked={targets.hsc} 
                  onChange={() => handleTargetChange("hsc")}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                এইচএসসি (HSC)
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bengali text-sm font-medium text-slate-700">
                <input 
                  type="checkbox" 
                  checked={targets.class11} 
                  onChange={() => handleTargetChange("class11")}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                একাদশ শ্রেণী (Class 11)
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bengali text-sm font-medium text-slate-700">
                <input 
                  type="checkbox" 
                  checked={targets.class12} 
                  onChange={() => handleTargetChange("class12")}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                দ্বাদশ শ্রেণী (Class 12)
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bengali text-sm font-medium text-slate-700">
                <input 
                  type="checkbox" 
                  checked={targets.admission} 
                  onChange={() => handleTargetChange("admission")}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                এডমিশন (Admission)
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bengali text-sm font-medium text-slate-700">
                <input 
                  type="checkbox" 
                  checked={targets.ssc} 
                  onChange={() => handleTargetChange("ssc")}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                এসএসসি (SSC)
              </label>
            </div>

            {targets.admission && (
              <div className="pt-2 max-w-xs">
                <label className="block text-xs font-bold font-bengali mb-1 text-slate-500">এডমিশন ইউনিভার্সিটি কোড</label>
                <select 
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-card px-2 py-1 text-xs focus:ring-2 focus:ring-purple-500/20" 
                  value={formData.university} 
                  onChange={e => setFormData({...formData, university: e.target.value})}
                >
                  <option value="DU">DU (ঢাকা বিশ্ববিদ্যালয়)</option>
                  <option value="RU">RU (রাজশাহী বিশ্ববিদ্যালয়)</option>
                  <option value="JU">JU (জাহাঙ্গীরনগর বিশ্ববিদ্যালয়)</option>
                  <option value="CU">CU (চট্টগ্রাম বিশ্ববিদ্যালয়)</option>
                  <option value="GST">GST (গুচ্ছ ভর্তি পরীক্ষা)</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold font-bengali text-slate-700">JSON Array ইনপুট দিন</label>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> MCQ এবং CQ এর ফরম্যাট আলাদা
              </div>
            </div>
            
            <textarea 
              required
              rows={10}
              className="w-full p-4 text-xs font-mono rounded-lg border border-slate-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 bg-slate-50/50"
              placeholder={formData.format === "MCQ" ? 
`[
  {
    "text": "‘অপরিচিতা’ গল্পটি প্রথম কোন পত্রিকায় প্রকাশিত হয়?",
    "options": [
      {"id": "A", "label": "সবুজপত্র"},
      {"id": "B", "label": "প্রবাসী"},
      {"id": "C", "label": "ভারতী"},
      {"id": "D", "label": "বঙ্গদর্শন"}
    ],
    "correctOption": "A",
    "explanation": "১৯১৪ সালে সবুজপত্র পত্রিকায় এটি প্রথম প্রকাশিত হয়।"
  }
]` : 
`[
  {
    "text": "‘অনুপম’ চরিত্রটির মানসিক দ্বন্দ্ব ও আত্মমর্যাদার পরিচয় দাও।",
    "explanation": "অনুপম কল্যাণীর প্রতি গভীর টান অনুভব করলেও মামার অন্যায়ের প্রতিবাদ করতে পারেনি। পরবর্তীতে সে ব্যক্তিত্ববান হয়ে ওঠে।"
  }
]`
              }
              value={bulkJson}
              onChange={(e) => setBulkJson(e.target.value)}
            />
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
              সফলভাবে প্রশ্নগুলো ডাটাবেজে যুক্ত এবং শো করার জন্য প্রস্তুত করা হয়েছে!
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 shadow-sm font-bengali w-full sm:w-auto"
            >
              {loading ? "আপলোড হচ্ছে..." : "প্রশ্নগুলো আপলোড করুন"}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}
