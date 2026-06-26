import React, { useState, useEffect, useRef } from 'react';
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
  ExternalLink,
  Play,
  Check
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
  const [selectedMobileFilter, setSelectedMobileFilter] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all');
  const [selectedMarkFilter, setSelectedMarkFilter] = useState('all');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<ExamParticipant | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [spinningIndex, setSpinningIndex] = useState<number | null>(null);
  const [printingPdf, setPrintingPdf] = useState(false);
  const [showSpinSetup, setShowSpinSetup] = useState(false);
  const [spinParticipants, setSpinParticipants] = useState<ExamParticipant[]>([]);
  const spinAudio = useRef<HTMLAudioElement | null>(null);
  const winAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    spinAudio.current = new Audio('https://actions.google.com/sounds/v1/foley/wheel_spin.ogg');
    winAudio.current = new Audio('https://actions.google.com/sounds/v1/human/applause_moderate.ogg');
    return () => {
      spinAudio.current?.pause();
      spinAudio.current = null;
      winAudio.current?.pause();
      winAudio.current = null;
    };
  }, []);

  useEffect(() => {
    if (!spinAudio.current) return;
    if (isSpinning) {
      spinAudio.current.loop = true;
      spinAudio.current.play().catch(e => console.error("Audio play failed:", e));
      if (winAudio.current) {
        winAudio.current.pause();
        winAudio.current.currentTime = 0;
      }
    } else {
      spinAudio.current.pause();
      spinAudio.current.currentTime = 0;
    }
  }, [isSpinning]);

  const [isFullScreenSpin, setIsFullScreenSpin] = useState(false);

  useEffect(() => {
    if (!isFullScreenSpin) {
      spinAudio.current?.pause();
      if (spinAudio.current) spinAudio.current.currentTime = 0;
      winAudio.current?.pause();
      if (winAudio.current) winAudio.current.currentTime = 0;
    }
  }, [isFullScreenSpin]);

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
        
        if (type === "event_exam") {
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
        
        const isMegaEvent = eventExamIds.has(examId) || eventExamIds.has(examId.toLowerCase());

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

  const openSpinSetup = () => {
    if (participants.length === 0) return;
    setSpinParticipants(filteredParticipants);
    setShowSpinSetup(true);
  };

  const startFullScreenSpin = () => {
    if (spinParticipants.length === 0) return;
    setShowSpinSetup(false);
    setIsFullScreenSpin(true);
    setIsSpinning(false);
    setWinner(null);
    setSpinningIndex(null);
  };

  const runLuckyDrawSpin = () => {
    if (spinParticipants.length === 0) return;
    setIsSpinning(true);
    setWinner(null);
    setSpinningIndex(null);
    if (winAudio.current) {
      winAudio.current.pause();
      winAudio.current.currentTime = 0;
    }

    let spins = 0;
    const maxSpins = 30; // 30 spins (about 3 seconds)
    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * spinParticipants.length);
      setSpinningIndex(randomIndex);
      setWinner(spinParticipants[randomIndex]);
      spins++;
      
      if (spins >= maxSpins) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        triggerConfetti();
        if (winAudio.current) {
          winAudio.current.play().catch(e => console.error("Win audio play failed:", e));
        }
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
        colors: ['#00B074', '#3b82f6', '#f43f5e', '#f59e0b'],
        zIndex: 999999
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#00B074', '#3b82f6', '#f43f5e', '#f59e0b'],
        zIndex: 999999
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleDownload = () => {
    if (filteredParticipants.length === 0) return;
    
    const BOM = "\uFEFF";
    let csvContent = BOM + "Rank (অবস্থান),Student Name (শিক্ষার্থীর নাম),Mobile Number (মোবাইল নম্বর),Exam Title (পরীক্ষার নাম),Score (প্রাপ্ত নম্বর),Total Questions (মোট প্রশ্ন),Percentage (শতকরা হার %)\n";
    
    filteredParticipants.forEach((p, index) => {
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

  const handlePrintPDF = async () => {
    // 1. Student selection logic
    const uniqueStudents = Array.from(new Set(participants.map(p => p.studentName))).sort();
    
    // Only show selection modal if no specific student is filtered
    let selectedStudents: string[] | null = selectedStudentFilter !== 'all' ? [selectedStudentFilter] : null;

    if (!selectedStudents) {
        const result = await new Promise<string[] | null>((resolve) => {
            const modal = document.createElement("div");
            modal.className = "fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4";
            
            const checkboxList = uniqueStudents.map(name => `
                <label class="flex items-center gap-3 p-3 text-left hover:bg-slate-50 cursor-pointer border-b border-slate-100">
                    <input type="checkbox" value="${name}" class="student-checkbox w-5 h-5 accent-[#00B074]" checked>
                    <span class="font-bengali text-slate-700">${name}</span>
                </label>
            `).join('');

            modal.innerHTML = `
                <div class="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl border border-slate-100 flex flex-col items-center justify-center gap-6">
                    <h3 class="text-xl font-bold text-slate-900 font-bengali">শিক্ষার্থী নির্বাচন করুন</h3>
                    
                    <div class="max-h-[50vh] overflow-y-auto w-full text-left p-2 border rounded-xl mb-4">
                        <label class="flex items-center gap-3 p-3 font-bold border-b-2 border-slate-200 cursor-pointer bg-slate-50">
                            <input type="checkbox" id="select-all" class="w-5 h-5 accent-[#00B074]" checked>
                            <span class="font-bengali text-slate-800">সকল শিক্ষার্থী</span>
                        </label>
                        ${checkboxList}
                    </div>

                    <div class="flex gap-3 w-full">
                        <button id="cancel-btn" class="flex-1 p-3 rounded-xl bg-slate-100 text-slate-700 font-bold">বাতিল</button>
                        <button id="confirm-btn" class="flex-1 p-3 rounded-xl bg-[#00B074] text-white font-bold">প্রিন্ট করুন</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Select All logic
            const selectAll = modal.querySelector("#select-all") as HTMLInputElement;
            const checkboxes = modal.querySelectorAll(".student-checkbox");
            selectAll.addEventListener("change", () => {
                checkboxes.forEach(cb => (cb as HTMLInputElement).checked = selectAll.checked);
            });
            checkboxes.forEach(cb => cb.addEventListener("change", () => {
                selectAll.checked = Array.from(checkboxes).every(c => (c as HTMLInputElement).checked);
            }));

            modal.querySelector("#cancel-btn")?.addEventListener("click", () => {
                modal.remove();
                resolve(null);
            });
            modal.querySelector("#confirm-btn")?.addEventListener("click", () => {
                if (selectAll.checked) {
                    modal.remove();
                    resolve(['all']);
                } else {
                    const selected = Array.from(checkboxes)
                        .filter(cb => (cb as HTMLInputElement).checked)
                        .map(cb => (cb as HTMLInputElement).value);
                    modal.remove();
                    resolve(selected.length > 0 ? selected : null);
                }
            });
        });

        if (!result) return;
        selectedStudents = result;
    }

    const participantsToPrint = selectedStudents.includes('all') 
        ? participants 
        : participants.filter(p => selectedStudents.includes(p.studentName || ''));

    if (participantsToPrint.length === 0 || printingPdf) return;
    setPrintingPdf(true);
    
    // Safeguard: Clean up any stale/duplicate nodes from previous runs
    const existingModal = document.getElementById("pdf-download-modal");
    if (existingModal) existingModal.remove();
    const existingPrintRoot = document.getElementById("biddayan-print-root");
    if (existingPrintRoot) existingPrintRoot.remove();
    
    // Capture the current scroll position and temporarily disable smooth scrolling
    const originalScrollY = window.scrollY;
    const originalScrollX = window.scrollX;
    const htmlEl = document.documentElement;
    const originalScrollBehavior = htmlEl.style.scrollBehavior;
    htmlEl.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);

    // Create a highly elegant full-screen progress modal overlay using Tailwind CSS
    const modal = document.createElement("div");
    modal.id = "pdf-download-modal";
    modal.className = "fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4";
    
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl border border-slate-100 flex flex-col items-center justify-center gap-6 transform transition-all duration-300 scale-100">
        <div class="w-16 h-16 rounded-2xl bg-[#00B074]/10 flex items-center justify-center text-[#00B074] animate-bounce">
          <svg class="w-8 h-8 text-[#00B074]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </div>
        <div>
          <h3 class="text-xl font-bold text-slate-900 font-bengali">পিডিএফ ডাউনলোড হচ্ছে...</h3>
          <p class="text-sm text-slate-500 mt-2 font-bengali leading-relaxed font-semibold">
            আপনার লিডারবোর্ড রিপোর্ট প্রসেস ও কম্পাইল করা হচ্ছে। অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন।
          </p>
        </div>
        
        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div class="bg-[#00B074] h-full w-1/3 rounded-full animate-infinite-loader"></div>
        </div>
        
        <div class="text-[11px] text-[#00B074] font-bold font-bengali">স্টাইলিশ পিডিএফ সংস্করণ জেনারেট হচ্ছে...</div>
      </div>
    `;

    // Define CSS rules for infinite loader animation
    const animStyle = document.createElement("style");
    animStyle.id = "leaderboard-loader-animation-style";
    animStyle.innerHTML = `
      @keyframes infinite-loader {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(300%); }
      }
      .animate-infinite-loader {
        animation: infinite-loader 1.4s infinite linear;
      }
    `;
    document.head.appendChild(animStyle);
    
    // Create print container with standard layout positioning (not absolute/fixed)
    // to allow proper multi-page breaking and prevent rendering clipping/blank spaces.
    const printContainer = document.createElement("div");
    printContainer.id = "biddayan-print-root";
    printContainer.style.position = "relative";
    printContainer.style.width = "100%";
    printContainer.style.maxWidth = "800px";
    printContainer.style.boxSizing = "border-box";
    printContainer.style.margin = "0 auto";
    printContainer.style.backgroundColor = "#ffffff";
    printContainer.style.color = "#0f172a";
    printContainer.style.fontFamily = "'Hind Siliguri', 'Noto Sans Bengali', sans-serif";
    printContainer.style.padding = "20px";
    printContainer.style.zIndex = "99999";
    printContainer.style.overflow = "visible";
    printContainer.style.display = "block";
    
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date().toLocaleDateString('bn-BD', options);
    const formattedTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    // Build the beautiful leaderboard rows as table rows
    const rowsHTML = participantsToPrint.map((p, index) => {
      const percentage = p.total > 0 ? Math.round((p.score / p.total) * 100) : 0;
      
      return `
        <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0; page-break-inside: avoid;">
          <td style="padding: 12px 10px; text-align: center; color: #475569; font-size: 14px;">${index + 1}</td>
          <td style="padding: 12px 10px; font-weight: 700; color: #0f172a; font-family: 'Hind Siliguri', sans-serif; font-size: 14px;">${p.studentName || 'অজ্ঞাত'}</td>
          <td style="padding: 12px 10px; text-align: center; color: #1e293b; font-family: monospace; font-size: 14px; font-weight: 600;">${p.score} / ${p.total}</td>
          <td style="padding: 12px 10px; text-align: center; font-weight: 800; color: #059669; font-family: monospace; font-size: 14px;">${percentage}%</td>
        </tr>
      `;
    }).join('');

    printContainer.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;700;800&display=swap');
        
        .bengali-title {
          font-family: 'Noto Sans Bengali', 'Hind Siliguri', sans-serif !important;
        }
        @page { size: A4 portrait; margin: 15mm; }
      </style>

      <div style="width: 100%; background: white; font-family: 'Hind Siliguri', 'Noto Sans Bengali', sans-serif; box-sizing: border-box;">
        
        <!-- Colorful Top Accent Bar -->
        <div style="height: 6px; background: linear-gradient(90deg, #00B074, #3b82f6); border-radius: 4px 4px 0 0; margin-bottom: 20px;"></div>

        <!-- Header -->
        <div style="text-align: center; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 class="bengali-title" style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 5px 0;">বিদ্যায়ন মেগা কুইজ ইভেন্ট-২০২৬</h1>
          <p style="font-size: 13px; color: #64748b; margin: 0;">${formattedDate} | ${formattedTime}</p>
        </div>

        <!-- Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background-color: #0f172a; color: white;">
              <th style="padding: 12px 10px; text-align: center; font-size: 13px; font-weight: 700; border: 1px solid #334155;">Rank</th>
              <th style="padding: 12px 10px; text-align: left; font-size: 13px; font-weight: 700; border: 1px solid #334155;">Student Name</th>
              <th style="padding: 12px 10px; text-align: center; font-size: 13px; font-weight: 700; border: 1px solid #334155;">Score</th>
              <th style="padding: 12px 10px; text-align: center; font-size: 13px; font-weight: 700; border: 1px solid #334155;">Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>

        <!-- Signatures and Verification -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 30px; page-break-inside: avoid; width: 100%;">
          <div style="text-align: left; width: 250px;">
            <div style="height: 55px; display: flex; align-items: flex-end; padding-bottom: 8px;">
              <span style="font-family: 'Caveat', cursive; font-size: 28px; color: #0f172a; font-weight: bold;">Rafsan Ahmed</span>
            </div>
            <div style="border-top: 2px solid #cbd5e1; margin-bottom: 8px;"></div>
            <p style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0;">রাফসান আহমেদ</p>
            <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">ইভেন্ট কো-অর্ডিনেটর</p>
          </div>
          
          <div style="text-align: right; max-width: 350px;">
            <p style="font-size: 13px; color: #475569; font-style: italic; margin: 0; line-height: 1.6; font-weight: 600;">
              "বিদ্যায়ন এর সাথে আপনার শিক্ষাজীবন হোক আরও গতিময়, প্রযুক্তিময় ও সাফল্যমণ্ডিত।"
            </p>
          </div>
        </div>
        
        <!-- Bottom Disclaimer -->
        <div style="text-align: center; font-size: 11px; color: #94a3b8; font-weight: 600;">
          © ${new Date().getFullYear()} বিদ্যায়ন। অফিসিয়াল রেকর্ড।
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    // Append at the very beginning of body to guarantee (0,0) offset inside layout flow
    document.body.insertBefore(printContainer, document.body.firstChild);

    const cleanup = () => {
      if (modal.parentNode) modal.parentNode.removeChild(modal);
      if (animStyle.parentNode) animStyle.parentNode.removeChild(animStyle);
      if (printContainer.parentNode) printContainer.parentNode.removeChild(printContainer);
      htmlEl.style.scrollBehavior = originalScrollBehavior;
      window.scrollTo(originalScrollX, originalScrollY);
      setPrintingPdf(false);
    };

    const runHtml2Pdf = () => {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `event_exam_leaderboard_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, // High resolution crisp text rendering
          useCORS: true, // Set to true to allow cross-origin images to load perfectly
          letterRendering: false, // CRITICAL: must be false to prevent broken/separated Bengali letters
          logging: false,
          windowWidth: 800, // Match the container width perfectly
          scrollY: 0,
          scrollX: 0
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          avoid: 'tr' // Make sure table rows don't split mid-line!
        }
      };

      const win = window as any;
      if (win.html2pdf) {
        win.html2pdf()
          .set(opt)
          .from(printContainer)
          .save()
          .then(() => {
            cleanup();
          })
          .catch((err: any) => {
            console.error("html2pdf failed: ", err);
            cleanup();
          });
      } else {
        window.print();
        cleanup();
      }
    };

    const win = window as any;
    if (win.html2pdf) {
      // Small timeout to allow the browser layout engine to fully paint the element
      setTimeout(() => {
        runHtml2Pdf();
      }, 350);
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => {
        setTimeout(() => {
          runHtml2Pdf();
        }, 350);
      };
      script.onerror = () => {
        window.print();
        cleanup();
      };
      document.head.appendChild(script);
    }
  };

  // Filter and search calculations
  const rawFilteredParticipants = participants.filter(p => {
    const matchesSearch = p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.examTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExamFilter = selectedExamFilter === 'all' || p.examTitle === selectedExamFilter;
    const matchesMobileFilter = !selectedMobileFilter || (p.mobileNumber || '').includes(selectedMobileFilter);
    const matchesMarkFilter = selectedMarkFilter === 'all' || p.score.toString() === selectedMarkFilter;
    const matchesStudentFilter = selectedStudentFilter === 'all' || p.studentName === selectedStudentFilter;
    return matchesSearch && matchesExamFilter && matchesMobileFilter && matchesMarkFilter && matchesStudentFilter;
  });

  // Keep all participants to show everyone's data on the leaderboard
  const filteredParticipants: ExamParticipant[] = rawFilteredParticipants;

  // Unique exams list for dropdown filter
  const uniqueExams = Array.from(new Set(participants.map(p => p.examTitle)));

  // Unique students list for dropdown filter
  const uniqueStudents = Array.from(new Set(participants.map(p => p.studentName))).sort();

  // Unique marks list for dropdown filter
  const uniqueMarks = Array.from(new Set(participants.map(p => p.score))).sort((a, b) => b - a);

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
              disabled={filteredParticipants.length === 0 || printingPdf}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bengali shadow-md border border-indigo-500/30 h-11 px-4.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" /> {printingPdf ? "প্রিন্ট হচ্ছে..." : "PDF প্রিন্ট"}
            </Button>
            <Button 
              onClick={openSpinSetup} 
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
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50/40 dark:bg-slate-900/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                type="text" 
                placeholder="নাম বা কুইজ দিয়ে খুঁজুন..." 
                className="pl-10.5 font-bengali h-11 border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus-visible:ring-[#00B074]/30 focus-visible:border-[#00B074] transition-all w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Student Dropdown Filter */}
            <select 
              className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-700 dark:text-slate-300 font-bengali focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:border-[#00B074]"
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
            >
              <option value="all">সকল শিক্ষার্থী</option>
              {uniqueStudents.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            
            {/* Exam Dropdown Filter */}
            {uniqueExams.length > 0 && (
              <select 
                className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-700 dark:text-slate-300 font-bengali focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:border-[#00B074]"
                value={selectedExamFilter}
                onChange={(e) => setSelectedExamFilter(e.target.value)}
              >
                <option value="all">সকল ইভেন্ট কুইজ</option>
                {uniqueExams.map((title) => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            )}

            {/* Mobile Filter Input */}
            <div className="relative w-full">
              <Phone className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                type="text" 
                placeholder="মোবাইল নম্বর দিয়ে খুঁজুন..." 
                className="pl-10.5 font-bengali h-11 border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus-visible:ring-[#00B074]/30 focus-visible:border-[#00B074] transition-all w-full"
                value={selectedMobileFilter}
                onChange={(e) => setSelectedMobileFilter(e.target.value)}
              />
            </div>

            {/* Marks Filter Dropdown */}
            <select 
              className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-700 dark:text-slate-300 font-bengali focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:border-[#00B074]"
              value={selectedMarkFilter}
              onChange={(e) => setSelectedMarkFilter(e.target.value)}
            >
              <option value="all">সকল প্রাপ্ত মার্ক</option>
              {uniqueMarks.map((mark) => (
                <option key={mark} value={mark}>{mark} মার্ক</option>
              ))}
            </select>
          </div>
          
          <div className="text-xs text-slate-500 font-bengali flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-3 py-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-500" /> 
            <span>মোট <strong className="text-slate-800 dark:text-white font-sans">{toBnNumber(filteredParticipants.length)}</strong> জনের ফলাফল</span>
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
                      // Premium rank badge design with beautiful gold, silver, bronze gradients
                      const rankElement = (
                        <div className="w-8 h-8 flex mx-auto items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-sans font-bold text-sm">
                          {toBnNumber(index + 1)}
                        </div>
                      );

                      const percentage = participant.total > 0 ? Math.round((participant.score / participant.total) * 100) : 0;

                      return (
                        <tr 
                          key={participant.id} 
                          className="hover:bg-[#00B074]/5 dark:hover:bg-slate-800/30 transition-all duration-200"
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
                  const percentage = participant.total > 0 ? Math.round((participant.score / participant.total) * 100) : 0;
                  
                  const rankElement = (
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-sans font-bold text-xs shrink-0">
                      {toBnNumber(index + 1)}
                    </div>
                  );

                  return (
                    <div 
                      key={participant.id} 
                      className="py-3.5 flex items-start gap-2 transition-all duration-200"
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
            বিদ্যায়ন • শিক্ষা হোক আনন্দময়
          </div>
        </div>
      </div>

      {/* Lucky Spin Setup Modal */}
      {showSpinSetup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative border border-slate-200/50 dark:border-slate-800 animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <div>
                <h3 className="text-2xl font-black font-bengali text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  লাকি ড্র স্পিন
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-bengali ml-13">
                  অংশগ্রহণকারী নির্বাচন করুন (মোট {spinParticipants.length} জন)
                </p>
              </div>
              <button 
                onClick={() => setShowSpinSetup(false)} 
                className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors self-start"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-6 custom-scrollbar">
              {filteredParticipants.map(p => {
                const isSelected = spinParticipants.some(sp => sp.id === p.id);
                return (
                  <div 
                    key={p.id} 
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${
                      isSelected 
                        ? 'bg-emerald-50/50 border-emerald-500/30 dark:bg-emerald-500/10 dark:border-emerald-500/30 shadow-sm' 
                        : 'bg-white border-slate-100 hover:border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 dark:hover:border-slate-600'
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        setSpinParticipants(prev => prev.filter(sp => sp.id !== p.id));
                      } else {
                        setSpinParticipants(prev => [...prev, p]);
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-100 text-transparent border border-slate-300 dark:bg-slate-800 dark:border-slate-600 group-hover:border-emerald-400'
                      }`}>
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white text-base font-bengali tracking-wide">{p.studentName || 'অজ্ঞাত'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {p.mobileNumber || '---'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={() => setSpinParticipants(filteredParticipants)} 
                  className="flex-1 sm:flex-none font-bengali h-12 px-5 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  সবাইকে নির্বাচন
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSpinParticipants([])} 
                  className="flex-1 sm:flex-none font-bengali h-12 px-5 rounded-xl border-rose-200 hover:bg-rose-50 text-rose-600 dark:border-rose-900 dark:hover:bg-rose-950/30 dark:text-rose-400"
                >
                  সব বাতিল
                </Button>
              </div>
              <Button 
                onClick={startFullScreenSpin}
                disabled={spinParticipants.length === 0}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bengali font-bold h-12 px-8 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Play className="w-5 h-5 mr-2 fill-current" /> স্পিন শুরু করুন
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Spin Overlay */}
      {isFullScreenSpin && (
        <div className="fixed inset-0 z-[99999] bg-slate-950 flex flex-col items-center p-6 overflow-hidden">
          
          {/* Animated Background Gradients - Extremely Vibrant */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] rounded-full blur-[250px] transition-all duration-1000 ${isSpinning ? 'bg-indigo-600/30 scale-150 rotate-45' : 'bg-indigo-900/10 scale-100'}`} />
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] rounded-full blur-[200px] transition-all duration-1000 delay-200 ${isSpinning ? 'bg-emerald-600/30 scale-125 -rotate-45' : 'bg-emerald-900/10 scale-100'}`} />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          </div>

          {/* Close Button at Top Right */}
          {!isSpinning && (
            <button 
              onClick={() => setIsFullScreenSpin(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full transition-all z-50 backdrop-blur-md shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
          )}

          {/* Spin Rings decoration - Visible when Spinning or showing winner */}
          {(isSpinning || winner) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
              {/* Pulsing deep glow behind */}
              <div className="absolute w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-indigo-500/10 blur-[130px] animate-pulse"></div>
              
              {/* Concentric rings with rotating active ring */}
              <div className={`relative w-[85vw] h-[85vw] max-w-[750px] max-h-[750px] rounded-full border border-white/5 flex items-center justify-center ${isSpinning ? 'animate-spin' : ''}`} style={{ animationDuration: '25s' }}>
                <div className="absolute inset-[10%] rounded-full border border-white/5"></div>
                <div className="absolute inset-[25%] rounded-full border border-white/10"></div>
                <div className="absolute inset-[40%] rounded-full border border-white/10"></div>
                <div className="absolute inset-[55%] rounded-full border border-white/20"></div>
                
                {/* Thin technical grid crosshairs */}
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-white/0 via-white/10 to-white/0"></div>
                <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-gradient-to-r from-white/0 via-white/10 to-white/0"></div>
              </div>
            </div>
          )}

          {/* CONTENT AREA */}
          <div className="z-10 flex flex-col items-center justify-between w-full max-w-4xl h-full py-8">
            
            {/* STATE 1 & 2: ACTIVE SPINNING OR SHOWING WINNER */}
            {(isSpinning || winner) ? (
              <div className="flex-1 flex flex-col items-center justify-center w-full relative">
                {/* Winner / Spinning Avatar & Crown */}
                <div className="relative mb-8 z-10">
                  <div className={`absolute inset-0 bg-amber-400 blur-3xl rounded-full transition-all duration-500 ${isSpinning ? 'opacity-30 scale-110 animate-pulse' : 'opacity-40 scale-125'}`}></div>
                  <div className={`w-28 h-28 md:w-36 md:h-36 bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(251,191,36,0.6)] border-4 border-white/30 relative z-10 transition-transform ${isSpinning ? 'scale-110 animate-bounce' : 'animate-in zoom-in-50 duration-700'}`}>
                    <CrownIcon className="w-14 h-14 md:w-18 md:h-18 text-amber-950 drop-shadow-md" />
                  </div>
                </div>

                {/* Status Subtitle at the Top */}
                <div className="text-lg md:text-2xl font-bengali font-black tracking-widest z-10 flex items-center gap-2.5 mb-2 h-10">
                  {isSpinning ? (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 flex items-center gap-2 animate-pulse">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      লাকি ড্র ঘুরছে... 🎡
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-2.5 animate-in fade-in duration-500">
                      <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
                      লাকি ড্র বিজয়ী
                      <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
                    </span>
                  )}
                </div>

                {/* Student Name */}
                <div className="w-full text-center px-4 z-10 min-h-[140px] flex items-center justify-center mb-8">
                  <div className={`text-5xl sm:text-7xl md:text-8xl font-black text-white font-bengali tracking-tight leading-none py-2 drop-shadow-[0_0_35px_rgba(255,255,255,0.4)] ${isSpinning ? 'animate-pulse scale-95 opacity-90' : 'animate-in slide-in-from-bottom-8 duration-700 text-transparent bg-clip-text bg-gradient-to-br from-white via-yellow-100 to-white/85'}`}>
                    {winner ? winner.studentName : 'অজ্ঞাত'}
                  </div>
                </div>

                {/* Stats Bar (Only when not spinning) */}
                {!isSpinning && winner && (
                  <div className="flex gap-6 md:gap-12 text-center items-center justify-center bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-6 md:px-10 py-5 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 fill-mode-both max-w-xl w-full z-10 shadow-2xl shadow-black/30">
                    <div className="flex-1 flex flex-col items-center">
                      <p className="text-[10px] md:text-xs text-white/40 font-bengali mb-1 tracking-widest uppercase">অংশগ্রহণ কুইজ</p>
                      <p className="text-xs md:text-sm font-semibold text-white/90 truncate max-w-[180px]">{winner.examTitle}</p>
                    </div>
                    <div className="w-[1px] h-8 bg-white/15"></div>
                    <div className="flex-1 flex flex-col items-center">
                      <p className="text-[10px] md:text-xs text-white/40 font-bengali mb-1 tracking-widest uppercase">প্রাপ্ত স্কোর</p>
                      <p className="text-sm md:text-base font-black text-white">{toBnNumber(winner.score)} <span className="text-white/30 font-normal">/</span> {toBnNumber(winner.total)}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons (Only when not spinning) */}
                {!isSpinning && winner && (
                  <div className="mt-8 flex gap-4 animate-in fade-in duration-500 delay-500 fill-mode-both z-10">
                    <button
                      onClick={() => {
                        setWinner(null);
                        if (winAudio.current) {
                          winAudio.current.pause();
                          winAudio.current.currentTime = 0;
                        }
                      }}
                      className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-bengali font-bold text-sm md:text-base transition-all hover:scale-105 active:scale-95"
                    >
                      তালিকায় ফিরুন
                    </button>
                    <button
                      onClick={runLuckyDrawSpin}
                      className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-xl text-slate-900 font-bengali font-black text-sm md:text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20 flex items-center gap-2 group"
                    >
                      <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> আবার ড্র করুন
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* STATE 3: PRE-SPIN CANDIDATE LIST */
              <div className="flex-1 flex flex-col items-center justify-between w-full h-full">
                {/* Header */}
                <div className="text-center mb-6 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 font-bengali tracking-wide drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                    লাকি ড্র প্রতিযোগীদের তালিকা
                  </h2>
                  <p className="text-slate-400 font-bengali text-sm md:text-base mt-2 font-medium">
                    মোট {spinParticipants.length} জন প্রতিযোগী পরবর্তী ড্র এর জন্য প্রস্তুত আছেন
                  </p>
                </div>

                {/* Grid list of participants: Beautiful, white, 4-corner rounded cards, 2 columns */}
                <div className="flex-1 w-full max-w-3xl overflow-y-auto px-4 py-2 my-4 max-h-[55vh] custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {spinParticipants.map((p, i) => (
                      <div 
                        key={i} 
                        className="bg-white hover:bg-slate-50 transition-all p-5 rounded-2xl flex items-center justify-between shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border border-slate-100 hover:border-amber-400/50 hover:scale-[1.02] duration-300 animate-in fade-in zoom-in-95 duration-500"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse"></div>
                          <span className="font-bengali font-black text-slate-800 text-base md:text-lg tracking-wide">{p.studentName}</span>
                        </div>
                        <span className="font-mono text-xs md:text-sm bg-gradient-to-r from-indigo-50 to-indigo-100 px-3 py-1.5 rounded-xl text-indigo-700 font-black border border-indigo-200/30">
                          {p.score} / {p.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Big Beautiful Glowy Spin Button */}
                <div className="mt-4 mb-2 animate-in slide-in-from-bottom-4 duration-500">
                  <button
                    onClick={runLuckyDrawSpin}
                    className="relative group overflow-hidden px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-900 font-bengali font-black text-lg md:text-2xl shadow-[0_0_40px_rgba(251,191,36,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_60px_rgba(251,191,36,0.5)] border-2 border-white/20 flex items-center gap-3"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    লাকি ড্র স্পিন করুন 🎡
                  </button>
                </div>
              </div>
            )}

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
