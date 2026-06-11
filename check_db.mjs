import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, query, where } from "firebase/firestore";
import fs from "fs";
import path from "path";

let firebaseConfig;
try {
  let configRaw = fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8");
  firebaseConfig = JSON.parse(configRaw);
} catch (e) {
  console.log("No config found, exiting");
  process.exit();
}

const app = initializeApp(firebaseConfig);
const dbId = firebaseConfig.firestoreDatabaseId;
const db = dbId ? getFirestore(app, dbId) : getFirestore(app);

async function run() {
  const colRef = collection(db, "questions");
  const qTitle = "ম্যানেজমেন্ট ১ম অধ্যায় — সেরা ৫০টি অতি গুরুত্বপূর্ণ এমসিকিউ";
  const qObj = query(colRef, where("title", "==", qTitle));
  
  const snap = await getDocs(qObj);
  console.log("Number of matching docs:", snap.size);
  process.exit();
}
run().catch(console.error);
