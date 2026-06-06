import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, BookOpen, Bookmark, BookmarkCheck, X, Eye, Clock, CheckCircle, ChevronRight, FileText, ArrowRight, Sparkles, BookOpenCheck, LayoutList, PenTool } from "lucide-react";
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
    link: "/notes/sonar-tori",
    isExternal: true,
  },
  {
    id: "sototar-puroshkar",
    title: "সততার পুরস্কার — স্মার্ট নোট ও ডেটা শিট",
    subject: "বাংলা",
    classGroup: "Class 6-8",
    badges: ["মাস্টার নোট", "বাংলা ১ম পত্র", "৬ষ্ঠ শ্রেণী"],
    description: "ড. মুহম্মদ শহীদুল্লাহ্ রচিত হিতোপদেশমূলক কাহিনীর চরিত্র বিশ্লেষণ, কুইজ ও সৃজনশীল মেগা গাইড।",
    link: "/notes/sototar-puroshkar",
    isExternal: true,
  },
  {
    id: "du-ka-physics",
    title: "ঢাবি ক ইউনিট — পদার্থবিজ্ঞান মেগা রিভিশন শিট",
    subject: "পদার্থবিজ্ঞান",
    classGroup: "Admission",
    badges: ["এডমিশন স্পেশাল", "পদার্থবিজ্ঞান", "ঢাবি ক ইউনিট"],
    description: "বিগত ১০ বছরের ঢাবি প্রশ্ন বিশ্লেষণ, গাণিতিক সূত্রের শর্টকাট হ্যাকস ও গুরুত্বপূর্ণ অধ্যায়ভিত্তিক সমাধান বুকলেট।",
    link: "",
    isExternal: false,
    content: {
      intro: "ঢাকা বিশ্ববিদ্যালয় ক ইউনিটের পদার্থবিজ্ঞান ভর্তি পরীক্ষায় সর্বোচ্চ মার্কস নিশ্চিত করার জন্য তৈরি এই শিটটি বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য অত্যন্ত সহায়ক। এতে রয়েছে পদার্থবিদ্যা ১ম ও ২য় পত্রের জটিল গতিবিদ্যক সূত্রের শর্টকার্ড ব্যাখ্যা এবং রিভিশন হ্যাকস।",
      chapters: [
        {
          title: "১. ভেক্টর ও বলবিদ্যা (Vector & Dynamics Hacks)",
          items: [
            "ডট গুণন ও ক্রস গুণনের চূড়ান্ত প্রয়োগ: A . B = AB cosθ এবং AxB = AB sinθ n^। ভেক্টরদ্বয় লম্ব হওয়ার শর্ত: A . B = 0। সমান্তরাল হওয়ার শর্ত: AxB = 0 বা অনুপাত সমান।",
            "নদীর অংক হ্যাকস: সর্বনিম্ন সময়ে নদী পার হতে θ = 90° কোণে রওনা দিতে হবে (t = d / u)। সর্বনিম্ন দূরত্বে নদী সোজাসুজি পার হতে cosθ = -v/u কোণে রওনা দিতে হবে।"
          ]
        },
        {
          title: "২. নিউটনীয় বলবিদ্যা ও কাজ-শক্তি (Newtonian Mechanics)",
          items: [
            "রাস্তার ব্যাংকিং কোণ: tanθ = v² / rg। ব্যাংকিং উচ্চতা: h = L sinθ ≈ L tanθ = L v² / rg।",
            "কুয়া বা পেনের অংক: কুয়া পানি শূন্য করার ক্ষেত্রে পিস্টনের গড় সরণ বা ভরকেন্দ্রের সরণ হ্যাক (h = L/2 যদি কুয়া সম্পন্ন পূর্ণ থাকে এবং খালি করা হয়)।"
          ]
        },
        {
          title: "৩. জড়তার ভ্রামক শর্টকার্ট চার্ট",
          items: [
            "সরু সুষম দণ্ডের মধ্যবিন্দু দিয়ে লম্ব অক্ষের সাপেক্ষে: I = 1/12 M L²। সুষম দণ্ডের একপ্রান্ত দিয়ে অক্ষের সাপেক্ষে: I = 1/3 M L²।",
            "নিরেট বৃত্তাকার চাকতি (Disc) বা সিলিন্ডারের অক্ষের সাপেক্ষে: I = 1/2 M R²।"
          ]
        }
      ]
    }
  },
  {
    id: "du-ga-accounting",
    title: "ঢাবি সি ইউনিট — হিসাববিজ্ঞান চূড়ান্ত বুলেট নোট",
    subject: "হিসাববিজ্ঞান",
    classGroup: "Admission",
    badges: ["এডমিশন স্পেশাল", "হিসাববিজ্ঞান", "ঢাবি সি ইউনিট"],
    description: "হিসাব সমীকরণ, ডেবিট-ক্রেডিট বিশ্লেষণ, অবচয় ও শেয়ার ইস্যুর চূড়ান্ত রিভিশন হ্যাকস ও কুইজ প্রশ্নাবলি।",
    link: "",
    isExternal: false,
    content: {
      intro: "ঢাকা বিশ্ববিদ্যালয় সি ইউনিট (ব্যবসায় শিক্ষা) ভর্তি পরীক্ষার জন্য হিসাববিজ্ঞানের অত্যন্ত গুরুত্বপূর্ণ টপিক ও ম্যাজিক ট্রিকস। বিগত বছরগুলোর ঢাবি প্রশ্নের প্যাটার্ন অনুকরণ করে রিভিশন শিটটি সাজানো হয়েছে।",
      chapters: [
        {
          title: "১. হিসাব সমীকরণ ও লেনদেনের দ্বিমুখী প্রভাব (Accounting Equation)",
          items: [
            "মূল হিসাব সমীকরণ: A = L + OE (Assets = Liabilities + Owner's Equity)। বর্ধিত সমীকরণ: A = L + Capital + Revenue - Expense - Drawings।",
            "লেনদেনের প্রভাব: সম্পদ বৃদ্ধি পেলে দায় অথবা মালিকানা স্বত্ব সমান পরিমাণে বৃদ্ধি পাবে। সম্পদ হ্রাস পেলে সমান পরিমাণে দায় অথবা মালিকানা স্বত্ব হ্রাস পাবে।"
          ]
        },
        {
          title: "২. অবচয় হিসাবরক্ষণ ট্রিকস (Depreciation Hacks)",
          items: [
            "সরলরেখিক পদ্ধতি: অবচয় = (প্রাথমিক অর্জন মূল্য - ভগ্নাবশেষ মূল্য) / আয়ুষ্কাল। অবচয়ের হার ও পরিমাণ প্রতি বছর সমান থাকে।",
            "ক্রমহ্রাসমান জের পদ্ধতি অবচয় হার = (১ / আয়ুষ্কাল) × ২ × ১০০%। এই পদ্ধতিতে ভগ্নাবশেষ মূল্য প্রাথমিক অবস্থায় বাদ দেওয়া হয় না, প্রতি বছর অবচয়যোগ্য মূল্যের উপর ধার্য্য করা হয়।"
          ]
        }
      ]
    }
  },
  {
    id: "ru-ba-english",
    title: "রাবি বি ইউনিট — ইংরেজি মেগা লেকচার নোট",
    subject: "English",
    classGroup: "Admission",
    badges: ["এডমিশন স্পেশাল", "English", "রাবি বি ইউনিট"],
    description: "রাজশাহী বিশ্ববিদ্যালয় বি ইউনিটের জন্য উপযুক্ত ভোকাবুলারি, প্রিপজিশন, কারেকশন ও কম্প্রিহেনশন ট্রিকস।",
    link: "",
    isExternal: false,
    content: {
      intro: "রাজশাহী বিশ্ববিদ্যালয় (RU) বি ইউনিট ভর্তি পরীক্ষায় ইংরেজিতে সর্বোচ্চ নম্বর নিশ্চিত করার গোপন টেকনিক, Grammatical Rules এবং বিগত বছরসমূহের প্রশ্নাবলি সমন্বিত স্পেশাল শিট।",
      chapters: [
        {
          title: "1. Subject-Verb Agreement Rules",
          items: [
            "Collective Nouns (family, jury, committee, audience) take a singular verb when acting as a single unit ('The team is strong.'). But a plural verb when members act individually ('The jury are divided in their opinions.').",
            "Phrases like 'together with', 'along with', 'as well as', 'accompanied by' do not modify the actual singular subject: 'The teacher along with the students was checking the book.'"
          ]
        },
        {
          title: "2. Ultimate Appropriate Prepositions",
          items: [
            "Abide by (আইন মেনে চলা), Absent from (অনুপস্থিত), Excel in (দক্ষ হওয়া)।",
            "Differentiate between 'Provide with' and 'Provide to': You provide someone WITH something ('They provided us with resources') but provide something TO/FOR someone ('They provided resources to us')."
          ]
        }
      ]
    }
  },
  {
    id: "med-bio-card",
    title: "মেডিকেল ভর্তি পরীক্ষা — জীববিজ্ঞান শর্টকাট ফ্ল্যাশকার্ড",
    subject: "জীববিজ্ঞান",
    classGroup: "Admission",
    badges: ["মেডিকেল স্পেশাল", "জীববিজ্ঞান", "মেডিকেল ২০২৬"],
    description: "উদ্ভিদবিজ্ঞান ও প্রাণিবিজ্ঞানের অতি গুরুত্বপূর্ণ তথ্যসমূহ, ক্রোমোজোম চার্ট ও জটিল বৈজ্ঞানিক নাম মনে রাখার সহজ নেমোনিক্স।",
    link: "",
    isExternal: false,
    content: {
      intro: "মেডিকেল কলেজ ভর্তি পরীক্ষার জীববিজ্ঞান অংশে সম্পূর্ণ নম্বর উঠানোর জন্য তৈরি করা হয়েছে এই রিভিশন চিপস। এখানে থাকা ট্রিকসগুলোর মাধ্যমে সেকেন্ডেই জটিল বৈজ্ঞানিক তথ্য মস্তিষ্কে ধারণ করতে পারবেন।",
      chapters: [
        {
          title: "১. কোষের অঙ্গাণু ও তাদের ডাকনাম (Cell Organelles)",
          items: [
            "পাওয়ার হাউস (Power House): মাইটোকন্ড্রিয়া। প্রোটিন ফ্যাক্টরি (Protein Factory): রাইবোজোম। ট্রাফিক পুলিশ (Traffic Police): গলজি বডি।",
            "আত্মঘাতী থলিকা (Suicidal Bag) হিসেবে সুপরিচিত এনজাইমপূর্ণ অঙ্গাণু: লাইসোসোম।"
          ]
        },
        {
          title: "২. রক্ত ও সংবহনতন্ত্র (Blood and Cardiac Secrets)",
          items: [
            "রক্তের সাধারণ pH মাত্রা: ৭.৩৫ থেকে ৭.৪৫ পর্যন্ত (সামান্য ক্ষারীয়)। লোহিত রক্তকণিকার (RBC) গড় আয়ুর কাল প্রায় ১২০ দিন বা ৪ মাস।",
            "প্রাকৃতিক উপায়ে হৃদস্পন্দন নিয়ন্ত্রণকারী বা 'প্রাকৃতিক পেসমেকার' হলো সাইনো-অ্যাট্রিয়াল নোড (SAN)।"
          ]
        }
      ]
    }
  },
  {
    id: "ssc-math-geometry",
    title: "এসএসসি ২০২৬ — উচ্চতর গণিত (জ্যামিতি বিশেষ)",
    subject: "উচ্চতর গণিত",
    classGroup: "SSC",
    badges: ["মেগা গাইড", "উচ্চতর গণিত", "এসএসসি ২০২৬"],
    description: "পিথাগোরাসের উপপাদ্যের বিস্তারিত প্রমাণ, ভেক্টর জ্যামিতি ও স্থানাঙ্ক জ্যামিতির ম্যাজিক্যাল শর্টকাট ট্রিকস ও প্র্যাকটিস শিট।",
    link: "",
    isExternal: false,
    content: {
      intro: "এসএসসি পরীক্ষার উচ্চতর গণিত বিষয়ের জ্যামিতি অংশের ভীতি দূর করতে এই বিশেষ শিটটি তৈরি করা হয়েছে। এতে রয়েছে উপপাদ্য ও সম্পাদ্যের জটিল চিত্রগুলোর সহজ অঙ্কন পদ্ধতি এবং গাণিতিক সূত্রাবলি।",
      chapters: [
        {
          title: "১. পিথাগোরাসের উপপাদ্যের বিস্তৃত রূপ ও অ্যাপোলোনিয়াসের উপপাদ্য",
          items: [
            "অ্যাপোলোনিয়াসের উপপাদ্য: ত্রিভুজের যেকোনো দুই বাহুর ওপর অঙ্কিত বর্গক্ষেত্রদ্বয়ের সমষ্টির অর্ধেক হবে অন্য বাহুর ওপর অঙ্কিত মধ্যমার বর্গের এবং ওই বাহুর অর্ধেকের বর্গের সমষ্টির সমান (AB² + AC² = 2(AD² + BD²))। এটি সকল ত্রিভুজের ক্ষেত্রে সত্য এবং মধ্যমার দৈর্ঘ্য নির্ণয়ের প্রধান ভিত্তিপ্রস্তর।",
            "অর্ধবৃত্তস্থ কোণ সর্বদা এক সমকোণ বা ৯০ ডিগ্রির সমান। এটি দ্রুত অবজেক্টিভ ও বহুনির্বাচনি প্রশ্নের সমাধানে ব্যবহৃত হয়।"
          ]
        },
        {
          title: "২. ক্ষেত্রফল ও পিথাগোরাসের ব্যবহার",
          items: [
            "সমকোণী ত্রিভুজের অতিভুজের ওপর অঙ্কিত বর্গক্ষেত্র অপর দুই বাহুর ওপর অঙ্কিত বর্গক্ষেত্রের সমষ্টির সমান (অতিভুজ² = ভূমি² + লম্ব²)।"
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
  const [activeClassGroup, setActiveClassGroup] = useState<string>(() => mapUserClassToGroup(userClass));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [savedNotesState, setSavedNotesState] = useState<Record<string, boolean>>({});
  const [readingNote, setReadingNote] = useState<any | null>(null);
  const [saveLoading, setSaveLoading] = useState<string | null>(null);

  const dynamicSubjects = getSubjectsByGroup(userData?.group, activeClassGroup);

  // Sync active filters on class change
  useEffect(() => {
    setSelectedSubjects([]);
  }, [activeClassGroup]);

  // Sync active class group with user's profile class when it loads (dhuklei notes show korbe)
  useEffect(() => {
    if (userData?.class) {
      setActiveClassGroup(mapUserClassToGroup(userData.class));
    }
  }, [userData]);

  // Load saved notes status on mount and when user auth changes
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

  // Handle toggling local + remote bookmark
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

  // Switch subject selection
  const toggleSubject = (subj: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]
    );
  };

  // Filter notes in real time
  const filteredNotes = ALL_NOTES.filter(note => {
    // 1. Class group match
    if (note.classGroup !== activeClassGroup) return false;
    
    // 2. Department/Group subject match (Strict registration limit)
    if (!dynamicSubjects.includes(note.subject)) return false;
    
    // 3. Search query match (title/badges/description)
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const titleMatch = note.title.toLowerCase().includes(query);
      const descMatch = note.description.toLowerCase().includes(query);
      const subjMatch = note.subject.toLowerCase().includes(query);
      if (!titleMatch && !descMatch && !subjMatch) return false;
    }

    // 4. Subject filter match
    if (selectedSubjects.length > 0) {
      if (!selectedSubjects.includes(note.subject)) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[80vh] relative pb-24">
      
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm md:sticky md:top-20 h-fit">
        <div>
          <h3 className="font-bengali font-bold mb-3 text-lg text-slate-800">অনুসন্ধান</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="নোট খুঁজুন..." 
              className="pl-9 font-bengali bg-slate-50/50 border-slate-200" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>


      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-8">
        
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bengali font-bold text-[#0F2744] flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-amber-500 shrink-0" /> 
              {activeClassGroup === "Admission" ? "এডমিশন - লেকচার নোটস" : 
               activeClassGroup === "HSC" ? "এইচএসসি - লেকচার নোটস" :
               activeClassGroup === "SSC" ? "এসএসসি - লেকচার নোটস" :
               "৬ষ্ঠ-৮ম শ্রেণী - লেকচার নোটস"}
            </h2>
            <p className="text-sm font-bengali text-slate-500">মেধাবী শিক্ষক ও টপারদের হাতে অত্যন্ত নিখুঁত ও সহজভাবে ব্যাখ্যা করা গাইডবুক</p>
          </div>
          <span className="text-xs sm:text-sm text-slate-500 font-bengali bg-slate-100/70 border border-slate-200 rounded-full px-4 py-2 shrink-0 h-fit self-start sm:self-center">
            {filteredNotes.length} টি নোট পাওয়া গেছে
          </span>
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
                  className="group hover:shadow-md hover:border-slate-300/80 transition-all border border-slate-200/80 rounded-[28px] overflow-hidden shadow-xs bg-white"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      {/* Left contents */}
                      <div className="space-y-3.5 flex-1 select-none">
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] font-bold tracking-wider text-slate-400 font-sans">LECTURE NOTE</span>
                          {note.badges.map((b, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className={`font-bengali text-[10px] sm:text-xs rounded-full border px-2.5 py-0.5 ${
                                idx === 0 
                                  ? "bg-primary/5 text-primary border-primary/20 hover:bg-primary/5 font-extrabold" 
                                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-55"
                              }`}
                            >
                              {b}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="font-bengali text-base sm:text-lg text-slate-800 font-bold transition-colors group-hover:text-primary">
                            {note.title}
                          </h4>
                          <p className="font-bengali text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
                            {note.description}
                          </p>
                        </div>
                      </div>

                      {/* Bookmark Save Action */}
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={saveLoading === note.id}
                        onClick={(e) => handleToggleSaveNote(note, e)}
                        className={`shrink-0 rounded-full h-9 w-9 transition-colors ${
                          isSaved 
                            ? "bg-primary/15 text-primary border-primary/20 hover:bg-primary/20" 
                            : "text-slate-400 hover:text-slate-600 border-slate-200"
                        }`}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4 fill-primary" /> : <Bookmark className="w-4 h-4" />}
                      </Button>
                    </div>

                    <Separator className="bg-slate-100 my-4" />

                    {/* Bottom action row */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bengali">
                        <Eye className="w-3.5 h-3.5" /> <span>১২.৫k এর বেশি ছাত্র পড়েছে</span>
                      </div>
                      
                      {note.isExternal ? (
                        <Link to={note.link}>
                          <Button size="sm" className="font-bengali shrink-0 rounded-2xl px-5 py-2 h-9 text-xs sm:text-sm bg-primary hover:bg-primary/95 shadow-xs flex items-center gap-1">
                            <span>নোট পড়ুন</span> <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => setReadingNote(note)}
                          className="font-bengali shrink-0 rounded-2xl px-5 py-2 h-9 text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 font-bold text-slate-900 border-none shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <span>নোট পড়ুন</span> <Sparkles className="w-4 h-4 text-slate-900 group-hover:animate-pulse" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Subject-wise options at the footer / bottom of Notes list */}
        <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-xs space-y-3 mt-8">
          <div className="flex items-center gap-2 text-[#0F2744]">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span className="font-bengali font-bold text-sm">বিষয়ভিত্তিক আলাদা পেজে যান:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {dynamicSubjects.map((s) => {
              return (
                <Link
                  key={s}
                  to={`/notes/subject/${encodeURIComponent(s)}`}
                  className="px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bengali font-bold bg-slate-50 text-slate-650 hover:bg-primary hover:text-white border border-slate-200 transition-all duration-250 cursor-pointer shadow-xs whitespace-nowrap block"
                >
                  {s} এর নোটস →
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      {/* Interactive Desktop textbook / E-Reader Overlay Modal */}
      <AnimatePresence>
        {readingNote && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#070E1B]/75 backdrop-blur-md z-999 flex justify-end overflow-hidden font-sans"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="bg-[#FCFBF7] w-full max-w-3xl min-h-screen shadow-2xl flex flex-col relative overflow-y-auto"
            >
              
              {/* E-Reader Fixed Header */}
              <header className="sticky top-0 bg-[#FCFBF7]/95 backdrop-blur-md border-b border-[#EDECDF] py-4 px-6 flex items-center justify-between z-50">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setReadingNote(null)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-650"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="space-y-0.5 select-none">
                    <span className="text-[10px] font-sans tracking-wide text-rose-500 font-bold uppercase">PRO READ READER VIEW</span>
                    <h3 className="font-bengali text-slate-800 font-bold text-sm sm:text-base line-clamp-1">
                      {readingNote.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleToggleSaveNote(readingNote, e)}
                    className={`rounded-full gap-1.5 font-bengali text-xs h-8.5 px-3.5 ${
                      !!savedNotesState[readingNote.id] 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "text-slate-500 border-slate-300"
                    }`}
                  >
                    {!!savedNotesState[readingNote.id] ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 fill-primary" />
                        <span>সেভ করা হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4" />
                        <span>সেভ করুন</span>
                      </>
                    )}
                  </Button>
                </div>
              </header>

              {/* Reader Core Content Body */}
              <div className="p-6 sm:p-10 flex-1 max-w-2xl mx-auto space-y-8 select-text">
                
                {/* Note Banner Info */}
                <div className="space-y-4">
                  <div className="flex gap-2.5">
                    {readingNote.badges.map((b: string, i: number) => (
                      <Badge key={i} className="bg-amber-100 border-amber-300/40 text-amber-800 hover:bg-amber-100 font-bengali text-xs rounded-md">
                        {b}
                      </Badge>
                    ))}
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bengali text-xs rounded-md">
                      এডমিশন স্পেশাল ২০২৬
                    </Badge>
                  </div>
                  <h1 className="font-bengali font-extrabold text-2xl sm:text-3.5xl text-slate-900 leading-tight">
                    {readingNote.title}
                  </h1>
                  <p className="text-sm font-bengali text-slate-500 leading-relaxed italic bg-[#F7F6EE] border-l-4 border-amber-500 p-4 rounded-r-2xl">
                    {readingNote.content?.intro}
                  </p>
                </div>

                {/* Chapters / Sections Accordion & Content blocks */}
                <div className="space-y-6 pt-4">
                  {readingNote.content?.chapters?.map((chapter: any, cIdx: number) => (
                    <section key={cIdx} className="space-y-3">
                      <h2 className="font-bengali font-bold text-lg sm:text-xl text-[#0F2744] border-b border-[#EDECDF] pb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-6 bg-primary rounded-full shrink-0" />
                        {chapter.title}
                      </h2>
                      
                      <div className="space-y-3 pl-1.5 sm:pl-3">
                        {chapter.items.map((item: string, iIdx: number) => (
                          <div 
                            key={iIdx} 
                            className="bg-white hover:bg-slate-50/50 p-4.5 rounded-[18px] border border-[#ECEBDD] shadow-xs flex items-start gap-3 transition-colors group"
                          >
                            <span className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold font-sans text-xs shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              {iIdx + 1}
                            </span>
                            <p className="font-bengali text-slate-700 text-sm sm:text-base leading-relaxed flex-1 select-text">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                <Separator className="bg-[#EDECDF]" />

                {/* Footnote stamp */}
                <div className="bg-[#FAF9F2] border border-[#ECEBDD] rounded-[24px] p-6 text-center space-y-2.5 select-none">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <BookOpenCheck className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-bengali font-bold text-slate-800 text-base">অধ্যায় সমাপ্ত হয়েছে!</h4>
                  <p className="font-bengali text-xs text-slate-400">এই লেকচারটি সম্পূর্ণ পড়তে পেরেছেন। প্র্যাকটিস এবং কুপন কার্ডের সাথে নিজেকে রাখুন এগিয়ে।</p>
                  
                  <div className="pt-2">
                    <Button 
                      onClick={() => setReadingNote(null)}
                      className="font-bengali text-xs rounded-xl bg-primary hover:bg-primary/95 text-white shadow-xs px-6 py-2.5 h-9"
                    >
                      পড়া শেষ করুন
                    </Button>
                  </div>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
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
          <span className="text-[11px] sm:text-xs font-bengali font-bold">টপিক ভিত্তিক প্রশ্ন</span>
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
