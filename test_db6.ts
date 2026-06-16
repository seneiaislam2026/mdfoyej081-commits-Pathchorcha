import { db } from "./src/lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";

async function run() {
    try {
      const snap = await getDocs(collection(db, "chapters"));
      console.log("Chapters count:", snap.docs.length);
    } catch(e) { console.log(e); }
    process.exit(0);
}
run();
