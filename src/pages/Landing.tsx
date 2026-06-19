import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Landing() {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && minTimePassed) {
      if (user) {
        if (userData?.class) {
          navigate("/dashboard");
        } else if (userData) {
          navigate("/onboarding");
        }
      } else {
        navigate("/auth");
      }
    }
  }, [user, userData, loading, minTimePassed, navigate]);

  return (
    <div className="min-h-screen bg-card flex flex-col items-center justify-center font-sans selection:bg-secondary/30 relative">
      <Link to="/auth" className="flex flex-col items-center justify-center group cursor-pointer z-10 w-full h-full absolute inset-0">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center justify-center mb-8"
        >
          {/* Logo Box */}
          <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] bg-card rounded-[40px] sm:rounded-[48px] flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] mb-6 sm:mb-8 group-hover:scale-105 transition-transform duration-300 border border-slate-50 relative overflow-hidden">
             <span className="font-bengali font-extrabold text-[42px] sm:text-[52px] tracking-tight">
               <span className="text-[#0F2744]">শিক্ষা</span>
               <span className="text-[#ff9800]">ঙ্গন</span>
             </span>
          </div>

          {/* Text below Logo */}
          <div className="overflow-hidden">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              <span className="font-['Caveat'] text-[64px] sm:text-[76px] font-bold tracking-tight">
                <span className="text-[#0F2744]">Shikkha</span>
                <span className="text-[#ff9800]">ngon</span>
              </span>
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
