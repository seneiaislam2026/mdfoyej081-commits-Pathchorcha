import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, LayoutList, ChevronRight } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function SubjectPapers() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const subject = queryParams.get("subject") || "";
  const format = queryParams.get("format") || "";
  const classGroup = queryParams.get("classGroup") || "";

  const [papers, setPapers] = useState<{title: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, "questions"));
        if (subject) {
          q = query(q, where("subject", "==", subject));
        }
        
        // Note: filtering by is_cq on the client if no index exists, but ideally we should query it if we can.
        // We will fetch all and group by title because we want unique titles.
        const snap = await getDocs(q);
        
        let groups: Record<string, number> = {};
        
        snap.forEach(doc => {
          const data = doc.data();
          let is_cq = data.is_cq === true;
          let is_k_vandar = data.is_k_vandar === true;
          let is_kh_vandar = data.is_kh_vandar === true;
          
          if (format === "MCQ" && is_cq) return;
          if (format === "CQ" && (!is_cq || is_k_vandar || is_kh_vandar)) return;
          if (format === "KaBhandar" && !is_k_vandar) return;
          if (format === "KhaBhandar" && !is_kh_vandar) return;
          
          const t = data.title || "Uncategorized";
          if (!groups[t]) groups[t] = 0;
          groups[t]++;
        });

        // Convert to array
        const results = Object.keys(groups).map(title => ({
          title,
          count: groups[title]
        }));
        
        results.sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
        
        setPapers(results);
      } catch (err) {
        console.error("Error fetching papers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, [subject, format, classGroup]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 border-b border-slate-100 shadow-sm px-4 py-3 flex items-center justify-center">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute left-4 w-10 h-10 bg-slate-50 hover:bg-slate-100 flex items-center justify-center rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
        </button>
        <div className="text-center">
          <h1 className="font-bengali font-bold text-lg text-slate-800">{subject}</h1>
          <p className="font-bengali text-xs text-slate-500">{format === 'MCQ' ? 'বহুনির্বাচনি প্রশ্ন' : format === 'CQ' ? 'সৃজনশীল প্রশ্ন' : 'প্রশ্নব্যাংক'}</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="font-bengali mt-4 text-slate-500 font-medium">লোড হচ্ছে...</p>
          </div>
        ) : papers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <LayoutList className="w-16 h-16 text-slate-300 mb-4" strokeWidth={1} />
            <h3 className="font-bengali text-lg font-bold text-slate-700 mb-1">কোনো প্রশ্ন পাওয়া যায়নি</h3>
            <p className="font-bengali text-sm text-slate-500">অ্যাডমিন প্যানেল থেকে প্রশ্ন যুক্ত করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {papers.map((p, i) => (
              <button
                key={i}
                onClick={() => navigate(`/paper?title=${encodeURIComponent(p.title)}&subject=${encodeURIComponent(subject)}&format=${format}&classGroup=${encodeURIComponent(classGroup)}`)}
                className="bg-white rounded-2xl p-4 sm:p-5 flex items-center gap-4 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <LayoutList className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bengali font-bold text-[#1e293b] text-base sm:text-lg w-full truncate">{p.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-2 py-0.5 rounded-md">
                      {p.count} প্রশ্ন
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
