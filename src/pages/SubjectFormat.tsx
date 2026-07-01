import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, LayoutList, PenTool, BookOpen } from "lucide-react";

export default function SubjectFormat() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const subject = queryParams.get("subject") || "Unknown Subject";
  const classGroup = queryParams.get("classGroup") || "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formats = [
    { id: 'MCQ', label: 'MCQ', icon: LayoutList, bg: "bg-blue-50/50", border: "border-blue-100", text: "text-blue-700", iconCol: "text-blue-600", desc: "বহুনির্বাচনি প্রশ্ন" },
    { id: 'CQ', label: 'CQ', icon: PenTool, bg: "bg-emerald-50/50", border: "border-emerald-100", text: "text-emerald-700", iconCol: "text-emerald-600", desc: "সৃজনশীল প্রশ্ন" },
    { id: 'KaBhandar', label: "'ক' ভান্ডার", icon: BookOpen, bg: "bg-orange-50/50", border: "border-orange-100", text: "text-orange-700", iconCol: "text-orange-600", desc: "জ্ঞানমূলক প্রশ্ন" },
    { id: 'KhaBhandar', label: "'খ' ভান্ডার", icon: BookOpen, bg: "bg-purple-50/50", border: "border-purple-100", text: "text-purple-700", iconCol: "text-purple-600", desc: "অনুধাবনমূলক প্রশ্ন" }
  ];

  return (
    <div className="min-h-screen bg-background font-sans pb-24">
      {/* Header */}
      <div className="bg-card sticky top-0 z-50 border-b border-slate-100 shadow-sm px-4 py-3 flex items-center justify-center">
        <button 
          onClick={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate("/bank");
            }
          }} 
          className="absolute left-4 w-10 h-10 bg-muted hover:bg-slate-100 flex items-center justify-center rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
        </button>
        <div className="text-center">
          <h1 className="font-bengali font-bold text-lg text-foreground">{subject}</h1>
          <p className="font-bengali text-xs text-slate-500">ফরম্যাট নির্বাচন করুন</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {formats.map((format, idx) => (
            <motion.button
              key={format.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => {
                navigate(`/subject-papers?subject=${encodeURIComponent(subject)}&format=${format.id}&classGroup=${encodeURIComponent(classGroup)}`);
              }}
              className={`w-full relative overflow-hidden rounded-2xl border ${format.border} ${format.bg} p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98] text-left group`}
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-card shadow-sm flex items-center justify-center shrink-0 border ${format.border} group-hover:scale-105 transition-transform`}>
                <format.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${format.iconCol}`} strokeWidth={2} />
              </div>
              <div>
                <h3 className={`font-bengali font-bold text-lg sm:text-xl ${format.text}`}>{format.label}</h3>
                <p className="font-bengali text-[13px] sm:text-sm text-muted-foreground mt-0.5">{format.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
