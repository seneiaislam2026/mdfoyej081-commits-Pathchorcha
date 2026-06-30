import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Bookmark, BookmarkCheck, ArrowLeft, Eye, Sparkles, X, ChevronRight, FileText, CheckCircle, Clock, LayoutList, PenTool, Printer, BookOpenCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { ALL_NOTES, mapUserClassToGroup } from "./Notes";

export default function SubjectNotes() {
  const { subjectName } = useParams();
  const { userData } = useAuth();
  const decodedSubject = decodeURIComponent(subjectName || "");
  const userClass = userData?.class || "এইচএসসি";
  const userClassGroup = mapUserClassToGroup(userClass);

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [dbNotes, setDbNotes] = useState<any[]>([]);
  const [savedNotesState, setSavedNotesState] = useState<Record<string, boolean>>({});
  const [readingNote, setReadingNote] = useState<any | null>(null);
  const [saveLoading, setSaveLoading] = useState<string | null>(null);
  const [readerTheme, setReaderTheme] = useState<"light" | "sepia" | "dark">("light");
  const [readerFontSize, setReaderFontSize] = useState<"base" | "lg" | "xl">("lg");
  const [isBlurred, setIsBlurred] = useState(false);

  // Focus and Blur Security Mechanism
  useEffect(() => {
    if (!readingNote) {
      setIsBlurred(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === "c" || e.key === "s" || e.key === "p" || e.key === "u" || e.key === "P" || e.key === "C" || e.key === "S")) ||
        (e.metaKey && (e.key === "p" || e.key === "P" || e.key === "s" || e.key === "S" || e.key === "c" || e.key === "C")) ||
        e.key === "PrintScreen" ||
        e.key === "F12"
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleBeforePrint = (e: Event) => {
      e.preventDefault();
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    const handleBlur = () => {
      setTimeout(() => {
        if (!document.hasFocus()) {
          setIsBlurred(true);
        }
      }, 150);
    };

    const handleFocus = () => {
      setIsBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("beforeprint", handleBeforePrint, true);
    window.addEventListener("copy", handleCopy, true);
    window.addEventListener("blur", handleBlur, true);
    window.addEventListener("focus", handleFocus, true);
    document.addEventListener("visibilitychange", handleVisibilityChange, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("beforeprint", handleBeforePrint, true);
      window.removeEventListener("copy", handleCopy, true);
      window.removeEventListener("blur", handleBlur, true);
      window.removeEventListener("focus", handleFocus, true);
      document.removeEventListener("visibilitychange", handleVisibilityChange, true);
    };
  }, [readingNote]);

  // Load custom notes from db
  useEffect(() => {
    const fetchDbNotes = async () => {
      try {
        const { collection, getDocs } = await import("firebase/firestore");
        const querySnapshot = await getDocs(collection(db, "notes"));
        const list: any[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setDbNotes(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDbNotes();
  }, []);

  // Load saved notes status on mount
  useEffect(() => {
    const fetchSavedNotes = async () => {
      if (!userData?.uid) return;
      try {
        const tempSaved: Record<string, boolean> = {};
        const combined = [...ALL_NOTES, ...dbNotes];
        for (const note of combined) {
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
  }, [userData, dbNotes]);

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

  // Filter notes based on class group AND current subject
  const filteredNotes = [...ALL_NOTES, ...dbNotes].filter(note => {
    if (note.classGroup !== userClassGroup) return false;

    let isSubjectMatch = note.subject.toLowerCase() === decodedSubject.toLowerCase();
    const lowerDecoded = decodedSubject.toLowerCase();
    if (lowerDecoded === "ব্যবস্থাপনা" || lowerDecoded === "ব্যবসায় সংগঠন" || lowerDecoded === "ব্যবসায় সংগঠন ও ব্যবস্থাপনা") {
      const lowerNoteSub = note.subject.toLowerCase();
      isSubjectMatch = (
        lowerNoteSub === "ব্যবস্থাপনা" ||
        lowerNoteSub === "ব্যবসায় সংগঠন" ||
        lowerNoteSub === "ব্যবসায় সংগঠন ও ব্যবস্থাপনা"
      );
    }
    if (!isSubjectMatch) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const titleMatch = note.title?.toLowerCase().includes(query);
      const descMatch = note.description?.toLowerCase().includes(query);
      const badgeMatch = note.badges?.some((b: string) => b.toLowerCase().includes(query));
      if (!titleMatch && !descMatch && !badgeMatch) return false;
    }

    return true;
  });

  const displayClassText = () => {
    if (userClassGroup === "Admission") return "এডমিশন";
    if (userClassGroup === "HSC") return "এইচএসসি";
    if (userClassGroup === "SSC") return "এসএসসি";
    return "৬ষ্ঠ-৮ম শ্রেণী";
  };

  return (
    <div className="min-h-screen bg-background pb-28 font-sans antialiased text-foreground">
      
      {/* Clean Topbar */}
      <header className="bg-card border-b border-slate-150 sticky top-0 z-50 px-4 sm:px-6 py-4.5 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full">
            <Link to="/notes" className="h-10 w-10 bg-muted hover:bg-slate-100 active:scale-95 border border-slate-200/60 rounded-2xl flex items-center justify-center text-[#0F2744] transition-all shrink-0 hover:shadow-xs" aria-label="Back">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 rounded-full text-[10px] sm:text-xs font-bold font-bengali px-2 py-0">
                  {displayClassText()}
                </Badge>
                <span className="text-slate-300 font-sans text-xs">•</span>
                <span className="text-slate-400 font-bengali text-xs font-semibold">বিষয়ভিত্তিক নোটস</span>
              </div>
              <h1 className="font-bengali text-lg sm:text-xl font-extrabold text-[#0F2744] tracking-tight">{decodedSubject}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Search Bar Block */}
        <div className="bg-card border border-slate-150 p-4 sm:p-5 rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] w-full relative">
           <div className="relative w-full">
             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
             <Input 
               type="search" 
               placeholder={`${decodedSubject} বিষয়ের স্পেসিফিক নোট খুঁজুন...`} 
               className="pl-10 h-12 font-bengali text-sm bg-muted/70 hover:bg-muted border-slate-200 focus-visible:ring-emerald-500 rounded-[16px] w-full" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
        </div>

        {/* Dynamic Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="bg-card p-14 text-center rounded-[32px] border border-slate-150 shadow-sm space-y-4 mt-6">
            <BookOpen className="w-14 h-14 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <p className="font-bengali text-base font-bold text-slate-700">কোনো লেকচার নোট উপলব্ধ নেই</p>
              <p className="font-bengali text-xs text-slate-400">{decodedSubject} বিষয়ে আপনার ক্লাসের ({displayClassText()}) জন্য বর্তমানে কোনো লেকচার নোট পাওয়া যায়নি।</p>
            </div>
            <div className="pt-2">
              <Link to="/notes">
                <Button className="font-bengali bg-[#0F2744] hover:bg-[#1a3a61] text-white rounded-2xl px-6">
                  সকল নোটে ফিরে যান
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredNotes.map((note) => {
              const isSaved = !!savedNotesState[note.id];
              const isAcct = decodedSubject.includes("হিসাব");
              const isChem = decodedSubject.includes("রসায়ন") || decodedSubject.includes("রসায়ন");
              const isBangla = decodedSubject.includes("বাংলা");
              
              const accentColor = isAcct ? "bg-[#F4B400]" : isChem ? "bg-indigo-500" : isBangla ? "bg-emerald-500" : "bg-blue-500";
              const borderTheme = isAcct ? "group-hover:border-amber-250" : isChem ? "group-hover:border-indigo-250" : isBangla ? "group-hover:border-emerald-250" : "group-hover:border-blue-250";

              return (
                <motion.div
                  key={note.id}
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                >
                  <Card 
                    className={`group relative overflow-hidden bg-card border border-slate-200 rounded-[24px] shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-300 ${borderTheme}`}
                  >
                    {/* Visual Border Accent of Book Spine */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1 rounded-l-[24px] ${accentColor}`} />

                    <CardContent className="p-5 sm:p-7 pb-6 pl-6 sm:pl-8">
                      <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center">
                        
                        {/* Left Side Content */}
                        <div className="space-y-4 flex-1 w-full">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2.5">
                              {/* Meta Labels Line */}
                              <div className="flex flex-wrap items-center gap-2 select-none">
                                <span className="text-[9px] font-sans font-black uppercase tracking-wider text-slate-400 bg-muted border border-slate-150 px-2 py-0.5 rounded-md">
                                  LECTURE NOTE
                                </span>
                                {note.badges?.map((b: string, idx: number) => (
                                  <span 
                                    key={idx} 
                                    className={`font-bengali text-[10px] sm:text-xs rounded-full px-2.5 py-0.5 font-bold tracking-wide ${
                                      idx === 0 
                                        ? "bg-amber-50 text-amber-600 border border-amber-200/50" 
                                        : "bg-muted text-slate-500 border border-slate-150"
                                    }`}
                                  >
                                    {b}
                                  </span>
                                ))}
                              </div>

                              <h4 className="font-bengali text-lg sm:text-xl text-[#0F2744] font-black group-hover:text-amber-600 transition-colors leading-tight tracking-tight mt-1 max-w-2xl">
                                {note.title}
                              </h4>
                              <p className="font-bengali text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold max-w-xl line-clamp-2">
                                {note.description}
                              </p>
                            </div>

                            {/* Mobile-only Bookmark Action */}
                            <div className="lg:hidden shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={saveLoading === note.id}
                                onClick={(e) => handleToggleSaveNote(note, e)}
                                className={`rounded-full h-9 w-9 hover:bg-slate-100 ${
                                  isSaved ? "text-amber-500 bg-amber-50" : "text-slate-300 border border-slate-200 hover:text-slate-500"
                                }`}
                              >
                                {isSaved ? <BookmarkCheck className="w-5 h-5 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-bengali font-semibold bg-muted w-max px-3 py-1.5 rounded-lg border border-slate-100/50">
                            <Eye className="w-3.5 h-3.5 text-slate-400" /> <span>১২.৫k এর বেশি পঠিত</span>
                          </div>
                        </div>

                        {/* Right Side Call to Action */}
                        <div className="w-full lg:w-auto shrink-0 flex items-center justify-between lg:justify-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          {/* Desktop Bookmark Action */}
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={saveLoading === note.id}
                            onClick={(e) => handleToggleSaveNote(note, e)}
                            className={`hidden lg:flex rounded-full h-10 w-10 border border-slate-200 hover:bg-muted ${
                              isSaved ? "text-amber-500 bg-amber-50/80 border-amber-200" : "text-slate-400 hover:text-slate-500"
                            }`}
                          >
                            {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
                          </Button>

                          {note.isExternal ? (
                            <Link to={note.link} className="w-full lg:w-auto">
                              <Button className="font-bengali w-full lg:w-32 rounded-[14px] h-10 bg-[#0F2744] hover:bg-[#1a3a61] text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm cursor-pointer border-none font-bold">
                                <span>নোট পড়ুন</span>
                              </Button>
                            </Link>
                          ) : (
                            <Button 
                              onClick={() => setReadingNote(note)}
                              className="font-bengali w-full lg:w-36 rounded-[14px] h-11 bg-[#F4B400] hover:bg-amber-500 font-extrabold text-[#0F2744] border-none flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(244,180,0,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            >
                              <span>নোট পড়ুন</span> <Sparkles className="w-4 h-4 text-[#0F2744] opacity-80" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
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
              textBody: "text-foreground",
              textMute: "text-slate-500",
              border: "border-[#EDECDF]",
              headerBg: "bg-[#FCFBF7]/95",
              headerBorder: "border-[#EDECDF]",
              navButtonHover: "hover:bg-slate-200/50",
              introBg: "bg-[#F7F6EE] border-amber-600 text-stone-800",
              itemBg: "bg-card border-[#ECEBDD]",
              itemHover: "hover:bg-muted/50",
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
              onContextMenu={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className={`w-full max-w-3xl min-h-screen shadow-2xl flex flex-col relative overflow-y-auto overflow-x-hidden ${tc.bg}`}
              >
                
                {/* Content Protected against printing and copy */}
                
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
                  <div className={`flex items-center gap-2 shrink-0 self-end sm:self-center bg-black/5 dark:bg-card/5 rounded-2xl p-1 border ${tc.border}`}>
                    {/* Theme buttons */}
                    <div className="flex items-center gap-0.5">
                      <button 
                        onClick={() => setReaderTheme("light")}
                        className={`h-7 px-3 text-[11px] font-bengali font-bold rounded-xl transition-all ${readerTheme === "light" ? "bg-card text-slate-900 shadow-xs" : "text-slate-550 hover:text-slate-700"}`}
                      >
                        দিন
                      </button>
                      <button 
                        onClick={() => setReaderTheme("sepia")}
                        className={`h-7 px-3 text-[11px] font-bengali font-bold rounded-xl transition-all ${readerTheme === "sepia" ? "bg-[#ECD9B8] text-[#5C4217] shadow-xs" : "text-slate-550 hover:text-slate-700"}`}
                      >
                        সেপিয়া
                      </button>
                      <button 
                        onClick={() => setReaderTheme("dark")}
                        className={`h-7 px-3 text-[11px] font-bengali font-bold rounded-xl transition-all ${readerTheme === "dark" ? "bg-zinc-800 text-zinc-100 shadow-xs" : "text-slate-550 hover:text-slate-700"}`}
                      >
                        রাত
                      </button>
                    </div>

                    <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700" />

                    {/* Font Sizer buttons */}
                    <div className="flex items-center gap-0.5 font-sans">
                      <button 
                        onClick={() => setReaderFontSize("base")}
                        className={`h-7 w-7 text-xs font-semibold rounded-xl transition-all ${readerFontSize === "base" ? "bg-amber-400 text-slate-950 font-black" : "text-slate-550 hover:text-foreground"}`}
                      >
                        Ab
                      </button>
                      <button 
                        onClick={() => setReaderFontSize("lg")}
                        className={`h-7 w-7 text-sm font-semibold rounded-xl transition-all ${readerFontSize === "lg" ? "bg-amber-400 text-slate-950 font-black" : "text-slate-550 hover:text-foreground"}`}
                      >
                        Ab+
                      </button>
                    </div>
                  </div>
                </header>

                {/* Reader Core Content Body */}
                <div className={`p-5 sm:p-8 md:p-10 flex-1 w-full max-w-2xl mx-auto space-y-6 sm:space-y-8 select-none overflow-x-hidden break-words transition-all duration-300 relative ${isBlurred ? 'filter blur-2xl select-none pointer-events-none opacity-20' : ''}`}>
                  {/* Security Overlay for focus loss */}
                  {isBlurred && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md z-50 p-4 text-center pointer-events-auto">
                      <div className="bg-card border border-border p-6 rounded-2xl max-w-sm shadow-xl space-y-3">
                        <div className="bg-destructive/15 text-destructive w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6V9m0 12a9 9 0 110-18 9 9 0 010 18z" />
                          </svg>
                        </div>
                        <h3 className="font-bengali font-bold text-lg">নিরাপত্তা সতর্কতা</h3>
                        <p className="font-bengali text-xs text-muted-foreground leading-relaxed">
                          বিদ্যায়ন অ্যাপের লেকচার নোটগুলোর কপিরাইট সুরক্ষিত রাখতে স্ক্রিনশট বা অন্য কোনোভাবে কপি করা সম্পূর্ণ নিষিদ্ধ। অনুগ্রহ করে অ্যাপে ফোকাস করুন।
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Note Banner Info */}
                  <div className="space-y-4">
                    <h1 className={`font-bengali font-extrabold text-2xl sm:text-3xl lg:text-4xl leading-tight transition-colors duration-300 ${tc.textTitle}`}>
                      {readingNote.title}
                    </h1>
                    {readingNote.content?.intro && (
                      <p className={`text-sm sm:text-base font-bengali leading-relaxed italic border-l-4 p-4.5 rounded-r-2xl transition-all duration-300 shadow-sm ${tc.introBg}`}>
                        {readingNote.content?.intro}
                      </p>
                    )}
                  </div>

                  {/* Chapters / Sections Content blocks */}
                  <div className="space-y-10 sm:space-y-14 pt-4">
                    {readingNote.content?.chapters?.map((chapter: any, cIdx: number) => (
                      <section key={cIdx} className="space-y-5">
                        <h2 className={`font-bengali font-extrabold text-xl sm:text-2xl transition-colors duration-300 ${tc.textTitle}`}>
                          {chapter.title}
                        </h2>
                        
                        <div className="space-y-5 w-full">
                           {chapter.items?.map((item: any, iIdx: number) => {
                            if (typeof item === 'string') {
                              const cleanItem = item.replace(/👉/g, '').trim();
                              return (
                                <div 
                                  key={iIdx} 
                                  className="flex items-start gap-3 w-full"
                                >
                                  <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${tc.textTitle} opacity-40`} />
                                  <p className={`font-bengali ${fontSizeClass} tracking-wide select-none break-words flex-1 transition-all duration-300 ${tc.textBody}`}>
                                    {cleanItem}
                                  </p>
                                </div>
                              );
                            }

                            if (item && typeof item === "object") {
                              if (item.type === "text") {
                                return (
                                  <div key={iIdx} className={`font-bengali ${fontSizeClass} tracking-wide whitespace-pre-wrap select-none break-words w-full transition-all duration-300 ${tc.textBody}`}>
                                    {item.content}
                                  </div>
                                );
                              }
                              // Basic fallback for other objects in SubjectNotes
                              if (item.type === "qa") {
                                return (
                                  <div key={iIdx} className="bg-emerald-50/40 border border-emerald-100/80 p-5 rounded-xl space-y-2 shadow-sm border-l-4 border-l-emerald-500 w-full mb-4">
                                     <div className="font-black text-emerald-900 font-bengali text-base sm:text-lg">{item.q}</div>
                                     <div className="text-foreground font-bengali font-medium leading-relaxed text-sm sm:text-base">{item.a}</div>
                                  </div>
                                )
                              }
                              if (item.type === "tip") {
                                return (
                                  <div key={iIdx} className="bg-amber-50/60 border border-amber-200/80 p-5 rounded-xl space-y-2 text-foreground shadow-sm border-l-4 border-l-amber-500 w-full mb-4">
                                     <div className="font-bold flex items-center gap-2 select-none text-amber-900 font-bengali text-lg">⚡ {item.title || "টিপস"}</div>
                                     <div className="font-bengali whitespace-pre-line text-[#1e293b] leading-relaxed text-sm sm:text-base">{item.content}</div>
                                  </div>
                                )
                              }
                            }
                            return null;
                          })}
                        </div>
                      </section>
                    ))}
                  </div>

                  <div className={`h-[1px] w-full mt-12 transition-colors duration-300 ${tc.border}`} />

                  {/* Footnote stamp */}
                  <div className={`rounded-3xl border p-6 text-center space-y-3.5 select-none transition-colors duration-300 mb-8 ${tc.footerBg} ${tc.border}`}>
                    <div className="h-10 w-10 bg-amber-500/15 rounded-full flex items-center justify-center mx-auto">
                      <BookOpenCheck className="w-5 h-5 text-amber-600" />
                    </div>
                    <h4 className={`font-bengali font-bold text-base transition-colors duration-300 ${tc.textTitle}`}>অনলাইন পাঠ সমাপ্ত!</h4>
                    <p className={`font-bengali text-xs max-w-sm mx-auto leading-relaxed transition-colors duration-300 ${tc.textMute}`}>এই লেকচারটি আপনি সম্পূর্ণ পড়তে পেরেছেন। প্র্যাকটিস এবং পুনরায় রিভিশন দিতে নোটটি সেভ করে রাখুন।</p>
                    
                    <div className="pt-2">
                       <Button 
                        onClick={() => setReadingNote(null)}
                        className={`font-bengali text-xs font-bold rounded-[14px] shadow-xs px-6 py-2.5 h-10 transition-all hover:scale-[1.02] active:scale-[0.98] ${tc.footerBtn}`}
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
      <div className="fixed bottom-0 inset-x-0 bg-card border-t border-slate-200/80 py-3.5 px-6 flex justify-around items-center z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.03)] rounded-t-[28px] max-w-lg mx-auto md:hidden pb-safe">
        <Link 
          to="/notes" 
          className="flex-1 flex flex-col items-center gap-1 transition-all relative text-blue-600 scale-102 cursor-pointer"
        >
          <BookOpen className="w-5 h-5 shrink-0" strokeWidth={2.5} />
          <span className="text-[11px] sm:text-xs font-bengali font-bold">নোটস</span>
          <motion.div layoutId="bottom_indicator" className="absolute bottom-[-15px] inset-x-12 h-1 bg-blue-500 rounded-full" />
        </Link>

        <Link 
          to="/bank?tab=topics"
          className="flex-1 flex flex-col items-center gap-1 transition-all relative text-slate-400 hover:text-slate-500 cursor-pointer"
        >
          <LayoutList className="w-5 h-5 shrink-0" strokeWidth={2.5} />
          <span className="text-[11px] sm:text-xs font-bengali font-bold">টপিক্স</span>
        </Link>
        <Link 
          to="/bank?tab=practice"
          className="flex-1 flex flex-col items-center gap-1 transition-all relative text-slate-400 hover:text-slate-500 cursor-pointer"
        >
          <PenTool className="w-5 h-5 shrink-0" strokeWidth={2.5} />
          <span className="text-[11px] sm:text-xs font-bengali font-bold">প্র্যাকটিস</span>
        </Link>
      </div>

    </div>
  );
}
