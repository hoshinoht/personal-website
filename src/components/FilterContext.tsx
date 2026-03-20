import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Domain } from '../data/portfolio';

interface FilterState {
  activeDomain: Domain | null; // null = show everything
  setActiveDomain: (domain: Domain | null) => void;
}

const FilterContext = createContext<FilterState>({
  activeDomain: null,
  setActiveDomain: () => {},
});

export function FilterProvider({ children }: { children: ReactNode }) {
  const [activeDomain, setActiveDomain] = useState<Domain | null>(null);
  return (
    <FilterContext.Provider value={{ activeDomain, setActiveDomain }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  return useContext(FilterContext);
}
