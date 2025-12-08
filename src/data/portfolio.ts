export const keywords = [
  "Game Development",
  "Systems Programming",
  "Cloud & Infrastructure",
  "Machine Learning",
  "Backend Development",
  "Frontend Development",
  "Data Engineering",
  "IoT",
  "GenAI / LLM",
] as const;

export type Keyword = typeof keywords[number];

export interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  location: string;
  type: string;
  description: string[];
  keywords: Keyword[];
}

export interface Project {
  id: string;
  title: string;
  description: string[];
  technologies: string[];
  keywords: Keyword[];
}

export const experiences: Experience[] = [
  {
    id: "sit-ra",
    title: "Research Assistant",
    company: "Singapore Institute of Technology",
    period: "APR 2025 — JUL 2025",
    location: "Singapore",
    type: "Part-time, Remote",
    description: [
      "Contributed to a multidisciplinary research project on digital wellness and video gaming overuse in Singapore, focusing on core game development.",
      "Designed and implemented immersive, multiplayer-ready gameplay systems in Unity, supporting real-time interaction via avatars and audio.",
    ],
    keywords: ["Game Development", "Backend Development"],
  },
  {
    id: "razer",
    title: "Software Engineering Intern",
    company: "Razer",
    period: "APR 2022 — SEP 2022",
    location: "Singapore",
    type: "Full-time, Hybrid",
    description: [
      "Boosted system performance and enhanced scalability by collaborating with cross-functional teams to architect and implement key software structural improvements.",
      "Optimised core UI components for Razer Synapse 4, reducing interface load times by 15% based on performance testing.",
    ],
    keywords: ["Backend Development", "Frontend Development"],
  },
];

export const projects: Project[] = [
  {
    id: "microsd-driver",
    title: "MicroSD Filesystem Driver",
    description: [
      "Developed a comprehensive exFAT filesystem driver for the Raspberry Pi Pico W using SPI communication.",
      "Implemented core features including full read/write access and robust error handling for reliable data storage in IoT applications.",
    ],
    technologies: ["C", "Raspberry Pi Pico W", "SPI", "exFAT"],
    keywords: ["Systems Programming", "IoT"],
  },
  {
    id: "zensupply",
    title: "ZenSupply",
    description: [
      "Developed a full ML pipeline (Python, Scikit-learn) for accurate demand prediction and optimised restock logic.",
      "Integrated Azure OpenAI and Google's Gemini for enhanced inventory insights, providing hands-on experience with GenAI capabilities and LLM-driven applications.",
    ],
    technologies: ["Python", "Scikit-learn", "Azure OpenAI", "Google Gemini"],
    keywords: ["Machine Learning", "Data Engineering", "GenAI / LLM", "Cloud & Infrastructure"],
  },
  {
    id: "air-power",
    title: "Air Power Domination",
    description: [
      "Led the design and development, architecting core gameplay systems demonstrating the ability to design and build high-concurrency applications.",
      "Provided technical leadership and project oversight, completing tasks promptly and communicating complex design decisions.",
    ],
    technologies: ["Unity", "C#"],
    keywords: ["Game Development"],
  },
  {
    id: "omagatoki",
    title: "Omagatoki",
    description: [
      "Led development, architecting complex gameplay features including a dynamic roadblock system.",
      "Provided technical leadership and project oversight, ensuring the project's features were well-tested and maintainable.",
    ],
    technologies: ["Unity", "C#"],
    keywords: ["Game Development"],
  },
];

export const skills = {
  "Cloud & Infrastructure": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform"],
  "Data Engineering & Analytics": ["Python", "Pandas", "Scikit-learn", "SQL", "MySQL", "ETL Pipelines"],
  "Software Engineering": ["Clean Architecture", "Pytest", "Performance Optimisation", "Scalable System Design"],
  "Game Development": ["Unity", "C#", "Multiplayer Systems"],
};

export const education = [
  {
    degree: "Bachelor of Science with Honours in Computing Science",
    school: "Singapore Institute of Technology",
    period: "SEP 2024 — APR 2027",
  },
  {
    degree: "Diploma with Merit in Games Design & Development",
    school: "Singapore Polytechnic",
    period: "MAR 2019 — APR 2022",
  },
];

export const contact = {
  email: "pohaoting@gmail.com",
  phone: "+65 9820 0498",
  linkedin: "https://linkedin.com/in/po-haoting",
  github: "https://github.com/hoshinoht",
};
