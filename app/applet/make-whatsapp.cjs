const fs = require('fs');

const content = `import { motion, AnimatePresence } from "framer-motion";

export default function WhatsAppSupport() {
  return (
    <div className="fixed bottom-[88px] sm:bottom-28 right-5 sm:right-8 z-[90] flex items-center gap-3">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="hidden sm:block px-3 py-1.5 bg-white border border-slate-100 text-[#0F2744] text-[11px] font-bengali font-bold tracking-wide rounded-xl shadow-sm whitespace-nowrap pointer-events-none"
        >
          যেকোনো দরকারে
        </motion.div>
        <motion.a
          href="https://wa.me/8801700000000" 
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex shadow-[0_8px_30px_rgb(37,211,102,0.3)] bg-[#25D366] hover:bg-[#1EBE5A] rounded-full p-3 items-center justify-center relative group transition-colors"
        >
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.015c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          <span className="sm:hidden absolute right-[calc(100%+12px)] px-3 py-1.5 bg-white text-[#0F2744] text-[11px] font-bengali font-bold tracking-wide rounded-xl shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            যেকোনো দরকারে
          </span>
        </motion.a>
      </AnimatePresence>
    </div>
  );
}
`;

fs.writeFileSync('src/components/WhatsAppSupport.tsx', content);
console.log('Done creating component');
