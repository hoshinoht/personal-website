import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FilterProvider } from './components/FilterContext';
import { ScrollProgress } from './components/ScrollProgress';
import { Navigation } from './components/Navigation';
import { ThemeToggle } from './components/ThemeToggle';
import { KeyboardNav } from './components/KeyboardNav';
import { ContactFab } from './components/ContactFab';
import { ConsoleArt } from './components/ConsoleArt';
import { Hero } from './components/Hero';
import { StickyFilter } from './components/StickyFilter';
import { ImpactStats } from './components/ImpactStats';
import { ExperienceTimeline } from './components/ExperienceTimeline';
import { SectionDivider } from './components/SectionDivider';
import { Footer } from './components/Footer';

// Lazy load: overlays (not visible until user triggers them)
const CommandPalette = lazy(() => import('./components/CommandPalette').then((m) => ({ default: m.CommandPalette })));
const Terminal = lazy(() => import('./components/Terminal').then((m) => ({ default: m.Terminal })));
const JdMatcher = lazy(() => import('./components/JdMatcher').then((m) => ({ default: m.JdMatcher })));
const KonamiEgg = lazy(() => import('./components/KonamiEgg').then((m) => ({ default: m.KonamiEgg })));

// Lazy load: below-fold sections
const ProjectTimeline = lazy(() => import('./components/ProjectTimeline').then((m) => ({ default: m.ProjectTimeline })));
const FeaturedProjects = lazy(() => import('./components/FeaturedProjects').then((m) => ({ default: m.FeaturedProjects })));
const Skills = lazy(() => import('./components/Skills').then((m) => ({ default: m.Skills })));
const Education = lazy(() => import('./components/Education').then((m) => ({ default: m.Education })));

export default function App() {
  return (
    <ErrorBoundary>
    <FilterProvider>
      <ScrollProgress />
      <Navigation />
      <ThemeToggle />
      <KeyboardNav />
      <Suspense fallback={null}>
        <CommandPalette />
        <Terminal />
        <JdMatcher />
        <KonamiEgg />
      </Suspense>
      <ContactFab />
      <ConsoleArt />
      <main>
        <Hero />
        <StickyFilter />
        <ImpactStats />
        <Suspense fallback={null}>
          <ProjectTimeline />
        </Suspense>
        <SectionDivider />
        <ExperienceTimeline />
        <SectionDivider />
        <Suspense fallback={null}>
          <FeaturedProjects />
        </Suspense>
        <SectionDivider />
        <Suspense fallback={null}>
          <Skills />
        </Suspense>
        <SectionDivider />
        <Suspense fallback={null}>
          <Education />
        </Suspense>
      </main>
      <Footer />
    </FilterProvider>
    </ErrorBoundary>
  );
}
