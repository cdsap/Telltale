import { useTheme } from "../../app/theme";
import { SITE } from "./site";

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme();

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
              onClick={toggleTheme}
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
