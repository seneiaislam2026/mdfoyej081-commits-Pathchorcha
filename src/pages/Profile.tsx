import { useEffect, useState } from "react";
import { UserCircle, Target, BookOpen, Clock, LogOut, ChevronRight, ClipboardList, BarChart2, Star, Database, Brain, MessageCircle } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";

export default function Profile() {
  const { userData, signOut } = useAuth();
  const navigate = useNavigate();
  const [examResults, setExamResults] = useState<any[]>([]);
  const [badgesCount, setBadgesCount] = useState(0); // placeholder for badges if we add them logic

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

  return (
    <div className="max-w-md mx-auto space-y-6 pb-10 px-4 pt-6">
      {/* Top Card Navigation - Optional log out top right */}
      <div className="flex justify-end mb-2">
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
           <h1 className="text-[28px] font-bengali font-extrabold text-[#0F172A] leading-tight">
             {userData?.fullName || (userData?.email ? (userData.email.includes("@pathchorcha") || userData.email.includes("@shikkhangon") || userData.email.includes("@pathchola") ? userData.email.split("@")[0] : userData.email) : "নাম জানা যায়নি")}
           </h1>
           <div className="flex items-center justify-center gap-3 mt-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              <p className="text-slate-600 font-bengali text-[17px] font-medium">{userData?.institution || "শিক্ষাপ্রতিষ্ঠান যুক্ত করা হয়নি"}</p>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
         <Link to="/tutor" className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center gap-3 hover:border-amber-400 transition-colors group">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
               <Brain className="w-7 h-7 text-blue-500" strokeWidth={2} />
            </div>
            <span className="font-bengali font-bold text-slate-800 text-[17px]">এআই টিউটর</span>
         </Link>

         <Link to="/doubts" className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center gap-3 hover:border-amber-400 transition-colors group">
            <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
               <MessageCircle className="w-7 h-7 text-orange-500" strokeWidth={2} />
            </div>
            <span className="font-bengali font-bold text-slate-800 text-[17px] text-center leading-tight">শিক্ষককে <br/> প্রশ্ন করুন</span>
         </Link>
      </div>

    </div>
  );
}
