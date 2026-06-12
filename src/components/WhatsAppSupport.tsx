import { MessageCircleMore } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useLocation } from 'react-router-dom';

export default function WhatsAppSupport() {
  const location = useLocation();
  const allowedPaths = ['/dashboard', '/subscription', '/', '/home'];
  if (!allowedPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <div className='fixed bottom-[88px] sm:bottom-24 right-5 sm:right-6 z-[90] flex items-center gap-3'>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className='hidden sm:block px-3 py-1.5 bg-white border border-slate-100 text-[#0F2744] text-[11px] font-bengali font-bold tracking-wide rounded-xl shadow-sm whitespace-nowrap pointer-events-none'
        >
          যেকোনো দরকারে
        </motion.div>
        <motion.a
          transition={{ scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' } }}
          href='https://wa.me/8801345425873' 
          target='_blank'
          rel='noopener noreferrer'
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [1, 1.1, 1], opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className='flex shadow-[0_8px_30px_rgba(15,39,68,0.3)] bg-primary hover:bg-primary/90 rounded-full p-3 items-center justify-center relative group transition-all text-white border-2 border-white'
        >
          <MessageCircleMore strokeWidth={2.5} className='w-6 h-6 sm:w-7 sm:h-7' />
          <span className='sm:hidden absolute right-[calc(100%+12px)] px-3 py-1 bg-white text-primary text-[10px] sm:text-xs font-bengali font-bold tracking-wide rounded-lg shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'>
            যেকোনো দরকারে
          </span>
        </motion.a>
      </AnimatePresence>
    </div>
  );
}
