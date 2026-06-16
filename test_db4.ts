import { db } from "./src/lib/firebase";
import { collection, getDocs, limit, query, where } from "firebase/firestore";

async function run() {
    const qBase = collection(db, "questions");
    let qs = await getDocs(query(qBase, where("subject", "==", "ব্যবসায় উদ্যোগ"), limit(10)));
    qs.docs.forEach(d => {
       console.log("chapter:", d.data().chapter, "chapterName:", d.data().chapterName, "topic:", d.data().topic);
    });
    process.exit(0);
}
run();
