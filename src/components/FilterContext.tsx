import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { domains, type Domain } from '../data/portfolio';

interface FilterState {
  activeDomain: Domain | null;
  setActiveDomain: (domain: Domain | null) => void;
}

const FilterContext = createContext<FilterState>({
  activeDomain: null,
  setActiveDomain: () => {},
});

function domainFromHash(): Domain | null {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  const decoded = decodeURIComponent(hash.replace(/-/g, ' '));
  return (domains as readonly string[]).find(
    (d) => d.toLowerCase() === decoded.toLowerCase(),
  ) as Domain | undefined ?? null;
}

function domainToHash(domain: Domain | null): string {
  if (!domain) return '';
  return '#' + domain.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
}

export function FilterProvider({ children }: { children: ReactNode }) {
  const [activeDomain, setActiveDomainState] = useState<Domain | null>(domainFromHash);

  const setActiveDomain = (domain: Domain | null) => {
    setActiveDomainState(domain);
    const hash = domainToHash(domain);
    if (hash) {
      window.history.replaceState(null, '', hash);
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  useEffect(() => {
    const handler = () => setActiveDomainState(domainFromHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return (
    <FilterContext.Provider value={{ activeDomain, setActiveDomain }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  return useContext(FilterContext);
}
