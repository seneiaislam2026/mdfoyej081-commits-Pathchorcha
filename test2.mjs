import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, collection } from "firebase/firestore";
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
  try {
    const r = await addDoc(collection(db, "questions"), { text: "test" });
    console.log("Added doc", r.id);
  } catch(e) { console.error(e); }
  process.exit();
}
run();
