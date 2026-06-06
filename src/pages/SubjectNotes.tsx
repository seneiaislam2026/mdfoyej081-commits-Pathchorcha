import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Bookmark, BookmarkCheck, ArrowLeft, Eye, Sparkles, X, ChevronRight, FileText, CheckCircle, Clock, LayoutList, PenTool } from "lucide-react";
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
                    className="p-1 rounded-full text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="border-l border-[#E6E5D7] h-5" />
                  <div className="space-y-0.5">
                    <p className="font-bengali text-[10px] text-amber-600 font-extrabold tracking-wide uppercase">LECTURE PREVIEW</p>
                    <h3 className="font-bengali font-bold text-sm text-slate-800 line-clamp-1">{readingNote.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="font-bengali font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/10 text-xs py-0.5">
                    পড়ছেন
                  </Badge>
                </div>
              </header>

              {/* Real Book-style detailed content */}
              <div className="flex-1 px-8 py-10 max-w-2xl mx-auto space-y-10 selection:bg-amber-100 selection:text-amber-900 select-none">
                
                {/* Title and Intro */}
                <div className="space-y-4 text-center pb-8 border-b border-dashed border-[#EDECDF]">
                  <div className="inline-flex items-center justify-center bg-amber-500/10 text-amber-600 font-bengali text-xs font-bold px-3 py-1.5 rounded-full border border-amber-500/20 gap-1.5 mx-auto">
                    <BookOpen className="w-3.5 h-3.5" /> <span>আজকের পাঠ্য বিষয়</span>
                  </div>
                  <h1 className="font-bengali text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {readingNote.title}
                  </h1>
                  <p className="font-bengali text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                    {readingNote.content?.intro}
                  </p>
                </div>

                {/* Subsections */}
                <div className="space-y-8">
                  {readingNote.content?.chapters?.map((chap: any, idx: number) => (
                    <section key={idx} className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#EDECDF] shadow-xs hover:shadow-md transition-all duration-200">
                      <div className="flex items-start gap-3">
                        <span className="font-sans text-xs bg-[#0F2744] text-white h-6 w-6 rounded-lg flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-sm shadow-[#0F2744]/10">
                          {idx + 1}
                        </span>
                        <h2 className="font-bengali font-bold text-lg sm:text-xl text-slate-900">
                          {chap.title}
                        </h2>
                      </div>
                      
                      <div className="divide-y divide-[#F5F4EC]">
                        {chap.items?.map((item: string, i: number) => (
                          <div key={i} className="py-4 flex gap-3 text-slate-700 font-bengali leading-relaxed text-sm sm:text-base">
                            <span className="text-amber-500 font-bold shrink-0 mt-[3px] select-none text-sm font-sans">▸</span>
                            <p className="flex-1">{item}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                {/* Book End Signature Mark */}
                <div className="pt-8 border-t border-dashed border-[#EDECDF] text-center space-y-2">
                  <div className="h-2 w-2 bg-amber-500 rounded-full mx-auto animate-pulse" />
                  <p className="font-bengali text-xs text-slate-400 font-medium">শিক্ষাঙ্গন লেকচার নোটস — কপিরাইট ২০২৬ © সর্বস্বত্ব সংরক্ষিত</p>
                </div>
              </div>

              {/* E-Reader Screen Bottom Status */}
              <footer className="sticky bottom-0 bg-[#FCFBF7]/95 backdrop-blur-md border-t border-[#EDECDF] py-3.5 px-6 flex items-center justify-between z-40 select-none">
                <p className="text-[11px] font-sans text-slate-400">PAGE 1 OF 1 PHYSICAL VERSION</p>
                <Button 
                  onClick={() => setReadingNote(null)}
                  className="font-bengali text-xs font-bold rounded-xl h-8 bg-[#0F2744] text-white hover:bg-[#0F2744]/90 shadow-sm"
                >
                  পড়া শেষ
                </Button>
              </footer>

            </motion.div>
          </motion.div>
        )}
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
