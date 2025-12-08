import { Github, Linkedin, Mail, Phone } from "lucide-react";
import { contact } from "@/data/portfolio";

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 dot-pattern opacity-30" />
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: "hsl(175 80% 50% / 0.3)" }}
      />
      
      <div className="container relative z-10 px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Terminal-style intro */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-border bg-card/50 backdrop-blur-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
            <span className="font-mono text-sm text-muted-foreground">
              Available for opportunities
            </span>
          </div>
          
          {/* Name */}
          <h1 
            className="text-5xl md:text-7xl font-bold mb-4 tracking-tight animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Po <span className="text-gradient">Haoting</span>
          </h1>
          
          {/* Title */}
          <p 
            className="text-xl md:text-2xl text-muted-foreground mb-8 font-light animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            Software Engineer & Game Developer
          </p>
          
          {/* Bio */}
          <p 
            className="text-secondary-foreground max-w-xl mx-auto mb-10 leading-relaxed animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            Building scalable systems and immersive experiences. 
            Passionate about systems programming, cloud infrastructure, and interactive media.
          </p>
          
          {/* Contact Links */}
          <div 
            className="flex items-center justify-center gap-4 flex-wrap animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium transition-all hover:glow-primary hover:scale-105"
            >
              <Mail className="w-4 h-4" />
              Contact Me
            </a>
            <a
              href={contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-card/50 text-foreground font-medium transition-all hover:border-primary/50 hover:bg-card"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-card/50 text-foreground font-medium transition-all hover:border-primary/50 hover:bg-card"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
