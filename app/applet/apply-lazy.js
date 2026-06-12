const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace static imports with lazy ones and add Suspense fallback
const importsToLazy = [
  'Dashboard', 'QuestionBank', 'PaperView', 'Notes', 'SubjectNotes', 'Exam', 'Leaderboard', 'Profile', 'Admin', 'AITutor', 'Memorize', 'NoteDetails', 'NoteHonesty', 'Doubts', 'Subscription', 'PaymentSuccess', 'PaymentFail', 'PaymentCancel', 'MockPaymentPortal', 'PublicExam'
];

importsToLazy.forEach(comp => {
  code = code.replace(new RegExp(`import ${comp} from "\\.\\/pages\\/${comp}";`), `const ${comp} = React.lazy(() => import("./pages/${comp}"));`);
});

code = code.replace(
  '<Router>',
  '<Router>\n        <React.Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex align-center justify-center p-10"><div className="animate-pulse flex items-center justify-center font-bold text-slate-400">Loading...</div></div>}>'
);

code = code.replace(
  '</Router>',
  '</React.Suspense>\n        </Router>'
);

fs.writeFileSync('src/App.tsx', code);
console.log('lazy load applied');
