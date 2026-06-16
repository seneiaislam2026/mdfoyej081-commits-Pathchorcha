import { db } from "./src/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

async function run() {
    const qBase = collection(db, "questions");
    const snap = await getDocs(qBase);
    
    let subjectCounts: any = {};
    let titleCounts: any = {};
    
    snap.docs.forEach(d => {
        const data = d.data();
        if(data.subject) {
            subjectCounts[data.subject] = (subjectCounts[data.subject] || 0) + 1;
        } else {
            subjectCounts["NO_SUBJECT"] = (subjectCounts["NO_SUBJECT"] || 0) + 1;
        }
        
        if(data.title) {
            titleCounts[data.title] = (titleCounts[data.title] || 0) + 1;
        } else {
            titleCounts["NO_TITLE"] = (titleCounts["NO_TITLE"] || 0) + 1;
        }
    });

    console.log("Subjects:");
    for(let k in subjectCounts) console.log(k, ":", subjectCounts[k]);
    
    console.log("Titles:");
    for(let k in titleCounts) console.log(k, ":", titleCounts[k]);
    
    process.exit(0);
}
run();
