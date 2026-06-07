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
  Minimize2
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

const DYNAMIC_SUBJECTS = [
  "সাধারণ ডাউট",
  "পদার্থবিজ্ঞান",
  "রসায়ন",
  "উচ্চতর গণিত",
  "জীববিজ্ঞান",
  "গণিত",
  "ইংরেজি",
  "বাংলা",
  "আইসিটি",
  "বাংলাদেশ ও বিশ্বপরিচয়"
];

export default function Doubts() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  
  const [newQuestion, setNewQuestion] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("সাধারণ ডাউট");
  
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
    <div className="flex flex-col bg-[#F3F4F6] h-[calc(100vh-65px)] overflow-hidden">
      
      {/* Messenger Inspired Header */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-3 sm:py-3.5 flex items-center justify-between shrink-0 shadow-xs relative z-10 w-full">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* Back button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full hover:bg-slate-50 text-slate-700 hover:text-[#0F2744] flex items-center justify-center transition-all shrink-0"
            title="ড্যাশবোর্ডে ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>

          {/* Active Teacher support status */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0 hidden xs:block">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-xs text-emerald-600">
                <span className="font-semibold text-lg sm:text-xl font-sans">T</span>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bengali font-bold text-slate-800 text-sm sm:text-base leading-tight truncate">
                  সরাসরি শিক্ষক প্যানেল
                </h2>
                <span className="bg-emerald-50 text-emerald-700 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-150 inline-flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  HSC & SSC Live
                </span>
              </div>
              <p className="font-bengali text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">
                তাত্ক্ষণিক উত্তর সাপোর্ট (১০ মিনিটের মধ্যে সমাধান)
              </p>
            </div>
          </div>
        </div>

        {/* User Info Right Badge */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {userData?.class && (
            <div className="text-xs font-sans text-[#0F2744] bg-[#0F2744]/5 border border-[#0F2744]/10 px-3 py-1 rounded-full font-semibold">
              Class: {userData.class}
            </div>
          )}
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-sans text-xs font-bold flex items-center justify-center border border-slate-200 uppercase">
            {userData?.fullName?.charAt(0) || "S"}
          </div>
        </div>
      </div>

      {/* Main Messages View Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 space-y-6 flex flex-col relative bg-emerald-50/10">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="font-bengali text-slate-500 text-sm mt-3">সহকারী শিক্ষকের সাথে সংযোগ করা হচ্ছে...</p>
          </div>
        ) : doubts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6 pb-12">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center text-primary/80 border-2 border-dashed border-primary/20">
                <Bot className="w-10 h-10 animate-pulse text-primary" />
              </div>
              <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs shadow-md">
                ✨
              </span>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bengali font-bold text-slate-800 text-lg md:text-xl">
                কোনো প্রশ্ন বা গণিতের সমস্যা আটকে গেছে?
              </h3>
              <p className="font-bengali text-slate-500 text-sm leading-relaxed">
                উচ্চতর গণিত, রসায়ন কিংবা পদার্থবিজ্ঞানের যেকোনো জটিল সমস্যার ছবি তুলে আমাদের ডাউট সলভিং শিক্ষকের কাছে পাঠিয়ে দিন। সরাসরি অভিজ্ঞ শিক্ষকরা সমাধান বুঝিয়ে দিবেন!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 w-full bg-white p-4 rounded-3xl border border-slate-200/60 shadow-xs">
              <div className="p-3.5 text-center rounded-2xl bg-amber-50/50 border border-amber-100/70">
                <MessageCircle className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
                <span className="block font-bengali font-bold text-slate-700 text-[11px] sm:text-xs">সরাসরি প্রশ্ন লিখুন</span>
              </div>
              <div className="p-3.5 text-center rounded-2xl bg-indigo-50/50 border border-indigo-100/70">
                <ImagePlus className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
                <span className="block font-bengali font-bold text-slate-700 text-[11px] sm:text-xs">খাতা বা প্রশ্নের ছবি দিন</span>
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
                <div key={doubt.id} className="space-y-3">
                  
                  {/* Participant 1: Student's Message (On the Right) */}
                  <div className="flex justify-end items-end gap-2.5 pl-12">
                    <div className="flex flex-col items-end max-w-[85%]">
                      
                      {/* Name and Subject metadata */}
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-500 font-sans">
                        <span className="bg-slate-200/80 text-xs font-bengali px-2 py-0.5 rounded-full text-slate-700">
                          {doubt.subject || "সাধারণ"}
                        </span>
                        <span>• You, {dateStr}</span>
                      </div>

                      {/* Msg bubble container */}
                      <div className="bg-[#0F2744] text-white rounded-[20px] rounded-br-sm px-4 py-3 shadow-[0_2px_8px_rgba(15,39,68,0.12)] border border-[#0F2744]/20 relative group">
                        
                        {/* If uploaded image context */}
                        {doubt.image && (
                          <div className="mb-2.5 rounded-xl overflow-hidden border border-white/10 shadow-xs relative group-hover:opacity-95 transition-opacity max-w-sm">
                            <img 
                              src={doubt.image} 
                              alt="Question context" 
                              className="max-h-72 w-auto object-contain bg-slate-950/20 cursor-zoom-in"
                              onClick={() => setZoomImage(doubt.image || null)}
                            />
                            {/* Click to Zoom premium button inside message */}
                            <button 
                              onClick={() => setZoomImage(doubt.image || null)}
                              className="absolute bottom-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                              title="বৃহৎ আকারে দেখুন"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <p className="font-bengali text-[15px] leading-relaxed whitespace-pre-wrap select-text">
                          {doubt.question}
                        </p>
                      </div>

                      {/* Delivery Status Indicator underneath user's bubble */}
                      <div className="flex items-center gap-1 mt-1 font-bengali text-[10px] text-slate-400">
                        {isPending ? (
                          <>
                            <Clock className="w-3 h-3 text-amber-500 animate-spin" />
                            <span className="text-amber-600 font-medium">শিক্ষকের উত্তরের অপেক্ষায়...</span>
                          </>
                        ) : (
                          <>
                            <CheckCheck className="w-3 h-3 text-emerald-500" />
                            <span className="text-slate-500">সমাধান সম্পন্ন</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* User initial avatar */}
                    <div className="w-7 h-7 rounded-full bg-[#0F2744] text-white font-sans text-[11px] font-bold flex-shrink-0 flex items-center justify-center uppercase">
                      {userData?.fullName?.charAt(0) || "S"}
                    </div>
                  </div>

                  {/* Participant 2: Assistant Teacher Answer (On the Left, if answered) */}
                  {!isPending && doubt.answer && (
                    <div className="flex justify-start items-start gap-2.5 pr-12 mt-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex-shrink-0 flex items-center justify-center font-bold font-sans shadow-sm">
                        T
                      </div>
                      
                      <div className="flex flex-col items-start max-w-[85%]">
                        {/* Sender info */}
                        <span className="text-[11px] text-slate-400 font-bengali mb-1">
                          {doubt.answeredBy || "শিক্ষাঅঙ্গন সলভার শিক্ষক"} (Teacher Support)
                        </span>

                        {/* Teacher's Response Bubble */}
                        <div className="bg-white text-slate-800 border border-slate-200/90 rounded-[20px] rounded-bl-sm p-4 shadow-sm relative">
                          <div className="prose prose-sm max-w-none text-[15px] font-bengali leading-relaxed select-text text-slate-800">
                            <ReactMarkdown>{doubt.answer}</ReactMarkdown>
                          </div>
                          
                          {/* Interactivity: Helpful High five / like */}
                          <div className="border-t border-slate-100 mt-3 pt-2.5 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-bengali">
                              সমাধানটি কি আপনার উপকারে এসেছে?
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleHelpful(doubt.id)}
                              className={`h-7 px-3 rounded-full text-xs font-bengali flex items-center gap-1.5 transition-all ${
                                helpfulRatings[doubt.id] 
                                  ? "bg-amber-100 text-amber-700 hover:bg-amber-100 font-bold"
                                  : "text-slate-500 hover:bg-slate-100"
                              }`}
                            >
                              👍 {helpfulRatings[doubt.id] ? "ধন্যবাদ শিক্ষককে!" : "উপকারী সমাধান"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live typing feedback placeholder (animated 3 bouncing dots) */}
                  {isPending && index === doubts.length - 1 && (
                    <div className="flex justify-start items-start gap-2.5 pr-12 mt-3 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-slate-300 text-white flex-shrink-0 flex items-center justify-center font-sans font-bold shadow-xs">
                        T
                      </div>
                      <div className="bg-white/80 border border-slate-200 rounded-[18px] rounded-bl-sm px-4 py-3 flex items-center gap-2 shadow-xs">
                        <span className="font-bengali text-xs text-slate-500">শিক্ষক সমাধান প্রস্তুত করছেন</span>
                        <div className="flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
        
        {/* Invisible target to automatically anchors the chat layout */}
        <div ref={messagesEndRef} />
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
      <div className="bg-white border-t border-slate-200 px-4 py-3 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] relative z-10">
        
        {/* Small thumbnail image attached context toolbar */}
        {selectedImage && (
          <div className="mx-auto max-w-3xl w-full flex items-center mb-2 animate-in slide-in-from-bottom-2 duration-150">
            <div className="relative inline-flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <img 
                src={selectedImage} 
                alt="Selected math problem" 
                className="w-14 h-14 object-cover rounded-xl border border-white shadow-xs" 
              />
              <div className="pr-4 py-1">
                <span className="block font-bengali text-xs font-bold text-slate-700 leading-tight">ছবি যুক্ত করা হয়েছে</span>
                <span className="block font-bengali text-[10px] text-slate-500">বার্তা পাঠালে এটি শিক্ষকের কাছে পৌঁছাবে</span>
              </div>
              <button 
                onClick={clearImage}
                className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-all hover:scale-110"
                title="ছবিটি মুছুন"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Form composer input wrapping structure */}
        <form onSubmit={submitDoubt} className="mx-auto max-w-3xl w-full flex items-center gap-2">
          
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
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="h-11 w-11 rounded-full shrink-0 border-slate-200 text-slate-600 hover:text-[#0F2744] hover:bg-slate-50 transition-colors flex items-center justify-center shadow-xs"
              title="খাতা বা প্রশ্নের ছবি যুক্ত করুন"
            >
              <ImagePlus className="w-[20px] h-[20px]" />
            </Button>
          </div>

          {/* Core message text box input */}
          <div className="flex-1 min-w-0 relative">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="শিক্ষককে আপনার প্রশ্নটি বলুন..."
              className="w-full h-11 max-h-24 min-h-[44px] py-3 pl-4 pr-11 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200/80 focus:border-[#0F2744] focus:ring-1 focus:ring-[#0F2744]/20 rounded-2xl sm:rounded-full font-bengali text-xs sm:text-sm text-slate-850 placeholder-slate-400 outline-none resize-none scroll-smooth transition-all font-medium"
              disabled={posting}
              rows={1}
            />
            {/* Helper visual indicator icon inside chat input */}
            <div className="absolute right-3.5 top-3.5 text-slate-300 pointer-events-none">
              <HelpCircle className="w-4 h-4 opacity-40 hidden xs:block" />
            </div>
          </div>

          {/* Ask Button */}
          <Button
            type="submit"
            disabled={posting || (!newQuestion.trim() && !selectedImage)}
            className="h-11 px-4 sm:px-6 rounded-full bg-[#0F2744] hover:bg-[#16345a] text-white shrink-0 font-bengali font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all text-xs sm:text-sm cursor-pointer disabled:opacity-45"
          >
            {posting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 text-emerald-400" />
                <span className="hidden xs:inline">জিজ্ঞেস করুন</span>
                <span className="xs:hidden">জিজ্ঞেস</span>
              </>
            )}
          </Button>

        </form>
      </div>

    </div>
  );
}
