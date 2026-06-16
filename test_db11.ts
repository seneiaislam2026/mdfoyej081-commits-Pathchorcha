import { db } from "./src/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

async function run() {
    const snap = await getDocs(collection(db, "questions"));
    let foundObject = 0;
    snap.docs.forEach(d => {
        if (typeof d.data().text === 'object' && d.data().text !== null) {
            foundObject++;
        }
    });
    console.log("Found objects:", foundObject);
    process.exit(0);
}
run();
