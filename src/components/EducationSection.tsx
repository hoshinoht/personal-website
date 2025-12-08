import { education } from "@/data/portfolio";
import { GraduationCap, Calendar } from "lucide-react";

const EducationSection = () => {
  return (
    <section className="py-20 bg-card/30">
      <div className="container px-6">
        <h2 className="text-3xl font-bold mb-2">Education</h2>
        <p className="text-muted-foreground mb-10">Academic background</p>
        
        <div className="space-y-6 max-w-2xl">
          {education.map((edu, index) => (
            <div
              key={index}
              className="relative pl-8 pb-6 last:pb-0"
            >
              {/* Timeline line */}
              {index < education.length - 1 && (
                <div className="absolute left-[11px] top-8 bottom-0 w-px bg-border" />
              )}
              
              {/* Timeline dot */}
              <div className="absolute left-0 top-1 p-1.5 rounded-full bg-primary/20 border border-primary/40">
                <GraduationCap className="w-3 h-3 text-primary" />
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-1">{edu.degree}</h3>
                <p className="text-primary text-sm mb-2">{edu.school}</p>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {edu.period}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
