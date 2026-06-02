import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../lib/AuthContext";
import { collection, addDoc, getDocs, query, where, doc, updateDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ImagePlus, User, Send, CheckCircle2 } from "lucide-react";

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

export default function Doubts() {
  const { userData } = useAuth();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  
  const [newQuestion, setNewQuestion] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userData?.uid) {
      fetchDoubts();
    }
  }, [userData]);

  const fetchDoubts = async () => {
    if (!userData?.uid) return;
    setLoading(true);
    try {
      // Fetch doubts corresponding to user's class (or general if no class)
      let q;
      if (userData.class) {
        q = query(collection(db, "doubts"), where("userClass", "==", userData.class));
      } else {
        q = query(collection(db, "doubts"));
      }
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doubt));
      // sort manually since firestore requires composite index for where + orderby
      docs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setDoubts(docs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
        userName: userData.name || "Student",
        userClass: userData.class || null,
        question: newQuestion.trim(),
        image: selectedImage || null,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setNewQuestion("");
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchDoubts();
    } catch (e) {
      console.error(e);
      alert("Failed to submit doubt.");
    } finally {
      setPosting(false);
    }
  };

  const submitComment = async (doubt: Doubt) => {
    const text = commentTexts[doubt.id];
    if (!text?.trim() || !userData) return;
    
    setLoading(true);
    try {
      const newComment: Comment = {
        id: Date.now().toString(),
        userId: userData.uid,
        userName: userData.name || "User",
        text: text.trim(),
        createdAt: Date.now()
      };
      const updatedComments = [...(doubt.comments || []), newComment];
      await updateDoc(doc(db, "doubts", doubt.id), {
        comments: updatedComments
      });
      setCommentTexts(prev => ({...prev, [doubt.id]: ""}));
      fetchDoubts();
    } catch (e) {
      console.error(e);
      alert("Failed to post comment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm px-6 py-4 flex items-center justify-between border-b border-slate-200">
        <h1 className="font-bengali font-bold text-xl text-slate-800">ডাউট সলভিং</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Ask Question Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="তোমার কী প্রশ্ন আছে? (Describe your problem...)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bengali text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
              />
              
              {selectedImage && (
                <div className="relative inline-block mt-2">
                  <img src={selectedImage} alt="Preview" className="h-32 rounded-lg border border-slate-200 object-cover" />
                  <button 
                    onClick={() => { setSelectedImage(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <div>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
                  <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="text-slate-500 hover:text-blue-600 font-bengali h-9">
                    <ImagePlus className="w-4 h-4 mr-2" /> ছবি যোগ করো
                  </Button>
                </div>
                <Button onClick={submitDoubt} disabled={posting || (!newQuestion.trim() && !selectedImage)} className="bg-blue-600 hover:bg-blue-700 text-white font-bengali px-6 rounded-full shadow-sm">
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : "পোস্ট করুন"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {loading && !doubts.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="font-bengali font-medium">লোড হচ্ছে...</p>
            </div>
          ) : doubts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <p className="font-bengali font-bold text-slate-500 text-lg">কোনো প্রশ্ন পাওয়া যায়নি</p>
              <p className="text-sm font-bengali text-slate-400 mt-2">প্রথম প্রশ্নটি তুমিই করো!</p>
            </div>
          ) : (
            doubts.map(doubt => (
              <div key={doubt.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                {/* Post Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-800">{doubt.userName}</span>
                    {doubt.userClass && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full ml-2">Class {doubt.userClass}</span>}
                    <div className="text-[11px] text-slate-400 mt-0.5 font-sans">
                      {doubt.createdAt?.toMillis ? new Date(doubt.createdAt.toMillis()).toLocaleString() : "Just now"}
                    </div>
                  </div>
                  {doubt.status === "answered" && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Answered</span>}
                </div>
                
                {/* Question */}
                <p className="font-bengali text-slate-900 text-[15px] whitespace-pre-wrap">{doubt.question}</p>
                {doubt.image && (
                  <img src={doubt.image} alt="Doubt" className="mt-3 max-h-80 w-full rounded-lg border border-slate-200 object-contain bg-slate-50" />
                )}

                {/* Answer from AI/Tutor */}
                {doubt.status === "answered" && doubt.answer && (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mt-4 relative">
                    <div className="absolute top-0 right-8 transform -translate-y-1/2 w-8 h-8 bg-blue-100 border border-blue-200 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-bold text-sm text-blue-800 font-bengali block mb-2">{doubt.answeredBy || "Tutor"}</span>
                    <p className="font-bengali text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">{doubt.answer}</p>
                  </div>
                )}

                {/* Community Comments */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 mt-4">
                  <h4 className="font-bengali font-bold text-sm text-slate-600 mb-2">মতামত ও আলোচনা</h4>
                  
                  {doubt.comments && doubt.comments.length > 0 ? (
                    doubt.comments.map(c => (
                      <div key={c.id} className="flex gap-2">
                        <div className="bg-white px-3 py-2 rounded-xl rounded-tl-sm border border-slate-200 text-sm flex-1">
                          <span className="font-bold text-[13px] text-slate-700 block mb-0.5">{c.userName} {c.userId === doubt.userId && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-1">Author</span>}</span>
                          <span className="font-bengali text-slate-800 break-words">{c.text}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs font-bengali text-slate-400">এখনো কোনো মতামত নেই।</p>
                  )}

                  {/* Add Comment Input */}
                  <div className="flex gap-2 mt-2 pt-2">
                    <Input 
                      placeholder="মতামত লিখুন..." 
                      className="font-bengali text-sm h-10 bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-300"
                      value={commentTexts[doubt.id] || ""}
                      onChange={(e) => setCommentTexts({...commentTexts, [doubt.id]: e.target.value})}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          submitComment(doubt);
                        }
                      }}
                    />
                    <Button size="sm" onClick={() => submitComment(doubt)} disabled={loading || !commentTexts[doubt.id]?.trim()} className="h-10 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
