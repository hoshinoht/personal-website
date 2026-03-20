import { FilterProvider } from './components/FilterContext';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { StickyFilter } from './components/StickyFilter';
import { ExperienceTimeline } from './components/ExperienceTimeline';
import { FeaturedProjects } from './components/FeaturedProjects';
import { Skills } from './components/Skills';
import { Education } from './components/Education';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <FilterProvider>
      <Navigation />
      <main>
        <Hero />
        <StickyFilter />
        <ExperienceTimeline />
        <FeaturedProjects />
        <Skills />
        <Education />
      </main>
      <Footer />
    </FilterProvider>
  );
}
