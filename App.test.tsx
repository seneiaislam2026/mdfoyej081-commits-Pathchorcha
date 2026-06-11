import { describe, test, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import App from "./src/App.tsx";

describe("App Render", () => {
  test("renders without crashing", () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    try {
      const { container } = render(<App />);
      console.log("HTML:", container.innerHTML.substring(0, 500));
    } catch(e) {
      console.error(e);
      throw e;
    }
  });
});
