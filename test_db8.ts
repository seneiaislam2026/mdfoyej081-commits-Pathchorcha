import { db } from "./src/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

async function run() {
    const qBase = collection(db, "questions");
    const snap = await getDocs(qBase);
    let classes = new Set<string>();
    let topics = new Set<string>();
    let groups = new Set<string>();
    
    snap.docs.forEach(d => {
        const data = d.data();
        if(data.class) classes.add(data.class);
        if(data.classId) classes.add(data.classId);
        if(data.className) classes.add(data.className);
        
        if(data.chapter) topics.add(data.chapter);
        if(data.topic) topics.add(data.topic);
        if(data.title) topics.add(data.title);
        
        if(data.group) groups.add(data.group);
    });
    console.log("Classes:", Array.from(classes));
    console.log("Groups:", Array.from(groups));
    console.log("Topics count:", topics.size);
    console.log("Topics:", Array.from(topics));
    process.exit(0);
}
run();
