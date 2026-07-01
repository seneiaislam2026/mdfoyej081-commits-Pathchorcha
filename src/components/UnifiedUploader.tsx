import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, FileQuestion, Sparkles } from 'lucide-react';
import NotesCreator from './NotesCreator';
import BoardQuestionsCreator from './BoardQuestionsCreator';
import DirectQuestionsCreator from './DirectQuestionsCreator';

export default function UnifiedUploader() {
  const [uploadType, setUploadType] = useState<"note" | "board_question" | "direct_question">("note");

  return (
    <div className="space-y-6 mt-4">
      <Card className="border border-indigo-100 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-indigo-50/50 border-b border-indigo-50 pb-4 p-6">
          <CardTitle className="font-bengali text-indigo-900">ইউনিফাইড আপলোডার</CardTitle>
          <CardDescription className="font-bengali text-indigo-600/80">নোট বা বোর্ড প্রশ্ন বা সাধারণ প্রশ্ন সব এক জায়গা থেকে পাবলিশ করুন</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <Button 
              variant={uploadType === "note" ? "default" : "outline"} 
              onClick={() => setUploadType("note")}
              className="flex items-center gap-2 font-bengali"
            >
              <FileText className="w-4 h-4" /> নোট পাবলিশ করুন
            </Button>
            <Button 
              variant={uploadType === "board_question" ? "default" : "outline"} 
              onClick={() => setUploadType("board_question")}
              className="flex items-center gap-2 font-bengali"
            >
              <FileQuestion className="w-4 h-4" /> বোর্ড প্রশ্ন যোগ করুন
            </Button>
            <Button 
              variant={uploadType === "direct_question" ? "default" : "outline"} 
              onClick={() => setUploadType("direct_question")}
              className="flex items-center gap-2 font-bengali bg-purple-50/50 border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Sparkles className="w-4 h-4 text-purple-600" /> সরাসরি প্রশ্ন আপলোড করুন
            </Button>
          </div>

          {uploadType === "note" ? (
            <NotesCreator />
          ) : uploadType === "board_question" ? (
            <BoardQuestionsCreator />
          ) : (
            <DirectQuestionsCreator />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
