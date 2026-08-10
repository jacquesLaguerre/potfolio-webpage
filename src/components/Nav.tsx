import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const LINKS = [
  { id: "home", href: "#home", label: "Home", short: "H" },
  { id: "about", href: "#about", label: "About", short: "A" },
  { id: "work", href: "#work", label: "Projects", short: "W" },
  { id: "contact", href: "#contact", label: "Contact", short: "C" },
];

export default function Nav() {
  const { theme, toggleTheme } = useTheme();
  const [active, setActive] = useState("home");
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const sections = ["home", "about", "work", "mission", "contact"];
    const sectionToId: Record<string, string> = {
      home: "home",
      about: "about",
      work: "work",
      mission: "contact",
      contact: "contact",
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(sectionToId[entry.target.id] ?? "home");
          }
        });
      },
      { threshold: 0.4 },
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = linkRefs.current[active];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [active]);

  return (
    <nav id="navbar">
      <div
        className="nav-indicator"
        style={{ left: indicator.left, width: indicator.width }}
      />
      {LINKS.map((link) => (
        <a
          key={link.id}
          ref={(el) => {
            linkRefs.current[link.id] = el;
          }}
          href={link.href}
          data-short={link.short}
          className={active === link.id ? "active" : ""}
        >
          <span>{link.label}</span>
        </a>
      ))}
      <button
        className="theme-toggle"
        aria-label="Toggle theme"
        onClick={toggleTheme}
      >
        {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
      </button>
    </nav>
  );
}
