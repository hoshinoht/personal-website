import { useState, useEffect } from "react";
import { User, Briefcase, Code, GraduationCap } from "lucide-react";

const navLinks = [
  { label: "About", href: "#hero", icon: User },
  { label: "Experience", href: "#experience", icon: Briefcase },
  { label: "Skills", href: "#skills", icon: Code },
  { label: "Education", href: "#education", icon: GraduationCap },
];

const Navigation = () => {
  const [activeSection, setActiveSection] = useState("#hero");

  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map((link) => ({
        id: link.href,
        element: document.querySelector(link.href),
      }));

      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          const offsetTop = (section.element as HTMLElement).offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLButtonElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed left-4 md:left-6 top-1/2 -translate-y-1/2 z-50">
      <div className="flex flex-col items-center gap-1 p-2 rounded-full bg-primary/90 backdrop-blur-sm shadow-lg">
        {navLinks.map((link, index) => {
          const Icon = link.icon;
          const isActive = activeSection === link.href;
          
          return (
            <div key={link.href} className="flex flex-col items-center">
              <button
                onClick={(e) => handleNavClick(e, link.href)}
                className={`group relative p-3 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-background/20 text-foreground hover:bg-background/40"
                }`}
                aria-label={link.label}
              >
                <Icon className="w-5 h-5" />
                
                {/* Tooltip */}
                <span className="absolute left-full ml-3 px-2 py-1 rounded bg-card text-foreground text-sm font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-md border border-border">
                  {link.label}
                </span>
              </button>
              
              {/* Connector dots */}
              {index < navLinks.length - 1 && (
                <div className="flex flex-col items-center gap-1 py-1">
                  <span className="w-1 h-1 rounded-full bg-foreground/40" />
                  <span className="w-1 h-1 rounded-full bg-foreground/40" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
