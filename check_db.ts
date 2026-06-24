import { db } from "./src/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

import * as fs from "fs";
import * as path from "path";

async function check() {
  const logoPath = "public/logo.png";
  if (!fs.existsSync(logoPath)) {
    console.error("public/logo.png does not exist!");
    process.exit(1);
  }

  const destinations = [
    "public/favicon.ico",
    "public/icon-192.png",
    "public/icon-512.png",
    "public/icon-192-v2.png",
    "public/icon-512-v2.png",
    "public/icons/icon-192.png",
    "public/icons/icon-512.png",
    "public/icons/maskable-192.png",
    "public/icons/maskable-512.png"
  ];

  for (const dest of destinations) {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(logoPath, dest);
    console.log(`Copied logo to ${dest}`);
  }

  console.log("All logo paths updated successfully!");
  process.exit(0);
}
check();





