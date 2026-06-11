import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Lightbulb,
  Brain,
  BrainCircuit,
  Target,
  CheckCircle2,
  Check,
  Trophy,
  BookOpen,
  MessageCircleQuestion,
  ChevronRight,
  Home,
  Bookmark,
  ClipboardList,
  RefreshCw,
  SearchCheck,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";

export default function Dashboard() {
  const { userData } = useAuth();
  const [publicExams, setPublicExams] = useState<any[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase");
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setGlobalSettings(docSnap.data());
        }
      } catch (error) { console.error("ERR settings", error); }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    async function fetchPublicExams() {
      try {
        const { collection, getDocs, limit, query, orderBy, where } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase");
        const q = query(collection(db, "public_exams"), where("active", "==", true), orderBy("createdAt", "desc"), limit(40));
        const snap = await getDocs(q);
        setPublicExams(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) { console.error("ERR", error); }
    }
    fetchPublicExams();
  }, []);

  const userClass = userData?.class || "";
  const eligibleExams = publicExams.filter((exam) => {
    if (!exam.targetClass || exam.targetClass === "সকল ক্লাস") {
      return true;
    }
    return exam.targetClass === userClass;
  });

  const liveExams = eligibleExams.filter((exam) => exam.type === "live_model_test" || !exam.type);

  return (
    <div className="w-full flex flex-col gap-6 pb-32 font-sans md:px-0">
      
      {/* Hero Banner Section */}
      {globalSettings && globalSettings.heroBanners && globalSettings.heroBanners.length > 0 ? (
        <div className="relative w-full">
           <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-2 flex-nowrap" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
             {globalSettings.heroBanners.map((banner: any, index: number) => (
                <div 
                  key={banner.id || index} 
                  className={`shrink-0 w-full min-w-[full] snap-center bg-gradient-to-r ${banner.gradient || 'from-[#1e293b] to-[#0f172a]'} rounded-[24px] p-6 text-white relative overflow-hidden shadow-sm flex flex-col justify-center min-h-[180px]`}
                >
                  <div className="absolute top-4 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                  <div className="absolute top-2 left-6 text-white/5 text-4xl transform -rotate-12 italic">✧</div>
                  
                  <div className="relative z-10 w-[60%] sm:w-[70%]">
                    <h2 className="text-xl sm:text-2xl font-bold font-bengali mb-2 drop-shadow-sm leading-tight text-white">
                      {banner.title}
                    </h2>
                    <p className="text-sm font-bengali text-white/80 drop-shadow-sm leading-relaxed">
                      {banner.subtitle}
                    </p>
                  </div>

                  {/* Illustration Right - Books / SVG */}
                  <div className="absolute right-[-20px] sm:right-[5%] bottom-[-20px] sm:bottom-0 w-[180px] sm:w-[220px] h-[160px] flex flex-col justify-end pointer-events-none opacity-95">
                    <svg viewBox="0 0 200 150" fill="none" className="w-full h-full drop-shadow-xl translate-y-3" preserveAspectRatio="xMidYMax meet">
                      {/* Background Doodles */}
                      <path d="M20 20 C 30 10, 40 30, 50 20" stroke="white" strokeOpacity="0.1" strokeWidth="2" fill="none" />
                      <path d="M160 30 L 170 20 L 180 40 Z" fill="white" fillOpacity="0.05" />
                      
                      <rect x="70" y="110" width="80" height="15" rx="2" fill="#3B82F6"/>
                      <path d="M70 125v-15l80 0v15H70z" fill="#000" fillOpacity="0.2"/>
                      <path d="M150 110l-80 0v2h80v-2z" fill="#fff" fillOpacity="0.6"/>

                      <rect x="75" y="94" width="70" height="16" rx="2" fill="#FBBF24"/>
                      <path d="M75 110v-16l70 0v16H75z" fill="#000" fillOpacity="0.1"/>
                      <path d="M145 94l-70 0v2h70v-2z" fill="#fff" fillOpacity="0.6"/>

                      <rect x="72" y="78" width="76" height="16" rx="2" fill="#6366F1"/>
                      <path d="M72 94v-16l76 0v16H72z" fill="#000" fillOpacity="0.2"/>
                      <path d="M148 78l-76 0v2h76v-2z" fill="#fff" fillOpacity="0.6"/>

                      {/* Small pencil holder */}
                      <path d="M40 90 L50 125 H65 L75 90 Z" fill="#F59E0B" />
                      <rect x="45" y="60" width="4" height="30" fill="#B45309" transform="rotate(-15 45 60)" />
                      <path d="M41 55 L45 60 L49 55 L45 50 Z" fill="#EF4444" transform="rotate(-15 45 60)" />

                      <rect x="55" y="65" width="4" height="25" fill="#4B5563" transform="rotate(5 55 65)" />
                      <path d="M53 60 L57 65 L61 60 L57 55 Z" fill="#F472B6" transform="rotate(5 55 65)" />

                      {/* Plant */}
                      <path d="M165 105 Q 160 85 155 90 Q 160 75 170 85 Q 180 75 185 90 Q 180 85 175 105 Z" fill="#10B981" />
                      <path d="M175 105 Q 185 90 195 95 Q 190 75 180 85 Q 170 80 170 100 Z" fill="#059669" />
                      <rect x="160" y="105" width="20" height="20" rx="3" fill="#F8FAFC"/>
                      <rect x="156" y="100" width="28" height="6" rx="2" fill="#E2E8F0"/>

                      {/* Graduation Cap */}
                      <path d="M110 40 L60 55 L110 70 L160 55 Z" fill="#1E293B"/>
                      <path d="M85 64 V 75 C 85 85 135 85 135 75 V 64 Z" fill="#1E293B"/>
                      <rect x="155" y="55" width="2" height="15" fill="#FBBF24" />
                      <path d="M153 70 h6 l-3 10 z" fill="#FBBF24" />
                      {/* Tassel cord */}
                      <path d="M110 55 Q 140 50 156 55" fill="none" stroke="#FBBF24" strokeWidth="2" />
                      <circle cx="110" cy="55" r="4" fill="#1E293B" />
                    </svg>
                  </div>
                </div>
             ))}
           </div>
           {/* Dots indication if more than 1 banner */}
           {globalSettings.heroBanners.length > 1 && (
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
               {globalSettings.heroBanners.map((_: any, idx: number) => (
                 <div key={idx} className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
               ))}
             </div>
           )}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#637cf2] to-[#768bfa] rounded-[24px] p-6 text-white relative overflow-hidden shadow-lg shadow-blue-500/10 mt-2 min-h-[160px]">
          <div className="absolute top-4 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-8 right-8 text-white/30 text-2xl font-sans">✧</div>
          
          <div className="z-10 relative">
            <h2 className="text-[22px] font-bold font-bengali mb-1 drop-shadow-sm flex items-center gap-2">
              চর্চাই সফলতার চাবিকাঠি!
            </h2>
            <p className="text-sm font-bengali text-white/90 mb-6 drop-shadow-sm">আজকের লক্ষ্য পূরণ করো, নিজেকে আরও এক ধাপ এগিয়ে নাও!</p>
          </div>
          
          <div className="absolute right-[-10%] sm:right-[5%] bottom-[-20%] sm:bottom-0 w-[180px] sm:w-[220px] h-full flex flex-col justify-end pointer-events-none opacity-95 pb-2">
             <div className="w-32 h-32 ml-auto shrink-0 drop-shadow-xl relative transform scale-[1.1] origin-bottom-right">
                <div className="absolute bottom-4 right-1 bg-gradient-to-r from-orange-400 to-orange-500 w-24 h-5 rounded-xl transition-all shadow-md">
                   <div className="absolute left-0 w-2 h-full bg-orange-300 rounded-l-xl"></div>
                   <div className="absolute inset-x-2 bottom-1 h-3 bg-white/90"></div>
                </div>
                <div className="absolute bottom-9 right-1 bg-gradient-to-r from-blue-600 to-blue-700 w-24 h-5 rounded-xl transition-all shadow-md">
                   <div className="absolute left-0 w-2 h-full bg-blue-400 rounded-l-xl"></div>
                   <div className="absolute inset-x-2 bottom-1 h-3 bg-white/90"></div>
                </div>
                <div className="absolute bottom-16 right-0 text-[#0F2744] drop-shadow-2xl z-20">
                   <div className="w-28 h-8 rounded-[50%] bg-[#21436e] absolute -bottom-3 -right-2 rotate-[-5deg]"></div>
                   <div className="w-24 h-8 bg-[#183459] rounded-b-xl absolute bottom-0 right-0"></div>
                   <div className="w-[110px] h-[36px] bg-[#1a3861] transform -skew-x-[45deg] absolute -bottom-1 -right-4 shadow-[0_4px_10px_rgba(0,0,0,0.3)]"></div>
                   <div className="w-28 h-28 transform rotate-[45deg] bg-gradient-to-br from-[#2a5084] to-[#142c4b] absolute bottom-0 -right-[40px] rounded-[10px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]">
                      <div className="absolute inset-[2px] border border-white/10 rounded-[8px]"></div>
                   </div>
                   <div className="w-1 h-12 bg-amber-400 absolute -bottom-4 right-[65px] rounded-full z-30 shadow-md"></div>
                   <div className="w-4 h-6 border-[3px] border-amber-400 border-l-0 rounded-r-md absolute -bottom-8 right-[62px] z-30"></div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Features Grid ("এক নজরে সব ফিচার") */}
      <section className="space-y-4">
        <h3 className="font-bengali text-[17px] font-bold text-[#0F2744]">এক নজরে সব ফিচার</h3>
        
        <div className="flex flex-col gap-4">
          {/* Row 1: 4 columns */}
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            
            <Link to="/exam?type=mock" className="group">
              <div className="bg-white border border-fuchsia-100 rounded-[20px] p-3 pb-4 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-fuchsia-200 hover:-translate-y-1 h-full shadow-xs">
                <div className="relative w-[48px] h-[48px] flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                  <div className="absolute inset-0 bg-[#C026D3] rounded-[16px] shadow-[0_6px_12px_rgba(192,38,211,0.3)] border-b-[4px] border-[#86198F]"></div>
                  
                  <div className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-white/30 rounded-full border border-white/40"></div>
                  
                  <div className="relative w-[28px] h-[30px] bg-white rounded-[8px] shadow-sm flex flex-col justify-center pl-[5px] gap-[5px]">
                     {/* Row 1 */}
                     <div className="flex items-center gap-[4px]">
                        <div className="w-[7px] h-[7px] rounded-full border-[1.5px] border-[#E879F9]"></div>
                        <div className="w-[10px] h-[3px] rounded-full bg-[#E879F9]"></div>
                     </div>
                     {/* Row 2 */}
                     <div className="flex items-center gap-[4px]">
                        <div className="relative w-[7px] h-[7px] rounded-full border-[1.5px] border-[#C026D3] flex items-center justify-center">
                           <div className="w-[2.5px] h-[2.5px] rounded-full bg-[#C026D3]"></div>
                        </div>
                        <div className="w-[10px] h-[3px] rounded-full bg-[#E879F9]"></div>
                     </div>
                  </div>
                </div>
                <h4 className="font-bengali text-xs sm:text-sm font-bold text-fuchsia-600 mb-1 leading-tight">মক<br/>টেস্ট</h4>
                <p className="font-bengali text-[10px] sm:text-[11px] text-slate-400 leading-tight flex-1">অধ্যায়ভিত্তিক মক টেস্ট দিন</p>
              </div>
            </Link>

            <Link to="/exam?type=model" className="group">
              <div className="bg-white border border-orange-100 rounded-[20px] p-3 pb-4 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-orange-200 hover:-translate-y-1 h-full shadow-xs">
                <div className="relative w-[48px] h-[48px] flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                  <div className="absolute inset-0 bg-[#F97316] rounded-[16px] shadow-[0_6px_12px_rgba(249,115,22,0.3)] border-b-[4px] border-[#C2410C]"></div>
                  
                  <div className="relative w-[30px] h-[32px] bg-white rounded-[8px] shadow-sm flex flex-col pt-[6px] pl-[6px] gap-[4px] -ml-[2px] -mt-[2px]">
                     <div className="flex items-center gap-[4px]">
                        <div className="w-[6px] h-[6px] rounded-full bg-[#F97316]"></div>
                        <div className="w-[10px] h-[3px] rounded-full bg-[#D5E1ED]"></div>
                     </div>
                     <div className="flex items-center pl-[10px]">
                        <div className="w-[10px] h-[3px] rounded-full bg-[#D5E1ED]"></div>
                     </div>
                     <div className="flex items-center pl-[10px]">
                        <div className="w-[7px] h-[3px] rounded-full bg-[#D5E1ED]"></div>
                     </div>
                  </div>

                  <div className="absolute -bottom-1 -right-1.5 w-[22px] h-[22px] bg-[#F97316] rounded-full border-[2.5px] border-white flex items-center justify-center shadow-sm">
                    <Check className="w-[14px] h-[14px] text-white" strokeWidth={3.5} />
                  </div>
                </div>
                <h4 className="font-bengali text-xs sm:text-sm font-bold text-orange-600 mb-1 leading-tight">মডেল<br/>টেস্ট</h4>
                <p className="font-bengali text-[10px] sm:text-[11px] text-slate-400 leading-tight">মডেল টেস্ট দিয়ে প্রস্তুতি যাচাই</p>
              </div>
            </Link>

            <Link to="/doubts" className="group">
              <div className="bg-white border border-sky-100 rounded-[20px] p-3 pb-4 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-sky-200 hover:-translate-y-1 h-full shadow-xs">
                <div className="relative w-[48px] h-[48px] flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                  <div className="absolute inset-0 bg-[#0EA5E9] rounded-[16px] shadow-[0_6px_12px_rgba(14,165,233,0.3)] border-b-[4px] border-[#0284C7]"></div>
                  
                  <div className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-white/30 rounded-full border border-white/40"></div>
                  
                  <div className="relative w-[28px] h-[28px] bg-white rounded-[8px] shadow-sm flex items-center justify-center -mt-[2px]">
                     <Brain className="w-[18px] h-[18px] text-[#0EA5E9]" strokeWidth={2.5} />
                  </div>

                  <div className="absolute -bottom-1 -right-1.5 w-[22px] h-[22px] bg-[#0EA5E9] rounded-full border-[2.5px] border-white flex items-center justify-center shadow-sm">
                    <MessageCircleQuestion className="w-[14px] h-[14px] text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <h4 className="font-bengali text-xs sm:text-sm font-bold text-sky-600 mb-1 leading-tight">ডাউট<br/>সলভিং</h4>
                <p className="font-bengali text-[10px] sm:text-[11px] text-slate-400 leading-tight block">যেকোনো প্রশ্নের উত্তর জানুন<br/>এবং আলোচনা করুন</p>
              </div>
            </Link>

            <Link to="/exam?type=mistakes" className="group">
              <div className="bg-white border border-pink-100 rounded-[20px] p-3 pb-4 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-pink-200 hover:-translate-y-1 h-full shadow-xs">
                <div className="relative w-[48px] h-[48px] flex items-center justify-center group-hover:scale-105 transition-transform mb-3">
                  <div className="absolute inset-0 bg-[#F43F5E] rounded-[16px] shadow-[0_6px_12px_rgba(244,63,94,0.3)] border-b-[4px] border-[#BE123C]"></div>
                  
                  <div className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-white/30 rounded-full border border-white/40"></div>
                  
                  <div className="relative w-[28px] h-[28px] bg-white rounded-[8px] shadow-sm flex items-center justify-center -mt-[2px]">
                     <div className="w-[18px] h-[18px] bg-[#6484A4] rounded-[5px] flex items-center justify-center">
                        <svg className="w-[11px] h-[11px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 2L3 6l4 4"/>
                          <path d="M21 11v-1a4 4 0 0 0-4-4H3"/>
                          <path d="M17 22l4-4-4-4"/>
                          <path d="M3 13v1a4 4 0 0 0 4 4h14"/>
                        </svg>
                     </div>
                  </div>
                </div>
                <h4 className="font-bengali text-xs sm:text-sm font-bold text-rose-600 mb-1 leading-tight">ভুলের<br/>প্র্যাকটিস</h4>
                <p className="font-bengali text-[10px] sm:text-[11px] text-slate-400 leading-tight">ভুল হওয়া প্রশ্নগুলোর পুনরাবৃত্তি</p>
              </div>
            </Link>

          </div>

          {/* Row 2: 3 columns */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            
            <Link to="/notes" className="group">
              <div className="bg-white border border-emerald-100 rounded-[20px] p-4 pb-4 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-emerald-200 hover:-translate-y-1 h-full shadow-xs">
                <div className="relative w-[56px] h-[56px] flex items-center justify-center group-hover:scale-105 transition-transform mb-4">
                  <div className="absolute inset-0 bg-[#319936] rounded-[18px] shadow-[0_8px_16px_rgba(49,153,54,0.3)] border-b-[5px] border-[#1C6B1C]"></div>
                  
                  {/* White Book Pages */}
                  <div className="relative w-[34px] h-[38px] bg-white rounded-[10px] shadow-sm overflow-hidden flex items-center justify-center -mt-0.5">
                    {/* Center divider */}
                    <div className="absolute top-1.5 bottom-1.5 left-1/2 w-[1.5px] bg-[#E0EBE0] -translate-x-1/2"></div>
                    
                    {/* Left page lines */}
                    <div className="absolute left-0 w-[17px] flex flex-col items-center top-[10px] space-y-[5px]">
                      <div className="w-[8px] h-[2px] bg-[#A4D5A6] rounded-full"></div>
                      <div className="w-[8px] h-[2px] bg-[#A4D5A6] rounded-full"></div>
                      <div className="w-[8px] h-[2px] bg-[#A4D5A6] rounded-full"></div>
                    </div>
                    
                    {/* Right page lines */}
                    <div className="absolute right-0 w-[17px] flex flex-col items-center top-[10px] space-y-[5px]">
                      <div className="w-[8px] h-[2px] bg-[#A4D5A6] rounded-full"></div>
                      <div className="w-[8px] h-[2px] bg-[#A4D5A6] rounded-full"></div>
                      <div className="w-[8px] h-[2px] bg-[#A4D5A6] rounded-full"></div>
                    </div>
                  </div>
                </div>
                <h4 className="font-bengali text-sm sm:text-[15px] font-bold text-emerald-600 mb-1 leading-tight">নোটস</h4>
                <p className="font-bengali text-[11px] sm:text-xs text-slate-400 leading-tight px-1">বিষয়ভিত্তিক সাজানো গুরুত্বপূর্ণ নোটস</p>
              </div>
            </Link>

            <Link to="/memorize" className="group">
              <div className="bg-white border border-purple-100 rounded-[20px] p-4 pb-4 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-purple-200 hover:-translate-y-1 h-full shadow-xs">
                <div className="w-[60px] h-[60px] bg-gradient-to-br from-[#c850f0] to-[#8026eb] rounded-[18px] flex items-center justify-center mb-4 shadow-[0_6px_16px_rgba(168,85,247,0.3)] relative group-hover:scale-105 transition-transform overflow-hidden ring-[3px] ring-purple-50 ring-offset-1">
                  <div className="absolute inset-0 border-[2px] border-white/20 rounded-[18px] z-10 pointer-events-none"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none"></div>
                  <Lightbulb className="w-10 h-10 text-white z-10 drop-shadow-md" strokeWidth={2} />
                </div>
                <h4 className="font-bengali text-sm sm:text-[15px] font-bold text-violet-600 mb-1 leading-tight">মেমোরাইজিং পার্ট</h4>
                <p className="font-bengali text-[11px] sm:text-xs text-slate-400 leading-tight px-1">সমার্থক, বিপরীত ও শব্দকোষ</p>
              </div>
            </Link>

            <Link to="/bank" className="group">
              <div className="bg-white border border-blue-100 rounded-[20px] p-4 pb-4 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-blue-200 hover:-translate-y-1 h-full shadow-xs">
                <div className="relative w-[64px] h-[64px] flex items-center justify-center group-hover:scale-105 transition-transform mb-4">
                  {/* Floating dots on left */}
                  <div className="absolute left-[6px] top-1/2 -translate-y-1/2 flex flex-col gap-[5px]">
                    <div className="w-[3px] h-[3px] rounded-full bg-slate-400"></div>
                    <div className="w-[3px] h-[3px] rounded-full bg-slate-400"></div>
                    <div className="w-[3px] h-[3px] rounded-full bg-slate-400"></div>
                  </div>

                  {/* Main Blue Board */}
                  <div className="relative w-[38px] h-[48px] bg-gradient-to-b from-[#3B82F6] to-[#2563EB] rounded-[10px] shadow-[0_8px_16px_rgba(37,99,235,0.3)] flex flex-col pt-[14px] px-[8px] gap-[6px]">
                    {/* Top Cutout */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[18px] h-[6px] bg-white rounded-b-[4px]"></div>
                    
                    {/* Lines */}
                    <div className="w-[18px] mx-auto h-[2.5px] bg-white rounded-full"></div>
                    <div className="w-[18px] mx-auto h-[2.5px] bg-white rounded-full"></div>
                    <div className="w-[18px] mx-auto h-[2.5px] bg-white rounded-full"></div>
                  </div>

                  {/* Checkmark Circle badge */}
                  <div className="absolute bottom-[2px] right-[4px] w-[26px] h-[26px] bg-[#3B82F6] rounded-full border-[3px] border-white flex items-center justify-center shadow-sm">
                    <Check className="w-[14px] h-[14px] text-white" strokeWidth={3.5} />
                  </div>
                </div>
                <h4 className="font-bengali text-sm sm:text-[15px] font-bold text-blue-600 mb-1 leading-tight">প্রশ্ন ব্যাংক</h4>
                <p className="font-bengali text-[11px] sm:text-xs text-slate-400 leading-tight px-1">হাজারো প্রশ্ন অনুশীলন করুন</p>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* Progress Section ("আজকের প্রগ্রেস") */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bengali text-[16px] font-bold text-slate-800 tracking-tight">আজকের প্রগ্রেস</h3>
          <Link to="/profile" className="text-blue-500 font-bengali text-xs font-bold flex items-center hover:underline bg-blue-50 px-3 py-1 rounded-full">
            বিস্তারিত দেখুন <ChevronRight className="w-3.5 h-3.5 ml-0.5"/>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-slate-100 rounded-[20px] p-4 flex flex-col sm:flex-row items-center sm:items-center sm:justify-start gap-3 shadow-xs">
            <div className="w-[38px] h-[38px] rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50">
               <CheckCircle2 className="w-5 h-5 text-blue-500" strokeWidth={2.5}/>
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
               <div className="text-[20px] font-extrabold font-sans leading-none text-slate-800 mb-1.5">08</div>
               <div className="text-[10px] sm:text-[11px] font-bengali text-slate-500 font-semibold truncate leading-tight">স্টাডি সম্পন্ন</div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[20px] p-4 flex flex-col sm:flex-row items-center sm:items-center sm:justify-start gap-3 shadow-xs">
            <div className="w-[38px] h-[38px] rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100/50">
               <Target className="w-5 h-5 text-emerald-500" strokeWidth={2.5}/>
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
               <div className="text-[20px] font-extrabold font-sans leading-none text-slate-800 mb-1.5">85%</div>
               <div className="text-[10px] sm:text-[11px] font-bengali text-slate-500 font-semibold truncate leading-tight">নির্ভুলতা</div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[20px] p-4 flex flex-col sm:flex-row items-center sm:items-center sm:justify-start gap-3 shadow-xs">
            <div className="w-[38px] h-[38px] rounded-full bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100/50">
               <span className="text-orange-500 text-lg leading-none mt-0.5">🔥</span>
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
               <div className="text-[20px] font-extrabold font-sans leading-none text-slate-800 mb-1.5">12</div>
               <div className="text-[10px] sm:text-[11px] font-bengali text-slate-500 font-semibold truncate leading-tight">দিনের স্ট্রাইক</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ongoing Exams ("চলমান পরীক্ষা") */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bengali text-[16px] font-bold text-slate-800 tracking-tight">চলমান পরীক্ষা</h3>
          <Link to="/exam" className="text-blue-500 font-bengali text-xs font-bold flex items-center hover:underline bg-blue-50 px-3 py-1 rounded-full">
            সব দেখুন <ChevronRight className="w-3.5 h-3.5 ml-0.5"/>
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {liveExams.length > 0 ? (
            liveExams.slice(0, 3).map((exam, idx) => (
              <Link to={`/public-exam/${exam.id}`} key={exam.id}>
                <div className="bg-white border border-slate-100 rounded-[20px] p-3 flex items-center justify-between shadow-xs hover:border-blue-100 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-3">
                     <div className={`w-[46px] h-[46px] rounded-[14px] flex items-center justify-center shrink-0 border ${
                       idx === 0 ? "bg-rose-50 text-rose-500 border-rose-100" : idx === 1 ? "bg-violet-50 text-violet-500 border-violet-100" : "bg-orange-50 text-orange-500 border-orange-100"
                     }`}>
                        {idx === 0 ? <RefreshCw className="w-[22px] h-[22px]" strokeWidth={2.5}/> : idx === 1 ? <BrainCircuit className="w-[22px] h-[22px]" strokeWidth={2.5}/> : <SearchCheck className="w-[22px] h-[22px]" strokeWidth={2.5}/>}
                     </div>
                     <div>
                        <div className="font-bengali font-bold text-[13px] text-slate-800 mb-0.5 leading-tight group-hover:text-blue-600 transition-colors">{exam.title}</div>
                        <div className="text-[11px] font-bengali text-slate-400 font-medium leading-tight">
                          {exam.subject || "সাধারণ"} • {exam.questions?.length || 0}টি প্রশ্ন
                        </div>
                     </div>
                  </div>
                  
                  <div className={`font-bengali text-[11px] font-bold px-3 py-1.5 rounded-full ${
                    idx === 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50" : idx === 1 ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50" : "bg-orange-50 text-orange-600 border border-orange-100/50"
                  }`}>
                     {idx === 0 ? "৮০%" : idx === 1 ? "সম্পন্ন" : "৬৫%"}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <>
              {/* Dummy Data for exact design match if no exams are running */}
              <Link to="/exam?type=mistakes">
                <div className="bg-white border border-slate-100 rounded-[20px] p-3 flex items-center justify-between shadow-xs hover:border-blue-100 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-3">
                     <div className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center shrink-0 bg-rose-50 border border-rose-100 text-rose-500">
                        <RefreshCw className="w-[22px] h-[22px]" strokeWidth={2.5}/>
                     </div>
                     <div>
                        <div className="font-bengali font-bold text-[13px] text-slate-800 mb-0.5 leading-tight group-hover:text-blue-600 transition-colors">ভুলের প্র্যাকটিস</div>
                        <div className="text-[11px] font-bengali text-slate-400 font-medium leading-tight">গণিত • ২০টি প্রশ্ন</div>
                     </div>
                  </div>
                  <div className="font-bengali text-[11px] font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                     ৮০%
                  </div>
                </div>
              </Link>
              
              <Link to="/memorize">
                <div className="bg-white border border-slate-100 rounded-[20px] p-3 flex items-center justify-between shadow-xs hover:border-blue-100 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-3">
                     <div className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center shrink-0 bg-violet-50 border border-violet-100 text-violet-500">
                        <Lightbulb className="w-[22px] h-[22px]" strokeWidth={2.5}/>
                     </div>
                     <div>
                        <div className="font-bengali font-bold text-[13px] text-slate-800 mb-0.5 leading-tight group-hover:text-blue-600 transition-colors">মেমোরাইজিং পাঠ</div>
                        <div className="text-[11px] font-bengali text-slate-400 font-medium leading-tight">ইংরেজি শব্দকোষ</div>
                     </div>
                  </div>
                  <div className="font-bengali text-[11px] font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                     সম্পন্ন
                  </div>
                </div>
              </Link>
              
              <Link to="/exam?type=model">
                <div className="bg-white border border-slate-100 rounded-[20px] p-3 flex items-center justify-between shadow-xs hover:border-blue-100 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-3">
                     <div className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center shrink-0 bg-orange-50 border border-orange-100 text-orange-500">
                        <SearchCheck className="w-[22px] h-[22px]" strokeWidth={2.5}/>
                     </div>
                     <div>
                        <div className="font-bengali font-bold text-[13px] text-slate-800 mb-0.5 leading-tight group-hover:text-blue-600 transition-colors">মডেল টেস্ট</div>
                        <div className="text-[11px] font-bengali text-slate-400 font-medium leading-tight">মডেল টেস্ট - ০৩</div>
                     </div>
                  </div>
                  <div className="font-bengali text-[11px] font-bold px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100/50">
                     ৬৫%
                  </div>
                </div>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Quick Access: AI Tutor & Ask Teacher */}
      <section className="grid grid-cols-2 gap-3 pt-2">
         <Link to="/tutor" className="bg-white rounded-[20px] p-4 shadow-sm border border-blue-100 flex flex-col items-center justify-center gap-2 hover:border-blue-300 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
               <Brain className="w-6 h-6 text-blue-500" strokeWidth={2.5} />
            </div>
            <span className="font-bengali font-bold text-slate-800 text-[14px]">এআই টিউটর</span>
         </Link>

         <Link to="/doubts" className="bg-white rounded-[20px] p-4 shadow-sm border border-orange-100 flex flex-col items-center justify-center gap-2 hover:border-orange-300 transition-colors group">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
               <MessageCircleQuestion className="w-6 h-6 text-orange-500" strokeWidth={2.5} />
            </div>
            <span className="font-bengali font-bold text-slate-800 text-[14px] text-center leading-tight">শিক্ষককে<br/>প্রশ্ন করুন</span>
         </Link>
      </section>


      {/* End bottom spacer */}
    </div>
  );
}
