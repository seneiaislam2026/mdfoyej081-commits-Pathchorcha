import { useEffect, useState } from "react";
import { UserCircle, Target, BookOpen, Clock, LogOut, ChevronRight, ClipboardList, BarChart2, Star, Database, Brain, MessageCircle, Crown, Settings, X } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, query, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

export default function Profile() {
  const { userData, signOut } = useAuth();
  const navigate = useNavigate();
  const [examResults, setExamResults] = useState<any[]>([]);
  const [badgesCount, setBadgesCount] = useState(0); // placeholder for badges if we add them logic
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showClassChangeModal, setShowClassChangeModal] = useState(false);
  const [classChangeGroup, setClassChangeGroup] = useState("বিজ্ঞান");
  const [classChangeLoading, setClassChangeLoading] = useState(false);

  useEffect(() => {
    if (userData?.uid) {
      fetchExamResults();
    }
  }, [userData]);

  const fetchExamResults = async () => {
    if (!userData?.uid) return;
    try {
      const q = query(collection(db, "users", userData.uid, "exam_results"));
      const snap = await getDocs(q);
      const results = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toMillis() || Date.now()
      })).sort((a,b) => a.timestamp - b.timestamp);
      setExamResults(results);
    } catch (e) {
      console.error("Error fetching exam results:", e);
    }
  };

  const avgScore = examResults.length > 0 ? Math.round(examResults.reduce((acc, curr) => acc + (curr.score / Math.max(curr.total, 1)) * 100, 0) / examResults.length) : 0;
  
  // Convert number to bengali numeral
  const toBn = (num: number | string) => num.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleClassChangeRequest = async () => {
    if (!userData?.uid) return;
    setClassChangeLoading(true);
    try {
      await addDoc(collection(db, "class_change_requests"), {
        userId: userData.uid,
        userName: userData.fullName || userData.email,
        currentClass: userData.class || "Unknown",
        requestedClass: classChangeGroup,
        status: "pending",
        timestamp: serverTimestamp()
      });
      alert("ক্লাস পরিবর্তনের রিকুয়েস্ট পাঠানো হয়েছে। অ্যাডমিন অ্যাপ্রুভ করলে আপনার ক্লাস আপডেট হবে।");
      setShowClassChangeModal(false);
    } catch (e) {
      console.error(e);
      alert("রিকুয়েস্ট পাঠাতে সমস্যা হয়েছে।");
    } finally {
      setClassChangeLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-10 px-4 pt-6">
      {/* Top Card Navigation */}
      <div className="flex justify-between mb-2">
         <button onClick={() => setShowSettingsModal(true)} className="text-slate-400 hover:text-slate-600 flex items-center gap-1.5 text-sm font-bengali bg-white px-3 py-1.5 rounded-full shadow-sm">
            <Settings className="w-4 h-4" /> সেটিংস
         </button>
         <button onClick={handleSignOut} className="text-slate-400 hover:text-slate-600 flex items-center gap-1.5 text-sm font-bengali">
            <LogOut className="w-4 h-4" /> লগ আউট
         </button>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative pb-8">
        
        {/* Banner Section */}
        <div className="h-[200px] bg-[#0A1930] relative overflow-hidden flex items-start pt-6">
           {/* SVG Decorative Background */}
           <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 375 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Star 1 */}
              <path d="M40 20 L42 28 L50 30 L42 32 L40 40 L38 32 L30 30 L38 28 Z" fill="#FFE066" opacity="0.8" />
              {/* Star 2 */}
              <circle cx="120" cy="25" r="2" fill="#FFE066" opacity="0.8" />
              <path d="M130 15 L131 19 L135 20 L131 21 L130 25 L129 21 L125 20 L129 19 Z" fill="#FFE066" opacity="0.8" />
              {/* Star 3 (Right) */}
              <path d="M340 30 L341 34 L345 35 L341 36 L340 40 L339 36 L335 35 L339 34 Z" fill="#FFE066" opacity="0.8" />
              {/* Dotted pattern right */}
              <circle cx="330" cy="15" r="1" fill="#FFE066" />
              <circle cx="340" cy="15" r="1" fill="#FFE066" />
              <circle cx="350" cy="15" r="1" fill="#FFE066" />
              <circle cx="330" cy="25" r="1" fill="#FFE066" />
              <circle cx="350" cy="25" r="1" fill="#FFE066" />
              {/* Squiggle right */}
              <path d="M320 80 Q325 75 330 80 T340 80 T350 80" stroke="#FFE066" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="2 4" />
              
              {/* Book Icon (Left) */}
              <g transform="translate(35, 45) rotate(-15) scale(0.9)">
                 <path d="M10 10 L10 40 L40 50 L70 40 L70 10 L40 20 Z" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                 <path d="M40 20 L40 50" fill="none" stroke="white" strokeWidth="2" />
                 <path d="M15 20 L35 26" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                 <path d="M15 28 L35 34" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                 <path d="M15 36 L35 42" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                 <path d="M45 26 L65 20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                 <path d="M45 34 L65 28" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Pencil Icon (Left-Middle) */}
              <g transform="translate(100, 75) rotate(45) scale(0.6)">
                 <path d="M10 30 L40 10 L50 20 L20 40 Z" fill="none" stroke="#FFE066" strokeWidth="3" />
                 <path d="M10 30 L0 40 L20 40 Z" fill="none" stroke="#FFE066" strokeWidth="3" />
                 <path d="M40 10 L45 5 L55 15 L50 20 Z" fill="none" stroke="#FFE066" strokeWidth="3" />
                 <path d="M10 40 L15 35" fill="none" stroke="#FFE066" strokeWidth="2" />
              </g>

              {/* Graduation Cap (Right) */}
              <g transform="translate(260, 40) rotate(15) scale(0.8)">
                 <path d="M30 10 L60 20 L30 30 L0 20 Z" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                 <path d="M15 25 L15 40 Q30 50 45 40 L45 25" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                 <path d="M60 20 L60 40" fill="none" stroke="white" strokeWidth="2" />
                 <circle cx="60" cy="45" r="3" fill="#FFE066" />
                 <path d="M57 45 C50 45 50 55 50 60 C65 60 70 55 63 45" fill="#FFE066" />
              </g>

              {/* Bottom Yellow Wave Layer */}
              <path d="M-10 180 Q100 130 187.5 150 T385 180 L385 220 L-10 220 Z" fill="#FFE066" />
              {/* Bottom White Wave Layer */}
              <path d="M-10 185 Q100 135 187.5 155 T385 185 L385 220 L-10 220 Z" fill="white" />
           </svg>
        </div>

        {/* Avatar */}
        <div className="flex justify-center -mt-[85px] relative z-10 w-fit mx-auto">
           {userData?.photoURL ? (
             <img src={userData.photoURL} alt="Profile" className="w-[140px] h-[140px] rounded-full border-4 border-white bg-[#E2E8F0] shadow-sm object-cover" />
           ) : (
             <div className="w-[140px] h-[140px] rounded-full border-[6px] border-white bg-[#E2E8F0] overflow-hidden flex flex-col items-center justify-end shadow-sm">
                <svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-4">
                  <circle cx="50" cy="35" r="28" fill="#94A3B8"/>
                  <path d="M0 120 Q50 60 100 120 Z" fill="#94A3B8"/>
                  <path d="M5 120 C5 75 95 75 95 120 Z" fill="#94A3B8"/>
                </svg>
             </div>
           )}
        </div>

        {/* Name & Title */}
        <div className="text-center mt-5 px-4">
           <h1 className="text-[28px] font-bengali font-extrabold text-[#0F172A] leading-tight truncate px-2 text-center w-full max-w-[300px] mx-auto">
             {userData?.fullName || (userData?.email ? (userData.email.includes("@pathchorcha") || userData.email.includes("@shikkhangon") || userData.email.includes("@pathchola") ? userData.email.split("@")[0] : userData.email) : "নাম জানা যায়নি")}
           </h1>
           <div className="flex items-center justify-center gap-2 mt-1.5 w-full max-w-[280px] mx-auto">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              <p className="text-slate-600 font-bengali text-[17px] font-medium truncate">{userData?.institution || "শিক্ষাপ্রতিষ্ঠান যুক্ত করা হয়নি"}</p>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
           </div>
           
           <div className="flex justify-center mt-4 mb-2">
              <div className="flex h-[3px] w-12 rounded-full overflow-hidden">
                <div className="w-1/2 bg-[#0A1930]"></div>
                <div className="w-1/2 bg-[#F59E0B]"></div>
              </div>
           </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 mt-6 px-6">
           <button className="bg-[#0A1930] hover:bg-slate-800 text-white rounded-xl flex-1 flex items-center justify-between h-[52px] px-4 shadow-sm transition-colors group">
              <div className="flex items-center gap-2.5">
                 <UserCircle className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                 <span className="font-bengali text-lg font-bold">এডমিশন</span>
              </div>
              <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-hover:border-white/40 transition-colors">
                 <ChevronRight className="w-3.5 h-3.5 text-white/80" />
              </div>
           </button>

           <div className="border-l-2 border-dashed border-slate-200 h-10 shrink-0"></div>

           <button className="bg-white border text-amber-400 border-amber-300 hover:bg-amber-50 rounded-xl flex-1 flex items-center justify-between h-[52px] px-4 shadow-sm transition-colors group">
              <div className="flex items-center gap-2.5">
                 <div className="relative w-6 h-6 flex items-center justify-center">
                    <Database className="w-5 h-5 text-amber-500 absolute" />
                    <div className="absolute top-[2px] right-[2px] w-[5px] h-[5px] bg-amber-200 rounded-full"></div>
                 </div>
                 <span className="font-bold text-lg text-slate-800">{userData?.points || 0} Coins</span>
              </div>
              <div className="w-6 h-6 rounded-full border border-amber-300 flex items-center justify-center shrink-0 group-hover:border-amber-400 transition-colors">
                 <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
              </div>
           </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 sm:p-7 relative overflow-hidden">
        {/* Header and Illustration Row */}
        <div className="flex items-start justify-between mb-8">
           <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                 <Target className="w-8 h-8 text-[#0A1930]" strokeWidth={2.5} />
                 <h2 className="text-[26px] font-bengali font-bold text-[#0F172A] leading-none">সারাংশ</h2>
              </div>
              <div className="w-10 h-[3.5px] bg-amber-400 rounded-full ml-11"></div>
           </div>

           {/* Clipboard SVG Illustration */}
           <div className="w-[120px] h-[90px] shrink-0 -mt-2 -mr-3 relative">
              <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                 <path d="M20 70 Q15 60 25 55 Q35 50 30 65 Z" fill="#10B981" />
                 <path d="M20 75 Q10 70 15 60 Q25 65 20 75 Z" fill="#059669" />
                 <rect x="15" y="70" width="10" height="15" fill="#0F172A" rx="1" />
                 
                 <path d="M100 20 L102 24 L106 25 L102 26 L100 30 L98 26 L94 25 L98 24 Z" fill="#FCD34D" />
                 <circle cx="95" cy="40" r="2" fill="#94A3B8" />
                 <circle cx="20" cy="30" r="2" fill="#94A3B8" />
                 
                 <rect x="35" y="15" width="55" height="70" rx="4" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2" />
                 
                 <rect x="52" y="10" width="20" height="10" rx="2" fill="#3B82F6" stroke="#0F172A" strokeWidth="2" />
                 <circle cx="62" cy="15" r="2" fill="white" />
                 
                 <rect x="42" y="30" width="8" height="8" rx="1" fill="#FEF08A" stroke="#0F172A" strokeWidth="1.5" />
                 <path d="M44 34 L45 35 L48 32" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                 
                 <rect x="42" y="45" width="8" height="8" rx="1" fill="none" stroke="#0F172A" strokeWidth="1.5" />
                 <path d="M44 49 L45 50 L48 47" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

                 <rect x="42" y="60" width="8" height="8" rx="1" fill="none" stroke="#0F172A" strokeWidth="1.5" />
                 
                 <rect x="55" y="33" width="25" height="2" fill="#94A3B8" />
                 <rect x="55" y="48" width="20" height="2" fill="#94A3B8" />
                 <rect x="55" y="63" width="15" height="2" fill="#94A3B8" />
                 
                 <rect x="35" y="65" width="55" height="20" rx="0" fill="none" stroke="none" />
                 <path d="M50 78 A 8 8 0 1 1 66 78 A 8 8 0 1 1 50 78 Z" fill="#FEF08A" stroke="#0F172A" strokeWidth="1.5" />
                 <path d="M58 78 L58 70 A 8 8 0 0 1 66 78 Z" fill="#3B82F6" stroke="#0F172A" strokeWidth="1.5" />
                 
                 <path d="M10 85 L110 85" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
           </div>
        </div>

        {/* List Items */}
        <div className="space-y-0.5 mt-2">
           
           {/* Item 1: Rank */}
           <div className="flex items-center justify-between border-b border-dashed border-slate-200 py-4">
              <div className="flex items-center gap-3.5">
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5 text-blue-500" strokeWidth={2} />
                 </div>
                 <span className="font-bengali text-slate-700 font-medium text-[17px]">লিডারবোর্ডের র্যাঙ্ক</span>
              </div>
              <span className="font-bold text-slate-800 text-xl">-</span>
           </div>

           {/* Item 2: Badges */}
           <div className="flex items-center justify-between border-b border-dashed border-slate-200 py-4">
              <div className="flex items-center gap-3.5">
                 <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                    <BarChart2 className="w-5 h-5 text-amber-500" strokeWidth={2} />
                 </div>
                 <span className="font-bengali text-slate-700 font-medium text-[17px]">অর্জিত ব্যাজ</span>
              </div>
              <span className="font-bold text-slate-800 text-xl font-mono">{toBn(badgesCount)}</span>
           </div>

           {/* Item 3: Correct Ans */}
           <div className="flex items-center justify-between border-b border-dashed border-slate-200 py-4">
              <div className="flex items-center gap-3.5">
                 <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-green-500" strokeWidth={2} />
                 </div>
                 <span className="font-bengali text-slate-700 font-medium text-[17px]">সঠিক উত্তর</span>
              </div>
              <div className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-md text-[15px]">
                 {toBn(avgScore)}%
              </div>
           </div>

           {/* Item 4: Time */}
           <div className="flex items-center justify-between pt-4 pb-1">
              <div className="flex items-center gap-3.5">
                 <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-purple-500" strokeWidth={2} />
                 </div>
                 <span className="font-bengali text-slate-700 font-medium text-[17px]">মোট সময়</span>
              </div>
              <div className="bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-md text-[15px] font-bengali">
                 ০ মিনিট
              </div>
           </div>

        </div>
      </div>

      {/* Pro Upgrade Banner for Free Users */}
      {!userData?.isPro && (
        <div className="mb-2">
           <Link to="/subscription" className="block w-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-[32px] p-6 relative overflow-hidden shadow-[0_8px_30px_rgba(245,158,11,0.25)] hover:-translate-y-1 transition-transform group">
             <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
             <div className="absolute left-0 bottom-0 w-24 h-24 bg-black/10 rounded-full blur-xl translate-y-1/3 -translate-x-1/2"></div>
             
             <div className="flex items-center gap-5 relative z-10">
                <div className="w-[56px] h-[56px] bg-white/20 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/30 text-white">
                   <Crown className="w-8 h-8 drop-shadow-md" strokeWidth={2.5} />
                </div>
                <div>
                   <h3 className="text-white font-bengali font-bold text-[20px] mb-1.5 drop-shadow-sm leading-tight flex items-center gap-2">
                     প্রো-তে আপগ্রেড করুন
                   </h3>
                   <p className="text-amber-50 font-bengali text-[14px] leading-snug drop-shadow-sm font-medium">সকল প্রিমিয়াম ফিচার এবং আনলিমিটেড মক টেস্ট আনলক করতে এখনই প্রো মেম্বার হোন!</p>
                </div>
             </div>
           </Link>
        </div>
      )}

      {/* Progress Graph */}
      <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 sm:p-7 relative overflow-hidden">
         <div className="flex items-center gap-2.5 mb-6">
            <BarChart2 className="w-6 h-6 text-[#0A1930]" strokeWidth={2.5} />
            <h2 className="text-xl font-bengali font-bold text-[#0F172A] leading-none">অগ্রগতি গ্রাফ</h2>
         </div>
         <div className="relative h-40 w-full flex items-end justify-between gap-2.5 mt-4">
            {/* simple bar graph based on recent exam results */}
            {[...examResults].slice(-7).map((res, idx) => {
               const percentage = (res.score / Math.max(res.total, 1)) * 100;
               return (
                 <div key={idx} className="flex flex-col items-center flex-1 gap-2 group relative">
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0A1930] text-amber-400 text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap z-10 font-bengali">
                       {toBn(Math.round(percentage))}%
                    </div>
                    <div className="w-full bg-slate-100 rounded-t-xl rounded-b-sm overflow-hidden h-full flex items-end relative">
                       <div 
                         className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-xl rounded-b-sm transition-all duration-700 ease-out" 
                         style={{ height: `${Math.max(percentage, 5)}%` }}
                       ></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold font-bengali uppercase">টেস্ট {toBn(idx+1)}</span>
                 </div>
               )
            })}
            {examResults.length === 0 && (
               <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bengali text-sm bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  কোনো টেস্টের ডাটা নেই
               </div>
            )}
         </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
         <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm overflow-hidden shadow-xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95">
               <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold font-bengali text-slate-900">সেটিংস</h3>
                     <button onClick={() => setShowSettingsModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                  
                  <div className="space-y-4">
                     {/* Menu items inside settings */}
                     <button 
                       onClick={() => {
                          setShowSettingsModal(false);
                          setShowClassChangeModal(true);
                       }} 
                       className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 p-4 rounded-2xl transition-colors"
                     >
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                              <Target className="w-5 h-5 text-indigo-600" />
                           </div>
                           <div className="text-left py-1">
                              <div className="font-bold text-slate-800 font-bengali">ক্লাস পরিবর্তন</div>
                              <div className="text-xs text-slate-500 font-bengali mt-0.5">আপনার বর্তমান ক্লাস বা গ্রুপ পরিবর্তন করুন</div>
                           </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                     </button>
                     
                     {/* Example of another settings option */}
                     <button 
                       onClick={handleSignOut} 
                       className="w-full flex items-center justify-between hover:bg-red-50 p-4 rounded-2xl transition-colors group"
                     >
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center shrink-0">
                              <LogOut className="w-5 h-5 text-red-500" />
                           </div>
                           <div className="text-left py-1">
                              <div className="font-bold text-red-600 font-bengali">লগ আউট</div>
                           </div>
                        </div>
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Class Change Modal */}
      {showClassChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold font-bengali text-slate-900 mb-2">গ্রুপ পরিবর্তন রিকুয়েস্ট</h3>
            <p className="text-sm font-bengali text-slate-500 mb-5">
              আপনি কোন ক্লাসে বা গ্রুপে যেতে চান? অ্যাডমিন অ্যাপ্রুভ করলে আপনার রিকুয়েস্ট কার্যকর হবে।
            </p>
            <div className="space-y-3 mb-6">
              {['বিজ্ঞান', 'মানবিক', 'বাণিজ্য', 'এইচএসসি বিজ্ঞান', 'এইচএসসি মানবিক', 'এইচএসসি বাণিজ্য', 'এডমিশন'].map(grp => (
                <label key={grp} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${classChangeGroup === grp ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                  <input 
                    type="radio" 
                    name="group" 
                    value={grp} 
                    checked={classChangeGroup === grp} 
                    onChange={(e) => setClassChangeGroup(e.target.value)} 
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span className={`font-bengali font-bold ${classChangeGroup === grp ? 'text-indigo-800' : 'text-slate-700'}`}>{grp}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowClassChangeModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold font-bengali"
              >
                বাতিল
              </button>
              <button 
                onClick={handleClassChangeRequest}
                disabled={classChangeLoading}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold font-bengali disabled:opacity-50"
              >
                {classChangeLoading ? 'পাঠানো হচ্ছে...' : 'রিকুয়েস্ট দিন'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
