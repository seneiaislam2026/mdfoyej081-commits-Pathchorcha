import { db } from "./src/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

async function check() {
  const snap = await getDocs(collection(db, "questions"));
  const subjects = new Set();
  const options = new Set();
  let count = 0;
  snap.docs.forEach(d => {
      subjects.add(d.data().subject);
      count++;
  });
  console.log(`Total questions: ${count}`);
  console.log("Subjects in DB:", Array.from(subjects));
  process.exit(0);
}
check();
