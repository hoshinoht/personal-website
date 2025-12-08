import { Experience } from "@/data/portfolio";
import { Briefcase, MapPin, Calendar } from "lucide-react";

interface ExperienceCardProps {
  experience: Experience;
  isHighlighted: boolean;
}

const ExperienceCard = ({ experience, isHighlighted }: ExperienceCardProps) => {
  return (
    <div
      className={`
        relative p-6 rounded-xl transition-all duration-300
        ${isHighlighted 
          ? "card-gradient border-glow" 
          : "bg-card/30 border border-border/50 opacity-60"
        }
      `}
    >
      {/* Highlight indicator */}
      {isHighlighted && (
        <div className="absolute top-0 left-6 w-12 h-1 bg-primary rounded-b-full" />
      )}
      
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-1">
            {experience.title}
          </h3>
          <p className="text-primary font-medium">{experience.company}</p>
        </div>
        
        <div className="flex flex-col gap-1 text-sm text-muted-foreground md:text-right">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {experience.period}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {experience.location} • {experience.type}
          </span>
        </div>
      </div>
      
      <ul className="space-y-2 mb-4">
        {experience.description.map((item, index) => (
          <li key={index} className="text-secondary-foreground text-sm leading-relaxed pl-4 relative">
            <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-primary/50" />
            {item}
          </li>
        ))}
      </ul>
      
      <div className="flex flex-wrap gap-2">
        {experience.keywords.map((keyword) => (
          <span
            key={keyword}
            className="px-2.5 py-1 rounded-md bg-muted text-xs font-mono text-muted-foreground"
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ExperienceCard;
