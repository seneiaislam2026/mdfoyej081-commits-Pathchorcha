import { db } from "./src/lib/firebase";
import { collection, getDocs, limit } from "firebase/firestore";

async function checkCol(colName: string) {
   try {
       const snap = await getDocs(collection(db, colName));
       console.log(colName, ":", snap.docs.length, "docs");
       if(snap.docs.length > 0) console.log(colName, "sample keys:", Object.keys(snap.docs[0].data()));
   } catch (e: any) {
       console.log(colName, ":", e.message.substring(0, 50));
   }
}

async function run() {
    await checkCol("mcq");
    await checkCol("mcqs");
    await checkCol("cq");
    await checkCol("cqs");
    await checkCol("questions");
    await checkCol("Bank");
    await checkCol("questionBank");
    await checkCol("exam_questions");
    process.exit(0);
}
run();
