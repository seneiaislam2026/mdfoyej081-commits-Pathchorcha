import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, BookOpen, Bookmark, BookmarkCheck, X, Eye, Clock, CheckCircle, ChevronRight, FileText, ArrowRight, ArrowLeft, Sparkles, BookOpenCheck, LayoutList, PenTool, Sun, Moon, Type, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { generatePrintableHtml } from "../components/NotesCreator";

// Helper function to map user classes into standardized class groups
export const mapUserClassToGroup = (cls?: string) => {
  if (cls === "এডমিশন" || cls === "Admission") return "Admission";
  if (cls === "দশম শ্রেণী" || cls === "SSC") return "SSC";
  if (cls === "একাদশ শ্রেণী" || cls === "দ্বাদশ শ্রেণী" || cls === "HSC") return "HSC";
  if (cls === "নবম শ্রেণী" || cls === "Class 9") return "SSC";
  if (cls === "৬ষ্ঠ শ্রেণী" || cls === "৭ম শ্রেণী" || cls === "৮ম শ্রেণী" || cls === "৬ষ্ঠ থেকে ৮ম শ্রেণী" || cls === "Class 6-8") return "Class 6-8";
  return "Admission"; // Default fallback to Admission to prevent empty lists
};

export const getSubjectsByGroup = (group?: string, classGroup?: string) => {
  const common = ["বাংলা", "English", "ICT"];
  if (group === "মানবিক") {
    return [...common, "ইতিহাস", "পৌরনীতি", "ভূগোল", "অর্থনীতি", "যুক্তিবিদ্যা", "সমাজবিজ্ঞান"];
  } else if (group === "বাণিজ্য") {
    return [...common, "হিসাববিজ্ঞান", "ব্যবসায় সংগঠন", "ফিন্যান্স", "উদ্ভাবন"];
  }
  return [...common, "উচ্চতর গণিত", "পদার্থবিজ্ঞান", "রসায়ন", "জীববিজ্ঞান"];
};

// Lecture Notes Database
export const ALL_NOTES = [
  {
    id: 'm-1-c-2',
    title: 'ব্যবসায় পরিবেশ — ম্যানেজমেন্ট ১ম পত্র (২ অধ্যায়)',
    subject: 'ব্যবসায় সংগঠন',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ১ম পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ২'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ১ম পত্র ২ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "বিশ্ববিদ্যালয় ভর্তি পরীক্ষার (DU / RU / CU / GST) জন্য ম্যানেজমেন্ট ১ম পত্রের দ্বিতীয় অধ্যায় ‘ব্যবসায় পরিবেশ’ অত্যন্ত গুরুত্বপূর্ণ। এখান থেকে প্রতি বছরই প্রশ্ন আসে, বিশেষ করে পরিবেশের উপাদানগুলো থেকে।",
    chapters: [
        {
            title: "১. ব্যবসায় পরিবেশের উপাদানসমূহ",
            items: [
                "👉 প্রাকৃতিক পরিবেশ: জলবায়ু, ভূ-প্রকৃতি, মৃত্তিকা, খনিজ সম্পদ, নদ-নদী, আয়তন ও অবস্থান।",
                "👉 অর্থনৈতিক পরিবেশ: আয় ও সঞ্চয়, মূলধন ও বিনিয়োগ, অর্থ ও ঋণ ব্যবস্থা, আর্থিক প্রতিষ্ঠান, মানবসম্পদ। (ভর্তি পরীক্ষায় সবচেয়ে বেশি আসে)",
                "👉 সামাজিক পরিবেশ: জনসংখ্যা, ধর্মীয় বিশ্বাস, মূল্যবোধ, শিক্ষা ও সংস্কৃতি, দেশীয় ঐতিহ্য, ভোক্তাদের মনোভাব।",
                "👉 রাজনৈতিক পরিবেশ: সরকার ব্যবস্থা, রাজনৈতিক স্থিতিশীলতা, আইন-শৃঙ্খলা পরিস্থিতি, আন্তর্জাতিক সম্পর্ক, সরকারি নীতিমালা।",
                "👉 আইনগত পরিবেশ: বাণিজ্যিক আইন, শিল্প আইন, পরিবেশ সংরক্ষণ আইন, ভোক্তা অধিকার আইন।",
                "👉 প্রযুক্তিগত পরিবেশ: বিজ্ঞান ও কারিগরি শিক্ষা, উন্নত প্রযুক্তির ব্যবহার, গবেষণা প্রতিষ্ঠান।"
            ]
        },
        {
            title: "২. গুরুত্বপূর্ণ তথ্য ও एमसीक्यू (MCQ)",
            items: [
                "👉 'সংস্কৃতি ও ঐতিহ্য' কোন পরিবেশের উপাদান? — সামাজিক পরিবেশ।",
                "👉 'শেয়ারবাজার ও ব্যাংক' কোন পরিবেশের উপাদান? — অর্থনৈতিক পরিবেশ।",
                "👉 'সরকারের নীতিমালা' কোন পরিবেশের অন্তর্গত? — রাজনৈতিক পরিবেশ।",
                "👉 'ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯' — এটি আইনগত পরিবেশের উপাদান।"
            ]
        }
    ]
}
  },
  {
    id: 'm-1-c-3',
    title: 'একমালিকানা ব্যবসায় — ম্যানেজমেন্ট ১ম পত্র (৩ অধ্যায়)',
    subject: 'ব্যবসায় সংগঠন',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ১ম পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ৩'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ১ম পত্র ৩ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "ম্যানেজমেন্ট ১ম পত্রের ৩য় অধ্যায় ‘একমালিকানা ব্যবসায়’ থেকে পরীক্ষায় মূলত এর বৈশিষ্ট্য ও উপযুক্ত ক্ষেত্র থেকে প্রশ্ন বেশি হয়। এটি প্রাচীনতম ও সবচেয়ে জনপ্রিয় ব্যবসায় সংগঠন।",
    chapters: [
        {
            title: "১. একমালিকানা ব্যবসায়ের মৌলিক ধারণা",
            items: [
                "👉 সংজ্ঞা: যে ব্যবসায়ের মালিক, পরিচালক ও নিয়ন্ত্রক একজন মাত্র ব্যক্তি, তাকে একমালিকানা ব্যবসায় বলে।",
                "👉 এটি পৃথিবীর প্রাচীনতম ব্যবসায়। গঠন করা সবচেয়ে সহজ কারণ এতে কোনো আইনগত বাধ্যবাধকতা নেই।",
                "👉 ট্রেড লাইসেন্স: শহরে বা পৌর এলাকায় ব্যবসায় করতে চাইলে পৌরসভা বা সিটি কর্পোরেশন থেকে ট্রেড লাইসেন্স সংগ্রহ করতে হয়।"
            ]
        },
        {
            title: "২. গুরুত্বপূর্ণ বৈশিষ্ট্যসমূহ",
            items: [
                "👉 অসীম দায়: এই ব্যবসায়ের সবচেয়ে বড় অসুবিধা হলো মালিকের দায় অসীম। কারবারের লোকসান হলে মালিকের ব্যক্তিগত সম্পত্তি দায়বদ্ধ থাকে।",
                "👉 একক ঝুঁকি ও মুনাফা: সমস্ত ঝুঁকি মালিক একা বহন করেন এবং মুনাফাও তিনি একাই ভোগ করেন।",
                "👉 সহজ গঠন ও বিলোপসাধন: যখন খুশি গঠন করা যায়, আবার ইচ্ছা করলেই ব্যবসা বন্ধ করা যায়।",
                "👉 প্রত্যক্ষ সম্পর্ক: ক্রেতা বা ভোক্তাদের সাথে মালিকের সরাসরি বা প্রত্যক্ষ সম্পর্ক তৈরি হয়।"
            ]
        },
        {
            title: "৩. একমালিকানা ব্যবসায়ের উপযুক্ত ক্ষেত্র",
            items: [
                "👉 পচনশীল পণ্যের ব্যবসায়: ফলমূল, শাকসবজি, মাছ-মাংসের দোকান।",
                "👉 রুচি ও শিল্পের ব্যবসায়: দর্জির দোকান, বিউটি পার্লার, সেলুন, স্বর্ণকারের দোকান।",
                "👉 প্রত্যক্ষ সেবামূলক কারবার: ডাক্তারি, ওকালতি, লন্ড্রি।"
            ]
        }
    ]
}
  },
  {
    id: 'm-1-c-4',
    title: 'অংশীদারি ব্যবসায় — ম্যানেজমেন্ট ১ম পত্র (৪ অধ্যায়)',
    subject: 'ব্যবসায় সংগঠন',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ১ম পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ৪'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ১ম পত্র ৪ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "‘অংশীদারি ব্যবসায়’ (Partnership Business) অ্যাডমিশনের জন্য অত্যন্ত গুরুত্বপূর্ণ একটি অধ্যায়। চুক্তি, অংশীদারদের প্রকারভেদ এবং বিলোপসাধন থেকে প্রতি বছরই প্রশ্ন আসে।",
    chapters: [
        {
            title: "১. অংশীদারি ব্যবসায়ের প্রাথমিক ধারণা",
            items: [
                "👉 আইন: বাংলাদেশে ১৯৩২ সালের অংশীদারি আইন অনুযায়ী এটি পরিচালিত হয়।",
                "👉 সদস্য সংখ্যা: সাধারণ ব্যবসায়ের ক্ষেত্রে সর্বনিম্ন ২ জন এবং সর্বোচ্চ ২০ জন। ব্যাংকিং ব্যবসায়ের ক্ষেত্রে সর্বোচ্চ ১০ জন।",
                "👉 ভিত্তি: চুক্তির ভিত্তিতে এই ব্যবসায় গঠিত হয়। চুক্তিই অংশীদারি ব্যবসায়ের মূল ভিত্তি।"
            ]
        },
        {
            title: "২. অংশীদারদের প্রকারভেদ (VVI)",
            items: [
                "👉 সাধারণ অংশীদার: মূলধন দেয় ও পরিচালনায় অংশ নেয়। এদের দায় অসীম।",
                "👉 ঘুমন্ত (Dormant): মূলধন দেয় কিন্তু পরিচালনায় অংশ নেয় না।",
                "👉 নামমাত্র (Nominal): মূলধন দেয় না, পরিচালনায়ও অংশ নেয় না, শুধু ব্যবসায়ের সুনাম বৃদ্ধিতে নিজের নাম ব্যবহারের অনুমতি দেয়।",
                "👉 আপাতদৃষ্টে অংশীদার (Holding out): অবসর নেওয়ার পরও মূলধন উত্তোলন না করে ঋণ হিসেবে জমা রাখে।",
                "👉 নাবালক অংশীদার: চুক্তি করতে পারে গঠন করতে পারে না, তবে অন্য সবার সম্মতিতে শুধু লাভের অংশীদার হতে পারে। এর দায় সীমাবদ্ধ।"
            ]
        },
        {
            title: "৩. নিবন্ধন ও বিলোপসাধন",
            items: [
                "👉 নিবন্ধন না করার ফলাফল: অনিবন্ধিত প্রতিষ্ঠান তৃতীয় পক্ষের বিরুদ্ধে ১০০ টাকার বেশি পাওনার জন্য মামলা করতে পারে না।",
                "👉 বিলোপসাধন: ধারা ৩৯ (স্বাভাবিক বিলোপ), ধারা ৪০ (সম্মতিক্রমে), ধারা ৪১ (বাধ্যতামূলক বিলোপ), ধারা ৪৪ (আদালত কর্তৃক)।"
            ]
        }
    ]
}
  },
  {
    id: 'm-1-c-5',
    title: 'যৌথ মূলধনী ব্যবসায় — ম্যানেজমেন্ট ১ম পত্র (৫ অধ্যায়)',
    subject: 'ব্যবসায় সংগঠন',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ১ম পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ৫'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ১ম পত্র ৫ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "সবচেয়ে বড় ও গুরুত্বপূর্ণ অধ্যায় হলো 'যৌথ মূলধনী ব্যবসায়'। কোম্পানি আইন, প্রকারভেদ, শেয়ার এবং স্মারকলিপি থেকে এখানে বিস্তারিত নোটস দেওয়া হলো।",
    chapters: [
        {
            title: "১. কোম্পানির ধারণা",
            items: [
                "👉 আইন: বাংলাদেশে বর্তমানে ১৯৯৪ সালের কোম্পানি আইন চালু রয়েছে। বিশ্বের প্রথম কোম্পানি আইন পাশ হয় ব্রিটেনে ১৮৪৪ সালে।",
                "👉 কৃত্রিম ব্যক্তিসত্তা: কোম্পানি নিজ নামে মামলা করতে ও চুক্তি করতে পারে।",
                "👉 চিরন্তন অস্তিত্ব ও সীমাবদ্ধ দায়: কোম্পানির অস্তিত্ব চিরন্তন। শেয়ারহোল্ডারদের দায় সীমিত।"
            ]
        },
        {
            title: "২. পাবলিক ও প্রাইভেট কোম্পানি",
            items: [
                "👉 প্রাইভেট লিমিটেড কোম্পানি: সদস্য সংখ্যা সর্বনিম্ন ২ জন, সর্বোচ্চ ৫০ জন। শেয়ার অবাধে হস্তান্তরযোগ্য নয়। পরিচালক ন্যূনতম ২ জন।",
                "👉 পাবলিক লিমিটেড কোম্পানি: সদস্য সংখ্যা সর্বনিম্ন ৭ জন, সর্বোচ্চ শেয়ার সংখ্যা দ্বারা সীমাবদ্ধ। শেয়ার অবাধে হস্তান্তরযোগ্য। পরিচালক ন্যূনতম ৩ জন।"
            ]
        },
        {
            title: "৩. গুরুত্বপূর্ণ দলিলসমূহ",
            items: [
                "👉 স্মারকলিপি (Memorandum of Association): এটি কোম্পানির প্রধান দলিল। এতে কোম্পানির নাম, ঠিকানা, উদ্দেশ্য, মূলধন, দায় এবং সম্মতি—এই ৬টি ধারা থাকে।",
                "👉 পরিমেল নিয়মাবলি (Articles of Association): এটি কোম্পানির অভ্যন্তরীণ পরিচালনা সংক্রান্ত দলিল।",
                "👉 বিবরণপত্র (Prospectus): জনসাধারণকে কোম্পানির শেয়ার ও ডিবেঞ্চার কেনার আহ্বান জানিয়ে যে দলিল প্রচার করা হয়।"
            ]
        }
    ]
}
  },
  {
    id: 'm-1-c-6',
    title: 'সমবায় সমিতি — ম্যানেজমেন্ট ১ম পত্র (৬ অধ্যায়)',
    subject: 'ব্যবসায় সংগঠন',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ১ম পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ৬'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ১ম পত্র ৬ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "সমবায় সমিতির মূল উদ্দেশ্য মুনাফা অর্জন নয়, বরং সদস্যদের আর্থসামাজিক উন্নয়ন।",
    chapters: [
        {
            title: "১. আইন ও গঠননীতি",
            items: [
                "👉 আইন: বাংলাদেশে ২০০১ সালের সমবায় আইন এবং ২০০৪ সালের সমবায় বিধিমালা প্রচলিত।",
                "👉 মূলমন্ত্র: 'একতাই বল' (Unity is strength)।",
                "👉 গঠন: সমজাতীয় কমপক্ষে ২০ জন প্রাপ্তবয়স্ক ব্যক্তি (১৮ বছর+) মিলে প্রাথমিক সমবায় গঠন করতে পারে।"
            ]
        },
        {
            title: "২. সমবায় সমিতির বৈশিষ্ট্য",
            items: [
                "👉 উদ্দেশ্য: প্রধান উদ্দেশ্য হলো সদস্যদের কল্যাণ সাধন (মুনাফা অর্জন নয়)।",
                "👉 সাম্য ও ভোটাধিকার: 'এক ব্যক্তি এক ভোট' নীতি। একজন সদস্যের যত শেয়ারই থাকুক, তিনি কেবল ১টি ভোট দিতে পারবেন।",
                "👉 শেয়ারের সীমা: কোনো একক সদস্য মোট শেয়ারের ২০% (এক-পঞ্চমাংশ) এর বেশি শেয়ারের মালিক হতে পারবেন না।"
            ]
        },
        {
            title: "৩. মুনাফা বণ্টন",
            items: [
                "👉 সংরক্ষিত তহবিল: নিট মুনাফার কমপক্ষে ১৫% সংরক্ষিত তহবিলে জমা রাখা বাধ্যতামূলক।",
                "👉 সমবায় উন্নয়ন তহবিল: নিট মুনাফার কমপক্ষে ৩% উন্নয়ন তহবিলে জমা রাখতে হয়।",
                "👉 অবশিষ্ট মুনাফা: বাকি সর্বোচ্চ ৮২% মুনাফা সদস্যদের মাঝে বণ্টিত হতে পারে।"
            ]
        }
    ]
}
  },
  {
    id: 'm-1-c-7',
    title: 'রাষ্ট্রীয় ব্যবসায় — ম্যানেজমেন্ট ১ম পত্র (৭ অধ্যায়)',
    subject: 'ব্যবসায় সংগঠন',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ১ম পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ৭'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ১ম পত্র ৭ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "রাষ্ট্রীয় ব্যবসায়ের মূল উদ্দেশ্য হলো জনকল্যাণ সাধন করা বা সেবা প্রদান করা, মুনাফা অর্জন নয়।",
    chapters: [
        {
            title: "১. ধারণা ও উদ্দেশ্য",
            items: [
                "👉 সংজ্ঞা: রাষ্ট্র বা সরকারের মালিকানা ও নিয়ন্ত্রণে যে ব্যবসায় গঠিত হয়, তাকে রাষ্ট্রীয় ব্যবসায় বলে।",
                "👉 মালিকানা: এসব ব্যবসায়ের অন্তত ৫১% শেয়ার বা সম্পূর্ণ মালিকানা সরকারের হাতে থাকে।"
            ]
        },
        {
            title: "২. জাতীয়করণ (Nationalization)",
            items: [
                "👉 জাতীয়করণ কী: বেসরকারি মালিকানাধীন কোনো ব্যবসায়কে আইনের মাধ্যমে সরকারি মালিকানায় নিয়ে আসাকে জাতীয়করণ বলে।",
                "👉 উদ্দেশ্য: সম্পদের সুষম বণ্টন এবং দেশের বৃহত্তর স্বার্থ রক্ষা।"
            ]
        },
        {
            title: "৩. বাংলাদেশের গুরুত্বপূর্ণ রাষ্ট্রীয় ব্যবসায়",
            items: [
                "👉 বিসিআইসি (BCIC): বাংলাদেশ কেমিক্যাল ইন্ডাস্ট্রিজ কর্পোরেশন।",
                "👉 বিএসএফআইসি (BSFIC): বাংলাদেশ চিনি ও খাদ্য শিল্প সংস্থা।",
                "👉 ওয়াসা (WASA): পানি সরবরাহ ও পয়ঃনিষ্কাশন।",
                "👉 বিপিসি (BPC): বাংলাদেশ পেট্রোলিয়াম কর্পোরেশন।"
            ]
        }
    ]
}
  },
  {
    id: 'm-1-c-8',
    title: 'ব্যবসায়ের আইনগত দিক — ম্যানেজমেন্ট ১ম পত্র (৮ অধ্যায়)',
    subject: 'ব্যবসায় সংগঠন',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ১ম পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ৮'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ১ম পত্র ৮ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "ব্যবসায়িক অধিকার রক্ষা, ট্রেডমার্ক, পেটেন্ট, কপিরাইট এবং বিএসটিআই নিয়ে বিস্তারিত।",
    chapters: [
        {
            title: "১. পেটেন্ট (Patent)",
            items: [
                "👉 ধারণা: নতুন কোনো আবিষ্কারের উপর আবিষ্কারককে সরকার যে একচেটিয়া অধিকার দেয়।",
                "👉 আইন: 'বাংলাদেশ পেটেন্ট আইন ২০২২' কার্যকর।",
                "👉 মেয়াদ: পেটেন্টের মেয়াদ সাধারণত ১৬-২০ বছর হয়।"
            ]
        },
        {
            title: "২. ট্রেডমার্ক (Trademark) ও কপিরাইট (Copyright)",
            items: [
                "👉 ট্রেডমার্ক: যে স্বাতন্ত্র্যসূচক চিহ্ন বা লোগো দিয়ে পণ্যকে আলাদা করা যায়। ট্রেডমার্ক আইন ২০০৯ প্রচলিত। মেয়াদ ৭ বছর, পরে নবায়ন করা যায়।",
                "👉 কপিরাইট: সাহিত্য, শিল্প, সফটওয়্যার রচনার উপর স্রষ্টার একচেটিয়া অধিকার। কপিরাইট আইন ২০০০ প্রচলিত। রচয়িতার মৃত্যুপরবর্তী ৬০ বছর পর্যন্ত এটি বলবৎ থাকে।"
            ]
        },
        {
            title: "৩. বিএসটিআই (BSTI)",
            items: [
                "👉 BSTI: Bangladesh Standards and Testing Institution. এটি শিল্প মন্ত্রণালয়ের অধীন এবং পণ্যের মান নিয়ন্ত্রণ করে।"
            ]
        }
    ]
}
  },
  {
    id: 'm-1-c-9',
    title: 'সহায়ক সেবা — ম্যানেজমেন্ট ১ম পত্র (৯ অধ্যায়)',
    subject: 'ব্যবসায় সংগঠন',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ১ম পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ৯'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ১ম পত্র ৯ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "ব্যবসায় বা শিল্প স্থাপনে উদ্যোক্তাদের যেসব উদ্দীপকমূলক, সমর্থনমূলক এবং সংরক্ষণমূলক সেবা দেওয়া হয়।",
    chapters: [
        {
            title: "১. উদ্দীপকমূলক সেবা",
            items: [
                "👉 ধারণা: শিল্প বা ব্যবসা স্থাপনে একজন সম্ভাব্য উদ্যোক্তাকে উৎসাহিত করা।",
                "👉 উদাহরণ: প্রশিক্ষণ প্রদান, বিনিয়োগের সুযোগ-সুবিধা জানানো।"
            ]
        },
        {
            title: "২. সমর্থনমূলক সেবা",
            items: [
                "👉 ধারণা: শিল্প স্থাপনের পর্যায়ে ও তা চালু করার জন্য যেসব সেবা দেওয়া হয়।",
                "👉 উদাহরণ: ঋণ সরবরাহ, জমি বরাদ্দ, গ্যাস-বিদ্যুৎ সংযোগ, কর অবকাশ (Tax holiday)।"
            ]
        },
        {
            title: "৩. সংরক্ষণমূলক সেবা",
            items: [
                "👉 ধারণা: স্থাপিত শিল্পকে টিকিয়ে রাখা এবং এর সম্প্রসারণে দেয়া সেবা।",
                "👉 উদাহরণ: সরকারের সহায়ক নীতি, বাজার সম্প্রসারণে সহায়তা।"
            ]
        }
    ]
}
  },
  {
    id: 'm-1-c-10',
    title: 'ব্যবসায় উদ্যোগ — ম্যানেজমেন্ট ১ম পত্র (১০ অধ্যায়)',
    subject: 'ব্যবসায় সংগঠন',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ১ম পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ১০'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ১ম পত্র ১০ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "ব্যবসায় উদ্যোগ ও উদ্যোক্তার গুণাবলি।",
    chapters: [
        {
            title: "১. উদ্যোগ ও উদ্যোক্তা",
            items: [
                "👉 ব্যবসায় উদ্যোগ: মুনাফা অর্জনের উদ্দেশ্যে ঝুঁকি নিয়ে ব্যবসায় প্রতিষ্ঠান স্থাপন করা।",
                "👉 রিচার্ড ক্যান্টিলন: ফরাসি অর্থনীতিবিদ ১৭৫৫ সালে সর্বপ্রথম 'Entrepreneur' শব্দটি ব্যবহার করেন।"
            ]
        },
        {
            title: "২. উদ্যোক্তার গুণাবলি",
            items: [
                "👉 ঝুঁকি গ্রহণের ক্ষমতা: মুনাফা হলো ঝুঁকি গ্রহণের পুরস্কার।",
                "👉 সৃজনশীলতা ও উদ্ভাবন: জোসেফ সুম্পিটারের মতে, 'উদ্যোক্তা হলেন একজন উদ্ভাবক'।",
                "👉 দূরদর্শিতা: ভবিষ্যতের সুযোগ ও সমস্যা আগে থেকে অনুধাবন করা।"
            ]
        }
    ]
}
  },
  {
    id: 'm-1-c-11',
    title: 'ব্যবসায় তথ্য ও প্রযুক্তি — ম্যানেজমেন্ট ১ম পত্র (১১ অধ্যায়)',
    subject: 'ব্যবসায় সংগঠন',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ১ম পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ১১'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ১ম পত্র ১১ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "ই-কমার্সের প্রকারভেদ এবং প্রযুক্তি নিয়ে সংক্ষিপ্ত ও কার্যকরী নোট।",
    chapters: [
        {
            title: "১. ই-বিজনেস ও ই-কমার্স",
            items: [
                "👉 ই-বিজনেস: ব্যবসায়ের যাবতীয় কার্যাবলি ইন্টারনেট ভিত্তিক করা।",
                "👉 ই-কমার্স: কেবল ইন্টারনেট বা ইলেকট্রনিক মাধ্যমে পণ্য ও সেবার ক্রয়-বিক্রয়।"
            ]
        },
        {
            title: "২. ই-কমার্সের প্রকারভেদ (VVI)",
            items: [
                "👉 B2B: এক ব্যবসায় প্রতিষ্ঠান থেকে অন্য ব্যবসায় প্রতিষ্ঠানে লেনদেন। (আলিবাবা)",
                "👉 B2C: ব্যবসায় প্রতিষ্ঠান থেকে ভোক্তায়। (অ্যামাজন, দারাজ)",
                "👉 C2C: একজন ভোক্তা থেকে আরেক ভোক্তার কাছে বিক্রি। (বিক্রয়.কম)",
                "👉 C2B: ভোক্তা যখন ব্যবসায়ের কাছে সেবা বিক্রি করে। (ফ্রিল্যান্সিং)"
            ]
        },
        {
            title: "৩. ডেবিট ও ক্রেডিট কার্ড",
            items: [
                "👉 ডেবিট কার্ড: আগে জমা দাও, পরে খরচ করো (ব্যাংকে জমানো টাকা তোলার মাধ্যম)।",
                "👉 ক্রেডিট কার্ড: আগে খরচ করো, পরে পরিশোধ করো (ব্যাংক থেকে ঋণ সুবিধা পাওয়া যায়)।"
            ]
        }
    ]
}
  },
  {
    id: 'm-1-c-12',
    title: 'ব্যবসায় মূল্যবোধ ও নৈতিকতা — ম্যানেজমেন্ট ১ম পত্র (১২ অধ্যায়)',
    subject: 'ব্যবসায় সংগঠন',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ১ম পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ১২'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ১ম পত্র ১২ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "ব্যবসায়িক সামাজিক দায়বদ্ধতা (CSR) এবং মূল্যবোধ।",
    chapters: [
        {
            title: "১. নৈতিকতা ও মূল্যবোধ",
            items: [
                "👉 ব্যবসায়িক নৈতিকতা (Business Ethics): ব্যবসা পরিচালনার ক্ষেত্রে কোনটি উচিত এবং কোনটি অনুচিত তা বিচার করে সঠিক পথ অনুসরণ করা। এটি 'ইথোস' শব্দ থেকে এসেছে।"
            ]
        },
        {
            title: "২. সামাজিক দায়বদ্ধতা (CSR)",
            items: [
                "👉 CSR: Corporate Social Responsibility।",
                "👉 ক্রেতাদের প্রতি: ভেজালমুক্ত পণ্য দেওয়া, ন্যায্য মূল্য রাখা।",
                "👉 কর্মীদের প্রতি: ন্যায্য মজুরি ও ভালো পরিবেশ দেওয়া।",
                "👉 সমাজের প্রতি: স্কুল-কলেজ, হাসপাতাল তৈরি, পরিবেশ রক্ষা করা।"
            ]
        }
    ]
}
  },
  {
    id: 'm-2-c-1',
    title: 'ব্যবস্থাপনার ধারণা — ম্যানেজমেন্ট ২য় পত্র (১ অধ্যায়)',
    subject: 'ব্যবস্থাপনা',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ২য় পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ১'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ২য় পত্র ১ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "ব্যবস্থাপনার কাজগুলো, ৬এম (6M), এবং হেনরি ফেয়ল ও টেইলরের অবদান এখান থেকেই বেশি আসে।",
    chapters: [
        {
            title: "১. ব্যবস্থাপনার সাধারণ ধারণা",
            items: [
                "👉 'Management' শব্দটি ইতালীয় শব্দ 'Maneggiare' থেকে এসেছে, যার অর্থ 'To handle' বা চালনা করা।",
                "👉 ৬এম (6M): Men (মানুষ), Machine (যন্ত্রপাতি), Materials (কাঁচামাল), Money (অর্থ), Method (পদ্ধতি), ও Markets (বাজার)।",
                "👉 POSDCORB: L. Gulick এর দেয়া সূত্র (পরিকল্পনা, সংগঠিতকরণ, কর্মীসংস্থান, নির্দেশনা, সমন্বয় ও বাজেট)।"
            ]
        },
        {
            title: "২. হেনরি ফেয়ল ও টেইলর",
            items: [
                "👉 হেনরি ফেয়ল: 'আধুনিক ব্যবস্থাপনার জনক'। পেশায় ফরাসি খনি প্রকৌশলী। ১৯১৬ সালে বই: 'Administration Industrielle et Generale'।",
                "👉 এফ. ডব্লিউ. টেইলর: 'বৈজ্ঞানিক ব্যবস্থাপনার জনক'। পেশায় মার্কিন যন্ত্র প্রকৌশলী। ১৯১১ সালে বই: 'The Principles of Scientific Management'।"
            ]
        },
        {
            title: "৩. ব্যবস্থাপনার স্তর",
            items: [
                "👉 উচ্চ স্তর: পরিচালনা পর্ষদ, এমডি, চেয়ারম্যান (নীতি নির্ধারণ)।",
                "👉 মধ্যম স্তর: বিভাগীয় ব্যবস্থাপক (সমন্বয় ও নীতি বাস্তবায়ন)।",
                "👉 নিম্ন স্তর: ফোরম্যান, সুপারভাইজার (সরাসরি কাজ তদারকি)।"
            ]
        }
    ]
}
  },
  {
    id: 'm-2-c-2',
    title: 'ব্যবস্থাপনার নীতি — ম্যানেজমেন্ট ২য় পত্র (২ অধ্যায়)',
    subject: 'ব্যবস্থাপনা',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ২য় পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ২'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ২য় পত্র ২ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "হেনরি ফেয়ল প্রদত্ত ব্যবস্থাপনার ১৪টি নীতি ভর্তি পরীক্ষায় ঘুরেফিরে আসে।",
    chapters: [
        {
            title: "১. হেনরি ফেয়লের ১৪টি নীতি",
            items: [
                "👉 কার্যবিভাজন: সম্পূর্ণ কাজকে ছোট ছোট ভাগে ভাগ করা (বিশেষায়ন অর্জিত হয়)।",
                "👉 আদেশের ঐক্য: একজন কর্মীর বস হবেন কেবল একজন। এতে বিভ্রান্তি এড়ানো যায়।",
                "👉 নির্দেশনার ঐক্য: একই লক্ষ্য অর্জনে পরিচালিত সব কাজের পরিকল্পনা এবং নির্দেশ দাতা হবে অভিন্ন।",
                "👉 জোড়ামই শিকল (Scalar Chain): সর্বোচ্চ স্তর থেকে শুরু করে নিম্নস্তর পর্যন্ত প্রতিটি পদকে শিকলে আবদ্ধ করা (যোগাযোগ পথ নির্দিষ্ট থাকে)।",
                "👉 এসপ্রিট ডি কর্পস: একতাই বল, দলবদ্ধভাবে কাজ করা ও ঐক্য বজায় রাখা।"
            ]
        },
        {
            title: "২. টেইলরের বৈজ্ঞানিক ব্যবস্থাপনার নীতি",
            items: [
                "👉 গতানুগতিক পদ্ধতির পরিবর্তে বৈজ্ঞানিক পদ্ধতি ব্যবহার।",
                "👉 বৈজ্ঞানিক উপায়ে কর্মী নির্বাচন ও প্রশিক্ষণ।",
                "👉 ব্যবস্থাপনা ও কর্মীদের মধ্যে আন্তরিক সহযোগিতা।"
            ]
        }
    ]
}
  },
  {
    id: 'm-2-c-3',
    title: 'পরিকল্পনা প্রণয়ন ও সিদ্ধান্ত গ্রহণ — ম্যানেজমেন্ট ২য় পত্র (৩ অধ্যায়)',
    subject: 'ব্যবস্থাপনা',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ২য় পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ৩'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ২য় পত্র ৩ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "পরিকল্পনা ব্যবস্থাপনার প্রথম ও মৌলিক কাজ। প্রকারভেদ (একার্থক ও স্থায়ী) থেকে বেশি প্রশ্ন আসে।",
    chapters: [
        {
            title: "১. পরিকল্পনার ধারণা",
            items: [
                "👉 ধারণা: ভবিষ্যতে কী, কখন, কীভাবে করতে হবে তার আগাম সিদ্ধান্ত নেওয়া।",
                "👉 এটি লক্ষ্যভিত্তিক, ভবিষ্যতমুখী এবং বৃদ্ধিবৃত্তিক প্রক্রিয়া। 'পরিকল্পনা হলো ভবিষ্যতের দর্পণ'।"
            ]
        },
        {
            title: "২. পরিকল্পনার প্রকারভেদ (VVI)",
            items: [
                "👉 একার্থক পরিকল্পনা (Single-use Plan): যা শুধু একবার ব্যবহারের জন্য তৈরি হয় (যেমন: বাজেট, নির্দিষ্ট প্রকল্প)।",
                "👉 স্থায়ী পরিকল্পনা (Standing Plan): নতুন অবস্থা সৃষ্টি না হওয়া পর্যন্ত যা বারবার ব্যবহৃত হয় (যেমন: নীতি, পদ্ধতি)।"
            ]
        },
        {
            title: "৩. সিদ্ধান্ত গ্রহণ (Decision Making)",
            items: [
                "👉 অনেকগুলো বিকল্প থেকে সবচেয়ে উত্তম বিকল্পটি বাছাই করাই হলো সিদ্ধান্ত গ্রহণ। সিদ্ধান্ত গ্রহণ পরিকল্পনার প্রাণ।"
            ]
        }
    ]
}
  },
  {
    id: 'm-2-c-4',
    title: 'সংগঠিতকরণ — ম্যানেজমেন্ট ২য় পত্র (৪ অধ্যায়)',
    subject: 'ব্যবস্থাপনা',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ২য় পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ৪'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ২য় পত্র ৪ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "সংগঠন কাঠামোর বিন্যাস এবং ধরন থেকে ভর্তি পরীক্ষায় প্রশ্ন থাকে।",
    chapters: [
        {
            title: "১. কাঠামোর প্রকারভেদ",
            items: [
                "👉 সরলরৈখিক সংগঠন: সবচেয়ে প্রাচীন, সহজবোধ্য। একে 'সামরিক সংগঠন' বলা হয় কারণ এতে কঠোর শৃঙ্খলা থাকে।",
                "👉 সরলরৈখিক ও পদস্থ কর্মী সংগঠন: সরলরৈখিক নির্বাহীদের পরামর্শ দেওয়ার জন্য বিশেষজ্ঞ (Staff) নিয়োগ দেওয়া হয়।",
                "👉 কার্যভিত্তিক সংগঠন: কাজের প্রকৃতির ভিত্তিতে বিভাগ করা। এর প্রবর্তক এফ ডব্লিউ টেইলর।",
                "👉 মেট্রিক্স সংগঠন: সবচেয়ে আধুনিক ও জটিল। এখানে কার্যভিত্তিক ও প্রজেক্ট বিভাগের সমন্বয় ঘটে।"
            ]
        }
    ]
}
  },
  {
    id: 'm-2-c-5',
    title: 'কর্মীসংস্থান — ম্যানেজমেন্ট ২য় পত্র (৫ অধ্যায়)',
    subject: 'ব্যবস্থাপনা',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ২য় পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ৫'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ২য় পত্র ৫ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "কর্মীসংস্থানের ধাপ: সংগ্রহ, নির্বাচন, ও প্রশিক্ষণ।",
    chapters: [
        {
            title: "১. কর্মী সংগ্রহ (Recruitment)",
            items: [
                "👉 সম্ভাব্য প্রার্থীদের চাকরি খালি থাকার বিষয়ে জানানো। এটি একটি ইতিবাচক প্রক্রিয়া।",
                "👉 উৎস: অভ্যন্তরীণ (বদলি, পদোন্নতি) ও বাহ্যিক (বিজ্ঞাপন)।"
            ]
        },
        {
            title: "২. কর্মী নির্বাচন (Selection)",
            items: [
                "👉 পরীক্ষা ও সাক্ষাৎকারের মাধ্যমে যোগ্য প্রার্থী বেছে নেওয়া। এটি একটি 'নেতিবাচক' বা 'বাছাই' প্রক্রিয়া।"
            ]
        },
        {
            title: "৩. প্রশিক্ষণ (Training)",
            items: [
                "👉 কাজের মধ্যে প্রশিক্ষণ (On-the-job): শিক্ষানবিশ, কোচিং, পদ পরিবর্তন।",
                "👉 কাজের বাইরে (Off-the-job): সেমিনার, বক্তৃতা, ঘটনা বা কেস স্টাডি।"
            ]
        }
    ]
}
  },
  {
    id: 'm-2-c-6',
    title: 'নেতৃত্ব ও নির্দেশনা — ম্যানেজমেন্ট ২য় পত্র (৬ অধ্যায়)',
    subject: 'ব্যবস্থাপনা',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ২য় পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ৬'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ২য় পত্র ৬ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "নেতৃত্ব ও নির্দেশনা হলো পরিকল্পনাকে বাস্তবে রূপ দেওয়ার জ্বালানিস্বরূপ।",
    chapters: [
        {
            title: "১. নেতৃত্বের প্রকারভেদ (VVI)",
            items: [
                "👉 স্বৈরতান্ত্রিক (Autocratic): নেতা সব ক্ষমতা নিজের হাতে রাখেন, সিদ্ধান্ত চাপিয়ে দেন এবং ভয় দেখিয়ে কাজ আদায় করেন।",
                "👉 গণতান্ত্রিক (Democratic): কর্মীদের সাথে আলোচনা করে সিদ্ধান্ত নেন। এটি সর্বোত্তম নেতৃত্ব।",
                "👉 লাগামহীন (Laissez-faire): নেতা কর্মীদের উপর পুরো দায়িত্ব ছেড়ে দেন। এটি সবচেয়ে অকার্যকর নেতৃত্ব।"
            ]
        },
        {
            title: "২. নির্দেশনা",
            items: [
                "👉 কর্মীদের কী করতে হবে তা বুঝিয়ে দেওয়া এবং তদারকি করা। একে প্রশাসনের 'হৃৎপিণ্ড' বলা হয়।"
            ]
        }
    ]
}
  },
  {
    id: 'm-2-c-7',
    title: 'প্রেষণা — ম্যানেজমেন্ট ২য় পত্র (৭ অধ্যায়)',
    subject: 'ব্যবস্থাপনা',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ২য় পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ৭'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ২য় পত্র ৭ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "বিভন্ন প্রেষণা তত্ত্ব, মাসলো এবং হার্জবার্গের থিওরি থেকে বরাবরই প্রশ্ন থাকে।",
    chapters: [
        {
            title: "১. প্রেষণা (Motivation)",
            items: [
                "👉 কর্মীদের দিয়ে কাজ আদায় করার জন্য আগ্রহ সৃষ্টির কৌশল। ল্যাটিন 'Movere' থেকে এসেছে।"
            ]
        },
        {
            title: "২. গুরুত্বপূর্ণ থিওরি",
            items: [
                "👉 মাসলোর চাহিদা সোপান তত্ত্ব: ৫টি স্তর (জৈবিক, নিরাপত্তা, সামাজিক, আত্মতৃপ্তি, আত্মপূর্ণতা)।",
                "👉 হার্জবার্গের দ্বি-উপাদান তত্ত্ব: ১. হাইজিন বা রক্ষণাবেক্ষণ উপাদান (বেতন, পরিবেশ), ২. প্রেষণামূলক উপাদান (স্বীকৃতি, অর্জন)।",
                "👉 X ও Y তত্ত্ব: ডগলাস ম্যাকগ্রেগর। X নেতিবাচক (মানুষ অলস), Y ইতিবাচক (মানুষ কাজ পছন্দ করে)।"
            ]
        }
    ]
}
  },
  {
    id: 'm-2-c-10',
    title: 'নিয়ন্ত্রণ — ম্যানেজমেন্ট ২য় পত্র (১০ অধ্যায়)',
    subject: 'ব্যবস্থাপনা',
    classGroup: 'Admission',
    badges: ['মাস্টার নোট', 'ম্যানেজমেন্ট ২য় পত্র', 'এডমিশন স্পেশাল', 'অধ্যায় ১০'],
    description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট ২য় পত্র ১০ অধ্যায়ের পূর্ণাঙ্গ রিভিশন নোট।',
    link: '',
    isExternal: false,
    content: {
    intro: "নিয়ন্ত্রণ (Controlling) হলো ব্যবস্থাপনার সর্বশেষ কাজ।",
    chapters: [
        {
            title: "১. নিয়ন্ত্রণের ধারণা",
            items: [
                "👉 প্রকৃত ফলাফলের সাথে আদর্শ মানের তুলনা করে বিচ্যুতি বের করা এবং সংশোধনমূলক ব্যবস্থা গ্রহণ করা। এটি ব্যবস্থাপনার সর্বশেষ কাজ। এটি পেছনের দিকে তাকানো (Looking back) হলেও ভবিষ্যৎ পরিকল্পনার ভিত্তি।"
            ]
        },
        {
            title: "২. পদক্ষেপ ও কৌশল",
            items: [
                "👉 পদক্ষেপসমূহ: ১. আদর্শ মান নির্ধারণ, ২. কার্যফল পরিমাপ, ৩. তুলনা, ৪. বিচ্যুতি নির্ণয়, ৫. সংশোধনমূলক ব্যবস্থা।",
                "👉 ব্রেক-ইভেন বিশ্লেষণ (Break-Even): যে পরিমাণ বিক্রি করলে আয়-ব্যয় সমান হয়।",
                "👉 পার্ট (PERT): জটিল প্রকল্পের সময় ও কাজ নিয়ন্ত্রণের কৌশল।"
            ]
        }
    ]
}
  }
];

export default function Notes() {
  const { userData } = useAuth();
  const userClass = userData?.class || "দ্বাদশ শ্রেণী";
  
  // States
  const [dbNotes, setDbNotes] = useState<any[]>([]);
  const [dbNotesLoading, setDbNotesLoading] = useState(false);
  const [savedNotesState, setSavedNotesState] = useState<Record<string, boolean>>({});
  const [readingNote, setReadingNote] = useState<any | null>(null);
  const [saveLoading, setSaveLoading] = useState<string | null>(null);
  const [readerTheme, setReaderTheme] = useState<"light" | "sepia" | "dark">("light");
  const [readerFontSize, setReaderFontSize] = useState<"base" | "lg" | "xl">("lg");
  const [isBlurred, setIsBlurred] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  // Fetch dynamic administrator / teacher made notes
  useEffect(() => {
    const fetchDbNotes = async () => {
      setDbNotesLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "notes"));
        const list: any[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setDbNotes(list);
      } catch (err) {
        console.error("Error loading custom creator notes:", err);
      } finally {
        setDbNotesLoading(false);
      }
    };
    fetchDbNotes();
  }, []);


  // Security Focus & Key blocker for Screenshot/Printscreen/Copying Prevention
  useEffect(() => {
    if (!readingNote) {
      setIsBlurred(false);
      return;
    }

    const handleBlur = () => {
      setIsBlurred(true);
    };

    const handleFocus = () => {
      setIsBlurred(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === "c" || e.key === "s" || e.key === "p" || e.key === "u")) ||
        e.key === "PrintScreen" ||
        e.key === "F12"
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [readingNote]);

  // Load saved notes status on mount
  useEffect(() => {
    const fetchSavedNotes = async () => {
      if (!userData?.uid) return;
      try {
        const tempSaved: Record<string, boolean> = {};
        const combined = [...ALL_NOTES, ...dbNotes];
        for (const note of combined) {
          const docRef = doc(db, "users", userData.uid, "saved_notes", note.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            tempSaved[note.id] = true;
          }
        }
        setSavedNotesState(tempSaved);
      } catch (err) {
        console.error("Error loaded saved notes:", err);
      }
    };
    fetchSavedNotes();
  }, [userData, dbNotes]);

  // Handle toggling save/bookmark
  const handleToggleSaveNote = async (note: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userData?.uid) return;
    
    setSaveLoading(note.id);
    try {
      const docRef = doc(db, "users", userData.uid, "saved_notes", note.id);
      const isCurrentlySaved = !!savedNotesState[note.id];
      
      if (isCurrentlySaved) {
        await deleteDoc(docRef);
        setSavedNotesState(prev => ({ ...prev, [note.id]: false }));
      } else {
        await setDoc(docRef, {
          noteId: note.id,
          title: note.title,
          link: note.isExternal ? note.link : `/notes`,
          savedAt: new Date()
        });
        setSavedNotesState(prev => ({ ...prev, [note.id]: true }));
      }
    } catch (err) {
      console.error("Failed bookmarked save:", err);
    } finally {
      setSaveLoading(null);
    }
  };

  const handlePrintNote = (note: any) => {
    document.body.classList.add("printing-allowed");

    const styleEl = document.createElement("style");
    styleEl.id = "print-style-override";
    styleEl.innerHTML = `
      @media print {
        body {
          display: block !important;
        }
        body > :not(#print-temporary-container) {
          display: none !important;
        }
        #print-temporary-container {
          display: block !important;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: #fff;
        }
      }
      #print-temporary-container {
        display: none;
      }
    `;
    document.head.appendChild(styleEl);

    let container = document.getElementById("print-temporary-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "print-temporary-container";
      document.body.appendChild(container);
    }
    container.innerHTML = generatePrintableHtml(note);

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      
      setTimeout(() => {
        styleEl.remove();
        if (container) {
          container.innerHTML = "";
        }
        document.body.classList.remove("printing-allowed");
      }, 1000);
    };

    window.addEventListener("afterprint", cleanup, { once: true });

    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.error("Print execution failed:", err);
        cleanup();
      }
    }, 500);

    // Fallback cleanup after 35 seconds to allow PDF/Print loading on slow mobile devices
    setTimeout(cleanup, 35000);
  };

  // Filter notes by the user's specific class group and search query/category
  const userClassGroup = mapUserClassToGroup(userClass);
  const combinedAllNotes = [...ALL_NOTES, ...dbNotes];

  // Dynamic subjects list from this class group
  const availableSubjects = [
    "All",
    ...Array.from(new Set(
      combinedAllNotes
        .filter(note => note.classGroup === userClassGroup)
        .map(note => note.subject)
        .filter(Boolean)
    ))
  ];

  const filteredNotes = combinedAllNotes.filter(note => {
    const isClassMatch = note.classGroup === userClassGroup;
    if (!isClassMatch) return false;

    if (selectedSubject !== "All" && note.subject !== selectedSubject) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const titleMatch = note.title?.toLowerCase().includes(query);
      const descMatch = note.description?.toLowerCase().includes(query);
      const subMatch = note.subject?.toLowerCase().includes(query);
      const badgeMatch = note.badges?.some((b: string) => b.toLowerCase().includes(query));
      return titleMatch || descMatch || subMatch || badgeMatch;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 font-sans antialiased text-slate-800">
      
      {/* Clean Topbar */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-150 sticky top-0 z-40 px-4 sm:px-6 py-4.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full">
            <Link to="/dashboard" className="h-10 w-10 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200/60 rounded-2xl flex items-center justify-center text-[#0F2744] transition-all shrink-0 hover:shadow-xs" aria-label="Back">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="h-11 w-11 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0 animate-pulse">
              <Sparkles className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="font-bengali text-lg sm:text-xl font-extrabold text-[#0F2744] tracking-tight">লেকচার শিটস ও নোটস</h1>
              <p className="text-xs text-slate-400 font-medium font-bengali mt-0.5">সহজ ও সাবলীল উপস্থাপনায় আপনার পকেট মেন্টর</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Hero Banner Section */}
        <div className="relative bg-[#0F2744] rounded-[32px] p-6 sm:p-8 md:p-10 text-white overflow-hidden shadow-xl shadow-[#0F2744]/10 flex flex-col md:flex-row items-center justify-between gap-8 border border-[#1e3e60]">
          <div className="absolute top-[-50%] right-[-10%] w-[380px] h-[380px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-[-30%] left-[-10%] w-[280px] h-[280px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4.5 z-10 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 font-bengali text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              প্রো লেকচার সিরিজ ২০২৬ — {userClassGroup}
            </div>
            <h2 className="font-bengali text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              এক্সক্লুসিভ প্রো ম্যাক্স লেকচার নোটস
            </h2>
            <p className="text-sm sm:text-base font-bengali text-slate-350 max-w-3xl leading-relaxed">
              মেধাবী শিক্ষক ও দেশসেরা টপারদের হাতে অত্যন্ত নিখুঁত ভাবে তৈরি করা এক্সক্লুসিভ গাইডবুক। প্রতিটি বিষয়ের গভীরে গিয়ে সহজ ও সুন্দরভাবে ব্যাখ্যা করা হয়েছে যা আপনার প্রস্তুতিকে করবে আরো একধাপ এগিয়ে।
            </p>
          </div>
        </div>

        {/* Dynamic Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="bg-white p-14 text-center rounded-[32px] border border-slate-150 shadow-sm space-y-4">
            <BookOpen className="w-14 h-14 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <p className="font-bengali text-base font-bold text-slate-700">আপনার সিলেক্ট করা ফিল্টারে কোনো নোট পাওয়া যায়নি</p>
              <p className="font-bengali text-xs text-slate-400">অন্য বিষয় সিলেক্ট করে অথবা সার্চ কী-ওয়ার্ড পরিবর্তন করে আবার ট্রাই করুন।</p>
            </div>
            {selectedSubject !== "All" || searchQuery ? (
              <Button 
                onClick={() => { setSearchQuery(""); setSelectedSubject("All"); }}
                className="font-bengali rounded-xl px-5 h-9 text-xs bg-slate-100 text-[#0F2744] border hover:bg-slate-150"
              >
                রিসেট ফিল্টার
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredNotes.map((note) => {
              const isSaved = !!savedNotesState[note.id];
              // Map subjects into premium icons & aesthetics
              const isAcct = note.subject?.includes("হিসাব");
              const isChem = note.subject?.includes("রসায়ন") || note.subject?.includes("রসায়ন");
              const isBangla = note.subject?.includes("বাংলা");
              
              const accentBg = isAcct ? "bg-[#F4B400]" : isChem ? "bg-indigo-500" : isBangla ? "bg-emerald-500" : "bg-blue-500";
              const borderTheme = isAcct ? "group-hover:border-amber-250" : isChem ? "group-hover:border-indigo-250" : isBangla ? "group-hover:border-emerald-250" : "group-hover:border-blue-250";

              return (
                <motion.div
                  key={note.id}
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                >
                  <Card 
                    className={`group relative overflow-hidden bg-white border border-slate-205 border-slate-200 rounded-[28px] shadow-xs hover:shadow-md transition-all duration-300 ${borderTheme}`}
                  >
                    {/* Visual Border Accent of Book Spine */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1 rounded-l-[28px] ${accentBg}`} />

                    <CardContent className="p-5 sm:p-7 pb-6 pl-6 sm:pl-9">
                      <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center">
                        
                        {/* Left Side Content */}
                        <div className="space-y-4 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              {/* Meta Labels Line */}
                              <div className="flex flex-wrap items-center gap-2 select-none">
                                <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                  isAcct ? "bg-amber-50 text-amber-700 border-amber-100" :
                                  isChem ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                                  isBangla ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                  "bg-blue-50 text-blue-700 border-blue-100"
                                }`}>
                                  {note.subject}
                                </span>
                                <span className="text-[10px] font-mono bg-slate-50 border border-slate-200 text-slate-500 px-2.5 py-0.5 rounded-md font-bold">
                                  {note.classGroup}
                                </span>
                                {isSaved && (
                                  <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-600 font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <BookmarkCheck className="w-3 h-3 fill-amber-500" /> বুকমার্কড
                                  </span>
                                )}
                              </div>

                              <h4 className="font-bengali text-lg sm:text-xl text-[#0F2744] font-black group-hover:text-amber-600 transition-colors leading-tight tracking-tight mt-1">
                                {note.title}
                              </h4>
                              <p className="font-bengali text-sm text-slate-500 leading-relaxed font-semibold line-clamp-2">
                                {note.description}
                              </p>
                            </div>

                            {/* Mobile-only Bookmark Action */}
                            <div className="lg:hidden shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={saveLoading === note.id}
                                onClick={(e) => handleToggleSaveNote(note, e)}
                                className={`rounded-full h-8 w-8 hover:bg-slate-100 ${
                                  isSaved ? "text-amber-500" : "text-slate-300 hover:text-slate-500"
                                }`}
                              >
                                {isSaved ? <BookmarkCheck className="w-5 h-5 fill-amber-500" /> : <Bookmark className="w-5 h-5" />}
                              </Button>
                            </div>
                          </div>

                          

                        </div>

                        {/* Right Side Call to Action */}
                        <div className="w-full lg:w-auto shrink-0 flex items-center justify-between lg:justify-end gap-3.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          {/* Desktop Bookmark Action (Hidden on mobile) */}
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={saveLoading === note.id}
                            onClick={(e) => handleToggleSaveNote(note, e)}
                            className={`hidden lg:flex rounded-full h-10 w-10 border border-slate-200/70 hover:bg-slate-50 ${
                              isSaved ? "text-amber-500 bg-amber-50/50 border-amber-200" : "text-slate-300 hover:text-slate-400"
                            }`}
                          >
                            {isSaved ? <BookmarkCheck className="w-[1.125rem] h-[1.125rem] fill-amber-500" /> : <Bookmark className="w-[1.125rem] h-[1.125rem]" />}
                          </Button>

                          {note.isExternal ? (
                            <Link to={note.link} className="w-full lg:w-auto">
                              <Button className="font-bengali w-full rounded-2xl px-6 h-11 bg-[#0F2744] hover:bg-[#1a3a61] flex items-center justify-center gap-2 shadow-xs cursor-pointer">
                                <span>নোট পড়ুন</span> <ArrowRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          ) : (
                            <Button 
                              onClick={() => setReadingNote(note)}
                              className="font-bengali w-full lg:w-auto rounded-2xl px-6.5 h-11 bg-[#F4B400] hover:bg-amber-500 font-extrabold text-[#0F2744] border-none flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                            >
                              <span>নোট পড়ুন</span> <Sparkles className="w-4 h-4 text-[#0F2744]" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Interactive Desktop textbook / E-Reader Overlay Modal */}
      <AnimatePresence>
        {readingNote && (() => {
          // Inner theme mappings
          const readerThemeConfig = {
            light: {
              bg: "bg-[#FCFBF7]",
              textTitle: "text-slate-950",
              textBody: "text-slate-800",
              textMute: "text-slate-500",
              border: "border-[#EDECDF]",
              headerBg: "bg-[#FCFBF7]/95",
              headerBorder: "border-[#EDECDF]",
              navButtonHover: "hover:bg-slate-250/50",
              introBg: "bg-[#F7F6EE] border-amber-600 text-stone-800",
              itemBg: "bg-white border-[#ECEBDD]",
              itemHover: "hover:bg-slate-50/50",
              itemNumberBg: "bg-stone-100 text-stone-500 group-hover:bg-primary/10 group-hover:text-primary",
              footerBg: "bg-[#FAF9F2] border-[#ECEBDD]",
              footerBtn: "bg-[#0F2744] hover:bg-[#1a3a61] text-white"
            },
            sepia: {
              bg: "bg-[#F4ECD8]",
              textTitle: "text-[#433422]",
              textBody: "text-[#4B3924]",
              textMute: "text-[#756550]",
              border: "border-[#E1D5B9]",
              headerBg: "bg-[#F4ECD8]/95",
              headerBorder: "border-[#E1D5B9]",
              navButtonHover: "hover:bg-[#E9DDBF]",
              introBg: "bg-[#EAE0C5] border-amber-700 text-[#433422]",
              itemBg: "bg-[#FCF6EB] border-[#DDD1B4]",
              itemHover: "hover:bg-[#F2E7CC]",
              itemNumberBg: "bg-[#EFE5CD] text-[#7A644D] group-hover:bg-[#B45309]/15 group-hover:text-[#B45309]",
              footerBg: "bg-[#EFE5CD] border-[#DDD1B4]",
              footerBtn: "bg-amber-800 hover:bg-amber-900 text-[#FCFBF7]"
            },
            dark: {
              bg: "bg-[#121212]",
              textTitle: "text-[#EFEEF1]",
              textBody: "text-[#D2D2D7]",
              textMute: "text-[#888899]",
              border: "border-[#2D2D2D]",
              headerBg: "bg-[#121212]/95",
              headerBorder: "border-[#2D2D2D]",
              navButtonHover: "hover:bg-[#202020]",
              introBg: "bg-[#1E1B18] border-amber-500 text-amber-200/90",
              itemBg: "bg-[#1C1C1C] border-[#2D2D2D]",
              itemHover: "hover:bg-[#252525]",
              itemNumberBg: "bg-[#252525] text-[#888888] group-hover:bg-amber-500/10 group-hover:text-amber-400",
              footerBg: "bg-[#181818] border-[#2B2B2B]",
              footerBtn: "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
            }
          };

          const tc = readerThemeConfig[readerTheme];

          const fontSizeClass = {
            base: "text-sm sm:text-base leading-relaxed",
            lg: "text-base sm:text-lg leading-relaxed",
            xl: "text-lg sm:text-xl leading-relaxed"
          }[readerFontSize];

          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#070E1B]/80 backdrop-blur-md z-999 flex justify-end overflow-hidden font-sans"
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className={`w-full max-w-3xl min-h-screen shadow-2xl flex flex-col relative overflow-y-auto overflow-x-hidden ${tc.bg}`}
              >
                
                {/* Secure Overlay blur blocker */}
                {isBlurred && (
                  <div className="absolute inset-0 bg-slate-950/95 z-999 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
                    <span className="text-5xl mb-4">🛡️</span>
                    <h3 className="text-white font-bengali font-bold text-xl md:text-2xl">স্ক্রিনশট বা কপি করা সম্পূর্ণ নিষিদ্ধ!</h3>
                    <p className="text-slate-400 font-bengali text-xs md:text-sm mt-2 max-w-sm">
                      শিক্ষাঙ্গন প্ল্যাটফর্মের গোপনীয়তা ও মেধা সম্পদ রক্ষার স্বার্থে এই পেইজের স্ক্রিনশট বা কপি মেকানিজম ব্লক করা হয়েছে।
                    </p>
                    <p className="text-amber-500 font-bold text-[11px] uppercase tracking-widest mt-4">Screen capture protected</p>
                  </div>
                )}
                
                {/* E-Reader Fixed Header */}
                <header className={`sticky top-0 backdrop-blur-md border-b py-3 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-50 transition-colors duration-300 ${tc.headerBg} ${tc.headerBorder}`}>
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button 
                      onClick={() => setReadingNote(null)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${tc.navButtonHover}`}
                    >
                      <X className={`w-5 h-5 ${tc.textTitle}`} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-sans tracking-widest text-[#B45309] font-bold uppercase block">PRO READ E-READER</span>
                      <h3 className={`font-bengali font-bold text-xs sm:text-sm truncate select-none ${tc.textTitle}`}>
                        {readingNote.title}
                      </h3>
                    </div>
                  </div>

                  {/* Settings Controls (Themes & Font Sizes) */}
                  <div className={`flex items-center gap-2.5 shrink-0 self-end sm:self-center bg-black/5 dark:bg-white/5 rounded-2xl p-1 border ${tc.border}`}>
                    {/* Theme buttons */}
                    <div className="flex items-center gap-0.5">
                      <button 
                        onClick={() => setReaderTheme("light")}
                        className={`h-7 px-2 px-3 text-[11px] font-bengali font-bold rounded-xl transition-all ${readerTheme === "light" ? "bg-white text-slate-900 shadow-xs" : "text-slate-550 hover:text-slate-700"}`}
                      >
                        দিন
                      </button>
                      <button 
                        onClick={() => setReaderTheme("sepia")}
                        className={`h-7 px-2 px-3 text-[11px] font-bengali font-bold rounded-xl transition-all ${readerTheme === "sepia" ? "bg-[#ECD9B8] text-[#5C4217] shadow-xs" : "text-slate-550 hover:text-slate-700"}`}
                      >
                        সেপিয়া
                      </button>
                      <button 
                        onClick={() => setReaderTheme("dark")}
                        className={`h-7 px-2 px-3 text-[11px] font-bengali font-bold rounded-xl transition-all ${readerTheme === "dark" ? "bg-zinc-800 text-zinc-100 shadow-xs" : "text-slate-550 hover:text-slate-700"}`}
                      >
                        রাত
                      </button>
                    </div>

                    <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700" />

                    {/* Font Sizer buttons */}
                    <div className="flex items-center gap-0.5 font-sans">
                      <button 
                        onClick={() => setReaderFontSize("base")}
                        className={`h-7 w-7 text-xs font-semibold rounded-xl transition-all ${readerFontSize === "base" ? "bg-amber-450 bg-amber-400 text-slate-950 font-black" : "text-slate-550 hover:text-slate-800"}`}
                      >
                        Ab
                      </button>
                      <button 
                        onClick={() => setReaderFontSize("lg")}
                        className={`h-7 w-7 text-sm font-semibold rounded-xl transition-all ${readerFontSize === "lg" ? "bg-amber-450 bg-amber-400 text-slate-950 font-black" : "text-slate-550 hover:text-slate-800"}`}
                      >
                        Ab+
                      </button>
                    </div>
                  </div>
                </header>

                {/* Reader Core Content Body */}
                <div className="p-5 sm:p-8 md:p-10 flex-1 w-full max-w-2xl mx-auto space-y-6 sm:space-y-8 select-none overflow-x-hidden break-words">
                  
                  {/* Note Banner Info */}
                  <div className="space-y-4">
                    <h1 className={`font-bengali font-extrabold text-2xl sm:text-3xl leading-tight transition-colors duration-300 ${tc.textTitle}`}>
                      {readingNote.title}
                    </h1>
                    <p className={`text-sm sm:text-base font-bengali leading-relaxed italic border-l-4 p-4.5 rounded-r-2xl transition-all duration-300 ${tc.introBg}`}>
                      {readingNote.content?.intro}
                    </p>
                  </div>

                  {/* Chapters / Sections Content blocks */}
                  <div className="space-y-10 sm:space-y-14 pt-4">
                    {readingNote.content?.chapters?.map((chapter: any, cIdx: number) => (
                      <section key={cIdx} className="space-y-5">
                        <h2 className={`font-bengali font-extrabold text-xl sm:text-2xl transition-colors duration-300 ${tc.textTitle}`}>
                          {chapter.title}
                        </h2>
                        
                        <div className="space-y-5 w-full">
                          {chapter.items?.map((item: string, iIdx: number) => {
                            const cleanItem = item.replace(/👉/g, '').trim();
                            return (
                              <div 
                                key={iIdx} 
                                className="flex items-start gap-3 w-full"
                              >
                                <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${tc.textTitle} opacity-40`} />
                                <p className={`font-bengali ${fontSizeClass} tracking-wide select-none break-words flex-1 transition-all duration-300 ${tc.textBody}`}>
                                  {cleanItem}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>

                  <div className={`h-[1px] w-full transition-colors duration-300 ${tc.border}`} />

                  {/* Footnote stamp */}
                  <div className={`rounded-3xl border p-6 text-center space-y-3.5 select-none transition-colors duration-300 ${tc.footerBg} ${tc.border}`}>
                    <div className="h-10 w-10 bg-amber-500/15 rounded-full flex items-center justify-center mx-auto">
                      <BookOpenCheck className="w-5 h-5 text-amber-600" />
                    </div>
                    <h4 className={`font-bengali font-bold text-base transition-colors duration-300 ${tc.textTitle}`}>অনলাইন পাঠ সমাপ্ত!</h4>
                    <p className={`font-bengali text-xs max-w-sm mx-auto leading-relaxed transition-colors duration-300 ${tc.textMute}`}>এই লেকচারটি আপনি সম্পূর্ণ পড়তে পেরেছেন। প্র্যাকটিস এবং কুপন কার্ডের সাথে নিজেকে রাখুন এগিয়ে।</p>
                    
                    <div className="pt-2">
                      <Button 
                        onClick={() => setReadingNote(null)}
                        className={`font-bengali text-xs font-bold rounded-xl shadow-xs px-6 py-2.5 h-9.5 transition-all hover:scale-[1.02] active:scale-[0.98] ${tc.footerBtn}`}
                      >
                        পড়া শেষ করুন
                      </Button>
                    </div>
                  </div>

                </div>

              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Bottom Navigation Tab Bar (exactly matching screenshot 3) */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200/80 py-3.5 px-6 flex justify-around items-center z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.03)] rounded-t-[28px] max-w-lg mx-auto">
        <button 
          className="flex-1 flex flex-col items-center gap-1 transition-all relative text-emerald-600 scale-102 cursor-pointer"
        >
          <BookOpen className="w-5 h-5 shrink-0" />
          <span className="text-[11px] sm:text-xs font-bengali font-bold">নোটস</span>
          <motion.div layoutId="bottom_indicator" className="absolute bottom-[-15px] inset-x-12 h-1 bg-emerald-500 rounded-full" />
        </button>

        <Link 
          to="/bank?tab=topics"
          className="flex-1 flex flex-col items-center gap-1 transition-all relative text-slate-400 hover:text-slate-500 cursor-pointer"
        >
          <LayoutList className="w-5 h-5 shrink-0" />
          <span className="text-[11px] sm:text-xs font-bengali font-bold">টপিক ভিত্তিক নোটস</span>
        </Link>

        <Link 
          to="/bank?tab=practice"
          className="flex-1 flex flex-col items-center gap-1 transition-all relative text-slate-400 hover:text-slate-500 cursor-pointer"
        >
          <PenTool className="w-5 h-5 shrink-0" />
          <span className="text-[11px] sm:text-xs font-bengali font-bold">প্র্যাকটিস</span>
        </Link>
      </div>

    </div>
  );
}
