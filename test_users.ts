import { db } from "./src/lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";

async function run() {
    try {
        const users = await getDocs(query(collection(db, "users"), limit(5)));
        users.docs.forEach(d => console.log(d.id, d.data()));
    } catch(e:any) {
        console.log("users:", e.message);
    }
    process.exit(0);
}
run();
