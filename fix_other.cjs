const fs = require('fs');

const files = [
  'src/pages/QuestionBank.tsx',
  'src/pages/SubjectNotes.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/প্রশ্নব্যাংক/g, 'নোটস');
  content = content.replace(/প্রশ্ন ব্যাংক/g, 'নোটস');
  content = content.replace(/টপিক ভিত্তিক প্রশ্ন/g, 'টপিক ভিত্তিক নোটস');
  fs.writeFileSync(file, content);
}
