import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Target, PlayCircle, Search } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function PublicExamsList() {
  const { userData, previewClass } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "public_exams"), where("active", "==", true), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setExams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Failed to load public exams", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const userClass = previewClass || userData?.class || "";
  
  const filtered = exams.filter(e => {
    // 1) Match search
    if (search && !e.title?.toLowerCase().includes(search.toLowerCase())) return false;
    
    // 2) Match class (Only show exams for user's class or "সকল ক্লাস")
    if (e.targetClass && e.targetClass !== "সকল ক্লাস" && e.targetClass !== userClass) return false;
    
    return true;
  });

  return (
    <div className="min-h-screen border-t bg-slate-50 font-bengali pb-20">
      <div className="bg-white sticky top-0 z-20 px-4 py-4 md:px-8 border-b border-slate-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 text-slate-600 rounded-full">
              <ArrowLeft className="w-5 h-5"/>
            </button>
            <h1 className="text-xl font-bold text-slate-800">পাবলিক এক্সাম ও লাইভ টেস্ট</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="পরীক্ষা খুঁজুন..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-lg">কোনো পরীক্ষা পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(exam => (
              <div key={exam.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-slate-800 leading-tight pr-2">{exam.title}</h3>
                  <span className={`px-2 py-1 rounded-md text-[10px] whitespace-nowrap font-bold shrink-0 ${exam.type === 'live_model_test' ? 'bg-amber-50 text-amber-600' : exam.type === 'model_test' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                    {exam.type === 'live_model_test' ? 'লাইভ টেস্ট' : exam.type === 'model_test' ? 'মডেল টেস্ট' : 'পাবলিক এক্সাম'}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mb-5 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md text-xs">
                    <Target className="w-3.5 h-3.5" />
                    {exam.targetClass || "সকল ক্লাস"}
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    {exam.duration} মিনিট
                  </span>
                </div>

                <Link 
                  to={`/public-exam/${exam.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-xl transition-colors"
                >
                  <PlayCircle className="w-4 h-4" />
                  শুরু করুন
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
