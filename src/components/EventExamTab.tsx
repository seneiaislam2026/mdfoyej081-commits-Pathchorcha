import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  Trophy, 
  Gift, 
  Search, 
  RefreshCw, 
  UserCheck, 
  X, 
  Download, 
  Printer, 
  TrendingUp, 
  Award, 
  Star,
  Sparkles,
  Phone,
  BookOpen,
  CheckCircle,
  Clock,
  User,
  ExternalLink
} from 'lucide-react';
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

// English to Bengali Number Converter
const toBnNumber = (num: string | number) => {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (digit) => banglaDigits[parseInt(digit)]);
};

export function EventExamTab() {
  const [participants, setParticipants] = useState<ExamParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState('all');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<ExamParticipant | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [spinningIndex, setSpinningIndex] = useState<number | null>(null);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      // 1. Fetch public exams of type 'event_exam' or containing 'mega/event' in their titles
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
      
      // Sort first by score descending, and if equal, by submission date/time descending
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
    setSpinningIndex(null);

    let spins = 0;
    const maxSpins = 30;
    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * participants.length);
      setSpinningIndex(randomIndex);
      setWinner(participants[randomIndex]);
      spins++;
      
      if (spins >= maxSpins) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        setSpinningIndex(null);
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
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#00B074', '#3b82f6', '#f43f5e', '#f59e0b']
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#00B074', '#3b82f6', '#f43f5e', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleDownload = () => {
    if (participants.length === 0) return;
    
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

  const handlePrintPDF = () => {
    if (filteredParticipants.length === 0) return;
    
    const printContainer = document.createElement("div");
    printContainer.id = "biddayan-print-root";
    printContainer.style.position = "absolute";
    printContainer.style.left = "0";
    printContainer.style.top = "0";
    printContainer.style.width = "100%";
    printContainer.style.backgroundColor = "white";
    printContainer.style.color = "#1e293b";
    printContainer.style.fontFamily = "'Hind Siliguri', 'Noto Sans Bengali', sans-serif";
    printContainer.style.zIndex = "999999";
    printContainer.style.padding = "30px";
    
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date().toLocaleDateString('bn-BD', options);
    const formattedTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    const rowsHTML = filteredParticipants.map((p, index) => {
      const percentage = p.total > 0 ? Math.round((p.score / p.total) * 100) : 0;
      
      let rankStyle = 'color: #475569; font-weight: bold; font-size: 13px;';
      if (index === 0) {
        rankStyle = 'color: #ca8a04; font-weight: 800; font-size: 15px; background-color: #fef9c3; border-radius: 50%; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border: 1.5px solid #fef08a;';
      } else if (index === 1) {
        rankStyle = 'color: #475569; font-weight: 800; font-size: 14px; background-color: #f1f5f9; border-radius: 50%; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border: 1.5px solid #e2e8f0;';
      } else if (index === 2) {
        rankStyle = 'color: #b45309; font-weight: 800; font-size: 14px; background-color: #ffedd5; border-radius: 50%; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border: 1.5px solid #fed7aa;';
      }

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; page-break-inside: avoid;">
          <td style="padding: 12px 8px; text-align: center; vertical-align: middle;">
            <span style="${rankStyle}">${index + 1}</span>
          </td>
          <td style="padding: 12px 12px; font-weight: bold; color: #051d3b; text-align: left; vertical-align: middle;">
            <div style="font-size: 14px; font-weight: 700;">${p.studentName || 'অজ্ঞাত'}</div>
            ${p.mobileNumber ? `<div style="font-size: 11px; color: #64748b; font-family: monospace; font-weight: 500; margin-top: 3px; display: flex; align-items: center; gap: 3px;">📱 ${p.mobileNumber}</div>` : ''}
          </td>
          <td style="padding: 12px 12px; color: #475569; font-size: 13px; text-align: left; vertical-align: middle;">
            ${p.examTitle || 'ইভেন্ট কুইজ'}
          </td>
          <td style="padding: 12px 12px; text-align: center; vertical-align: middle;">
            <span style="font-weight: bold; font-family: monospace; color: #00b074; background-color: #e6f7f1; padding: 4px 10px; border-radius: 6px; font-size: 13px; border: 1px solid #c2eedf;">
              ${p.score} / ${p.total}
            </span>
          </td>
          <td style="padding: 12px 12px; text-align: right; font-weight: 800; color: #3b82f6; font-size: 13px; font-family: monospace; vertical-align: middle;">
            ${percentage}%
          </td>
        </tr>
      `;
    }).join('');

    printContainer.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;700;800&display=swap');
        
        @media print {
          #root, .no-print, header, footer, nav, aside, .floating-actions-container {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #biddayan-print-root {
            display: block !important;
            position: relative !important;
            padding: 20px !important;
          }
          @page {
            size: A4;
            margin: 15mm 15mm 15mm 15mm;
          }
        }
      </style>

      <div style="max-width: 820px; margin: 0 auto; background: white; font-family: 'Hind Siliguri', 'Noto Sans Bengali', sans-serif;">
        <!-- Header Banner with Logo -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3.5px solid #051D3B; padding-bottom: 22px; margin-bottom: 25px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="https://i.ibb.co/7dGVYGFD/SAVE-20260621-201151.jpg" alt="Biddayan" style="height: 70px; width: auto; object-fit: contain;" />
            <div>
              <h1 style="font-size: 32px; font-weight: 800; color: #051D3B; margin: 0; font-family: 'Noto Sans Bengali', sans-serif; letter-spacing: -0.5px; line-height: 1.1;">
                <span style="color: #00B074;">বিদ্যা</span>য়ন
              </h1>
              <p style="font-size: 13px; color: #475569; margin: 4px 0 0 0; font-weight: 600; letter-spacing: 0.2px;">শিক্ষা হোক আনন্দময়</p>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="background-color: #051D3B; color: white; padding: 7px 18px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; font-family: 'Noto Sans Bengali', sans-serif;">
              ইভেন্ট লিডারবোর্ড রিপোর্ট
            </div>
            <p style="font-size: 12px; color: #64748b; margin: 8px 0 0 0; font-family: monospace; font-weight: 500;">www.biddayan.com</p>
          </div>
        </div>

        <!-- Meta Information Grid -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 25px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 13.5px; line-height: 1.5; color: #334155;">
          <div>
            <strong style="color: #051d3b;">পরীক্ষা ফিল্টার:</strong> 
            <span style="color: #0f172a; font-weight: 600; margin-left: 6px;">${searchTerm ? `"${searchTerm}" খোঁজা হয়েছে` : 'সকল ইভেন্ট এক্সাম'}</span>
          </div>
          <div style="text-align: right;">
            <strong style="color: #051d3b;">তারিখ ও সময়:</strong> 
            <span style="color: #0f172a; font-weight: 600; margin-left: 6px;">${formattedDate} | ${formattedTime}</span>
          </div>
          <div>
            <strong style="color: #051d3b;">অংশগ্রহণকারী:</strong> 
            <span style="color: #4f46e5; font-weight: 700; margin-left: 6px;">${filteredParticipants.length} জন</span>
          </div>
          <div style="text-align: right;">
            <strong style="color: #051d3b;">রিপোর্ট প্রস্তুতকারক:</strong> 
            <span style="color: #00b074; font-weight: 700; margin-left: 6px;">বিদ্যায়ন এক্সাম সিস্টেম</span>
          </div>
        </div>

        <!-- Leaderboard Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 45px; text-align: left; font-size: 13.5px;">
          <thead>
            <tr style="background-color: #051D3B; color: white; border-radius: 8px;">
              <th style="padding: 12px 10px; text-align: center; border-radius: 8px 0 0 8px; width: 70px; font-weight: 700;">অবস্থান</th>
              <th style="padding: 12px 12px; font-weight: 700;">শিক্ষার্থীর নাম</th>
              <th style="padding: 12px 12px; font-weight: 700;">পরীক্ষার নাম</th>
              <th style="padding: 12px 12px; text-align: center; width: 130px; font-weight: 700;">প্রাপ্ত স্কোর</th>
              <th style="padding: 12px 12px; text-align: right; border-radius: 0 8px 8px 0; width: 90px; font-weight: 700;">সাফল্যের হার</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>

        <!-- Signatures and Verification -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 75px; padding-top: 25px; border-top: 1.5px dashed #cbd5e1; page-break-inside: avoid;">
          <div style="text-align: left;">
            <div style="height: 55px;"></div>
            <div style="width: 190px; border-top: 1.2px solid #94a3b8; margin-bottom: 6px;"></div>
            <p style="font-size: 13px; font-weight: 700; color: #051d3b; margin: 0;">ইভেন্ট কো-অর্ডিনেটর</p>
            <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">বিদ্যায়ন ইভেন্ট ম্যানেজমেন্ট</p>
          </div>
          
          <div style="text-align: center; max-width: 280px; align-self: center;">
            <p style="font-size: 12px; color: #94a3b8; font-style: italic; margin: 0; line-height: 1.5; font-weight: 500;">
              "বিদ্যায়ন এর সাথে আপনার শিক্ষাজীবন হোক আরও গতিময়, প্রযুক্তিময় ও সাফল্যমণ্ডিত।"
            </p>
          </div>

          <div style="text-align: right;">
            <div style="height: 55px;"></div>
            <div style="width: 190px; border-top: 1.2px solid #94a3b8; margin-bottom: 6px;"></div>
            <p style="font-size: 13px; font-weight: 700; color: #051d3b; margin: 0;">পরীক্ষা নিয়ন্ত্রণ কমিটি</p>
            <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">বিদ্যায়ন একাডেমি</p>
          </div>
        </div>
        
        <!-- Bottom Disclaimer -->
        <div style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 60px; border-top: 1px solid #f1f5f9; padding-top: 12px; page-break-inside: avoid; font-weight: 500;">
          এটি বিদ্যায়ন একাডেমির একটি অফিসিয়াল ও সংরক্ষিত লিডারবোর্ড রেকর্ড। সর্বস্বত্ব সংরক্ষিত © ${new Date().getFullYear()} বিদ্যায়ন।
        </div>
      </div>
    `;

    document.body.appendChild(printContainer);
    
    setTimeout(() => {
      window.print();
      document.body.removeChild(printContainer);
    }, 350);
  };

  // Filter and search calculations
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.examTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExamFilter = selectedExamFilter === 'all' || p.examTitle === selectedExamFilter;
    return matchesSearch && matchesExamFilter;
  });

  // Unique exams list for dropdown filter
  const uniqueExams = Array.from(new Set(participants.map(p => p.examTitle)));

  // Stats calculation based on ALL participants
  const totalParticipantsCount = participants.length;
  const fullScorersCount = participants.filter(p => p.score === p.total && p.total > 0).length;
  
  const averagePercentage = participants.length > 0 
    ? Math.round(participants.reduce((acc, p) => acc + (p.total > 0 ? (p.score / p.total) * 100 : 0), 0) / participants.length)
    : 0;

  // Find most frequent exam
  const examFreq: { [key: string]: number } = {};
  participants.forEach(p => {
    if (p.examTitle) {
      examFreq[p.examTitle] = (examFreq[p.examTitle] || 0) + 1;
    }
  });
  let popularExam = "N/A";
  let maxFreq = 0;
  Object.entries(examFreq).forEach(([title, freq]) => {
    if (freq > maxFreq) {
      maxFreq = freq;
      popularExam = title;
    }
  });

  // Unique beautiful avatar color generator based on index
  const getAvatarGradient = (index: number) => {
    const gradients = [
      "from-[#FF6B6B] to-[#FF8E53]",
      "from-[#4E65FF] to-[#92EFFD]",
      "from-[#11998e] to-[#38ef7d]",
      "from-[#FC466B] to-[#3F5EFB]",
      "from-[#f857a6] to-[#ff5858]",
      "from-[#00c6ff] to-[#0072ff]",
      "from-[#7F00FF] to-[#E100FF]"
    ];
    return gradients[index % gradients.length];
  };

  const getInitials = (name: string) => {
    if (!name) return "S";
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Premium Hero Title Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#051D3B] via-[#0a294d] to-[#031326] p-6 md:p-8 text-white border border-[#0d3460] shadow-xl">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-[#00B074]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        
        {/* Top Gold Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-amber-400 via-yellow-300 to-[#00B074]" />

        <div className="relative flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#00B074]/20 border border-[#00B074]/30 px-3.5 py-1 rounded-full text-[#00e295] text-xs font-bold mb-3.5 tracking-wide font-bengali">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> মেগা কুইজ ইভেন্ট পোর্টাল
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-bengali tracking-tight flex items-center gap-3 drop-shadow-sm">
              <Trophy className="w-10 h-10 md:w-11 md:h-11 text-amber-400 drop-shadow-md animate-bounce shrink-0" /> ইভেন্ট লিডারবোর্ড ড্যাশবোর্ড
            </h1>
            <p className="text-slate-300 font-bengali text-sm md:text-base mt-2.5 max-w-2xl leading-relaxed">
              বিদ্যায়ন মেগা ইভেন্ট কুইজের রিয়েল-টাইম মেধা তালিকা পর্যবেক্ষণ করুন, ক্যান্ডিডেটদের এক্সেল রিপোর্ট ডাউনলোড করুন এবং কুইজ ড্র থেকে ভাগ্যবান বিজয়ী নির্বাচন করুন।
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto shrink-0 mt-2 xl:mt-0">
            <Button 
              onClick={fetchParticipants} 
              variant="outline" 
              size="sm"
              className="bg-white/5 border-white/15 hover:bg-white/10 hover:text-white text-white font-bengali h-11 px-4.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> রিফ্রেশ করুন
            </Button>
            <Button 
              onClick={handleDownload} 
              disabled={participants.length === 0}
              variant="outline" 
              size="sm"
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-[#10b981] border-emerald-500/25 font-bengali h-11 px-4.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> এক্সেল ডাউনলোড
            </Button>
            <Button 
              onClick={handlePrintPDF} 
              disabled={filteredParticipants.length === 0}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bengali shadow-md border border-indigo-500/30 h-11 px-4.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> PDF প্রিন্ট
            </Button>
            <Button 
              onClick={spinForWinner} 
              disabled={isSpinning || participants.length === 0}
              className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 hover:opacity-95 text-white font-bengali shadow-lg h-11 px-5 rounded-xl border border-rose-400/30 transition-all duration-300 flex items-center gap-2 cursor-pointer active:scale-95 animate-pulse"
            >
              <Gift className="w-4 h-4" /> {isSpinning ? "ড্র ঘুরছে..." : "লাকি ড্র স্পিন"}
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Participants */}
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-rose-500" />
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider font-bengali">মোট অংশগ্রহণকারী</span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-sans tracking-tight">
              {toBnNumber(totalParticipantsCount)} <span className="text-base font-bold font-bengali text-slate-400">জন</span>
            </h3>
            <span className="text-[11px] text-rose-500 font-bengali font-bold mt-2 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> রিয়েল-টাইম ডাটা
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-500 shrink-0 shadow-inner">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Full Mark Scorers */}
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#00B074]" />
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider font-bengali">১০০% সঠিক উত্তরকারী</span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-sans tracking-tight">
              {toBnNumber(fullScorersCount)} <span className="text-base font-bold font-bengali text-slate-400">জন</span>
            </h3>
            <span className="text-[11px] text-emerald-500 font-bengali font-bold mt-2 inline-flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> মেগা স্টার মেধা স্কোরার
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500 shrink-0 shadow-inner">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Success Rate */}
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-blue-500" />
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider font-bengali">গড় সফলতার হার</span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-sans tracking-tight">
              {toBnNumber(averagePercentage)}<span className="text-base font-bold text-slate-400">%</span>
            </h3>
            <span className="text-[11px] text-blue-500 font-bengali font-bold mt-2 inline-flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> সম্মিলিত মেধা পারফরম্যান্স
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-500 shrink-0 shadow-inner">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Popular Exam */}
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-amber-500" />
          <div className="flex-1 min-w-0 pr-2">
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider font-bengali">সক্রিয় কুইজ ইভেন্ট</span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-2.5 font-bengali line-clamp-1 leading-snug">
              {popularExam === "N/A" ? "কোনোটি নয়" : popularExam}
            </h3>
            <span className="text-[11px] text-amber-500 font-bengali font-bold mt-2 inline-flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> সর্বোচ্চ অংশগ্রহণ কুইজ
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500 shrink-0 shadow-inner">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table Card Area */}
      <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md overflow-hidden">
        {/* Filter and Search Utilities */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/40 dark:bg-slate-900/10">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:max-w-2xl">
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                type="text" 
                placeholder="শিক্ষার্থীর নাম বা পরীক্ষা দিয়ে খুঁজুন..." 
                className="pl-10.5 font-bengali h-11 border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus-visible:ring-[#00B074]/30 focus-visible:border-[#00B074] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Exam Dropdown Filter */}
            {uniqueExams.length > 0 && (
              <select 
                className="flex h-11 w-full sm:w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-700 dark:text-slate-300 font-bengali focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:border-[#00B074]"
                value={selectedExamFilter}
                onChange={(e) => setSelectedExamFilter(e.target.value)}
              >
                <option value="all">সকল ইভেন্ট কুইজ</option>
                {uniqueExams.map((title) => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            )}
          </div>
          
          <div className="text-xs text-slate-500 font-bengali flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-500" /> 
            <span>মোট <strong className="text-slate-800 dark:text-white font-sans">{toBnNumber(filteredParticipants.length)}</strong> জনের ফলাফল প্রদর্শিত হচ্ছে</span>
          </div>
        </div>

        {/* Leaderboard Table Content */}
        <div className="w-full overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <div className="relative w-14 h-14 flex items-center justify-center mb-4">
                <RefreshCw className="w-12 h-12 text-[#00B074] animate-spin" />
                <Trophy className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="font-bengali text-base font-semibold text-slate-700 dark:text-slate-300">অংশগ্রহণকারীদের তথ্য লোড হচ্ছে...</p>
              <p className="text-xs text-slate-400 font-bengali mt-1">দয়া করে কিছুক্ষণ অপেক্ষা করুন</p>
            </div>
          ) : filteredParticipants.length > 0 ? (
            /* Responsive Wrapper (Desktop Table + Mobile Cards Layout) */
            <div className="relative">
              {/* Desktop view: Scrolls horizontally only if viewport size goes below 850px, but fits nicely otherwise */}
              <div className="hidden md:block overflow-x-auto w-full px-5 py-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                <table className="w-full min-w-[850px] text-left border-collapse table-auto rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      <th className="py-4 px-5 font-bengali text-sm font-bold text-center w-24">অবস্থান</th>
                      <th className="py-4 px-5 font-bengali text-sm font-bold w-64">শিক্ষার্থীর নাম ও তথ্য</th>
                      <th className="py-4 px-5 font-bengali text-sm font-bold">পরীক্ষা ও ইভেন্ট টাইটেল</th>
                      <th className="py-4 px-5 font-bengali text-sm font-bold text-center w-48">প্রাপ্ত স্কোর ও রেট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800 text-sm">
                    {filteredParticipants.map((participant, index) => {
                      const isWinnerSpinning = isSpinning && spinningIndex === index;
                      
                      // Premium rank badge design with beautiful gold, silver, bronze gradients
                      let rankElement;
                      if (index === 0) {
                        rankElement = (
                          <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 border border-amber-300 shadow-md">
                            <CrownIcon className="w-5 h-5 text-white absolute -top-2 left-1/2 -translate-x-1/2 drop-shadow-sm animate-bounce" />
                            <span className="font-sans font-black text-amber-950 text-base mt-0.5">{toBnNumber(1)}</span>
                          </div>
                        );
                      } else if (index === 1) {
                        rankElement = (
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 border border-slate-300 shadow-sm">
                            <span className="font-sans font-black text-slate-700 text-base">{toBnNumber(2)}</span>
                          </div>
                        );
                      } else if (index === 2) {
                        rankElement = (
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-300 via-amber-100 to-orange-400 border border-orange-300 shadow-sm">
                            <span className="font-sans font-black text-orange-850 text-base">{toBnNumber(3)}</span>
                          </div>
                        );
                      } else {
                        rankElement = (
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-sans font-bold text-sm">
                            {toBnNumber(index + 1)}
                          </div>
                        );
                      }

                      const percentage = participant.total > 0 ? Math.round((participant.score / participant.total) * 100) : 0;

                      return (
                        <tr 
                          key={participant.id} 
                          className={`hover:bg-[#00B074]/5 dark:hover:bg-slate-800/30 transition-all duration-200 ${isWinnerSpinning ? "bg-rose-500/10 dark:bg-rose-950/30 ring-2 ring-rose-500 rounded-lg animate-pulse" : ""}`}
                        >
                          {/* Position Cell */}
                          <td className="py-3.5 px-5 text-center align-middle">
                            <div className="flex justify-center">{rankElement}</div>
                          </td>
                          
                          {/* Student Name & Info Cell */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white bg-gradient-to-br ${getAvatarGradient(index)} shrink-0 shadow-sm border border-white dark:border-slate-800`}>
                                {getInitials(participant.studentName)}
                              </div>
                              <div className="min-w-0">
                                <div className="text-slate-900 dark:text-white font-extrabold font-bengali text-[15px] flex items-center gap-1.5 leading-snug">
                                  <span className="truncate">{participant.studentName}</span>
                                  {index < 3 && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />}
                                </div>
                                {participant.mobileNumber && (
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-bold mt-1 flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md w-fit">
                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {participant.mobileNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Exam Title Cell */}
                          <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 font-bengali font-semibold">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#00B074]/80 shrink-0 shadow-sm animate-pulse" />
                              <span className="line-clamp-2 max-w-[340px] leading-relaxed text-[13.5px]">{participant.examTitle}</span>
                            </div>
                          </td>

                          {/* Score Badge & Progress Cell */}
                          <td className="py-3.5 px-5 text-center align-middle">
                            <div className="inline-flex flex-col items-center justify-center gap-1 w-full">
                              <span className="bg-[#e6f7f1] dark:bg-[#00B074]/15 text-[#00b074] dark:text-[#00e295] border border-[#c2eedf]/80 dark:border-[#00B074]/20 px-3.5 py-1 rounded-full text-xs font-black font-sans shadow-sm tracking-wide">
                                {toBnNumber(participant.score)} / {toBnNumber(participant.total)}
                              </span>
                              
                              {/* success visual mini meter */}
                              <div className="flex flex-col items-center gap-0.5 w-28 mt-1.5">
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-emerald-400 to-[#00B074] h-full rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold">
                                  {toBnNumber(percentage)}% সাকসেস রেট
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card-List View: No Horizontal Scroll, Fits 100% Screen Width Perfectly */}
              <div className="md:hidden divide-y divide-slate-100/70 dark:divide-slate-800 px-4 py-3">
                {filteredParticipants.map((participant, index) => {
                  const isWinnerSpinning = isSpinning && spinningIndex === index;
                  const percentage = participant.total > 0 ? Math.round((participant.score / participant.total) * 100) : 0;
                  
                  let rankElement;
                  if (index === 0) {
                    rankElement = (
                      <div className="relative w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 border border-amber-300 shadow-md scale-95 shrink-0">
                        <CrownIcon className="w-4 h-4 text-white absolute -top-1.5 left-1/2 -translate-x-1/2 drop-shadow-sm animate-bounce" />
                        <span className="font-sans font-black text-amber-950 text-xs mt-0.5">{toBnNumber(1)}</span>
                      </div>
                    );
                  } else if (index === 1) {
                    rankElement = (
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 border border-slate-300 shadow-sm scale-95 shrink-0">
                        <span className="font-sans font-black text-slate-700 text-xs">{toBnNumber(2)}</span>
                      </div>
                    );
                  } else if (index === 2) {
                    rankElement = (
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-300 via-amber-100 to-orange-400 border border-orange-300 shadow-sm scale-95 shrink-0">
                        <span className="font-sans font-black text-orange-850 text-xs">{toBnNumber(3)}</span>
                      </div>
                    );
                  } else {
                    rankElement = (
                      <div className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-sans font-bold text-xs shrink-0">
                        {toBnNumber(index + 1)}
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={participant.id} 
                      className={`py-3.5 flex items-start gap-2 transition-all duration-200 ${isWinnerSpinning ? "bg-rose-500/10 dark:bg-rose-950/30 ring-2 ring-rose-500 rounded-lg animate-pulse px-2" : ""}`}
                    >
                      {/* Left Side: Rank */}
                      <div className="flex items-center justify-center pt-1 w-9 shrink-0">
                        {rankElement}
                      </div>

                      {/* Avatar */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-br ${getAvatarGradient(index)} shrink-0 shadow-sm border border-white dark:border-slate-800 self-start mt-1`}>
                        {getInitials(participant.studentName)}
                      </div>

                      {/* Middle & Right Content */}
                      <div className="flex-1 min-w-0 flex items-start justify-between gap-1.5 ml-1">
                        {/* Student Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-900 dark:text-white font-extrabold font-bengali text-sm truncate">
                              {participant.studentName}
                            </span>
                            {index < 3 && <Star className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />}
                          </div>
                          
                          {/* Exam Title */}
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bengali font-semibold mt-1 line-clamp-1">
                            {participant.examTitle}
                          </p>

                          {participant.mobileNumber && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold mt-1.5 flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded w-fit">
                              <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" /> {participant.mobileNumber}
                            </div>
                          )}
                        </div>

                        {/* Right Side Score / Marks */}
                        <div className="flex flex-col items-end shrink-0 text-right">
                          <span className="bg-[#e6f7f1] dark:bg-[#00B074]/15 text-[#00b074] dark:text-[#00e295] border border-[#c2eedf]/80 dark:border-[#00B074]/20 px-2 py-0.5 rounded-full text-[11px] font-black font-sans shadow-sm tracking-wide shrink-0">
                            {toBnNumber(participant.score)} / {toBnNumber(participant.total)}
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono font-bold mt-1.5 shrink-0">
                            {toBnNumber(percentage)}% সফলতা
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-300 mb-4 shadow-inner">
                <UserCheck className="w-10 h-10" />
              </div>
              <p className="font-bengali text-lg font-semibold text-slate-600 dark:text-slate-300">কোনো অংশগ্রহণকারী পাওয়া যায়নি!</p>
              <p className="text-sm text-slate-400 font-bengali mt-1">অন্য কোনো নাম বা পরীক্ষার নাম দিয়ে আবার খুঁজুন</p>
            </div>
          )}
        </div>

        {/* Motivational Bottom Banner */}
        <div className="bg-slate-50/50 dark:bg-[#051D3B]/5 p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="font-bengali text-slate-600 dark:text-slate-300 text-sm font-semibold leading-relaxed">
              নিয়মিত পড়াশোনা করুন, বিদ্যায়ন লিডারবোর্ডের শীর্ষে উঠে জয় করুন আকর্ষণীয় মেধা পুরস্কার! 🎉
            </p>
          </div>
          
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black font-bengali uppercase tracking-wider bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
            বিদ্যায়ন একাডেমি • শিক্ষা হোক আনন্দময়
          </div>
        </div>
      </div>

      {/* Lucky Winner Spinning Dialog Modal */}
      {showWinnerDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-br from-white via-white to-rose-50/50 dark:from-card dark:via-card dark:to-rose-950/10 rounded-3xl p-6 sm:p-8 w-full max-w-md text-center shadow-2xl relative border border-rose-100 dark:border-rose-950/20 animate-in zoom-in-95 duration-300 overflow-hidden">
            {/* Celebration background glow lights */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <button 
              onClick={() => setShowWinnerDialog(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3.5 py-1 rounded-full text-xs font-bold mb-4 font-bengali border border-rose-500/20">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" /> মেগা লাকি স্পিন ড্র
            </div>
            
            <h2 className="text-2xl font-bengali font-extrabold text-center text-rose-600 mb-6 flex items-center justify-center gap-2 drop-shadow-sm">
              🎉 অভিনন্দন! বিজয়ী নির্বাচিত! 🎉
            </h2>
            
            <div className="flex flex-col items-center justify-center relative">
              <div className="w-24 h-24 bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 rounded-full flex items-center justify-center mb-5 shadow-lg ring-8 ring-rose-500/15 animate-pulse relative z-10">
                <Gift className="w-12 h-12 text-white animate-bounce" />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-bengali mb-1 tracking-tight">{winner?.studentName}</h3>
              {winner?.mobileNumber && (
                <p className="text-lg text-rose-600 dark:text-rose-400 font-mono font-bold mb-4 flex items-center justify-center gap-1.5 bg-rose-500/5 px-3 py-1 rounded-full border border-rose-500/10">
                  <Phone className="w-4 h-4" /> {winner.mobileNumber}
                </p>
              )}
              
              <div className="grid grid-cols-2 gap-3 w-full mt-3">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-left">
                  <p className="text-[10px] text-slate-400 font-bengali mb-1 font-semibold">অংশগ্রহণ কুইজ</p>
                  <p className="font-bengali font-bold text-slate-800 dark:text-white text-xs line-clamp-2 leading-relaxed">{winner?.examTitle}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                  <p className="text-[10px] text-slate-400 font-bengali mb-1 font-semibold">প্রাপ্ত স্কোর</p>
                  <p className="font-black text-emerald-600 dark:text-emerald-400 text-base">{winner ? toBnNumber(winner.score) : '০'} / {winner ? toBnNumber(winner.total) : '০'}</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowWinnerDialog(false)}
              className="mt-6 w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bengali h-11 rounded-xl font-bold shadow-md cursor-pointer"
            >
              বন্ধ করুন
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple custom inline SVG Crowns for standard styling
function CrownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14a1 1 0 001-1v-1H4v1a1 1 0 001 1z" />
    </svg>
  );
}
