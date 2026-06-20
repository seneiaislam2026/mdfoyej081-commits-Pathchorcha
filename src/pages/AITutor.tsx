import React, { useState, useRef, useEffect } from "react";
import { Send, Brain, User, Sparkles, Loader2, ImagePlus, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from 'react-markdown';
import { useAuth } from "../lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  image?: string;
}

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

  const handleSendAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    if (userData && !userData.isPro) {
      const userMessage: Message = { id: Date.now().toString(), sender: "user", text: input, image: selectedImage || undefined };
      setMessages(prev => [...prev, userMessage]);
      setInput("");
      setSelectedImage(null);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: (Date.now() + 1).toString(), 
          sender: "bot", 
          text: "দুঃখিত, এআই টিউটর শুধুমাত্র প্রিমিয়াম ইউজারদের জন্য। এআই টিউটর ব্যবহার করতে অনুগ্রহ করে আপনার প্রোফাইল থেকে অ্যাকাউন্টটি আপগ্রেড করুন।" 
        }]);
      }, 500);
      return;
    }

    const userMessage: Message = { 
      id: Date.now().toString(), 
      sender: "user", 
      text: input,
      image: selectedImage || undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setSelectedImage(null);
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "bot", text: "দুঃখিত, এআই টিউটর কাজ করার জন্য VITE_GEMINI_API_KEY এনভায়রনমেন্ট ভেরিয়েবল সেট করা নেই। Netlify বা AI Studio তে Environment Variables সেকশনে আপনার Gemini API Key টি VITE_GEMINI_API_KEY নামে অ্যাড করুন।" }]);
        setLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are a helpful and polite AI Tutor. You must only answer questions related to education, studying, and academics. If the user asks something outside of these domains, politely decline and remind them that you are an educational tutor. Respond in Bengali, neatly formatted, and easy for students to understand. Be encouraging and provide clear, step-by-step explanations when needed. Do not use 'নমস্কার' (namaskar) as a greeting. You can use 'হ্যালো' (Hello) or 'আসসালামু আলাইকুম' (Assalamu Alaikum), or just directly answer the question without a greeting.`;

      const allMessages = [...messages, userMessage];
      const history = allMessages.slice(0, -1).map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));
      
      const messageParts: any[] = [];
      
      if (userMessage.image) {
        try {
          const splitData = userMessage.image.split(',');
          const mimeType = splitData[0].match(/:(.*?);/)?.[1] || "image/jpeg";
          const base64Data = splitData[1];
          
          messageParts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
        } catch (e) {
          console.error("Error parsing image:", e);
        }
      }
      
      messageParts.push({ text: userMessage.text || "Explain this image related to my studies." });

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
        history: history,
      });

      const response = await chat.sendMessage({ message: messageParts });
      
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "bot", text: response.text || "No response received." }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "bot", text: `দুঃখিত, কোনো একটি সমস্যা হয়েছে। (${error.message || "Unknown error"}). আবার চেষ্টা করো।` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 overflow-hidden font-bengali">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sm:py-4 shrink-0 shadow-sm relative z-20 flex flex-col justify-center">
        <div className="flex items-center gap-3 w-full max-w-4xl mx-auto pt-[env(safe-area-inset-top,0px)]">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors focus:outline-none"
            title="ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> এআই টিউটর
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">তোমার যেকোনো প্রশ্নের উত্তর নাও সরাসরি এআই টিউটর থেকে।</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:p-6 space-y-6 w-full max-w-4xl mx-auto relative scroll-smooth scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 sm:gap-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "bot" && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm mt-1 sm:mt-0 cursor-default">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            )}
            
            <div className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-sm text-[15px] sm:text-base ${
              msg.sender === "user" 
                ? "bg-primary text-white rounded-tr-sm" 
                : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm ring-1 ring-slate-900/5"
            }`}>
              {msg.image && (
                <div className="mb-3 rounded-xl overflow-hidden border border-black/5 bg-slate-100/50">
                  <img src={msg.image} alt="Uploaded" className="w-full h-auto object-contain max-h-[300px]" loading="lazy" />
                </div>
              )}
              {msg.sender === "user" ? (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              ) : (
                <div className="prose prose-sm sm:prose-base prose-slate max-w-none leading-relaxed prose-p:leading-relaxed prose-headings:font-bold prose-a:text-primary">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>

            {msg.sender === "user" && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0 shadow-sm mt-1 sm:mt-0 cursor-default">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3 sm:gap-4 justify-start">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="bg-white border border-slate-200 shadow-sm ring-1 ring-slate-900/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm text-slate-500 font-medium tracking-wide">উত্তর খোজাঁ হচ্ছে...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area AI */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 w-full z-20 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex flex-col">
          {selectedImage && (
            <div className="relative inline-block mb-3 bg-slate-50 p-2 rounded-xl self-start">
               <img src={selectedImage} alt="Preview" className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-lg border border-slate-200 shadow-sm"/>
               <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                title="Remove image"
               >
                 <X className="w-3.5 h-3.5" />
               </button>
            </div>
          )}
          <form onSubmit={handleSendAI} className="flex gap-2 sm:gap-3 items-end relative">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageSelect}
            />
            <Button 
              type="button" 
              variant="outline" 
              className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 border-slate-200 bg-slate-50 text-slate-600 rounded-full hover:bg-slate-100 hover:text-slate-900 focus:ring-2 focus:ring-primary/20 shadow-sm"
              onClick={() => fileInputRef.current?.click()}
              title="ছবি সংযুক্ত করুন"
            >
              <ImagePlus className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            <div className="flex-1 relative">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={"আপনার প্রশ্ন লিখুন..."}
                className="h-12 sm:h-14 w-full rounded-3xl border-slate-200 bg-slate-50 focus:bg-white text-[15px] sm:text-base shadow-inner focus-visible:ring-2 focus-visible:ring-primary/30 px-5 sm:px-6 placeholder:text-slate-400"
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || (!input.trim() && !selectedImage)}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary hover:bg-primary/90 text-white shrink-0 shadow-md focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:shadow-none transition-all"
              title="পাঠান"
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
