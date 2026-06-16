import { db } from "./src/lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";

async function run() {
    const qBase = collection(db, "questions");
    const snap = await getDocs(query(qBase, limit(20)));
    let hasClass = 0;
    snap.docs.forEach(d => {
        if(d.data().class || d.data().classId || d.data().class_name || d.data().className) hasClass++;
        // console.log(Object.keys(d.data()));
    });
    console.log("Docs with class: " + hasClass);
    process.exit(0);
}
run();
