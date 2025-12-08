import { Project } from "@/data/portfolio";
import { Code2, Github } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  isHighlighted: boolean;
}

const ProjectCard = ({ project, isHighlighted }: ProjectCardProps) => {
  return (
    <div
      className={`
        relative p-6 rounded-xl transition-all duration-300 h-full
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
      
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
          <Code2 className="w-5 h-5 text-primary" />
        </div>
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/10 transition-colors"
          >
            <Github className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </a>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-3">
        {project.title}
      </h3>
      
      <ul className="space-y-2 mb-4">
        {project.description.map((item, index) => (
          <li key={index} className="text-secondary-foreground text-sm leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
      
      {/* Technologies */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.technologies.map((tech) => (
          <span
            key={tech}
            className="px-2 py-0.5 rounded bg-primary/10 text-xs font-mono text-primary"
          >
            {tech}
          </span>
        ))}
      </div>
      
      {/* Keywords */}
      <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-border/50">
        {project.keywords.map((keyword) => (
          <span
            key={keyword}
            className="text-xs text-muted-foreground"
          >
            #{keyword.replace(/\s+/g, "")}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProjectCard;
