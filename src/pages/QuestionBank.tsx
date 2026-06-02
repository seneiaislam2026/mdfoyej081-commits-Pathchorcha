import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, BookOpen, ArrowLeft, ArrowRight, PenTool, LayoutList, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../lib/AuthContext";
import { useIsPWA } from "../lib/useIsPWA";
import { getDocs, collection, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";

const filters = {
  classes: ["Class 6-8", "Class 9", "SSC", "HSC", "Admission"],
  subclasses: {
    "Class 6-8": ["Class 6", "Class 7", "Class 8"],
    "Admission": ["ঢাকা বিশ্ববিদ্যালয়", "রাজশাহী বিশ্ববিদ্যালয়", "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়", "গুচ্ছ (GST)", "মেডিকেল", "প্রকৌশল"]
  },
  subjects: ["বাংলা", "English", "Math", "Physics", "Chemistry", "Biology"],
  difficulties: ["সহজ", "মাঝারি", "কঠিন"],
};

const getSubjectsByGroup = (group?: string, classGroup?: string) => {
  const common = ["বাংলা", "English", "ICT"];
  if (classGroup === "Class 6-8" || classGroup === "Class 9") {
     return ["বাংলা", "English", "গণিত", "সাধারণ বিজ্ঞান", "বাংলাদেশ ও বিশ্বপরিচয়", "ধর্ম"];
  }
  
  if (group === "মানবিক") {
    return [...common, "ইতিহাস", "পৌরনীতি", "ভূগোল", "অর্থনীতি", "যুক্তিবিদ্যা", "সমাজবিজ্ঞান"];
  } else if (group === "বাণিজ্য") {
    return [...common, "হিসাববিজ্ঞান", "ব্যবসায় সংগঠন", "ফিন্যান্স", "উদ্ভাবন"];
  }
  // Default to science
  return [...common, "উচ্চতর গণিত", "পদার্থবিজ্ঞান", "রসায়ন", "জীববিজ্ঞান"];
};

const mapUserClassToGroup = (cls?: string) => {
  if (cls === "এডমিশন") return "Admission";
  if (cls === "দশম শ্রেণী") return "SSC";
  if (cls === "একাদশ শ্রেণী" || cls === "দ্বাদশ শ্রেণী") return "HSC";
  if (cls === "নবম শ্রেণী") return "Class 9";
  if (cls === "৬ষ্ঠ শ্রেণী" || cls === "৭ম শ্রেণী" || cls === "৮ম শ্রেণী" || cls === "৬ষ্ঠ থেকে ৮ম শ্রেণী") return "Class 6-8";
  return "HSC";
};

const getUniversitiesByGroup = (group?: string) => {
  const common = [
    { name: "ঢাকা বিশ্ববিদ্যালয়", short: "ঢাবি", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/39/University_of_Dhaka_logo.svg/512px-University_of_Dhaka_logo.svg.png" },
    { name: "রাজশাহী বিশ্ববিদ্যালয়", short: "রাবি", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/Rajshahi_University_Emblem.svg/512px-Rajshahi_University_Emblem.svg.png" },
    { name: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়", short: "জাবি", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Jahangirnagar_University_logo.svg/512px-Jahangirnagar_University_logo.svg.png" },
    { name: "চট্টগ্রাম বিশ্ববিদ্যালয়", short: "চবি", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/23/University_of_Chittagong_logo.svg/512px-University_of_Chittagong_logo.svg.png" },
    { name: "কুমিল্লা বিশ্ববিদ্যালয়", short: "কুবি", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Comilla_University_logo.svg/512px-Comilla_University_logo.svg.png" },
    { name: "গুচ্ছ (GST)", short: "গুচ্ছ", logo: "https://cdn-icons-png.flaticon.com/512/8076/8076045.png" },
  ];

  if (group === "বিজ্ঞান" || !group) {
    return [
      ...common,
      { name: "মেডিকেল", short: "মেডিকেল", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Star_of_life2.svg/512px-Star_of_life2.svg.png" },
      { name: "প্রকৌশল", short: "প্রকৌশল", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/96/BUET_LOGO.svg/512px-BUET_LOGO.svg.png" },
    ];
  }
  return common;
};

export default function QuestionBank() {
  const { userData } = useAuth();
  const isPWA = useIsPWA();
  const navigate = useNavigate();
  const initialClassGroup = mapUserClassToGroup(userData?.class);
  const [activeClassGroup, setActiveClassGroup] = useState(initialClassGroup);
  const [activeClass, setActiveClass] = useState(initialClassGroup === "Admission" ? "ঢাকা বিশ্ববিদ্যালয়" : (initialClassGroup === "Class 6-8" ? "Class 6" : initialClassGroup));
  const [questionFormat, setQuestionFormat] = useState<"MCQ" | "CQ" | null>(initialClassGroup === "Admission" ? "MCQ" : null);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const checkOffline = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', checkOffline);
    window.addEventListener('offline', checkOffline);
    return () => {
      window.removeEventListener('online', checkOffline);
      window.removeEventListener('offline', checkOffline);
    };
  }, []);

  const handleOfflineSync = async () => {
    setIsSyncing(true);
    try {
      const { collection, getDocs } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");
      await getDocs(collection(db, "questions"));
      alert("অফলাইন ব্যবহারের জন্য সকল প্রশ্ন ডাউনলোড করা হয়েছে! এখন ইন্টারনেট ছাড়াই প্রশ্নব্যাংক দেখতে পারবেন।");
    } catch(e) {
      console.error("Offline sync failed", e);
      alert("ডাউনলোড করতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ চেক করুন।");
    } finally {
      setIsSyncing(false);
    }
  };

  const dynamicSubjects = getSubjectsByGroup(userData?.group, activeClassGroup);

  useEffect(() => {
    if (questionFormat === "CQ" && activeClassGroup === "Admission") {
      setActiveClassGroup("HSC");
      setActiveClass("HSC");
    }
  }, [questionFormat, activeClassGroup]);

  // Auto-merge duplicate exams based on user instructions
  useEffect(() => {
    async function runFix() {
      try {
        const qTarget = query(collection(db, "questions"), where("title", "==", "ঢাবি সি ইউনিট ২৫-২৬ (MCQ)"));
        const snapTarget = await getDocs(qTarget);
        if (snapTarget.docs.length > 0) {
          const qBase = query(collection(db, "questions"), where("title", "==", "ঢাবি সি ২০২৫-২০২৬ (MCQ)"));
          const snapBase = await getDocs(qBase);
          let baseCount = snapBase.docs.length > 0 ? snapBase.docs.length : 36;
          
          let { writeBatch } = await import("firebase/firestore");
          const batch = writeBatch(db);
          let updated = 0;
          snapTarget.docs.forEach((doc, idx) => {
            batch.update(doc.ref, { 
              title: "ঢাবি সি ২০২৫-২০২৬ (MCQ)",
              question_no: baseCount + idx + 1
            });
            updated++;
          });
          await batch.commit();
          window.location.reload();
        }
      } catch(e) {
        console.error(e);
      }
    }
    runFix();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      try {
        let q = query(collection(db, "questions"), where("classGroup", "==", activeClassGroup));
        if (activeClassGroup === "Admission" && activeClass) {
          q = query(q, where("university", "==", activeClass));
        } else if (activeClassGroup !== "Admission" && activeClass) {
          q = query(q, where("class", "==", activeClass));
        }
        const snap = await getDocs(q);
        let results: any[] = [];
        snap.forEach(doc => results.push({ id: doc.id, ...doc.data() }));

        // Group by title
        const grouped = results.reduce((acc, q) => {
          const t = q.title || "Subject-wise Questions";
          if (!acc[t]) acc[t] = [];
          acc[t].push(q);
          return acc;
        }, {} as Record<string, any[]>);
        
        const papers = Object.keys(grouped).map(title => {
          const unique = new Map();
          grouped[title].forEach((r: any) => {
            r.correctOption = r.correctOption || r.correct_answer || r.correctAnswer || r.answer;
            if (unique.has(r.text)) {
              const existing = unique.get(r.text);
              if ((r.explanation && !existing.explanation) || (r.correctOption && !existing.correctOption)) {
                unique.set(r.text, r);
              }
            } else {
              unique.set(r.text, r);
            }
          });
          const deduplicatedQuestions = Array.from(unique.values());
          
          return {
            title,
            questions: deduplicatedQuestions
          };
        });

        setQuestionsList(papers);
      } catch (err) {
        console.error("Error fetching questions", err);
      } finally {
        setLoadingQuestions(false);
      }
    };
    if (questionFormat) {
      fetchQuestions();
    }
  }, [activeClassGroup, activeClass, selectedSubjects, questionFormat]);

  const toggleSubject = (s: string) => {
    setSelectedSubjects(prev => 
      prev.includes(s) ? prev.filter(sub => sub !== s) : [...prev, s]
    );
  };

  if (!questionFormat) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bengali font-bold text-slate-800 mb-4">কী ধরনের প্রশ্ন অনুশীলন করতে চাও?</h2>
          
          <div className="flex items-center justify-center gap-3 mb-6">
             {isOffline ? (
               <span className="flex items-center gap-1.5 text-sm bg-orange-100 text-orange-700 font-bengali px-3 py-1 rounded-full shrink-0">
                 <AlertCircle className="w-4 h-4" /> অফলাইন মোড
               </span>
             ) : (
               isPWA && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleOfflineSync} 
                  disabled={isSyncing}
                  className="font-bengali text-slate-600 rounded-full shrink-0"
                >
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  {isSyncing ? "ডাউনলোড হচ্ছে..." : "অফলাইনের জন্য সেভ করুন"}
                </Button>
               )
             )}
          </div>

          <p className="text-slate-500 font-bengali text-lg max-w-xl mx-auto">
            {activeClassGroup === "Admission" 
              ? "তোমার প্রস্তুতির ধরনের উপর ভিত্তি করে ক্যাটাগরি নির্বাচন করো। এখানে তুমি বহুনির্বাচনি (MCQ) প্রশ্ন পাবে।"
              : "তোমার প্রস্তুতির ধরনের উপর ভিত্তি করে ক্যাটাগরি নির্বাচন করো। এখানে তুমি বহুনির্বাচনি (MCQ) এবং সৃজনশীল (CQ) दोन्ही ধরনের প্রশ্ন পাবে।"
            }
          </p>
        </div>

        <div className={`grid ${activeClassGroup === "Admission" ? 'grid-cols-1 max-w-md' : 'md:grid-cols-2'} gap-6 max-w-2xl mx-auto`}>
          <motion.div
            whileHover={{ scale: 1.02, translateY: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setQuestionFormat("MCQ")}
            className="cursor-pointer bg-white border-2 border-slate-100 hover:border-primary/50 shadow-sm hover:shadow-md p-8 rounded-[32px] text-center transition-all group"
          >
            <div className="bg-primary/10 w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
              <LayoutList className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bengali font-bold text-slate-800 mb-2">MCQ প্রশ্ন</h3>
            <p className="text-slate-500 font-bengali">বহুনির্বাচনি প্রশ্ন এবং মডেল টেস্ট</p>
          </motion.div>

          {activeClassGroup !== "Admission" && (
            <motion.div
              whileHover={{ scale: 1.02, translateY: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setQuestionFormat("CQ")}
              className="cursor-pointer bg-white border-2 border-slate-100 hover:border-secondary/50 shadow-sm hover:shadow-md p-8 rounded-[32px] text-center transition-all group"
            >
              <div className="bg-secondary/10 w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/20 transition-colors">
                <PenTool className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-2xl font-bengali font-bold text-slate-800 mb-2">CQ প্রশ্ন</h3>
              <p className="text-slate-500 font-bengali">সৃজনশীল বা লিখিত প্রশ্নমালা</p>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  if (activeClassGroup === "Admission" && !selectedUniversity) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h3 className="font-bengali font-bold mb-8 text-3xl text-slate-800 text-center">বিশ্ববিদ্যালয় নির্বাচন করো</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {getUniversitiesByGroup(userData?.group).map(uni => (
            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              key={uni.name}
              onClick={() => {
                setSelectedUniversity(uni.name);
                setActiveClass(uni.name);
              }}
              className="flex flex-col items-center justify-center p-6 rounded-[24px] border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all bg-white shadow-sm hover:shadow-md"
            >
              <img src={uni.logo} alt={uni.short} className="w-16 h-16 object-contain mb-4" />
              <span className="font-bengali font-bold text-slate-800 text-lg">{uni.short}</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-6 bg-white p-6 rounded-[32px] border border-muted shadow-sm">
        <div>
          <h3 className="font-bengali font-bold mb-3 text-lg">অনুসন্ধান</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="প্রশ্ন খুঁজুন..." className="pl-9" />
          </div>
        </div>

        <Separator />

        {initialClassGroup !== "Admission" && (
          <>
            <div>
              <h3 className="font-bengali font-bold mb-3 text-lg flex items-center">
                <Filter className="w-4 h-4 mr-2" /> শ্রেণী (Class)
              </h3>
              <div className="flex flex-wrap gap-2">
                {filters.classes.map((c) => {
                  if (questionFormat === "CQ" && c === "Admission") return null;
                  return (
                  <Badge 
                    key={c} 
                    variant={activeClassGroup === c ? "default" : "secondary"}
                    className={`cursor-pointer ${activeClassGroup === c ? "bg-primary text-white" : "hover:bg-primary/20 text-slate-700"}`}
                    onClick={() => {
                      setActiveClassGroup(c);
                      if (c === "Class 6-8") {
                        setActiveClass("Class 6");
                      } else if (c === "Admission") {
                        setActiveClass("ঢাকা বিশ্ববিদ্যালয়");
                        setSelectedUniversity(null);
                      } else {
                        setActiveClass(c);
                        setSelectedUniversity(null);
                      }
                    }}
                  >
                    {c}
                  </Badge>
                )})}
              </div>

              {(activeClassGroup === "Class 6-8") && (
                <motion.div 
                   initial={{ opacity: 0, height: 0 }} 
                   animate={{ opacity: 1, height: 'auto' }} 
                   className="mt-3 flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl"
                >
                  {filters.subclasses[activeClassGroup as keyof typeof filters.subclasses]?.map((subc) => (
                    <Badge
                      key={subc}
                      variant={activeClass === subc ? "default" : "outline"}
                      className={`cursor-pointer ${activeClass === subc ? "bg-primary border-primary text-white" : "hover:bg-primary/10 border-slate-200 text-slate-600 bg-white"}`}
                      onClick={() => setActiveClass(subc)}
                    >
                      {subc}
                    </Badge>
                  ))}
                </motion.div>
              )}
            </div>

            <Separator />
          </>
        )}

        <div>
          <h3 className="font-bengali font-bold mb-3 text-lg">বিষয় (Subject)</h3>
          <ul className="space-y-2">
            {dynamicSubjects.map((s) => (
              <li key={s}>
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input type="checkbox" checked={selectedSubjects.includes(s)} onChange={() => toggleSubject(s)} className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="font-bengali group-hover:text-primary transition-colors">{s}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {(initialClassGroup !== "Admission" || activeClassGroup === "Admission") && (
              <button 
                onClick={() => {
                  if (activeClassGroup === "Admission") {
                    setSelectedUniversity(null);
                  } else {
                    setQuestionFormat(null);
                  }
                }} 
                className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                title="ফিরে যান"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-2xl font-bengali font-bold text-primary flex items-center">
              <BookOpen className="w-6 h-6 mr-3 text-secondary" /> 
              {activeClass} - {questionFormat} প্রশ্ন ব্যাংক
            </h2>
          </div>
          <span className="text-sm text-muted-foreground font-bengali bg-slate-100 px-4 py-2 rounded-full font-medium">{loadingQuestions ? "লোড হচ্ছে..." : `${questionsList.length} টি প্রশ্ন পাওয়া গেছে`}</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {loadingQuestions && <div className="text-center p-10 font-bengali text-slate-500 md:col-span-2">খোঁজা হচ্ছে...</div>}
          {!loadingQuestions && questionsList.length === 0 && <div className="text-center p-10 font-bengali text-slate-500 md:col-span-2">কোনো প্রশ্ন পাওয়া যায়নি।</div>}
          {questionsList.map((paper, idx) => (
            <Card key={idx} className="group hover:shadow-lg transition-all duration-300 rounded-[24px] sm:rounded-[28px] border-slate-200/80 bg-white cursor-pointer hover:-translate-y-1 relative overflow-hidden" onClick={() => navigate(`/paper?title=${encodeURIComponent(paper.title)}&classGroup=${encodeURIComponent(activeClassGroup)}&university=${encodeURIComponent(activeClass)}`)}>
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary/60 via-primary to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-6">
                <div className="flex flex-col h-full gap-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[11px] px-2.5 py-0.5 rounded-full font-medium">{questionFormat}</Badge>
                    <Badge variant="outline" className="bg-green-50/80 text-green-700 border-green-200/80 text-[11px] px-2.5 py-0.5 rounded-full font-medium font-bengali">{activeClass}</Badge>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50/50 flex items-center justify-center shrink-0 border border-indigo-100/50 text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-100 group-hover:text-primary transition-all duration-300 shadow-sm">
                       <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 pt-0.5 space-y-1.5">
                      <h3 className="font-bengali text-lg sm:text-[19px] text-slate-800 font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {paper.title}
                      </h3>
                      <p className="font-bengali text-sm text-slate-500 font-medium">{paper.questions.length} টি প্রশ্ন</p>
                    </div>
                  </div>

                  <div className="mt-2 pt-4 border-t border-slate-100/80">
                    <Button variant="secondary" className="w-full font-bengali text-secondary-foreground bg-[#FFB800] hover:bg-[#E5A600] shadow-sm transition-all rounded-[14px] py-5 text-[15px] font-semibold flex items-center justify-center gap-2 group-hover:shadow-md">
                      অনুশীলন শুরু করুন <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center pt-4">
          <Button variant="outline" className="font-bengali">আরও লোড করুন</Button>
        </div>
      </main>
    </div>
  );
}
