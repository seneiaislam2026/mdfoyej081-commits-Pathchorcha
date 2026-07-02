import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

import { managementMCQs } from "../data/managementMcqs";
import { hscIctCQ } from "../data/hscIctCqData";

const BANGLA_CHAPTER_ORDER = [
  "বাঙ্গালার নব্য লেখকদিগের প্রতি নিবেদন",
  "অপরিচিতা",
  "বিলাসী",
  "আমার পথ",
  "গৃহ",
  "আহ্বান",
  "মানব-কল্যাণ",
  "মাসি-পিসি",
  "বায়ান্নর দিনগুলো",
  "নেকলেস",
  "মহাজাগতিক কিউরেটর",
  "রেইনকোট",
  "ফেব্রুয়ারি ১৯৬৯",
  "১৮ বছর বয়স",
  "ঐকতান",
  "নূরলদীনের সারাজীবন"
];

const getSubjectEquivalents = (sub: string): string[] => {
  if (!sub) return [];
  const s = sub.trim().toLowerCase();
  
  if (s.includes("bangla 1") || s === "বাংলা" || s === "bangla" || s === "বাংলা ১ম" || s === "বাংলা ১ম পত্র" || s === "bangla 1st" || s === "bangla 1st paper" || s.includes("bangla first") || s.includes("বাংলা প্রথম")) {
    return ["Bangla 1st Paper", "বাংলা", "bangla", "বাংলা ১ম", "বাংলা ১ম পত্র", "bangla 1", "bangla 1st", "bangla 1st paper", "Bangla First Paper", "bangla first paper", "বাংলা প্রথম", "বাংলা প্রথম পত্র"];
  }
  if (s.includes("bangla 2") || s === "বাংলা ২য়" || s === "বাংলা ২য় পত্র" || s === "bangla 2nd" || s === "bangla 2nd paper" || s.includes("bangla second") || s.includes("বাংলা দ্বিতীয়")) {
    return ["Bangla 2nd Paper", "বাংলা ২য়", "বাংলা ২য় পত্র", "bangla 2", "bangla 2nd", "bangla 2nd paper", "Bangla Second Paper", "bangla second paper", "বাংলা দ্বিতীয়", "বাংলা দ্বিতীয় পত্র"];
  }
  if (s.includes("english 1") || s === "ইংরেজি" || s === "english" || s === "ইংরেজি ১ম" || s === "ইংরেজি ১ম পত্র" || s === "english 1st" || s === "english 1st paper" || s.includes("english first")) {
    return ["English 1st Paper", "ইংরেজি", "english", "ইংরেজি ১ম", "ইংরেজি ১ম পত্র", "english 1", "english 1st", "english 1st paper", "English First Paper", "english first paper"];
  }
  if (s.includes("english 2") || s === "ইংরেজি ২য়" || s === "ইংরেজি ২য় পত্র" || s === "english 2nd" || s === "english 2nd paper" || s.includes("english second")) {
    return ["English 2nd Paper", "ইংরেজি ২য়", "ইংরেজি ২য় পত্র", "english 2", "english 2nd", "english 2nd paper", "English Second Paper", "english second paper"];
  }
  if (s.includes("accounting 1") || s === "হিসাববিজ্ঞান" || s === "accounting" || s === "হিসাববিজ্ঞান ১ম" || s === "হিসাববিজ্ঞান ১ম পত্র" || s === "accounting 1st" || s === "accounting 1st paper" || s.includes("accounting first")) {
    return ["Accounting 1st Paper", "হিসাববিজ্ঞান", "accounting", "হিসাববিজ্ঞান ১ম", "হিসাববিজ্ঞান ১ম পত্র", "accounting 1", "accounting 1st", "accounting 1st paper", "Accounting First Paper", "accounting first paper"];
  }
  if (s.includes("accounting 2") || s === "হিসাববিজ্ঞান ২য়" || s === "হিসাববিজ্ঞান ২য় পত্র" || s === "accounting 2nd" || s === "accounting 2nd paper" || s.includes("accounting second")) {
    return ["Accounting 2nd Paper", "হিসাববিজ্ঞান ২য়", "হিসাববিজ্ঞান ২য় পত্র", "accounting 2", "accounting 2nd", "accounting 2nd paper", "Accounting Second Paper", "accounting second paper"];
  }
  if (s.includes("physics 1") || s === "পদার্থবিজ্ঞান" || s === "physics" || s === "পদার্থবিজ্ঞান ১ম" || s === "পদার্থবিজ্ঞান ১ম পত্র" || s === "physics 1st" || s === "physics 1st paper" || s.includes("physics first")) {
    return ["Physics 1st Paper", "পদার্থবিজ্ঞান", "physics", "পদার্থবিজ্ঞান ১ম", "পদার্থবিজ্ঞান ১ম পত্র", "physics 1", "physics 1st", "physics 1st paper", "Physics First Paper", "physics first paper"];
  }
  if (s.includes("physics 2") || s === "পদার্থবিজ্ঞান ২য়" || s === "পদার্থবিজ্ঞান ২য় পত্র" || s === "physics 2nd" || s === "physics 2nd paper" || s.includes("physics second")) {
    return ["Physics 2nd Paper", "পদার্থবিজ্ঞান ২য়", "পদার্থবিজ্ঞান ২য় পত্র", "physics 2", "physics 2nd", "physics 2nd paper", "Physics Second Paper", "physics second paper"];
  }
  if (s.includes("chemistry 1") || s === "রসায়ন" || s === "chemistry" || s === "রসায়ন ১ম" || s === "রসায়ন ১ম পত্র" || s === "chemistry 1st" || s === "chemistry 1st paper" || s.includes("chemistry first")) {
    return ["Chemistry 1st Paper", "রসায়ন", "chemistry", "রসায়ন ১ম", "রসায়ন ১ম পত্র", "chemistry 1", "chemistry 1st", "chemistry 1st paper", "Chemistry First Paper", "chemistry first paper"];
  }
  if (s.includes("chemistry 2") || s === "রসায়ন ২য়" || s === "রসায়ন ২য় পত্র" || s === "chemistry 2nd" || s === "chemistry 2nd paper" || s.includes("chemistry second")) {
    return ["Chemistry 2nd Paper", "রসায়ন ২য়", "রসায়ন ২য় পত্র", "chemistry 2", "chemistry 2nd", "chemistry 2nd paper", "Chemistry Second Paper", "chemistry second paper"];
  }
  if (s.includes("biology 1") || s === "জীববিজ্ঞান" || s === "biology" || s === "জীববিজ্ঞান ১ম" || s === "জীববিজ্ঞান ১ম পত্র" || s === "biology 1st" || s === "biology 1st paper" || s.includes("biology first")) {
    return ["Biology 1st Paper", "জীববিজ্ঞান", "biology", "জীববিজ্ঞান ১ম", "জীববিজ্ঞান ১ম পত্র", "biology 1", "biology 1st", "biology 1st paper", "Biology First Paper", "biology first paper"];
  }
  if (s.includes("biology 2") || s === "জীববিজ্ঞান ২য়" || s === "জীববিজ্ঞান ২য় পত্র" || s === "biology 2nd" || s === "biology 2nd paper" || s.includes("biology second")) {
    return ["Biology 2nd Paper", "জীববিজ্ঞান ২য়", "জীববিজ্ঞান ২য় পত্র", "biology 2", "biology 2nd", "biology 2nd paper", "Biology Second Paper", "biology second paper"];
  }
  if (s.includes("higher math 1") || s === "উচ্চতর গণিত" || s === "উচ্চতর গণিত ১ম" || s === "উচ্চতর গণিত ১ম পত্র" || s === "higher math 1st" || s === "higher math 1st paper" || s === "math 1" || s === "math 1st" || s === "math 1st paper" || s === "গণিত ১ম" || s === "গণিত" || s.includes("math first")) {
    return ["Higher Math 1st Paper", "উচ্চতর গণিত", "উচ্চতর গণিত ১ম", "উচ্চতর গণিত ১ম পত্র", "higher math", "higher math 1", "higher math 1st", "higher math 1st paper", "math 1", "math 1st", "math 1st paper", "গণিত ১ম", "গণিত", "Higher Math First Paper", "higher math first paper"];
  }
  if (s.includes("higher math 2") || s === "উচ্চতর গণিত ২য়" || s === "উচ্চতর গণিত ২য় পত্র" || s === "higher math 2nd" || s === "higher math 2nd paper" || s === "math 2" || s === "math 2nd" || s === "math 2nd paper" || s === "গণিত ২য়" || s.includes("math second")) {
    return ["Higher Math 2nd Paper", "উচ্চতর গণিত ২য়", "উচ্চতর গণিত ২য় পত্র", "higher math 2", "higher math 2nd", "higher math 2nd paper", "math 2", "math 2nd", "math 2nd paper", "গণিত ২য়", "Higher Math Second Paper", "higher math second paper"];
  }
  if (s.includes("management 1") || s === "ব্যবস্থাপনা" || s === "management" || s === "ব্যবস্থাপনা ১ম" || s === "ব্যবস্থাপনা ১ম পত্র" || s === "management 1st" || s === "management 1st paper" || s === "ব্যবসায় সংগঠন ও ব্যবস্থাপনা" || s === "ব্যবসায় সংগঠন" || s.includes("management first")) {
    return ["Management 1st Paper", "ব্যবস্থাপনা", "management", "ব্যবস্থাপনা ১ম", "ব্যবস্থাপনা ১ম পত্র", "management 1", "management 1st", "management 1st paper", "ব্যবসায় সংগঠন ও ব্যবস্থাপনা", "ব্যবসায় সংগঠন", "Management First Paper", "management first paper"];
  }
  if (s.includes("management 2") || s === "ব্যবস্থাপনা ২য়" || s === "ব্যবস্থাপনা ২য় পত্র" || s === "management 2nd" || s === "management 2nd paper" || s.includes("management second")) {
    return ["Management 2nd Paper", "ব্যবস্থাপনা ২য়", "ব্যবস্থাপনা ২য় পত্র", "management 2", "management 2nd", "management 2nd paper", "Management Second Paper", "management second paper"];
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
  
  const englishYearRegex = /\b(20\d{2})\b/;
  const bengaliYearRegex = /[২০][০-৯]{3}/;
  
  if (englishYearRegex.test(title) || bengaliYearRegex.test(title)) {
    return true;
  }
  
  return keywords.some(kw => t.includes(kw));
};

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

  // Infinite scroll support states
  const [allChapters, setAllChapters] = useState<string[]>([]);
  const [loadedChapters, setLoadedChapters] = useState<string[]>(title ? [title] : []);
  const [loadingNext, setLoadingNext] = useState(false);

  const fetchQuestionsForTitle = async (titleToFetch: string) => {
    try {
      let q = query(collection(db, "questions"), where("title", "==", titleToFetch));
      const snap = await getDocs(q);
      
      const equivalents = subjectParam ? getSubjectEquivalents(subjectParam) : [];
      const equivalentsLower = equivalents.map(e => e.toLowerCase());

      let results: any[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        
        // Client-side subject equivalents filter
        if (subjectParam && equivalentsLower.length > 0) {
          const docSub = (data.subject || "").trim().toLowerCase();
          if (!equivalentsLower.includes(docSub)) return;
        }

        // Client-side classGroup filter
        if (classGroup) {
          const isHscBoard = (data.isBoardQuestion === true || isBoardOrExamPaper(titleToFetch || "")) && 
                             (data.classGroup === "HSC" || !data.classGroup);
          if (isHscBoard) {
            // HSC Board questions are visible to both HSC and Admission
            if (classGroup !== "HSC" && classGroup !== "Admission") return;
          } else {
            if (classGroup === "Admission") {
              if (data.classGroup !== "Admission" && data.classGroup !== "HSC") return;
            } else {
              if (data.classGroup && data.classGroup !== classGroup) return;
            }
          }
        }

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
      localQ = localQ.filter(m => m.title === titleToFetch);
      if (subjectParam) {
        const equivalents = getSubjectEquivalents(subjectParam);
        localQ = localQ.filter(m => equivalents.includes(m.subject));
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
      const deduplicatedResults = Array.from(unique.values());
      
      // Sort by question_no if available
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
      return deduplicatedResults;
    } catch (err) {
      console.error("Error fetching paper questions", err);
      return [];
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      try {
        // 1. Fetch all available chapters for this subject/format
        let qAll = query(collection(db, "questions"));
        if (classGroup) {
          if (classGroup === "Admission") {
            qAll = query(qAll, where("classGroup", "in", ["Admission", "HSC"]));
          } else {
            qAll = query(qAll, where("classGroup", "==", classGroup));
          }
        }
        const allSnap = await getDocs(qAll);
        
        const equivalents = subjectParam ? getSubjectEquivalents(subjectParam) : [];
        const equivalentsLower = equivalents.map(e => e.toLowerCase());

        let groups: Record<string, boolean> = {};
        allSnap.forEach(doc => {
          const data = doc.data();

          // Client-side subject filter
          if (subjectParam && equivalentsLower.length > 0) {
            const docSub = (data.subject || "").trim().toLowerCase();
            if (!equivalentsLower.includes(docSub)) return;
          }

          let is_cq = data.is_cq === true;
          let is_k_vandar = data.is_k_vandar === true;
          let is_kh_vandar = data.is_kh_vandar === true;
          
          if (format) {
            if (format === "MCQ" && is_cq) return;
            if (format === "CQ" && (!is_cq || is_k_vandar || is_kh_vandar)) return;
            if (format === "KaBhandar" && !is_k_vandar) return;
            if (format === "KhaBhandar" && !is_kh_vandar) return;
          }
          if (data.title) {
            groups[data.title] = true;
          }
        });

        // Local chapters check
        let localQ = [...(managementMCQs as any[]), ...(hscIctCQ as any[])];
        if (subjectParam) {
          const equivalents = getSubjectEquivalents(subjectParam);
          localQ = localQ.filter(m => equivalents.includes(m.subject));
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
        localQ.forEach(doc => {
          if (doc.title) {
            groups[doc.title] = true;
          }
        });

        let titlesList = Object.keys(groups);
        titlesList.sort((a, b) => {
          if (subjectParam === "Bangla 1st Paper") {
            const idxA = BANGLA_CHAPTER_ORDER.indexOf(a);
            const idxB = BANGLA_CHAPTER_ORDER.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
          }
          return a.localeCompare(b);
        });

        setAllChapters(titlesList);

        // 2. Fetch initial chapter questions
        if (title && title !== "Subject-wise Questions") {
          const initialQ = await fetchQuestionsForTitle(title);
          setQuestions(initialQ);
          setLoadedChapters([title]);
        } else {
          // Fallback to fetch all as before
          let q = query(collection(db, "questions"));
          if (classGroup) {
            if (classGroup === "Admission") {
              q = query(q, where("classGroup", "in", ["Admission", "HSC"]));
            } else {
              q = query(q, where("classGroup", "==", classGroup));
            }
          }
          
          const snap = await getDocs(q);
          let results: any[] = [];
          const equivalentsLower = subjectParam ? getSubjectEquivalents(subjectParam).map(e => e.toLowerCase()) : [];
          snap.forEach(doc => {
            const data = doc.data();
            
            // Client-side filtering for class/university
            if (classGroup && university) {
              if (classGroup === "Admission") {
                if (data.university !== university) return;
              } else {
                if (data.class !== university) return;
              }
            }
            
            if (title === "Subject-wise Questions" && data.title) return; // Skip questions that belong to a specific paper
            if (subjectParam && data.subject && !equivalentsLower.includes(data.subject.toLowerCase())) return;

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

          let finalLocal = localQ;
          if (classGroup && university) {
            finalLocal = finalLocal.filter(m => !m.classGroup || m.classGroup === classGroup || true);
            if (classGroup === "Admission") {
              finalLocal = finalLocal.filter(m => !m.university || m.university === university);
            } else {
              finalLocal = finalLocal.filter(m => !m.class || m.class === university);
            }
          }
          results = [...results, ...finalLocal];

          const unique = new Map();
          results.forEach(r => {
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
          const deduplicatedResults = Array.from(unique.values());
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
          setLoadedChapters(["Subject-wise Questions"]);
        }
      } catch (err) {
        console.error("Error fetching paper questions", err);
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [title, classGroup, university, subjectParam, format]);

  // Infinite Scroll Trigger
  const enableInfiniteScroll = title && title !== "Subject-wise Questions";

  const triggerLoadNextChapter = async () => {
    if (loadingNext || !enableInfiniteScroll || allChapters.length === 0) return;
    
    const lastLoaded = loadedChapters[loadedChapters.length - 1];
    const lastIdx = allChapters.indexOf(lastLoaded);
    if (lastIdx === -1 || lastIdx + 1 >= allChapters.length) return;

    const nextTitle = allChapters[lastIdx + 1];
    setLoadingNext(true);
    
    try {
      const nextQuestions = await fetchQuestionsForTitle(nextTitle);
      if (nextQuestions.length > 0) {
        setQuestions(prev => {
          const existingIds = new Set(prev.map(q => q.id || q.text));
          const filteredNext = nextQuestions.filter(q => !existingIds.has(q.id || q.text));
          return [...prev, ...filteredNext];
        });
      }
      setLoadedChapters(prev => [...prev, nextTitle]);
    } catch (err) {
      console.error("Error loading next chapter", err);
    } finally {
      setLoadingNext(false);
    }
  };

  useEffect(() => {
    if (!enableInfiniteScroll || loading || loadingNext || allChapters.length === 0) return;

    const handleScroll = () => {
      const threshold = 300; // Load next chapter when 300px away from page bottom
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (docHeight - (scrollTop + windowHeight) < threshold) {
        triggerLoadNextChapter();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadedChapters, allChapters, loading, loadingNext, enableInfiniteScroll]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getNextChapterTitle = () => {
    if (!enableInfiniteScroll || allChapters.length === 0) return null;
    const lastLoaded = loadedChapters[loadedChapters.length - 1];
    const lastIdx = allChapters.indexOf(lastLoaded);
    if (lastIdx === -1 || lastIdx + 1 >= allChapters.length) return null;
    return allChapters[lastIdx + 1];
  };

  const nextChapterTitle = getNextChapterTitle();

  return (
    <div className="min-h-screen bg-background font-sans pb-32">
      {/* Header */}
      <div className="px-4 pt-4 md:px-8 md:pt-8 max-w-4xl mx-auto">
        <div className="bg-card border border-slate-200 shadow-sm px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between rounded-3xl">
          <button 
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate(`/subject-papers?subject=${encodeURIComponent(subjectParam || "")}&format=${encodeURIComponent(format || "")}&classGroup=${encodeURIComponent(classGroup || "")}`);
              }
            }} 
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
        {loadedChapters.map((chapTitle) => {
          const chapQuestions = questions.filter(q => {
            if (chapTitle === "Subject-wise Questions") return true;
            return (q.title || "Uncategorized") === chapTitle;
          });

          if (chapQuestions.length === 0) return null;

          return (
            <div key={chapTitle} className="bg-card rounded-3xl p-5 md:p-8 shadow-sm border border-slate-200/60 transition-all">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="text-xl font-bengali font-bold text-foreground">
                  {chapTitle === "Subject-wise Questions" ? `${subjectParam || "বিষয়ভিত্তিক"} MCQ` : chapTitle}
                </h2>
              </div>
              
              <div className="space-y-10">
                {chapQuestions.map((q, qIdx) => {
                  const qSerial = q.question_no || (qIdx + 1);
                  return (
                    <div key={`${q.id || "q"}-${chapTitle}-${qIdx}`} className="relative border-b border-slate-50 pb-8 last:border-0 last:pb-0">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-slate-100 text-muted-foreground px-2.5 py-0.5 rounded-lg text-xs font-bold font-bengali">
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
          );
        })}

        {/* Next Chapter Loading Indicator & Button */}
        {nextChapterTitle ? (
          <div className="bg-card/50 border border-slate-200 border-dashed rounded-3xl p-6 text-center shadow-sm max-w-xl mx-auto transition-all">
            <p className="font-bengali text-sm text-slate-500 mb-3">
              পরবর্তী অধ্যায়: <span className="font-bold text-slate-700">{nextChapterTitle}</span>
            </p>
            <button 
              onClick={triggerLoadNextChapter}
              disabled={loadingNext}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-bengali text-sm py-2.5 px-6 rounded-full shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {loadingNext ? "লোড হচ্ছে..." : "পরবর্তী অধ্যায় লোড করুন"}
            </button>
          </div>
        ) : null}

        {loadingNext && (
          <div className="flex justify-center items-center py-6">
            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
