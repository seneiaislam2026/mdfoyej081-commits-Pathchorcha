import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NoteHonesty() {
  return (
    <div className="max-w-4xl mx-auto pb-10 px-4">
      <div className="mb-6">
        <Link to="/notes" className="inline-flex items-center text-primary font-medium hover:underline text-sm bg-primary/10 px-4 py-2 rounded-full font-bengali">
          <ArrowLeft className="w-4 h-4 mr-2" />
          নোটস-এ ফিরে যান
        </Link>
      </div>

      <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 font-bengali">
        <style>{`
          /* Custom CSS based on user's HTML */
          .honesty-note {
            color: #2d3748;
            line-height: 1.7;
          }
          .honesty-note .chapter-title-section {
            border-bottom: 3px solid #1b5e20;
            padding-bottom: 15px;
            margin-bottom: 30px;
          }
          .honesty-note h1 {
            color: #1b5e20;
            font-size: 28px;
            font-weight: bold;
            margin: 0 0 10px 0;
          }
          .honesty-note .meta-tags {
            font-size: 14px;
            color: #718096;
            margin-bottom: 15px;
          }
          .honesty-note .meta-tags span {
            background: #e2e8f0;
            padding: 4px 10px;
            border-radius: 4px;
            margin-right: 8px;
            display: inline-block;
          }
          .honesty-note h2 {
            font-size: 20px;
            font-weight: bold;
            color: #1b5e20;
            margin-top: 35px;
            margin-bottom: 15px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
          }
          .honesty-note p {
            margin-bottom: 15px;
            text-align: justify;
          }
          .honesty-note .callout-box {
            background-color: #f1f8e9;
            border-left: 5px solid #4caf50;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
          }
          .honesty-note .callout-box.alert {
            background-color: #fff5f5;
            border-left-color: #e53e3e;
            color: #9b2c2c;
          }
          .honesty-note .table-responsive {
            overflow-x: auto;
            margin: 25px 0;
          }
          .honesty-note table.master-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 600px;
          }
          .honesty-note table.master-table th, .honesty-note table.master-table td {
            border: 1px solid #cbd5e0;
            padding: 12px;
            font-size: 14px;
            vertical-align: top;
          }
          .honesty-note table.master-table th {
            background-color: #1b5e20;
            color: #ffffff;
            font-weight: bold;
            text-align: center;
          }
          .honesty-note table.master-table tr:nth-child(even) {
            background-color: #f7fafc;
          }
          .honesty-note .qna-card {
            background-color: #fffdf5;
            border: 1px solid #feebc8;
            padding: 18px;
            margin-bottom: 20px;
            border-radius: 6px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.01);
          }
          .honesty-note .question {
            font-weight: bold;
            color: #b7791f;
            font-size: 15px;
            margin-bottom: 8px;
          }
          .honesty-note ul {
            padding-left: 20px;
            margin-bottom: 20px;
          }
          .honesty-note li {
            margin-bottom: 8px;
          }
          .honesty-note .json-block {
            background-color: #2d3748;
            color: #fff;
            padding: 15px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 13px;
            overflow-x: auto;
            white-space: pre;
          }
        `}</style>
        
        <div className="honesty-note">
          <div className="chapter-title-section">
            <h1>সততার পুরস্কার</h1>
            <div className="meta-tags">
              <span><strong>লেখক:</strong> ড. মুহম্মদ শহীদুল্লাহ্</span>
              <span><strong>উৎস:</strong> হাদিসের কাহিনী</span>
              <span><strong>শ্রেণি:</strong> ৬ষ্ঠ - ৮ম</span>
            </div>
            <p><strong>মূলভাব:</strong> সততা ও কৃতজ্ঞতার জয়, অকৃতজ্ঞতা ও অহংকারের অবধারিত পতন।</p>
          </div>

          <h2>📖 ১. লেখক পরিচিতি ও প্রেক্ষাপট</h2>
          <p>ড. মুহম্মদ শহীদুল্লাহ্ (১৮৮৫-১৯৬৯) ছিলেন একাধারে অসাধারণ ভাষাবিদ, পণ্ডিত ও গবেষক। ১৯১২ সালে কলকাতা বিশ্ববিদ্যালয় থেকে তুলনামূলক ভাষাতত্ত্বে এমএ ডিগ্রি লাভ করার পর, তিনি প্যারিসের সোরবন বিশ্ববিদ্যালয় থেকে পিএইচডি ডিগ্রি অর্জন করেন। বাংলা ভাষার আঞ্চলিক অভিধান সম্পাদনা তাঁর অন্যতম প্রধান অমর কীর্তি।</p>
          <p>‘সততার পুরস্কার’ গল্পটি মূলত পবিত্র হাদিস শরিফে বর্ণিত একটি শিক্ষণীয় ঘটনার ওপর ভিত্তি করে রচিত। বনি ইসরাইল বংশের ৩ জন ব্যক্তির মনস্তত্ত্ব ও নৈতিকতা পরীক্ষার মাধ্যমে গল্পকার কোমলমতি শিক্ষার্থীদের মাঝে সততা ও কৃতজ্ঞতাবোধ জাগিয়ে তুলতে চেয়েছেন।</p>

          <h2>👥 ২. চরিত্র বিশ্লেষণ ও তুলনামূলক ম্যাট্রিক্স</h2>
          <p>গল্পের পুরো কাহিনী ৩ জন ব্যক্তি এবং আল্লাহর প্রেরিত ১ জন ফেরেশতাকে কেন্দ্র করে আবর্তিত হয়েছে। নিচে তাঁদের চারিত্রিক বৈশিষ্ট্য ও শেষ পরিণতির চার্ট দেওয়া হলো:</p>
          
          <div className="table-responsive">
            <table className="master-table">
              <thead>
                <tr>
                  <th>চরিত্রের নাম</th>
                  <th>সমস্যা ও উপহার</th>
                  <th>পরীক্ষার মুহূর্ত ও মানসিকতা</th>
                  <th>চূড়ান্ত পরিণতি</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>১. ধবল রোগী</strong></td>
                  <td>কুষ্ঠ রোগ ছিল। ফেরেশতার স্পর্শে গা ভালো হয় এবং একটি <strong>গাভীন উট</strong> উপহার পায়।</td>
                  <td>মাঠভর্তি উটের মালিক হয়েও ছদ্মবেশী ফেরেশতাকে সাহায্য করতে অস্বীকার করে এবং নিজের অতীত গোপন করে।</td>
                  <td>আল্লাহর অভিশাপে সে তার সমস্ত সম্পদ হারিয়ে পুনরায় আগের মতো দরিদ্র ও কুৎসিত ধবল রোগী হয়ে যায়।</td>
                </tr>
                <tr>
                  <td><strong>২. টাকওয়ালা</strong></td>
                  <td>মাথায় চুল ছিল না। সুন্দর চুল গজানোর পর একটি <strong>গাভীন গাভী (গরু)</strong> উপহার পায়।</td>
                  <td>বিশাল গরুর পালের মালিক হয়ে প্রথম জনের মতোই কৃপণতা দেখায় এবং বাপদাদার ধন বলে মিথ্যা দাবি করে।</td>
                  <td>আল্লাহর নেয়ামত হারিয়ে সেও পুনরায় আগের মতো নিঃস্ব ও টাকওয়ালা হয়ে কঠিন শাস্তি ভোগ করে।</td>
                </tr>
                <tr>
                  <td><strong>৩. অন্ধ ব্যক্তি</strong></td>
                  <td>চোখে দেখতে পেত না। দৃষ্টিশক্তি ফিরে পাওয়ার পর একটি <strong>গাভীন ছাগল</strong> উপহার পায়।</td>
                  <td>অকপটে অতীত স্বীকার করে এবং বলে— "আল্লাহর ওয়াস্তে আপনার যা ইচ্ছা নিয়ে যান, আমি বিন্দুমাত্র বাধা দেব না।"</td>
                  <td>আল্লাহ তার সততায় সন্তুষ্ট হন। তার সমস্ত ধন-সম্পদ অক্ষুণ্ন থাকে এবং সে চির সুখে জীবন কাটায়।</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>💡 ৩. গুরুত্বপূর্ণ অনুধাবনমূলক প্রশ্নোত্তর</h2>
          
          <div className="qna-card">
            <div className="question">প্রশ্ন ১: ফেরেশতা মানুষের রূপ ধরে কেন পৃথিবীতে এসেছিলেন?</div>
            <div className="answer"><strong>উত্তর:</strong> আল্লাহ তাআলা বনি ইসরাইল বংশের তিনজন ব্যক্তির সততা ও কৃতজ্ঞতাবোধের পরীক্ষা নেওয়ার জন্য ফেরেশতাকে মানুষের রূপ ধারণ করিয়ে পৃথিবীতে পাঠিয়েছিলেন, যাতে ওই ব্যক্তিদের অন্তরের আসল মানসিকতা উন্মোচিত হয়।</div>
          </div>

          <div className="qna-card">
            <div className="question">প্রশ্ন ২: "এ তো আমার প্রথম হইতেই ছিল" — উক্তিটি দ্বারা কী বোঝানো হয়েছে?</div>
            <div className="answer"><strong>উত্তর:</strong> উক্তিটি ধবল ও টাকওয়ালা ব্যক্তির। ধন-সম্পদ পাওয়ার পর তারা অহংকারী হয়ে ওঠে। ছদ্মবেশী ফেরেশতা যখন সাহায্য চাইলেন, তখন তারা নিজেদের অতীত রোগ ও দারিদ্র্যের কথা সম্পূর্ণ অস্বীকার করে এই মিথ্যা দাবিটি করেছিল।</div>
          </div>

          <div className="qna-card">
            <div className="question">প্রশ্ন ৩: আল্লাহ অন্ধ ব্যক্তির ওপর খুশি হয়েছিলেন কেন?</div>
            <div className="answer"><strong>উত্তর:</strong> অন্ধ ব্যক্তিটি ধনী হওয়ার পরও তার অতীত ভোলেনি। সে অকপটে স্বীকার করেছে যে আল্লাহই তাকে সব দিয়েছেন এবং আল্লাহর সন্তুষ্টির জন্য সে তার সমস্ত ছাগল বিলিয়ে দিতেও রাজি ছিল। তার এই সততা ও কৃতজ্ঞতার কারণেই আল্লাহ খুশি হয়েছিলেন।</div>
          </div>

          <h2>🎯 ৪. সৃজনশীল প্রশ্ন সমাধানের ট্রিকস</h2>
          <ul>
            <li><strong>প্যাটার্ন ১ (অকৃতজ্ঞ চরিত্র):</strong> উদ্দীপকের কোনো চরিত্র গরিব থেকে ধনী হয়ে সাহায্যকারীকে ভুলে গেলে বা অহংকার করলে → গল্পের <strong>ধবল বা টাকওয়ালার</strong> সাথে তুলনা করবে।</li>
            <li><strong>প্যাটার্ন ২ (কৃতজ্ঞ চরিত্র):</strong> উদ্দীপকের কোনো চরিত্র সফল হয়েও অতীত না ভুললে এবং দানশীল হলে → গল্পের <strong>অন্ধ ব্যক্তির</strong> সাথে সাদৃশ্য দেখাবে।</li>
          </ul>

          <div className="callout-box alert">
            <strong>⚠️ সাধারণ ভুল (পরীক্ষার বিশেষ টিপস):</strong> মনে রাখার সহজ টেকনিক: <strong>ধবল → উট, টাক → গরু, অন্ধ → ছাগল</strong>। পরীক্ষার খাতায় এই সিকোয়েন্সটি যেন কোনোভাবেই ভুল না হয়।
          </div>
        </div>
      </div>
    </div>
  );
}
