import { db } from "./src/lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";

async function run() {
    const qBase = collection(db, "questions");
    const snap = await getDocs(query(qBase, limit(5)));
    snap.docs.forEach(d => {
        console.log(d.id, d.data());
    });
    process.exit(0);
}
run();
