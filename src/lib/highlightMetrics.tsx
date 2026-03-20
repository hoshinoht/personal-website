import type { ReactNode } from 'react';

// Matches quantifiable metrics in portfolio text
const METRIC_PATTERN = new RegExp(
  [
    // Big-O notation: O(1), O(N), O(N²)
    /O\([^)]+\)/.source,
    // Comparisons with units: <5s, >95%, ~500ms, <2%
    /[<>~≈]\s?\d[\d,.]*\s?(?:s|ms|fps|%|x|KB|MB|GB)/.source,
    // Numbers with explicit units: 720p, 30fps, 1200ms, 32KB, 8MB, 15%, 2.5x
    /\d[\d,.]*\+?\s?(?:p@\d+fps|fps|ms|[mMkKGT]?B|LOC|%|x\b)/.source,
    // Standalone big numbers with +: 700+, 5100+, 2M+, 10+
    /\d[\d,]*[MmKk]?\+/.source,
    // Sub-x patterns
    /sub-(?:second|millisecond)/.source,
    // NvN patterns: 4v4
    /\d+v\d+/.source,
    // Digit sequences followed by metric-ish words (must be ≥2 digits or significant)
    /\d[\d,]+\s?(?:concurrent|participants|containers|commits|submodules|services|microservices|hops|records|rooms|players|characters)/.source,
  ].join('|'),
  'gi',
);

export function highlightMetrics(text: string, variant: 'default' | 'impact' = 'default'): ReactNode {
  const matches: { start: number; end: number; text: string }[] = [];

  // Reset lastIndex and find all matches
  METRIC_PATTERN.lastIndex = 0;
  let m = METRIC_PATTERN.exec(text);
  while (m !== null) {
    matches.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
    m = METRIC_PATTERN.exec(text);
  }

  if (matches.length === 0) return text;

  const result: ReactNode[] = [];
  let lastEnd = 0;

  for (const match of matches) {
    if (match.start > lastEnd) {
      result.push(text.slice(lastEnd, match.start));
    }
    result.push(
      <span
        key={match.start}
        style={
          variant === 'impact'
            ? { fontWeight: 700, color: 'var(--color-green)', filter: 'brightness(1.2)' }
            : { fontWeight: 600, color: 'var(--color-green)' }
        }
      >
        {match.text}
      </span>,
    );
    lastEnd = match.end;
  }

  if (lastEnd < text.length) {
    result.push(text.slice(lastEnd));
  }

  return result;
}
