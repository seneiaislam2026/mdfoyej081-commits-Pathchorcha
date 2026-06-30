import { execSync } from "child_process";

try {
  const output = execSync("git checkout -- src/pages/Notes.tsx", { encoding: "utf8" });
  console.log("Git checkout output:", output);
} catch (error: any) {
  console.error("Error executing git:", error.message);
}
