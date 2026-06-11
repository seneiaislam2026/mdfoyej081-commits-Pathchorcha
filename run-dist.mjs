import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";

// Add babel/register or use esbuild to bundle text. Actually, Vite builds the app!
// Let's run the static build and parse it? Yes!
// Vite places index.html in dist.
const html = fs.readFileSync(path.resolve("./dist/index.html"), "utf8");

const dom = new JSDOM(html, {
  url: "http://localhost:3000/",
  runScripts: "dangerously",
  resources: "usable" // Load external scripts!
});

// Polyfill minimal browser stuff
const window = dom.window;
global.window = window;
global.document = window.document;
Object.defineProperty(global, 'navigator', { value: window.navigator });
global.HTMLElement = window.HTMLElement;
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);

window.addEventListener("error", (event) => {
  console.error("DOM Window Error:", event.error);
});
window.addEventListener("unhandledrejection", (event) => {
  console.error("DOM Unhandled Rejection:", event.reason);
});

setTimeout(() => {
  console.log("BODY HTML AFTER 2 SECONDS: ", document.body.innerHTML.substring(0, 1000));
  process.exit();
}, 2000);
