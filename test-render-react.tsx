import React from "react";
import { render } from "@testing-library/react";
import App from "./src/App.tsx";
import { BrowserRouter } from 'react-router-dom';

// We need a wrapper to provide context if needed, but App.tsx has BrowserRouter inside it actually.
// Wait, App has BrowserRouter inside it!
// Let's just render App.

async function test() {
  try {
    const { container } = render(<App />);
    console.log("RENDERED HTML:", container.innerHTML.substring(0, 500));
  } catch (e) {
    console.error("CRASH DURING RENDER:", e);
  }
}
test();
