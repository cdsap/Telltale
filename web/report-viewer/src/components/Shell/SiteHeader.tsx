import { useEffect, useState } from "react";
import { SITE } from "./site";

function currentTheme(): "light" | "dark" {
  if (typeof document === "undefined") {
    return "light";
  }
  if (document.documentElement.classList.contains("dark")) {
    return "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.body.classList.toggle("dark", theme === "dark");
}

export function SiteHeader() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const initial = currentTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  return (
    <header className="header">
      <nav className="nav" aria-label="Telltale">
        <div className="logo">
          <a href={SITE} title="Telltale">
            Telltale
          </a>
          <div className="logo-switches">
            <button
              id="theme-toggle"
              type="button"
              aria-label="Toggle theme"
              onClick={() => {
                const next = theme === "dark" ? "light" : "dark";
                setTheme(next);
                applyTheme(next);
              }}
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
          </div>
        </div>
        <ul id="menu">
          <li>
            <a href={`${SITE}/posts/`}>
              <span>Experiments</span>
            </a>
          </li>
          <li>
            <a href={`${SITE}/info/`}>
              <span>Info</span>
            </a>
          </li>
          <li>
            <a href={`${SITE}/experiment-data/`}>
              <span>Experiment data</span>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
