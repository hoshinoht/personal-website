import { FilterProvider } from './components/FilterContext';
import { ScrollProgress } from './components/ScrollProgress';
import { Navigation } from './components/Navigation';
import { ThemeToggle } from './components/ThemeToggle';
import { KeyboardNav } from './components/KeyboardNav';
import { CommandPalette } from './components/CommandPalette';
import { Terminal } from './components/Terminal';
import { JdMatcher } from './components/JdMatcher';
import { ConsoleArt } from './components/ConsoleArt';
import { KonamiEgg } from './components/KonamiEgg';
import { Hero } from './components/Hero';
import { StickyFilter } from './components/StickyFilter';
import { ImpactStats } from './components/ImpactStats';
import { ProjectTimeline } from './components/ProjectTimeline';
import { ExperienceTimeline } from './components/ExperienceTimeline';
import { FeaturedProjects } from './components/FeaturedProjects';
import { Skills } from './components/Skills';
import { Education } from './components/Education';
import { SectionDivider } from './components/SectionDivider';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <FilterProvider>
      <ScrollProgress />
      <Navigation />
      <ThemeToggle />
      <KeyboardNav />
      <CommandPalette />
      <Terminal />
      <JdMatcher />
      <ConsoleArt />
      <KonamiEgg />
      <main>
        <Hero />
        <StickyFilter />
        <ImpactStats />
        <ProjectTimeline />
        <SectionDivider />
        <ExperienceTimeline />
        <SectionDivider />
        <FeaturedProjects />
        <SectionDivider />
        <Skills />
        <SectionDivider />
        <Education />
      </main>
      <Footer />
    </FilterProvider>
  );
}
