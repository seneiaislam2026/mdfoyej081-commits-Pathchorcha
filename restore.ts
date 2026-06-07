import fs from "fs";

const p = "/.gemini/antigravity/brain/e2950986-ea1b-49d4-bccf-a9edba1160a7/.system_generated/logs/transcript.jsonl";
if (fs.existsSync(p)) {
  console.log("File exists!");
  const logContent = fs.readFileSync(p, "utf8");
  console.log("File size:", logContent.length);
  
  // Find where Notes.tsx is being output or viewed. 
  // Let's print out snippets that look like the old structure
  const index = logContent.lastIndexOf("med-bio-card");
  if (index !== -1) {
    console.log("Found occurrences of med-bio-card. Snippet around it:");
    console.log(logContent.slice(index - 500, index + 2000));
  } else {
    console.log("Could not find med-bio-card in log file content.");
  }
} else {
  console.log("File path does not exist:", p);
  // Let's check parent folders
  console.log("/.gemini exists?", fs.existsSync("/.gemini"));
  if (fs.existsSync("/.gemini")) {
    console.log("Contents of /.gemini:", fs.readdirSync("/.gemini"));
  }
}
