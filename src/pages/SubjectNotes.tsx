import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Bookmark, BookmarkCheck, ArrowLeft, Eye, Sparkles, X, ChevronRight, FileText, CheckCircle, Clock, LayoutList, PenTool, Sun, Moon, Type, BookOpenCheck } from "lucide-react";
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
  const userClass = userData?.class || "দ্বাদশ শ্রেণী";
  const userClassGroup = mapUserClassToGroup(userClass);

  // States
  const [searchQuery, setSearchQuery] = useState("");
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
      // Block Ctrl+C (Copy), Ctrl+S (Save), Ctrl+P (Print), Ctrl+U (View source), F12 (DevTools)
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

  // Filter notes based on class group AND current subject
  const filteredNotes = ALL_NOTES.filter(note => {
    // 1. Class group match
    if (note.classGroup !== userClassGroup) return false;

    // 2. Exact Subject match
    if (note.subject.toLowerCase() !== decodedSubject.toLowerCase()) return false;

    // 3. Search query match (title/badges/description)
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const titleMatch = note.title.toLowerCase().includes(query);
      const descMatch = note.description.toLowerCase().includes(query);
      const badgeMatch = note.badges.some(b => b.toLowerCase().includes(query));
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
    <div className="space-y-6 max-w-4xl mx-auto min-h-[85vh] pb-24">
      
      {/* Top Banner & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/notes">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 text-[#0F2744] hover:bg-slate-50 border-slate-200">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 rounded-full text-[10px] font-bold font-bengali">
                {displayClassText()}
              </Badge>
              <span className="text-slate-400 font-sans text-xs">•</span>
              <span className="text-slate-500 font-bengali text-xs font-semibold">আপনার বিভাগ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bengali font-bold text-[#0F2744] mt-1">
              {decodedSubject} — বিষয়ভিত্তিক নোটস
            </h2>
          </div>
        </div>
        
        {/* Search inside the subject page */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            type="search" 
            placeholder={`${decodedSubject} নোট খুঁজুন...`} 
            className="pl-9.5 font-bengali bg-slate-50/50 border-slate-200 rounded-2xl" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Grid List */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-[32px] border border-slate-100 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bengali text-sm text-slate-500">
            {decodedSubject} বিষয়ে আপনার ক্লাসের ({displayClassText()}) জন্য বর্তমানে কোনো লেকচার নোট উপলব্ধ নেই।
          </p>
          <div className="mt-4">
            <Link to="/notes">
              <Button size="sm" className="font-bengali bg-primary text-white rounded-2xl">
                সকল নোটে ফিরে যান
              </Button>
            </Link>
          </div>
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

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bengali">
                      <Eye className="w-3.5 h-3.5" /> <span>১২.৫k এর বেশি ছাত্র পড়েছে</span>
                    </div>
                    
                    {note.isExternal ? (
                      <Link to={note.link}>
                        <Button size="sm" className="font-bengali shrink-0 rounded-2xl px-5 py-2 h-9 text-xs sm:text-sm bg-primary hover:bg-primary/95 shadow-xs flex items-center gap-1">
                          <span>নোট পড়ুন</span> <ArrowLeft className="w-4 h-4 -rotate-180" />
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

      {/* Interactive Desktop textbook / E-Reader Overlay Modal */}
      <AnimatePresence>
        {readingNote && (() => {
          // Inner theme mappings
          const readerThemeConfig = {
            light: {
              bg: "bg-[#FDFCF7]", // Soft warm ivory book paper
              textTitle: "text-slate-900",
              textBody: "text-slate-800",
              textMute: "text-slate-500",
              border: "border-[#ECEAD9]",
              headerBg: "bg-[#FDFCF7]/90",
              headerBorder: "border-[#ECEAD9]",
              navButtonHover: "hover:bg-slate-100",
              introBg: "bg-[#F7F5EA] border-amber-500/35 text-amber-955",
              itemBg: "bg-white border-[#ECEAD9]",
              itemHover: "hover:bg-slate-50/40",
              itemNumberBg: "bg-[#F3EFE0] text-[#0F2744] border-[#ECEAD9]",
              footerBg: "bg-[#F4F2E6] border-[#ECEAD9]",
              footerBtn: "bg-[#0F2744] hover:bg-[#1a3a61] text-white"
            },
            sepia: {
              bg: "bg-[#F3EAD3]", // Premium sepia reader page
              textTitle: "text-[#3D2C1A]",
              textBody: "text-[#47301B]",
              textMute: "text-[#75624A]",
              border: "border-[#E2D5B4]",
              headerBg: "bg-[#F3EAD3]/90",
              headerBorder: "border-[#E2D5B4]",
              navButtonHover: "hover:bg-[#EAE0C5]",
              introBg: "bg-[#EAE0C5] border-amber-600/30 text-[#3D2C1A]",
              itemBg: "bg-[#FCF6EB] border-[#DDD1B4]",
              itemHover: "hover:bg-[#F2E7CC]",
              itemNumberBg: "bg-[#EFE5CD] text-[#7A644D] border-[#DDD1B4]",
              footerBg: "bg-[#EFE5CD] border-[#DDD1B4]",
              footerBtn: "bg-amber-800 hover:bg-amber-900 text-[#FCFBF7]"
            },
            dark: {
              bg: "bg-[#111111]", // Rich OLED dark
              textTitle: "text-[#EDEDED]",
              textBody: "text-[#D0D0D0]",
              textMute: "text-[#808080]",
              border: "border-[#242424]",
              headerBg: "bg-[#111111]/90",
              headerBorder: "border-[#242424]",
              navButtonHover: "hover:bg-[#1F1F1F]",
              introBg: "bg-[#1D1B1A] border-amber-500/20 text-amber-200/90",
              itemBg: "bg-[#161616] border-[#242424]",
              itemHover: "hover:bg-[#1E1E1E]",
              itemNumberBg: "bg-[#222222] text-[#888888] border-[#242424]",
              footerBg: "bg-[#161616] border-[#242424]",
              footerBtn: "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
            }
          };

          const tc = readerThemeConfig[readerTheme];

          const fontSizeClass = {
            base: "text-[14px] sm:text-[15px] leading-relaxed",
            lg: "text-[16px] sm:text-[17px] leading-relaxed",
            xl: "text-[18px] sm:text-[19px] leading-relaxed"
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
                className={`w-full max-w-2xl min-h-screen shadow-2xl flex flex-col relative overflow-y-auto overflow-x-hidden select-none ${tc.bg}`}
              >
                
                {/* Secure Overlay blur blocker */}
                {isBlurred && (
                  <div className="absolute inset-0 bg-slate-950/95 z-999 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
                    <span className="text-5xl mb-4">🛡️</span>
                    <h3 className="text-white font-bengali font-bold text-xl md:text-2xl">স্ক্রিনশট বা কপি করা সম্পূর্ণ নিষিদ্ধ!</h3>
                    <p className="text-slate-400 font-bengali text-xs md:text-sm mt-2 max-w-sm">
                      শিক্ষাঙ্কন প্ল্যাটফর্মের গোপনীয়তা ও মেধা সম্পদ রক্ষার স্বার্থে এই পেইজের স্ক্রিনশট বা কপি মেকানিজম ব্লক করা হয়েছে।
                    </p>
                    <p className="text-amber-500 font-bold text-[11px] uppercase tracking-widest mt-4">Screen capture protected</p>
                  </div>
                )}
                
                {/* E-Reader Fixed Header */}
                <header className={`sticky top-0 backdrop-blur-md border-b py-3.5 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 .z-50 transition-colors duration-300 ${tc.headerBg} ${tc.headerBorder}`}>
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button 
                      onClick={() => setReadingNote(null)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${tc.navButtonHover}`}
                    >
                      <X className={`w-5 h-5 ${tc.textTitle}`} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-sans tracking-widest text-amber-600 font-bold uppercase block">LECTURE PREVIEW</span>
                      <h3 className={`font-bengali font-bold text-xs sm:text-sm truncate select-none ${tc.textTitle}`}>
                        {readingNote.title}
                      </h3>
                    </div>
                  </div>

                  {/* Settings Controls (Themes & Font Sizes) */}
                  <div className={`flex items-center gap-2 shrink-0 self-end sm:self-center bg-black/5 dark:bg-white/5 rounded-2xl p-1 border ${tc.border}`}>
                    {/* Theme buttons */}
                    <div className="flex items-center gap-0.5">
                      <button 
                        onClick={() => setReaderTheme("light")}
                        className={`h-7 px-3 text-[11px] font-bengali font-bold rounded-xl transition-all ${readerTheme === "light" ? "bg-white text-slate-900 shadow-xs" : `${tc.textMute} hover:text-slate-700`}`}
                      >
                        দিন
                      </button>
                      <button 
                        onClick={() => setReaderTheme("sepia")}
                        className={`h-7 px-3 text-[11px] font-bengali font-bold rounded-xl transition-all ${readerTheme === "sepia" ? "bg-[#ECD9B8] text-[#5C4217] shadow-xs" : `${tc.textMute} hover:text-slate-700`}`}
                      >
                        সেপিয়া
                      </button>
                      <button 
                        onClick={() => setReaderTheme("dark")}
                        className={`h-7 px-3 text-[11px] font-bengali font-bold rounded-xl transition-all ${readerTheme === "dark" ? "bg-zinc-800 text-zinc-100 shadow-xs" : `${tc.textMute} hover:text-zinc-100`}`}
                      >
                        রাত
                      </button>
                    </div>

                    <div className="h-4 w-[1px] bg-current/15" />

                    {/* Font Sizer buttons */}
                    <div className="flex items-center gap-0.5">
                      <button 
                        onClick={() => setReaderFontSize("base")}
                        className={`h-7 w-7 text-xs font-semibold rounded-xl transition-all ${readerFontSize === "base" ? "bg-amber-400 text-slate-950 font-black" : `${tc.textMute} hover:text-slate-800`}`}
                      >
                        Ab
                      </button>
                      <button 
                        onClick={() => setReaderFontSize("lg")}
                        className={`h-7 w-7 text-sm font-semibold rounded-xl transition-all ${readerFontSize === "lg" ? "bg-amber-400 text-slate-950 font-black" : `${tc.textMute} hover:text-slate-800`}`}
                      >
                        Ab+
                      </button>
                    </div>
                  </div>
                </header>

                {/* Reader Core Content Body */}
                <div className="p-5 sm:p-8 md:p-10 flex-1 w-full max-w-2xl mx-auto space-y-8 select-none overflow-x-hidden break-words">
                  
                  {/* Note Banner Info */}
                  <div className="space-y-4 text-center pb-8 border-b border-dashed border-current/10">
                    <div className="inline-flex items-center justify-center bg-amber-500/10 text-amber-700 font-bengali text-xs font-bold px-3 py-1.5 rounded-full border border-amber-500/20 gap-1.5 mx-auto">
                      <BookOpenCheck className="w-3.5 h-3.5" /> <span>আজকের পাঠ্য বিষয়</span>
                    </div>
                    <h1 className={`font-bengali font-extrabold text-2xl sm:text-3xl leading-tight transition-colors duration-300 ${tc.textTitle}`}>
                      {readingNote.title}
                    </h1>
                    <p className={`text-sm sm:text-base font-bengali leading-relaxed border-l-4 p-4 rounded-r-2xl text-left transition-all duration-300 ${tc.introBg}`}>
                      {readingNote.content?.intro}
                    </p>
                  </div>

                  {/* Chapters / Sections Content blocks - CLEAN NO-GHINJI FORMAT */}
                  <div className="space-y-8 pt-2">
                    {readingNote.content?.chapters?.map((chapter: any, cIdx: number) => (
                      <section key={cIdx} className={`space-y-4 p-6 sm:p-8 rounded-3xl border shadow-xs transition-colors duration-300 ${tc.itemBg} ${tc.border}`}>
                        <div className="flex items-start gap-3 border-b border-current/5 pb-3">
                          <span className={`font-sans text-xs select-none h-6 w-6 rounded-lg flex items-center justify-center font-bold shrink-0 mt-1 shadow-xs ${tc.itemNumberBg}`}>
                            {cIdx + 1}
                          </span>
                          <h2 className={`font-bengali font-bold text-lg sm:text-xl transition-colors duration-300 ${tc.textTitle}`}>
                            {chapter.title}
                          </h2>
                        </div>
                        
                        {/* Clear, spacious listing with divider rows instead of nested boxes */}
                        <div className="divide-y divide-current/5 w-full">
                          {chapter.items.map((item: string, iIdx: number) => (
                            <div 
                              key={iIdx} 
                              className="py-4.5 flex gap-3.5 items-start w-full group transition-colors"
                            >
                              <span className="text-amber-500 font-bold shrink-0 mt-[4px] select-none text-base">✦</span>
                              <p className={`font-bengali ${fontSizeClass} select-none break-words flex-1 leading-relaxed ${tc.textBody}`}>
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
        <Link 
          to="/notes" 
          className="flex-1 flex flex-col items-center gap-1 transition-all relative text-emerald-600 scale-102 cursor-pointer animate-none"
        >
          <BookOpen className="w-5 h-5 shrink-0" />
          <span className="text-[11px] sm:text-xs font-bengali font-bold">নোটস</span>
          <motion.div layoutId="bottom_indicator" className="absolute bottom-[-15px] inset-x-12 h-1 bg-emerald-500 rounded-full" />
        </Link>

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
