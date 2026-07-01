import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Load Firebase Config
const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const userQuestionsInput = [
  {
    "no": 1,
    "answer": "ঘ",
    "explanation": "মোহাম্মদি বেগ মাত্র পাঁচ টাকার বিনিময়ে সিরাজউদ্দৌলাকে হত্যা করতে রাজি হয়েছিল।"
  },
  {
    "no": 2,
    "answer": "খ",
    "explanation": "উক্তিটি বীরের অটল সাহস ও দৃঢ় সংকল্পকে প্রকাশ করে।"
  },
  {
    "no": 3,
    "answer": "ঘ",
    "explanation": "টুপুর নিষ্ঠুর আচরণের সঙ্গে মোহাম্মদি বেগের বিশ্বাসঘাতকতার মিল রয়েছে।"
  },
  {
    "no": 4,
    "answer": "ঘ",
    "explanation": "মোহনলালের মধ্যে কৃতজ্ঞতা, প্রভুভক্তি ও আত্মত্যাগ—তিনটি গুণই বিদ্যমান।"
  },
  {
    "no": 5,
    "answer": "গ",
    "explanation": "সিকান্দার আবু জাফর 'সমকাল' সাহিত্যপত্রিকার সম্পাদক ছিলেন।"
  },
  {
    "no": 6,
    "answer": "খ",
    "explanation": "তিনি 'মাসিক সমকাল' সম্পাদনা করেন।"
  },
  {
    "no": 7,
    "answer": "ক",
    "explanation": "এরিস্টটল নাটকের তিনটি ঐক্যের কথা বলেছেন।"
  },
  {
    "no": 8,
    "answer": "ক",
    "explanation": "'সিরাজউদ্দৌলা' নাটকে মোট চারটি অঙ্ক রয়েছে।"
  },
  {
    "no": 9,
    "answer": "ক",
    "explanation": "সিরাজউদ্দৌলার প্রধান প্রতিবন্ধকতা ছিল প্রাসাদের অভ্যন্তরীণ ষড়যন্ত্র।"
  },
  {
    "no": 10,
    "answer": "ক",
    "explanation": "রাইসুল জুহালা চরিত্র নাটকে হাস্যরসের সৃষ্টি করেছে।"
  },
  {
    "no": 11,
    "answer": "খ",
    "explanation": "প্রথম অঙ্কের প্রথম দৃশ্যের স্থান ফোর্ট উইলিয়াম জাহাজ।"
  },
  {
    "no": 12,
    "answer": "খ",
    "explanation": "নবাবের পদাতিক বাহিনী দমদমের সরু রাস্তা দিয়ে দুর্গ আক্রমণ করে।"
  },
  {
    "no": 13,
    "answer": "গ",
    "explanation": "ক্লেটন ব্রিটিশ সৈন্যদের প্রাণপণে যুদ্ধ করতে উৎসাহিত করে।"
  },
  {
    "no": 14,
    "answer": "গ",
    "explanation": "ওয়ালি খানের বক্তব্যে বাঙালির জাতীয়তাবোধ প্রকাশ পেয়েছে।"
  },
  {
    "no": 15,
    "answer": "খ",
    "explanation": "নাটকের প্রথম সংলাপটি ক্লেটনের।"
  },
  {
    "no": 16,
    "answer": "ক",
    "explanation": "'বাঙালি কাপুরুষ নয়'—এ সংলাপে স্বাজাত্যবোধ প্রকাশ পেয়েছে।"
  },
  {
    "no": 17,
    "answer": "ঘ",
    "explanation": "'যত বড় মুখ নয় তত বড় কথা'—সংলাপটি ক্লেটনের।"
  },
  {
    "no": 18,
    "answer": "ক",
    "explanation": "বাক্যটির অর্থ হলো অতিরিক্ত স্পর্ধা বা বাড়াবাড়ি করা।"
  },
  {
    "no": 19,
    "answer": "ঘ",
    "explanation": "উমিচাঁদ হলওয়েলকে এ কথা বলেছিল।"
  },
  {
    "no": 20,
    "answer": "গ",
    "explanation": "দুর্গ আক্রমণের সময় গভর্নর ড্রেক নৌকায় করে পালিয়ে যায়।"
  },
  {
    "no": 21,
    "answer": "খ",
    "explanation": "উক্তিটি উমিচাঁদের।"
  },
  {
    "no": 22,
    "answer": "ঘ",
    "explanation": "'কেউ এক চুল নড়লে প্রাণ যাবে'—উক্তিটি মানিকচাঁদের।"
  },
  {
    "no": 23,
    "answer": "খ",
    "explanation": "ফরাসি ও ইংরেজদের প্রসঙ্গে ব্যঙ্গাত্মক মন্তব্যটি সিরাজের।"
  },
  {
    "no": 24,
    "answer": "খ",
    "explanation": "সিরাজ মানিকচাঁদকে আলিনগরের দেওয়ান নিয়োগ করেন।"
  },
  {
    "no": 25,
    "answer": "ঘ",
    "explanation": "নবাব মুর্শিদাবাদে গিয়ে বন্দিদের বিচার করবেন বলে জানান।"
  },
  {
    "no": 26,
    "answer": "গ",
    "explanation": "প্রথম অঙ্কের দ্বিতীয় দৃশ্য ঘসেটি বেগমের বাড়িতে সংঘটিত হয়।"
  },
  {
    "no": 27,
    "answer": "ক",
    "explanation": "ঘুষ প্রসঙ্গের উক্তিটি একজন ইংরেজ মহিলার।"
  },
  {
    "no": 28,
    "answer": "খ",
    "explanation": "উমিচাঁদ লাহোর থেকে বাংলাদেশে এসেছিল।"
  },
  {
    "no": 29,
    "answer": "গ",
    "explanation": "'আমি চিরকালই ইংরেজদের বন্ধু'—উক্তিটি উমিচাঁদের।"
  },
  {
    "no": 30,
    "answer": "খ",
    "explanation": "'আমি আপনাদেরই, সমগোত্রীয়'—এই উক্তিতে উমিচাঁদের বিদ্রূপ প্রকাশ পেয়েছে।"
  }
];

async function run() {
  console.log("Generating full Bangla 1st Paper (সিরাজউদ্দৌলা) MCQ questions using Gemini...");
  
  const prompt = `You are an expert Bangla teacher and examiner for the HSC (Higher Secondary Certificate) in Bangladesh. 
Your task is to generate 30 high-quality, exam-standard Multiple Choice Questions (MCQs) for the HSC Bangla 1st Paper drama (নাটক) "সিরাজউদ্দৌলা" (Sirajuddaula) by Sikandar Abu Zafar.

I am providing you with a list of 30 entries. For each entry, you are given the question number ("no"), the correct answer in Bangla ("answer", which is one of "ক", "খ", "গ", "ঘ"), and the "explanation" in Bangla.

You must reconstruct the full question text and the 4 options (mapped to ক -> A, খ -> B, গ -> C, ঘ -> D) such that:
1. The question text ("text") must be completely in Bangla and perfectly match the context of the drama "সিরাজউদ্দৌলা" and the provided "explanation".
2. The options (A, B, C, D) must contain realistic, challenging Bangla options that match the context.
3. The "correctOption" field MUST be "A" if the answer was "ক", "B" if "খ", "C" if "গ", "D" if "ঘ".
4. The generated question must be historically accurate to the drama text (by Sikandar Abu Zafar).
5. Retain and include the exact "explanation" provided for each question, expanding it slightly if helpful, but keeping it as the core justification.

Here is the input data:
${JSON.stringify(userQuestionsInput, null, 2)}

Generate the output as a JSON array of 30 questions. Each object in the array must strictly have this schema:
{
  "no": number,
  "text": "The full question text in Bangla",
  "correctOption": "A" | "B" | "C" | "D",
  "options": [
    { "id": "A", "label": "Option label in Bangla (ক)" },
    { "id": "B", "label": "Option label in Bangla (খ)" },
    { "id": "C", "label": "Option label in Bangla (গ)" },
    { "id": "D", "label": "Option label in Bangla (ঘ)" }
  ],
  "explanation": "The explanation in Bangla"
}

Make sure the output is pure JSON (no markdown formatting code blocks, just pure JSON parsing string).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const questionsText = response.text;
    console.log("Gemini generation complete.");
    const questions = JSON.parse(questionsText.trim());
    console.log(`Successfully parsed ${questions.length} questions.`);

    // Write a backup locally
    const backupDir = path.resolve(process.cwd(), 'src/data');
    if (!fs.existsSync(backupDir)){
        fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.writeFileSync(path.join(backupDir, 'sirajuddaula_mcq.json'), JSON.stringify(questions, null, 2), 'utf8');
    console.log("Local backup saved to src/data/sirajuddaula_mcq.json");

    // Clean up any existing questions for subject: "Bangla 1st Paper" and title: "সিরাজউদ্দৌলা"
    console.log("Cleaning up any existing questions for 'সিরাজউদ্দৌলা' in Firestore...");
    const qClean = query(collection(db, "questions"), where("subject", "==", "Bangla 1st Paper"), where("title", "==", "সিরাজউদ্দৌলা"));
    const snap = await getDocs(qClean);
    console.log(`Found ${snap.size} existing questions. Deleting...`);
    for (const docSnap of snap.docs) {
      await deleteDoc(docSnap.ref);
    }
    console.log("Cleanup complete.");

    // Target mapping classes
    const targetClasses = [
      { classGroup: "HSC", class: "HSC" },
      { classGroup: "HSC", class: "Class 11" },
      { classGroup: "Admission", class: "Admission" }
    ];

    console.log("Uploading generated questions to Firestore...");
    let uploadedCount = 0;
    for (const q of questions) {
      const optionA = q.options.find(o => o.id === 'A')?.label || "";
      const optionB = q.options.find(o => o.id === 'B')?.label || "";
      const optionC = q.options.find(o => o.id === 'C')?.label || "";
      const optionD = q.options.find(o => o.id === 'D')?.label || "";

      for (const target of targetClasses) {
        const payload = {
          text: q.text,
          is_cq: false,
          is_k_vandar: false,
          is_kh_vandar: false,
          class: target.class,
          classGroup: target.classGroup,
          university: "",
          subject: "Bangla 1st Paper",
          title: "সিরাজউদ্দৌলা",
          correctOption: q.correctOption,
          explanation: q.explanation,
          options: q.options,
          optionA,
          optionB,
          optionC,
          optionD,
          createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "questions"), payload);
        uploadedCount++;
      }
    }

    console.log(`Upload complete! Successfully added ${uploadedCount} question entries (${questions.length} unique questions across ${targetClasses.length} targets).`);
    process.exit(0);

  } catch (error) {
    console.error("Error generating and uploading questions:", error);
    process.exit(1);
  }
}

run();
