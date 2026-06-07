const fs = require('fs');
let code = fs.readFileSync('src/pages/QuestionBank.tsx', 'utf8');

code = code.replace(/নোটস • Question Bank/g, 'নোটস • Notes Module');
code = code.replace(/বিষয়ভিত্তিক প্রশ্ন এবং অনুশীলন/g, 'বিষয়ভিত্তিক নোটস এবং অনুশীলন');
code = code.replace(/এই বিভাগে কোনো প্রশ্নপত্র পাওয়া যায়নি/g, 'এই বিভাগে কোনো নোটস পাওয়া যায়নি');
code = code.replace(/প্রশ্ন/g, 'নোটস'); // Wait, the quiz will also be affected if I do this globally! Let's be careful.

fs.writeFileSync('src/pages/QuestionBank.tsx', code);
