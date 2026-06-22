import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Trophy, Gift, Search, RefreshCw, UserCheck, X, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import confetti from 'canvas-confetti';

interface ExamParticipant {
  id: string;
  studentName: string;
  examTitle: string;
  score: number;
  total: number;
  submittedAt: any;
  examId: string;
  mobileNumber?: string;
}

export function EventExamTab() {
  const [participants, setParticipants] = useState<ExamParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<ExamParticipant | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      // 1. Fetch public exams of type 'event_exam' or containing 'mega/event' in their titles to gather search keys
      const examsSnapshot = await getDocs(collection(db, "public_exams"));
      const eventExamIds = new Set<string>();
      
      examsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const type = data.type || "";
        const title = (data.title || "").toLowerCase();
        
        if (
          type === "event_exam" || 
          title.includes("mega") || 
          title.includes("মেগা") || 
          title.includes("event") || 
          title.includes("ইভেন্ট")
        ) {
          eventExamIds.add(doc.id.trim());
          eventExamIds.add(doc.id.trim().toLowerCase());
        }
      });

      // 2. Fetch all public exam results
      const resultsSnapshot = await getDocs(collection(db, "public_exam_results"));
      
      const allResults: ExamParticipant[] = [];
      resultsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const examId = (data.examId || "").trim();
        const examTitle = (data.examTitle || "").toLowerCase();
        const mobile = (data.mobileNumber || "").trim();
        
        // Match either by registered event exam ID or matching mega/event text key or if mobile is present for guest event tracking
        const isMegaEvent = 
          eventExamIds.has(examId) || 
          eventExamIds.has(examId.toLowerCase()) ||
          examTitle.includes("mega") ||
          examTitle.includes("মেগা") ||
          examTitle.includes("event") ||
          examTitle.includes("ইভেন্ট") ||
          examTitle.includes("quiz") ||
          examTitle.includes("কুইজ") ||
          examTitle.includes("test") ||
          examTitle.includes("টেস্ট") ||
          examTitle.includes("live") ||
          examTitle.includes("লাইভ") ||
          mobile.length >= 11;

        if (isMegaEvent) {
          allResults.push({
            id: doc.id,
            studentName: data.studentName || "অজ্ঞাত",
            examTitle: data.examTitle || "Event Exam",
            score: data.score || 0,
            total: data.total || 0,
            submittedAt: data.submittedAt,
            examId: data.examId || "",
            mobileNumber: data.mobileNumber || ""
          });
        }
      });
      
      // Sort first by score descending, and if they are equal, by submission date/time descending (if available)
      setParticipants(
        allResults.sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          const timeA = a.submittedAt?.seconds || 0;
          const timeB = b.submittedAt?.seconds || 0;
          return timeB - timeA;
        })
      );
    } catch (e) {
      console.error("Error fetching event exam participants:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const spinForWinner = () => {
    if (participants.length === 0) return;
    
    setIsSpinning(true);
    setWinner(null);

    let spins = 0;
    const maxSpins = 20;
    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * participants.length);
      setWinner(participants[randomIndex]);
      spins++;
      
      if (spins >= maxSpins) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        setShowWinnerDialog(true);
        triggerConfetti();
      }
    }, 100);
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f43f5e', '#3b82f6', '#10b981']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f43f5e', '#3b82f6', '#10b981']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleDownload = () => {
    if (participants.length === 0) return;
    
    // Add UTF-8 BOM so Excel opens Bengali perfectly
    const BOM = "\uFEFF";
    let csvContent = BOM + "Rank (অবস্থান),Student Name (শিক্ষার্থীর নাম),Mobile Number (মোবাইল নম্বর),Exam Title (পরীক্ষার নাম),Score (প্রাপ্ত নম্বর),Total Questions (মোট প্রশ্ন),Percentage (শতকরা হার %)\n";
    
    participants.forEach((p, index) => {
      const percentage = p.total > 0 ? Math.round((p.score / p.total) * 100) : 0;
      const sanitizedName = `"${(p.studentName || '').replace(/"/g, '""')}"`;
      const sanitizedMobile = `"${(p.mobileNumber || '').replace(/"/g, '""')}"`;
      const sanitizedTitle = `"${(p.examTitle || '').replace(/"/g, '""')}"`;
      csvContent += `${index + 1},${sanitizedName},${sanitizedMobile},${sanitizedTitle},${p.score},${p.total},${percentage}%\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `event_exam_leaderboard_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredParticipants = participants.filter(p => 
    p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.examTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-card p-6 rounded-2xl border border-slate-100 dark:border-border shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold font-bengali text-rose-600 flex items-center gap-2">
            <Trophy className="w-6 h-6" /> ইভেন্ট এক্সাম
          </h2>
          <p className="text-sm text-slate-500 font-bengali mt-1">ইভেন্ট এক্সামে অংশগ্রহণকারীদের স্পিন করে বিজয়ী নির্বাচন করুন</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button onClick={fetchParticipants} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> রিফ্রেশ
          </Button>
          <Button 
            onClick={handleDownload} 
            disabled={participants.length === 0}
            variant="outline" 
            size="sm"
            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 font-bengali"
          >
            <Download className="w-4 h-4 mr-2" /> ডাউনলোড (মার্ক সহ)
          </Button>
          <Button 
            onClick={spinForWinner} 
            disabled={isSpinning || participants.length === 0}
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bengali shadow-md"
          >
            <Gift className="w-4 h-4 mr-2" /> {isSpinning ? "স্পিন হচ্ছে..." : "স্পিন করুন (বিজয়ী নির্বাচন)"}
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            type="text" 
            placeholder="নাম বা পরীক্ষার নাম খুঁজুন..." 
            className="pl-9 font-bengali"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-100 dark:border-border">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <RefreshCw className="w-8 h-8 mb-4 text-rose-500 animate-spin" />
            <p className="font-bengali">অংশগ্রহণকারীদের তথ্য লোড হচ্ছে...</p>
          </div>
        ) : filteredParticipants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-800/50">
                  <th className="p-3 font-bengali text-sm font-semibold text-slate-600 dark:text-slate-300">নাম</th>
                  <th className="p-3 font-bengali text-sm font-semibold text-slate-600 dark:text-slate-300">পরীক্ষা</th>
                  <th className="p-3 font-bengali text-sm font-semibold text-slate-600 dark:text-slate-300 text-center">স্কোর</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredParticipants.map((participant, index) => (
                  <tr key={participant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-bengali font-medium flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0">
                         {index + 1}
                       </div>
                       <div>
                         <div className="text-slate-900 dark:text-white font-bold">{participant.studentName}</div>
                         {participant.mobileNumber && (
                           <div className="text-xs text-slate-500 font-mono font-medium mt-0.5">
                             📲 {participant.mobileNumber}
                           </div>
                         )}
                       </div>
                    </td>
                    <td className="p-3 text-slate-500 font-bengali">{participant.examTitle}</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-xs font-bold font-bengali">
                        {participant.score}/{participant.total}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <UserCheck className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-bengali">কোনো অংশগ্রহণকারী পাওয়া যায়নি!</p>
          </div>
        )}
      </div>

      {showWinnerDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-br from-white to-rose-50 dark:from-card dark:to-rose-950/20 rounded-2xl p-6 sm:p-8 w-full max-w-md text-center shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowWinnerDialog(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bengali font-bold text-center text-rose-600 mb-6">🎉 বিজয়ী নির্বাচিত! 🎉</h2>
            
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center mb-4 shadow-inner ring-8 ring-rose-50 dark:ring-rose-950/30">
                <Gift className="w-12 h-12 text-rose-500" />
              </div>
              
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{winner?.studentName}</h3>
              {winner?.mobileNumber && (
                <p className="text-base text-rose-600 font-mono font-bold mb-3">📲 {winner.mobileNumber}</p>
              )}
              
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="bg-white dark:bg-card px-4 py-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 font-bengali mb-1">পরীক্ষা</p>
                  <p className="font-bengali font-semibold text-rose-600">{winner?.examTitle}</p>
                </div>
                <div className="bg-white dark:bg-card px-4 py-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 font-bengali mb-1">স্কোর</p>
                  <p className="font-bengali font-semibold text-emerald-600">{winner?.score}/{winner?.total}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
