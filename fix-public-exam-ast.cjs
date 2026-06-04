const fs = require('fs');

let code = fs.readFileSync('src/pages/PublicExam.tsx', 'utf8');

// 1. Remove the entire `if (isSubmitted) { ... }` block (lines 264 to 400 approx).
const blockStart = code.indexOf('  if (isSubmitted) {');
const nextReturn = code.indexOf('  return (\n    <div className="min-h-screen', blockStart);
if(blockStart !== -1 && nextReturn !== -1) {
  code = code.substring(0, blockStart) + code.substring(nextReturn);
}

// 2. Modify sticky header for mobile overflow issues and isSubmitted state
const stickyHeaderOld = `<header className="bg-white border-y sticky top-0 z-20">
        <div className="max-w-[800px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 flex-1">
             <button onClick={() => navigate("/")} className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0">
               <ArrowLeft className="w-5 h-5 text-slate-700" />
             </button>
             <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold rounded-full text-sm border border-blue-100/50 shadow-sm shrink-0">
               <FileText className="w-4 h-4 opacity-70" />
               <span className="font-bengali font-bold">বাকি:</span>
               <span className="font-mono text-[15px] font-bold">{remainingQuestions}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 font-bold rounded-full text-sm border border-orange-100/50 shadow-sm font-mono shrink-0">
               <Timer className="w-[18px] h-[18px] text-orange-500 animate-pulse" />
               {formatTime(timeLeft)}
             </div>
             
             <Button variant="default" className="bg-red-500 hover:bg-red-600 text-white font-bold font-bengali rounded-full h-[38px] px-6 shadow-md shadow-red-500/20 shrink-0" onClick={() => handleSubmit()}>
                শেষ করুন
             </Button>
          </div>
        </div>
      </header>`;

const stickyHeaderNew = `<header className="bg-white border-y sticky top-0 z-20">
        <div className="max-w-[800px] mx-auto px-2 sm:px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 overflow-hidden pr-2">
             <button onClick={() => navigate("/")} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0">
               <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
             </button>
             <div className="flex flex-1 items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold rounded-full text-xs sm:text-sm border border-blue-100/50 shadow-sm shrink-0 min-w-0 max-w-fit">
               <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70 shrink-0" />
               <span className="font-bengali font-bold hidden sm:inline">বাকি:</span>
               <span className="font-mono text-[14px] sm:text-[15px] font-bold truncate">{remainingQuestions}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
             {!isSubmitted && (
               <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 font-bold rounded-full text-xs sm:text-sm border border-orange-100/50 shadow-sm font-mono shrink-0">
                 <Timer className="w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] text-orange-500 animate-pulse" />
                 {formatTime(timeLeft)}
               </div>
             )}
             
             <Button variant="default" className={\`font-bengali font-bold rounded-full h-[34px] sm:h-[38px] px-3 sm:px-6 shadow-md shrink-0 text-xs sm:text-sm \${isSubmitted ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 text-white' : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'}\`} onClick={() => isSubmitted ? navigate("/") : handleSubmit()}>
                {isSubmitted ? 'ফিরে যান' : 'শেষ করুন'}
             </Button>
          </div>
        </div>
      </header>`;
code = code.replace(stickyHeaderOld, stickyHeaderNew);


// 3. Add Score UI when isSubmitted
const scoreUI = `
        {isSubmitted && (
          <div className="mb-8 bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 shadow-sm text-center">
             <h2 className="text-xl font-bold text-slate-800 mb-6">{studentName}, Final Result</h2>
             
             <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8">
                <div className="text-center">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-[3px] sm:border-4 border-green-500 flex items-center justify-center mx-auto mb-2 bg-green-50">
                       <span className="text-xl sm:text-3xl font-bold text-green-600">{correctCount}</span>
                    </div>
                    <span className="text-xs sm:text-[15px] font-medium text-slate-600">Correct</span>
                </div>
                <div className="text-center">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-[3px] sm:border-4 border-red-500 flex items-center justify-center mx-auto mb-2 bg-red-50">
                       <span className="text-xl sm:text-3xl font-bold text-red-600">{wrongCount}</span>
                    </div>
                    <span className="text-xs sm:text-[15px] font-medium text-slate-600">Wrong</span>
                </div>
                <div className="text-center">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-[3px] sm:border-4 border-slate-300 flex items-center justify-center mx-auto mb-2 bg-slate-50">
                       <span className="text-xl sm:text-3xl font-bold text-slate-600">{skippedCount}</span>
                    </div>
                    <span className="text-xs sm:text-[15px] font-medium text-slate-600">Skipped</span>
                </div>
             </div>

             <div className="bg-slate-50 border border-slate-100 rounded-[20px] p-4 inline-flex items-center gap-3 flex-col sm:flex-row shadow-inner">
                <span className="text-slate-500 font-medium text-sm sm:text-base">Total Score:</span>
                <span className="text-2xl font-bold text-primary">{score} <span className="text-base text-slate-400">/ {questions.length}</span></span>
             </div>
          </div>
        )}
`;

code = code.replace(
  '<div className="bg-white sm:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">',
  scoreUI + '\n        <div className="bg-white sm:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-0 m-0">'
);

// 4. Update the questions mapping block for isSubmitted logic
const oldMapStart = code.indexOf('{questions.map((q, idx)');
const oldMapEnd = code.indexOf('          ))}', oldMapStart) + 13;
const oldMap = code.substring(oldMapStart, oldMapEnd);

const newMap = `{questions.map((q, idx) => {
            const isQuestionSubmitted = isSubmitted;
            const selected = selectedAnswers[idx];
            const correct = q.correctId || q.correctOption;
            const isCorrect = selected === correct;
            const isSkipped = !selected;

            let iconBg = "";
            if (isSkipped) iconBg = "bg-slate-100 text-slate-500";
            else if (isCorrect) iconBg = "bg-green-100 text-green-600";
            else iconBg = "bg-red-100 text-red-600";

            return (
             <div key={idx} className="p-5 sm:p-8 border-b border-slate-100 last:border-b-0">
                <div className="mb-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     {isQuestionSubmitted && (
                       <div className={\`shrink-0 w-8 h-8 rounded-full flex items-center justify-center \${iconBg} shadow-sm\`}>
                          {isSkipped ? <AlertCircle className="w-4 h-4" /> : isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                       </div>
                     )}
                     <span className="inline-block px-4 py-1.5 bg-[#1e293b] text-white rounded-full text-[13px] font-bold shadow-sm">
                       প্রশ্ন {idx + 1}
                     </span>
                   </div>
                </div>
                <h3 className="text-[18px] sm:text-[20px] leading-relaxed text-[#0f172a] font-medium mb-6 whitespace-pre-line">
                  {q.text}
                </h3>

                <div className="space-y-3">
                  {q.options.map((option: any) => {
                    const isSelected = selectedAnswers[idx] === option.id;
                    const isThisCorrect = isQuestionSubmitted && (correct === option.id);
                    
                    let optStyle = "";
                    if (isQuestionSubmitted) {
                       if (isThisCorrect) optStyle = "border-green-500 bg-green-50 shadow-[0_0_0_1px_#22c55e]";
                       else if (isSelected && !isThisCorrect) optStyle = "border-red-500 bg-red-50 shadow-[0_0_0_1px_#ef4444]";
                       else optStyle = "border-slate-100 bg-slate-50 opacity-60";
                    } else {
                       if (isSelected) optStyle = "border-[#1e293b] bg-slate-50 shadow-[0_0_0_1px_#1e293b]";
                       else optStyle = "border-slate-200 hover:border-slate-300 bg-white";
                    }

                    let badgeStyle = "";
                    if (isQuestionSubmitted) {
                       if (isThisCorrect) badgeStyle = "bg-green-500 text-white border-r-green-500";
                       else if (isSelected && !isThisCorrect) badgeStyle = "bg-red-500 text-white border-r-red-500";
                       else badgeStyle = "bg-slate-200 text-slate-500 border-slate-200";
                    } else {
                       if (isSelected) badgeStyle = "bg-[#1e293b] text-white border-r-[#1e293b]";
                       else badgeStyle = "bg-[#f8fafc] text-slate-800 border-slate-200";
                    }

                    let textColor = "";
                    if (isQuestionSubmitted) {
                       if (isThisCorrect) textColor = "text-green-800 font-bold";
                       else if (isSelected && !isThisCorrect) textColor = "text-red-800 font-bold";
                       else textColor = "text-slate-600 font-medium";
                    } else {
                       textColor = isSelected ? 'text-[#1e293b] font-bold' : 'text-[#0f172a] font-medium';
                    }

                    return (
                      <button
                        key={option.id}
                        onClick={() => { if (!isQuestionSubmitted) setSelectedAnswers({ ...selectedAnswers, [idx]: option.id }) }}
                        disabled={isQuestionSubmitted}
                        className={\`w-full flex items-stretch rounded-[16px] border-[1.5px] overflow-hidden transition-all text-left \${optStyle}\`}
                      >
                        <div className={\`w-[52px] flex items-center justify-center text-[15px] font-bold shrink-0 border-r-[1.5px] transition-colors \${badgeStyle}\`}>
                          {option.id}
                        </div>
                        <div className="flex-1 p-4 px-5">
                          <span className={\`text-[16px] sm:text-[17px] \${textColor}\`}>
                            {option.label || option.text}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* Auto Explanation block if submitted */}
                {isQuestionSubmitted && q.explanation && (
                  <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                     <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0 shadow-inner">
                       <Brain className="w-5 h-5" />
                     </div>
                     <div className="flex-1 pt-2">
                       <h4 className="text-[15px] font-bold text-slate-800 mb-1">ব্যাখ্যা:</h4>
                       <div className="text-[15px] leading-relaxed text-slate-600 whitespace-pre-line">
                         {q.explanation}
                       </div>
                     </div>
                  </div>
                )}
             </div>
            );
          })}`;

code = code.replace(oldMap, newMap);

const footerOld = `<div className="pt-8 pb-8">
           <Button onClick={() => handleSubmit()} className="w-full h-[60px] rounded-[20px] text-lg font-bold bg-[#1e293b] hover:bg-slate-800 text-white shadow-md">
             Submit Exam
           </Button>
        </div>`;

const footerNew = `{!isSubmitted && (
        <div className="pt-8 pb-8">
           <Button onClick={() => handleSubmit()} className="w-full h-[60px] rounded-[20px] text-lg font-bold bg-[#1e293b] hover:bg-slate-800 text-white shadow-md">
             Submit Exam
           </Button>
        </div>
        )}`;

code = code.replace(footerOld, footerNew);

fs.writeFileSync('src/pages/PublicExam.tsx', code);
