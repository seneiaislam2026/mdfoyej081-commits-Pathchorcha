import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const cards = [
    {
      title: "নোটস",
      description: "বিষয়ভিত্তিক সাজানো\nগুরুত্বপূর্ণ নোটস",
      link: "/bank",
      bgContent: "bg-[#f4fbf4]",
      borderColor: "border-[#bce5c0]",
      textColor: "text-[#187829]",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Base shadow layer */}
            <div className="absolute inset-0 bg-[#358742]/10 translate-y-3 rounded-[20px] blur-md"></div>
            {/* Emulated 3D Book */}
            <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-[#4db05c] to-[#298a37] rounded-lg flex items-center justify-center shadow-lg border-b-[5px] border-[#1b5e20] before:absolute before:inset-y-[6px] before:inset-x-3 before:bg-card before:rounded-sm before:opacity-95">
                <div className="w-[14px] h-[3px] bg-[#e0e0e0] absolute top-[28px] left-[18px] rounded-full opacity-100"></div>
                <div className="w-[18px] h-[3px] bg-[#e0e0e0] absolute top-[40px] left-[18px] rounded-full opacity-100"></div>
                <div className="w-[14px] h-[3px] bg-[#e0e0e0] absolute top-[52px] left-[18px] rounded-full opacity-100"></div>
                
                <div className="w-[18px] h-[3px] bg-[#e0e0e0] absolute top-[28px] right-[18px] rounded-full opacity-100"></div>
                <div className="w-[14px] h-[3px] bg-[#e0e0e0] absolute top-[40px] right-[18px] rounded-full opacity-100"></div>
                <div className="w-[18px] h-[3px] bg-[#e0e0e0] absolute top-[52px] right-[18px] rounded-full opacity-100"></div>
                
                {/* Book center fold */}
                <div className="w-[2px] h-[75%] bg-gradient-to-r from-gray-200 to-gray-300 absolute left-1/2 -translate-x-1/2 z-20 shadow-sm rounded-full"></div>
            </div>
        </div>
      )
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
                <div className="w-[30px] h-[3px] bg-card/70 rounded-full mb-2 flex items-center justify-start"><div className="w-[6px] h-[6px] bg-[#0c2d73] rounded-full absolute -left-3 border-2 border-white"></div></div>
                <div className="w-[30px] h-[3px] bg-card/70 rounded-full mb-2 flex items-center justify-start"><div className="w-[6px] h-[6px] bg-[#0c2d73] rounded-full absolute -left-3 border-2 border-white"></div></div>
                <div className="w-[30px] h-[3px] bg-card/70 rounded-full mb-2 flex items-center justify-start"><div className="w-[6px] h-[6px] bg-[#0c2d73] rounded-full absolute -left-3 border-2 border-white"></div></div>
                {/* Floating check mark */}
                <div className="absolute -bottom-2 -right-3 w-10 h-10 bg-[#3b7cf6] border-[3px] border-white rounded-full flex items-center justify-center shadow-md">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
            </div>
        </div>
      )
    },
    {
      title: "এক্সাম",
      description: "মক টেস্ট দিয়ে\nপ্রস্তুতি যাচাই করুন",
      link: "/exam",
      bgContent: "bg-[#fff8f0]",
      borderColor: "border-[#fce3c7]",
      textColor: "text-[#e86a10]",
      icon: (
        <div className="relative w-28 h-28 flex items-center justify-center pr-2">
            <div className="absolute inset-0 bg-[#e86a10]/10 translate-y-3 rounded-full blur-md"></div>
            <div className="relative z-10 w-20 h-20 bg-card rounded-full border-[5px] border-[#f8a846] shadow-lg flex items-center justify-center text-orange-900 border-b-[#d17417] border-b-[8px]">
                {/* Clock face */}
                <div className="w-[3px] h-[22px] bg-[#333] rounded-full absolute bottom-1/2 left-1/2 transform -translate-x-1/2 origin-bottom shadow-sm"></div>
                <div className="w-[3px] h-[14px] bg-[#333] rounded-full absolute bottom-1/2 left-1/2 transform -translate-x-1/2 rotate-90 origin-bottom shadow-sm"></div>
                <div className="w-[6px] h-[6px] bg-[#d17417] rounded-full absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-20"></div>
                {/* Ticks */}
                <div className="w-[2px] h-[4px] bg-orange-300 absolute top-1 left-1/2 -translate-x-1/2"></div>
                <div className="w-[2px] h-[4px] bg-orange-300 absolute bottom-1 left-1/2 -translate-x-1/2"></div>
                <div className="h-[2px] w-[4px] bg-orange-300 absolute right-1 top-1/2 -translate-y-1/2"></div>
                <div className="h-[2px] w-[4px] bg-orange-300 absolute left-1 top-1/2 -translate-y-1/2"></div>
            </div>
            {/* Floating pencil/pen */}
            <div className="absolute -right-2 top-4 w-[14px] h-[58px] bg-[#ffb74d] rounded-sm transform rotate-[30deg] shadow-lg border-b-[4px] border-[#f57c00] flex flex-col justify-end items-center pb-[0px] z-20">
               <div className="w-full h-[6px] bg-[#ffe0b2] absolute top-2 rounded-sm"></div>
               <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-t-[14px] border-l-transparent border-r-transparent border-t-[#ffe0b2] transform translate-y-[14px] flex justify-center">
                  <div className="w-[4px] h-[4px] bg-[#555] rounded-full absolute -top-[2px] -translate-x-1/2"></div>
               </div>
            </div>
        </div>
      )
    },
  ];

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 mt-8 space-y-12 pb-10">
      
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-[40px] md:text-[46px] font-bengali font-bold text-[#111827] mb-2 tracking-tight">
            স্বাগতম!
          </h1>
          <p className="text-[19px] font-bengali font-medium text-slate-500 tracking-wide">
            আজ কি শিখতে ইচ্ছুক?
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#fff6ec] border border-[#f5d9bd] px-8 py-[14px] rounded-xl shadow-sm"
        >
          <span className="text-[17px] font-bengali font-semibold text-foreground tracking-wide block pt-[2px]">
            লক্ষ্য স্থির করো, নিয়মিত চর্চা করো, সাফল্য আসবেই!
          </span>
        </motion.div>
      </section>

      {/* Cards Row */}
      <section className="flex overflow-x-auto md:grid md:grid-cols-3 gap-5 md:gap-8 snap-x pb-6 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {cards.map((card, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + (idx * 0.1) }}
            className="w-[85vw] max-w-[320px] md:w-auto md:max-w-none md:min-w-0 snap-center shrink-0"
          >
            <Link to={card.link} className="block h-full group">
              <div className={`h-full ${card.bgContent} border-[2px] ${card.borderColor} rounded-[32px] p-8 pb-10 flex flex-col items-center text-center transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] relative overflow-hidden`}>
                
                {/* 3D Icon Container */}
                <div className="mb-6 z-10 transition-transform duration-500 group-hover:scale-105">
                  {card.icon}
                </div>
                
                <h3 className={`text-[32px] font-bengali font-bold mb-4 ${card.textColor} tracking-wide z-10`}>
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

      {/* Bottom Banner */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-14"
      >
        <div className="bg-[#001452] rounded-[30px] p-[10px] pl-6 md:pl-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          
          <div className="flex items-center gap-4 py-4 md:py-0">
            <Star className="w-[36px] h-[36px] text-[#FFC107] fill-[#FFC107]" />
            <span className="text-white font-bengali font-medium text-[22px] tracking-wide pt-1">
              নিয়মিত চর্চা, নিশ্চিত সাফল্য !
            </span>
          </div>
          
          <Link to="/exam" className="w-full md:w-auto h-full pr-[10px]">
            <button className="w-full md:w-auto h-[60px] bg-card text-[#001452] font-bengali font-bold text-[19px] px-10 rounded-full hover:bg-muted transition-all shadow-md active:scale-95">
              আজই শুরু করুন
            </button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
