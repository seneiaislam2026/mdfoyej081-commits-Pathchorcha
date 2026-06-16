import { db } from "./src/lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";

async function run() {
    const topicBase = collection(db, "topics");
    const snap = await getDocs(topicBase);
    console.log("Topics count:", snap.docs.length);
    snap.docs.slice(0, 5).forEach(d => console.log(d.id, d.data()));
    process.exit(0);
}
run();
