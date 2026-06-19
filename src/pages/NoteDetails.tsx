import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, FileText, Bookmark, BookmarkCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

export default function NoteDetails() {
  const { userData } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const noteId = "sonar-tori";
  const noteTitle = "সোনার তরী — সম্পূর্ণ মাস্টার নোট ও গাইড";

  useEffect(() => {
    if (userData?.uid) {
      checkIfSaved();
    }
  }, [userData]);

  const checkIfSaved = async () => {
    if (!userData?.uid) return;
    try {
      const docRef = doc(db, "users", userData.uid, "saved_notes", noteId);
      const docSnap = await getDoc(docRef);
      setIsSaved(docSnap.exists());
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSave = async () => {
    if (!userData?.uid) return;
    setLoading(true);
    try {
      const docRef = doc(db, "users", userData.uid, "saved_notes", noteId);
      if (isSaved) {
        await deleteDoc(docRef);
        setIsSaved(false);
      } else {
        await setDoc(docRef, {
          noteId,
          title: noteTitle,
          link: `/notes/${noteId}`,
          savedAt: serverTimestamp()
        });
        setIsSaved(true);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save note.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center pb-10 px-0 sm:px-4">
      <div className="bg-card w-full max-w-[794px] min-h-[1123px] shadow-2xl shadow-slate-300/50 border border-slate-200 sm:mt-8 p-8 sm:p-12 font-bengali relative">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="text-slate-500 hover:text-primary pl-0 font-bengali text-sm -translate-x-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            ফিরে যান
          </Button>
        </div>
        <div className="flex justify-between items-start gap-4 mb-2">
          <h1 className="text-3xl font-bengali font-bold text-slate-900 leading-tight">
            {noteTitle}
          </h1>
          <Button 
            variant="outline"
            size="icon"
            onClick={toggleSave}
            disabled={loading}
            className={`shrink-0 rounded-full transition-colors ${isSaved ? 'bg-primary/10 text-primary border-primary/20' : 'text-slate-500'}`}
          >
            {isSaved ? <BookmarkCheck className="w-5 h-5 fill-primary" /> : <Bookmark className="w-5 h-5" />}
          </Button>
        </div>
        <p className="text-primary font-bengali font-semibold mb-8">এইচএসসি পরীক্ষা ২০২৬-এর জন্য ১০০% পরীক্ষামুখী স্পেশাল এডিশন</p>
        
        <div className="prose prose-slate max-w-none font-bengali">
          <style>{`
            .note-content h2 {
                font-size: 1.5rem;
                color: #0f172a;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 8px;
                margin-top: 40px;
                margin-bottom: 20px;
                font-weight: bold;
            }
            .note-content blockquote {
                background: linear-gradient(to right, #f8fafc, #f1f5f9);
                border-left: 4px solid #4f46e5;
                padding: 15px 20px;
                border-radius: 0 12px 12px 0;
                margin: 20px 0;
                font-weight: bold;
            }
            .note-content code {
                background-color: #e0e7ff;
                color: #4f46e5;
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 0.9rem;
                display: inline-block;
                margin: 4px;
            }
            .note-content ul {
                list-style-type: disc;
                margin-left: 20px;
                margin-bottom: 20px;
            }
            .note-content ul li {
                margin-bottom: 8px;
            }
            .note-content p {
               margin-bottom: 16px;
            }
          `}</style>
          
          <div className="note-content">
            <h2>১. এক নজরে কবি ও কাব্য পরিচিতি</h2>
            <ul>
              <li><strong>কবি পরিচিতি:</strong> বিশ্বকবি রবীন্দ্রনাথ ঠাকুর (১৮৬১ - ১৯৪১)। ১৯১৩ খ্রিষ্টাব্দে 'গীতাঞ্জলি' কাব্যের জন্য এশিয়ার প্রথম নোবেলজয়ী সাহিত্যিক।</li>
              <li><strong>উৎস ও নামাকরণ:</strong> ১৮৯৪ খ্রিষ্টাব্দে প্রকাশিত 'সোনার তরী' কাব্যগ্রন্থের নাম-কবিতা বা প্রথম কবিতা।</li>
              <li><strong>রচনাকাল ও প্রেক্ষাপট:</strong> ১২৯৯ বঙ্গাব্দ (১৮৯২ খ্রিষ্টাব্দ)। কবি যখন জমিদারী দেখভালের জন্য পাবনার শিলাইদহে ছিলেন, তখন পদ্মা নদীর বুকে বোটে বসে এটি রচনা করেন।</li>
              <li><strong>ছন্দ বিশ্লেষণ:</strong> শুদ্ধ মাত্রাবৃত্ত ছন্দ। কবিতার মূল পর্ব ৮ মাত্রার এবং অপূর্ণ পর্ব ৬ মাত্রার (৮+৬)। অত্যন্ত গতিময় চাল।</li>
              <li><strong>মূল উপজীব্য:</strong> মহাকাল, মানুষের সৃষ্টিশীল কীর্তি এবং ব্যক্তিমানুষের অবিনশ্বরতার বিপরীতে নশ্বরতা।</li>
            </ul>

            <h2>২. কবিতার মূলভাব ও গভীর জীবনদর্শন</h2>
            <p>'সোনার তরী' একটি নিটোল রূপক কবিতা। আপাতদৃষ্টিতে এর একটি বহিরাঙ্গ রূপ আছে— বর্ষার দিনে একলা কৃষক তার উৎপাদিত ধান নিয়ে নদীর তীরে দাঁড়িয়ে আছে, এক অচেনা মাঝি এসে তার সমস্ত ধান নৌকায় তুলে নিলেও নৌকায় কৃষকের জায়গা হয় না।</p>
            
            <p><strong>অন্তর্নিহিত দর্শন (রূপক অর্থ):</strong></p>
            <ul>
              <li><strong>কৃষক:</strong> সৃষ্টির আকুলতায় মগ্ন স্বয়ং কবি বা সাধারণ মানুষ।</li>
              <li><strong>সোনার ধান:</strong> মানুষের সারাজীবনের শ্রেষ্ঠ কর্ম, মেধা, শ্রম বা শিল্পসৃষ্টি।</li>
              <li><strong>ছোট খেত:</strong> মানুষের সীমাবদ্ধ ও ক্ষণস্থায়ী পার্থিব জীবন বা আয়ু।</li>
              <li><strong>সোনার তরী ও মাঝি:</strong> নির্লিপ্ত, নিষ্ঠুর ও শাশ্বত মহাকাল বা সময়।</li>
            </ul>

            <blockquote>
              মূল কথা: মহাকাল মানুষের সৃষ্টিকে সাদরে গ্রহণ করে অমরত্ব দেয়, কিন্তু রক্ত-মাংসের ক্ষণভঙ্গুর মানুষকে পরম অবহেলায় পেছনে ফেলে যায়। সৃষ্টি অমর, কিন্তু সৃষ্টিকর্তা মরণশীল।
            </blockquote>

            <h2>৩. শব্দার্থ ও টীকা</h2>
            <ul>
              <li><strong>ক্ষুরধারা:</strong> ক্ষুরের মতো ধারালো স্রোত। এখানে বর্ষার নদীর তীব্র ও প্রলয়ংকরী গতিকে বোঝানো হয়েছে।</li>
              <li><strong>খরপরশা:</strong> বর্শার মতো তীক্ষ্ণ। কালস্রোতের নিষ্ঠুর রূপের প্রতীক।</li>
              <li><strong>তরী:</strong> নৌকা। কবিতায় এটি মহাকালের প্রতীক রূপ হিসেবে ব্যবহৃত হয়েছে।</li>
            </ul>

            <h2>৪. পঙক্তিভিত্তিক বিস্তারিত বিশ্লেষণ</h2>
            
            <p className="font-bold text-lg text-primary mt-6">❝ গগন গরজে মেঘ, ঘন বরষা। / একখানি ছোট খেত, আমি একেলা— ❞</p>
            <p><strong>বিশ্লেষণ:</strong> কবিতার শুরুতেই এক থমথমে এবং বিষাদময় পরিবেশের অবতারণা করা হয়েছে। আকাশে মেঘের গর্জন এবং ঘন বর্ষা মানুষের জীবনের শেষ মুহূর্ত বা সংকটের প্রতীক। 'ছোট খেত' দিয়ে বোঝানো হয়েছে মানুষের আয়ু অত্যন্ত সীমিত, এবং এই মহাবিশ্বে মানুষ মূলত একা ও নিঃসঙ্গ。</p>

            <p className="font-bold text-lg text-primary mt-6">❝ চারি দিকে বাঁকা জল করিছে খেলা। / পরপার-পারে দেখি আঁকা তরুছায়ামসীমাখা ❞</p>
            <p><strong>বিশ্লেষণ:</strong> 'বাঁকা জল' হলো চারপাশ থেকে ধেয়ে আসা অনিশ্চয়তা ও মৃত্যুভয়। নদীর ওপার বা পরপার দেখা যাচ্ছে কিন্তু তা অস্পষ্ট, মেঘে ঢাকা ও মসীমাখা (কালচে)। এটি মৃত্যুর ওপারের এক অজানা, রহস্যময় জগতের দিকে ইঙ্গিত করে。</p>

            <p className="font-bold text-lg text-primary mt-6">❝ ঠাঁই নাই, ঠাঁই নাই—ছোট সে তরী / আমারি সোনার ধানে গিয়েছে ভরি। ❞</p>
            <p><strong>বিশ্লেষণ:</strong> এটি কবিতার সবচেয়ে গুরুত্বপূর্ণ মোড়। মহাকালের নৌকায় মানুষের সৃষ্টির স্থান সংকুলান হলেও, নশ্বর মানুষের নিজের কোনো স্থান হয় না। সৃষ্টি অমর, কিন্তু সৃষ্টিকর্তা মরণশীল।</p>

            <h2>৫. সৃজনশীল অনুধাবনমূলক প্রশ্ন ও উত্তর (CQ Booster)</h2>
            <div className="bg-muted p-6 rounded-2xl mb-6">
              <h3 className="font-bold text-lg mb-2">Q1. "ঠাঁই নাই, ঠাঁই নাই— ছোট সে তরী" বলতে কবি কী বুঝিয়েছেন?</h3>
              <p><strong>উত্তর:</strong> 'সোনার তরী' কবিতায় আলোচ্য পঙক্তিটি দিয়ে কবি মহাকালের বুকে নশ্বর মানুষের স্থান না হওয়ার রূঢ় বাস্তবতাকে বুঝিয়েছেন। মহাকালের তরী বা এই পৃথিবী অত্যন্ত সীমাবদ্ধ। এখানে মানুষের মহৎ কর্ম বা সৃষ্টির স্থান হলেও, রক্ত-মাংসের ক্ষণস্থায়ী মানুষের নিজের কোনো চিরস্থায়ী স্থান বা আশ্রয় নেই। সময় মানুষের অমর সৃষ্টি বা শিল্পকে সাদরে গ্রহণ করে সংরক্ষণ করে, কিন্তু ব্যক্তি মানুষকে পরম অবহেলায় মৃত্যুর মুখে ফেলে রেখে যায়।</p>
            </div>
            <div className="bg-muted p-6 rounded-2xl mb-6">
              <h3 className="font-bold text-lg mb-2">Q2. "দেখে যেন মনে হয় চিনি উহারে"— কৃষকের এমন উপলব্ধির কারণ কী?</h3>
              <p><strong>উত্তর:</strong> কৃষকের এমন উপলব্ধির কারণ হলো— তরীর মাঝি কোনো সাধারণ মানুষ নয়, সে হলো চিরন্তন মহাকাল বা সময়ের প্রতীক। মানুষ সচেতন বা অবচেতনভাবে মনে মনে জানে যে সময় বা মহাকাল এক পরম ও চিরচেনা সত্য। জীবনের সমস্ত কর্মের অবসান এবং চূড়ান্ত হিসাব এই সময়ের হাতেই নির্ধারিত হয়। সময়ের এই চিরন্তন ও অমোঘ রূপটির কারণেই তরী বেয়ে আসা অচেনা মাঝিকে দেখেও কৃষকের মনে হয়েছে সে তাকে চেনে।</p>
            </div>

            <h2>৬. উচ্চ নম্বর পাওয়ার জন্য 'স্মার্ট কীবোর্ড' শব্দাবলী</h2>
            <p>সৃজনশীল প্রশ্নের উচ্চতর দক্ষতায় (ঘ-প্রশ্ন) এই শব্দগুলো ব্যবহার করলে খাতার মান বহুগুণ বৃদ্ধি পাবে:</p>
            <div className="flex flex-wrap gap-2 mt-4">
               <code>কালস্রোতের নিষ্ঠুরতা</code> <code>ব্যক্তিসত্তার নশ্বরতা</code> <code>শিল্পের শাশ্বত রূপ</code> <code>ক্ষণভঙ্গুর মানবজীবন</code> <code>মহাজাগতিক শূন্যতা</code> <code>সৃষ্টির অবিনশ্বরতা</code> <code>নির্লিপ্ত মহাকাল</code>
            </div>

            <h2>৭. সেলফ-অ্যাসেসমেন্ট কুইজ: বহুনির্বাচনী প্রশ্ন (MCQ)</h2>
            <div className="space-y-4">
              <div className="border border-slate-200 p-4 rounded-xl">
                 <p className="font-bold mb-2">1. 'সোনার তরী' কবিতাটি কোন ছন্দে রচিত?</p>
                 <ul className="list-none ml-0 pl-0 space-y-2">
                   <li>ক) অক্ষরবৃত্ত</li>
                   <li className="text-primary font-bold">খ) মাত্রাবৃত্ত <span className="text-green-600">(সঠিক উত্তর)</span></li>
                   <li>গ) স্বরবৃত্ত</li>
                   <li>ঘ) গদ্যছন্দ</li>
                 </ul>
              </div>
              <div className="border border-slate-200 p-4 rounded-xl">
                 <p className="font-bold mb-2">2. 'সোনার তরী' কবিতায় 'সোনার ধান' কিসের প্রতীক?</p>
                 <ul className="list-none ml-0 pl-0 space-y-2">
                   <li>ক) কৃষকের খাদ্য</li>
                   <li>খ) ধন-সম্পদ</li>
                   <li className="text-primary font-bold">গ) মানুষের জীবনভরের কীর্তি বা সৃষ্টি <span className="text-green-600">(সঠিক উত্তর)</span></li>
                   <li>ঘ) স্বর্ণমুদ্রা</li>
                 </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
