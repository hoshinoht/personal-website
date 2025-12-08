import { skills } from "@/data/portfolio";
import { Cpu, Database, Wrench, Gamepad2 } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "Cloud & Infrastructure": <Cpu className="w-5 h-5" />,
  "Data Engineering & Analytics": <Database className="w-5 h-5" />,
  "Software Engineering": <Wrench className="w-5 h-5" />,
  "Game Development": <Gamepad2 className="w-5 h-5" />,
};

const SkillsSection = () => {
  return (
    <section className="py-20">
      <div className="container px-6">
        <h2 className="text-3xl font-bold mb-2">Skills & Competencies</h2>
        <p className="text-muted-foreground mb-10">Technologies and tools I work with</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(skills).map(([category, items]) => (
            <div
              key={category}
              className="p-6 rounded-xl card-gradient border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {iconMap[category]}
                </div>
                <h3 className="font-semibold text-foreground">{category}</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
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
