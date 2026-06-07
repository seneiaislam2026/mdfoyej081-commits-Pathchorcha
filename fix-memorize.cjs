const fs = require('fs');
let code = fs.readFileSync('src/pages/Memorize.tsx', 'utf8');

const returnIndex = code.indexOf('return (');

const newRender = `return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 font-sans">
      {/* Header Accent */}
      <div className="bg-white border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-center sm:text-left">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-bengali text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500" />
              মেমোরাইজিং পার্ট
            </h1>
            <p className="text-slate-500 font-bengali text-sm mt-1 sm:mt-1.5 font-medium">সহজ ও সুন্দর আয়োজনে আপনার ভোকাবুলারি চর্চা</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-full w-full sm:w-auto border border-slate-200/50 relative">
            <Button
              onClick={() => setLang("english")}
              variant={lang === "english" ? "default" : "ghost"}
              className={\`flex-1 sm:flex-initial font-bengali font-bold rounded-full text-xs h-10 px-6 transition-all duration-300 \${lang === "english" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"}\`}
            >
              English
            </Button>
            <Button
              onClick={() => setLang("bangla")}
              variant={lang === "bangla" ? "default" : "ghost"}
              className={\`flex-1 sm:flex-initial font-bengali font-bold rounded-full text-xs h-10 px-6 transition-all duration-300 \${lang === "bangla" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"}\`}
            >
              বাংলা
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          <Button
            size="sm"
            onClick={() => setActiveCategory("all")}
            className={\`rounded-full font-bengali font-bold text-xs h-9 px-5 transition-all duration-300 shadow-none \${activeCategory === "all" ? "bg-indigo-600 border border-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"}\`}
          >
            সব শব্দ ({wordsList.length})
          </Button>
          
          {lang === "english" ? (
            <>
              {["vocabulary", "synonym", "antonym"].map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className={\`rounded-full font-sans font-bold text-xs uppercase h-9 px-4 transition-all duration-300 shadow-none \${activeCategory === cat ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"}\`}
                >
                  {cat}
                </Button>
              ))}
            </>
          ) : (
            <>
              {["samarthok", "antonym", "ek_kothay"].map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className={\`rounded-full font-bengali font-bold text-xs h-9 px-5 transition-all duration-300 shadow-none \${activeCategory === cat ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"}\`}
                >
                  {cat === "samarthok" ? "সমার্থক" : cat === "antonym" ? "বিপরীত" : "এক কথায় প্রকাশ"}
                </Button>
              ))}
            </>
          )}

          <div className="hidden sm:block flex-1 min-w-[20px]" />

          <Button
            size="sm"
            onClick={() => setIsQuizMode(!isQuizMode)}
            className={\`rounded-full font-bengali font-bold text-xs h-9 px-5 transition-all shadow-none \${isQuizMode ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200" : "bg-amber-50 text-amber-700 border border-amber-200/50 hover:bg-amber-100"}\`}
          >
            {isQuizMode ? "✏️ কুইজ বন্ধ করুন" : "✏️ মেমোরি কুইজ শুরু"}
          </Button>
        </div>

        {/* Dictionary Layout (Feed View) */}
        {!isQuizMode ? (
          <div className="space-y-4">
            {filteredWords.length > 0 ? (
              filteredWords.map((word) => (
                <div key={word.id} className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200/75 shadow-sm flex flex-col sm:flex-row gap-6 items-start transition-all hover:shadow-md hover:border-indigo-100 group">
                  
                  {/* Left: The Word */}
                  <div className="w-full sm:w-1/3 shrink-0 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-slate-100 border-dashed pb-5 sm:pb-0 sm:pr-6">
                    <span className="text-[10px] font-sans font-bold tracking-widest uppercase text-indigo-400 mb-2 block">{word.category}</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold font-sans text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                      {word.word}
                    </h2>
                    {word.pronunciation && (
                      <p className="text-sm font-mono text-slate-400 mt-2 font-medium bg-slate-50/80 inline-block px-2 py-0.5 rounded-md w-fit">
                        {word.pronunciation}
                      </p>
                    )}
                  </div>
                  
                  {/* Right: The Definitions */}
                  <div className="flex-1 w-full space-y-5 flex flex-col justify-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 font-sans">অর্থ / Meaning</span>
                      <p className="text-lg sm:text-xl font-bengali font-bold text-slate-800 leading-snug">
                        {word.meaning}
                      </p>
                    </div>

                    {(word.synonyms?.length > 0 || word.antonyms?.length > 0) && (
                      <div className="flex flex-wrap gap-x-8 gap-y-4 pt-2">
                        {word.synonyms?.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[10px] text-emerald-600/80 font-bold uppercase tracking-widest block font-sans">Synonyms</span>
                            <p className="text-sm font-sans font-medium text-slate-600 leading-relaxed max-w-[200px]">
                              {word.synonyms.join(", ")}
                            </p>
                          </div>
                        )}
                        {word.antonyms?.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[10px] text-rose-500/80 font-bold uppercase tracking-widest block font-sans">Antonyms</span>
                            <p className="text-sm font-sans font-medium text-slate-600 leading-relaxed max-w-[200px]">
                              {word.antonyms.join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {word.example && (
                      <div className="pt-3 border-t border-slate-50 mt-4 border-dashed">
                        <p className="text-[13px] text-slate-500 font-sans font-medium leading-relaxed italic border-l-2 border-indigo-200 pl-3">
                          "{word.example}"
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              ))
            ) : (
              <div className="bg-white p-12 text-center rounded-[32px] border border-slate-100 shadow-sm mt-8">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="font-bengali text-slate-500 font-medium">এই ফিল্টারে কোনো শব্দ পাওয়া যায়নি।</p>
              </div>
            )}
          </div>
        ) : (
          /* Re-used clean quiz section */
          <div className="max-w-xl mx-auto pt-4">
             {quizQuestion && (
              <div className="bg-white rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="bg-slate-900 p-8 sm:p-10 text-center relative">
                  <div className="absolute top-5 left-6 text-xs text-indigo-400 font-sans font-bold flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" /> SCORE: {scoreCount}
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest font-sans font-bold block mt-8 mb-4">
                    {quizQuestion.category} QUIZ
                  </span>
                  <h2 className="text-3xl sm:text-4xl text-white font-sans font-extrabold tracking-tight">
                    What is the meaning of "{quizQuestion.word}"?
                  </h2>
                </div>
                
                <div className="p-6 sm:p-8 space-y-4 bg-slate-50">
                  <div className="grid gap-3">
                    {quizOptions.map((opt, i) => {
                      const isSelected = selectedAnswer === opt;
                      const isCorrectChoice = opt === quizQuestion.meaning;
                      
                      let btnStyle = "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-xs";
                      if (selectedAnswer !== null) {
                        if (isCorrectChoice) {
                          btnStyle = "border-emerald-500 bg-emerald-50 max-h-auto text-emerald-800 font-bold z-10 shadow-md ring-2 ring-emerald-500/20";
                        } else if (isSelected) {
                          btnStyle = "border-rose-500 bg-rose-50 text-rose-800";
                        } else {
                          btnStyle = "border-slate-200 bg-slate-50 text-slate-400 opacity-50";
                        }
                      }
  
                      return (
                        <button
                          key={i}
                          disabled={selectedAnswer !== null}
                          onClick={() => handleSelectAnswer(opt)}
                          className={\`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-center justify-between cursor-pointer outline-none \${btnStyle}\`}
                        >
                          <span className="font-bengali font-bold text-base">{opt}</span>
                          {selectedAnswer !== null && isCorrectChoice && (
                            <Check className="w-5 h-5 text-emerald-600 shrink-0 ml-3" />
                          )}
                        </button>
                      );
                    })}
                  </div>
  
                  {selectedAnswer !== null && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="pt-6 animate-in text-center flex flex-col items-center gap-5"
                    >
                      <p className={\`font-bengali font-bold text-sm px-4 py-2 rounded-full \${isQuizCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}\`}>
                        {isQuizCorrect ? "সঠিক উত্তর!" : "ভুল উত্তর!"}
                      </p>
                      <Button
                        onClick={startQuiz}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bengali font-bold text-sm h-12 px-8 shadow-sm"
                      >
                        পরবর্তী প্রশ্ন <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
`;

const updatedCode = code.substring(0, returnIndex) + newRender + "\n}\n";
fs.writeFileSync('src/pages/Memorize.tsx', updatedCode);
