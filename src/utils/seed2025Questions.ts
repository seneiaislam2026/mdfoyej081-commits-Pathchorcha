import { collection, doc, getDocs, addDoc, query, where, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface QuestionData {
  text: string;
  options: { id: string; label: string }[];
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
  subject: string;
  is_cq: boolean;
  is_k_vandar: boolean;
  is_kh_vandar: boolean;
  isBoardQuestion: boolean;
  boardName: string;
  boardYear: string;
  classLevel: string;
  classGroup: string;
  class: string;
  title: string;
  question_no: number;
}

const seedQuestions: QuestionData[] = [
  // --- DHAKA BOARD 2025 ---
  // Bangla 1st Paper
  {
    text: "ঢাকা বোর্ড ২০২৫: 'অপরিচিতা' গল্পে কল্যাণীর বাবার নাম কী?",
    options: [
      { id: "A", label: "শম্ভুনাথ সেন" },
      { id: "B", label: "হরিশ" },
      { id: "C", label: "অনুপম" },
      { id: "D", label: "আশুতোষ" }
    ],
    optionA: "শম্ভুনাথ সেন",
    optionB: "হরিশ",
    optionC: "অনুপম",
    optionD: "আশুতোষ",
    correctOption: "A",
    explanation: "অপরিচিতা গল্পের কল্যাণীর পিতা শম্ভুনাথ সেন পেশায় একজন ডাক্তার ছিলেন এবং অত্যন্ত আত্মমর্যাদাসম্পন্ন ব্যক্তি ছিলেন।",
    subject: "Bangla 1st Paper",
    is_cq: false,
    is_k_vandar: false,
    is_kh_vandar: false,
    isBoardQuestion: true,
    boardName: "ঢাকা বোর্ড",
    boardYear: "2025",
    classLevel: "এইচএসসি (একাদশ-দ্বাদশ)",
    classGroup: "HSC",
    class: "HSC",
    title: "ঢাকা বোর্ড ২০২৫",
    question_no: 1
  },
  {
    text: "ঢাকা বোর্ড ২০২৫: 'সোনার তরী' কবিতাটি কোন ছন্দে রচিত?",
    options: [
      { id: "A", label: "অমিত্রাক্ষর" },
      { id: "B", label: "মাত্রাবৃত্ত" },
      { id: "C", label: "অক্ষরবৃত্ত" },
      { id: "D", label: "স্বরবৃত্ত" }
    ],
    optionA: "অমিত্রাক্ষর",
    optionB: "মাত্রাবৃত্ত",
    optionC: "অক্ষরবৃত্ত",
    optionD: "স্বরবৃত্ত",
    correctOption: "B",
    explanation: "রবীন্দ্রনাথ ঠাকুরের বিখ্যাত 'সোনার তরী' কবিতাটি মূলত ৮+৬ মাত্রার মাত্রাবৃত্ত ছন্দে রচিত।",
    subject: "Bangla 1st Paper",
    is_cq: false,
    is_k_vandar: false,
    is_kh_vandar: false,
    isBoardQuestion: true,
    boardName: "ঢাকা বোর্ড",
    boardYear: "2025",
    classLevel: "এইচএসসি (একাদশ-দ্বাদশ)",
    classGroup: "HSC",
    class: "HSC",
    title: "ঢাকা বোর্ড ২০২৫",
    question_no: 2
  },
  {
    text: "ঢাকা বোর্ড ২০২৫: 'বিলাসী' গল্পে বিলাসী কোন জাতের মেয়ে ছিল?",
    options: [
      { id: "A", label: "কায়স্থ" },
      { id: "B", label: "সাপুড়ে" },
      { id: "C", label: "বৈষ্ণব" },
      { id: "D", label: "কর্মকার" }
    ],
    optionA: "কায়স্থ",
    optionB: "সাপুড়ে",
    optionC: "বৈষ্ণব",
    optionD: "কর্মকার",
    correctOption: "B",
    explanation: "শরৎচন্দ্র চট্টোপাধ্যায়ের 'বিলাসী' গল্পের বিলাসী ছিল সাপুড়ে সম্প্রদায়ের মেয়ে।",
    subject: "Bangla 1st Paper",
    is_cq: false,
    is_k_vandar: false,
    is_kh_vandar: false,
    isBoardQuestion: true,
    boardName: "ঢাকা বোর্ড",
    boardYear: "2025",
    classLevel: "এইচএসসি (একাদশ-দ্বাদশ)",
    classGroup: "HSC",
    class: "HSC",
    title: "ঢাকা বোর্ড ২০২৫",
    question_no: 3
  },
  // ICT
  {
    text: "ঢাকা বোর্ড ২০২৫: HTML-এ সবচেয়ে বড় হেডিং ট্যাগ কোনটি?",
    options: [
      { id: "A", label: "<h6>" },
      { id: "B", label: "<heading>" },
      { id: "C", label: "<h1>" },
      { id: "D", label: "<head>" }
    ],
    optionA: "<h6>",
    optionB: "<heading>",
    optionC: "<h1>",
    optionD: "<head>",
    correctOption: "C",
    explanation: "HTML-এ সবচেয়ে বড় হেডিং প্রদর্শনের জন্য <h1> ট্যাগ এবং সবচেয়ে ছোটটির জন্য <h6> ব্যবহার করা হয়।",
    subject: "ICT",
    is_cq: false,
    is_k_vandar: false,
    is_kh_vandar: false,
    isBoardQuestion: true,
    boardName: "ঢাকা বোর্ড",
    boardYear: "2025",
    classLevel: "এইচএসসি (একাদশ-দ্বাদশ)",
    classGroup: "HSC",
    class: "HSC",
    title: "ঢাকা বোর্ড ২০২৫",
    question_no: 4
  },
  {
    text: "ঢাকা বোর্ড ২০২৫: বাইনারি সংখ্যা পদ্ধতির ভিত্তি বা বেস কত?",
    options: [
      { id: "A", label: "২" },
      { id: "B", label: "৮" },
      { id: "C", label: "১০" },
      { id: "D", label: "১৬" }
    ],
    optionA: "২",
    optionB: "৮",
    optionC: "১০",
    optionD: "১৬",
    correctOption: "A",
    explanation: "বাইনারি সংখ্যা পদ্ধতিতে দুটি অংক (০ এবং ১) ব্যবহার করা হয়, তাই এর ভিত্তি বা বেস হলো ২।",
    subject: "ICT",
    is_cq: false,
    is_k_vandar: false,
    is_kh_vandar: false,
    isBoardQuestion: true,
    boardName: "ঢাকা বোর্ড",
    boardYear: "2025",
    classLevel: "এইচএসসি (একাদশ-দ্বাদশ)",
    classGroup: "HSC",
    class: "HSC",
    title: "ঢাকা বোর্ড ২০২৫",
    question_no: 5
  },
  // Physics 1st Paper
  {
    text: "ঢাকা বোর্ড ২০২৫: দুটি সমান ভেক্টরের লব্ধির সর্বোচ্চ মান কত হবে যখন তারা একই দিকে ক্রিয়া করে?",
    options: [
      { id: "A", label: "ভেক্টরদ্বয়ের সমষ্টির দ্বিগুণ" },
      { id: "B", label: "ভেক্টরদ্বয়ের সমষ্টির সমান" },
      { id: "C", label: "শূন্য" },
      { id: "D", label: "ভেক্টরদ্বয়ের গুণফলের সমান" }
    ],
    optionA: "ভেক্টরদ্বয়ের সমষ্টির দ্বিগুণ",
    optionB: "ভেক্টরদ্বয়ের সমষ্টির সমান",
    optionC: "শূন্য",
    optionD: "ভেক্টরদ্বয়ের গুণফলের সমান",
    correctOption: "B",
    explanation: "দুটি ভেক্টর একই দিকে (θ = 0°) ক্রিয়া করলে লব্ধি সর্বোচ্চ হয় এবং এর মান ভেক্টরদ্বয়ের যোগফলের সমান (R = P + Q) হয়।",
    subject: "Physics 1st Paper",
    is_cq: false,
    is_k_vandar: false,
    is_kh_vandar: false,
    isBoardQuestion: true,
    boardName: "ঢাকা বোর্ড",
    boardYear: "2025",
    classLevel: "এইচএসসি (একাদশ-দ্বাদশ)",
    classGroup: "HSC",
    class: "HSC",
    title: "ঢাকা বোর্ড ২০২৫",
    question_no: 6
  },

  // --- MYMENSINGH BOARD 2025 ---
  // Bangla 1st Paper
  {
    text: "ময়মনসিংহ বোর্ড ২০২৫: 'বিলাসী' গল্পে মৃত্যুঞ্জয় কার বাগানের মালিক ছিল?",
    options: [
      { id: "A", label: "আম ও কাঁঠাল বাগান" },
      { id: "B", label: "লিচু ও আম বাগান" },
      { id: "C", label: "নারকেল বাগান" },
      { id: "D", label: "পেয়ারা বাগান" }
    ],
    optionA: "আম ও কাঁঠাল বাগান",
    optionB: "লিচু ও আম বাগান",
    optionC: "নারকেল বাগান",
    optionD: "পেয়ারা বাগান",
    correctOption: "A",
    explanation: "মৃত্যুঞ্জয়ের উত্তরাধিকারসূত্রে পাওয়া একমাত্র সম্পদ ছিল একটি বিশাল আম ও কাঁঠালের বাগান, যা বিলাসী গল্পে বিশেষভাবে আলোচিত হয়েছে।",
    subject: "Bangla 1st Paper",
    is_cq: false,
    is_k_vandar: false,
    is_kh_vandar: false,
    isBoardQuestion: true,
    boardName: "ময়মনসিংহ বোর্ড",
    boardYear: "2025",
    classLevel: "এইচএসসি (একাদশ-দ্বাদশ)",
    classGroup: "HSC",
    class: "HSC",
    title: "ময়মনসিংহ বোর্ড ২০২৫",
    question_no: 1
  },
  {
    text: "ময়মনসিংহ বোর্ড ২০২৫: 'অপরিচিতা' গল্পে অনুপমের আসল অভিভাবক কে ছিলেন?",
    options: [
      { id: "A", label: "অনুপমের মামা" },
      { id: "B", label: "অনুপমের মা" },
      { id: "C", label: "হরিশ" },
      { id: "D", label: "শম্ভুনাথ বাবু" }
    ],
    optionA: "অনুপমের মামা",
    optionB: "অনুপমের মা",
    optionC: "হরিশ",
    optionD: "শম্ভুনাথ বাবু",
    correctOption: "A",
    explanation: "অনুপমের মামা ছিলেন তার চেয়ে মাত্র বছর ছয়েকের বড়, কিন্তু তিনিই ছিলেন অনুপমের জীবনের আসল চালিকাশক্তি এবং সর্বময় অভিভাবক।",
    subject: "Bangla 1st Paper",
    is_cq: false,
    is_k_vandar: false,
    is_kh_vandar: false,
    isBoardQuestion: true,
    boardName: "ময়মনসিংহ বোর্ড",
    boardYear: "2025",
    classLevel: "এইচএসসি (একাদশ-দ্বাদশ)",
    classGroup: "HSC",
    class: "HSC",
    title: "ময়মনসিংহ বোর্ড ২০২৫",
    question_no: 2
  },
  // ICT
  {
    text: "ময়মনসিংহ বোর্ড ২০২৫: IPV6 ঠিকানায় কতটি বিট ব্যবহার করা হয়?",
    options: [
      { id: "A", label: "৩২ বিট" },
      { id: "B", label: "৬৪ বিট" },
      { id: "C", label: "১২৮ বিট" },
      { id: "D", label: "২৫৬ বিট" }
    ],
    optionA: "৩২ বিট",
    optionB: "৬৪ বিট",
    optionC: "১২৮ বিট",
    optionD: "২৫৬ বিট",
    correctOption: "C",
    explanation: "IPv6 বা ইন্টারনেট প্রোটোকল ভার্সন ৬ অ্যাড্রেস ১২৮ বিটের হয়ে থাকে, যা হেক্সাডেসিমেল ফরম্যাটে প্রকাশ করা হয়।",
    subject: "ICT",
    is_cq: false,
    is_k_vandar: false,
    is_kh_vandar: false,
    isBoardQuestion: true,
    boardName: "ময়মনসিংহ বোর্ড",
    boardYear: "2025",
    classLevel: "এইচএসসি (একাদশ-দ্বাদশ)",
    classGroup: "HSC",
    class: "HSC",
    title: "ময়মনসিংহ বোর্ড ২০২৫",
    question_no: 3
  },
  {
    text: "ময়মনসিংহ বোর্ড ২০২৫: নিচের কোনটি সামাজিক যোগাযোগের মাধ্যম নয়?",
    options: [
      { id: "A", label: "Facebook" },
      { id: "B", label: "LinkedIn" },
      { id: "C", label: "Wikipedia" },
      { id: "D", label: "Twitter" }
    ],
    optionA: "Facebook",
    optionB: "LinkedIn",
    optionC: "Wikipedia",
    optionD: "Twitter",
    correctOption: "C",
    explanation: "উইকিপিডিয়া (Wikipedia) হলো একটি উন্মুক্ত ইন্টারনেট বিশ্বকোষ, এটি সামাজিক যোগাযোগ মাধ্যম নয়।",
    subject: "ICT",
    is_cq: false,
    is_k_vandar: false,
    is_kh_vandar: false,
    isBoardQuestion: true,
    boardName: "ময়মনসিংহ বোর্ড",
    boardYear: "2025",
    classLevel: "এইচএসসি (একাদশ-দ্বাদশ)",
    classGroup: "HSC",
    class: "HSC",
    title: "ময়মনসিংহ বোর্ড ২০২৫",
    question_no: 4
  },
  // Physics 1st Paper
  {
    text: "ময়মনসিংহ বোর্ড ২০২৫: অভিকর্ষজ ত্বরণ 'g' এর মান ভূপৃষ্ঠের কোথায় সবচেয়ে বেশি?",
    options: [
      { id: "A", label: "মেরু অঞ্চলে" },
      { id: "B", label: "বিষুবীয় অঞ্চলে" },
      { id: "C", label: "পৃথিবীর কেন্দ্রে" },
      { id: "D", label: "ভূপৃষ্ঠের গভীরে" }
    ],
    optionA: "মেরু অঞ্চলে",
    optionB: "বিষুবীয় অঞ্চলে",
    optionC: "পৃথিবীর কেন্দ্রে",
    optionD: "ভূপৃষ্ঠের গভীরে",
    correctOption: "A",
    explanation: "পৃথিবী পুরোপুরি গোল না হয়ে মেরু অঞ্চলে কিছুটা চাপা হওয়ার কারণে মেরু অঞ্চলে ব্যাসার্ধ (R) সবচেয়ে কম, তাই অভিকর্ষজ ত্বরণ g এর মান মেরু অঞ্চলে সবচেয়ে বেশি (৯.৮৩ m/s²)।",
    subject: "Physics 1st Paper",
    is_cq: false,
    is_k_vandar: false,
    is_kh_vandar: false,
    isBoardQuestion: true,
    boardName: "ময়মনসিংহ বোর্ড",
    boardYear: "2025",
    classLevel: "এইচএসসি (একাদশ-দ্বাদশ)",
    classGroup: "HSC",
    class: "HSC",
    title: "ময়মনসিংহ বোর্ড ২০২৫",
    question_no: 5
  },

  // --- RAJSHAHI BOARD 2025 ---
  // Bangla 1st Paper
  {
    text: "রাজশাহী বোর্ড ২০২৫: 'সোনার তরী' কবিতায় তরুণের নিয়ে যাওয়া ধান কিসের প্রতীক?",
    options: [
      { id: "A", label: "মানুষের কর্মফলের প্রতীক" },
      { id: "B", label: "কৃষকের ধনের প্রতীক" },
      { id: "C", label: "নশ্বর শরীরের প্রতীক" },
      { id: "D", label: "প্রকৃতির রূপের প্রতীক" }
    ],
    optionA: "মানুষের কর্মফলের প্রতীক",
    optionB: "কৃষকের ধনের প্রতীক",
    optionC: "নশ্বর শরীরের প্রতীক",
    optionD: "প্রকৃতির রূপের প্রতীক",
    correctOption: "A",
    explanation: "সোনার তরী কবিতায় ধান হলো মানুষের জীবনের শ্রেষ্ঠ সৃষ্টি বা মহৎ কর্মফল, যা কালের নৌকায় স্থান পায়, কিন্তু নশ্বর মানুষ নিজে স্থান পায় না।",
    subject: "Bangla 1st Paper",
    is_cq: false,
    is_k_vandar: false,
    is_kh_vandar: false,
    isBoardQuestion: true,
    boardName: "রাজশাহী বোর্ড",
    boardYear: "2025",
    classLevel: "এইচএসসি (একাদশ-দ্বাদশ)",
    classGroup: "HSC",
    class: "HSC",
    title: "রাজশাহী বোর্ড ২০২৫",
    question_no: 1
  },
  {
    text: "রাজশাহী বোর্ড ২০২৫: কল্যাণী কোন ব্রত গ্রহণ করেছিল?",
    options: [
      { id: "A", label: "মাতৃভূমি সেবাব্রত" },
      { id: "B", label: "মেয়েদের শিক্ষাব্রত" },
      { id: "C", label: "ধর্মীয় ব্রত" },
      { id: "D", label: "গৃহকোণ সেবাব্রত" }
    ],
    optionA: "মাতৃভূমি সেবাব্রত",
    optionB: "মেয়েদের শিক্ষাব্রত",
    optionC: "ধর্মীয় ব্রত",
    optionD: "গৃহকোণ সেবাব্রত",
    correctOption: "B",
    explanation: "কল্যাণী বিয়ে ভেঙে যাওয়ার পর নিজেকে মেয়েদের শিক্ষার প্রসারে বিলিয়ে দেয় এবং মেয়েদের শিক্ষাব্রত গ্রহণ করে।",
    subject: "Bangla 1st Paper",
    is_cq: false,
    is_k_vandar: false,
    is_kh_vandar: false,
    isBoardQuestion: true,
    boardName: "রাজশাহী বোর্ড",
    boardYear: "2025",
    classLevel: "এইচএসসি (একাদশ-দ্বাদশ)",
    classGroup: "HSC",
    class: "HSC",
    title: "রাজশাহী বোর্ড ২০২৫",
    question_no: 2
  },
  // ICT
  {
    text: "রাজশাহী বোর্ড ২০২৫: নিচের কোনটি ডেটাবেজ ল্যাঙ্গুয়েজ বা কুয়েরি ভাষা?",
    options: [
      { id: "A", label: "HTML" },
      { id: "B", label: "SQL" },
      { id: "C", label: "C++" },
      { id: "D", label: "HTTP" }
    ],
    optionA: "HTML",
    optionB: "SQL",
    optionC: "C++",
    optionD: "HTTP",
    correctOption: "B",
    explanation: "SQL (Structured Query Language) হলো রিলেশনাল ডেটাবেজ ম্যানেজমেন্ট সিস্টেমে ডেটা কুয়েরি ও ম্যানিপুলেশন করার জন্য বহুল ব্যবহৃত একটি ভাষা।",
    subject: "ICT",
    is_cq: false,
    is_k_vandar: false,
    is_kh_vandar: false,
    isBoardQuestion: true,
    boardName: "রাজশাহী বোর্ড",
    boardYear: "2025",
    classLevel: "এইচএসসি (একাদশ-দ্বাদশ)",
    classGroup: "HSC",
    class: "HSC",
    title: "রাজশাহী বোর্ড ২০২৫",
    question_no: 3
  },
  {
    text: "রাজশাহী বোর্ড ২০২৫: নিচের কোনটি পূর্ণাঙ্গ ডোমেইন নাম (URL)?",
    options: [
      { id: "A", label: "www.google" },
      { id: "B", label: "http://www.google.com" },
      { id: "C", label: "google.com" },
      { id: "D", label: "https://google" }
    ],
    optionA: "www.google",
    optionB: "http://www.google.com",
    optionC: "google.com",
    optionD: "https://google",
    correctOption: "B",
    explanation: "পূর্ণাঙ্গ ইউআরএল (URL) এ প্রোটোকল (http://), ডোমেন হোস্ট (www) এবং ডোমেন টাইপ (.com) সব অংশ থাকে।",
    subject: "ICT",
    is_cq: false,
    is_k_vandar: false,
    is_kh_vandar: false,
    isBoardQuestion: true,
    boardName: "রাজশাহী বোর্ড",
    boardYear: "2025",
    classLevel: "এইচএসসি (একাদশ-দ্বাদশ)",
    classGroup: "HSC",
    class: "HSC",
    title: "রাজশাহী বোর্ড ২০২৫",
    question_no: 4
  },
  // Physics 1st Paper
  {
    text: "রাজশাহী বোর্ড ২০২৫: কোনো স্প্রিংকে কেটে অর্ধেক করা হলে তার স্প্রিং ধ্রুবক কেমন হবে?",
    options: [
      { id: "A", label: "অর্ধেক হবে" },
      { id: "B", label: "দ্বিগুণ হবে" },
      { id: "C", label: "চারগুণ হবে" },
      { id: "D", label: "অপরিবর্তিত থাকবে" }
    ],
    optionA: "অর্ধেক হবে",
    optionB: "দ্বিগুণ হবে",
    optionC: "চারগুণ হবে",
    optionD: "অপরিবর্তিত থাকবে",
    correctOption: "B",
    explanation: "স্প্রিং ধ্রুবক (k) স্প্রিংয়ের দৈর্ঘ্যের (L) ব্যস্তানুপাতিক (k ∝ 1/L)। দৈর্ঘ্য অর্ধেক করা হলে স্প্রিং ধ্রুবক দ্বিগুণ হয়ে যায়।",
    subject: "Physics 1st Paper",
    is_cq: false,
    is_k_vandar: false,
    is_kh_vandar: false,
    isBoardQuestion: true,
    boardName: "রাজশাহী বোর্ড",
    boardYear: "2025",
    classLevel: "এইচএসসি (একাদশ-দ্বাদশ)",
    classGroup: "HSC",
    class: "HSC",
    title: "রাজশাহী বোর্ড ২০২৫",
    question_no: 5
  }
];

export async function seed2025BoardQuestions() {
  const flag = "seeded_2025_board_questions_v1";
  if (localStorage.getItem(flag) === "true") {
    return;
  }

  try {
    // Check if 2025 board questions already exist to avoid duplications
    const qCol = collection(db, "questions");
    const testQuery = query(qCol, where("boardYear", "==", "2025"));
    const snapshot = await getDocs(testQuery);

    if (snapshot.size > 0) {
      localStorage.setItem(flag, "true");
      console.log("2025 board questions already exist in Firestore.");
      return;
    }

    console.log("Seeding 2025 Board Questions for Dhaka, Mymensingh, and Rajshahi...");
    const batch = writeBatch(db);

    for (const item of seedQuestions) {
      const docRef = doc(collection(db, "questions"));
      batch.set(docRef, {
        ...item,
        createdAt: serverTimestamp()
      });
    }

    await batch.commit();
    localStorage.setItem(flag, "true");
    console.log("Successfully seeded 2025 board questions!");
  } catch (error) {
    console.error("Error seeding 2025 board questions:", error);
  }
}
