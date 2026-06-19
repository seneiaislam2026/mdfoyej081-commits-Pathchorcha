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
          {/* Logo */}
          <div className="group-hover:scale-105 transition-transform duration-300">
             <img src="https://i.ibb.co/5WR6skVX/file-000000004c047209a4e27202c54ddd8d-1.png" alt="Shikkangon Logo" className="w-[200px] sm:w-[280px] md:w-[320px] object-contain" />
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
