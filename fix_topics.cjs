const fs = require('fs');

let code = fs.readFileSync('src/pages/QuestionBank.tsx', 'utf8');

// We need to import ALL_NOTES from Notes.tsx in QuestionBank.tsx
if (!code.includes('ALL_NOTES')) {
  code = code.replace(/import \{ doc,.*?\} from "firebase\/firestore";/g, `$&
import { ALL_NOTES } from "./Notes";`);
}

// Check if import was added
if (!code.includes('ALL_NOTES')) {
  code = code.replace('import { useAuth }', 'import { ALL_NOTES } from "./Notes";\nimport { useAuth }');
}

// Replace the topics rendering logic
const topicBlockRegex = /\{\/\* Topic List \*\/\}[\s\S]*?(?=\{\/\* Search Modal \*\/\}|\{\/\* Practice Logic \*\/\}|\{\/\* Custom CSS \*\/\}|\{\/\* Dynamic Horizontal scrolling Subject Pills \*\/\}|activeSubTab === "practice")/m;

// wait, the block is:
/*
              {/* Topic List *}
              {activeClassGroup === "Admission" ? (
                  ...
*/

// Let's replace the whole topics logic with Notes rendering.
const notesReplacement = `{/* Topic List */}
              <div className="flex flex-col gap-4 mt-2">
                {(() => {
                  const filteredTopicNotes = ALL_NOTES.filter(note => {
                    const matchSubj = note.subject.toLowerCase() === activeTopicSubject.toLowerCase();
                    const matchClass = note.classGroup === "Admission" || note.classGroup === "HSC" || true; // let's just match subject for now to show something
                    return matchSubj;
                  });

                  if (filteredTopicNotes.length === 0) {
                    return (
                      <div className="bg-white p-12 text-center rounded-[32px] border border-slate-100 shadow-sm">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="font-bengali text-sm text-slate-500">এই বিষয়ের কোনো নোটস এখনো আপলোড করা হয়নি।</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid gap-5">
                      {filteredTopicNotes.map(note => (
                        <Link 
                          key={note.id} 
                          to={"/notes/subject/" + encodeURIComponent(activeTopicSubject)}
                          className="bg-white p-5 sm:p-7 rounded-[28px] border border-slate-200/60 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group block cursor-pointer"
                        >
                          <div className="flex gap-2 flex-wrap">
                            {note.badges?.map((b, i) => (
                              <span key={i} className="text-[10px] font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bengali">
                                {b}
                              </span>
                            ))}
                          </div>
                          <h4 className="font-bengali font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">
                            {note.title}
                          </h4>
                          <p className="text-sm font-bengali text-slate-500 line-clamp-2">
                            {note.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-emerald-600 text-xs font-bold uppercase tracking-wider font-sans opacity-0 group-hover:opacity-100 transition-opacity">
                            Read Note <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  );
                })()}
              </div>
`;

code = code.replace(/\{\/\* Topic List \*\/\}[\s\S]*?(?=<\/motion\.div>)/m, notesReplacement + '\n            ');

fs.writeFileSync('src/pages/QuestionBank.tsx', code);
