const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const anchor = 'const [syncingOffline, setSyncingOffline] = useState(false);';
const injectedState = anchor + '\n' +
'  const [publicExams, setPublicExams] = useState<any[]>([]);\n' +
'  useEffect(() => {\n' +
'    async function fetchPublicExams() {\n' +
'      try {\n' +
'        const { collection, getDocs, limit, query, orderBy, where } = await import("firebase/firestore");\n' +
'        const { db } = await import("../lib/firebase");\n' +
'        const q = query(\n' +
'          collection(db, "public_exams"),\n' +
'          where("active", "==", true),\n' +
'          orderBy("createdAt", "desc"),\n' +
'          limit(3)\n' +
'        );\n' +
'        const snap = await getDocs(q);\n' +
'        const exams = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));\n' +
'        setPublicExams(exams);\n' +
'      } catch (error) {\n' +
'        console.error("Failed to fetch public exams:", error);\n' +
'      }\n' +
'    }\n' +
'    fetchPublicExams();\n' +
'  }, []);\n';

code = code.replace(anchor, injectedState);

const targetStr = '</section>\n\n      {/* Quick Stats Grid */}';

const newBlock = `</section>

      {/* Live Public Exams Banner */}
      {publicExams && publicExams.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-2xl font-bengali font-bold text-slate-900 flex items-center gap-2">
               <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
               চলমান লাইভ এক্সাম
             </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicExams.map((exam) => (
              <Link to={\`/public-exam/\${exam.id}\`} key={exam.id}>
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-3xl border border-indigo-100/50 shadow-sm relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full -translate-y-8 translate-x-8 blur-xl"></div>
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> লাইভ
                    </div>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-500">
                      <Trophy className="w-5 h-5" />
                    </div>
                  </div>
                  <h4 className="font-bengali font-bold text-lg text-slate-800 mb-1 relative z-10 leading-snug">{exam.title}</h4>
                  <div className="flex items-center gap-3 text-slate-500 text-sm font-medium mt-3 relative z-10">
                     <span className="flex items-center gap-1 opacity-80"><Clock className="w-4 h-4"/> {exam.duration} মিনিট</span>
                     <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                     <span className="flex items-center gap-1 opacity-80"><LayoutList className="w-4 h-4"/> {exam.questions ? exam.questions.length : 0} প্রশ্ন</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quick Stats Grid */}`;

code = code.replace(targetStr, newBlock);

if (code.includes('LayoutList') === false) {
  code = code.replace('from "lucide-react";', 'LayoutList, Clock, Trophy } from "lucide-react";').replace('} LayoutList, Clock, Trophy }', 'LayoutList, Clock, Trophy }');
}

fs.writeFileSync('src/pages/Dashboard.tsx', code);
