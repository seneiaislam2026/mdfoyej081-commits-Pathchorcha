const fs = require('fs');
let code = fs.readFileSync('src/pages/Notes.tsx', 'utf8');

// 1. Remove states
code = code.replace('const [activeClassGroup, setActiveClassGroup] = useState<string>("HSC");', '');
code = code.replace('const [activeSubject, setActiveSubject] = useState<string>("বাংলা");', '');
code = code.replace('const [searchQuery, setSearchQuery] = useState("");', '');

// 2. Remove useEffect for userData
code = code.replace(/  \/\/ Set initial active class group from userData on mount\n  useEffect\(\(\) => \{\n    if \(userData\?\.class\) \{\n      const group = mapUserClassToGroup\(userData\.class\);\n      setActiveClassGroup\(group\);\n      \n      \/\/ Select appropriate default subject for that group\n      const subjects = getSubjectsByGroup\(userData\.group \|\| "বিজ্ঞান", group\);\n      if \(subjects\.length > 0\) \{\n        setActiveSubject\(subjects\[0\]\);\n      \}\n    \}\n  \}, \[userData\]\);\n/, '');

// 3. Update filteredNotes
const filteredNotesReplacement = `  // All notes available directly without filtering by categoric pills
  const filteredNotes = ALL_NOTES;`;
code = code.replace(/\/\/ Filter notes based on category(.*?)\}\);\n\n  const subjectsList = getSubjectsByGroup\(userData\?\.group \|\| "বিজ্ঞান", activeClassGroup\);\n/s, filteredNotesReplacement + '\n');

// 4. Update Header and remove filters UI
const headerReplacement = `      {/* Clean Topbar */}
      <header className="bg-white border-b border-slate-100/80 sticky top-0 z-40 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full">
            <div className="h-10 w-10 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bengali text-lg font-extrabold text-[#0F2744]">লেকচার শিটস ও নোটস</h1>
              <p className="text-[11px] text-slate-400 font-medium font-bengali">সহজ ও সাবলীল উপস্থাপনায় আপনার পকেট মেন্টর</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Hero Banner Section */}
        <div className="relative bg-[#0F2744] rounded-[32px] p-6 sm:p-8 md:p-10 text-white overflow-hidden shadow-xl shadow-[#0F2744]/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-[-50%] right-[-10%] w-[350px] h-[350px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-30%] left-[-10%] w-[250px] h-[250px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 z-10 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 text-amber-300 font-bengali text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              প্রো লেকচার সিরিজ ২০২৬
            </div>
            <h2 className="font-bengali text-xl sm:text-2.5xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              এক্সক্লুসিভ প্রো ম্যাক্স লেকচার নোটস
            </h2>
            <p className="text-sm sm:text-base font-bengali text-slate-300 max-w-2xl leading-relaxed">
              মেধাবী শিক্ষক ও দেশসেরা টপারদের হাতে অত্যন্ত নিখুঁত ভাবে তৈরি করা এক্সক্লুসিভ গাইডবুক। প্রতিটি বিষয়ের গভীরে গিয়ে সহজ ও সুন্দরভাবে ব্যাখ্যা করা হয়েছে যা আপনার প্রস্তুতিকে করবে আরো একধাপ এগিয়ে।
            </p>
          </div>
        </div>`;
code = code.replace(/\{\/\* Search & Theme Accent Topbar \*\/\}(.*?)\{\/\* Dynamic Notes Grid \*\/\}/s, headerReplacement + '\n\n        {/* Dynamic Notes Grid */}');

// 5. Update footer text
code = code.replace(/টপিক ভিত্তিক প্রশ্ন/g, 'টপিক ভিত্তিক নোটস');

fs.writeFileSync('src/pages/Notes.tsx', code);
