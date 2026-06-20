import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { motion } from "framer-motion";
import { 
  Download, 
  UserPlus,
  Star,
  ClipboardList,
  MonitorPlay,
  Bot,
  RefreshCcw,
  BookOpen,
  Lightbulb,
  ArrowRight,
  Bell,
  User,
  Moon,
  LogOut,
  CheckCircle2,
  Target,
  Flame,
  X
} from "lucide-react";

export default function Landing() {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState("https://i.ibb.co/5WR6skVX/file-000000004c047209a4e27202c54ddd8d-1.png");
  const [showAutoInstall, setShowAutoInstall] = useState(false);

  // ONLY auto-redirect if they are logged in
  useEffect(() => {
    if (!loading && user) {
      if (userData?.class) {
        navigate("/dashboard");
      } else if (userData) {
        navigate("/onboarding");
      }
    }
  }, [user, userData, loading, navigate]);

  useEffect(() => {
    // Removed auto install popup
  }, [loading, user]);

  const [installMessage, setInstallMessage] = useState<string | null>(null);

  const triggerInstall = () => {
    if (window.self !== window.top) {
      window.open('https://biddayan.com/app/biddayan.apk', '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Direct APK Download
    const link = document.createElement('a');
    link.href = 'https://biddayan.com/app/biddayan.apk';
    link.download = 'biddayan.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    localStorage.setItem('appInstalled', 'true');
  };

  if (loading || user) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
         <img src={logoUrl} alt="Logo" className="w-40 animate-pulse" />
      </div>
    );
  }

  const featuresList = [
    {
      title: "মক টেস্ট",
      desc: "অধ্যায়ভিত্তিক পরীক্ষা দিন এবং নিজের\nপ্রস্তুতি যাচাই করুন",
      icon: <ClipboardList className="w-5 h-5 text-purple-600" />,
      iconBg: "bg-purple-600",
      iconInner: <ClipboardList className="w-5 h-5 text-white" />,
      lightBg: "bg-[#F3E8FF]",
      arrowColor: "text-purple-600"
    },
    {
      title: "মডেল টেস্ট",
      desc: "আসল পরীক্ষার মতো মডেল টেস্ট দিয়ে\nনিজের দক্ষতা বাড়ান",
      icon: <MonitorPlay className="w-5 h-5 text-orange-500" />,
      iconBg: "bg-[#F97316]",
      iconInner: <MonitorPlay className="w-5 h-5 text-white" />,
      lightBg: "bg-[#FFEDD5]",
      arrowColor: "text-orange-500"
    },
    {
      title: "AI ডাউট সলভিং",
      desc: "যেকোনো প্রশ্নের তাৎক্ষণিক উত্তর পান\nAI সাহায্যে",
      icon: <Bot className="w-5 h-5 text-blue-500" />,
      iconBg: "bg-[#3B82F6]",
      iconInner: <Bot className="w-5 h-5 text-white" />,
      lightBg: "bg-[#DBEAFE]",
      arrowColor: "text-blue-500"
    },
    {
      title: "ভুলের প্র্যাকটিস",
      desc: "ভুল হওয়া প্রশ্নগুলো পুনরায় প্র্যাকটিস করে\nদুর্বলতা কাটান",
      icon: <RefreshCcw className="w-5 h-5 text-red-500" />,
      iconBg: "bg-[#EF4444]",
      iconInner: <RefreshCcw className="w-5 h-5 text-white" />,
      lightBg: "bg-[#FEE2E2]",
      arrowColor: "text-red-500"
    },
    {
      title: "নোটস",
      desc: "বিষয়ভিত্তিক সুন্দর ও গুছানো নোটস পড়ুন\nএবং ডাউনলোড করুন",
      icon: <BookOpen className="w-5 h-5 text-green-500" />,
      iconBg: "bg-[#22C55E]",
      iconInner: <BookOpen className="w-5 h-5 text-white" />,
      lightBg: "bg-[#DCFCE7]",
      arrowColor: "text-green-500"
    },
    {
      title: "মেমোরাইজিং কার্ড",
      desc: "গুরুত্বপূর্ণ তথ্য কার্ড সেভ করে সহজে\nমনে রাখুন",
      icon: <Lightbulb className="w-5 h-5 text-purple-600" />,
      iconBg: "bg-[#A855F7]",
      iconInner: <Lightbulb className="w-5 h-5 text-white" />,
      lightBg: "bg-[#F3E8FF]",
      arrowColor: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFC] font-sans overflow-x-hidden selection:bg-[#00B074]/20 relative">
      
      {/* Background decorations reproducing the design */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden h-screen z-0">
          <div className="absolute top-10 right-[15%] w-[500px] h-[500px] bg-green-100/50 rounded-full blur-[100px]"></div>
          <div className="absolute -left-20 top-[20%] w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px]"></div>
          
          <svg className="absolute top-20 right-1/4 w-8 h-8 text-green-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" /></svg>
          <svg className="absolute top-60 left-[45%] w-6 h-6 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>
          <svg className="absolute top-40 right-[10%] w-10 h-10 text-orange-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>
      </div>

      {showAutoInstall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[28px] w-full max-w-sm overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-10 pointer-events-auto">
               <button 
                  onClick={() => setShowAutoInstall(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 z-10"
               >
                  ✕
               </button>
               <div className="p-8 pb-6 flex flex-col items-center text-center">
                   <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                      <Download className="w-10 h-10 text-green-500" />
                   </div>
                   <h3 className="text-2xl font-bengali font-bold text-slate-800 mb-2">অ্যাপটি ইনস্টল করুন!</h3>
                   <p className="text-slate-500 text-[15px] font-bengali leading-relaxed mb-6">
                      সরাসরি আপনার হোম স্ক্রিন থেকে এক ক্লিকেই <b>বিদ্যায়ন</b> ব্যবহার করতে অ্যাপটি ইনস্টল করে নিন।
                   </p>
                   <button 
                      onClick={() => {
                        setShowAutoInstall(false);
                        triggerInstall();
                      }} 
                      className="w-full bg-[#00B074] text-white py-4 rounded-xl font-bold font-bengali text-lg whitespace-nowrap active:scale-95 transition-transform"
                   >
                      ইনস্টল করুন
                   </button>
               </div>
               <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                  <p className="text-xs text-slate-400 font-bengali">সহজে, দ্রুত এবং নির্বিঘ্ন সেবা</p>
               </div>
           </div>
        </div>
      )}

      {installMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm w-[90%] mx-auto animate-in slide-in-from-bottom-5">
           <p className="font-bengali text-sm flex-1 leading-relaxed">{installMessage}</p>
           <button onClick={() => setInstallMessage(null)} className="text-slate-400 hover:text-white p-2">✕</button>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6">
         {/* Top Navigation */}
         <nav className="flex justify-between items-center mb-8 lg:mb-16">
            <img src={logoUrl} alt="বিদ্যায়ন" className="h-[38px] md:h-[45px]" />
         </nav>

         {/* Hero Section */}
         <div className="flex flex-col lg:flex-row items-center justify-between pb-20 gap-16 lg:gap-8">
            {/* Left Content */}
            <div className="flex-1 w-full text-center lg:text-left flex flex-col items-center lg:items-start z-10">
               <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-[56px] lg:text-[76px] font-bold font-bengali text-[#0F172A] leading-[1.1] mb-6 tracking-tight"
               >
                  এক অ্যাপেই<br/>
                  <span className="text-[#00B074]">সম্পূর্ণ প্রস্তুতি</span>
               </motion.h1>
               
               <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-[18px] lg:text-[20px] font-bengali text-[#475569] mb-10 max-w-[500px] leading-[1.6]"
               >
                  নোট, মডেল টেস্ট, প্রশ্ন ব্যাংক, AI ডাউট সলভিং এবং স্মার্ট প্র্যাকটিস—সবকিছু এখন এক জায়গায়।
               </motion.p>

               <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-14"
               >
                  <Link to="/auth" className="w-full sm:w-auto">
                     <button className="w-full sm:w-auto bg-[#00B074] hover:bg-[#009260] text-white px-8 py-4 rounded-xl font-bengali font-semibold text-[17px] transition-transform active:scale-95 shadow-[0_8px_20px_rgba(0,176,116,0.25)] flex items-center justify-center gap-2">
                        <UserPlus className="w-5 h-5" /> ফ্রি অ্যাকাউন্ট তৈরি করুন
                     </button>
                  </Link>
                  <button 
                     onClick={triggerInstall} 
                     className="w-full sm:w-auto bg-white border border-[#E2E8F0] shadow-sm text-[#1E293B] hover:text-[#00B074] px-8 py-4 rounded-xl font-bengali font-semibold text-[17px] transition-colors active:bg-[#F8FAFC] flex items-center justify-center gap-2"
                  >
                     <Download className="w-5 h-5" /> অ্যাপ ইনস্টল করুন
                  </button>
               </motion.div>

               {/* Social Proof */}
               <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col items-center lg:items-start"
               >
                  <div className="flex -space-x-3 mb-4">
                     <img className="w-[46px] h-[46px] rounded-full border-[3px] border-[#FBFBFC] object-cover shadow-sm bg-white" src="https://i.pravatar.cc/100?img=33" alt="Student" />
                     <img className="w-[46px] h-[46px] rounded-full border-[3px] border-[#FBFBFC] object-cover shadow-sm bg-white" src="https://i.pravatar.cc/100?img=47" alt="Student" />
                     <img className="w-[46px] h-[46px] rounded-full border-[3px] border-[#FBFBFC] object-cover shadow-sm bg-white" src="https://i.pravatar.cc/100?img=12" alt="Student" />
                     <img className="w-[46px] h-[46px] rounded-full border-[3px] border-[#FBFBFC] object-cover shadow-sm bg-white" src="https://i.pravatar.cc/100?img=11" alt="Student" />
                  </div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                     <div className="flex text-[#F59E0B] gap-0.5">
                        <Star className="w-[22px] h-[22px] fill-current" />
                        <Star className="w-[22px] h-[22px] fill-current" />
                        <Star className="w-[22px] h-[22px] fill-current" />
                        <Star className="w-[22px] h-[22px] fill-current" />
                        <Star className="w-[22px] h-[22px] fill-current" />
                     </div>
                     <span className="font-bold text-[#0F172A] text-[19px]">4.8</span>
                     <span className="text-[#64748B] font-bengali text-[15px]">(50K+ শিক্ষার্থী)</span>
                  </div>
                  <p className="text-[#475569] font-bengali text-[15px]">বাংলাদেশের শিক্ষার্থীদের আস্থার সেরা অ্যাপ</p>
               </motion.div>
            </div>

            {/* Right Content - Phone Mockup & Floating Elements */}
            <div className="flex-1 w-full flex justify-center relative mt-10 lg:mt-0 select-none hidden md:flex items-center">
               
               {/* 3D Emulated Objects */}
               <div className="absolute left-[30px] bottom-[60px] z-20">
                  <img src="https://cdn3d.iconscout.com/3d/premium/thumb/books-4690332-3899557.png" alt="books" className="w-[180px] drop-shadow-2xl opacity-90" />
               </div>
               <div className="absolute right-[40px] bottom-[120px] z-20">
                  <img src="https://cdn3d.iconscout.com/3d/premium/thumb/trophy-4688921-3899596.png" alt="trophy" className="w-[140px] drop-shadow-2xl opacity-90" />
               </div>
               <div className="absolute right-[10px] bottom-[10px] z-10 w-[120px]">
                  <div className="w-16 h-20 bg-green-200 rounded-b-lg rounded-t-3xl overflow-hidden mx-auto shadow-lg relative bottom-0">
                     <div className="w-full h-full border-4 border-green-300 rounded-b-lg rounded-t-3xl bg-[#00B074]"></div>
                  </div>
               </div>

               {/* Frame/Container for phone */}
               <div className="relative z-10 w-[350px]">
                  
                  {/* The Phone */}
                  <div className="relative bg-[#ffffff] rounded-[48px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-[10px] border-[#1E293B] overflow-hidden w-full h-[730px] pb-10 flex flex-col transform rotate-[-2deg]">
                     
                     {/* Top Notch/Dynamic Island */}
                     <div className="absolute top-0 inset-x-0 w-full flex justify-center z-50">
                        <div className="w-[130px] h-[28px] bg-[#1E293B] rounded-b-[20px]"></div>
                     </div>

                     {/* Mockup Header */}
                     <div className="px-6 pt-12 pb-4 flex justify-between items-center bg-white shadow-sm border-b border-[#F1F5F9] relative z-40">
                        <img src={logoUrl} alt="Logo" className="h-[22px]" />
                        <div className="flex gap-2 text-[#64748B]">
                           <div className="w-[28px] h-[28px] rounded-full border border-[#E2E8F0] flex items-center justify-center">
                              <Bell className="w-[14px] h-[14px]" />
                           </div>
                           <div className="w-[28px] h-[28px] rounded-full border border-[#E2E8F0] flex items-center justify-center">
                              <User className="w-[14px] h-[14px]" />
                           </div>
                           <div className="w-[28px] h-[28px] rounded-full border border-[#E2E8F0] flex items-center justify-center">
                              <Moon className="w-[14px] h-[14px]" />
                           </div>
                           <div className="w-[28px] h-[28px] rounded-full border border-[#E2E8F0] flex items-center justify-center">
                              <LogOut className="w-[14px] h-[14px]" />
                           </div>
                        </div>
                     </div>

                     {/* Mockup Content */}
                     <div className="flex-1 bg-[#FAFAFA] p-[22px] overflow-hidden flex flex-col gap-6">
                        
                        <div>
                           <div className="flex items-center gap-2 mb-4">
                              <h4 className="text-[14px] font-bengali font-bold text-[#00B074]">এক নজরে সব ফিচার</h4>
                           </div>
                           <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                              <div className="flex flex-col items-center gap-1.5">
                                 <div className="w-[52px] h-[52px] bg-[#F3E8FF] rounded-[16px] flex items-center justify-center text-purple-600 shadow-[0_2px_10px_rgba(168,85,247,0.1)] border border-white">
                                    <ClipboardList className="w-6 h-6" />
                                 </div>
                                 <span className="text-[10px] font-bengali font-semibold text-[#475569] text-center leading-[1.2]">মক টেস্ট<br/>সম্পূর্ণ</span>
                              </div>
                              <div className="flex flex-col items-center gap-1.5">
                                 <div className="w-[52px] h-[52px] bg-[#FFEDD5] rounded-[16px] flex items-center justify-center text-orange-500 shadow-[0_2px_10px_rgba(249,115,22,0.1)] border border-white">
                                    <MonitorPlay className="w-6 h-6" />
                                 </div>
                                 <span className="text-[10px] font-bengali font-semibold text-[#475569] text-center leading-[1.2]">মডেল<br/>টেস্ট</span>
                              </div>
                              <div className="flex flex-col items-center gap-1.5">
                                 <div className="w-[52px] h-[52px] bg-[#DBEAFE] rounded-[16px] flex items-center justify-center text-blue-500 shadow-[0_2px_10px_rgba(59,130,246,0.1)] border border-white">
                                    <Bot className="w-6 h-6" />
                                 </div>
                                 <span className="text-[10px] font-bengali font-semibold text-[#475569] text-center leading-[1.2]">ডাউট<br/>সলভিং</span>
                              </div>
                              <div className="flex flex-col items-center gap-1.5">
                                 <div className="w-[52px] h-[52px] bg-[#FEE2E2] rounded-[16px] flex items-center justify-center text-red-500 shadow-[0_2px_10px_rgba(239,68,68,0.1)] border border-white">
                                    <RefreshCcw className="w-6 h-6" />
                                 </div>
                                 <span className="text-[10px] font-bengali font-semibold text-[#475569] text-center leading-[1.2]">ভুলের<br/>প্র্যাকটিস</span>
                              </div>
                              <div className="flex flex-col items-center gap-1.5">
                                 <div className="w-[52px] h-[52px] bg-[#DCFCE7] rounded-[16px] flex items-center justify-center text-green-500 shadow-[0_2px_10px_rgba(34,197,94,0.1)] border border-white">
                                    <BookOpen className="w-6 h-6" />
                                 </div>
                                 <span className="text-[10px] font-bengali font-semibold text-[#475569]">নোটস</span>
                              </div>
                              <div className="flex flex-col items-center gap-1.5">
                                 <div className="w-[52px] h-[52px] bg-[#F3E8FF] rounded-[16px] flex items-center justify-center text-purple-600 shadow-[0_2px_10px_rgba(168,85,247,0.1)] border border-white">
                                    <Lightbulb className="w-6 h-6" />
                                 </div>
                                 <span className="text-[10px] font-bengali font-semibold text-[#475569] text-center leading-[1.2]">মেমোরাইজিং<br/>কার্ড</span>
                              </div>
                              <div className="flex flex-col items-center gap-1.5">
                                 <div className="w-[52px] h-[52px] bg-[#DBEAFE] rounded-[16px] flex items-center justify-center text-blue-500 shadow-[0_2px_10px_rgba(59,130,246,0.1)] border border-white">
                                    <ClipboardList className="w-6 h-6" />
                                 </div>
                                 <span className="text-[10px] font-bengali font-semibold text-[#475569] text-center leading-[1.2]">প্রশ্ন<br/>ব্যাংক</span>
                              </div>
                              <div className="flex flex-col items-center gap-1.5">
                                 <div className="w-[52px] h-[52px] bg-[#FEE2E2] rounded-[16px] flex items-center justify-center text-red-500 shadow-[0_2px_10px_rgba(239,68,68,0.1)] border border-white">
                                    <RefreshCcw className="w-6 h-6" />
                                 </div>
                                 <span className="text-[10px] font-bengali font-semibold text-[#475569] text-center leading-[1.2]">ভুলের<br/>প্র্যাকটিস</span>
                              </div>
                           </div>
                        </div>

                        <div className="bg-[#FFFFFF] rounded-[24px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-[#F1F5F9] mt-2">
                           <h4 className="text-[15px] font-bengali font-bold text-[#0F172A] mb-5">আজকের প্রগ্রেস</h4>
                           <div className="flex justify-between items-center text-center">
                              <div className="flex flex-col items-center gap-2 flex-1">
                                 <div className="w-11 h-11 rounded-[14px] bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6]">
                                    <CheckCircle2 className="w-[22px] h-[22px]" />
                                 </div>
                                 <div className="mt-1">
                                    <p className="font-sans font-bold text-[20px] text-[#0F172A] leading-none mb-1.5">0</p>
                                    <p className="text-[11px] font-bengali text-[#64748B] whitespace-nowrap font-medium">মোট সম্পন্ন</p>
                                 </div>
                              </div>
                              <div className="w-px h-[60px] bg-[#F1F5F9] mx-1"></div>
                              <div className="flex flex-col items-center gap-2 flex-1">
                                 <div className="w-11 h-11 rounded-[14px] bg-[#DCFCE7] flex items-center justify-center text-[#22C55E]">
                                    <Target className="w-[22px] h-[22px]" />
                                 </div>
                                 <div className="mt-1">
                                    <p className="font-sans font-bold text-[20px] text-[#0F172A] leading-none mb-1.5">0%</p>
                                    <p className="text-[11px] font-bengali text-[#64748B] whitespace-nowrap font-medium">নির্ভুলতার হার</p>
                                 </div>
                              </div>
                              <div className="w-px h-[60px] bg-[#F1F5F9] mx-1"></div>
                              <div className="flex flex-col items-center gap-2 flex-1">
                                 <div className="w-11 h-11 rounded-[14px] bg-[#FFEDD5] flex items-center justify-center text-[#F97316]">
                                    <Flame className="w-[22px] h-[22px]" />
                                 </div>
                                 <div className="mt-1">
                                    <p className="font-sans font-bold text-[20px] text-[#0F172A] leading-none mb-1.5">0</p>
                                    <p className="text-[11px] font-bengali text-[#64748B] whitespace-nowrap font-medium">দিনের স্ট্রাইক</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Floating Mockup Cards */}
                  <motion.div 
                    animate={{ y: [-8, 8, -8] }} 
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[8%] -left-[60px] bg-white pt-5 p-4 pb-3 rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.1)] flex flex-col items-center gap-3 border border-[#F8FAFC] z-20 w-[100px]"
                  >
                     <div className="absolute -top-6 w-[48px] h-[48px] bg-white rounded-[14px] shadow-sm flex items-center justify-center border border-slate-50">
                         <div className="w-[36px] h-[36px] bg-[#F97316] rounded-[10px] flex items-center justify-center shadow-[0_4px_10px_rgba(249,115,22,0.3)]">
                            <MonitorPlay className="w-[18px] h-[18px] text-white" />
                         </div>
                     </div>
                     <span className="text-[12px] font-bengali font-bold text-[#EA580C] text-center mt-3 leading-tight">মডেল<br/>টেস্ট</span>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [8, -8, 8] }} 
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[40%] -left-[75px] bg-white pt-5 p-4 pb-3 rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.1)] flex flex-col items-center gap-3 border border-[#F8FAFC] z-20 w-[100px]"
                  >
                     <div className="absolute -top-6 w-[48px] h-[48px] bg-white rounded-[14px] shadow-sm flex items-center justify-center border border-slate-50">
                         <div className="w-[36px] h-[36px] bg-[#A855F7] rounded-[10px] flex items-center justify-center shadow-[0_4px_10px_rgba(168,85,247,0.3)]">
                            <ClipboardList className="w-[18px] h-[18px] text-white" />
                         </div>
                     </div>
                     <span className="text-[12px] font-bengali font-bold text-[#9333EA] text-center mt-3 leading-tight">মক<br/>টেস্ট</span>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [-5, 5, -5] }} 
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute top-[30%] -right-[60px] bg-white pt-5 p-4 pb-3 rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.1)] flex flex-col items-center gap-3 border border-[#F8FAFC] z-20 w-[100px]"
                  >
                     <div className="absolute -top-6 w-[48px] h-[48px] bg-white rounded-[14px] shadow-sm flex items-center justify-center border border-slate-50">
                         <div className="w-[36px] h-[36px] bg-[#3B82F6] rounded-[10px] flex items-center justify-center shadow-[0_4px_10px_rgba(59,130,246,0.3)]">
                            <Bot className="w-[18px] h-[18px] text-white" />
                         </div>
                     </div>
                     <span className="text-[12px] font-bengali font-bold text-[#2563EB] text-center mt-3 leading-tight">AI<br/>ডাউট সলভিং</span>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [5, -5, 5] }} 
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    className="absolute top-[65%] -right-[70px] bg-white pt-5 p-4 pb-3 rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.1)] flex flex-col items-center gap-3 border border-[#F8FAFC] z-20 w-[100px]"
                  >
                     <div className="absolute -top-6 w-[48px] h-[48px] bg-white rounded-[14px] shadow-sm flex items-center justify-center border border-slate-50">
                         <div className="w-[36px] h-[36px] bg-[#EF4444] rounded-[10px] flex items-center justify-center shadow-[0_4px_10px_rgba(239,68,68,0.3)]">
                            <RefreshCcw className="w-[18px] h-[18px] text-white" />
                         </div>
                     </div>
                     <span className="text-[12px] font-bengali font-bold text-[#DC2626] text-center mt-3 leading-tight">ভুলের<br/>প্র্যাকটিস</span>
                  </motion.div>

               </div>
            </div>
         </div>
      </div>

      {/* Features Detail Section */}
      <div className="py-24 bg-[#FAFAFA] mt-10 border-t border-[#F1F5F9]">
         <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-[32px] md:text-[40px] font-bengali font-bold text-[#0F172A] inline-flex flex-col items-center">
                  আমাদের সকল ফিচার
                  <div className="w-12 h-1.5 bg-[#00B074] rounded-full mt-4 mx-auto"></div>
               </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pb-10">
               {featuresList.map((feature, idx) => (
                  <motion.div 
                     key={idx}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.5, delay: idx * 0.1 }}
                     className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-all flex flex-col h-full hover:-translate-y-1 group"
                  >
                     <div className="flex items-center gap-5 mb-4">
                        <div className={`w-[52px] h-[52px] rounded-2xl ${feature.lightBg} border border-white flex items-center justify-center shadow-sm shrink-0`}>
                           {feature.iconBg ? (
                              <div className={`w-[36px] h-[36px] rounded-[10px] ${feature.iconBg} flex items-center justify-center`}>
                                 {feature.iconInner}
                              </div>
                           ) : feature.icon}
                        </div>
                        <h3 className={`text-[22px] font-bengali font-bold leading-tight ${feature.arrowColor}`}>
                           {feature.title}
                        </h3>
                     </div>
                     <p className="text-[#64748B] font-bengali text-[18px] leading-[1.6] mb-8 whitespace-pre-line flex-1">
                        {feature.desc}
                     </p>
                     <div className="flex justify-end mt-auto">
                        <div className={`w-[38px] h-[38px] rounded-full ${feature.lightBg} flex items-center justify-center ${feature.arrowColor} transition-transform group-hover:scale-110 shadow-sm cursor-pointer`}>
                           <ArrowRight className="w-[18px] h-[18px]" />
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </div>

    </div>
  );
}
