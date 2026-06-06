import React, { useState, useRef, useEffect } from "react";
import { Send, Brain, User, Sparkles, Loader2, ImagePlus, X, MessageCircleQuestion, Users, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from 'react-markdown';
import { useAuth } from "../lib/AuthContext";
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useSearchParams, useNavigate } from "react-router-dom";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  image?: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: number;
}

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
  comments?: Comment[];
  createdAt: any;
}

export default function AITutor() {
  const { userData } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultTab = (searchParams.get("tab") as "ai" | "community_doubts" | "solve_doubts") || "ai";
  
  const [activeTab, setActiveTab] = useState<"ai" | "community_doubts" | "solve_doubts">(defaultTab);
  
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

  // Doubts state
  const [myDoubts, setMyDoubts] = useState<Doubt[]>([]);
  const [allDoubts, setAllDoubts] = useState<Doubt[]>([]);
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === "ai") scrollToBottom();
  }, [messages, activeTab]);

  useEffect(() => {
    if (activeTab === "community_doubts" && userData?.uid) {
      fetchCommunityDoubts();
    } else if (activeTab === "solve_doubts" && userData?.isTutor) {
      fetchAllDoubts();
    }
  }, [activeTab, userData]);

  const fetchCommunityDoubts = async () => {
    if (!userData?.uid) return;
    setDoubtLoading(true);
    try {
      const classQuery = userData.class ? where("userClass", "==", userData.class) : where("userId", "==", userData.uid);
      const q = query(
        collection(db, "doubts"),
        classQuery
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doubt));
      docs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setMyDoubts(docs);
    } catch (e) {
      console.error(e);
    } finally {
      setDoubtLoading(false);
    }
  };

  const fetchAllDoubts = async () => {
    setDoubtLoading(true);
    try {
      const q = query(collection(db, "doubts"), where("status", "==", "pending"));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doubt));
      setAllDoubts(docs);
    } catch (e) {
      console.error(e);
    } finally {
      setDoubtLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check size (max 2MB)
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
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "bot", text: data.text }]);
      } else {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "bot", text: `দুঃখিত, কোনো একটি সমস্যা হয়েছে। (${data.error || "Unknown error"}). আবার চেষ্টা করো।` }]);
      }
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "bot", text: "নেটওয়ার্ক সমস্যা। আবার চেষ্টা করো।" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAskHuman = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || !userData?.uid) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "doubts"), {
        userId: userData.uid,
        userName: userData.fullName || "Student",
        userClass: userData.class || "",
        question: input,
        image: selectedImage || null,
        status: "pending",
        comments: [],
        createdAt: serverTimestamp()
      });
      alert("তোমার প্রশ্নটি পোস্ট করা হয়েছে।");
      setInput("");
      setSelectedImage(null);
      fetchCommunityDoubts();
    } catch (e) {
      console.error(e);
      alert("প্রশ্ন পোস্ট করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (doubt: Doubt) => {
    const text = commentTexts[doubt.id];
    if (!text?.trim() || !userData?.uid) return;
    
    setDoubtLoading(true);
    const newComment = {
      id: Date.now().toString(),
      userId: userData.uid,
      userName: userData.fullName || "Student",
      text: text.trim(),
      createdAt: Date.now()
    };

    try {
      const updatedComments = [...(doubt.comments || []), newComment];
      await updateDoc(doc(db, "doubts", doubt.id), {
        comments: updatedComments
      });
      setCommentTexts(prev => ({...prev, [doubt.id]: ""}));
      if (activeTab === "community_doubts") fetchCommunityDoubts();
      if (activeTab === "solve_doubts") fetchAllDoubts();
    } catch(e) {
      console.error(e);
      alert("Commente submit korte somossa hoyeche.");
    } finally {
      setDoubtLoading(false);
    }
  };

  const submitAnswer = async (doubtId: string) => {
    const text = commentTexts[doubtId];
    if (!text?.trim() || !userData?.uid) return;

    setDoubtLoading(true);
    try {
      await updateDoc(doc(db, "doubts", doubtId), {
        status: "answered",
        answer: text.trim(),
        answeredBy: userData.fullName || "Tutor"
      });
      setCommentTexts(prev => ({...prev, [doubtId]: ""}));
      if (activeTab === "community_doubts") fetchCommunityDoubts();
      if (activeTab === "solve_doubts") fetchAllDoubts();
    } catch(e) {
      console.error(e);
      alert("Failed to submit answer.");
    } finally {
      setDoubtLoading(false);
    }
  };

  const renderDoubt = (doubt: Doubt) => (
    <div key={doubt.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-slate-800">{doubt.userName}</span>
            {doubt.userClass && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Class {doubt.userClass}</span>}
            <span className="text-xs text-slate-400">asked a doubt</span>
          </div>
          <p className="font-bengali text-slate-900 text-[15px]">{doubt.question}</p>
          {doubt.image && (
            <img src={doubt.image} alt="Doubt" className="mt-3 max-h-60 rounded-lg border border-slate-200 object-contain bg-slate-50" />
          )}
        </div>
      </div>
      
      {/* Legacy answers if any */}
      {doubt.status === "answered" && doubt.answer && (
        <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 relative">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-3 h-3 text-primary" />
            <span className="font-bold text-sm text-primary font-bengali">{doubt.answeredBy || "Tutor"}</span>
            <span className="text-xs text-slate-400 font-bengali ml-auto">Old answer</span>
          </div>
          <p className="font-bengali text-slate-700 text-sm whitespace-pre-wrap">{doubt.answer}</p>
        </div>
      )}

      {/* Comments */}
      {doubt.comments && doubt.comments.length > 0 && (
         <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
           {doubt.comments.map(c => (
              <div key={c.id} className="bg-slate-50 p-3 rounded-xl">
                 <div className="flex justify-between items-center mb-1">
                   <span className="font-bold text-sm text-slate-700">{c.userName} {c.userId === doubt.userId && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-1">Author</span>}</span>
                 </div>
                 <p className="text-slate-600 text-sm font-bengali whitespace-pre-wrap">{c.text}</p>
              </div>
           ))}
         </div>
      )}

      {/* Answer Input */}
      {doubt.status === "pending" && userData?.isTutor && (
        <div className="flex gap-2 mt-4 pt-2 border-t border-slate-100">
          <Input 
             value={commentTexts[doubt.id] || ""}
             onChange={(e) => setCommentTexts({...commentTexts, [doubt.id]: e.target.value})}
             placeholder="শিক্ষার্থীর প্রশ্নের উত্তর দিন (Reply)..."
             className="h-10 text-sm font-bengali bg-slate-50 border-blue-200 focus-visible:ring-blue-500"
          />
          <Button size="sm" onClick={() => submitAnswer(doubt.id)} disabled={doubtLoading || !commentTexts[doubt.id]?.trim()} className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white">
             Answer
          </Button>
        </div>
      )}
      
      {/* Fallback comment for others */}
      {(!userData?.isTutor || doubt.status !== "pending") && (
        <div className="flex gap-2 mt-4 pt-2">
          <Input 
             value={commentTexts[doubt.id] || ""}
             onChange={(e) => setCommentTexts({...commentTexts, [doubt.id]: e.target.value})}
             placeholder="Discuss or comment..."
             className="h-10 text-sm font-bengali bg-slate-50"
          />
          <Button variant="ghost" size="sm" onClick={() => submitComment(doubt)} disabled={doubtLoading || !commentTexts[doubt.id]?.trim()} className="h-10 px-4 text-slate-500">
             Send
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-800 p-6 flex flex-col gap-2 relative shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none"
            title="ড্যাশবোর্ডে ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bengali font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-300" /> পড়াশোনার সাহায্যকারী
          </h1>
        </div>
        <p className="text-white/80 font-bengali text-sm md:text-base pl-13">এআই টিউটর বা সরাসরি শিক্ষকের কাছে যেকোনো প্রশ্নের উত্তর নাও।</p>
        
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          <Button 
            variant={activeTab === "ai" ? "secondary" : "ghost"} 
            className={`font-bengali ${activeTab !== "ai" && "text-white hover:text-white/80 hover:bg-white/10"}`}
            onClick={() => setActiveTab("ai")}
          >
            <Brain className="w-4 h-4 mr-2" />
            এআই টিউটর
          </Button>
          <Button 
            variant={activeTab === "community_doubts" ? "secondary" : "ghost"} 
            className={`font-bengali ${activeTab !== "community_doubts" && "text-white hover:text-white/80 hover:bg-white/10"}`}
            onClick={() => setActiveTab("community_doubts")}
          >
            <MessageCircleQuestion className="w-4 h-4 mr-2" />
            শিক্ষককে প্রশ্ন করো
          </Button>
          {userData?.isTutor && (
            <Button 
              variant={activeTab === "solve_doubts" ? "secondary" : "ghost"} 
              className={`font-bengali ${activeTab !== "solve_doubts" && "text-white hover:text-white/80 hover:bg-white/10"}`}
              onClick={() => setActiveTab("solve_doubts")}
            >
              <Users className="w-4 h-4 mr-2" />
              সকল ডাউটস (Tutor)
            </Button>
          )}
        </div>
      </div>

      {activeTab === "ai" && (
        <>
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                {msg.sender === "bot" && (
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 font-bengali space-y-2 ${
                  msg.sender === "user" 
                    ? "bg-primary text-white rounded-tr-sm" 
                    : "bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-sm"
                }`}>
                  {msg.image && (
                    <div className="mb-3 max-w-sm rounded-xl overflow-hidden border border-white/20">
                      <img src={msg.image} alt="Uploaded" className="w-full h-auto object-contain" />
                    </div>
                  )}
                  {msg.sender === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="prose prose-sm prose-slate max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-sm text-slate-500 font-bengali">খুঁজছি...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area AI */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            {selectedImage && (
              <div className="relative inline-block mb-3 bg-slate-100 p-2 rounded-xl">
                 <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-slate-200 shadow-sm"/>
                 <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                 >
                   <X className="w-3 h-3" />
                 </button>
              </div>
            )}
            <form onSubmit={handleSendAI} className="flex gap-2">
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
                className="h-12 w-12 shrink-0 border-slate-200 text-slate-500"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="w-5 h-5" />
              </Button>
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={"এআই টিউটরকে জিজ্ঞাসা করো..."}
                className="flex-1 h-12 rounded-xl border-slate-200 focus:bg-slate-50 font-bengali"
                disabled={loading}
              />
              <Button 
                type="submit" 
                disabled={loading || (!input.trim() && !selectedImage)}
                className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-white shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </>
      )}

      {activeTab === "community_doubts" && (
        <div className="flex-1 overflow-y-auto flex flex-col bg-slate-50">
          <div className="p-4 md:p-6 space-y-4 flex-1">
            <h2 className="font-bengali font-bold text-lg text-slate-800">শিক্ষককে প্রশ্ন করো ({userData?.class ? `Class ${userData.class}` : "All"})</h2>
            
            {doubtLoading ? (
               <div className="flex items-center justify-center p-12">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
               </div>
            ) : myDoubts.length === 0 ? (
               <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 font-bengali shadow-sm">
                 আপনার ক্লাসে এখনও কোনো প্রশ্ন জিজ্ঞাসা করা হয়নি।
               </div>
            ) : (
               <div className="space-y-4 md:space-y-6">
                 {myDoubts.map(renderDoubt)}
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area Human Tutor */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            {selectedImage && (
              <div className="relative inline-block mb-3 bg-slate-100 p-2 rounded-xl">
                 <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-slate-200 shadow-sm"/>
                 <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                 >
                   <X className="w-3 h-3" />
                 </button>
              </div>
            )}
            <form onSubmit={handleAskHuman} className="flex gap-2">
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
                className="h-12 w-12 shrink-0 border-slate-200 text-slate-500"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="w-5 h-5" />
              </Button>
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={"শিক্ষককে প্রশ্ন পাঠাও..."}
                className="flex-1 h-12 rounded-xl border-slate-200 focus:bg-orange-50 focus:border-orange-200 border-2 font-bengali"
                disabled={loading}
              />
              <Button 
                type="submit" 
                disabled={loading || (!input.trim() && !selectedImage)}
                className="h-12 border-orange-500 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shrink-0 font-bengali"
              >
                পাঠিয়ে দাও
              </Button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "solve_doubts" && userData?.isTutor && (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bengali font-bold text-xl text-slate-800">অপেক্ষমান প্রশ্নসমূহ (Pending Doubts)</h2>
            <Button variant="outline" size="sm" onClick={fetchAllDoubts} disabled={doubtLoading}>
              Refresh
            </Button>
          </div>

          {doubtLoading ? (
               <div className="flex items-center justify-center p-12">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
               </div>
          ) : allDoubts.length === 0 ? (
               <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 font-bengali shadow-sm">
                 দারুণ! সব প্রশ্নের উত্তর দেওয়া হয়ে গেছে।
               </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
               {allDoubts.map(renderDoubt)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
