const fs = require('fs');
let code = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

const banner = '{window.self !== window.top && (\n  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 shadow-sm">\n    <h4 className="text-amber-800 font-bold font-bengali text-sm flex items-center gap-2 mb-1">\n       <AlertCircle className="w-4 h-4" /> প্রিভিউ মোড অ্যালার্ট\n    </h4>\n    <p className="text-amber-700 font-bengali text-xs">\n      লগিন বারবার মুছে গেলে, দয়াকরে লিংকটি কপি করে ওয়েবসাইটটি নতুন ট্যাবে বা ব্রাউজারে ওপেন করুন। আইফ্রেমের কারণে লগিন মুছে যেতে পারে।\n    </p>\n  </div>\n)}';

code = code.replace('<div className="text-center space-y-2 mb-8">', banner + '\n        <div className="text-center space-y-2 mb-8">');

if (!code.includes('AlertCircle')) {
  code = code.replace('import { Lock', 'import { AlertCircle, Lock');
}

fs.writeFileSync('src/pages/Auth.tsx', code);
console.log('done auth');
