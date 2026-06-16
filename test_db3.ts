import { db } from "./src/lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";

async function run() {
    const qBase = collection(db, "questions");
    const snap = await getDocs(query(qBase));
    let hasBadOptions = 0;
    snap.docs.forEach(d => {
        const ops = d.data().options;
        if (!ops) {
            hasBadOptions++;
            return;
        }
        try {
           (Array.isArray(ops) ? ops : Object.keys(ops || {}).map(k => ({ id: k, text: ops[k], label: ops[k] }))).map((option: any, optIdx: number) => {
               if(!option) throw new Error("bad");
               // simulate how it accesses it
               const id = option.id;
               const label = option.label;
           });
        } catch(e) {
           hasBadOptions++;
        }
    });
    console.log("bad count", hasBadOptions);
    process.exit(0);
}
run();
