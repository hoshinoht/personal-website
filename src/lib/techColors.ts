// Maps tech items to chip color categories for visual grouping

type ChipColor = 'mauve' | 'teal' | 'lavender' | 'peach' | 'sapphire' | 'green' | 'sky' | 'pink';

const languages = new Set([
  'C#', 'C', 'C++', 'Go', 'Rust', 'Python', 'Kotlin', 'Dart', 'TypeScript',
  'JavaScript', 'Java', 'SQL', 'PHP', 'HTML', 'CSS', 'Assembly',
]);

const frameworks = new Set([
  'React', 'Flutter', 'Unity', '.NET 10', '.NET', 'Actix Web', 'Axum',
  'Flask', 'ESP-IDF', 'FreeRTOS', 'Jetpack Compose', 'Material 3',
  'ARCore', 'Vite', 'Electron', 'PyTorch', 'TensorFlow', 'Scikit-learn',
  'Jinja2', 'Tera',
]);

const infrastructure = new Set([
  'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'SQLite', 'Redis',
  'Valkey/Redis', 'RabbitMQ', 'Firebase', 'MQTT', 'MQTT-SN', 'UDP',
  'ollama', 'AWS', 'GCP',
]);

const protocols = new Set([
  'gRPC', 'gRPC-web', 'REST', 'WebRTC', 'WebSocket Signalling', 'BLE',
  'LoRa', 'BLE Mesh', 'LoRa Mesh', 'SPI', 'Microservices',
  'Event-Driven Architecture', 'OpenTelemetry Tracing', 'JWT', 'JWT Auth',
]);

export function getTechChipColor(tech: string): ChipColor {
  if (languages.has(tech)) return 'mauve';
  if (frameworks.has(tech)) return 'teal';
  if (infrastructure.has(tech)) return 'lavender';
  if (protocols.has(tech)) return 'peach';
  return 'sapphire'; // tools, patterns, and everything else
}

// Maps a project's primary domain to a CSS accent color variable
export function getDomainAccentColor(domains: string[]): string {
  if (domains.includes('ML & AI')) return 'var(--md-sys-color-primary)';
  if (domains.includes('IoT & Embedded')) return 'var(--color-sky)';
  if (domains.includes('Game Dev & XR')) return 'var(--color-pink)';
  if (domains.includes('Cloud & DevOps')) return 'var(--color-teal)';
  if (domains.includes('Mobile')) return 'var(--color-peach)';
  if (domains.includes('Systems & Backend')) return 'var(--md-sys-color-tertiary)';
  if (domains.includes('Full Stack & Web')) return 'var(--color-green)';
  return 'var(--md-sys-color-outline-variant)';
}
