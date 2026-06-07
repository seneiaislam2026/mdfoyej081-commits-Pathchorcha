import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, BookOpen, Bookmark, BookmarkCheck, X, Eye, Clock, CheckCircle, ChevronRight, FileText, ArrowRight, Sparkles, BookOpenCheck, LayoutList, PenTool, Sun, Moon, Type } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

// Helper function to map user classes into standardized class groups
export const mapUserClassToGroup = (cls?: string) => {
  if (cls === "এডমিশন" || cls === "Admission") return "Admission";
  if (cls === "দশম শ্রেণী" || cls === "SSC") return "SSC";
  if (cls === "একাদশ শ্রেণী" || cls === "দ্বাদশ শ্রেণী" || cls === "HSC") return "HSC";
  if (cls === "নবম শ্রেণী" || cls === "Class 9") return "SSC";
  if (cls === "৬ষ্ঠ শ্রেণী" || cls === "৭ম শ্রেণী" || cls === "৮ম শ্রেণী" || cls === "৬ষ্ঠ থেকে ৮ম শ্রেণী" || cls === "Class 6-8") return "Class 6-8";
  return "Admission"; // Default fallback to Admission to prevent empty lists
};

export const getSubjectsByGroup = (group?: string, classGroup?: string) => {
  const common = ["বাংলা", "English", "ICT"];
  if (classGroup === "Class 6-8" || classGroup === "SSC") {
     return ["বাংলা", "English", "গণিত", "সাধারণ বিজ্ঞান", "বাংলাদেশ ও বিশ্বপরিচয়", "ধর্ম"];
  }
  
  if (group === "মানবিক") {
    return [...common, "ইতিহাস", "পৌরনীতি", "ভূগোল", "অর্থনীতি", "যুক্তিবিদ্যা", "সমাজবিজ্ঞান"];
  } else if (group === "বাণিজ্য") {
    return [...common, "হিসাববিজ্ঞান", "ব্যবসায় সংগঠন", "ফিন্যান্স", "উদ্ভাবন"];
  }
  return [...common, "উচ্চতর গণিত", "পদার্থবিজ্ঞান", "রসায়ন", "জীববিজ্ঞান"];
};

// Lecture Notes Database
export const ALL_NOTES = [
  {
    id: "sonar-tori",
    title: "সোনার তরী — সম্পূর্ণ মাস্টার নোট ও গাইড",
    subject: "বাংলা",
    classGroup: "HSC",
    badges: ["মাস্টার নোট", "বাংলা ১ম পত্র", "এইচএসসি ২০২৬"],
    description: "বর্ষার দিনে শাশ্বত কাল ও মানুষের অবিনশ্বর কীর্তির রূপক বিশ্লেষণ সম্বলিত পূর্ণাঙ্গ শিট ও সৃজনশীল প্রশ্নোত্তর বুস্টার।",
    link: "",
    isExternal: false,
    content: {
      intro: "এইচএসসি পরীক্ষা ২০২৬-এর জন্য ১০০% পরীক্ষামুখী স্পেশাল এডিশন - বিশ্বকবি রবীন্দ্রনাথ ঠাকুর (১৮৬১ - ১৯৪১) এর 'সোনার তরী' কবিতার সম্পূর্ণ মাস্টার নোট ও গাইড।",
      chapters: [
        {
          title: "১. এক নজরে কবি ও কাব্য পরিচিতি",
          items: [
            "কবি পরিচিতি: বিশ্বকবি রবীন্দ্রনাথ ঠাকুর (১৮৬১ - ১৯৪১)। ১৯১৩ খ্রিষ্টাব্দে 'গীতাঞ্জলি' কাব্যের জন্য এশিয়ার প্রথম নোবেলজয়ী সাহিত্যিক।",
            "উৎস ও নামাকরণ: ১৮৯৪ খ্রিষ্টাব্দে প্রকাশিত 'সোনার তরী' কাব্যগ্রন্থের নাম-কবিতা বা প্রথম কবিতা।",
            "রচনাকাল ও প্রেক্ষাপট: ১২৯৯ বঙ্গাব্দ (১৮৯২ খ্রিষ্টাব্দ)। কবি যখন জমিদারী দেখভালের জন্য পাবনার শিলাইদহে ছিলেন, তখন পদ্মা নদীর বুকে বোটে বসে এটি রচনা করেন।",
            "ছন্দ বিশ্লেষণ: শুদ্ধ মাত্রাবৃত্ত ছন্দ। কবিতার মূল পর্ব ৮ মাত্রার এবং অপূর্ণ পর্ব ৬ মাত্রার (৮+৬)। অত্যন্ত গতিময় চাল।",
            "মূল উপজীব্য: মহাকাল, মানুষের সৃষ্টিশীল কীর্তি এবং ব্যক্তিমানুষের অবিনশ্বরতার বিপরীতে নশ্বরতা।"
          ]
        },
        {
          title: "২. কবিতার মূলভাব ও গভীর জীবনদর্শন",
          items: [
            "'সোনার তরী' একটি নিটোল রূপক কবিতা। আপাতদৃষ্টিতে এর একটি বহিরাঙ্গ রূপ আছে— বর্ষার দিনে একলা কৃষক তার উৎপাদিত ধান নিয়ে নদীর তীরে দাঁড়িয়ে আছে, এক অচেনা মাঝি এসে তার সমস্ত ধান নৌকায় তুলে নিলেও নৌকায় কৃষকের জায়গা হয় না।",
            "কৃষক: সৃষ্টির আকুলতায় মগ্ন স্বয়ং কবি বা সাধারণ মানুষ।",
            "সোনার ধান: মানুষের সারাজীবনের শ্রেষ্ঠ কর্ম, মেধা, শ্রম বা শিল্পসৃষ্টি।",
            "ছোট খেত: মানুষের সীমাবদ্ধ ও ক্ষণস্থায়ী পার্থিব জীবন বা আয়ু।",
            "সোনার তরী ও মাঝি: নির্লিপ্ত, নিষ্ঠুর ও শাশ্বত মহাকাল বা সময়।",
            "মূল অন্তর্নিহিত দর্শন: মহাকাল মানুষের সৃষ্টিকে সাদরে গ্রহণ করে অমরত্ব দেয়, কিন্তু রক্ত-মাংসের ক্ষণভঙ্গুর মানুষকে পরম অবহেলায় পেছনে ফেলে যায়। সৃষ্টি অমর, কিন্তু সৃষ্টিকর্তা মরণশীল।"
          ]
        },
        {
          title: "৩. শব্দার্থ ও টীকা",
          items: [
            "ক্ষুরধারা: ক্ষুরের মতো ধারালো স্রোত। এখানে বর্ষার নদীর তীব্র ও প্রলয়ংকরী গতিকে বোঝানো হয়েছে।",
            "খরপরশা: বর্শার মতো তীক্ষ্ণ। কালস্রোতের নিষ্ঠুর রূপের প্রতীক।",
            "তরী: নৌকা। কবিতায় এটি মহাকালের প্রতীক রূপ হিসেবে ব্যবহৃত হয়েছে।"
          ]
        },
        {
          title: "৪. পঙক্তিভিত্তিক বিস্তারিত বিশ্লেষণ",
          items: [
            "❝ গগন গরজে মেঘ, ঘন বরষা। / একখানি ছোট খেত, আমি একেলা— ❞\n\nবিশ্লেষণ: কবিতার শুরুতেই এক থমথমে এবং বিষাদময় পরিবেশের অবতারণা করা হয়েছে। আকাশে মেঘের গর্জন এবং ঘন বর্ষা মানুষের জীবনের শেষ মুহূর্ত বা সংকটের প্রতীক। 'ছোট খেত' দিয়ে বোঝানো হয়েছে মানুষের আয়ু অত্যন্ত সীমিত, এবং এই মহাবিশ্বে মানুষ মূলত একা ও নিঃসঙ্গ।",
            "❝ চারি দিকে বাঁকা জল করিছে খেলা। / পরপার-পারে দেখি আঁকা তরুছায়ামসীমাখা ❞\n\nবিশ্লেষণ: 'বাঁকা জল' হলো চারপাশ থেকে ধেয়ে আসা অনিশ্চয়তা ও মৃত্যুভয়। নদীর ওপার বা পরপার দেখা যাচ্ছে কিন্তু তা অস্পষ্ট, মেঘে ঢাকা ও মসীমাখা (কালচে)। এটি মৃত্যুর ওপারের এক অজানা, রহস্যময় জগতের দিকে ইঙ্গিত করে।",
            "❝ ঠাঁই নাই, ঠাঁই নাই—ছোট সে তরী / আমারি সোনার ধানে গিয়েছে ভরি। ❞\n\nবিশ্লেষণ: এটি কবিতার সবচেয়ে গুরুত্বপূর্ণ মোড়। মহাকালের নৌকায় মানুষের সৃষ্টির স্থান সংকুলান হলেও, নশ্বর মানুষের নিজের কোনো স্থান হয় না। সৃষ্টি অমর, কিন্তু সৃষ্টিকর্তা মরণশীল।"
          ]
        },
        {
          title: "৫. সৃজনশীল অনুধাবনমূলক প্রশ্ন ও উত্তর (CQ Booster)",
          items: [
            "Q1. 'ঠাঁই নাই, ঠাঁই নাই— ছোট সে তরী' বলতে কবি কী বুঝিয়েছেন?\n\nউত্তর: 'সোনার তরী' কবিতায় আলোচ্য পঙক্তিটি দিয়ে কবি মহাকালের বুকে নশ্বর মানুষের স্থান না হওয়ার রূঢ় বাস্তবতাকে বুঝিয়েছেন। মহাকালের তরী বা এই পৃথিবী অত্যন্ত সীমাবদ্ধ। এখানে মানুষের মহৎ কর্ম বা সৃষ্টির স্থান হলেও, রক্ত-মাংসের ক্ষণস্থায়ী মানুষের নিজের কোনো চিরস্থায়ী স্থান বা আশ্রয় নেই। সময় মানুষের অমর সৃষ্টি বা শিল্পকে সাদরে গ্রহণ করে সংরক্ষণ করে, কিন্তু ব্যক্তি মানুষকে পরম অবহেলায় মৃত্যুর মুখে ফেলে রেখে যায়।",
            "Q2. 'দেখে যেন মনে হয় চিনি উহারে'— কৃষকের এমন উপলব্ধির কারণ কী?\n\nউত্তর: কৃষকের এমন উপলব্ধির কারণ হলো— তরীর মাঝি কোনো সাধারণ মানুষ নয়, সে হলো চিরন্তন মহাকাল বা সময়ের প্রতীক। মানুষ সচেতন বা অবচেতনভাবে মনে মনে জানে যে সময় বা মহাকাল এক পরম ও চিরচেনা সত্য। জীবনের সমস্ত কর্মের অবসান এবং চূড়ান্ত হিসাব এই সময়ের হাতেই নির্ধারিত হয়। সময়ের এই চিরন্তন ও অমোঘ রূপটির কারণেই তরী বেয়ে আসা অচেনা মাঝিকে দেখেও কৃষকের মনে হয়েছে সে তাকে চেনে।"
          ]
        }
      ]
    }
  },
  {
    id: "sototar-puroshkar",
    title: "সততার পুরস্কার — স্মার্ট নোট ও ডেটা শিট",
    subject: "বাংলা",
    classGroup: "Class 6-8",
    badges: ["মাস্টার নোট", "বাংলা ১ম পত্র", "৬ষ্ঠ শ্রেণী"],
    description: "ড. মুহম্মদ শহীদুল্লাহ্ রচিত হিতোপদেশমূলক কাহিনীর চরিত্র বিশ্লেষণ, কুইজ ও সৃজনশীল মেগা গাইড।",
    link: "",
    isExternal: false,
    content: {
      intro: "ড. মুহম্মদ শহীদুল্লাহ্ রচিত ‘সততার পুরস্কার’ নীতিকথার সম্পূর্ণ লেকচার শিট, তুলনামূলক ক্যারেক্টার চার্ট এবং উত্তরসহ সৃজনশীল প্রশ্ন বিশ্লেষণ।",
      chapters: [
        {
          title: "📖 ১. লেখক পরিচিতি ও প্রেক্ষাপট",
          items: [
            "ড. মুহম্মদ শহীদুল্লাহ্ (১৮৮৫-১৯৬৯) ছিলেন একাধারে অসাধারণ ভাষাবিদ, পণ্ডিত ও গবেষক।"
          ]
        }
      ]
    }
  }
];

export default function Notes() {
  const { userData } = useAuth();
  const userClass = userData?.class || "দ্বাদশ শ্রেণী";
  
  // States
  
  
  
  const [savedNotesState, setSavedNotesState] = useState<Record<string, boolean>>({});
  const [readingNote, setReadingNote] = useState<any | null>(null);
  const [saveLoading, setSaveLoading] = useState<string | null>(null);
  const [readerTheme, setReaderTheme] = useState<"light" | "sepia" | "dark">("light");
  const [readerFontSize, setReaderFontSize] = useState<"base" | "lg" | "xl">("lg");
  const [isBlurred, setIsBlurred] = useState(false);


  // Security Focus & Key blocker for Screenshot/Printscreen/Copying Prevention
  useEffect(() => {
    if (!readingNote) {
      setIsBlurred(false);
      return;
    }

    const handleBlur = () => {
      setIsBlurred(true);
    };

    const handleFocus = () => {
      setIsBlurred(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === "c" || e.key === "s" || e.key === "p" || e.key === "u")) ||
        e.key === "PrintScreen" ||
        e.key === "F12"
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [readingNote]);

  // Load saved notes status on mount
  useEffect(() => {
    const fetchSavedNotes = async () => {
      if (!userData?.uid) return;
      try {
        const tempSaved: Record<string, boolean> = {};
        for (const note of ALL_NOTES) {
          const docRef = doc(db, "users", userData.uid, "saved_notes", note.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            tempSaved[note.id] = true;
          }
        }
        setSavedNotesState(tempSaved);
      } catch (err) {
        console.error("Error loaded saved notes:", err);
      }
    };
    fetchSavedNotes();
  }, [userData]);

  // Handle toggling save/bookmark
  const handleToggleSaveNote = async (note: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userData?.uid) return;
    
    setSaveLoading(note.id);
    try {
      const docRef = doc(db, "users", userData.uid, "saved_notes", note.id);
      const isCurrentlySaved = !!savedNotesState[note.id];
      
      if (isCurrentlySaved) {
        await deleteDoc(docRef);
        setSavedNotesState(prev => ({ ...prev, [note.id]: false }));
      } else {
        await setDoc(docRef, {
          noteId: note.id,
          title: note.title,
          link: note.isExternal ? note.link : `/notes`,
          savedAt: new Date()
        });
        setSavedNotesState(prev => ({ ...prev, [note.id]: true }));
      }
    } catch (err) {
      console.error("Failed bookmarked save:", err);
    } finally {
      setSaveLoading(null);
    }
  };

    // All notes available directly without filtering by categoric pills
  const filteredNotes = ALL_NOTES;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 font-sans">
      
            {/* Clean Topbar */}
      <header className="bg-white border-b border-slate-100/80 sticky top-0 z-40 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full">
            <div className="h-10 w-10 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bengali text-lg font-extrabold text-[#0F2744]">লেকচার শিটস ও নোটস</h1>
              <p className="text-[11px] text-slate-400 font-medium font-bengali">সহজ ও সাবলীল উপস্থাপনায় আপনার পকেট মেন্টর</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Hero Banner Section */}
        <div className="relative bg-[#0F2744] rounded-[32px] p-6 sm:p-8 md:p-10 text-white overflow-hidden shadow-xl shadow-[#0F2744]/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-[-50%] right-[-10%] w-[350px] h-[350px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-30%] left-[-10%] w-[250px] h-[250px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 z-10 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 text-amber-300 font-bengali text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              প্রো লেকচার সিরিজ ২০২৬
            </div>
            <h2 className="font-bengali text-xl sm:text-2.5xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              এক্সক্লুসিভ প্রো ম্যাক্স লেকচার নোটস
            </h2>
            <p className="text-sm sm:text-base font-bengali text-slate-300 max-w-2xl leading-relaxed">
              মেধাবী শিক্ষক ও দেশসেরা টপারদের হাতে অত্যন্ত নিখুঁত ভাবে তৈরি করা এক্সক্লুসিভ গাইডবুক। প্রতিটি বিষয়ের গভীরে গিয়ে সহজ ও সুন্দরভাবে ব্যাখ্যা করা হয়েছে যা আপনার প্রস্তুতিকে করবে আরো একধাপ এগিয়ে।
            </p>
          </div>
        </div>

        {/* Dynamic Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-[32px] border border-slate-100 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bengali text-sm text-slate-500">আপনার সিলেক্ট করা ফিল্টারে কোনো নোট পাওয়া যায়নি। অন্য বিষয় সিলেক্ট করে ট্রাই করুন।</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredNotes.map((note) => {
              const isSaved = !!savedNotesState[note.id];
              return (
                <Card 
                  key={note.id} 
                  className="group hover:border-amber-200/60 transition-all duration-300 border border-slate-100 rounded-[24px] overflow-hidden bg-white shadow-sm hover:shadow-md"
                >
                  <CardContent className="p-5 sm:p-6 pb-5">
                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                      {/* Left Side Content */}
                      <div className="space-y-4 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1.5">
                           <h4 className="font-bengali text-lg sm:text-[1.35rem] text-[#0F2744] font-bold group-hover:text-amber-600 transition-colors leading-tight">
                              {note.title}
                            </h4>
                            <p className="font-bengali text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">
                              {note.description}
                            </p>
                          </div>
                          {/* Bookmark Action */}
                          <div className="sm:hidden">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={saveLoading === note.id}
                              onClick={(e) => handleToggleSaveNote(note, e)}
                              className={`rounded-full h-8 w-8 hover:bg-slate-100 ${
                                isSaved ? "text-amber-500" : "text-slate-300 hover:text-slate-500"
                              }`}
                            >
                              {isSaved ? <BookmarkCheck className="w-5 h-5 fill-amber-500" /> : <Bookmark className="w-5 h-5" />}
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {note.badges.map((b, idx) => (
                            <span 
                              key={idx} 
                              className={`font-bengali text-[11px] sm:text-xs rounded-full px-2.5 py-1 font-medium ${
                                idx === 0 
                                  ? "bg-amber-50 text-amber-700" 
                                  : "bg-slate-50 text-slate-600"
                              }`}
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right Side Call to Action */}
                      <div className="w-full sm:w-auto shrink-0 flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Desktop Bookmark Action (Hidden on mobile) */}
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={saveLoading === note.id}
                          onClick={(e) => handleToggleSaveNote(note, e)}
                          className={`hidden sm:flex rounded-full h-10 w-10 hover:bg-slate-50 ${
                            isSaved ? "text-amber-500" : "text-slate-300 hover:text-slate-400"
                          }`}
                        >
                          {isSaved ? <BookmarkCheck className="w-[1.125rem] h-[1.125rem] fill-amber-500" /> : <Bookmark className="w-[1.125rem] h-[1.125rem]" />}
                        </Button>

                        {note.isExternal ? (
                          <Link to={note.link} className="w-full sm:w-auto">
                            <Button className="font-bengali w-full rounded-2xl px-6 h-11 bg-[#0F2744] hover:bg-[#1a3a61] flex items-center justify-center gap-2">
                              <span>নোট পড়ুন</span> <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        ) : (
                          <Button 
                            onClick={() => setReadingNote(note)}
                            className="font-bengali w-full sm:w-auto rounded-2xl px-6 h-11 bg-amber-400 hover:bg-amber-500 font-bold text-[#0F2744] border-none flex items-center justify-center gap-2 shadow-sm"
                          >
                            <span>নোট পড়ুন</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Interactive Desktop textbook / E-Reader Overlay Modal */}
      <AnimatePresence>
        {readingNote && (() => {
          // Inner theme mappings
          const readerThemeConfig = {
            light: {
              bg: "bg-[#FCFBF7]",
              textTitle: "text-slate-950",
              textBody: "text-slate-800",
              textMute: "text-slate-500",
              border: "border-[#EDECDF]",
              headerBg: "bg-[#FCFBF7]/95",
              headerBorder: "border-[#EDECDF]",
              navButtonHover: "hover:bg-slate-250/50",
              introBg: "bg-[#F7F6EE] border-amber-600 text-stone-800",
              itemBg: "bg-white border-[#ECEBDD]",
              itemHover: "hover:bg-slate-50/50",
              itemNumberBg: "bg-stone-100 text-stone-500 group-hover:bg-primary/10 group-hover:text-primary",
              footerBg: "bg-[#FAF9F2] border-[#ECEBDD]",
              footerBtn: "bg-[#0F2744] hover:bg-[#1a3a61] text-white"
            },
            sepia: {
              bg: "bg-[#F4ECD8]",
              textTitle: "text-[#433422]",
              textBody: "text-[#4B3924]",
              textMute: "text-[#756550]",
              border: "border-[#E1D5B9]",
              headerBg: "bg-[#F4ECD8]/95",
              headerBorder: "border-[#E1D5B9]",
              navButtonHover: "hover:bg-[#E9DDBF]",
              introBg: "bg-[#EAE0C5] border-amber-700 text-[#433422]",
              itemBg: "bg-[#FCF6EB] border-[#DDD1B4]",
              itemHover: "hover:bg-[#F2E7CC]",
              itemNumberBg: "bg-[#EFE5CD] text-[#7A644D] group-hover:bg-[#B45309]/15 group-hover:text-[#B45309]",
              footerBg: "bg-[#EFE5CD] border-[#DDD1B4]",
              footerBtn: "bg-amber-800 hover:bg-amber-900 text-[#FCFBF7]"
            },
            dark: {
              bg: "bg-[#121212]",
              textTitle: "text-[#EFEEF1]",
              textBody: "text-[#D2D2D7]",
              textMute: "text-[#888899]",
              border: "border-[#2D2D2D]",
              headerBg: "bg-[#121212]/95",
              headerBorder: "border-[#2D2D2D]",
              navButtonHover: "hover:bg-[#202020]",
              introBg: "bg-[#1E1B18] border-amber-500 text-amber-200/90",
              itemBg: "bg-[#1C1C1C] border-[#2D2D2D]",
              itemHover: "hover:bg-[#252525]",
              itemNumberBg: "bg-[#252525] text-[#888888] group-hover:bg-amber-500/10 group-hover:text-amber-400",
              footerBg: "bg-[#181818] border-[#2B2B2B]",
              footerBtn: "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
            }
          };

          const tc = readerThemeConfig[readerTheme];

          const fontSizeClass = {
            base: "text-sm sm:text-base leading-relaxed",
            lg: "text-base sm:text-lg leading-relaxed",
            xl: "text-lg sm:text-xl leading-relaxed"
          }[readerFontSize];

          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#070E1B]/80 backdrop-blur-md z-999 flex justify-end overflow-hidden font-sans"
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className={`w-full max-w-3xl min-h-screen shadow-2xl flex flex-col relative overflow-y-auto overflow-x-hidden ${tc.bg}`}
              >
                
                {/* Secure Overlay blur blocker */}
                {isBlurred && (
                  <div className="absolute inset-0 bg-slate-950/95 z-999 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
                    <span className="text-5xl mb-4">🛡️</span>
                    <h3 className="text-white font-bengali font-bold text-xl md:text-2xl">স্ক্রিনশট বা কপি করা সম্পূর্ণ নিষিদ্ধ!</h3>
                    <p className="text-slate-400 font-bengali text-xs md:text-sm mt-2 max-w-sm">
                      শিক্ষাঙ্গন প্ল্যাটফর্মের গোপনীয়তা ও মেধা সম্পদ রক্ষার স্বার্থে এই পেইজের স্ক্রিনশট বা কপি মেকানিজম ব্লক করা হয়েছে।
                    </p>
                    <p className="text-amber-500 font-bold text-[11px] uppercase tracking-widest mt-4">Screen capture protected</p>
                  </div>
                )}
                
                {/* E-Reader Fixed Header */}
                <header className={`sticky top-0 backdrop-blur-md border-b py-3 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-50 transition-colors duration-300 ${tc.headerBg} ${tc.headerBorder}`}>
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button 
                      onClick={() => setReadingNote(null)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${tc.navButtonHover}`}
                    >
                      <X className={`w-5 h-5 ${tc.textTitle}`} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-sans tracking-widest text-[#B45309] font-bold uppercase block">PRO READ E-READER</span>
                      <h3 className={`font-bengali font-bold text-xs sm:text-sm truncate select-none ${tc.textTitle}`}>
                        {readingNote.title}
                      </h3>
                    </div>
                  </div>

                  {/* Settings Controls (Themes & Font Sizes) */}
                  <div className={`flex items-center gap-2.5 shrink-0 self-end sm:self-center bg-black/5 dark:bg-white/5 rounded-2xl p-1 border ${tc.border}`}>
                    {/* Theme buttons */}
                    <div className="flex items-center gap-0.5">
                      <button 
                        onClick={() => setReaderTheme("light")}
                        className={`h-7 px-2 px-3 text-[11px] font-bengali font-bold rounded-xl transition-all ${readerTheme === "light" ? "bg-white text-slate-900 shadow-xs" : "text-slate-550 hover:text-slate-700"}`}
                      >
                        দিন
                      </button>
                      <button 
                        onClick={() => setReaderTheme("sepia")}
                        className={`h-7 px-2 px-3 text-[11px] font-bengali font-bold rounded-xl transition-all ${readerTheme === "sepia" ? "bg-[#ECD9B8] text-[#5C4217] shadow-xs" : "text-slate-550 hover:text-slate-700"}`}
                      >
                        সেপিয়া
                      </button>
                      <button 
                        onClick={() => setReaderTheme("dark")}
                        className={`h-7 px-2 px-3 text-[11px] font-bengali font-bold rounded-xl transition-all ${readerTheme === "dark" ? "bg-zinc-800 text-zinc-100 shadow-xs" : "text-slate-550 hover:text-slate-700"}`}
                      >
                        রাত
                      </button>
                    </div>

                    <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700" />

                    {/* Font Sizer buttons */}
                    <div className="flex items-center gap-0.5">
                      <button 
                        onClick={() => setReaderFontSize("base")}
                        className={`h-7 w-7 text-xs font-semibold rounded-xl transition-all ${readerFontSize === "base" ? "bg-amber-450 bg-amber-400 text-slate-950 font-black" : "text-slate-550 hover:text-slate-800"}`}
                      >
                        Ab
                      </button>
                      <button 
                        onClick={() => setReaderFontSize("lg")}
                        className={`h-7 w-7 text-sm font-semibold rounded-xl transition-all ${readerFontSize === "lg" ? "bg-amber-450 bg-amber-400 text-slate-950 font-black" : "text-slate-550 hover:text-slate-800"}`}
                      >
                        Ab+
                      </button>
                    </div>
                  </div>
                </header>

                {/* Reader Core Content Body */}
                <div className="p-5 sm:p-8 md:p-10 flex-1 w-full max-w-2xl mx-auto space-y-6 sm:space-y-8 select-none overflow-x-hidden break-words">
                  
                  {/* Note Banner Info */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {readingNote.badges.map((b: string, i: number) => (
                        <Badge key={i} className="bg-amber-500/10 border-amber-500/20 text-amber-700 hover:bg-amber-100 font-bengali text-xs rounded-md shadow-xs">
                          {b}
                        </Badge>
                      ))}
                      <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 font-bengali text-xs rounded-md shadow-xs">
                        মেগা গাইড ২০২৬
                      </Badge>
                    </div>
                    <h1 className={`font-bengali font-extrabold text-2xl sm:text-3xl leading-tight transition-colors duration-300 ${tc.textTitle}`}>
                      {readingNote.title}
                    </h1>
                    <p className={`text-sm sm:text-base font-bengali leading-relaxed italic border-l-4 p-4.5 rounded-r-2xl transition-all duration-300 ${tc.introBg}`}>
                      {readingNote.content?.intro}
                    </p>
                  </div>

                  {/* Chapters / Sections Content blocks */}
                  <div className="space-y-10 sm:space-y-14 pt-4">
                    {readingNote.content?.chapters?.map((chapter: any, cIdx: number) => (
                      <section key={cIdx} className="space-y-5">
                        <h2 className={`font-bengali font-extrabold text-xl sm:text-2xl transition-colors duration-300 ${tc.textTitle}`}>
                          {chapter.title}
                        </h2>
                        
                        <div className="space-y-5 w-full">
                          {chapter.items.map((item: string, iIdx: number) => (
                            <div 
                              key={iIdx} 
                              className="flex items-start gap-3 w-full"
                            >
                              <span className={`mt-1 font-bold font-sans text-[16px] shrink-0 ${tc.textTitle} opacity-30 select-none`}>
                                —
                              </span>
                              <p className={`font-bengali ${fontSizeClass} tracking-wide select-none break-words flex-1 transition-all duration-300 ${tc.textBody}`}>
                                {item}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>

                  <div className={`h-[1px] w-full transition-colors duration-300 ${tc.border}`} />

                  {/* Footnote stamp */}
                  <div className={`rounded-3xl border p-6 text-center space-y-3.5 select-none transition-colors duration-300 ${tc.footerBg} ${tc.border}`}>
                    <div className="h-10 w-10 bg-amber-500/15 rounded-full flex items-center justify-center mx-auto">
                      <BookOpenCheck className="w-5 h-5 text-amber-600" />
                    </div>
                    <h4 className={`font-bengali font-bold text-base transition-colors duration-300 ${tc.textTitle}`}>অনলাইন পাঠ সমাপ্ত!</h4>
                    <p className={`font-bengali text-xs max-w-sm mx-auto leading-relaxed transition-colors duration-300 ${tc.textMute}`}>এই লেকচারটি আপনি সম্পূর্ণ পড়তে পেরেছেন। প্র্যাকটিস এবং কুপন কার্ডের সাথে নিজেকে রাখুন এগিয়ে।</p>
                    
                    <div className="pt-2">
                      <Button 
                        onClick={() => setReadingNote(null)}
                        className={`font-bengali text-xs font-bold rounded-xl shadow-xs px-6 py-2.5 h-9.5 transition-all hover:scale-[1.02] active:scale-[0.98] ${tc.footerBtn}`}
                      >
                        পড়া শেষ করুন
                      </Button>
                    </div>
                  </div>

                </div>

              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Bottom Navigation Tab Bar (exactly matching screenshot 3) */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200/80 py-3.5 px-6 flex justify-around items-center z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.03)] rounded-t-[28px] max-w-lg mx-auto">
        <button 
          className="flex-1 flex flex-col items-center gap-1 transition-all relative text-emerald-600 scale-102 cursor-pointer"
        >
          <BookOpen className="w-5 h-5 shrink-0" />
          <span className="text-[11px] sm:text-xs font-bengali font-bold">নোটস</span>
          <motion.div layoutId="bottom_indicator" className="absolute bottom-[-15px] inset-x-12 h-1 bg-emerald-500 rounded-full" />
        </button>

        <Link 
          to="/bank?tab=topics"
          className="flex-1 flex flex-col items-center gap-1 transition-all relative text-slate-400 hover:text-slate-500 cursor-pointer"
        >
          <LayoutList className="w-5 h-5 shrink-0" />
          <span className="text-[11px] sm:text-xs font-bengali font-bold">টপিক ভিত্তিক নোটস</span>
        </Link>

        <Link 
          to="/bank?tab=practice"
          className="flex-1 flex flex-col items-center gap-1 transition-all relative text-slate-400 hover:text-slate-500 cursor-pointer"
        >
          <PenTool className="w-5 h-5 shrink-0" />
          <span className="text-[11px] sm:text-xs font-bengali font-bold">প্র্যাকটিস</span>
        </Link>
      </div>

    </div>
  );
}
