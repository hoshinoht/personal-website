import { useState, useMemo } from 'react';
import { projects } from '../data/portfolio';
import { getDomainAccentColor } from '../lib/techColors';
import styles from '../styles/components/ProjectGraph.module.scss';

const allProjects = projects;

interface Edge {
  from: number;
  to: number;
  shared: string[];
  weight: number;
}

function buildEdges(): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < allProjects.length; i++) {
    for (let j = i + 1; j < allProjects.length; j++) {
      const setA = new Set(allProjects[i].tech.map((t) => t.toLowerCase()));
      const shared = allProjects[j].tech.filter((t) => setA.has(t.toLowerCase()));
      if (shared.length >= 1) {
        edges.push({ from: i, to: j, shared, weight: shared.length });
      }
    }
  }
  return edges;
}

// Edge color by shared tech count
const EDGE_COLORS = [
  { min: 1, max: 2, color: 'var(--md-sys-color-outline)', label: '1–2 shared' },
  { min: 3, max: 4, color: 'var(--color-sky)', label: '3–4 shared' },
  { min: 5, max: 6, color: 'var(--color-teal)', label: '5–6 shared' },
  { min: 7, max: Infinity, color: 'var(--md-sys-color-primary)', label: '7+ shared' },
];

function getEdgeColor(weight: number): string {
  const tier = EDGE_COLORS.find((t) => weight >= t.min && weight <= t.max);
  return tier?.color ?? 'var(--md-sys-color-outline)';
}

// Two-ring layout: featured in inner ring, others in outer ring
function getNodePositions(count: number, width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2;
  const featured = allProjects.map((p) => p.featured);
  const innerCount = featured.filter(Boolean).length;
  const outerCount = count - innerCount;
  const innerRadius = Math.min(cx, cy) * 0.38;
  const outerRadius = Math.min(cx, cy) * 0.82;

  const positions: { x: number; y: number }[] = [];
  let innerIdx = 0;
  let outerIdx = 0;

  for (let i = 0; i < count; i++) {
    if (featured[i]) {
      const angle = (innerIdx / innerCount) * Math.PI * 2 - Math.PI / 2;
      positions.push({ x: cx + Math.cos(angle) * innerRadius, y: cy + Math.sin(angle) * innerRadius });
      innerIdx++;
    } else {
      const angle = (outerIdx / outerCount) * Math.PI * 2 - Math.PI / 2;
      positions.push({ x: cx + Math.cos(angle) * outerRadius, y: cy + Math.sin(angle) * outerRadius });
      outerIdx++;
    }
  }
  return positions;
}

export function ProjectGraph() {
  const [open, setOpen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const edges = useMemo(buildEdges, []);

  const width = 800;
  const height = 650;
  const positions = useMemo(() => getNodePositions(allProjects.length, width, height), []);

  const activeEdges = hoveredNode !== null
    ? edges.filter((e) => e.from === hoveredNode || e.to === hoveredNode)
    : edges;

  const connectedNodes = hoveredNode !== null
    ? new Set(activeEdges.flatMap((e) => [e.from, e.to]))
    : null;

  const maxWeight = Math.max(...edges.map((e) => e.weight), 1);

  return (
    <>
      <button className={styles.toggleBtn} onClick={() => setOpen((p) => !p)}>
        {open ? 'Hide connections' : 'How my projects connect'}
      </button>

      {open && (
        <div className={styles.container}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className={styles.svg}
            aria-label="Project dependency graph showing shared technologies"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Edges — curved paths colored by shared tech count */}
            {edges.map((edge, i) => {
              const from = positions[edge.from];
              const to = positions[edge.to];
              const isHighlighted = hoveredNode !== null && (edge.from === hoveredNode || edge.to === hoveredNode);
              const isDimmed = hoveredNode !== null && !isHighlighted;

              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2;
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const curvature = dist * 0.08;
              const nx = -dy / dist * curvature;
              const ny = dx / dist * curvature;
              const cpx = mx + nx;
              const cpy = my + ny;

              const strokeW = isHighlighted
                ? 1.5 + (edge.weight / maxWeight) * 2.5
                : 0.5 + (edge.weight / maxWeight) * 1;

              return (
                <path
                  key={`edge-${i}`}
                  d={`M ${from.x} ${from.y} Q ${cpx} ${cpy} ${to.x} ${to.y}`}
                  fill="none"
                  stroke={getEdgeColor(edge.weight)}
                  strokeWidth={strokeW}
                  opacity={isDimmed ? 0.05 : isHighlighted ? 0.9 : 0.25 + (edge.weight / maxWeight) * 0.35}
                  filter={isHighlighted ? 'url(#glow)' : undefined}
                  className={styles.edge}
                />
              );
            })}

            {/* Nodes */}
            {positions.map((pos, i) => {
              const project = allProjects[i];
              const isFeatured = project.featured;
              const isActive = connectedNodes === null || connectedNodes.has(i);
              const isHovered = hoveredNode === i;
              const color = getDomainAccentColor(project.domains);
              const nodeR = isFeatured ? (isHovered ? 20 : 15) : (isHovered ? 14 : 9);

              const sharedWith = hoveredNode !== null && hoveredNode !== i
                ? activeEdges.find(
                    (e) => (e.from === hoveredNode && e.to === i) || (e.to === hoveredNode && e.from === i),
                  )
                : null;

              const cx = width / 2;
              const cy = height / 2;
              const angle = Math.atan2(pos.y - cy, pos.x - cx);
              const labelOffset = nodeR + 14;
              const lx = pos.x + Math.cos(angle) * labelOffset;
              const ly = pos.y + Math.sin(angle) * labelOffset;
              const anchor = Math.abs(angle) > Math.PI / 2 + 0.3 ? 'end' : Math.abs(angle) < Math.PI / 2 - 0.3 ? 'start' : 'middle';

              return (
                <g
                  key={project.id}
                  onMouseEnter={() => setHoveredNode(i)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {isHovered && (
                    <circle cx={pos.x} cy={pos.y} r={nodeR + 6} fill="none" stroke={color} strokeWidth={2} opacity={0.4} />
                  )}

                  <circle
                    cx={pos.x} cy={pos.y} r={nodeR}
                    fill={color}
                    opacity={isActive ? (isFeatured ? 1 : 0.8) : 0.15}
                    className={styles.node}
                    filter={isHovered ? 'url(#glow)' : undefined}
                  />

                  {isFeatured && (
                    <circle cx={pos.x} cy={pos.y} r={3} fill="var(--md-sys-color-on-primary)" opacity={isActive ? 0.8 : 0.1} />
                  )}

                  <text
                    x={lx} y={ly}
                    textAnchor={anchor}
                    dominantBaseline="central"
                    className={isFeatured ? styles.labelFeatured : styles.label}
                    opacity={isActive ? 1 : 0.15}
                  >
                    {project.name}
                  </text>

                  {sharedWith && (() => {
                    const labelText = sharedWith.shared.slice(0, 3).join(', ')
                      + (sharedWith.shared.length > 3 ? ` +${sharedWith.shared.length - 3}` : '');
                    const lx = (pos.x + positions[hoveredNode!].x) / 2;
                    const ly = (pos.y + positions[hoveredNode!].y) / 2 - 10;
                    const padX = 6;
                    const padY = 3;
                    const textW = labelText.length * 5.5;
                    return (
                      <g>
                        <rect
                          x={lx - textW / 2 - padX}
                          y={ly - 7 - padY}
                          width={textW + padX * 2}
                          height={14 + padY * 2}
                          rx={4}
                          fill="var(--md-sys-color-surface-container)"
                          stroke="var(--md-sys-color-outline-variant)"
                          strokeWidth={0.5}
                          opacity={0.95}
                        />
                        <text x={lx} y={ly} textAnchor="middle" className={styles.edgeLabel}>
                          {labelText}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}
          </svg>

          <div className={styles.legend}>
            <span className={styles.legendDot} style={{ width: 12, height: 12 }} /> Featured
            <span className={styles.legendDot} style={{ width: 8, height: 8 }} /> Other
            <span className={styles.legendSpacer} />
            {EDGE_COLORS.map((tier) => (
              <span key={tier.label} className={styles.legendEdge}>
                <span className={styles.legendLine} style={{ background: tier.color }} />
                {tier.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
