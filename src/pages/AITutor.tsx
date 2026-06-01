import React, { useState, useRef, useEffect } from "react";
import { Send, Brain, User, Sparkles, Loader2, ImagePlus, X, MessageCircleQuestion, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from 'react-markdown';
import { useAuth } from "../lib/AuthContext";
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  image?: string;
}

interface Doubt {
  id: string;
  userId: string;
  userName: string;
  question: string;
  image?: string;
  status: "pending" | "answered";
  answer?: string;
  answeredBy?: string;
  createdAt: any;
}

export default function AITutor() {
  const { userData } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"ai" | "my_doubts" | "solve_doubts">("ai");
  
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
  const [answeringDoubtId, setAnsweringDoubtId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === "ai") scrollToBottom();
  }, [messages, activeTab]);

  useEffect(() => {
    if (activeTab === "my_doubts" && userData?.uid) {
      fetchMyDoubts();
    } else if (activeTab === "solve_doubts" && userData?.isTutor) {
      fetchAllDoubts();
    }
  }, [activeTab, userData]);

  const fetchMyDoubts = async () => {
    if (!userData?.uid) return;
    setDoubtLoading(true);
    try {
      const q = query(
        collection(db, "doubts"),
        where("userId", "==", userData.uid),
        // Without index, orderBy might fail. we will sort locally.
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
      const historyToSend = messages.filter(msg => msg.id !== "1");
      
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "bot", text: "VITE_GEMINI_API_KEY Missing! Netlify dashboard e environment variable add koro." }]);
        setLoading(false);
        return;
      }

      const systemInstruction = `You are a helpful and polite AI Tutor. You must only answer questions related to education, studying, and academics. If the user asks something outside of these domains, politely decline and remind them that you are an educational tutor. Respond in Bengali, neatly formatted, and easy for students to understand. Be encouraging and provide clear, step-by-step explanations when needed. Do not use 'নমস্কার' (namaskar) as a greeting. You can use 'হ্যালো' (Hello) or 'আসসালামু আলাইকুম' (Assalamu Alaikum), or just directly answer the question without a greeting.`;

      const contents = historyToSend.map((msg: any) => {
        return {
           role: msg.sender === "user" ? "user" : "model",
           parts: [{ text: msg.text }]
        };
      });

      const lastParts: any[] = [];
      if (userMessage.image) {
        try {
          const splitData = userMessage.image.split(',');
          const mimeType = splitData[0].match(/:(.*?);/)[1];
          const base64Data = splitData[1];
          lastParts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
        } catch (e) {
          console.error("Image processing error:", e);
        }
      }
      lastParts.push({ text: userMessage.text || "Explain this image related to my studies." });
      
      contents.push({ role: "user", parts: lastParts });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
           systemInstruction: { parts: [{text: systemInstruction}] },
           contents: contents
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "কোনো উত্তর পাওয়া যায়নি।";
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "bot", text: reply }]);
      } else {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "bot", text: `দুঃখিত, কোনো একটি সমস্যা হয়েছে। (${data.error?.message || "Unknown error"}). আবার চেষ্টা করো।` }]);
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
        question: input,
        image: selectedImage || null,
        status: "pending",
        createdAt: serverTimestamp()
      });
      alert("তোমার প্রশ্নটি টিউটরের কাছে পাঠানো হয়েছে।");
      setInput("");
      setSelectedImage(null);
      fetchMyDoubts();
    } catch (e) {
      console.error(e);
      alert("প্রশ্ন পাঠাতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const submitDoubtAnswer = async (doubtId: string) => {
    if (!answerText.trim() || !userData?.uid) return;
    
    setDoubtLoading(true);
    try {
      await updateDoc(doc(db, "doubts", doubtId), {
        status: "answered",
        answer: answerText,
        answeredBy: userData.fullName || "Tutor"
      });
      setAnswerText("");
      setAnsweringDoubtId(null);
      fetchAllDoubts();
    } catch(e) {
      console.error(e);
      alert("Failed to submit answer.");
    } finally {
      setDoubtLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-800 p-6 flex flex-col gap-2 relative shrink-0">
        <h1 className="text-2xl font-bengali font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-300" /> পড়াশোনার সাহায্যকারী
        </h1>
        <p className="text-white/80 font-bengali text-sm md:text-base">এআই টিউটর বা সরাসরি শিক্ষকের কাছে যেকোনো প্রশ্নের উত্তর নাও।</p>
        
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
            variant={activeTab === "my_doubts" ? "secondary" : "ghost"} 
            className={`font-bengali ${activeTab !== "my_doubts" && "text-white hover:text-white/80 hover:bg-white/10"}`}
            onClick={() => setActiveTab("my_doubts")}
          >
            <MessageCircleQuestion className="w-4 h-4 mr-2" />
            শিক্ষককে জিজ্ঞাসা
          </Button>
          {userData?.isTutor && (
            <Button 
              variant={activeTab === "solve_doubts" ? "secondary" : "ghost"} 
              className={`font-bengali ${activeTab !== "solve_doubts" && "text-white hover:text-white/80 hover:bg-white/10"}`}
              onClick={() => setActiveTab("solve_doubts")}
            >
              <Users className="w-4 h-4 mr-2" />
              শিক্ষার্থীর প্রশ্ন সমাধান
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

      {activeTab === "my_doubts" && (
        <div className="flex-1 overflow-y-auto flex flex-col bg-slate-50">
          <div className="p-4 md:p-6 space-y-4 flex-1">
            <h2 className="font-bengali font-bold text-lg text-slate-800">আমার প্রশ্নসমূহ</h2>
            
            {doubtLoading ? (
               <div className="flex items-center justify-center p-12">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
               </div>
            ) : myDoubts.length === 0 ? (
               <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 font-bengali shadow-sm">
                 এখনও কোনো প্রশ্ন জিজ্ঞাসা করা হয়নি।
               </div>
            ) : (
               <div className="space-y-4">
                 {myDoubts.map(doubt => (
                   <div key={doubt.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                     <div className="flex justify-between items-start gap-4">
                       <div>
                         <p className="font-bengali text-slate-900 break-words">{doubt.question}</p>
                         {doubt.image && (
                           <img src={doubt.image} alt="Doubt" className="mt-3 max-h-40 rounded-lg border border-slate-200 object-contain" />
                         )}
                       </div>
                       <div className="shrink-0">
                         {doubt.status === "answered" ? (
                           <span className="flex items-center gap-1 text-xs font-semibold bg-[#f2fbf5] text-[#2c7a3f] px-2.5 py-1 rounded-full whitespace-nowrap">
                             <CheckCircle2 className="w-3.5 h-3.5" /> উত্তর দেওয়া হয়েছে
                           </span>
                         ) : (
                           <span className="flex items-center gap-1 text-xs font-semibold bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full whitespace-nowrap">
                             অপেক্ষমান
                           </span>
                         )}
                       </div>
                     </div>
                     
                     {doubt.status === "answered" && doubt.answer && (
                       <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
                         <div className="flex items-center gap-2 mb-2">
                           <User className="w-4 h-4 text-primary" />
                           <span className="font-bold text-sm text-primary font-bengali">{doubt.answeredBy || "Tutor"}</span>
                           <span className="text-xs text-slate-400 font-bengali ml-auto">উত্তর</span>
                         </div>
                         <p className="font-bengali text-slate-700 whitespace-pre-wrap">{doubt.answer}</p>
                       </div>
                     )}
                   </div>
                 ))}
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
            <div className="space-y-4">
               {allDoubts.map(doubt => (
                 <div key={doubt.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                   <div className="flex justify-between items-start gap-4">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <span className="font-bold text-sm text-slate-800">{doubt.userName}</span>
                         <span className="text-xs text-slate-400">ask a question</span>
                       </div>
                       <p className="font-bengali text-slate-900 text-lg mb-2">{doubt.question}</p>
                       {doubt.image && (
                         <img src={doubt.image} alt="Doubt" className="mt-3 max-h-60 rounded-lg border border-slate-200 object-contain bg-slate-50" />
                       )}
                     </div>
                   </div>
                   
                   {answeringDoubtId === doubt.id ? (
                     <div className="mt-4 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <textarea 
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          className="w-full min-h-[100px] p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bengali"
                          placeholder="উত্তর লিখুন..."
                        />
                        <div className="flex gap-2 justify-end">
                           <Button variant="ghost" onClick={() => setAnsweringDoubtId(null)}>Cancel</Button>
                           <Button onClick={() => submitDoubtAnswer(doubt.id)}>উত্তর সাবমিট করুন</Button>
                        </div>
                     </div>
                   ) : (
                     <Button 
                       variant="default" 
                       className="w-full font-bengali bg-primary hover:bg-primary/90"
                       onClick={() => { setAnsweringDoubtId(doubt.id); setAnswerText(""); }}
                     >
                       উত্তর দিন
                     </Button>
                   )}
                 </div>
               ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
