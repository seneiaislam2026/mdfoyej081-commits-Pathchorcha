const fs = require('fs');
let code = fs.readFileSync('src/pages/Exam.tsx', 'utf8');

const oldHeader = `<div className="max-w-[800px] mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button 
             onClick={() => { setActiveSet(null); setIsSubmitted(false); setSelectedOptions({}); setRemainingTime(null); }}
             className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
            >
             <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0 overflow-x-auto pl-2" style={{ scrollbarWidth: 'none' }}>
            <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 shrink-0">
               <span className="text-xs sm:text-sm text-blue-700 font-bold font-bengali whitespace-nowrap">
                  বাকি: {dbQuestions.length - Object.keys(selectedOptions).length}
               </span>
            </div>
            <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full font-mono text-xs sm:text-sm font-bold shrink-0 border border-orange-100">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 shrink-0" />
              {timeLeft}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className={\`font-bengali font-bold px-3 sm:px-4 shrink-0 text-xs sm:text-sm h-8 sm:h-9 rounded-full whitespace-nowrap \${isSubmitted ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-red-600 border-red-200 hover:bg-red-50'}\`}
              onClick={isSubmitted ? handleGoBack : handleSubmit}
            >
              {isSubmitted ? 'ফিরে যান' : 'টেস্ট শেষ করুন'}
            </Button>
          </div>
        </div>`;

const newHeader = `<div className="max-w-[800px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 flex-1">
            <button 
             onClick={() => { setActiveSet(null); setIsSubmitted(false); setSelectedOptions({}); setRemainingTime(null); }}
             className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0"
            >
             <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold rounded-full text-sm border border-blue-100/50 shadow-sm shrink-0">
               <FileText className="w-4 h-4 opacity-70" />
               <span className="font-bengali font-bold">বাকি:</span>
               <span className="font-mono text-[15px] font-bold">{Math.max(0, dbQuestions.length - Object.keys(selectedOptions).length)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 font-bold rounded-full text-sm border border-orange-100/50 shadow-sm font-mono shrink-0">
               <Timer className="w-[18px] h-[18px] text-orange-500 animate-pulse" />
              {timeLeft}
            </div>
            <Button 
              variant="default" 
              size="sm" 
              className={\`font-bengali font-bold px-6 h-[38px] shrink-0 text-sm rounded-full whitespace-nowrap shadow-md \${isSubmitted ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20' : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'}\`}
              onClick={isSubmitted ? handleGoBack : handleSubmit}
            >
              {isSubmitted ? 'ফিরে যান' : 'টেস্ট শেষ করুন'}
            </Button>
          </div>
        </div>`;

code = code.replace(oldHeader, newHeader);

// Fix the questions gap
code = code.replace(
  '<main className="flex-1 w-full max-w-[800px] mx-auto p-4 sm:p-6 mb-8 mt-4">\n        {isSubmitted && score !== null ? (',
  '<main className="flex-1 w-full max-w-[800px] mx-auto px-2 sm:px-6 mb-8 mt-6">\n        {isSubmitted && score !== null ? ('
);

code = code.replace(
  '          dbQuestions.map((q) => (\n            <div key={q.id} className="question-block border-b border-slate-100 pb-10 last:border-0 last:pb-0">',
  '        <div className="bg-white sm:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">\n          {dbQuestions.map((q) => (\n            <div key={q.id} className="question-block p-5 sm:p-8 border-b border-slate-100 last:border-b-0">'
);

code = code.replace(
  '                  </div>\n               )}\n            </div>\n          ))\n        )}',
  '                  </div>\n               )}\n            </div>\n          ))}\n        </div>\n        )}'
);

code = code.replace(
  '<div className="w-10 h-10 bg-[#fbbf24] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">\n                           <Lightbulb className="w-6 h-6" />\n                         </div>',
  '<div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0 shadow-inner">\n                           <Brain className="w-5 h-5" />\n                         </div>'
);

code = code.replace(
  'import { Clock, CheckCircle2, ChevronRight, Share2, Target, Zap, AlertCircle, XCircle, ArrowLeft, Lightbulb, Lock } from "lucide-react";',
  'import { Clock, CheckCircle2, ChevronRight, Share2, Target, Zap, AlertCircle, XCircle, ArrowLeft, Lightbulb, Lock, FileText, Timer, Brain } from "lucide-react";'
);

fs.writeFileSync('src/pages/Exam.tsx', code);
