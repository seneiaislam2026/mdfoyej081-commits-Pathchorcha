import { db } from "./src/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

async function run() {
    const qBase = collection(db, "questions");
    const snap = await getDocs(qBase);
    let counts = {array: 0, object: 0, string: 0, undefined: 0, other: 0};
    
    snap.docs.forEach(d => {
        const ops = d.data().options;
        if(ops === undefined) counts.undefined++;
        else if(Array.isArray(ops)) counts.array++;
        else if(typeof ops === 'string') counts.string++;
        else if(typeof ops === 'object') counts.object++;
        else counts.other++;
    });

    console.log(counts);
    process.exit(0);
}
run();
