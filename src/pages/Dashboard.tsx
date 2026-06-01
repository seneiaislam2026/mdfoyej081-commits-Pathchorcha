import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  Target,
  CheckCircle2,
  TrendingUp,
  Trophy,
  ArrowRight,
  BookOpen,
  Atom,
  Calculator,
  MessageCircleQuestion,
  HelpCircle,
  Code2,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../lib/AuthContext";

export default function Dashboard() {
  const quickStats = [
    {
      title: "মোট প্রশ্ন সমাধান",
      value: "০",
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "নির্ভুলতা (Accuracy)",
      value: "০%",
      icon: <Target className="w-5 h-5" />,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      title: "টানা চর্চা (Streak)",
      value: "০ দিন",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      title: "র‍্যাঙ্কিং",
      value: "-",
      icon: <Trophy className="w-5 h-5" />,
      color: "text-secondary",
      bg: "bg-yellow-50",
    },
  ];

  const { userData } = useAuth();

  const cards = [
    {
      title: "নোটস",
      description: "বিষয়ভিত্তিক সাজানো\nগুরুত্বপূর্ণ নোটস",
      link: "/notes",
      bgContent: "bg-[#f4fbf4]",
      borderColor: "border-[#bce5c0]",
      textColor: "text-[#187829]",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#358742]/10 translate-y-3 rounded-[20px] blur-md"></div>
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-[#4db05c] to-[#298a37] rounded-lg flex items-center justify-center shadow-lg border-b-[5px] border-[#1b5e20] before:absolute before:inset-y-[6px] before:inset-x-3 before:bg-white before:rounded-sm before:opacity-95">
            <div className="w-[14px] h-[3px] bg-[#e0e0e0] absolute top-[28px] left-[18px] rounded-full opacity-100"></div>
            <div className="w-[18px] h-[3px] bg-[#e0e0e0] absolute top-[40px] left-[18px] rounded-full opacity-100"></div>
            <div className="w-[14px] h-[3px] bg-[#e0e0e0] absolute top-[52px] left-[18px] rounded-full opacity-100"></div>
            <div className="w-[18px] h-[3px] bg-[#e0e0e0] absolute top-[28px] right-[18px] rounded-full opacity-100"></div>
            <div className="w-[14px] h-[3px] bg-[#e0e0e0] absolute top-[40px] right-[18px] rounded-full opacity-100"></div>
            <div className="w-[18px] h-[3px] bg-[#e0e0e0] absolute top-[52px] right-[18px] rounded-full opacity-100"></div>
            <div className="w-[2px] h-[75%] bg-gradient-to-r from-gray-200 to-gray-300 absolute left-1/2 -translate-x-1/2 z-20 shadow-sm rounded-full"></div>
          </div>
        </div>
      ),
    },
    {
      title: "প্রশ্ন ব্যাংক",
      description: "হাজারো প্রশ্ন\nঅনুশীলন করুন",
      link: "/bank",
      bgContent: "bg-[#f5f8ff]",
      borderColor: "border-[#c4d4f8]",
      textColor: "text-[#1b4db3]",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#1b4db3]/10 translate-y-3 rounded-[20px] blur-md"></div>
          <div className="relative z-10 w-16 h-20 bg-gradient-to-br from-[#3b7cf6] to-[#1244ac] rounded-[10px] shadow-lg border-b-[5px] border-[#0c2d73] flex flex-col items-center">
            <div className="w-[30px] h-[10px] bg-[#f0f4ff] rounded-b-md mb-2 shadow-sm relative z-20 border-b border-[#c4d4f8]"></div>
            <div className="w-[30px] h-[3px] bg-white/70 rounded-full mb-2 flex items-center justify-start">
              <div className="w-[6px] h-[6px] bg-[#0c2d73] rounded-full absolute -left-3 border-2 border-white"></div>
            </div>
            <div className="w-[30px] h-[3px] bg-white/70 rounded-full mb-2 flex items-center justify-start">
              <div className="w-[6px] h-[6px] bg-[#0c2d73] rounded-full absolute -left-3 border-2 border-white"></div>
            </div>
            <div className="w-[30px] h-[3px] bg-white/70 rounded-full mb-2 flex items-center justify-start">
              <div className="w-[6px] h-[6px] bg-[#0c2d73] rounded-full absolute -left-3 border-2 border-white"></div>
            </div>
            <div className="absolute -bottom-2 -right-3 w-10 h-10 bg-[#3b7cf6] border-[3px] border-white rounded-full flex items-center justify-center shadow-md">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "মক টেস্ট",
      description: "অধ্যায়ভিত্তিক\nমক টেস্ট দিন",
      link: "/exam?type=mock",
      bgContent: "bg-[#fdf4ff]",
      borderColor: "border-[#f0abfc]",
      textColor: "text-[#c026d3]",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#c026d3]/20 translate-y-3 rounded-[24px] blur-md"></div>
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-[#e879f9] to-[#c026d3] rounded-[20px] shadow-lg border-b-[5px] border-[#86198f] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <div className="absolute top-2 right-2 w-3 h-3 bg-white/40 rounded-full"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 bg-white/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-[12px] shadow-inner flex flex-col items-center justify-center gap-1.5 p-2">
              <div className="flex w-full items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 shrink-0"></div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full"></div>
              </div>
              <div className="flex w-full items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-purple-500 bg-purple-100 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "মডেল টেস্ট",
      description: "মডেল টেস্ট দিয়ে\nপ্রস্তুতি যাচাই করুন",
      link: "/exam?type=model",
      bgContent: "bg-[#fff8f0]",
      borderColor: "border-[#fce3c7]",
      textColor: "text-[#e86a10]",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#e86a10]/20 translate-y-3 rounded-[24px] blur-md"></div>
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-[#ffa726] to-[#e65100] rounded-[20px] shadow-lg border-b-[5px] border-[#bf360c] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <div className="absolute top-2 right-2 w-3 h-3 bg-white/40 rounded-full"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 bg-white/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-[12px] shadow-inner flex shrink-0 items-center justify-center overflow-hidden">
              <div className="w-full flex flex-col gap-1.5 p-2 px-3">
                <div className="flex items-center gap-1.5 border-b border-orange-100 pb-1.5">
                  <span className="w-2.5 h-2.5 bg-orange-400 rounded-full flex-shrink-0"></span>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full"></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-slate-200 rounded-full flex-shrink-0"></span>
                  <div className="h-1.5 w-8 bg-slate-200 rounded-full"></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-slate-200 rounded-full flex-shrink-0"></span>
                  <div className="h-1.5 w-6 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-[#ffb74d] to-[#ef6c00] rounded-full border-4 border-white shadow-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "ডাউট সলভিং",
      description: "এআই টিউটর ব্যবহার করে\nযেকোনো প্রশ্ন সমাধান",
      link: "/tutor",
      bgContent: "bg-[#f0fdff]",
      borderColor: "border-[#bbf7d0]",
      textColor: "text-[#0ea5e9]",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#0ea5e9]/20 translate-y-3 rounded-[24px] blur-md"></div>
          <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-[#38bdf8] to-[#0284c7] rounded-[20px] shadow-lg border-b-[5px] border-[#0369a1] flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-300">
             <div className="absolute top-2 right-2 w-3 h-3 bg-white/40 rounded-full"></div>
             <div className="absolute bottom-3 left-3 w-4 h-4 bg-white/20 rounded-full"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-[12px] shadow-inner flex shrink-0 items-center justify-center overflow-hidden">
                <BrainCircuit className="w-8 h-8 text-[#0284c7]" />
             </div>
             <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-[#7dd3fc] to-[#0284c7] rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                <MessageCircleQuestion className="w-5 h-5 text-white" />
             </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-8 pb-10 mt-1 md:mt-4">
      {/* Pro Banner for Non-Pro Users */}
      {!userData?.isPro && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#fff4e6] to-[#ffecb3] border border-[#ffd54f] p-5 sm:p-6 rounded-[24px] shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <Crown className="w-6 h-6 text-[#ffa726]" />
            </div>
            <div>
              <h3 className="font-bengali font-bold text-slate-800 text-lg sm:text-xl">
                প্রো মেম্বারশিপে আপগ্রেড করুন!
              </h3>
              <p className="font-bengali text-slate-700 text-sm sm:text-base mt-1">
                সব প্রশ্নের বিস্তারিত ব্যাখ্যা ও আনলিমিটেড (Unlimited) মক টেস্ট
                দিতে আজই প্রো মেম্বার হোন।
              </p>
            </div>
          </div>
          <Link
            to="/subscription"
            className="w-full sm:w-auto shrink-0 mt-2 sm:mt-0"
          >
            <Button className="w-full bg-gradient-to-r from-[#ffa726] to-[#e65100] hover:from-[#f57c00] hover:to-[#d84315] text-white rounded-full font-bengali font-bold shadow-md shadow-orange-500/20 px-6 h-12">
              আপগ্রেড করুন
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Main Feature Cards */}
      <section className="flex overflow-x-auto lg:grid lg:grid-cols-3 xl:grid-cols-5 md:grid-cols-2 gap-5 md:gap-8 snap-x pb-6 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
            className="w-[85vw] max-w-[320px] md:w-auto md:max-w-none md:min-w-0 snap-center shrink-0"
          >
            <Link to={card.link} className="block h-full group">
              <div
                className={`h-full ${card.bgContent} border-[2px] ${card.borderColor} rounded-[32px] p-8 pb-10 flex flex-col items-center text-center transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] relative overflow-hidden`}
              >
                {/* 3D Icon Container */}
                <div className="mb-6 z-10 transition-transform duration-500 group-hover:scale-105">
                  {card.icon}
                </div>

                <h3
                  className={`text-[32px] font-bengali font-bold mb-4 ${card.textColor} tracking-wide z-10`}
                >
                  {card.title}
                </h3>

                <div className="w-full h-[1px] bg-black/5 rounded-full mb-5 z-10"></div>

                <p className="text-[17px] font-bengali font-medium text-[#4b5563] whitespace-pre-line leading-[1.7] z-10 tracking-wide">
                  {card.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div
              className={`w-10 h-10 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 font-mono mb-0.5">
                {stat.value}
              </p>
              <p className="text-xs font-bengali font-medium text-slate-500">
                {stat.title}
              </p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* AI Assistant Banner */}
      <section>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-primary to-[#18398a] rounded-[32px] p-6 md:p-8 shadow-lg shadow-primary/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

          <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
              <BrainCircuit className="w-8 h-8 text-secondary" />
            </div>
            <div>
              <div className="bg-white text-slate-800 text-base font-bengali font-bold py-2 px-5 rounded-2xl rounded-tl-sm shadow-md inline-block">
                আজ কী শিখতে চাও?
              </div>
              <p className="text-white/80 font-bengali text-sm mt-1.5 ml-1">
                AI টিউটরের সাহায্যে তোমার পড়া আরও সহজ করো
              </p>
            </div>
          </div>

          <div className="flex justify-start w-full md:w-auto gap-3 relative z-10 shrink-0">
            <Link to="/tutor" className="flex-1 md:flex-none">
              <Button
                size="lg"
                variant="secondary"
                className="w-full md:w-auto font-bengali bg-white text-primary hover:bg-slate-50 rounded-xl shadow-sm border-0 font-bold px-6"
              >
                <HelpCircle className="w-4 h-4 mr-2" /> AI টিউটর
              </Button>
            </Link>
            <Link to="/tutor" className="flex-1 md:flex-none">
              <Button
                size="lg"
                className="w-full md:w-auto font-bengali bg-secondary hover:bg-secondary/90 text-primary rounded-xl shadow-sm font-bold px-6"
              >
                <MessageCircleQuestion className="w-4 h-4 mr-2" /> প্রশ্ন করো
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Bottom Main Content */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Challenge */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[220px] relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-yellow-50 to-transparent pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 h-full">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider mb-3">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>{" "}
                Daily Challenge
              </div>
              <h3 className="text-2xl font-bengali font-bold text-slate-900 mb-2 leading-tight">
                {userData?.group === "মানবিক"
                  ? "এইচএসসি ইতিহাস"
                  : userData?.group === "বাণিজ্য"
                  ? "এইচএসসি হিসাববিজ্ঞান"
                  : "এইচএসসি পদার্থবিজ্ঞান"}{" "}
                <br />
                {userData?.group === "মানবিক"
                  ? "অধ্যায় ২: ফরাসি বিপ্লব মডেল টেস্ট"
                  : userData?.group === "বাণিজ্য"
                  ? "অধ্যায় ২: লেনদেন মডেল টেস্ট"
                  : "অধ্যায় ৩: গতিবিদ্যা মডেল টেস্ট"}
              </h3>
              <p className="font-bengali text-slate-500 text-sm mb-6 max-w-sm">
                ২৫টি গুরুত্বপূর্ণ বহুনির্বাচনি প্রশ্ন। সময়: ২০ মিনিট। নিজেকে
                যাচাই করো এখনই!
              </p>

              <Link to="/exam">
                <Button className="bg-primary hover:bg-primary/95 text-white font-bengali rounded-full px-6 h-11 shadow-md hover:shadow-lg transition-all active:scale-95">
                  শুরু করুন <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="hidden md:flex shrink-0 w-40 h-40 bg-white rounded-full border-[6px] border-slate-50 shadow-inner items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-secondary/30 animate-[spin_20s_linear_infinite]"></div>
              <Target className="w-16 h-16 text-secondary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Leaderboard Snippet */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bengali font-bold text-lg text-slate-800">
              শীর্ষ শিক্ষার্থী (আজ)
            </h3>
            <Link
              to="/leaderboard"
              className="text-xs text-primary font-bold hover:underline"
            >
              সব দেখুন
            </Link>
          </div>

          <div className="space-y-4 flex-1 flex flex-col items-center justify-center text-center text-slate-500">
            <p className="font-bengali text-sm bg-slate-50 p-4 rounded-xl w-full">
              আরও শিক্ষার্থী যোগ দিলে লিডারবোর্ড চালু হবে।
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
