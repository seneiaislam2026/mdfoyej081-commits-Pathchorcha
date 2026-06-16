import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { collection, addDoc, query, where, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { 
  Loader2, 
  ImagePlus, 
  User, 
  Send, 
  Bot, 
  X, 
  ArrowLeft, 
  CheckCheck, 
  Clock, 
  BookOpen, 
  MessageCircle, 
  HelpCircle,
  Sparkles,
  Maximize2,
  Minimize2,
  Info
} from "lucide-react";

interface Doubt {
  id: string;
  userId: string;
  userName: string;
  userClass?: string;
  question: string;
  image?: string;
  status: "pending" | "answered";
  answer?: string;
  answeredBy?: string;
  createdAt: any;
  subject?: string;
}

import { getSubjectsForUser } from "../utils/subjects";

export default function Doubts() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  
  const subjects = userData ? getSubjectsForUser(userData.class, userData.group) : [];

  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  
  const [newQuestion, setNewQuestion] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  
  // High fidelity light box zoom image state
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  
  // Local state for interactive helpful feedback likes
  const [helpfulRatings, setHelpfulRatings] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load doubts for this specific logged-in user in real-time
  useEffect(() => {
    if (!userData?.uid) return;
    setLoading(true);
    
    const q = query(
      collection(db, "doubts"), 
      where("userId", "==", userData.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data 
        } as Doubt;
      });
      
      // Sort chronologically ascending for a natural-streaming chat layout
      docs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      });
      
      setDoubts(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching doubts standard collection:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  // Handle auto-scroll to latest message on page load and new messages
  useEffect(() => {
    scrollToBottom();
  }, [doubts]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("অনুগ্রহ করে ২ মেগাবাইটের কম সাইজের ছবি সিলেক্ট করুন।");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submitDoubt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newQuestion.trim() && !selectedImage) return;
    if (!userData) return;
    if (!selectedSubject) {
      alert("দয়া করে একটি বিষয় নির্বাচন করুন!");
      return;
    }

    setPosting(true);
    try {
      await addDoc(collection(db, "doubts"), {
        userId: userData.uid,
        userName: userData.fullName || userData.email?.split("@")[0] || "Student",
        userClass: userData.class || null,
        question: newQuestion.trim(),
        image: selectedImage || null,
        status: "pending",
        subject: selectedSubject,
        createdAt: serverTimestamp(),
      });
      
      setNewQuestion("");
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      console.error("Error creating doubt doc", e);
      alert("বার্তা পাঠানো যায়নি। ইন্টারনেট চেক করে আবার চেষ্টা করুন।");
    } finally {
      setPosting(false);
    }
  };

  const toggleHelpful = (doubtId: string) => {
    setHelpfulRatings(prev => ({
      ...prev,
      [doubtId]: !prev[doubtId]
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitDoubt();
    }
  };

  return (
    <div className="flex flex-col bg-slate-50 w-full h-screen h-[100dvh] overflow-hidden">
      
      {/* Messenger Inspired Header */}
      <div className="bg-white px-4 py-4 shrink-0 shadow-sm relative z-20 w-full flex flex-col justify-center">
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 flex items-center justify-center text-[#1e293b]"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>

          {/* Title and Badge */}
          <div className="flex flex-col items-center">
            <h2 className="font-bengali font-extrabold text-[#0B1E42] text-xl">
              সরাসরি শিক্ষক প্যানেল
            </h2>
            <div className="bg-[#EAFBF3] text-[#059669] text-xs font-semibold px-3 py-1.5 mt-2 rounded-full border border-[#D1F4E0] flex items-center gap-1.5 shadow-sm font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              HSC & SSC Live
            </div>
          </div>

          {/* Info Icon */}
          <button className="w-10 h-10 flex items-center justify-center text-[#10B981]">
            <Info className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Messages View Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-6 md:p-8 space-y-6 flex flex-col relative">
        <div className="relative z-10 w-full flex-1 flex flex-col max-w-4xl mx-auto">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
            <p className="font-bengali text-slate-500 text-sm">শিক্ষকের প্যানেল লোড হচ্ছে...</p>
          </div>
        ) : doubts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-8 pb-12 w-full">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-slate-600 border border-slate-100 shadow-sm relative">
              <Bot className="w-10 h-10" strokeWidth={1.5} />
              <Sparkles className="absolute -top-1 -right-1 text-slate-300 w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bengali font-bold text-slate-900 text-xl md:text-2xl tracking-tight">
                পড়াশোনায় আটকে গেছেন?
              </h3>
              <p className="font-bengali text-slate-500 text-[15px] leading-relaxed max-w-[340px] mx-auto">
                গণিত, পদার্থবিজ্ঞান, রসায়ন বা যেকোনো বিষয়ের জটিল সমস্যা আমাদের শিক্ষকের কাছে পাঠান। আমরা দ্রুত সমাধান বুঝিয়ে দিবো!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <div 
                className="p-5 text-center flex flex-col items-center rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-slate-200 transition-colors cursor-pointer"
                onClick={() => document.getElementById('doubt-input')?.focus()}
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2.5">
                  <MessageCircle className="w-5 h-5 text-slate-600" />
                </div>
                <span className="block font-bengali font-semibold text-slate-800 text-xs text-center">টাইপ করে প্রশ্ন করুন</span>
              </div>
              <div 
                className="p-5 text-center flex flex-col items-center rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-slate-200 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2.5">
                  <ImagePlus className="w-5 h-5 text-slate-600" />
                </div>
                <span className="block font-bengali font-semibold text-slate-800 text-xs text-center">ছবি তুলে প্রশ্ন দিন</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto w-full">
            {doubts.map((doubt, index) => {
              const isPending = doubt.status === "pending";
              const dateStr = doubt.createdAt?.toMillis 
                ? new Date(doubt.createdAt.toMillis()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : "Just now";

              return (
                <div key={doubt.id} className="space-y-4">
                  
                  {/* Participant 1: Student's Message (On the Right) */}
                  <div className="flex flex-col items-end gap-1.5 pl-12 lg:pl-24">
                    <div className="flex items-center justify-end gap-2 text-[11px] font-sans px-1 text-gray-400">
                      <span className="font-bengali bg-[#D1F4E0] text-[#059669] px-2.5 py-0.5 rounded-md font-semibold">
                        {doubt.subject || "সাধারণ ডাউট"}
                      </span>
                      <span>তুমি • {dateStr}</span>
                    </div>

                    <div className="bg-[#0B1E42] text-white rounded-[24px] px-5 py-3.5 shadow-sm relative max-w-[85%] inline-block">
                      {doubt.image && (
                        <div className="mb-2.5 rounded-xl bg-black/20 overflow-hidden relative group-hover:opacity-95 transition-opacity max-w-[260px] sm:max-w-sm cursor-zoom-in group/img" onClick={() => setZoomImage(doubt.image || null)}>
                          <img 
                            src={doubt.image} 
                            alt="Question context" 
                            className="max-h-64 rounded-xl w-auto object-contain bg-slate-900/50"
                          />
                          <button 
                            className="absolute bottom-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-black/90 transition-all opacity-0 group-hover/img:opacity-100 shadow-sm"
                            title="বৃহৎ আকারে দেখুন"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <p className="font-bengali text-[15px] leading-relaxed whitespace-pre-wrap">
                        {doubt.question}
                      </p>
                    </div>

                    {/* Delivery Status */}
                    <div className="flex justify-end pr-2 text-xs text-gray-400 mt-1">
                       {isPending ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[#10B981]">
                            <span>{dateStr}</span>
                            <CheckCheck className="w-4 h-4 ml-1" strokeWidth={2.5} />
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Participant 2: Assistant Teacher Answer (On the Left, if answered) */}
                  {!isPending && doubt.answer && (
                    <div className="flex items-start gap-4 pr-12 lg:pr-24">
                      <div className="w-10 h-10 rounded-full bg-[#EAFBF3] text-[#059669] flex items-center justify-center border border-[#D1F4E0] shrink-0 mt-2">
                        <span className="font-bold text-lg">T</span>
                      </div>
                      
                      <div className="flex flex-col items-start min-w-0 max-w-[90%] sm:max-w-[85%]">
                        <span className="text-[12px] font-sans mb-1.5 ml-1">
                          <span className="font-bengali font-bold text-[#059669]">শিক্ষক সমাধান</span> <span className="text-gray-400">• {dateStr}</span>
                        </span>

                        <div className="bg-[#F0FDF4] text-[#1e293b] border-none rounded-[24px] rounded-tl-sm px-6 py-4 shadow-sm relative w-full overflow-hidden">
                          <div className="prose prose-sm prose-slate max-w-none text-[15px] font-bengali leading-relaxed">
                            <ReactMarkdown>{doubt.answer}</ReactMarkdown>
                          </div>
                          
                          <div className="flex justify-end pt-3 text-[#94a3b8] text-xs font-sans">
                             {dateStr}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live typing feedback placeholder */}
                  {isPending && index === doubts.length - 1 && (
                    <div className="flex items-start gap-3 pr-12 lg:pr-24 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="w-10 h-10 rounded-full bg-[#EAFBF3] text-[#059669] flex items-center justify-center border border-[#D1F4E0] shrink-0 mt-2">
                        <span className="font-bold text-lg">T</span>
                      </div>
                      
                      <div className="flex flex-col items-start min-w-0">
                        <span className="text-[12px] font-sans mb-1.5 ml-1">
                          <span className="font-bengali font-bold text-[#059669]">শিক্ষক</span> <span className="text-gray-400">সমাধান প্রস্তুত করছেন...</span>
                        </span>

                        <div className="bg-[#F0FDF4] border-none rounded-[24px] rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#059669]/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#059669]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#059669]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
        </div>
        
        {/* Invisible target to automatically anchors the chat layout */}
        <div ref={messagesEndRef} className="h-6 shrink-0" />
      </div>

      {/* Floating high fidelity light box backdrop */}
      {zoomImage && (
        <div className="fixed inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-[110] p-4 animate-in fade-in zoom-in duration-150">
          <div className="absolute top-4 right-4 flex gap-3">
            <button 
              onClick={() => setZoomImage(null)}
              className="w-11 h-11 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center shadow-md transition-all border border-white/10"
              title="বন্ধ করুন"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="max-w-4xl max-h-[85vh] overflow-auto rounded-xl">
            <img 
              src={zoomImage} 
              alt="Zoomed Question" 
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
            />
          </div>
          <p className="font-bengali text-white/70 text-xs mt-3 bg-black/40 px-4 py-1.5 rounded-full border border-white/5">
            প্রশ্নটির আসল ছবি (ক্লিক করে যে কোনো জায়গায় বন্ধ করুন)
          </p>
          <div className="absolute inset-0 -z-10" onClick={() => setZoomImage(null)} />
        </div>
      )}

      {/* Sticky Bottom Messenger Input & Toolbar Composer Area */}
      <div className="bg-[#F8FAFC] p-4 shrink-0 flex-none pb-4 md:pb-6 w-full z-20">
        <div className="max-w-4xl mx-auto w-full">
        {/* Form composer input wrapping structure */}
        <form onSubmit={submitDoubt} className="w-full flex justify-center">

          <div className="w-full flex flex-col gap-3">
          {/* Subject Selector */}
          <div className="w-full">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              required
              className="bg-white border border-slate-200 text-slate-800 text-[15px] sm:text-base rounded-2xl px-5 py-3.5 font-bengali focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm cursor-pointer appearance-none w-full outline-none"
              style={{ paddingRight: '2.5rem', backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
            >
              <option value="" disabled>বিষয় নির্বাচন করুন...</option>
              <option value="সাধারণ ডাউট">সাধারণ ডাউট</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {/* Small thumbnail image attached context toolbar */}
          {selectedImage && (
            <div className="flex items-center animate-in slide-in-from-bottom-2 duration-150">
              <div className="relative inline-flex items-center gap-3 p-2 bg-white rounded-[16px] border border-slate-200 shadow-sm">
                <img 
                  src={selectedImage} 
                  alt="Selected problem" 
                  className="w-14 h-14 object-cover rounded-lg border border-slate-100" 
                />
                <div className="pr-4 py-1">
                  <span className="block font-bengali text-xs font-bold text-slate-800">ছবিটি সিলেক্ট করা হয়েছে</span>
                </div>
                <button 
                  onClick={clearImage}
                  type="button"
                  className="absolute -top-2 -right-2 bg-white text-slate-600 hover:text-red-500 border border-slate-200 hover:border-red-200 rounded-full p-1.5 shadow-sm transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Input controls row */}
          <div className="flex items-center gap-3 w-full bg-white border border-[#E2E8F0] p-3 rounded-[28px] shadow-sm">
            {/* File Upload Hidden Input Trigger */}
            <div className="shrink-0">
              {/* hidden file selector */}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageSelect}
              />
  
              {/* trigger button block */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-[#EAFBF3] text-[#059669] flex items-center justify-center border border-[#D1F4E0] transition-colors shadow-sm"
                title="খাতা বা প্রশ্নের ছবি যুক্ত করুন"
              >
                <ImagePlus className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>
  
            {/* Core message text box input */}
            <div className="flex-1 min-w-0 bg-transparent px-2">
              <input
                id="doubt-input"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                     e.preventDefault();
                     submitDoubt();
                  }
                }}
                placeholder="শিক্ষককে আপনার প্রশ্নটি বলুন..."
                className="w-full h-12 bg-transparent font-bengali text-[15px] sm:text-base text-slate-800 placeholder-slate-400 outline-none truncate"
                disabled={posting}
              />
            </div>
  
            {/* Ask Button */}
            <button
              type="submit"
              disabled={posting || (!newQuestion.trim() && !selectedImage) || !selectedSubject}
              className="w-12 h-12 rounded-full bg-[#86EFAC] text-white shrink-0 flex items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-45 disabled:active:scale-100"
            >
              {posting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-[22px] h-[22px] ml-0.5" strokeWidth={2.5} />
              )}
            </button>
          </div>
          </div>
        </form>
        </div>
      </div>

    </div>
  );
}
