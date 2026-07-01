import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, LayoutList, ChevronRight, Award, Layers } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { managementMCQs } from "../data/managementMcqs";
import { hscIctCQ } from "../data/hscIctCqData";

const BANGLA_CHAPTERS = [
  { name: "নব্য লেখক", index: 0 },
  { name: "nobyo lekhok", index: 0 },
  { name: "অপরিচিতা", index: 1 },
  { name: "oporichita", index: 1 },
  { name: "সাহিত্যে খেলা", index: 2 },
  { name: "সাহিত্যের খেলা", index: 2 },
  { name: "sahitye khela", index: 2 },
  { name: "বিলাসী", index: 3 },
  { name: "bilasi", index: 3 },
  { name: "অর্ধাঙ্গী", index: 4 },
  { name: "ordhangi", index: 4 },
  { name: "যৌবনের গান", index: 5 },
  { name: "jouboner gan", index: 5 },
  { name: "জীবন ও বৃক্ষ", index: 6 },
  { name: "jibon o brikkho", index: 6 },
  { name: "গন্তব্য কাবুল", index: 7 },
  { name: "gontobbo kabul", index: 7 },
  { name: "gontobbo", index: 7 },
  { name: "kabul", index: 7 },
  { name: "মাসি-পিসি", index: 8 },
  { name: "মাসি পিসি", index: 8 },
  { name: "masi pisi", index: 8 },
  { name: "masi-pisi", index: 8 },
  { name: "কপিলদাস", index: 9 },
  { name: "kopildas", index: 9 },
  { name: "নেকলেস", index: 10 },
  { name: "necklace", index: 10 },
  { name: "রেইনকোট", index: 11 },
  { name: "raincoat", index: 11 },
  { name: "ঋতু বর্ণন", index: 12 },
  { name: "ritu bornon", index: 12 },
  { name: "সোনার তরী", index: 13 },
  { name: "sonar tori", index: 13 },
  { name: "বিভীষণের", index: 14 },
  { name: "bibhishoner", index: 14 },
  { name: "বিদ্রোহী", index: 15 },
  { name: "bidrohi", index: 15 },
  { name: "সুচেতনা", index: 16 },
  { name: "সুচেetna", index: 16 },
  { name: "suchetona", index: 16 },
  { name: "প্রতিদান", index: 17 },
  { name: "protidan", index: 17 },
  { name: "তাহারেই", index: 18 },
  { name: "taharei", index: 18 },
  { name: "পদ্মা", index: 19 },
  { name: "podma", index: 19 },
  { name: "আঠারো", index: 20 },
  { name: "১৮ বছর", index: 20 },
  { name: "atharo", index: 20 },
  { name: "18 bochor", index: 20 },
  { name: "ফেব্রুয়ারি", index: 21 },
  { name: "ফেব্রুয়ারি", index: 21 },
  { name: "february", index: 21 },
  { name: "কিংবদন্তি", index: 22 },
  { name: "kingbodonti", index: 22 },
  { name: "প্রত্যাবর্তন", index: 23 },
  { name: "prottaborton", index: 23 },
  { name: "লালসালু", index: 24 },
  { name: "lalsalu", index: 24 },
  { name: "সিরাজউদ্দৌলা", index: 25 },
  { name: "সিরাজ-উদ", index: 25 },
  { name: "siraj", index: 25 }
];

const getBanglaSortIndex = (title: string): number => {
  const t = title.trim().toLowerCase();
  for (const item of BANGLA_CHAPTERS) {
    if (t.includes(item.name.toLowerCase())) {
      return item.index;
    }
  }
  return 999;
};

const getSubjectEquivalents = (sub: string): string[] => {
  if (!sub) return [];
  const s = sub.trim().toLowerCase();
  
  if (s.includes("bangla 1") || s === "বাংলা" || s === "bangla" || s === "বাংলা ১ম" || s === "বাংলা ১ম পত্র" || s === "bangla 1st" || s === "bangla 1st paper") {
    return ["Bangla 1st Paper", "বাংলা", "bangla", "বাংলা ১ম", "বাংলা ১ম পত্র", "bangla 1", "bangla 1st", "bangla 1st paper"];
  }
  if (s.includes("bangla 2") || s === "বাংলা ২য়" || s === "বাংলা ২য় পত্র" || s === "bangla 2nd" || s === "bangla 2nd paper") {
    return ["Bangla 2nd Paper", "বাংলা ২য়", "বাংলা ২য় পত্র", "bangla 2", "bangla 2nd", "bangla 2nd paper"];
  }
  if (s.includes("english 1") || s === "ইংরেজি" || s === "english" || s === "ইংরেজি ১ম" || s === "ইংরেজি ১ম পত্র" || s === "english 1st" || s === "english 1st paper") {
    return ["English 1st Paper", "ইংরেজি", "english", "ইংরেজি ১ম", "ইংরেজি ১ম পত্র", "english 1", "english 1st", "english 1st paper"];
  }
  if (s.includes("english 2") || s === "ইংরেজি ২য়" || s === "ইংরেজি ২য় পত্র" || s === "english 2nd" || s === "english 2nd paper") {
    return ["English 2nd Paper", "ইংরেজি ২য়", "ইংরেজি ২য় পত্র", "english 2", "english 2nd", "english 2nd paper"];
  }
  if (s.includes("accounting 1") || s === "হিসাববিজ্ঞান" || s === "accounting" || s === "হিসাববিজ্ঞান ১ম" || s === "হিসাববিজ্ঞান ১ম পত্র" || s === "accounting 1st" || s === "accounting 1st paper") {
    return ["Accounting 1st Paper", "হিসাববিজ্ঞান", "accounting", "হিসাববিজ্ঞান ১ম", "হিসাববিজ্ঞান ১ম পত্র", "accounting 1", "accounting 1st", "accounting 1st paper"];
  }
  if (s.includes("accounting 2") || s === "হিসাববিজ্ঞান ২য়" || s === "হিসাববিজ্ঞান ২য় পত্র" || s === "accounting 2nd" || s === "accounting 2nd paper") {
    return ["Accounting 2nd Paper", "হিসাববিজ্ঞান ২য়", "হিসাববিজ্ঞান ২য় পত্র", "accounting 2", "accounting 2nd", "accounting 2nd paper"];
  }
  if (s.includes("physics 1") || s === "পদার্থবিজ্ঞান" || s === "physics" || s === "পদার্থবিজ্ঞান ১ম" || s === "পদার্থবিজ্ঞান ১ম পত্র" || s === "physics 1st" || s === "physics 1st paper") {
    return ["Physics 1st Paper", "পদার্থবিজ্ঞান", "physics", "পদার্থবিজ্ঞান ১ম", "পদার্থবিজ্ঞান ১ম পত্র", "physics 1", "physics 1st", "physics 1st paper"];
  }
  if (s.includes("physics 2") || s === "পদার্থবিজ্ঞান ২য়" || s === "পদার্থবিজ্ঞান ২য় পত্র" || s === "physics 2nd" || s === "physics 2nd paper") {
    return ["Physics 2nd Paper", "পদার্থবিজ্ঞান ২য়", "পদার্থবিজ্ঞান ২য় পত্র", "physics 2", "physics 2nd", "physics 2nd paper"];
  }
  if (s.includes("chemistry 1") || s === "রসায়ন" || s === "chemistry" || s === "রসায়ন ১ম" || s === "রসায়ন ১ম পত্র" || s === "chemistry 1st" || s === "chemistry 1st paper") {
    return ["Chemistry 1st Paper", "রসায়ন", "chemistry", "রসায়ন ১ম", "রসায়ন ১ম পত্র", "chemistry 1", "chemistry 1st", "chemistry 1st paper"];
  }
  if (s.includes("chemistry 2") || s === "রসায়ন ২য়" || s === "রসায়ন ২য় পত্র" || s === "chemistry 2nd" || s === "chemistry 2nd paper") {
    return ["Chemistry 2nd Paper", "রসায়ন ২য়", "রসায়ন ২য় পত্র", "chemistry 2", "chemistry 2nd", "chemistry 2nd paper"];
  }
  if (s.includes("biology 1") || s === "জীববিজ্ঞান" || s === "biology" || s === "জীববিজ্ঞান ১ম" || s === "জীববিজ্ঞান ১ম পত্র" || s === "biology 1st" || s === "biology 1st paper") {
    return ["Biology 1st Paper", "জীববিজ্ঞান", "biology", "জীববিজ্ঞান ১ম", "জীববিজ্ঞান ১ম পত্র", "biology 1", "biology 1st", "biology 1st paper"];
  }
  if (s.includes("biology 2") || s === "জীববিজ্ঞান ২য়" || s === "জীববিজ্ঞান ২য় পত্র" || s === "biology 2nd" || s === "biology 2nd paper") {
    return ["Biology 2nd Paper", "জীববিজ্ঞান ২য়", "জীববিজ্ঞান ২য় পত্র", "biology 2", "biology 2nd", "biology 2nd paper"];
  }
  if (s.includes("higher math 1") || s === "উচ্চতর গণিত" || s === "উচ্চতর গণিত ১ম" || s === "উচ্চতর গণিত ১ম পত্র" || s === "higher math 1st" || s === "higher math 1st paper" || s === "math 1" || s === "math 1st" || s === "math 1st paper" || s === "গণিত ১ম" || s === "গণিত") {
    return ["Higher Math 1st Paper", "উচ্চতর গণিত", "উচ্চতর গণিত ১ম", "উচ্চতর গণিত ১ম পত্র", "higher math", "higher math 1", "higher math 1st", "higher math 1st paper", "math 1", "math 1st", "math 1st paper", "গণিত ১ম", "গণিত"];
  }
  if (s.includes("higher math 2") || s === "উচ্চতর গণিত ২য়" || s === "উচ্চতর গণিত ২য় পত্র" || s === "higher math 2nd" || s === "higher math 2nd paper" || s === "math 2" || s === "math 2nd" || s === "math 2nd paper" || s === "গণিত ২য়") {
    return ["Higher Math 2nd Paper", "উচ্চতর গণিত ২য়", "উচ্চতর গণিত ২য় পত্র", "higher math 2", "higher math 2nd", "higher math 2nd paper", "math 2", "math 2nd", "math 2nd paper", "গণিত ২য়"];
  }
  if (s.includes("management 1") || s === "ব্যবস্থাপনা" || s === "management" || s === "ব্যবস্থাপনা ১ম" || s === "ব্যবস্থাপনা ১ম পত্র" || s === "management 1st" || s === "management 1st paper" || s === "ব্যবসায় সংগঠন ও ব্যবস্থাপনা" || s === "ব্যবসায় সংগঠন") {
    return ["Management 1st Paper", "ব্যবস্থাপনা", "management", "ব্যবস্থাপনা ১ম", "ব্যবস্থাপনা ১ম পত্র", "management 1", "management 1st", "management 1st paper", "ব্যবসায় সংগঠন ও ব্যবস্থাপনা", "ব্যবসায় সংগঠন"];
  }
  if (s.includes("management 2") || s === "ব্যবস্থাপনা ২য়" || s === "ব্যবস্থাপনা ২য় পত্র" || s === "management 2nd" || s === "management 2nd paper") {
    return ["Management 2nd Paper", "ব্যবস্থাপনা ২য়", "ব্যবস্থাপনা ২য় পত্র", "management 2", "management 2nd", "management 2nd paper"];
  }
  if (s === "ict" || s === "আইসিটি" || s === "তথ্য ও যোগাযোগ প্রযুক্তি") {
    return ["ICT", "ict", "আইসিটি", "তথ্য ও যোগাযোগ প্রযুক্তি"];
  }
  return [sub];
};

const isBoardOrExamPaper = (title: string): boolean => {
  const t = title.toLowerCase();
  const keywords = [
    "বোর্ড", "board", "dhaka", "comilla", "cumilla", "jessore", "jashore", "sylhet", "barisal", "barishal", 
    "chittagong", "chattogram", "rajshahi", "dinajpur", "mymensingh", "madrasah", "madrasa", "technical",
    "ঢাকা", "কুমিল্লা", "যশোর", "সিলেট", "বরিশাল", "চট্টগ্রাম", "রাজশাহী", "দিনাজপুর", "ময়মনসিংহ", "মাদরাসা", "কারিগরি",
    "সকল বোর্ড", "all board", "ঢাবি", "du", "চবি", "cu", "রাবি", "ru", "জাবি", "ju", "গুচ্ছ", "gst", "ভর্তি", "admission",
    "মেডিকেল", "medical", "বিসিএস", "bcs", "exam", "test paper", "টেস্ট পেপার", "ক্যাডেট", "cadet", "university", "বিশ্ববিদ্যালয়"
  ];
  
  // Also check if contains a year (4 consecutive digits like 2015 to 2029 or Bengali digits like ২০১৫ to ২০২৯)
  const englishYearRegex = /\b(20\d{2})\b/;
  const bengaliYearRegex = /[২০][০-৯]{3}/; // simple pattern matching bengali years around 2000-2099
  
  if (englishYearRegex.test(title) || bengaliYearRegex.test(title)) {
    return true;
  }
  
  return keywords.some(kw => t.includes(kw));
};

export default function SubjectPapers() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const subject = queryParams.get("subject") || "";
  const format = queryParams.get("format") || "";
  const classGroup = queryParams.get("classGroup") || "";

  const [papers, setPapers] = useState<{title: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"board" | "topic">("board");

  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, "questions"));
        const equivalents = getSubjectEquivalents(subject);
        if (subject && equivalents.length > 0) {
          q = query(q, where("subject", "in", equivalents));
        }
        if (classGroup) {
          q = query(q, where("classGroup", "==", classGroup));
        }
        
        const snap = await getDocs(q);
        
        let groups: Record<string, any[]> = {};
        
        snap.forEach(doc => {
          const data = doc.data();
          let is_cq = data.is_cq === true;
          let is_k_vandar = data.is_k_vandar === true;
          let is_kh_vandar = data.is_kh_vandar === true;
          
          if (format === "MCQ" && is_cq) return;
          if (format === "CQ" && (!is_cq || is_k_vandar || is_kh_vandar)) return;
          if (format === "KaBhandar" && !is_k_vandar) return;
          if (format === "KhaBhandar" && !is_kh_vandar) return;
          
          const t = (data.title || "Uncategorized").trim();
          // Exclude questions with title "বাংলা" or "Bangla"
          if (t === "বাংলা" || t === "Bangla") return;
          
          if (!groups[t]) groups[t] = [];
          groups[t].push({ id: doc.id, ...data });
        });

        // Merge local questions count if applicable
        let localQ = [...(managementMCQs as any[]), ...(hscIctCQ as any[])];
        if (subject && equivalents.length > 0) {
          localQ = localQ.filter(m => equivalents.includes(m.subject));
        }
        if (classGroup) {
          localQ = localQ.filter(m => m.classGroup === classGroup);
        }
        
        localQ.forEach(data => {
          let is_cq = data.is_cq === true;
          let is_k_vandar = data.is_k_vandar === true;
          let is_kh_vandar = data.is_kh_vandar === true;
          
          if (format === "MCQ" && is_cq) return;
          if (format === "CQ" && (!is_cq || is_k_vandar || is_kh_vandar)) return;
          if (format === "KaBhandar" && !is_k_vandar) return;
          if (format === "KhaBhandar" && !is_kh_vandar) return;
          
          const t = (data.title || "Uncategorized").trim();
          // Exclude questions with title "বাংলা" or "Bangla"
          if (t === "বাংলা" || t === "Bangla") return;
          
          if (!groups[t]) groups[t] = [];
          groups[t].push({ id: `local_${data.question || data.text || Math.random()}`, ...data });
        });

        // Compute exact deduplicated counts for each title (matching PaperView's deduplication logic)
        const results = Object.keys(groups).map(titleKey => {
          const list = groups[titleKey];
          const unique = new Map();
          list.forEach(r => {
            r.correctOption = r.correctOption || r.correct_answer || r.correctAnswer || r.answer;
            const key = r.text || r.question || r.id;
            if (unique.has(key)) {
              const existing = unique.get(key);
              if ((r.explanation && !existing.explanation) || (r.correctOption && !existing.correctOption)) {
                unique.set(key, r);
              }
            } else {
              unique.set(key, r);
            }
          });
          return {
            title: titleKey,
            count: unique.size
          };
        }).filter(r => r.count > 0);
        
        const isBangla1st = equivalents.includes("Bangla 1st Paper");
        
        results.sort((a, b) => {
          if (isBangla1st) {
            const idxA = getBanglaSortIndex(a.title);
            const idxB = getBanglaSortIndex(b.title);
            if (idxA !== idxB) return idxA - idxB;
          }
          return b.count - a.count || a.title.localeCompare(b.title);
        });
        
        setPapers(results);
      } catch (err) {
        console.error("Error fetching papers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, [subject, format, classGroup]);

  const boardPapers = papers.filter(p => isBoardOrExamPaper(p.title));
  const topicPapers = papers.filter(p => !isBoardOrExamPaper(p.title));
  const displayedPapers = activeTab === "board" ? boardPapers : topicPapers;

  return (
    <div className="min-h-screen bg-background font-sans pb-32">
      {/* Header */}
      <div className="bg-card sticky top-0 z-50 border-b border-slate-100 shadow-sm px-4 py-3 flex items-center justify-center">
        <button 
          onClick={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate(`/format?subject=${encodeURIComponent(subject)}&classGroup=${encodeURIComponent(classGroup)}`);
            }
          }} 
          className="absolute left-4 w-10 h-10 bg-muted hover:bg-slate-100 flex items-center justify-center rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
        </button>
        <div className="text-center">
          <h1 className="font-bengali font-bold text-lg text-foreground">{subject}</h1>
          <p className="font-bengali text-xs text-slate-500">{format === 'MCQ' ? 'বহুনির্বাচনি প্রশ্ন' : format === 'CQ' ? 'সৃজনশীল প্রশ্ন' : 'প্রশ্নব্যাংক'}</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="font-bengali mt-4 text-slate-500 font-medium">লোড হচ্ছে...</p>
          </div>
        ) : papers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <LayoutList className="w-16 h-16 text-slate-300 mb-4" strokeWidth={1} />
            <h3 className="font-bengali text-lg font-bold text-slate-700 mb-1">কোনো প্রশ্ন পাওয়া যায়নি</h3>
            <p className="font-bengali text-sm text-slate-500">অ্যাডমিন প্যানেল থেকে প্রশ্ন যুক্ত করুন।</p>
          </div>
        ) : displayedPapers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <LayoutList className="w-16 h-16 text-slate-300 mb-4" strokeWidth={1} />
            <h3 className="font-bengali text-lg font-bold text-slate-700 mb-1">
              {activeTab === "board" ? "কোনো বোর্ড বা পরীক্ষার প্রশ্ন পাওয়া যায়নি" : "কোনো অধ্যায় বা টপিকের প্রশ্ন পাওয়া যায়নি"}
            </h3>
            <p className="font-bengali text-sm text-slate-500">
              {activeTab === "board" ? "বোর্ড ভিত্তিক প্রশ্ন এখনও যুক্ত করা হয়নি।" : "টপিক ভিত্তিক প্রশ্ন এখনও যুক্ত করা হয়নি।"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {displayedPapers.map((p, i) => (
              <button
                key={i}
                onClick={() => navigate(`/paper?title=${encodeURIComponent(p.title)}&subject=${encodeURIComponent(subject)}&format=${format}&classGroup=${encodeURIComponent(classGroup)}`)}
                className="bg-card rounded-2xl p-4 sm:p-5 flex items-center gap-4 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <LayoutList className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bengali font-bold text-[#1e293b] text-base sm:text-lg w-full truncate">{p.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-2 py-0.5 rounded-md">
                      {p.count} প্রশ্ন
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-muted text-slate-400 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sticky/Fixed Bottom Navigation Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 py-3 px-6 flex justify-around items-center z-50 shadow-[0_-8px_24px_rgba(0,0,0,0.05)] max-w-lg mx-auto rounded-t-2xl">
        <button
          onClick={() => setActiveTab("board")}
          className={`flex flex-col items-center gap-1.5 py-1 px-4 rounded-xl transition-all ${
            activeTab === "board"
              ? "text-emerald-600 scale-105 font-bold"
              : "text-slate-400 hover:text-slate-600 font-medium"
          }`}
        >
          <Award className="w-5 h-5" strokeWidth={activeTab === "board" ? 2.5 : 2} />
          <span className="font-bengali text-xs">বোর্ড ভিত্তিক</span>
        </button>
        <button
          onClick={() => setActiveTab("topic")}
          className={`flex flex-col items-center gap-1.5 py-1 px-4 rounded-xl transition-all ${
            activeTab === "topic"
              ? "text-emerald-600 scale-105 font-bold"
              : "text-slate-400 hover:text-slate-600 font-medium"
          }`}
        >
          <Layers className="w-5 h-5" strokeWidth={activeTab === "topic" ? 2.5 : 2} />
          <span className="font-bengali text-xs">টপিক ভিত্তিক</span>
        </button>
      </div>
    </div>
  );
}
