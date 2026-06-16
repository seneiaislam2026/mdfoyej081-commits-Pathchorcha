import { db } from "./src/lib/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";

async function run() {
    const qBase = collection(db, "questions");
    const snap = await getDocs(qBase);
    let classes = new Set<string>();
    let topics = new Set<string>();
    snap.docs.forEach(d => {
        const data = d.data();
        if(data.class) classes.add(data.class);
        if(data.classId) classes.add(data.classId);
        if(data.className) classes.add(data.className);
        
        if(data.chapter) topics.add(data.chapter);
        if(data.topic) topics.add(data.topic);
        if(data.title) topics.add(data.title.substring(0, 20));
        
        if(data.group) classes.add("group: " + data.group);
    });
    console.log("Classes found in questions:", Array.from(classes));
    console.log("Topics found in questions:", Array.from(topics).slice(0, 50));
    process.exit(0);
}
run();
