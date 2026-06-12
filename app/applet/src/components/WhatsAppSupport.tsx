import { motion, AnimatePresence } from "framer-motion";

export default function WhatsAppSupport() {
  return (
    <div className="fixed bottom-[88px] sm:bottom-28 right-5 sm:right-8 z-[90] flex items-center gap-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="hidden sm:block px-4 py-2 bg-white border border-slate-100 text-[#0F2744] text-xs font-bengali font-bold tracking-wide rounded-2xl shadow-lg shadow-slate-200/50 whitespace-nowrap pointer-events-none relative"
        >
          যেকোনো দরকারে
          <div className="absolute top-1/2 -right-1.5 -mt-1.5 w-3 h-3 bg-white border-r border-t border-slate-100 rotate-45 transform"></div>
        </motion.div>
        
        <div className="relative group">
          {/* Animated ping effect */}
          <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-60"></div>
          <div className="absolute inset-[-4px] bg-[#25D366]/30 rounded-full animate-pulse"></div>
          
          <motion.a
            href="https://wa.me/8801345425873" 
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
            whileTap={{ scale: 0.95 }}
            className="flex shadow-[0_8px_30px_rgba(37,211,102,0.5)] bg-[#25D366] hover:bg-[#1EBE5A] rounded-full p-3 sm:p-3.5 items-center justify-center relative z-10 transition-colors border-2 border-white/50"
          >
            {/* WhatsApp / Message Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-7 h-7 sm:w-8 sm:h-8 fill-white drop-shadow-sm">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
            </svg>
            
            <span className="sm:hidden absolute right-[calc(100%+16px)] px-3 py-1.5 bg-white text-[#0F2744] text-[11px] font-bengali font-bold tracking-wide rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              যেকোনো দরকারে
            </span>
          </motion.a>
        </div>
      </AnimatePresence>
    </div>
  );
}
