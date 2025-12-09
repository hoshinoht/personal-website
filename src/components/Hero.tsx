import { Github, Linkedin, Mail } from "lucide-react";
import { contact } from "@/data/portfolio";
import TypingEffect from "./TypingEffect";

const Hero = () => {
  const profileImage = `${import.meta.env.BASE_URL}images/profile.png`;
  
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 dot-pattern opacity-30" />
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: "hsl(175 80% 50% / 0.3)" }}
      />
      
      <div className="container relative z-10 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Desktop: Side by side, Mobile: Stacked */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
            {/* Profile Image - Left on desktop */}
            <div 
              className="mb-8 lg:mb-0 animate-fade-in flex justify-center lg:justify-start lg:flex-shrink-0"
            >
              <div className="relative inline-block">
                <div className="w-32 h-32 md:w-40 md:h-40 lg:w-56 lg:h-56 rounded-full overflow-hidden border-2 border-primary/50 shadow-lg shadow-primary/20">
                  <img 
                    src={profileImage} 
                    alt="Po Haoting" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 rounded-full ring-2 ring-primary/30 ring-offset-2 ring-offset-background" />
              </div>
            </div>

            {/* Content - Right on desktop */}
            <div className="text-center lg:text-left flex-1">
              {/* Terminal-style intro */}
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-border bg-card/50 backdrop-blur-sm animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_2px] shadow-primary/50" />
                <span className="font-mono text-sm text-muted-foreground">
                  Available for opportunities
                </span>
              </div>
              
              {/* Name */}
              <h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                Po <span className="text-gradient">Haoting</span>
              </h1>
              
              {/* Title with Typing Effect */}
              <p 
                className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-6 font-light animate-slide-up h-8 lg:h-10"
                style={{ animationDelay: "0.2s" }}
              >
                <TypingEffect />
              </p>
              
              {/* Bio */}
              <p 
                className="text-secondary-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed animate-slide-up lg:text-lg"
                style={{ animationDelay: "0.3s" }}
              >
                Computing Science student passionate about Software Engineering, Cloud Computing, 
                Game Development, and AI. Building innovative solutions that bridge technology and creativity.
              </p>
              
              {/* Contact Links */}
              <div 
                className="flex items-center justify-center lg:justify-start gap-4 flex-wrap animate-slide-up"
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
        </div>
      </div>
    </section>
  );
};

export default Hero;
