import { skillCategories, Keyword } from "@/data/portfolio";
import { Cpu, Database, Wrench, Gamepad2, Microchip } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "Cloud & Infrastructure": <Cpu className="w-5 h-5" />,
  "Data Engineering & Analytics": <Database className="w-5 h-5" />,
  "Software Engineering": <Wrench className="w-5 h-5" />,
  "Game Development": <Gamepad2 className="w-5 h-5" />,
  "Systems & Embedded": <Microchip className="w-5 h-5" />,
};

interface SkillsSectionProps {
  selectedKeywords: Keyword[];
}

const SkillsSection = ({ selectedKeywords }: SkillsSectionProps) => {
  const isHighlighted = (category: typeof skillCategories[0]) => {
    if (selectedKeywords.length === 0) return true;
    return category.keywords.some((k) => selectedKeywords.includes(k));
  };

  const visibleCategories = selectedKeywords.length === 0
    ? skillCategories
    : skillCategories.filter((cat) => cat.keywords.some((k) => selectedKeywords.includes(k)));

  if (visibleCategories.length === 0) return null;

  return (
    <section className="py-20">
      <div className="container px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold mb-2">Skills & Competencies</h2>
        <p className="text-muted-foreground mb-10">Technologies and tools I work with</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCategories.map((category) => (
            <div
              key={category.name}
              className={`
                p-6 rounded-xl transition-all duration-300
                ${isHighlighted(category)
                  ? "card-gradient border border-border/50 hover:border-primary/30"
                  : "bg-card/30 border border-border/50 opacity-60"
                }
              `}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {iconMap[category.name]}
                </div>
                <h3 className="font-semibold text-foreground">{category.name}</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-lg bg-muted text-sm text-secondary-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;