import { JSDOM } from "jsdom";

const dom = new JSDOM(`<!DOCTYPE html><html lang="en"><head></head><body><div id="root"></div></body></html>`, {
  url: "http://localhost/",
  runScripts: "dangerously"
});

// Polyfill minimal browser stuff
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator });
global.HTMLElement = dom.window.HTMLElement;

async function run() {
  try {
    // import the main entry
    await import("./src/main.js"); // Wait, main is tsx. We need to compile it or use tsx
  } catch(e) {
    console.error("Crash during import/render:", e);
  }
  
  setTimeout(() => {
    console.log("BODY HTML: ", document.body.innerHTML.substring(0, 500));
    process.exit();
  }, 1000);
}
run();
