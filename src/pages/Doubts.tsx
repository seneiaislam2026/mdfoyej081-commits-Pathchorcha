import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../lib/AuthContext";
import { collection, addDoc, query, where, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Loader2, ImagePlus, User, Send, Bot } from "lucide-react";

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
}

export default function Doubts() {
  const { userData } = useAuth();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  
  const [newQuestion, setNewQuestion] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userData?.uid) return;
    setLoading(true);
    
    // Listen to current user's doubts in real-time
    const q = query(collection(db, "doubts"), where("userId", "==", userData.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Doubt));
      // Sort ascending so older messages are at the top, like in a chat app
      docs.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
      setDoubts(docs);
      setLoading(false);
      scrollToBottom();
    }, (error) => {
      console.error("Error fetching chat:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image smaller than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submitDoubt = async () => {
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
        createdAt: serverTimestamp(),
      });
      setNewQuestion("");
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      scrollToBottom();
    } catch (e) {
      console.error(e);
      alert("Failed to send message.");
    } finally {
      setPosting(false);
    }
  };

  // Generate a flattened list of chat messages from doubts
  const chatMessages = doubts.flatMap(doubt => {
    const msgs = [];
    // User's question
    msgs.push({
      id: `q-${doubt.id}`,
      isTutor: false,
      text: doubt.question,
      image: doubt.image,
      time: doubt.createdAt?.toMillis ? new Date(doubt.createdAt.toMillis()) : new Date(),
    });
    // Tutor's answer (if it exists)
    if (doubt.status === "answered" && doubt.answer) {
      msgs.push({
        id: `a-${doubt.id}`,
        isTutor: true,
        text: doubt.answer,
        tutorName: doubt.answeredBy || "Tutor",
        time: doubt.createdAt?.toMillis ? new Date(doubt.createdAt.toMillis() + 1000) : new Date(), // slight offset for sorting logic context
      });
    }
    return msgs;
  });

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen" style={{ height: "100dvh" }}>
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm px-6 py-4 flex items-center justify-between border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bengali font-bold text-lg text-slate-800 leading-tight">শিক্ষক সাপোর্ট</h1>
            <p className="text-xs text-green-600 font-bold font-sans flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && doubts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <Bot className="w-8 h-8 text-blue-500" />
            </div>
            <p className="font-bengali font-bold text-slate-500 text-lg">শিক্ষক কে তোমার প্রশ্ন পাঠাও</p>
            <p className="text-sm font-bengali text-slate-400">খুব দ্রুত আমাদের একজন অভিজ্ঞ শিক্ষক তোমার উত্তর দিবেন।</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-4 max-w-3xl mx-auto w-full">
            <div className="text-center my-4">
              <span className="text-xs font-medium text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full">
                কনভারসেশন শুরু হয়েছে
              </span>
            </div>
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isTutor ? "justify-start" : "justify-end"}`}>
                <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${msg.isTutor ? "flex-row" : "flex-row-reverse"}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isTutor ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-600"}`}>
                    {msg.isTutor ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  
                  {/* Bubble */}
                  <div className={`flex flex-col ${msg.isTutor ? "items-start" : "items-end"}`}>
                    {msg.isTutor && <span className="text-[11px] font-bold text-slate-500 mb-1 ml-1">{msg.tutorName}</span>}
                    <div 
                      className={`relative px-4 py-3 text-[15px] font-bengali rounded-2xl shadow-sm ${
                        msg.isTutor 
                          ? "bg-white border border-slate-200 text-slate-800 rounded-bl-sm" 
                          : "bg-blue-600 text-white rounded-br-sm"
                      }`}
                    >
                      {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                      {msg.image && (
                        <img src={msg.image} alt="Attachment" className="mt-2 max-w-full rounded-lg h-auto max-h-60 border border-black/10" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 mx-1 font-sans">
                      {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-3 sm:p-4 shrink-0 pb-safe">
        <div className="max-w-3xl mx-auto flex flex-col gap-2 relative">
          
          {selectedImage && (
            <div className="relative inline-block w-fit mb-2">
              <img src={selectedImage} alt="Preview" className="h-24 rounded-lg border border-slate-200 object-cover shadow-sm" />
              <button 
                onClick={() => { setSelectedImage(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <div className="font-bold text-sm leading-none flex items-center justify-center">×</div>
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => fileInputRef.current?.click()} 
              className="shrink-0 rounded-full w-12 h-12 bg-slate-50 border-slate-200 hover:bg-slate-100"
            >
              <ImagePlus className="w-5 h-5 text-slate-500" />
            </Button>
            
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitDoubt();
                }
              }}
              placeholder="আপনার প্রশ্ন লিখুন..."
              className="flex-1 max-h-32 min-h-[48px] bg-slate-50 border border-slate-200 rounded-3xl px-4 py-3 font-bengali text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none shadow-inner"
              rows={1}
            />
            
            <Button 
              onClick={submitDoubt} 
              disabled={posting || (!newQuestion.trim() && !selectedImage)} 
              className="shrink-0 rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform active:scale-95"
            >
              {posting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

