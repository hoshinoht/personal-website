import { useState, useMemo } from "react";
import Hero from "@/components/Hero";
import KeywordFilter from "@/components/KeywordFilter";
import ExperienceCard from "@/components/ExperienceCard";
import ProjectCard from "@/components/ProjectCard";
import SkillsSection from "@/components/SkillsSection";
import EducationSection from "@/components/EducationSection";
import Footer from "@/components/Footer";
import { experiences, projects, Keyword } from "@/data/portfolio";
import { Briefcase, FolderOpen } from "lucide-react";

const Index = () => {
  const [selectedKeywords, setSelectedKeywords] = useState<Keyword[]>([]);

  const toggleKeyword = (keyword: Keyword) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  };

  const clearKeywords = () => setSelectedKeywords([]);

  const filteredExperiences = useMemo(() => {
    if (selectedKeywords.length === 0) return experiences;
    return experiences.filter((exp) =>
      exp.keywords.some((k) => selectedKeywords.includes(k))
    );
  }, [selectedKeywords]);

  const filteredProjects = useMemo(() => {
    if (selectedKeywords.length === 0) return projects;
    return projects.filter((proj) =>
      proj.keywords.some((k) => selectedKeywords.includes(k))
    );
  }, [selectedKeywords]);

  const isExperienceHighlighted = (exp: typeof experiences[0]) => {
    if (selectedKeywords.length === 0) return true;
    return exp.keywords.some((k) => selectedKeywords.includes(k));
  };

  const isProjectHighlighted = (proj: typeof projects[0]) => {
    if (selectedKeywords.length === 0) return true;
    return proj.keywords.some((k) => selectedKeywords.includes(k));
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero />

      {/* Resume Tailor Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="container px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Resume Tailor</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Select keywords to filter my experience and projects by your areas of interest
            </p>
          </div>

          <KeywordFilter
            selectedKeywords={selectedKeywords}
            onToggle={toggleKeyword}
            onClear={clearKeywords}
          />

          {/* Experience */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-5 h-5 text-primary" />
              <h3 className="text-2xl font-semibold">Work Experience</h3>
              {selectedKeywords.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-sm font-mono">
                  {filteredExperiences.length} match{filteredExperiences.length !== 1 && "es"}
                </span>
              )}
            </div>
            <div className="space-y-6">
              {experiences.map((exp) => (
                <ExperienceCard
                  key={exp.id}
                  experience={exp}
                  isHighlighted={isExperienceHighlighted(exp)}
                />
              ))}
            </div>
          </div>

          {/* Projects */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <FolderOpen className="w-5 h-5 text-primary" />
              <h3 className="text-2xl font-semibold">Projects</h3>
              {selectedKeywords.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-sm font-mono">
                  {filteredProjects.length} match{filteredProjects.length !== 1 && "es"}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  isHighlighted={isProjectHighlighted(proj)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <SkillsSection selectedKeywords={selectedKeywords} />
      <EducationSection />
      <Footer />
    </div>
  );
};

export default Index;
