const fs = require('fs');
let code = fs.readFileSync('src/pages/Notes.tsx', 'utf8');

const subjectGridStr = `
const COMMERCE_SUBJECTS = [
  { 
    id: "bangla", 
    title: "বাংলা", 
    subjectMatch: "বাংলা", 
    bgColor: "bg-blue-50/50",
    icon: (
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 transition-transform group-hover:scale-110 duration-500">
        <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-sm">
                {/* Book Base (Purple/Blue Tone like image) */}
                <path d="M20 70 L80 70 C85 70 85 65 80 65 L20 65 C15 65 15 70 20 70 Z" fill="#6366F1" />
                <path d="M20 70 C15 70 15 75 20 75 L80 75 C85 75 85 70 80 70 Z" fill="#4F46E5" />
                {/* Pages */}
                <path d="M20 65 L48 65 L48 20 L20 30 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M80 65 L52 65 L52 20 L80 30 Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M25 40 L43 40" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                <path d="M25 50 L43 50" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                <path d="M57 40 L75 40" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                <path d="M57 50 L75 50" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                {/* Checkmark in circle or speech bubble */}
                <path d="M25 10 C25 5 30 5 40 5 C50 5 55 5 55 10 C55 20 50 25 40 25 L35 30 L35 25 C30 25 25 20 25 10 Z" fill="#3B82F6" />
                <text x="35" y="18" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">অ</text>
            </svg>
        </div>
      </div>
    )
  },
  { 
    id: "english", 
    title: "ইংরেজি", 
    subjectMatch: "ইংরেজি", 
    bgColor: "bg-slate-50/80",
    icon: (
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 transition-transform group-hover:scale-110 duration-500">
        <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-sm">
                <path d="M30 15 L70 15 C75 15 75 20 75 25 L75 75 C75 80 70 80 70 80 L30 80 C25 80 25 75 25 75 L25 15 Z" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" />
                <path d="M25 15 L20 15 L20 75 L25 75" fill="#1D4ED8" />
                <path d="M35 15 L35 80" stroke="#1E40AF" strokeWidth="1.5" />
                <text x="40" y="32" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="sans-serif">ENG</text>
                <path d="M38 45 L50 45" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                <path d="M38 52 L45 52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                <path d="M30 40 L30 60" fill="#EF4444" />
                <path d="M28 80 L32 80 L32 85 L30 83 L28 85 Z" fill="#EF4444" />
                {/* Pen */}
                <path d="M65 20 L80 60 L78 62 L63 22 Z" fill="#94A3B8" />
                <path d="M80 60 L82 66 L76 66 L78 62 Z" fill="#1E293B" />
            </svg>
        </div>
      </div>
    )
  },
  { 
    id: "accounting", 
    title: "হিসাববিজ্ঞান", 
    subjectMatch: "হিসাববিজ্ঞান", 
    bgColor: "bg-emerald-50/50",
    icon: (
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 transition-transform group-hover:scale-110 duration-500">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-green-100/40 rounded-full blur-xl" />
        <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-sm">
                <rect x="20" y="30" width="35" height="50" rx="4" fill="#334155" stroke="#0F172A" strokeWidth="2" />
                <rect x="25" y="35" width="25" height="15" rx="2" fill="#38BDF8" />
                <rect x="25" y="55" width="6" height="5" rx="1" fill="#64748B" />
                <rect x="34" y="55" width="6" height="5" rx="1" fill="#64748B" />
                <rect x="43" y="55" width="6" height="5" rx="1" fill="#64748B" />
                <rect x="25" y="63" width="6" height="5" rx="1" fill="#64748B" />
                <rect x="34" y="63" width="6" height="5" rx="1" fill="#64748B" />
                <rect x="43" y="63" width="6" height="5" rx="1" fill="#10B981" />
                <rect x="25" y="70" width="6" height="5" rx="1" fill="#64748B" />
                <rect x="34" y="70" width="6" height="5" rx="1" fill="#64748B" />
                <rect x="43" y="70" width="6" height="5" rx="1" fill="#10B981" />
                {/* Coins */}
                <ellipse cx="65" cy="72" rx="12" ry="5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
                <path d="M53 72 L53 76 C53 78.8 58.4 81 65 81 C71.6 81 77 78.8 77 76 L77 72" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
                <ellipse cx="65" cy="66" rx="12" ry="5" fill="#FCD34D" stroke="#B45309" strokeWidth="1.5" />
                <path d="M53 66 L53 70 C53 72.8 58.4 75 65 75 C71.6 75 77 72.8 77 70 L77 66" fill="#FCD34D" stroke="#B45309" strokeWidth="1.5" />
                <ellipse cx="65" cy="60" rx="12" ry="5" fill="#FBE106" stroke="#B45309" strokeWidth="1.5" />
                <text x="63" y="63" fill="#B45309" fontSize="6" fontWeight="bold">৳</text>
                
                {/* Paper background hint */}
                <path d="M45 15 L78 15 L78 50 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="55" cy="30" r="8" fill="#10B981" />
                <path d="M55 30 L55 22 A8 8 0 0 1 61 25 Z" fill="#F59E0B" />
                <path d="M55 30 L61 25 A8 8 0 0 1 60 36 Z" fill="#EF4444" />
            </svg>
        </div>
      </div>
    )
  },
  { 
    id: "management", 
    title: "ব্যবস্থাপনা", 
    subjectMatch: "ব্যবস্থাপনা", 
    bgColor: "bg-purple-50/50",
    icon: (
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 transition-transform group-hover:scale-110 duration-500">
        <div className="absolute inset-0 bg-purple-100/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-sm">
                <rect x="25" y="15" width="50" height="70" rx="4" fill="#6366F1" stroke="#4338CA" strokeWidth="2" />
                <rect x="30" y="25" width="40" height="55" rx="2" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
                <path d="M40 10 L60 10 C62 10 62 12 60 12 L40 12 C38 12 38 10 40 10 Z" fill="#94A3B8" />
                <circle cx="50" cy="15" r="4" fill="#334155" />
                {/* Chart line */}
                <path d="M35 60 L45 45 L55 50 L65 30" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M61 30 L65 30 L65 34" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="35" y="65" width="6" height="5" fill="#818CF8" />
                <rect x="45" y="55" width="6" height="15" fill="#818CF8" />
                <rect x="55" y="45" width="6" height="25" fill="#818CF8" />
                
                {/* Gear */}
                <circle cx="75" cy="65" r="10" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
                <circle cx="75" cy="65" r="4" fill="#F8FAFC" />
                <path d="M75 52 L75 54 M75 76 L75 78 M62 65 L64 65 M86 65 L88 65 M66 56 L68 58 M82 72 L84 74 M84 56 L82 58 M66 74 L68 72" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
            </svg>
        </div>
      </div>
    )
  },
  { 
    id: "marketing", 
    title: "বিপণন", 
    subjectMatch: "বিপণন", 
    bgColor: "bg-red-50/50",
    icon: (
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 transition-transform group-hover:scale-110 duration-500">
        <div className="absolute inset-0 bg-red-100/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-sm">
                {/* Megaphone body */}
                <path d="M30 35 L65 20 L65 80 L30 65 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" strokeLinejoin="round" />
                <path d="M25 35 L30 35 L30 65 L25 65 C22 65 22 35 25 35 Z" fill="#B91C1C" />
                {/* handle */}
                <rect x="40" y="65" width="8" height="20" rx="3" fill="#334155" transform="rotate(-15 40 65)" />
                {/* sound waves */}
                <path d="M72 30 Q78 50 72 70" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                <path d="M78 20 Q88 50 78 80" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                
                {/* Speech buble */}
                <path d="M70 15 Q85 15 85 25 Q85 35 75 35 L70 40 L71 35 Q60 35 60 25 Q60 15 70 15 Z" fill="#3B82F6" stroke="#2563EB" strokeWidth="1.5" />
                <path d="M70 23 L75 27 L80 23" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
      </div>
    )
  },
  { 
    id: "finance", 
    title: "ফিন্যান্স", // Note spelling correction according to request
    subjectMatch: "ফিন্যান্স", 
    bgColor: "bg-cyan-50/50",
    icon: (
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 transition-transform group-hover:scale-110 duration-500">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-cyan-100/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-sm">
                {/* Bank Building */}
                <polygon points="50,15 80,35 20,35" fill="#0EA5E9" stroke="#0369A1" strokeWidth="2" strokeLinejoin="round" />
                <rect x="25" y="35" width="50" height="5" fill="#0369A1" />
                <rect x="30" y="40" width="8" height="30" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
                <rect x="46" y="40" width="8" height="30" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
                <rect x="62" y="40" width="8" height="30" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
                <rect x="20" y="70" width="60" height="5" fill="#0369A1" />
                <rect x="15" y="75" width="70" height="8" fill="#0EA5E9" stroke="#0369A1" strokeWidth="2" />
                
                {/* Taka symbol in center */}
                <circle cx="50" cy="55" r="10" fill="#F59E0B" />
                <text x="47" y="59" fill="#FFFFFF" fontSize="10" fontWeight="bold">৳</text>
                
                {/* Coins Stacked */}
                <ellipse cx="80" cy="78" rx="8" ry="3" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
                <path d="M72 78 L72 82 C72 84 76 85 80 85 C84 85 88 84 88 82 L88 78" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
                <ellipse cx="80" cy="73" rx="8" ry="3" fill="#FCD34D" stroke="#B45309" strokeWidth="1" />
                <path d="M72 73 L72 77 C72 79 76 80 80 80 C84 80 88 79 88 77 L88 73" fill="#FCD34D" stroke="#B45309" strokeWidth="1" />
                <ellipse cx="80" cy="68" rx="8" ry="3" fill="#FBE106" stroke="#B45309" strokeWidth="1" />
            </svg>
        </div>
      </div>
    )
  }
];
`;

if (!code.includes('const COMMERCE_SUBJECTS')) {
  code = code.replace("export default function Notes() {", subjectGridStr + "\nexport default function Notes() {");
}

let codeWithState = code;
if (!codeWithState.includes('const [chosenSubject, setChosenSubject] = useState<string | null>(null);')) {
  codeWithState = codeWithState.replace(
    'const [selectedSubject, setSelectedSubject] = useState<string>("All");',
    'const [selectedSubject, setSelectedSubject] = useState<string>("All");\n  const [chosenSubject, setChosenSubject] = useState<string | null>(null);'
  );
}

const splitPoints = codeWithState.split('return (\n    <div className="min-h-screen bg-[#F8FAFC] pb-28 font-sans antialiased text-slate-800">');

if (splitPoints.length === 2 && !codeWithState.includes('if (!chosenSubject) {')) {
  const replacement = `
  if (!chosenSubject) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-28 font-sans antialiased text-slate-800">
        {/* White header like in image */}
        <div className="bg-white border-b border-slate-100 overflow-hidden relative shadow-sm">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 sm:py-10 flex items-center justify-between">
            <div className="relative z-10 space-y-1.5 sm:space-y-2">
              <h1 className="font-bengali text-3xl sm:text-4xl font-extrabold text-[#1e293b] tracking-tight">নোটস</h1>
              <p className="text-[15px] sm:text-base text-slate-500 font-medium font-bengali">বিষয়ভিত্তিক নোটস ও অনুশীলন</p>
            </div>
            
            <div className="relative z-10 w-28 sm:w-40 opacity-95 transition-transform hover:scale-105 duration-500">
               <svg viewBox="0 0 200 150" className="w-full h-auto drop-shadow-sm">
                  {/* Notes Pad Illustration */}
                  <rect x="50" y="20" width="90" height="110" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" transform="rotate(5 95 75)" />
                  <rect x="45" y="15" width="90" height="110" rx="8" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
                  
                  {/* Binding rings */}
                  <circle cx="50" cy="30" r="3" fill="#1E293B" />
                  <path d="M40 30 Q45 28 50 30" fill="none" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="3" fill="#1E293B" />
                  <path d="M40 50 Q45 48 50 50" fill="none" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="50" cy="70" r="3" fill="#1E293B" />
                  <path d="M40 70 Q45 68 50 70" fill="none" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="50" cy="90" r="3" fill="#1E293B" />
                  <path d="M40 90 Q45 88 50 90" fill="none" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="50" cy="110" r="3" fill="#1E293B" />
                  <path d="M40 110 Q45 108 50 110" fill="none" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* Checks and Lines */}
                  <path d="M60 40 L65 45 L75 35" fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="85" y1="40" x2="120" y2="40" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                  
                  <path d="M60 60 L65 65 L75 55" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="85" y1="60" x2="110" y2="60" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                  
                  <path d="M60 80 L65 85 L75 75" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="85" y1="80" x2="115" y2="80" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                  
                  <path d="M60 100 L65 105 L75 95" fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="85" y1="100" x2="105" y2="100" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

                  {/* Pen */}
                  <path d="M120 120 L160 40 L168 44 L128 124 Z" fill="#3B82F6" stroke="#2563EB" strokeWidth="1" />
                  <polygon points="120,120 128,124 115,130" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
                  <polygon points="115,130 118,127 116,126" fill="#1E293B" />
                  <path d="M150 60 L155 62 L150 72 L145 70 Z" fill="#60A5FA" />
                  {/* Decorative sparkles */}
                  <path d="M30 60 L32 65 L37 67 L32 69 L30 74 L28 69 L23 67 L28 65 Z" fill="#94A3B8" />
                  <path d="M160 15 L162 20 L167 22 L162 24 L160 29 L158 24 L153 22 L158 20 Z" fill="#F59E0B" />
               </svg>
            </div>
          </div>
        </div>

        <main className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 sm:py-10 space-y-6">
           <div className="space-y-1 ml-2">
             <h2 className="text-[20px] sm:text-[22px] font-bold text-[#1e293b] tracking-tight font-sans">Commerce</h2>
             <p className="font-bengali text-[14px] text-slate-500 font-medium tracking-wide">ক্লাস ও পরীক্ষার প্রস্তুতির জন্য ৬টি মূল বিষয়</p>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 pt-2">
              {COMMERCE_SUBJECTS.map((sub) => (
                <div 
                  key={sub.id}
                  onClick={() => {
                    setChosenSubject(sub.subjectMatch);
                    setSelectedSubject(sub.subjectMatch);
                  }}
                  className="bg-white border border-slate-200/60 rounded-[20px] p-5 sm:p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 group relative overflow-hidden text-center"
                >
                  <div className={"absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 " + sub.bgColor} />
                  {sub.icon}
                  <h3 className="font-bengali text-[17px] sm:text-xl font-bold text-[#1e293b] mt-1 relative z-10 group-hover:text-amber-600 transition-colors">{sub.title}</h3>
                </div>
              ))}
           </div>
        </main>
        
        {/* Bottom Navigation Tab Bar */}
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200/80 py-3.5 px-6 flex justify-around items-center z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.03)] rounded-t-[28px] max-w-lg mx-auto">
          <button className="flex-1 flex flex-col items-center gap-1 transition-all relative text-emerald-600 scale-102 cursor-pointer">
            <BookOpen className="w-5 h-5 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bengali font-bold">নোটস</span>
            <motion.div layoutId="bottom_indicator" className="absolute bottom-[-15px] inset-x-12 h-1 bg-emerald-500 rounded-full" />
          </button>
          <Link to="/bank?tab=topics" className="flex-1 flex flex-col items-center gap-1 transition-all relative text-slate-400 hover:text-slate-500 cursor-pointer">
            <LayoutList className="w-5 h-5 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bengali font-bold">টপিক ভিত্তিক নোটস</span>
          </Link>
          <Link to="/bank?tab=practice" className="flex-1 flex flex-col items-center gap-1 transition-all relative text-slate-400 hover:text-slate-500 cursor-pointer">
            <PenTool className="w-5 h-5 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bengali font-bold">প্র্যাকটিস</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 font-sans antialiased text-slate-800">
`;

  codeWithState = splitPoints[0] + replacement + splitPoints[1];
  
  // Update the dark header's back button
  // Replace <Link to="/dashboard" ...> with <button onClick...
  codeWithState = codeWithState.replace(
    '<Link to="/dashboard" className="h-10 w-10 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200/60 rounded-2xl flex items-center justify-center text-[#0F2744] transition-all shrink-0 hover:shadow-xs" aria-label="Back">',
    '<button onClick={() => { setChosenSubject(null); setSelectedSubject("All"); }} className="h-10 w-10 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200/60 rounded-2xl flex items-center justify-center text-[#0F2744] transition-all shrink-0 hover:shadow-xs" aria-label="Back">'
  ).replace(
    '</Link>\n            <div className="h-11 w-11 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0 animate-pulse">',
    '</button>\n            <div className="h-11 w-11 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0 animate-pulse">'
  );
} else {
  console.log("Could not find injection point or already injected.");
}

fs.writeFileSync('src/pages/Notes.tsx', codeWithState);
console.log('Update successful.');
