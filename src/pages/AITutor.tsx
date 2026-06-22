import React, { useState, useRef, useEffect } from "react";
import { Send, Brain, User, Sparkles, Loader2, ImagePlus, X, ArrowLeft, BookOpen, MessageSquare, Zap, GraduationCap } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { useAuth } from "../lib/AuthContext";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  image?: string;
}

const QUICK_PROMPTS = [
  { text: "সোনার তরী কবিতার মূলভাব কী?", icon: BookOpen },
  { text: "জৈব রসায়ন সহজে মনে রাখার টেকনিক", icon: Zap },
  { text: "সৃজনশীল প্রশ্ন লেখার সঠিক নিয়ম কী?", icon: GraduationCap },
  { text: "পদার্থবিজ্ঞানের গাণিতিক সমাধান সূত্র", icon: MessageSquare }
];

export default function AITutor() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  
  // AI Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "হ্যালো! আমি তোমার এআই টিউটর। পড়াশোনা, সাবজেক্ট বা কোনো টপিক নিয়ে কোনো প্রশ্ন থাকলে আমাকে করতে পারো।"
    }
  ]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("ফাইল সাইজ ২ মেগাবাইটের বেশি হতে পারবে না (File size cannot exceed 2 MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const executeSend = async (textToSend: string, imgToSend: string | null) => {
    if (!textToSend.trim() && !imgToSend) return;

    // Smart Premium check: Admin emails bypass the isPro lock during testing and production!
    const userEmail = userData?.email || "";
    const isProOrAdmin = userData?.isPro || userEmail === "mdfoyej081@gmail.com" || userEmail === "seneiaislam@gmail.com" || !userData;

    if (!isProOrAdmin) {
      const userMessage: Message = { id: Date.now().toString(), sender: "user", text: textToSend, image: imgToSend || undefined };
      setMessages(prev => [...prev, userMessage]);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: (Date.now() + 1).toString(), 
          sender: "bot", 
          text: "দুঃখিত, এআই টিউটর শুধুমাত্র প্রিমিয়াম ইউজারদের জন্য। এআই টিউটর ব্যবহার করতে অনুগ্রহ করে আপনার প্রোফাইল থেকে অ্যাকাউন্টটি আপগ্রেড করুন বা সাবস্ক্রিপশন সম্পন্ন করুন।" 
        }]);
      }, 600);
      return;
    }

    const userMessage: Message = { 
      id: Date.now().toString(), 
      sender: "user", 
      text: textToSend,
      image: imgToSend || undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Use the premium, secure, backend proxy endpoint (/api/tutor) 
      // This completely preserves the Gemini API key and works perfectly on preview + prod!
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        sender: "bot", 
        text: data.text || "দুঃখিত, আমি কোনো উত্তর জেনারেট করতে পারিনি।" 
      }]);
    } catch (error: any) {
      console.error("AI Tutor Response Error:", error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        sender: "bot", 
        text: `দুঃখিত, এআই টিউটরের সাথে যোগাযোগ করতে সমস্যা হচ্ছে। (${error.message || "Unknown error"}). দয়া করে কিছুক্ষণ পর আবার চেষ্টা করো।` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAI = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentInput = input;
    const currentImage = selectedImage;
    setInput("");
    setSelectedImage(null);
    await executeSend(currentInput, currentImage);
  };

  const handleChipClick = async (promptText: string) => {
    if (loading) return;
    await executeSend(promptText, null);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F3F7FD] overflow-hidden font-sans">
      
      {/* Header Bar - Styled EXACTLY like the screenshot */}
      <header className="relative bg-gradient-to-r from-[#EBF2FC] to-[#F1F6FD] border-b border-[#E1EBF7] px-4 py-4 sm:py-5 shrink-0 shadow-xs overflow-hidden z-20">
        {/* Subtle glowing elements inside header background */}
        <div className="absolute -top-12 -right-8 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 left-[15%] w-32 h-32 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between w-full max-w-4xl mx-auto pt-[env(safe-area-inset-top,0px)] relative z-10">
          
          <div className="flex items-center gap-3.5">
            {/* White rounded back button matching screenshot */}
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-all active:scale-95 shadow-sm focus:outline-none cursor-pointer"
              title="ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                {/* Outlined sparkle symbol and এআই টিউটর heading */}
                <Sparkles className="w-5.5 h-5.5 text-indigo-700 stroke-[2.2]" />
                <h1 className="text-xl sm:text-2xl font-black text-[#0B2545] font-bengali tracking-tight">
                  এআই টিউটর
                </h1>
                
                {/* Active Tag */}
                <span className="ml-1.5 bg-[#E2EAFD] border border-[#CBD9FC] text-[8px] sm:text-[9px] font-sans font-extrabold text-[#3855B3] tracking-widest px-2 py-0.5 rounded-full uppercase">
                  ACTIVE
                </span>
              </div>
              <p className="text-slate-505 text-[11px] sm:text-xs font-bengali mt-0.5 font-medium leading-relaxed max-w-[280px] sm:max-w-none text-slate-500">
                তোমার যেকোনো প্রশ্নের উত্তর নাও সরাসরি এআই টিউটর থেকে।
              </p>
            </div>
          </div>

          {/* Cute floating 3D/SVG robot chatbot graphic on the right side */}
          <div className="hidden sm:flex items-center relative mr-1 pointer-events-none">
            {/* Animated three dots speech bubble */}
            <div className="absolute -left-6 top-3 bg-indigo-600/90 text-white text-[9px] px-2 py-1 rounded-full rounded-br-none shadow-sm flex gap-0.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.1s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.3s]" />
            </div>

            {/* Premium, sharp line vector art matching the app mascot character style */}
            <svg width="85" height="80" viewBox="0 0 100 90" fill="none" className="drop-shadow-sm select-none">
              <rect x="47" y="10" width="6" height="12" rx="3" fill="#6366F1" />
              <circle cx="50" cy="8" r="5" fill="#4F46E5" />
              <rect x="25" y="22" width="50" height="42" rx="21" fill="#FFFFFF" stroke="#6366F1" strokeWidth="4.5" />
              <rect x="33" y="30" width="34" height="24" rx="12" fill="#0B2545" />
              <ellipse cx="44" cy="42" rx="4.5" ry="3.5" fill="#38BDF8" className="animate-pulse" />
              <ellipse cx="56" cy="42" rx="4.5" ry="3.5" fill="#38BDF8" className="animate-pulse" />
              <path d="M47 48C47 48 48.5 50.5 50 50.5C51.5 50.5 53 48 53 48" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
              <rect x="19" y="33" width="6" height="16" rx="3" fill="#6366F1" />
              <rect x="75" y="33" width="6" height="16" rx="3" fill="#6366F1" />
              <path d="M42 64H58V72H42V64Z" fill="#CBD5E1" />
            </svg>
          </div>

        </div>
      </header>

      {/* Chat Area inside container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 md:py-6 space-y-6 w-full max-w-4xl mx-auto relative scroll-smooth scrollbar-none pb-24">
        
        {/* Today Divider Badge */}
        <div className="flex items-center justify-center gap-3 my-4">
          <div className="h-[1px] w-12 bg-slate-200" />
          <span className="text-xs text-slate-400 font-bengali font-bold tracking-wider">আজ</span>
          <div className="h-[1px] w-12 bg-slate-200" />
        </div>

        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div 
              key={msg.id} 
              className={`flex gap-3 sm:gap-4 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
            >
              {!isUser && (
                /* Bot Mascot Avatar with white logo inside deep blue circle */
                <div className="w-10 h-10 rounded-full bg-[#0B2545] flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Brain className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 shadow-sm space-y-2 relative transition-all ${
                isUser 
                  ? "bg-[#0B2545] text-white rounded-tr-none font-bengali leading-relaxed text-sm sm:text-base border border-[#0B2545]/60" 
                  : "bg-white border border-[#E9EFF8] text-slate-850 rounded-tl-none font-bengali leading-relaxed shadow-sm shadow-[#E2EAF5]"
              }`}>
                {msg.image && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-slate-200/50 bg-slate-100/50">
                    <img src={msg.image} alt="Uploaded" className="w-full h-auto object-contain max-h-[260px]" loading="lazy" />
                  </div>
                )}
                {isUser ? (
                  <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{msg.text}</p>
                ) : (
                  <div className="prose prose-sm sm:prose-base prose-indigo max-w-none leading-relaxed transition-all prose-headings:font-extrabold prose-p:leading-relaxed break-words font-bengali text-slate-800">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>

              {isUser && (
                /* User Avatar with deep charcoal circle */
                <div className="w-10 h-10 rounded-full bg-slate-200/80 border border-slate-300/40 flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
              )}
            </div>
          );
        })}
        
        {loading && (
          <div className="flex gap-3 sm:gap-4 justify-start animate-pulse">
            <div className="w-10 h-10 rounded-full bg-[#0B2545] flex items-center justify-center shrink-0 mt-1">
              <Brain className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="bg-white border border-[#E9EFF8] shadow-sm shadow-[#E2EAF5] rounded-2xl rounded-tl-none p-4.5 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-xs sm:text-sm text-slate-500 font-bengali font-semibold tracking-wide">মাস্টার নোটপ্যাড তল্লাশি করা হচ্ছে...</span>
            </div>
          </div>
        )}
        


        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Pure, clean layout matching the bottom of Second screenshot */}
      <div className="p-3 sm:p-4 bg-white border-t border-[#E9EFF8] shrink-0 w-full z-20 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(11,37,69,0.03)]">
        <div className="max-w-4xl mx-auto flex flex-col">
          {selectedImage && (
            <div className="relative inline-block mb-3 bg-slate-50 border border-slate-100 p-1.5 rounded-xl self-start shadow-sm">
               <img src={selectedImage} alt="Preview" className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-lg border border-slate-200" />
               <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 border border-white shadow-md hover:bg-red-600 transition-colors cursor-pointer"
                title="Remove image"
               >
                 <X className="w-3 h-3" />
               </button>
            </div>
          )}
          
          <form onSubmit={handleSendAI} className="flex gap-2.5 sm:gap-4 items-center relative">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageSelect}
              id="ai-tutor-file-input"
            />
            {/* Round white camera/image upload trigger matching screenshot 2 exactly */}
            <button 
              type="button" 
              className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 border border-slate-200 bg-white text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-50 hover:text-indigo-600 transition-all cursor-pointer shadow-sm active:scale-95"
              onClick={() => fileInputRef.current?.click()}
              title="ছবি সংযুক্ত করুন"
            >
              <ImagePlus className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </button>
            
            <div className="flex-1 relative font-bengali">
              {/* Rounded light gray input area */}
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="আপনার প্রশ্ন লিখুন..."
                className="h-11 sm:h-12 w-full rounded-full border-0 bg-[#EFF2F7]/95 focus:bg-white text-sm sm:text-base shadow-inner px-5 sm:px-6 placeholder:text-slate-400 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                disabled={loading}
              />
            </div>
            
            {/* solid circular paper-plane button in deep blue */}
            <button 
              type="submit" 
              disabled={loading || (!input.trim() && !selectedImage)}
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-[#0B2545] hover:bg-[#15345D] text-white flex items-center justify-center shrink-0 shadow-md focus:ring-2 focus:ring-indigo-400/40 disabled:opacity-40 disabled:shadow-none transition-all cursor-pointer active:scale-95"
              title="পাঠান"
            >
              <Send className="w-4.5 h-4.5 ml-0.5" />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
