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
    id: "sonar-tori",
    title: "সোনার তরী — সম্পূর্ণ মাস্টার নোট ও গাইড",
    subject: "বাংলা",
    classGroup: "HSC",
    badges: ["মাস্টার নোট", "বাংলা ১ম পত্র", "এইচএসসি ২০২৬"],
    description: "বর্ষার দিনে শাশ্বত কাল ও মানুষের অবিনশ্বর কীর্তির রূপক বিশ্লেষণ সম্বলিত পূর্ণাঙ্গ শিট ও সৃজনশীল প্রশ্নোত্তর বুস্টার।",
    link: "",
    isExternal: false,
    content: {
      intro: "এইচএসসি পরীক্ষা ২০২৬-এর জন্য ১০০% পরীক্ষামুখী স্পেশাল এডিশন - বিশ্বকবি রবীন্দ্রনাথ ঠাকুর (১৮৬১ - ১৯৪১) এর 'সোনার তরী' কবিতার সম্পূর্ণ মাস্টার নোট ও গাইড।",
      chapters: [
        {
          title: "১. এক নজরে কবি ও কাব্য পরিচিতি",
          items: [
            "কবি পরিচিতি: বিশ্বকবি রবীন্দ্রনাথ ঠাকুর (১৮৬১ - ১৯৪১)। ১৯১৩ খ্রিষ্টাব্দে 'গীতাঞ্জলি' কাব্যের জন্য এশিয়ার প্রথম নোবেলজয়ী সাহিত্যিক।",
            "উৎস ও নামাকরণ: ১৮৯৪ খ্রিষ্টাব্দে প্রকাশিত 'সোনার তরী' কাব্যগ্রন্থের নাম-কবিতা বা প্রথম কবিতা।",
            "রচনাকাল ও প্রেক্ষাপট: ১২৯৯ বঙ্গাব্দ (১৮৯২ খ্রিষ্টাব্দ)। কবি যখন জমিদারী দেখভালের জন্য পাবনার শিলাইদহে ছিলেন, তখন পদ্মা নদীর বুকে বোটে বসে এটি রচনা করেন।",
            "ছন্দ বিশ্লেষণ: শুদ্ধ মাত্রাবৃত্ত ছন্দ। কবিতার মূল পর্ব ৮ মাত্রার এবং অপূর্ণ পর্ব ৬ মাত্রার (৮+৬)। অত্যন্ত গতিময় চাল।",
            "মূল উপজীব্য: মহাকাল, মানুষের সৃষ্টিশীল কীর্তি এবং ব্যক্তিমানুষের অবিনশ্বরতার বিপরীতে নশ্বরতা।"
          ]
        },
        {
          title: "২. কবিতার মূলভাব ও গভীর জীবনদর্শন",
          items: [
            "'সোনার তরী' একটি নিটোল রূপক কবিতা। আপাতদৃষ্টিতে এর একটি বহিরাঙ্গ রূপ আছে— বর্ষার দিনে একলা কৃষক তার উৎপাদিত ধান নিয়ে নদীর তীরে দাঁড়িয়ে আছে, এক অচেনা মাঝি এসে তার সমস্ত ধান নৌকায় তুলে নিলেও নৌকায় কৃষকের জায়গা হয় না।",
            "কৃষক: সৃষ্টির আকুলতায় মগ্ন স্বয়ং কবি বা সাধারণ মানুষ।",
            "সোনার ধান: মানুষের সারাজীবনের শ্রেষ্ঠ কর্ম, মেধা, শ্রম বা শিল্পসৃষ্টি।",
            "ছোট খেত: মানুষের সীমাবদ্ধ ও ক্ষণস্থায়ী পার্থিব জীবন বা আয়ু।",
            "সোনার তরী ও মাঝি: নির্লিপ্ত, নিষ্ঠুর ও শাশ্বত মহাকাল বা সময়।",
            "মূল অন্তর্নিহিত দর্শন: মহাকাল মানুষের সৃষ্টিকে সাদরে গ্রহণ করে অমরত্ব দেয়, কিন্তু রক্ত-মাংসের ক্ষণভঙ্গুর মানুষকে পরম অবহেলায় পেছনে ফেলে যায়। সৃষ্টি অমর, কিন্তু সৃষ্টিকর্তা মরণশীল।"
          ]
        },
        {
          title: "৩. শব্দার্থ ও টীকা",
          items: [
            "ক্ষুরধারা: ক্ষুরের মতো ধারালো স্রোত। এখানে বর্ষার নদীর তীব্র ও প্রলয়ংকরী গতিকে বোঝানো হয়েছে।",
            "খরপরশা: বর্শার মতো তীক্ষ্ণ। কালস্রোতের নিষ্ঠুর রূপের প্রতীক।",
            "তরী: নৌকা। কবিতায় এটি মহাকালের প্রতীক রূপ হিসেবে ব্যবহৃত হয়েছে।"
          ]
        },
        {
          title: "৪. পঙক্তিভিত্তিক বিস্তারিত বিশ্লেষণ",
          items: [
            "❝ গগন গরজে মেঘ, ঘন বরষা। / একখানি ছোট খেত, আমি একেলা— ❞\n\nবিশ্লেষণ: কবিতার শুরুতেই এক থমথমে এবং বিষাদময় পরিবেশের অবতারণা করা হয়েছে। আকাশে মেঘের গর্জন এবং ঘন বর্ষা মানুষের জীবনের শেষ মুহূর্ত বা সংকটের প্রতীক। 'ছোট খেত' দিয়ে বোঝানো হয়েছে মানুষের আয়ু অত্যন্ত সীমিত, এবং এই মহাবিশ্বে মানুষ মূলত একা ও নিঃসঙ্গ।",
            "❝ চারি দিকে বাঁকা জল করিছে খেলা। / পরপার-পারে দেখি আঁকা তরুছায়ামসীমাখা ❞\n\nবিশ্লেষণ: 'বাঁকা জল' হলো চারপাশ থেকে ধেয়ে আসা অনিশ্চয়তা ও মৃত্যুভয়। নদীর ওপার বা পরপার দেখা যাচ্ছে কিন্তু তা অস্পষ্ট, মেঘে ঢাকা ও মসীমাখা (কালচে)। এটি মৃত্যুর ওপারের এক অজানা, রহস্যময় জগতের দিকে ইঙ্গিত করে।",
            "❝ ঠাঁই নাই, ঠাঁই নাই—ছোট সে তরী / আমারি সোনার ধানে গিয়েছে ভরি। ❞\n\nবিশ্লেষণ: এটি কবিতার সবচেয়ে গুরুত্বপূর্ণ মোড়। মহাকালের নৌকায় মানুষের সৃষ্টির স্থান সংকুলান হলেও, নশ্বর মানুষের নিজের কোনো স্থান হয় না। সৃষ্টি অমর, কিন্তু সৃষ্টিকর্তা মরণশীল।"
          ]
        },
        {
          title: "৫. সৃজনশীল অনুধাবনমূলক প্রশ্ন ও উত্তর (CQ Booster)",
          items: [
            "Q1. 'ঠাঁই নাই, ঠাঁই নাই— ছোট সে তরী' বলতে কবি কী বুঝিয়েছেন?\n\nউত্তর: 'সোনার তরী' কবিতায় আলোচ্য পঙক্তিটি দিয়ে কবি মহাকালের বুকে নশ্বর মানুষের স্থান না হওয়ার রূঢ় বাস্তবতাকে বুঝিয়েছেন। মহাকালের তরী বা এই পৃথিবী অত্যন্ত সীমাবদ্ধ। এখানে মানুষের মহৎ কর্ম বা সৃষ্টির স্থান হলেও, রক্ত-মাংসের ক্ষণস্থায়ী মানুষের নিজের কোনো চিরস্থায়ী স্থান বা আশ্রয় নেই। সময় মানুষের অমর সৃষ্টি বা শিল্পকে সাদরে গ্রহণ করে সংরক্ষণ করে, কিন্তু ব্যক্তি মানুষকে পরম অবহেলায় মৃত্যুর মুখে ফেলে রেখে যায়।",
            "Q2. 'দেখে যেন মনে হয় চিনি উহারে'— কৃষকের এমন উপলব্ধির কারণ কী?\n\nউত্তর: কৃষকের এমন উপলব্ধির কারণ হলো— তরীর মাঝি কোনো সাধারণ মানুষ নয়, সে হলো চিরন্তন মহাকাল বা সময়ের প্রতীক। মানুষ সচেতন বা অবচেতনভাবে মনে মনে জানে যে সময় বা মহাকাল এক পরম ও চিরচেনা সত্য। জীবনের সমস্ত কর্মের অবসান এবং চূড়ান্ত হিসাব এই সময়ের হাতেই নির্ধারিত হয়। সময়ের এই চিরন্তন ও অমোঘ রূপটির কারণেই তরী বেয়ে আসা অচেনা মাঝিকে দেখেও কৃষকের মনে হয়েছে সে তাকে চেনে।"
          ]
        }
      ]
    }
  },
  {
    id: "sototar-puroshkar",
    title: "সততার পুরস্কার — স্মার্ট নোট ও ডেটা শিট",
    subject: "বাংলা",
    classGroup: "Class 6-8",
    badges: ["মাস্টার নোট", "বাংলা ১ম পত্র", "৬ষ্ঠ শ্রেণী"],
    description: "ড. মুহম্মদ শহীদুল্লাহ্ রচিত হিতোপদেশমূলক কাহিনীর চরিত্র বিশ্লেষণ, কুইজ ও সৃজনশীল মেগা গাইড।",
    link: "",
    isExternal: false,
    content: {
      intro: "ড. মুহম্মদ শহীদুল্লাহ্ রচিত ‘সততার পুরস্কার’ নীতিকথার সম্পূর্ণ লেকচার শিট, তুলনামূলক ক্যারেক্টার চার্ট এবং উত্তরসহ সৃজনশীল প্রশ্ন বিশ্লেষণ।",
      chapters: [
        {
          title: "📖 ১. লেখক পরিচিতি ও প্রেক্ষাপট",
          items: [
            "ড. মুহম্মদ শহীদুল্লাহ্ (১৮৮৫-১৯৬৯) ছিলেন একাধারে অসাধারণ ভাষাবিদ, পণ্ডিত ও গবেষক।"
          ]
        }
      ]
    }
  },
  {
    id: "management-1st-paper-chapter-1-admission",
    title: "ব্যবসায়ের মৌলিক ধারণা — ম্যানেজমেন্ট ১ম পত্র (১ম অধ্যায়)",
    subject: "ব্যবসায় সংগঠন",
    classGroup: "Admission",
    badges: ["মাস্টার নোট", "ম্যানেজমেন্ট ১ম পত্র", "এডমিশন স্পেশাল", "অধ্যায় ১"],
    description: "বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য ম্যানেজমেন্ট প্রথম পত্রের প্রথম অধ্যায়ের পূর্ণাঙ্গ ও গোছানো রিভিশন নোট, যেখানে কোনো টপিক বাদ পড়েনি।",
    link: "",
    isExternal: false,
    content: {
      intro: "বিশ্ববিদ্যালয় ভর্তি পরীক্ষার (DU C Unit / RU / JU / CUC / Guccho) প্রণীত সিলেবাসের আলোকে 'ব্যবসায়ের মৌলিক ধারণা' অধ্যায়ের প্রতিটি খুঁটিনাটি বিষয় অত্যন্ত সতর্কতার সাথে এখানে গুছিয়ে দেওয়া হলো যেন অ্যাডমিশন টেস্টে একটি প্রশ্নও মিস না হয়।",
      chapters: [
        {
          title: "📌 ১. ব্যবসায়ের ধারণা ও মৌলিক বিষয়াবলি",
          items: [
            "সংজ্ঞা (Definition): 'Business' শব্দটি ইংরেজি 'Busy' শব্দ থেকে এসেছে। আক্ষরিক অর্থে যেকোনো কাজে ব্যস্ত থাকাকে ব্যবসায় বলে। তবে ব্যাপক অর্থে, মুনাফা অর্জনের উদ্দেশ্যে উৎপাদন, বণ্টন ও এর সহায়ক যাবতীয় বৈধ অর্থনৈতিক কাজকে ব্যবসায় বলে।",
            "লক্ষ্য ও উদ্দেশ্য (Goals & Objectives): ব্যবসায়ের প্রধান লক্ষ্য হলো 'মুনাফা অর্জন'। তবে আধুনিক বা বর্তমান ধারণায় ব্যবসায়ের মূল উদ্দেশ্য হলো উন্নত গ্রাহক সেবা, ভোক্তা সন্তুষ্টি প্রদান ও সামাজিক কল্যাণ সাধন করা।",
            "ব্যবসায়ের সমীকরণ: অধ্যাপক মেগিনসন (Megginson) এর মতে, B = ΣI + ΣC + ΣDS। এখানে, B = Business, I = Industry (শিল্প), C = Commerce (বাণিজ্য), এবং DS = Direct Services (প্রত্যক্ষ সেবা)। এই সমীকরণ ভর্তি পরীক্ষার জন্য অত্যন্ত গুরুত্বপূর্ণ।",
            "বৈধতা (Legality): একটি কাজ যতই মুনাফামুখী হোক না কেন, তা দেশের আইনে বৈধ না হলে তা ব্যবসায় বলে গণ্য হবে না (যেমন: চোরাকারবারি ব্যবসায় নয়)।",
            "অর্থনৈতিক কাজ (Economic Activity): ব্যবসায় অবশ্যই একটি অর্থনৈতিক কাজ। অর্থাৎ, এর সাথে অর্থ বা অর্থের মাপকাঠিতে পরিমাপযোগ্য কোনো বিষয়ের সম্পৃক্ততা থাকতে হবে।"
          ]
        },
        {
          title: "⏳ ২. ব্যবসায়ের উৎপত্তির বিবর্তনের ইতিহাস",
          items: [
            "ব্যবসায়ের যুগের বিবর্তনকে প্রধানত ৩টি পর্যায়ে বা যুগে ভাগ করা যায়: প্রাচীন যুগ, মধ্য যুগ এবং আধুনিক যুগ।",
            "১. প্রাচীন যুগ (Ancient Age): মানুষ তখন নিজের প্রয়োজন অনুযায়ী উৎপাদন ও ভোগ করত।",
            "   👉 প্রাচীন যুগের প্রধান কাজসমূহ: কৃষিকাজ, পশুপালন, মৎস্য শিকার, ফলমূল সংগ্রহ ও দ্রব্য বিনিময় প্রথা (Barter System) চালু।",
            "   👉 দ্রব্য বিনিময় প্রথা কী? যখন পণ্যের বিনিময়ে পণ্য আদান-প্রদান করা হতো, তাকে দ্রব্য বিনিময় প্রথা বা বার্টার সিস্টেম বলে। তখন অর্থের কোনো ব্যবহার ছিল না।",
            "২. মধ্য যুগ (Middle Age): মানুষের প্রয়োজন বাড়ার সাথে সাথে বিনিময়ের মাধ্যমের গুরুত্ব অনুভূত হয়। এ যুগে সর্বপ্রথম অর্থে বা মুদ্রার প্রচলন শুরু হয়।",
            "   👉 মধ্য যুগের প্রধান কাজসমূহ: বিনিময়ের মাধ্যম হিসেবে শামুক, কড়ি, স্বর্ণ ও রৌপ্য মুদ্রার প্রচলন; পরবর্তীতে কাগজি মুদ্রার প্রচলন। বাজার ও শহর (Market & City) সৃষ্টি এবং একমালিকানা ও অংশীদারি ব্যবসায়ের উৎপত্তি।",
            "   👉 উৎপত্তিক্রম: একমালিকানা ব্যবসায় হলো ব্যবসায়ের সবচেয়ে প্রাচীন ও আদি রূপ। এরপর আসে অংশীদারি ব্যবসায়।",
            "৩. আধুনিক যুগ (Modern Age): শিল্প বিপ্লবের মাধ্যমে আধুনিক যুগের সূচনা হয়।",
            "   👉 আধুনিক যুগের প্রধান কাজসমূহ: শিল্প বিপ্লব (Industrial Revolution), বৃহদায়তন শিল্প কারখানা, ব্যাংক-বিমা ব্যবস্থার সম্প্রসারণ, কোম্পানি বা যৌথ মূলধনী সংগঠন এবং বহুজাতিক কোম্পানি (MNCs) এর উৎপত্তি।",
            "   👉 শিল্প বিপ্লব: ১৭৬০ সাল থেকে ১৮৫০ সাল পর্যন্ত সময়কালকে শিল্প বিপ্লব বলা হয়। এর সূত্রপাত ঘটে গ্রেট ব্রিটেনে (যুক্তরাজ্য)। শিল্প বিপ্লবের ফলে শ্রমবিভাগ (Division of labor) ও বিশেষায়ণের উদ্ভব ঘটে।"
          ]
        },
        {
          title: "✨ ৩. ব্যবসায়ের বৈশিষ্ট্য ও উপযোগ সৃষ্টি (From Admission Point of View)",
          items: [
            "১. ঝুঁকি ও মুনাফার সম্পর্ক (Risk & Reward): ব্যবসায়ে ঝুঁকি ও মুনাফার মধ্যে সমমুখী বা ধনাত্মক (Positive) সম্পর্ক বিদ্যমান। অর্থাৎ ঝুঁকি বেশি হলে মুনাফার সম্ভাবনা বেশি থাকে। বলা হয়, 'No risk, no gain'। ঝুঁকি হলো ব্যবসায়ের অবিচ্ছেদ্য অংশ।",
            "২. উপযোগ (Utility) সৃষ্টি: অভাব পূরণের ক্ষমতাকে উপযোগ বলে। ব্যবসায় প্রাকৃতিক রূপকে মানুষের ব্যবহারোপযোগী করে তুলে বিভিন্ন ধরনের বাধা দূর করে ৬ ধরনের প্রধান উপযোগ সৃষ্টি করে। এখান থেকে অ্যাডমিশনে প্রশ্ন আসেই!",
            "   👉 রূপগত বা আকারগত উপযোগ: 'শিল্প' কাঁচামালকে পণ্যে রূপান্তরের মাধ্যমে এটি সৃষ্টি করে (যেমন কাঠে থেকে আসবাবপত্র)।",
            "   👉 স্থানগত উপযোগ: 'পরিবহন (Transportation)' এক স্থান থেকে অন্য স্থানে পণ্য নেওয়ার মাধ্যমে স্থানগত বাধা দূর করে এটি সৃষ্টি করে।",
            "   👉 সময়গত বা কালগত উপযোগ: 'গুদামজাতকরণ (Warehousing)' পণ্য সংরক্ষণ করার মাধ্যমে সময়গত বাধা দূর করে উপযোগ সৃষ্টি করে।",
            "   👉 স্বত্বগত বা মালিকানাগত উপযোগ: 'ক্রয়-বিক্রয় বা ট্রেড' এর ফলে বিক্রেতা থেকে ক্রেতার কাছে মালিকানা যায়, তাই এটি সৃষ্টি করে।",
            "   👉 জ্ঞানগত বা তথ্যগত উপযোগ: 'বিজ্ঞাপন বা প্রসার' কার্যের মাধ্যমে নতুন পণ্যের তথ্য জানানো হয়, যা এই উপযোগ সৃষ্টি করে।",
            "   👉 অর্থগত উপযোগ: 'ব্যাংকিং' অর্থনৈতিকে সাহায্য করে এবং অর্থগত উপযোগ সৃষ্টি করে।",
            "   👉 ঝুঁকিগত উপযোগ: 'বিমা (Insurance)' ঝুঁকিগত বা আর্থিক ক্ষতির সম্ভাবনা দূর করে ঝুঁকিগত উপযোগ সৃষ্টি করে।",
            "৩. লেনদেনের পৌনঃপুনিকতা: একবার পণ্য কিনে বিক্রি করলেই তাকে ব্যবসায় বলা যায় না। ব্যবসায়ের ক্ষেত্রে লেনদেনের পৌনঃপুনিকতা বা ধারাবাহিকতা থাকতে হবে।"
          ]
        },
        {
          title: "🏭 ৪. শিল্প (Industry) — উৎপাদনের বাহন",
          items: [
            "আওতা: ব্যবসায়ের সমীকরণের 'I' হলো Industry। এটি রূপগত উপযোগ সৃষ্টি করে এবং একে 'উৎপাদনের বাহন' বা উৎপাদনকারী শাখা বলা হয়।",
            "ভর্তি পরীক্ষার জন্য শিল্পের প্রধান প্রকারভেদগুলো নিচে বিস্তারিত দেওয়া হলো:",
            "১. প্রজনন শিল্প (Genetic Industry): যেখানে উদ্ভিদ ও প্রাণীর বংশবিস্তার করা হয় এবং তা পুনরায় উৎপাদন বা সৃষ্টির কাজে ব্যবহৃত হয়। যেমন: হ্যাচারি (Hatchery), নার্সারি, পোল্ট্রি, ডেইরি ফার্ম।",
            "২. নিষ্কাশন শিল্প (Extractive Industry): ভূ-গর্ভ, জল বা বায়ু অর্থাৎ প্রাকৃতিক পরিবেশ থেকে সম্পদ উত্তোলন করা। যেমন: কৃষিকাজ (মাটি থেকে ফসল), খনিজ উত্তোলন (খনি থেকে কয়লা, স্বর্ণ), নদী/সাগর থেকে মাছ ধরা, বন থেকে মধু বা কাঠ সংগ্রহ।",
            "৩. নির্মাণ শিল্প (Construction Industry): রাস্তাঘাট, সেতু, দালানকোঠা ইত্যাদি অবকাঠামো তৈরি। যেমন: পদ্মা সেতু, ফ্লাইওভার, রিয়েল এস্টেট।",
            "৪. প্রস্তুত বা উৎপাদন শিল্প (Manufacturing Industry): যন্ত্র ও শ্রম ব্যবহার করে কাঁচামাল বা অর্ধ-প্রস্তুত পণ্যকে চূড়ান্ত বা মানুষের ব্যবহারোপযোগী পণ্যে রূপান্তর। এটিকে ৪টি ভাগে ভাগ করা যায় (ভর্তি পরীক্ষার হট টপিক):",
            "   🔥 বিশ্লেষণ শিল্প (Analytical): একটি পদার্থকে বিশ্লেষণ বা পৃথক করে একাধিক পণ্য পাওয়া গেলে। যেমন: খনিজ তেল শোধন (একই খনিজ তেল থেকে পেট্রোল, ডিজেল, অকটেন, কেরোসিন পাওয়া। কয়লা খনি।",
            "   🔥 যৌগিক শিল্প (Synthetic): পৃথক পৃথক একাধিক উপাদান মিশিয়ে বা যুক্ত করে নতুন পণ্য তৈরি। যেমন: সাবান (অনেক কিছু মেশাতে হয়), সিমেন্ট, সার, ঔষধ, প্রসাধন সামগ্রী।",
            "   🔥 প্রক্রিয়াজাতকরণ শিল্প (Processing): কাঁচামালকে বিভিন্ন ধারাবাহিক স্তরের মধ্য দিয়ে পার করে পণ্য তৈরি। যেমন: তুলা থেকে সুতা বা বস্ত্র, ইক্ষু থেকে চিনি, পাট শিল্প।",
            "   🔥 সংযোজন শিল্প (Assembling): অন্য কোনো শিল্পের উৎপাদিত বিভিন্ন যন্ত্রাংশ একত্রিত বা সংযোজিত করে নতুন পণ্য তৈরি। যেমন: গাড়ি, মোবাইল, কম্পিউটার সংযোজন, বিমান ও টেলিভিশন তৈরি।",
            "৫. সেবামূলক শিল্প (Service Industry): মানুষের জীবনকে সহজ, স্বাচ্ছন্দ্যময় ও আরামদায়ক করার কাজে নিয়োজিত শিল্প। যেমন: বিদ্যুৎ উৎপাদন ও সরবরাহ, গ্যাস সরবরাহ, ওয়াসা (পানি), টেলিযোগাযোগ (টেলিকম), হাসপাতাল, পর্যটন (Tourism)।"
          ]
        },
        {
          title: "🚢 ৫. বাণিজ্য (Commerce) — বণ্টনকারী শাখা",
          items: [
            "সংজ্ঞা: শিল্পের মাধ্যমে উৎপাদিত পণ্য বা সেবা চূড়ান্ত ভোক্তার কাছে পৌঁছানোর সাথে জড়িত সকল অর্থনৈতিক কাজকে বাণিজ্য বলে।",
            "গুরুত্ব: উৎপাদক ও ভোক্তার মধ্যে সেতুবন্ধন রচনা করে বাণিজ্য। এটি পণ্য বণ্টনজনিত বা ব্যক্তিগত বাধা (ক্রয়-বিক্রয়ের মাধ্যমে), স্থানগত, সময়গত ইত্যাদি বাধা দূর করে।",
            "বাণিজ্যকে ২টি প্রধান ভাগে ভাগ করা যায়: ট্রেড বা পণ্য বিনিময় (Trade) এবং ট্রেড সহায়ক কার্যাবলি।",
            "ট্রেড (Trade) বা পণ্য বিনিময়: সাধারণত মুনাফা অর্জনের উদ্দেশ্যে পণ্য ক্রয় ও বিক্রয় কাজকে ট্রেড বলে। এটি ২ প্রকার। অভ্যন্তরীণ বাণিজ্য এবং বৈদেশিক বাণিজ্য।",
            "অভ্যন্তরীণ বাণিজ্য (Internal Trade): দেশের ভৌগোলিক সীমানার ভেতরের ক্রয়-বিক্রয়। এটি ২ প্রকার: পাইকারি (Wholesale) এবং খুচরা (Retail)। উৎপাদকের কাছ থেকে লটে পণ্য কিনে যারা খুচরা বিক্রেতার কাছে বিক্রি করে তারা পাইকারি বিক্রেতা। আর খুচরা বিক্রেতারা সরাসরি ভোক্তার কাছে বিক্রি করে।",
            "বৈদেশিক বাণিজ্য (Foreign Trade): দুই বা ততোধিক দেশের ভৌগোলিক সীমানার বাইরের ক্রয়-বিক্রয়। এটি ৩ প্রকার: আমদানি (Import), রপ্তানি (Export) এবং পুনরপ্তানি (Entrepot)।",
            "পুনরপ্তানি (Entrepot): এক দেশ থেকে পণ্য আমদানি করে, নিজের দেশে ভোগ না করে, কোনো রূপ পরিবর্তন ছাড়াই অন্য কোনো দেশে সুযোগ বুঝে তা পুনরায় রপ্তানি করা। (যেমন: বাংলাদেশ আমেরিকা থেকে তুলা এনে পরবর্তীতে তা জাপানে বিক্রি করে দিলে, তা হবে পুনরপ্তানি)।",
            "ট্রেড সহায়ক কার্যাবলি: ব্যাংকিং (অর্থ সংস্থানগত বাধা দূর), বিমা (ঝুঁকিগত বাধা দূর), পরিবহন (স্থানগত বাধা), গুদামজাতকরণ (কালগত বাধা) ও বিজ্ঞাপন প্রচার (তথ্যগত বাধা)।"
          ]
        },
        {
          title: "👨‍⚕️ ৬. প্রত্যক্ষ সেবা (Direct Services)",
          items: [
            "সংজ্ঞা: মুনাফা অর্জনের উদ্দেশ্যে স্বাধীন পেশায় নিয়োজিত ব্যক্তিরা সরাসরি তাদের মেধা, দক্ষতা বা শ্রমের মাধ্যমে যে অদৃশ্য সেবা প্রদান করেন। এটি ব্যবসায়ের সমীকরণের 'DS' অংশ।",
            "উদাহরণ: ডাক্তারদের ক্লিনিক, ইঞ্জিনিয়ারিং ফার্ম, অডিট ফার্ম, ল' ফার্ম (আইনজীবীদের চেম্বার), বিউটি পার্লার, সেলুন, লন্ড্রি ইত্যাদি।",
            "সেবার ৪টি মূল বৈশিষ্ট্য: সেবাকে দেখা বা স্পর্শ করা যায় না (Intangibility), সেবা ও সেবাদানকারী ব্যক্তিকে আলাদা করা যায় না (Inseparability), সেবা ভবিষ্যতের জন্য সংরক্ষণ বা গুদামজাত করে রাখা যায় না (Perishability) এবং সেবার মান ব্যক্তিভেদে পরিবর্তনশীল (Variability)।"
          ]
        },
        {
          title: "📉 ৭. ব্যবসায়ের কার্যাবলি: বাজারজাতকরণ, প্রমিতকরণ ও অর্থসংস্থান",
          items: [
            "অর্থসংস্থান (Financing): ব্যবসায়ের জন্য প্রয়োজনীয় মূলধন সংগ্রহ করা। মূলধন বা অর্থসংস্থানকে ব্যবসায়ের জীবনরক্ত (Lifeblood) বলা হয়।",
            "মান বা প্রমিতকরণ (Standardization): পণ্য বা সেবার ওজন, আকার, রঙ এবং গুণাগুণের ভিত্তিতে একটি আদর্শ মান (Standard) বা গ্রেড নির্ধারণ করা।",
            "পর্যায়িতকরণ বা শ্রেণিবিন্যাসকরণ (Grading): প্রমিতকরণ বা মান অনুযায়ী পণ্যকে বিভিন্ন শ্রেণিতে বা লটে ভাগ করাকে পর্যায়িতকরণ বলে। যেমন- বড়, মাঝারি ও ছোট আমের আলাদা বাক্স করা।",
            "মোড়কীকরণ (Packaging): পণ্যকে রোদ-বৃষ্টি বা ক্ষতির হাত থেকে রক্ষা করার জন্য এবং আকর্ষণীয় করার জন্য আবরণ দেওয়াই হলো মোড়কীকরণ।"
          ]
        },
        {
          title: "💰 ৮. সামাজিক দায়বদ্ধতা (CSR) ও সামাজিক ব্যবসায়",
          items: [
            "CSR (Corporate Social Responsibility): ব্যবসায়ের ক্ষেত্রে অর্থনৈতিক উদ্দেশ্য (মুনাফা অর্জন) এবং সামাজিক উদ্দেশ্যের মধ্যে ভারসাম্য বজায় রাখাকে কর্পোরেট সামাজিক দায়বদ্ধতা বা CSR বলে।",
            "সামাজিক ব্যবসায় (Social Business): নোবেল বিজয়ী ডঃ মুহাম্মদ ইউনূস এই ধারণার প্রবর্তক। এই প্রকার ব্যবসায়ের মূল লক্ষ্য মুনাফা অর্জন নয়, বরং সমাজের একটি নির্দিষ্ট সমস্যার সমাধান করা। এতে বিনিয়ুক্ত মূলধন ফেরত পাওয়া যায় কিন্তু বিনিয়োগকারীরা কোনো লভ্যাংশ (Dividend) গ্রহণ করতে পারেন গঠন করতে পারেন না। অর্জিত মুনাফা পুনরায় ব্যবসায়ের সম্প্রসারণের কাজে ব্যবহার করা হয়।"
          ]
        },
        {
          title: "🚀 ৯. এডমিশন স্পেশাল মাস্টার হ্যাকস (Very VVI Facts)",
          items: [
            "১. ব্যবসায়ের প্রাচীনতম রূপ কোনটি? — একমালিকানা ব্যবসায়।",
            "২. বাণিজ্যের প্রধান উপযোগ কোনটি? — স্বত্বগত বা মালিকানাগত উপযোগ।",
            "৩. শিল্পের প্রধান উপযোগ কোনটি? — রূপগত বা আকারগত উপযোগ।",
            "৪. ব্যবসায়ের প্রথম ও প্রধান কাজ কোনটি? — উৎপাদন (Production)।",
            "৫. জীবনবিমা কোন ধরনের উপযোগ সৃষ্টি করে? — ঝুঁকিগত উপযোগ (অবশ্য এটি এক ধরনের চুক্তিও)।",
            "৬. বাংলাদেশে ব্যবসায়ের ক্ষেত্রে সবচেয়ে বড় বাধা কোনটি? — পর্যাপ্ত মূলধনের অভাব ও দুর্বল অবকাঠামো।",
            "৭. 'No risk, No gain' - এই নীতি ব্যবসায়ের কোন বৈশিষ্ট্যের সাথে জড়িত? — ঝুঁকি ও অনিশ্চয়তার সাথে।",
            "৮. নার্সারি বা হ্যাচারি কোন শিল্পের অন্তর্ভুক্ত? — প্রজনন শিল্পের।",
            "৯. কৃষি ও মৎস্য চাষ কোন শিল্পের অন্তর্ভুক্ত? — নিষ্কাশন শিল্পের।",
            "১০. সংযোজন শিল্পের একটি উদাহরণ দাও। — অটোমোবাইল শিল্প (গাড়ি তৈরি), কম্পিউটার বা মোবাইল সংযোজন।",
            "১১. শিল্প বিপ্লবের সূত্রপাত হয়েছিল কোথায়? — যুক্তরাজ্যে (গ্রেট ব্রিটেনে)।",
            "১২. মুনাফার আশায় পরিচালিত বৈধ কার্যাবলিকে কী বলে? — ব্যবসায়।"
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

        {/* Improved Interactive Controls Block (Search & Filters) */}
        <div className="bg-white border border-slate-150 p-5 sm:p-6 rounded-[28px] shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bengali font-bold text-base text-[#0F2744] flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-indigo-500" /> নোট লাইব্রেরি খুঁজে নিন
              </h3>
              <p className="font-bengali text-xs text-slate-400">বিষয় নির্বাচন করুন অথবা কী-ওয়ার্ড দিয়ে নির্দিষ্ট লার্নিং শিট সার্চ করুন</p>
            </div>

            {/* Smart Search Filter Field */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-405 text-slate-400" />
              <Input 
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="শিরোনাম, অধ্যায় বা ট্যাগ লিখে খুঁজুন..."
                className="pl-10 h-11 font-bengali text-sm bg-slate-50/70 hover:bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 rounded-2xl w-full"
              />
            </div>
          </div>

          <Separator className="bg-slate-100" />

          {/* Quick Dynamic Subject Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 select-none scrollbar-none">
            {availableSubjects.map((sub, sIdx) => {
              const isSelected = selectedSubject === sub;
              return (
                <button
                  key={sIdx}
                  onClick={() => setSelectedSubject(sub)}
                  className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-bengali font-extrabold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#0F2744] text-white shadow-xs"
                      : "bg-slate-100/75 hover:bg-slate-200/60 text-slate-600"
                  }`}
                >
                  {sub === "All" ? "সব বিষয়" : sub}
                </button>
              );
            })}
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

                          <div className="flex flex-wrap items-center gap-2">
                            {note.badges?.map((b, idx) => (
                              <span 
                                key={idx} 
                                className={`font-bengali text-[11px] sm:text-xs rounded-full px-3 py-1 font-extrabold tracking-wide ${
                                  idx === 0 
                                    ? "bg-amber-100/60 text-amber-850 border border-amber-200/50" 
                                    : "bg-slate-100 text-slate-600 border border-slate-150"
                                }`}
                              >
                                {b}
                              </span>
                            ))}
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
