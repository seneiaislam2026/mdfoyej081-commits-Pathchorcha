import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Trophy, Activity, Target, MessageSquare, CheckCircle2, PlayCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../lib/AuthContext";
import { useEffect, useState } from "react";
import { collection, getDocs, query, limit, orderBy, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Landing() {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();
  const [publicExams, setPublicExams] = useState<any[]>([]);

  useEffect(() => {
    async function fetchExams() {
      try {
        const q = query(collection(db, "public_exams"), where("active", "==", true), orderBy("createdAt", "desc"), limit(4));
        const snap = await getDocs(q);
        setPublicExams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Failed to load public exams", err);
      }
    }
    fetchExams();
  }, []);

  useEffect(() => {
    if (!loading && user) {
      if (userData?.class) {
        navigate("/dashboard");
      } else if (userData) { // Ensure userData is loaded before redirecting to onboarding
        navigate("/onboarding");
      }
    }
  }, [user, userData, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center justify-center">
          <img src="/logo.png" alt="শিক্ষাঙ্গন" className="w-[180px] sm:w-[220px] object-contain drop-shadow-sm mix-blend-multiply" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-secondary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bengali font-bold text-[32px] tracking-tight">
              <span className="text-primary">শিক্ষা</span>
              <span className="text-secondary">ঙ্গন</span>
            </span>
          </Link>
          <Link to="/auth">
            <Button className="bg-primary hover:bg-primary/90 text-white font-bengali font-medium px-6 py-2 h-11 rounded-full shadow-md shadow-primary/20">
              লগইন / রেজিস্ট্রেশন
            </Button>
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4 md:px-8 max-w-[1200px] mx-auto overflow-hidden">
        {/* Dashboard Preview Section (Bento Grid) */}
        <section className="relative mt-4">
           {/* Background Glow */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"></div>
           
           <motion.div 
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.4 }}
             className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 relative z-10"
           >
             {/* Center Large Panel: Mock Test / Question Bank Preview */}
             <div className="md:col-span-8 bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
                
                <div className="flex justify-between items-center mb-8 relative z-10">
                   <div>
                     <h3 className="text-xl font-bengali font-bold text-slate-800">মডেল টেস্ট - বাংলা ১ম পত্র</h3>
                     <p className="font-bengali text-slate-500 text-sm mt-1">এইচএসসি ২০২৬ • সময়: ২৫ মিনিট</p>
                   </div>
                   <div className="bg-secondary/15 text-primary px-4 py-2 rounded-full font-mono font-bold text-sm">
                     24:59
                   </div>
                </div>

                <div className="space-y-4 relative z-10">
                   <h4 className="text-lg font-bengali font-semibold text-slate-900 pb-2">
                     'সোনার তরী' কবিতাটি কোন কাব্যগ্রন্থে সংকলিত?
                   </h4>
                   <div className="grid grid-cols-2 gap-2 sm:gap-3">
                     <div className="p-3 sm:p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 sm:gap-3">
                       <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center font-bold text-slate-500">A</div>
                       <span className="font-bengali truncate">বলাকা</span>
                     </div>
                     <div className="p-3 sm:p-4 pr-2 sm:pr-4 rounded-xl border-2 border-secondary bg-[#FFFDF5] flex items-center gap-2 sm:gap-3 shadow-sm shadow-secondary/10 overflow-hidden">
                       <div className="shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center font-bold text-primary">C</div>
                       <span className="font-bengali font-bold text-primary truncate">সোনার তরী</span>
                       <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 ml-auto" />
                     </div>
                   </div>
                </div>
             </div>

             {/* Top Right: Performance Analytics */}
             <div className="md:col-span-4 bg-primary text-white rounded-[32px] p-8 shadow-xl shadow-primary/10 overflow-hidden relative">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl font-bengali"></div>
                <h3 className="font-bengali font-bold text-lg mb-6 opacity-90">আপনার অগ্রগতি</h3>
                <div className="flex items-end justify-between mb-2">
                  <div className="text-5xl font-bold font-mono">85<span className="text-2xl text-white/70">%</span></div>
                  <div className="text-secondary font-bengali font-medium flex items-center mb-1">
                    <Activity className="w-4 h-4 mr-1" /> অগ্রগতি
                  </div>
                </div>
                <p className="text-white/60 font-bengali text-sm mb-6">সর্বশেষ ৭ দিনের পরিসংখ্যান</p>
                
                {/* Minimal Bar Chart visualization */}
                <div className="flex items-end gap-2 h-20 w-full mt-auto">
                  {[40, 65, 45, 80, 55, 90, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/20 rounded-t-sm hover:bg-secondary/80 transition-colors" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
             </div>

             {/* Bottom Left: Streak */}
             <div className="md:col-span-4 bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0 w-fit">
                  <span className="text-3xl p-3">🔥</span>
                </div>
                <div>
                  <p className="text-sm font-bengali text-slate-500 mb-1">টানা অনুশীলন</p>
                  <h4 className="text-3xl font-bold text-slate-800">৭ দিন</h4>
                  <p className="text-xs text-slate-400 font-bengali mt-2">প্রতিদিন অনুশীলন সম্পন্ন করে সাফল্যের ধারা বজায় রাখুন।</p>
                </div>
             </div>

             {/* Bottom Middle: AI Assistant */}
             <div className="md:col-span-4 bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-indigo-100/50 flex flex-col justify-between">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mt-1 shrink-0 shadow-md shadow-primary/20">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 relative">
                    <p className="font-bengali text-sm text-slate-700 leading-relaxed font-medium">
                      আমি তোমার AI টিউটর! গণিতের কোনো সমস্যা বুঝতে অসুবিধা হলে আমাকে জিজ্ঞেস করতে পারো।
                    </p>
                  </div>
                </div>
                <div className="relative mt-auto">
                  <input type="text" disabled placeholder="Type a message..." className="w-full bg-white border border-slate-200 rounded-full py-3 px-5 pr-12 text-sm shadow-sm" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
             </div>

             {/* Bottom Right: Accuracy Stats */}
             <div className="md:col-span-4 bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
               <h3 className="font-bengali font-bold text-slate-800 mb-6">বিষয়ভিত্তিক দক্ষতা</h3>
               <div className="space-y-4">
                 <div>
                   <div className="flex justify-between text-sm mb-1.5"><span className="font-bengali font-medium">বাংলা</span><span className="font-mono font-bold text-primary">85%</span></div>
                   <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="bg-blue-500 h-full rounded-full" style={{ width: '85%' }}></div></div>
                 </div>
                 <div>
                   <div className="flex justify-between text-sm mb-1.5"><span className="font-bengali font-medium">ইংরেজি</span><span className="font-mono font-bold text-primary">70%</span></div>
                   <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="bg-indigo-500 h-full rounded-full" style={{ width: '70%' }}></div></div>
                 </div>
                 <div>
                   <div className="flex justify-between text-sm mb-1.5"><span className="font-bengali font-medium">পদার্থবিজ্ঞান</span><span className="font-mono font-bold text-primary">92%</span></div>
                   <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden"><div className="bg-secondary h-full rounded-full" style={{ width: '92%' }}></div></div>
                 </div>
               </div>
             </div>
           </motion.div>
        </section>

        {publicExams.length > 0 && (
          <section className="mt-16 mb-8 max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bengali font-bold text-slate-800 mb-6 text-center">চলমান পাবলিক পরীক্ষা</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publicExams.map(exam => (
                 <div key={exam.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all text-left">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-slate-800 leading-tight pr-2">{exam.title}</h3>
                    <span className={`px-2 py-1 rounded-md text-[10px] whitespace-nowrap font-bold shrink-0 ${exam.type === 'live_model_test' ? 'bg-amber-50 text-amber-600' : exam.type === 'model_test' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                      {exam.type === 'live_model_test' ? 'লাইভ টেস্ট' : exam.type === 'model_test' ? 'মডেল টেস্ট' : 'পাবলিক এক্সাম'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mb-5 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md text-xs font-bengali">
                      <Target className="w-3.5 h-3.5" />
                      {exam.targetClass || "সকল ক্লাস"}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md text-xs font-bengali">
                      <Clock className="w-3.5 h-3.5" />
                      {exam.duration} মিনিট
                    </span>
                  </div>

                  <Link 
                    to="/auth"
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bengali font-bold py-2.5 rounded-xl transition-colors"
                  >
                    <PlayCircle className="w-4 h-4" />
                    অংশগ্রহন করতে লগইন করুন
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 text-center">
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="pt-6 pb-10"
          >
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/95 text-white font-bengali font-bold text-lg md:text-xl px-8 py-7 h-auto rounded-full shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                লগইন / রেজিস্ট্রেশন <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>

    </div>
  );
}
