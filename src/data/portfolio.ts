export const keywords = [
  "Game Development",
  "Systems Programming",
  "Cloud & Infrastructure",
  "Backend Development",
  "Frontend Development",
  "Quality Assurance",
] as const;

export type Keyword = (typeof keywords)[number];

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
  github?: string;
}

export const experiences: Experience[] = [
  {
    id: "sit-la",
    title: "Lab Assistant - Discrete Mathematics",
    company: "Singapore Institute of Technology",
    period: "SEP 2025 — Present",
    location: "Singapore",
    type: "Part-time",
    description: [
      "Assist students with discrete mathematics concepts and problem-solving during lab sessions.",
      "Support academic staff in delivering course materials and managing lab activities.",
    ],
    keywords: ["Backend Development"],
  },
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
    id: "razer-swe",
    title: "Software Engineer",
    company: "Razer Inc.",
    period: "APR 2022 — SEP 2022",
    location: "Singapore",
    type: "Full-time, Hybrid",
    description: [
      "Contributed to the development of Razer Synapse 4 as a Front-End Developer, implementing and debugging UI components to enhance user experience.",
      "Worked closely with cross-functional teams, ensuring seamless integration with Razer's ecosystem and maintaining brand consistency.",
      "Optimized JavaScript and TypeScript code for improved performance and responsiveness in the software.",
    ],
    keywords: ["Backend Development", "Frontend Development", "Systems Programming"],
  },
  {
    id: "razer-qa",
    title: "Quality Assurance Engineer",
    company: "Razer Inc.",
    period: "MAR 2021 — SEP 2021",
    location: "Singapore",
    type: "Full-time",
    description: [
      "Conducted software testing for Razer Synapse 4, identifying and reporting critical issues to enhance product stability.",
      "Developed Python-based automation tools to streamline testing processes, improving test coverage and reducing manual testing efforts.",
      "Collaborated with developers to troubleshoot and resolve software bugs before deployment.",
    ],
    keywords: ["Quality Assurance", "Backend Development"],
  },
  {
    id: "wishbone",
    title: "Full Stack Engineer",
    company: "Wishbone Digital Group",
    period: "JAN 2019 — MAR 2019",
    location: "Central Singapore",
    type: "Full-time",
    description: [
      "Worked with clients to develop custom web application solutions, ensuring functionality and responsiveness.",
      "Designed and implemented both front-end and back-end features using PHP and JavaScript.",
      "Provided maintenance and enhancements to existing web applications, improving efficiency and user experience.",
    ],
    keywords: ["Frontend Development", "Backend Development", "Cloud & Infrastructure"],
  },
];

export const projects: Project[] = [
  {
    id: "mqttsn-picow",
    title: "MQTT-SN Client for the Pico W",
    description: [
      "A complete IoT file transfer system featuring Raspberry Pi Pico W devices running FreeRTOS, communicating via MQTT-SN protocol.",
      "Built a real-time web dashboard for monitoring and control of connected IoT devices.",
    ],
    technologies: ["C", "FreeRTOS", "MQTT-SN", "Raspberry Pi Pico W", "Web Dashboard"],
    keywords: ["Systems Programming", "Backend Development"],
    github: "https://github.com/hoshinoht/mqttsn-picow",
  },
  {
    id: "microsd-driver",
    title: "MicroSD Filesystem Driver",
    description: [
      "Developed a comprehensive exFAT filesystem driver for the Raspberry Pi Pico W using SPI communication.",
      "Implemented core features including full read/write access and robust error handling for reliable data storage in IoT applications.",
    ],
    technologies: ["C", "Raspberry Pi Pico W", "SPI", "exFAT"],
    keywords: ["Systems Programming"],
  },
  {
    id: "zensupply",
    title: "ZenSupply",
    description: [
      "Developed a full ML pipeline (Python, Scikit-learn) for accurate demand prediction and optimised restock logic.",
      "Integrated Azure OpenAI and Google's Gemini for enhanced inventory insights, providing hands-on experience with GenAI capabilities and LLM-driven applications.",
    ],
    technologies: ["Python", "Scikit-learn", "Azure OpenAI", "Google Gemini"],
    keywords: ["Cloud & Infrastructure", "Backend Development"],
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

export interface SkillCategory {
  name: string;
  skills: string[];
  keywords: Keyword[];
}

export const skillCategories: SkillCategory[] = [
  {
    name: "Cloud & Infrastructure",
    skills: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform"],
    keywords: ["Cloud & Infrastructure", "Backend Development"],
  },
  {
    name: "Software Engineering",
    skills: ["Clean Architecture", "Pytest", "Performance Optimisation", "Scalable System Design", "Python", "SQL"],
    keywords: ["Backend Development", "Frontend Development", "Quality Assurance"],
  },
  {
    name: "Game Development",
    skills: ["Unity", "C#", "Multiplayer Systems"],
    keywords: ["Game Development"],
  },
  {
    name: "Systems & Embedded",
    skills: ["C", "FreeRTOS", "SPI", "MQTT-SN", "Raspberry Pi Pico W"],
    keywords: ["Systems Programming"],
  },
];

export const education = [
  {
    degree: "Bachelor of Science (Honours) in Computing Science",
    school: "Singapore Institute of Technology / University of Glasgow",
    period: "SEP 2024 — APR 2027",
  },
  {
    degree: "Diploma with Merit in Games Design & Development",
    school: "Singapore Polytechnic",
    period: "MAR 2019 — APR 2022",
  },
  {
    degree: "National ITE Certificate (Nitec) with Merit in Social Media & Web Development",
    school: "Institute of Technical Education",
    period: "2017 — 2018",
  },
];

export const certifications = [
  "Kubernetes Fundamentals",
  "AWS Academy Graduate - Cloud Architecting",
  "Docker Fundamentals",
  "AWS Academy Graduate - Cloud Foundations",
];

export const languages = [
  { language: "English", proficiency: "Native" },
  { language: "Chinese", proficiency: "Limited Working" },
];

export const topSkills = ["C (Programming Language)", "Amazon Web Services (AWS)", "Distributed Computing"];

export const bio = `I'm a Computing Science student at the Singapore Institute of Technology (SIT), passionate about building innovative solutions that bridge technology and creativity. My core interests lie at the intersection of Software Engineering, Cloud Computing, Game Development, and Artificial Intelligence (AI).

Diverse experiences have shaped my journey in tech: from enhancing user interfaces and software performance as an intern at Razer to ensuring seamless IT operations in the Singapore Army. These roles have deepened my expertise in full-stack development, system troubleshooting, and software testing, while strengthening my ability to adapt, collaborate, and think critically.

I am always experimenting with new ideas and emerging trends. I have a strong interest in cloud-native technologies and distributed systems, with hands-on experience with Amazon Web Services (AWS) and containerization tools such as Docker and Kubernetes.`;

export const contact = {
  email: "pohaoting@gmail.com",
  phone: "+65 9820 0498",
  linkedin: "https://linkedin.com/in/po-haoting",
  github: "https://github.com/hoshinoht",
  location: "Singapore, Singapore",
};
