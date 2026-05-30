import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../lib/AuthContext";

const filters = {
  subjects: ["বাংলা", "English", "Math", "Physics", "Chemistry", "Biology"],
};

export default function Notes() {
  const { userData } = useAuth();
  const userClass = userData?.class || "দ্বাদশ শ্রেণী";

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-6 bg-white p-6 rounded-[32px] border border-muted shadow-sm">
        <div>
          <h3 className="font-bengali font-bold mb-3 text-lg">অনুসন্ধান</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="নোট খুঁজুন..." className="pl-9" />
          </div>
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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bengali font-bold text-primary flex items-center">
            <BookOpen className="w-6 h-6 mr-3 text-secondary" /> 
            {userClass} - লেকচার নোটস
          </h2>
          <span className="text-sm text-muted-foreground font-bengali">
            {userClass === "একাদশ শ্রেণী" || userClass === "দ্বাদশ শ্রেণী" ? "১" : userClass === "৬ষ্ঠ শ্রেণী" ? "১" : "০"} টি নোট পাওয়া গেছে
          </span>
        </div>

        <div className="grid gap-4">
          {(userClass === "একাদশ শ্রেণী" || userClass === "দ্বাদশ শ্রেণী") && (
            <Card className="group hover:shadow-md transition-all border-l-4 border-l-primary rounded-[24px] border-muted shadow-sm bg-primary/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline" className="bg-primary text-white hover:bg-primary border-primary">মাস্টার নোট</Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">বাংলা ১ম পত্র</Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">এইচএসসি ২০২৬</Badge>
                    </div>
                    <p className="font-bengali text-lg text-foreground font-bold line-clamp-2">
                      সোনার তরী — সম্পূর্ণ মাস্টার নোট ও গাইড
                    </p>
                  </div>
                  <Link to="/notes/sonar-tori">
                    <Button variant="default" size="sm" className="font-bengali shrink-0">
                      নোট পড়ুন
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {userClass === "৬ষ্ঠ শ্রেণী" && (
            <Card className="group hover:shadow-md transition-all border-l-4 border-l-primary rounded-[24px] border-muted shadow-sm bg-primary/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline" className="bg-primary text-white hover:bg-primary border-primary">মাস্টার নোট</Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">বাংলা ১ম পত্র</Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">৬ষ্ঠ শ্রেণী</Badge>
                    </div>
                    <p className="font-bengali text-lg text-foreground font-bold line-clamp-2">
                      সততার পুরস্কার — স্মার্ট নোট ও ডেটা শিট
                    </p>
                  </div>
                  <Link to="/notes/sototar-puroshkar">
                    <Button variant="default" size="sm" className="font-bengali shrink-0">
                      নোট পড়ুন
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
