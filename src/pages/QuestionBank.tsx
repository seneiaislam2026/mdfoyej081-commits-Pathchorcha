import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, BookOpen, ArrowLeft, PenTool, LayoutList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const filters = {
  classes: ["Class 6-8", "Class 9", "SSC", "HSC", "Admission"],
  subclasses: {
    "Class 6-8": ["Class 6", "Class 7", "Class 8"],
    "Admission": ["ঢাকা বিশ্ববিদ্যালয়", "রাজশাহী বিশ্ববিদ্যালয়", "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়", "গুচ্ছ (GST)", "মেডিকেল", "প্রকৌশল"]
  },
  subjects: ["বাংলা", "English", "Math", "Physics", "Chemistry", "Biology"],
  difficulties: ["সহজ", "মাঝারি", "কঠিন"],
};

export default function QuestionBank() {
  const [activeClassGroup, setActiveClassGroup] = useState("HSC");
  const [activeClass, setActiveClass] = useState("HSC");
  const [questionFormat, setQuestionFormat] = useState<"MCQ" | "CQ" | null>(null);

  useEffect(() => {
    if (questionFormat === "CQ" && activeClassGroup === "Admission") {
      setActiveClassGroup("HSC");
      setActiveClass("HSC");
    }
  }, [questionFormat, activeClassGroup]);

  if (!questionFormat) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bengali font-bold text-slate-800 mb-4">কী ধরনের প্রশ্ন অনুশীলন করতে চাও?</h2>
          <p className="text-slate-500 font-bengali text-lg max-w-xl mx-auto">
            তোমার প্রস্তুতির ধরনের উপর ভিত্তি করে ক্যাটাগরি নির্বাচন করো। এখানে তুমি বহুনির্বাচনি (MCQ) এবং সৃজনশীল (CQ) दोन्ही ধরনের প্রশ্ন পাবে।
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.02, translateY: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setQuestionFormat("MCQ")}
            className="cursor-pointer bg-white border-2 border-slate-100 hover:border-primary/50 shadow-sm hover:shadow-md p-8 rounded-[32px] text-center transition-all group"
          >
            <div className="bg-primary/10 w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
              <LayoutList className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bengali font-bold text-slate-800 mb-2">MCQ প্রশ্ন</h3>
            <p className="text-slate-500 font-bengali">বহুনির্বাচনি প্রশ্ন এবং মডেল টেস্ট</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, translateY: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setQuestionFormat("CQ")}
            className="cursor-pointer bg-white border-2 border-slate-100 hover:border-secondary/50 shadow-sm hover:shadow-md p-8 rounded-[32px] text-center transition-all group"
          >
            <div className="bg-secondary/10 w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/20 transition-colors">
              <PenTool className="w-10 h-10 text-secondary" />
            </div>
            <h3 className="text-2xl font-bengali font-bold text-slate-800 mb-2">CQ প্রশ্ন</h3>
            <p className="text-slate-500 font-bengali">সৃজনশীল বা লিখিত প্রশ্নমালা</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-6 bg-white p-6 rounded-[32px] border border-muted shadow-sm">
        <div>
          <h3 className="font-bengali font-bold mb-3 text-lg">অনুসন্ধান</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="প্রশ্ন খুঁজুন..." className="pl-9" />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-bengali font-bold mb-3 text-lg flex items-center">
            <Filter className="w-4 h-4 mr-2" /> শ্রেণী (Class)
          </h3>
          <div className="flex flex-wrap gap-2">
            {filters.classes.map((c) => {
              if (questionFormat === "CQ" && c === "Admission") return null;
              return (
              <Badge 
                key={c} 
                variant={activeClassGroup === c ? "default" : "secondary"}
                className={`cursor-pointer ${activeClassGroup === c ? "bg-primary text-white" : "hover:bg-primary/20 text-slate-700"}`}
                onClick={() => {
                  setActiveClassGroup(c);
                  if (c === "Class 6-8") {
                    setActiveClass("Class 6");
                  } else if (c === "Admission") {
                    setActiveClass("ঢাকা বিশ্ববিদ্যালয়");
                  } else {
                    setActiveClass(c);
                  }
                }}
              >
                {c}
              </Badge>
            )})}
          </div>

          {(activeClassGroup === "Class 6-8" || activeClassGroup === "Admission") && (
            <motion.div 
               initial={{ opacity: 0, height: 0 }} 
               animate={{ opacity: 1, height: 'auto' }} 
               className="mt-3 flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl"
            >
              {filters.subclasses[activeClassGroup as keyof typeof filters.subclasses]?.map((subc) => (
                <Badge
                  key={subc}
                  variant={activeClass === subc ? "default" : "outline"}
                  className={`cursor-pointer ${activeClass === subc ? "bg-primary border-primary text-white" : "hover:bg-primary/10 border-slate-200 text-slate-600 bg-white"}`}
                  onClick={() => setActiveClass(subc)}
                >
                  {subc}
                </Badge>
              ))}
            </motion.div>
          )}
        </div>

        <Separator />

        <div>
          <h3 className="font-bengali font-bold mb-3 text-lg">বিষয় (Subject)</h3>
          <ul className="space-y-2">
            {filters.subjects.map((s) => (
              <li key={s}>
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="font-bengali group-hover:text-primary transition-colors">{s}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setQuestionFormat(null)} className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bengali font-bold text-primary flex items-center">
              <BookOpen className="w-6 h-6 mr-3 text-secondary" /> 
              {activeClass} - {questionFormat} প্রশ্ন ব্যাংক
            </h2>
          </div>
          <span className="text-sm text-muted-foreground font-bengali bg-slate-100 px-4 py-2 rounded-full font-medium">১,২৪০ টি প্রশ্ন পাওয়া গেছে</span>
        </div>

        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="group hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-primary rounded-[24px] border border-muted shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200">{questionFormat}</Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">বাংলা ১ম পত্র</Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">কবিতা</Badge>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-50 border-orange-200">মাঝারি</Badge>
                    </div>
                    <p className="font-bengali text-lg text-foreground font-medium line-clamp-2">
                      {questionFormat === "MCQ" 
                        ? "'সোনার তরী' কবিতাটি কোন কাব্যগ্রন্থে সংকলিত?"
                        : "উদ্দীপকটি পড়ে নিচের প্রশ্নগুলোর উত্তর দাও: 'সোনার তরী' কবিতায় কবির যে অন্তর্নিহিত ভাবের প্রকাশ পেয়েছে..."}
                    </p>
                  </div>
                  <Link to="/exam">
                    <Button variant="secondary" size="sm" className="font-bengali shrink-0 text-secondary-foreground bg-secondary hover:bg-secondary/90">
                      অনুশীলন করুন
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center pt-4">
          <Button variant="outline" className="font-bengali">আরও লোড করুন</Button>
        </div>
      </main>
    </div>
  );
}
