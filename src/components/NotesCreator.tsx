import { useState, useEffect } from "react";
import { BookOpen, AlertTriangle, FileCheck, Play, Printer, Save, Trash2, Eye, HelpCircle, Code, List, Sparkles, Copy, BookOpenCheck } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

// Shared function to generate beautiful printable HTML
export const generatePrintableHtml = (note: any) => {
  const introHtml = note.content?.intro ? `<div class="intro-box">${note.content.intro}</div>` : "";
  
  const chaptersHtml = (note.content?.chapters || []).map((chapter: any, cIdx: number) => {
    const itemsHtml = (chapter.items || []).map((item: any) => {
      if (typeof item === "string") {
        return `<div class="item-text">• ${item}</div>`;
      }
      
      if (item && typeof item === "object") {
        if (item.type === "table") {
          const headersHtml = (item.headers || []).map((h: string) => `<th>${h}</th>`).join("");
          const rowsHtml = (item.rows || []).map((row: any[]) => {
            const cellsHtml = (row || []).map((cell: any) => {
              if (typeof cell === "object" && cell !== null) {
                if (Array.isArray(cell)) {
                  const arrHtml = cell.map((c: any) => {
                    if (typeof c === "object" && c !== null) {
                      if (c.q && c.a) return `<div style="margin-bottom:8px;padding:8px;background:#f8fafc;border-radius:6px;border:1px solid #f1f5f9;"><b>প্র:</b> ${c.q} <br/> <span style="color:#475569"><b>উ:</b> ${c.a}</span></div>`;
                      return typeof c === "string" ? c : JSON.stringify(c);
                    }
                    return c;
                  }).join("");
                  return `<td>${arrHtml}</td>`;
                }
                return `<td>${JSON.stringify(cell)}</td>`;
              }
              return `<td>${cell}</td>`;
            }).join("");
            return `<tr>${cellsHtml}</tr>`;
          }).join("");
          return `
            <div class="table-container">
              <table>
                <thead><tr>${headersHtml}</tr></thead>
                <tbody>${rowsHtml}</tbody>
              </table>
            </div>
          `;
        }
        
        if (item.type === "tip") {
          return `
            <div class="tip-box">
              <div class="tip-title">⚡ ${item.title || "এক্সক্লুসিভ শিক্ষক টিপস"}</div>
              <div class="tip-content">${item.content || ""}</div>
            </div>
          `;
        }
        
        if (item.type === "qa") {
          return `
            <div class="qa-box">
              <div class="qa-q">${item.q || ""}</div>
              <div class="qa-a">${item.a || ""}</div>
            </div>
          `;
        }
        
        if (item.type === "text") {
          return `<div class="item-text">${item.content || ""}</div>`;
        }
      }
      return "";
    }).join("");
    
    return `
      <div class="chapter-container">
        <h2>${chapter.title || ""}</h2>
        <div class="chapter-body">
          ${itemsHtml}
        </div>
      </div>
    `;
  }).join("");

  const badgesHtml = (note.badges || []).map((b: string) => `<span class="badge">${b}</span>`).join(" ");

  return `
    <div class="printable-note-wrapper">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        
        .printable-note-wrapper {
          font-family: 'Hind Siliguri', 'Inter', system-ui, sans-serif;
          color: #1e293b;
          line-height: 1.65;
          background-color: #ffffff !important;
          padding: 24px;
          max-width: 820px;
          margin: 0 auto;
          text-align: left;
          box-sizing: border-box;
        }

        .printable-note-wrapper * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* Clean document/A4 layout header */
        .sheet-header {
          border-bottom: 2px solid #0f2744;
          padding-bottom: 12px;
          margin-bottom: 24px;
        }
        
        .sheet-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .printable-note-wrapper h1 {
          font-size: 24px;
          color: #0f172a;
          font-weight: 700;
          line-height: 1.35;
          margin-bottom: 8px;
          display: block;
        }

        .meta-container {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px 12px;
          font-size: 13px;
          color: #475569;
        }

        .meta-item {
          display: inline-flex;
          align-items: center;
        }
        
        .meta-item strong {
          color: #0f2744;
          margin-left: 3px;
        }

        .badge-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .badge {
          background-color: #f1f5f9;
          color: #475569;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 11px;
          border: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        /* Intro description styling */
        .intro-box {
          background-color: #f8fafc;
          border-left: 4px solid #f59e0b;
          padding: 14px 16px;
          border-radius: 0 8px 8px 0;
          font-style: italic;
          margin-bottom: 28px;
          font-size: 14.5px;
          color: #334155;
          line-height: 1.6;
        }

        /* Chapter containers corresponding to pages */
        .chapter-container {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }

        .printable-note-wrapper h2 {
          font-size: 17px;
          color: #0c4a6e;
          margin-top: 20px;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1px dashed #cbd5e1;
          font-weight: 700;
        }

        .chapter-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Clean multi-line bullet text */
        .item-text {
          font-size: 14.5px;
          color: #1e293b;
          text-align: justify;
          white-space: pre-line;
          padding-left: 2px;
        }

        /* Beautiful table styling for finances / calculations */
        .table-container {
          margin: 14px 0;
          width: 100%;
          overflow-x: auto;
          page-break-inside: avoid;
        }

        .printable-note-wrapper table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 6px;
          font-size: 13px;
        }

        .printable-note-wrapper th {
          background-color: #0F2744;
          color: white;
          text-align: left;
          padding: 8px 10px;
          font-weight: 600;
          border: 1px solid #cbd5e1;
        }

        .printable-note-wrapper td {
          padding: 8px 10px;
          border: 1px solid #cbd5e1;
          text-align: left;
          color: #334155;
        }

        .printable-note-wrapper tr:nth-child(even) {
          background-color: #f8fafc;
        }

        /* Minimal high contrast callaway boxes */
        .tip-box {
          background-color: #fffbeb;
          border-left: 4px solid #d97706;
          border-top: 1px solid #fef3c7;
          border-right: 1px solid #fef3c7;
          border-bottom: 1px solid #fef3c7;
          border-radius: 0 8px 8px 0;
          padding: 12px 14px;
          margin: 12px 0;
          font-size: 13.5px;
          color: #78350f;
          page-break-inside: avoid;
        }

        .tip-title {
          font-weight: 700;
          margin-bottom: 4px;
          font-size: 13.5px;
          color: #92400e;
        }

        .tip-content {
          white-space: pre-line;
          line-height: 1.5;
        }

        .qa-box {
          background-color: #f0fdf4;
          border-left: 4px solid #16a34a;
          border-top: 1px solid #bbf7d0;
          border-right: 1px solid #bbf7d0;
          border-bottom: 1px solid #bbf7d0;
          border-radius: 0 8px 8px 0;
          padding: 12px 14px;
          margin: 12px 0;
          page-break-inside: avoid;
        }

        .qa-q {
          font-weight: 700;
          color: #14532d;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .qa-a {
          color: #1e293b;
          font-size: 13.5px;
          white-space: pre-line;
        }

        /* Minimalistic watermark / footer */
        .sheet-footer {
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          margin-top: 40px;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          page-break-inside: avoid;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 12mm 12mm 12mm;
          }
          body {
            background-color: #ffffff !important;
          }
          .printable-note-wrapper {
            padding: 0;
            max-width: 100%;
            margin: 0;
            font-size: 14px;
            color: #1e293b !important;
          }
          .chapter-container {
            page-break-inside: avoid;
          }
        }
      </style>
      
      <div class="sheet-header">
        <div class="sheet-title-row">
          <h1>${note.title || ""}</h1>
        </div>
        <div class="meta-container">
          <div class="meta-item">বিষয়: <strong>${note.subject || ""}</strong></div>
          <div class="meta-item">শ্রেণী: <strong>${note.classGroup || ""}</strong></div>
          <div class="meta-item">মাস্টার লেকচার শিট</div>
        </div>
        <div class="badge-list">
          ${badgesHtml}
        </div>
      </div>
      
      ${introHtml}
      
      <div class="chapters-wrapper">
        ${chaptersHtml}
      </div>
      
      <div class="sheet-footer">
        বিদ্যায়ন ক্লাসরুম প্ল্যাটফর্ম — মেধাবী ভবিষ্যতের পথে
      </div>
    </div>
  `;
};

// Beautiful Templates
const accountingTemplate = {
  title: "হিসাববিজ্ঞান ১ম পত্র (টেস্ট পেপার) — ২নং প্রশ্নের সমাধান",
  subject: "হিসাববিজ্ঞান",
  classGroup: "HSC",
  badges: ["হিসাববিজ্ঞান ১ম", "মাস্টার শিট", "এইচএসসি ২০২৬"],
  description: "বারিদ ট্রেডার্সের বিষদ আয় বিবরণী ও ১লা ডিসেম্বরের আর্থিক অবস্থার বিবরণীর গাণিতিক বিশ্লেষণ শিট।",
  content: {
    intro: "এইচএসসি সিলেবাস ২০২৬ অনুযায়ী হিসাববিজ্ঞান ১ম পত্রের আর্থিক বিবরণীর ২নং প্রশ্নের সম্পূর্ণ বিশুদ্ধ ও বিস্তারিত ছকভিত্তিক সমাধান শিট। এটি মূলত পরীক্ষার্থীদের দ্রুত বিশ্লেষণের জন্য অত্যন্ত গুরুত্বপূর্ণ।",
    chapters: [
      {
        title: "ক. ২নং প্রশ্নের সমাধান — ভ্যাট চলতি হিসাব ও সাধারণ খতিয়ান",
        items: [
          {
            type: "table",
            headers: ["তারিখ", "বিবরণ", "জা.পৃ.", "ডেবিট টাকা", "ক্রেডিট টাকা", "ব্যালেন্স (ডেবিট)", "ব্যালেন্স (ক্রেডিট)"],
            rows: [
              ["২০২৪ জানু ১", "ব্যালেন্স বি/ডি", "—", "—", "—", "৮,০০০", "—"],
              ["জানু ৫", "ক্রয় হিসাব (২,৭৬,০০০ x ১৫/১১৫)", "—", "৩৬,০০০", "—", "৪৪,০০০", "—"],
              ["জানু ১২", "বিক্রয় হিসাব", "—", "—", "৪৫,০০০", "—", "১,০০০"]
            ]
          },
          "টীকা: ভ্যাট নির্নয় করার জন্য কতিপয় ক্ষেত্রে সাধারণ ক্রয়/বিক্রয় মূল্যের উপর ১৫% ভ্যাট নির্ণয় করতে হয়। ক্রয় ও বিক্রয় হিসাবের সমন্বয় চলতি সাধারণ বিবরণীর ব্যালেন্স কলামে দেখানো হয়েছে।"
        ]
      },
      {
        title: "খ. বারিদ ট্রেডাসের বিষদ আয় বিবরণী (আংশিক)",
        items: [
          {
            type: "table",
            headers: ["বিবরণ", "টাকা", "টাকা", "টাকা"],
            rows: [
              ["মোট লাভ (প্রশ্নে প্রদত্ত)", "", "", "১,০০,০০০"],
              ["বাদ: পরিচালন ব্যয় — বেতন", "২৫,০০০", "", ""],
              ["(+) বকেয়া বেতন", "৫,০০০", "৩০,০০০", ""],
              ["অনাদায়ী পাওনা", "৩,০০০", "", ""],
              ["(+) নতুন অনাদায়ী পাওনা ও সঞ্চিতি", "৫,৪০০", "৮,৪০০", ""],
              ["(-) পুরাতন অনাদায়ী পাওনা সঞ্চিতি", "৩,০০০", "৫,৪০০", ""],
              ["ইজারা সম্পত্তির অবলোপন (১/১০)", "", "৮,০০০", ""],
              ["যন্ত্রপাতির অবমূল্যায়ন", "", "১৪,০০০", "৫৭,৪০০"],
              ["পরিচালন মুনাফা", "", "", "৪২,৬০০"]
            ]
          },
          {
            type: "tip",
            title: "এক্সক্লুসিভ শিক্ষক টিপস",
            content: "১. নতুন অনাদায়ী পাওনা সঞ্চিতি = (৫০,০০০ - ১,০০০) x ১০% = ৪,৯০০ টাকা।\n২. বেতনের ক্ষেত্রে বকেয়া হিসেব খুব সূক্ষ্মভাবে করতে হবে।"
          }
        ]
      },
      {
        title: "গ. সৃজনশীল CQ অনুধাবনমূলক প্রশ্ন ও উত্তর",
        items: [
          {
            type: "qa",
            q: "১. প্রারম্ভিক মূলধনের পরিমাণ কীভাবে নির্ণয় করবে?",
            a: "প্রারম্ভিক মোট সম্পদ থেকে প্রারম্ভিক মোট দায় বিয়োগ করলে প্রারম্ভিক মূলধন পাওয়া যায়। সূত্র: প্রারম্ভিক মূলধন = প্রারম্ভিক মোট সম্পদ - প্রারম্ভিক মোট দায়।"
          },
          {
            type: "qa",
            q: "২. রেওয়ামিল তৈরি করার সময় কোন কোন দফা অন্তর্ভুক্ত হয় না?",
            a: "রেওয়ামিল তৈরির সময় সমাপনী মজুদ পণ্য, প্রারম্ভিক নগদ তহবিল এবং প্রারম্ভিক ব্যাংক জমা অন্তর্ভুক্ত হয় না। কারণ এগুলো অন্য দফার সাথে সমন্বিত থাকে।"
          }
        ]
      }
    ]
  }
};

const defaultTemplate = {
  title: "মহাজাগতিক রসায়ন — ১ম অধ্যায় বেসিক নোটস",
  subject: "রসায়ন",
  classGroup: "HSC",
  badges: ["রসায়ন ১ম", "স্মার্ট নোটস", "মেগা সিরিজ ২০২৬"],
  description: "কণা পরমাণু ও কোয়ান্টাম সংখ্যার মূল বিষয় সহজ ভাষায় বুঝানো হয়েছে।",
  content: {
    intro: "রসায়ন প্রথম পত্রের অত্যন্ত চমৎকার অধ্যায় 'গুণগত রসায়ন'-এর পার্ট-১ লেকচার শিট। এতে বিভিন্ন পরমাণু মডেল এবং ম্যাথ ফরমুলা ব্যাখ্যা করা হয়েছে।",
    chapters: [
      {
        title: "১. রাদারফোর্ড এবং বোর পরমাণু মডেলের তুলনা",
        items: [
          "রাদারফোর্ড মডেল সৌরজগতের সাথে তুলনীয় যা মূলত চার্জহীন, তবে বোর মডেল চার্জযুক্ত কণার ঘূর্ণন ব্যাখ্যামূলক।",
          {
            type: "table",
            headers: ["বৈশিষ্ট্যসমূহ", "রাদারফোর্ড মডেল", "বোর পরমাণু মডেল"],
            rows: [
              ["ভিত্তি", "আলফা কণা বিচ্ছুরণ পরীক্ষা", "প্লাঙ্কের কোয়ান্টাম তত্ত্ব"],
              ["কক্ষপথ", "কক্ষপথের আকার বা ব্যাসার্ধ জানা যায় না", "বৃত্তাকার সুনির্দিষ্ট কক্ষপথ রয়েছে"],
              ["সীমাবদ্ধতা", "তড়িৎ গতিবিদ্যা তত্ত্ব অনুযায়ী অস্থিতিশীল", "বর্ণালীর সূক্ষ্ম রেখা ব্যাখ্যা করতে পারে না"]
            ]
          }
        ]
      },
      {
        type: "text",
        content: "পরমাণুর নিউক্লিয়াসের চারপাশে ইলেকট্রনের কক্ষপথ সম্পর্কিত সমস্ত গাণিতিক সূত্র কোয়ান্টাম মেকানিক্স দিয়ে চূড়ান্ত করা হয়।"
      },
      {
        title: "২. কোয়ান্টাম সূত্র ও শর্টকাট টিপস",
        items: [
          {
            type: "tip",
            title: "পরীক্ষার শর্টকাট মেগা টিপস",
            content: "উপশক্তিস্তরের মোট ইলেকট্রন ধারণক্ষমতার সুত্র: 2(2l + 1) \nপ্রধান শক্তিস্তরের মোট ইলেকট্রন ধারণক্ষমতা: 2n²"
          }
        ]
      }
    ]
  }
};

export default function NotesCreator() {
  const [jsonInput, setJsonInput] = useState("");
  const [parsedNote, setParsedNote] = useState<any | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const [creatorMode, setCreatorMode] = useState<"json" | "external" | "text">("json");
  const [extTitle, setExtTitle] = useState("");
  const [extSubject, setExtSubject] = useState("বাংলা");
  const [extClassGroup, setExtClassGroup] = useState("HSC");
  const [extDescription, setExtDescription] = useState("");
  const [extLink, setExtLink] = useState("");
  const [extBadge, setExtBadge] = useState("PDF নোট,রিভিশন");
  const [textContent, setTextContent] = useState("");

  const handleTextPublish = async () => {
    if (!extTitle || !extSubject || !extClassGroup || !textContent) {
      alert("দয়াকরে টাইটেল, বিষয়, ক্লাস এবং নোটের টেক্সট প্রদান করুন।");
      return;
    }
    setLoading(true);
    setSuccessMsg("");
    try {
      const payload = {
        title: extTitle,
        subject: extSubject,
        classGroup: extClassGroup,
        description: extDescription,
        badges: extBadge.split(",").map(b => b.trim()).filter(b => b),
        isExternal: false,
        createdAt: new Date().toISOString(),
        content: {
          intro: "",
          chapters: [
            {
              title: "প্রধান অংশ",
              items: [
                {
                  type: "text",
                  content: textContent
                }
              ]
            }
          ]
        }
      };
      await addDoc(collection(db, "notes"), payload);
      setSuccessMsg("🎉 টেক্সট নোটটি সফলভাবে পাবলিশ করা হয়েছে!");
      setExtTitle(""); setExtDescription(""); setTextContent("");
      loadSavedNotesFromDb();
      setTimeout(() => setSuccessMsg(""), 6000);
    } catch (err: any) {
      alert("পাবলিশ ব্যর্থ হয়েছে: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExternalPublish = async () => {
    if (!extTitle || !extSubject || !extClassGroup || !extLink) {
      alert("দয়াকরে টাইটেল, বিষয়, ক্লাস এবং লিংক প্রদান করুন।");
      return;
    }
    setLoading(true);
    setSuccessMsg("");
    try {
      const payload = {
        title: extTitle,
        subject: extSubject,
        classGroup: extClassGroup,
        description: extDescription,
        badges: extBadge.split(",").map(b => b.trim()).filter(b => b),
        link: extLink,
        isExternal: true,
        createdAt: new Date().toISOString(),
        content: null
      };
      await addDoc(collection(db, "notes"), payload);
      setSuccessMsg("🎉 এক্সটার্নাল নোটটি সফলভাবে পাবলিশ করা হয়েছে!");
      setExtTitle(""); setExtDescription(""); setExtLink("");
      loadSavedNotesFromDb();
      setTimeout(() => setSuccessMsg(""), 6000);
    } catch (err: any) {
      alert("পাবলিশ ব্যর্থ হয়েছে: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (type: "accounting" | "chemistry") => {
    const tmpl = type === "accounting" ? accountingTemplate : defaultTemplate;
    const str = JSON.stringify(tmpl, null, 2);
    setJsonInput(str);
    validateAndParse(str);
  };

  const validateAndParse = (value: string) => {
    if (!value.trim()) {
      setParsedNote(null);
      setJsonError(null);
      return;
    }
    try {
      let parsed = JSON.parse(value);
      
      // If it is an array, let's gracefully unpack or wrap it!
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          setJsonError("JSON Error: The parsed array is empty.");
          setParsedNote(null);
          return;
        }
        
        // If the first element looks like a full note object (demands title, subject, and classGroup)
        if (parsed[0] && typeof parsed[0] === 'object' && parsed[0].title && parsed[0].subject && parsed[0].classGroup) {
          parsed = parsed[0];
        } else {
          // It's an array of chapters/items/slides. Let's auto-wrap it into a superb note view!
          parsed = {
            title: "স্বয়ংক্রিয় সাজানো লেকচার শিট (Array Input)",
            subject: "সাধারণ বিষয়",
            classGroup: "HSC",
            badges: ["অটো-ফরম্যাট", "স্মার্ট লেকচার"],
            description: "ইনপুটকৃত JSON Array থেকে স্বয়ংক্রিয়ভাবে সাজানো হয়েছে।",
            content: {
              intro: "আপনার প্রদান করা অ্যারে ডাটা নিচে চমৎকার চ্যাপ্টার আকারে প্রস্তুত করা হয়েছে:",
              chapters: parsed.map((item: any, idx: number) => {
                if (item && typeof item === "object") {
                  if (item.title || item.items) {
                    return {
                      title: item.title || `টপিক ${idx + 1}`,
                      items: item.items || (item.content ? [item.content] : [JSON.stringify(item)])
                    };
                  }
                  // Let's turn other keys into a table
                  const tableHeaders = Object.keys(item);
                  const tableRows = [Object.values(item).map(v => String(v))];
                  return {
                    title: item.name || item.heading || `টপিক — ${idx + 1}`,
                    items: [
                      {
                        type: "table",
                        headers: tableHeaders,
                        rows: tableRows
                      }
                    ]
                  };
                }
                // String or primitive
                return {
                  title: `লেকচার আলোচনা ${idx + 1}`,
                  items: [String(item)]
                };
              })
            }
          };
        }
      }

      if (!parsed || !parsed.title || !parsed.subject || !parsed.classGroup) {
        setJsonError("উইজেট রিকোয়ারমেন্ট: 'title', 'subject', এবং 'classGroup' (যেমন: HSC) প্রপার্টি রুট লেভেলে থাকা আবশ্যক।");
        setParsedNote(null);
        return;
      }
      setParsedNote(parsed);
      setJsonError(null);
    } catch (e: any) {
      setJsonError("ভুল JSON সিনট্যাক্স: " + e.message);
      setParsedNote(null);
    }
  };

  const loadSavedNotesFromDb = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "notes"));
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ dbId: doc.id, ...doc.data() });
      });
      setSavedNotes(list.sort((a,b) => (b.createdAt || "").localeCompare(a.createdAt || "")));
    } catch (error) {
      console.error("Error loading notes to dynamic creator", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedNotesFromDb();
    // Default load accounting template
    loadTemplate("accounting");
  }, []);

  const handlePublish = async () => {
    if (!parsedNote) {
      alert("দয়া করে ইনপুট ভ্যালিড JSON array/object প্রদান করুন!");
      return;
    }
    setLoading(true);
    setSuccessMsg("");
    try {
      const payload = {
        ...parsedNote,
        createdAt: new Date().toISOString(),
        isExternal: false,
        link: ""
      };
      
      // Save directly to dynamic Firestore collection `notes`
      await addDoc(collection(db, "notes"), payload);
      setSuccessMsg("🎉 নোটটি সফলভাবে পাবলিশ ও সেভ করা হয়েছে! শিক্ষার্থীরা এটি ড্যাশবোর্ডে দেখতে পারবে।");
      setJsonInput("");
      setParsedNote(null);
      loadSavedNotesFromDb();
      
      setTimeout(() => setSuccessMsg(""), 6000);
    } catch (err: any) {
      alert("পাবলিশ ব্যর্থ হয়েছে: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDbNote = async (dbId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই লেকচার নোটটি ডিলিট করতে চান? এটি শিক্ষার্থীদের স্ক্রিন থেকেও হারিয়ে যাবে!")) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, "notes", dbId));
      alert("সফলভাবে ডিলিট করা হয়েছে।");
      loadSavedNotesFromDb();
    } catch (err: any) {
      alert("ডিলিট করতে ত্রুটি: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (noteToPrint: any) => {
    if (downloadingPdf) return;
    setDownloadingPdf(true);

    document.body.classList.add("printing-allowed");

    const styleEl = document.createElement("style");
    styleEl.id = "print-style-override";
    styleEl.innerHTML = `
      @media print {
        html, body {
          display: block !important;
          height: auto !important;
          overflow: visible !important;
          position: static !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        body > :not(#print-temporary-container) {
          display: none !important;
        }
        #print-temporary-container {
          display: block !important;
          position: relative !important;
          width: 100% !important;
          max-width: 800px !important;
          margin: 0 auto !important;
          padding: 20px !important;
          box-sizing: border-box !important;
          background: #fff;
          height: auto !important;
          overflow: visible !important;
        }
        @page { size: A4 portrait; margin: 15mm; }
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
    container.innerHTML = generatePrintableHtml(noteToPrint);

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
        setDownloadingPdf(false);
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

    // Fallback cleanup
    setTimeout(cleanup, 35000);
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Premium Header Banner Segment */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[24px] p-6 sm:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        {/* Glow decorative graphics */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 text-left flex-1">
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold font-bengali">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> এডমিন ও শিক্ষক প্রিমিয়াম নোটস মেকার উয়িজেট
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-bengali tracking-tight leading-tight">
              স্টাইলিশ পিডিএফ ও প্রিন্ট লেকচার শিট জেনারেটর
            </h2>
            <p className="text-slate-300/80 text-xs sm:text-sm font-medium font-bengali max-w-3xl leading-relaxed">
              কোনো কায়িক পরিশ্রমি কোডার বা ডেভেলপারের সাহায্য ছাড়াই প্রফেশনাল হিসাববিজ্ঞান ছক, বিশেষ টিপস বক্স, বা সৃজনশীল Q&A কাঠামো সম্বলিত সুন্দর ও আকর্ষণীয় লেকচার শিট তৈরি করুন লাইভ।
            </p>
          </div>
          
          {/* Preset Templates Dynamic Selection */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
            <button 
              onClick={() => loadTemplate("accounting")}
              className="h-11 px-5 bg-amber-400 hover:bg-amber-500 hover:scale-[1.02] text-slate-950 font-bold font-bengali rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/15 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" /> হিসাববিজ্ঞান লেজার ছক টেমপ্লেট
            </button>
            <button 
              onClick={() => loadTemplate("chemistry")}
              className="h-11 px-5 bg-card/10 hover:bg-card/15 hover:scale-[1.02] text-white font-bold font-bengali rounded-xl text-xs border border-white/10 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Code className="w-4 h-4 text-indigo-300" /> রসায়ন বিজ্ঞান বেসিক টেমপ্লেট
            </button>
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-card p-1 rounded-2xl shadow-sm border border-slate-100 max-w-[600px] overflow-x-auto">
        <button 
          onClick={() => setCreatorMode("external")}
          className={`px-4 whitespace-nowrap py-3 text-sm font-bold font-bengali rounded-xl transition-all ${creatorMode === "external" ? "bg-emerald-500 text-white shadow-md" : "text-muted-foreground hover:bg-muted"}`}
        >
          সিঙ্গেল লিংক নোট 
        </button>
        <button 
          onClick={() => setCreatorMode("json")}
          className={`flex-1 whitespace-nowrap px-4 py-3 text-sm font-bold font-bengali rounded-xl transition-all ${creatorMode === "json" ? "bg-[#0f172a] text-white shadow-md" : "text-muted-foreground hover:bg-muted"}`}
        >
          কাস্টম স্মার্ট (JSON)
        </button>
        <button 
          onClick={() => setCreatorMode("text")}
          className={`flex-1 whitespace-nowrap px-4 py-3 text-sm font-bold font-bengali rounded-xl transition-all ${creatorMode === "text" ? "bg-blue-600 text-white shadow-md" : "text-muted-foreground hover:bg-muted"}`}
        >
          সাধারণ টেক্সট নোট
        </button>
      </div>

      {creatorMode === "text" ? (
        <div className="bg-card rounded-[24px] p-6 sm:p-8 border border-slate-100 shadow-sm max-w-3xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
             <h3 className="text-xl font-bold font-bengali text-foreground">সাধারণ টেক্সট নোট যুক্ত করুন</h3>
             <p className="text-slate-500 text-sm mt-1 font-bengali">খাতা-কলমের মত লিখে লিখে সরাসরি নোট পাবলিশ করুন।</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-bold font-bengali text-slate-700">নোটের টাইটেল</label>
              <input type="text" value={extTitle} onChange={e => setExtTitle(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bengali" placeholder="যেমন: এইচএসসি রসায়ন ১ম পত্র ফুল রিভিশন" />
            </div>
            
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
               <label className="text-sm font-bold font-bengali text-slate-700">বিষয়</label>
               <input type="text" value={extSubject} onChange={e => setExtSubject(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bengali" placeholder="যেমন: রসায়ন" />
            </div>
            
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
               <label className="text-sm font-bold font-bengali text-slate-700">ক্লাস গ্রুপ</label>
               <select value={extClassGroup} onChange={e => setExtClassGroup(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bengali">
                  <option value="HSC">HSC (একাদশ-দ্বাদশ)</option>
                  <option value="SSC">SSC (নবম-দশম)</option>
                  <option value="Class 6-8">Class 6-8 (৬ষ্ঠ-৮ম)</option>
                  <option value="Admission">Admission (ভর্তি পরীক্ষা)</option>
               </select>
            </div>
            
            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-bold font-bengali text-slate-700">মূল টেক্সট/নোট</label>
              <textarea value={textContent} onChange={e => setTextContent(e.target.value)} className="w-full h-40 p-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bengali" placeholder="এখানে সরাসরি আপনার নোটের বিষয়বস্তু লিখুন..." />
            </div>
            
            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-bold font-bengali text-slate-700">বর্ণনা (ঐচ্ছিক)</label>
              <textarea value={extDescription} onChange={e => setExtDescription(e.target.value)} className="w-full h-16 p-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bengali" placeholder="নোট সম্পর্কে কিছু বিস্তারিত লিখুন..." />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-bold font-bengali text-slate-700">ট্যাগ বা ব্যাজ (কমা দিয়ে লিখুন)</label>
              <input type="text" value={extBadge} onChange={e => setExtBadge(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-bengali" placeholder="টেক্সট নোট, রিভিশন, শর্টকাট" />
            </div>
          </div>
          
          <button 
            onClick={handleTextPublish}
            disabled={loading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold font-bengali rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
          >
             <Save className="w-4.5 h-4.5" /> {loading ? "সেভ হচ্ছে..." : "পাবলিশ করুন"}
          </button>
          
          {successMsg && creatorMode === "text" && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl text-sm font-bold font-bengali text-center animate-pulse">
              {successMsg}
            </div>
          )}
        </div>
      ) : creatorMode === "external" ? (
        <div className="bg-card rounded-[24px] p-6 sm:p-8 border border-slate-100 shadow-sm max-w-3xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
             <h3 className="text-xl font-bold font-bengali text-foreground">এক্সটার্নাল লিংক নোট যুক্ত করুন</h3>
             <p className="text-slate-500 text-sm mt-1 font-bengali">পিডিএফ, গুগল ড্রাইভ বা অন্য যেকোনো লিংকের মাধ্যমে নোট শেয়ার করুন।</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-bold font-bengali text-slate-700">নোটের টাইটেল</label>
              <input type="text" value={extTitle} onChange={e => setExtTitle(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bengali" placeholder="যেমন: এইচএসসি রসায়ন ১ম পত্র ফুল রিভিশন" />
            </div>
            
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
               <label className="text-sm font-bold font-bengali text-slate-700">বিষয়</label>
               <input type="text" value={extSubject} onChange={e => setExtSubject(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bengali" placeholder="যেমন: রসায়ন" />
            </div>
            
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
               <label className="text-sm font-bold font-bengali text-slate-700">ক্লাস গ্রুপ</label>
               <select value={extClassGroup} onChange={e => setExtClassGroup(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bengali">
                  <option value="HSC">HSC (একাদশ-দ্বাদশ)</option>
                  <option value="SSC">SSC (নবম-দশম)</option>
                  <option value="Class 6-8">Class 6-8 (৬ষ্ঠ-৮ম)</option>
                  <option value="Admission">Admission (ভর্তি পরীক্ষা)</option>
               </select>
            </div>
            
            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-bold font-bengali text-slate-700">লিংক (URL)</label>
              <input type="url" value={extLink} onChange={e => setExtLink(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-mono text-sm" placeholder="https://drive.google.com/..." />
            </div>
            
            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-bold font-bengali text-slate-700">বর্ণনা (ঐচ্ছিক)</label>
              <textarea value={extDescription} onChange={e => setExtDescription(e.target.value)} className="w-full h-24 p-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bengali" placeholder="নোট সম্পর্কে কিছু বিস্তারিত লিখুন..." />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-bold font-bengali text-slate-700">ট্যাগ বা ব্যাজ (কমা দিয়ে লিখুন)</label>
              <input type="text" value={extBadge} onChange={e => setExtBadge(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-bengali" placeholder="PDF নোট, রিভিশন, শর্টকাট" />
            </div>
          </div>
          
          <button 
            onClick={handleExternalPublish}
            disabled={loading}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold font-bengali rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
          >
             <Save className="w-4.5 h-4.5" /> {loading ? "সেভ হচ্ছে..." : "পাবলিশ করুন"}
          </button>
          
          {successMsg && creatorMode === "external" && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-sm font-bold font-bengali text-center animate-pulse">
              {successMsg}
            </div>
          )}
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Input Section (Aesthetic Dark IDE Code Card) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#0f172a] rounded-[24px] overflow-hidden border border-slate-800 shadow-xl flex flex-col">
            
            {/* Visual IDE Head with macOS-style Control Pins */}
            <div className="flex items-center justify-between bg-[#0b0f19] px-5 py-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2 select-none">
                <span className="w-3 h-3 rounded-full bg-rose-500/90 block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/90 block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/90 block" />
                <span className="font-mono text-[11px] text-slate-400 font-bold ml-2 flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-indigo-400" /> note_template.json
                </span>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.readText().then(text => {
                    setJsonInput(text);
                    validateAndParse(text);
                  }).catch(() => {
                    alert("ক্লিপবোর্ড অ্যাক্সেস পারমিশন প্রয়োজন!");
                  });
                }}
                className="text-[11px] font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 px-3 py-1 rounded-lg transition-all cursor-pointer"
              >
                Paste Code
              </button>
            </div>

            {/* Editor Input Area */}
            <div className="p-4 bg-[#0d111d] relative">
              <textarea
                className="w-full h-[440px] font-mono text-xs p-4 bg-[#090b11] text-emerald-300 rounded-2xl border border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none overflow-y-auto leading-relaxed"
                style={{ tabSize: 2, MozTabSize: 2 } as React.CSSProperties}
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  validateAndParse(e.target.value);
                }}
                placeholder={`{\n  "title": "সোনার তরী — সম্পূর্ণ লেকচার শিট",\n  "subject": "বাংলা",\n  "classGroup": "HSC",\n  "badges": ["মাস্টার নোট", "এইচএসসি ২০২৬"],\n  "description": "...",\n  "content": {\n    "intro": "...",\n    "chapters": []\n  }\n}`}
              />
            </div>

            {/* Error / Success live Validator Bars */}
            <div className="px-5 pb-5 bg-[#0d111d] space-y-4">
              {jsonError ? (
                <div className="bg-red-950/40 border border-red-550/20 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-red-300 font-bengali block">ত্রুটিপূর্ণ কোড সিনট্যাক্স</span>
                    <span className="text-[10px] font-mono text-red-400 leading-tight block select-text">
                      {jsonError}
                    </span>
                  </div>
                </div>
              ) : parsedNote ? (
                <div className="bg-emerald-950/40 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold text-emerald-300 font-bengali block">পাসিং ভ্যালিডেশন!</span>
                    <span className="text-[10px] text-emerald-400 font-bengali leading-snug">
                      কোড ফরম্যাট একদম সঠিক আছে। ডানদিকের প্রিভিউ শিটটি চেক করুন।
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div className="space-y-0.5 select-none">
                    <span className="text-xs font-bold text-slate-300 font-bengali block">অপেক্ষমাণ ইনপুট</span>
                    <span className="text-[10px] text-slate-400 font-bengali">
                      প্রিভিউ বা রান করতে উপরে দেওয়া টেমপ্লেট বাটনে ক্লিক করুন।
                    </span>
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePublish}
                  disabled={loading || !parsedNote}
                  className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-extrabold font-bengali rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 cursor-pointer active:scale-98"
                >
                  <Save className="w-4.5 h-4.5" /> {loading ? "অনলাইন সেভ হচ্ছে..." : "পাবলিশ লেকচার শিট"}
                </button>
                
                <button
                  onClick={() => parsedNote && handlePrint(parsedNote)}
                  disabled={!parsedNote || downloadingPdf}
                  className="h-12 px-5 bg-indigo-600 hover:bg-indigo-700 border border-indigo-500/50 hover:border-indigo-500 disabled:opacity-40 text-white font-bold font-bengali rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-md"
                  title="পিডিএফ বা প্রিন্ট করুন"
                >
                  <Printer className={`w-4.5 h-4.5 ${downloadingPdf ? 'animate-spin' : 'animate-pulse text-amber-300'}`} /> 
                  {downloadingPdf ? "ডাউনলোড..." : "A4 প্রিন্ট"}
                </button>
              </div>
              
              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold font-bengali text-center animate-bounce">
                  {successMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Input Section: Realistic High Contrast Print Preview Sheet */}
        <div className="lg:col-span-7 col-span-1 space-y-4">
          <div className="bg-[#FAF9F5] border border-[#DDDCC1] rounded-[24px] overflow-hidden p-6 sm:p-10 min-h-[500px] shadow-lg relative select-text transition-all duration-300">
            {/* Live indicator watermark */}
            <div className="absolute top-4 right-4 bg-amber-100/80 border border-amber-200/50 text-amber-800 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg select-none">
              • LIVE PREVIEW SHEET
            </div>

            {parsedNote ? (
              <div className="space-y-8">
                
                {/* Note Document Premium Title Header */}
                <div className="space-y-4 border-b-2 border-slate-900 pb-6 text-left">
                  <div className="flex flex-wrap gap-2 items-center">
                    {parsedNote.badges?.map((badge: string, idx: number) => (
                      <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-700 font-bengali text-[11px] px-2.5 py-0.5 rounded-md font-extrabold select-none">
                        {badge}
                      </span>
                    ))}
                    <span className="bg-[#0f2744]/5 text-[#0f2744] border border-[#0f2744]/15 font-bengali text-[11px] px-2.5 py-0.5 rounded-md font-bold select-none">
                      শ্রেণী: {parsedNote.classGroup || "HSC"}
                    </span>
                  </div>
                  
                  <h1 className="font-bengali text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    {parsedNote.title}
                  </h1>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-bengali">
                    <span>বিষয়: <strong className="text-foreground font-bold">{parsedNote.subject}</strong></span>
                    <span className="text-slate-300">|</span>
                    <span>শ্রেণী গ্রুপ: <strong className="text-foreground font-bold">{parsedNote.classGroup}</strong></span>
                  </div>

                  {parsedNote.content?.intro && (
                    <div className="text-slate-750 bg-stone-100 border-l-4 border-amber-500 p-4 rounded-r-xl text-stone-700 text-xs sm:text-sm font-semibold font-bengali leading-relaxed italic">
                      {parsedNote.content.intro}
                    </div>
                  )}
                </div>

                {/* Chapters list layout render */}
                <div className="space-y-8 text-left">
                  {parsedNote.content?.chapters?.map((ch: any, cIdx: number) => (
                    <div key={cIdx} className="space-y-4">
                      {ch.title && (
                        <h2 className="font-bengali text-base sm:text-lg font-bold text-[#0c4a6e] border-b border-dashed border-slate-300 pb-1.5 flex items-center gap-2 select-none">
                          <span className="bg-[#0c4a6e] text-white rounded-md w-5 h-5 flex items-center justify-center text-[11px] font-mono font-bold">
                            {cIdx + 1}
                          </span>
                          {ch.title}
                        </h2>
                      )}

                      <div className="space-y-4">
                        {ch.items?.map((item: any, iIdx: number) => {
                          if (typeof item === "string") {
                            return (
                              <div key={iIdx} className="flex items-start gap-2.5 pl-1">
                                <span className="text-[#0c4a6e] text-lg select-none">•</span>
                                <p className="font-bengali text-[#1e293b] text-sm font-medium leading-relaxed">
                                  {item}
                                </p>
                              </div>
                            );
                          }

                          if (item && typeof item === "object") {
                            // Table block renderer
                            if (item.type === "table") {
                              return (
                                <div key={iIdx} className="overflow-x-auto border border-slate-200 rounded-xl my-4 bg-card shadow-xs">
                                  <table className="w-full border-collapse">
                                    <thead>
                                      <tr className="bg-[#0F2744] text-white border-b border-slate-200">
                                        {item.headers?.map((head: string, hIdx: number) => (
                                          <th key={hIdx} className="text-left font-semibold py-2 px-3.5 text-xs border-r border-[#E1D5B9]/15 font-bengali">
                                            {head}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-150 text-slate-700">
                                      {item.rows?.map((row: any[], rIdx: number) => (
                                        <tr key={rIdx} className="hover:bg-muted odd:bg-stone-50/50 text-xs text-left">
                                          {row?.map((cell: any, dIdx: number) => (
                                            <td key={dIdx} className="py-2.5 px-3.5 border-r border-slate-100 font-bengali font-semibold">
                                              {typeof cell === "object" && cell !== null ? (
                                                <div className="space-y-2">
                                                  {Array.isArray(cell) ? cell.map((c: any, i: number) => (
                                                    <div key={i} className="whitespace-pre-wrap">
                                                      {typeof c === "object" && c !== null ? (
                                                        c.q && c.a ? (
                                                          <div className="bg-card p-2 rounded-lg border border-slate-200">
                                                            <div className="font-bold text-[#0c4a6e]">প্র: {c.q}</div>
                                                            <div className="text-muted-foreground mt-1">উ: {c.a}</div>
                                                          </div>
                                                        ) : JSON.stringify(c)
                                                      ) : c}
                                                    </div>
                                                  )) : JSON.stringify(cell)}
                                                </div>
                                              ) : cell}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            }

                            // Tip box renderer
                            if (item.type === "tip") {
                              return (
                                <div key={iIdx} className="bg-amber-55 bg-amber-50/60 border border-amber-200/80 p-4 rounded-xl space-y-1.5 text-foreground text-xs sm:text-sm shadow-xs border-l-4 border-l-amber-500">
                                  <div className="font-bold font-bengali flex items-center gap-1.5 select-none text-amber-900 text-sm">
                                    ⚡ {item.title || "এক্সক্লুসিভ শিক্ষক টিপস"}
                                  </div>
                                  <div className="font-bengali whitespace-pre-line text-[#1e293b] text-xs leading-relaxed">
                                    {item.content}
                                  </div>
                                </div>
                              );
                            }

                            // Q&A Block renderer
                            if (item.type === "qa") {
                              return (
                                <div key={iIdx} className="bg-emerald-50/40 border border-emerald-100/80 p-4 rounded-xl space-y-1.5 text-xs shadow-xs border-l-4 border-l-emerald-500">
                                  <div className="font-black text-emerald-900 font-bengali text-sm">
                                    {item.q}
                                  </div>
                                  <div className="text-slate-700 font-bengali font-medium leading-relaxed text-xs">
                                    {item.a}
                                  </div>
                                </div>
                              );
                            }

                            // Text block renderer
                            if (item.type === "text") {
                              return (
                                <p key={iIdx} className="font-bengali text-[#1e293b] text-sm font-medium leading-relaxed pl-1 py-1">
                                  {item.content}
                                </p>
                              );
                            }
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Watermark layout */}
                <div className="pt-8 border-t border-slate-200 text-center select-none">
                  <span className="font-bengali text-xs text-slate-400">বিদ্যায়ন ক্লাসরুম প্ল্যাটফর্ম — মেধাবী ভবিষ্যতের পথে</span>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center h-[460px] text-stone-400 select-none">
                <BookOpen className="w-12 h-12 text-amber-500/20 mb-3 animate-pulse" />
                <p className="font-bengali text-sm font-extrabold text-slate-700">লাইভ প্রিভিউ দেখার জন্য বামপাশের কোড এডিটর বক্সে JSON কোড প্রদান করুন।</p>
                <p className="font-bengali text-xs text-slate-400 mt-1.5 max-w-sm">প্রযোজ্য ক্ষেত্রে উপরে থাকা ডেমো টেমপ্লেট বাটনগুলো ব্যবহার করে অটোমেটিক ডাটা জেনারেট করুন।</p>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Published Library Notes Catalog Shelves */}
      <div className="bg-card border border-slate-100 rounded-[28px] overflow-hidden p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="font-bengali font-black text-base text-[#0F2744] flex items-center gap-2 select-none">
            <BookOpenCheck className="w-5 h-5 text-indigo-500" /> পূর্বে সংরক্ষিত লেকচার নোটস ডাটাবেজ ({savedNotes.length})
          </h3>
          <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-bold select-none">
            {savedNotes.length} টি শেইভড
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bengali text-xs flex items-center justify-center gap-2 animate-pulse select-none">
            <div className="w-4.5 h-4.5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" /> ডাটাবেজ লাইব্রেরি থেকে লোড করা হচ্ছে...
          </div>
        ) : savedNotes.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-bengali text-xs select-none">
            এখনো কোনো ডাইনামিক নোট তৈরি করা হয়নি। সম্পূর্ণ নতুন ডাটা পেতে JSON কোড লিখে উপরের পাবলিশ বাটনে ক্লিক করুন।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedNotes.map((note) => {
              // Custom subject Ribbon Colors for Planner Notebooks
              const isAcct = note.subject?.includes("হিসাব");
              const isChem = note.subject?.includes("রসায়ন") || note.subject?.includes("রসায়ন");
              const decorColor = isAcct ? "bg-amber-500" : isChem ? "bg-indigo-500" : "bg-emerald-500";
              const labelBg = isAcct ? "bg-amber-50 text-amber-700 border-amber-100" : isChem ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-emerald-50 text-emerald-700 border-emerald-100";
              
              return (
                <div 
                  key={note.dbId}
                  className="bg-card/70 hover:bg-card border border-slate-150 rounded-2xl p-5 flex flex-col gap-4 justify-between transition-all duration-300 shadow-xs hover:shadow-md hover:border-slate-300 relative group"
                >
                  {/* Decorative Left Ribbon represent planner cover bookmarks */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-2xl ${decorColor}`} />

                  <div className="space-y-2.5 pl-1.5 text-left">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-md font-bold select-none border ${labelBg}`}>
                        {note.classGroup}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold font-bengali uppercase tracking-wide">
                        {note.subject}
                      </span>
                    </div>
                    <h4 className="font-bengali text-sm font-extrabold text-[#0F2744] group-hover:text-indigo-600 transition-colors line-clamp-1 leading-snug">
                      {note.title}
                    </h4>
                    <p className="font-bengali text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {note.description || "কোনো ডেসক্রিপশন বা টীকা যুক্ত করা নেই।"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 border-t border-slate-100 pt-3 pl-1.5">
                    <button
                      onClick={() => handlePrint(note)}
                      disabled={downloadingPdf}
                      className="flex-1 h-9 bg-muted hover:bg-slate-100 text-slate-700 border border-slate-205/80 text-xs font-bold font-bengali rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Printer className={`w-3.5 h-3.5 ${downloadingPdf ? 'animate-spin' : ''}`} /> {downloadingPdf ? "ডাউনলোড..." : "PDF / প্রিন্ট"}
                    </button>
                    
                    <button
                      onClick={() => {
                        setJsonInput(JSON.stringify(note, null, 2));
                        validateAndParse(JSON.stringify(note, null, 2));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="h-9 w-9 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                      title="এডিটর বক্সে লোড করুন"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteDbNote(note.dbId)}
                      className="h-9 w-9 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 hover:text-red-700 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
