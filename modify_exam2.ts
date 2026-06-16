import fs from 'fs';

let content = fs.readFileSync('src/pages/Exam.tsx', 'utf8');

// Add state for dynamicChaptersMap
content = content.replace(
    `const [expandedChaps, setExpandedChaps] = useState<Record<string, boolean>>({});`,
    `const [expandedChaps, setExpandedChaps] = useState<Record<string, boolean>>({});\n  const [dynamicChaptersMap, setDynamicChaptersMap] = useState<Record<string, string[]>>({});`
);

// Map topic logic when loading
content = content.replace(
    `let finalQs = allQs;`,
    `const topicsMap: Record<string, Set<string>> = {};
          allQs.forEach(q => {
             const sub = q.subject;
             if (!sub) return;
             const qChap = q.chapter || q.chapter_name || q.topic || q.chapterName || q.chapter_no || q.title;
             const finalChap = (qChap && typeof qChap === 'string' && qChap.trim() !== '') ? qChap : "সাধারণ প্রশ্ন";
             q._computedChapter = finalChap;
             if (!topicsMap[sub]) topicsMap[sub] = new Set();
             topicsMap[sub].add(finalChap);
          });
          const topicsObj: Record<string, string[]> = {};
          Object.keys(topicsMap).forEach(k => {
             topicsObj[k] = Array.from(topicsMap[k]);
          });
          if (type === 'mock') {
              setDynamicChaptersMap(topicsObj);
          }

          let finalQs = allQs;`
);

// Filtering logic
content = content.replace(
    `const qChapter = q.chapter || q.chapter_name || q.topic || q.chapterName || q.chapter_no || q.title || "অধ্যায় ১";`,
    `const qChapter = q._computedChapter || "সাধারণ প্রশ্ন";`
);

// UI generation logic step 2
content = content.replace(
    `const availableChapters = defaultChaptersMap[subject] || [];`,
    `const availableChapters = dynamicChaptersMap[subject] && dynamicChaptersMap[subject].length > 0 ? dynamicChaptersMap[subject] : (defaultChaptersMap[subject] || ["সাধারণ প্রশ্ন"]);`
);

fs.writeFileSync('src/pages/Exam.tsx', content);
