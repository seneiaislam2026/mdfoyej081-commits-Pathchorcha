import { Trophy, Award, TrendingUp, Crown, Star, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../lib/AuthContext";
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "../lib/firebase";

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <div className="relative flex justify-center items-center w-10 h-10 mx-auto">
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" className="absolute top-0 drop-shadow-md">
          <path d="M10 24L6 38L16 32L26 38L22 24" fill="#F59E0B" />
          <circle cx="16" cy="14" r="14" fill="#FBBF24" />
          <circle cx="16" cy="14" r="12" fill="#F59E0B" stroke="#FBBF24" strokeWidth="1" />
        </svg>
        <span className="relative text-white font-bold text-sm z-10 -mt-3">{rank}</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="relative flex justify-center items-center w-10 h-10 mx-auto">
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" className="absolute top-0 drop-shadow-sm">
          <path d="M10 24L6 38L16 32L26 38L22 24" fill="#94A3B8" />
          <circle cx="16" cy="14" r="14" fill="#E2E8F0" />
          <circle cx="16" cy="14" r="12" fill="#94A3B8" stroke="#E2E8F0" strokeWidth="1" />
        </svg>
        <span className="relative text-white font-bold text-sm z-10 -mt-3">{rank}</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="relative flex justify-center items-center w-10 h-10 mx-auto">
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" className="absolute top-0 drop-shadow-sm">
          <path d="M10 24L6 38L16 32L26 38L22 24" fill="#C2410C" />
          <circle cx="16" cy="14" r="14" fill="#EA580C" />
          <circle cx="16" cy="14" r="12" fill="#C2410C" stroke="#EA580C" strokeWidth="1" />
        </svg>
        <span className="relative text-white font-bold text-sm z-10 -mt-3">{rank}</span>
      </div>
    );
  }
  return <span className="font-bold text-slate-500 text-[17px]">{rank}</span>;
}

export default function Leaderboard() {
  const { userData } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(userData?.class || "Class 9");
  const [timeRange, setTimeRange] = useState("weekly");

  const getInitials = (name: string) => {
    if (!name) return "N";
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      const isEnglish = /^[A-Za-z]+$/.test(parts[0]);
      if (isEnglish) {
        return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
      }
    }
    return name.substring(0, 2);
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      "bg-amber-100 text-amber-700",
      "bg-blue-100 text-blue-700",
      "bg-orange-100 text-orange-700",
      "bg-indigo-100 text-indigo-700",
      "bg-emerald-100 text-emerald-700",
      "bg-rose-100 text-rose-700",
      "bg-purple-100 text-purple-700"
    ];
    return colors[index % colors.length];
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "users"),
          where("class", "==", selectedClass),
          orderBy("points", "desc"),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        // Ensure sorted correctly
        data.sort((a, b) => (b.points || 0) - (a.points || 0));
        setUsers(data);
      } catch (error: any) {
        // Fallback if composite index is missing
        if (error.code === 'failed-precondition' || (error.message && error.message.includes('index'))) {
          try {
            const qAll = query(collection(db, "users"), orderBy("points", "desc"), limit(1000));
            const snapshotAll = await getDocs(qAll);
            const dataAll = snapshotAll.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
            const filtered = dataAll.filter(u => u.class === selectedClass);
            setUsers(filtered.slice(0, 50));
          } catch (fallbackError) {
             console.error("Error in fallback fetch", fallbackError);
          }
        } else {
          console.error("Error fetching leaderboard", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [selectedClass]);

  const getTimeRangeText = () => {
    if (timeRange === 'daily') return 'আজকের';
    if (timeRange === 'monthly') return 'মাসিক';
    if (timeRange === 'all-time') return 'সর্বোচ্চ';
    return 'সাপ্তাহিক';
  };

  const getTimeRangeSubText = () => {
    if (timeRange === 'daily') return 'দিনের';
    if (timeRange === 'monthly') return 'মাসের';
    if (timeRange === 'all-time') return 'সময়ের';
    return 'সপ্তাহের';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-6 pb-12 px-4 relative z-0">
      
      {/* Top Tabs */}
      <div className="flex bg-slate-100/80 p-1.5 rounded-full mx-auto w-fit mb-4 shadow-inner border border-slate-200">
        <button 
          onClick={() => setTimeRange('daily')} 
          className={`px-5 sm:px-8 py-2.5 rounded-full text-[15px] font-bengali transition-all duration-200 ${timeRange==='daily' ? 'bg-[#5264F9] text-white shadow-md font-medium' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}>
            আজকে
        </button>
        <button 
          onClick={() => setTimeRange('weekly')} 
          className={`px-5 sm:px-8 py-2.5 rounded-full text-[15px] font-bengali transition-all duration-200 ${timeRange==='weekly' ? 'bg-[#5264F9] text-white shadow-md font-medium' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}>
            সাপ্তাহিক
        </button>
        <button 
          onClick={() => setTimeRange('monthly')} 
          className={`px-5 sm:px-8 py-2.5 rounded-full text-[15px] font-bengali transition-all duration-200 ${timeRange==='monthly' ? 'bg-[#5264F9] text-white shadow-md font-medium' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}>
            মাসিক
        </button>
        <button 
          onClick={() => setTimeRange('all-time')} 
          className={`px-5 sm:px-8 py-2.5 rounded-full text-[15px] font-bengali transition-all duration-200 ${timeRange==='all-time' ? 'bg-[#5264F9] text-white shadow-md font-medium' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}>
            সর্বোচ্চ
        </button>
      </div>

      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100/80 bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100/50 shadow-sm">
               <Trophy className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
               <h2 className="text-[22px] font-bold font-bengali text-slate-800 tracking-tight">
                 {getTimeRangeText()} লিডারবোর্ড
               </h2>
               <p className="text-slate-500 font-bengali text-sm mt-1">
                 এই {getTimeRangeSubText()} সেরা পারফর্মাররা
               </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 cursor-pointer max-w-[200px] w-full md:w-auto">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <select 
              value={selectedClass} 
              onChange={e => setSelectedClass(e.target.value)}
              className="bg-transparent border-none outline-none font-bengali text-slate-700 font-medium cursor-pointer w-full appearance-none pr-4"
            >
              <option value="Class 6">৬ষ্ঠ শ্রেণী (Class 6)</option>
              <option value="Class 7">৭ম শ্রেণী (Class 7)</option>
              <option value="Class 8">৮ম শ্রেণী (Class 8)</option>
              <option value="Class 9">৯ম শ্রেণী (Class 9)</option>
              <option value="Class 10">১০ম শ্রেণী (Class 10)</option>
              <option value="SSC">এসএসসি (SSC)</option>
              <option value="HSC">এইচএসসি (HSC)</option>
              <option value="Admission">Admission</option>
              <option value="Job Prep">Job Prep</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="w-full overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="py-4 px-6 font-semibold text-slate-400 text-[13px] w-20 text-center uppercase tracking-wider">Rank</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-[13px] uppercase tracking-wider">Student Name</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-[13px] text-right uppercase tracking-wider">Points</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-16 text-center text-slate-400 font-bengali">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      লোড হচ্ছে...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-16 text-center text-slate-400 font-bengali">
                    এই ক্লাসের জন্য পর্যাপ্ত ডেটা নেই।
                  </td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <tr key={u.id} className={`border-b border-slate-50 last:border-none hover:bg-slate-50/80 transition-colors ${userData?.uid === u.id ? 'bg-[#fff8f0] hover:bg-[#fff5e6]' : i === 0 ? 'bg-amber-50/30' : ''}`}>
                     <td className="py-4 px-6 text-center align-middle">
                       <RankBadge rank={i + 1} />
                     </td>
                     <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                           <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bengali text-[15px] font-bold overflow-hidden shadow-sm shrink-0 border border-white ${getAvatarColor(i)}`}>
                             {u.photoURL ? <img src={u.photoURL} alt={u.fullName} className="w-full h-full object-cover" /> : getInitials(u.fullName || "N A")}
                           </div>
                           <div className="flex items-center gap-2.5">
                             <span className="font-semibold text-slate-800 text-[15.5px] font-bengali">{u.fullName || "No Name"}</span>
                             {u.isPro && <Crown className="w-4.5 h-4.5 text-amber-500 fill-amber-500 drop-shadow-sm" />}
                             {userData?.uid === u.id && (
                               <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider shadow-sm">YOU</span>
                             )}
                           </div>
                        </div>
                     </td>
                     <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 pr-2">
                          <span className={`font-bold font-mono text-[19px] ${userData?.uid === u.id ? 'text-[#e65c00]' : i === 0 ? 'text-[#e65c00]' : 'text-slate-700'}`}>{u.points || 0}</span>
                          <Star className={`w-5 h-5 ${i < 3 || userData?.uid === u.id ? 'fill-[#F59E0B] text-[#F59E0B] drop-shadow-sm' : 'fill-slate-300 text-slate-300'}`} />
                        </div>
                     </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Banner */}
        <div className="bg-[#f8f9fe] p-5 md:p-6 border-t border-slate-100 flex items-center justify-between rounded-b-[24px]">
           <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shadow-sm">
                 <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="font-bengali text-slate-700 font-medium text-[15px]">নিয়মিত পড়াশোনা করুন, এগিয়ে থাকুন সবার থেকে! 🎉</span>
           </div>
           <div className="hidden sm:flex shrink-0">
             <div className="w-12 h-12 relative flex items-center justify-center">
                 <div className="absolute inset-0 bg-amber-100 rounded-full scale-110 opacity-70 blur-md"></div>
                 <Trophy className="w-8 h-8 text-amber-500 relative z-10 fill-amber-400" />
             </div>
           </div>
        </div>
      </div>

    </div>
  );
}
