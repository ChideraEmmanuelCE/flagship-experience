export type Chapter = {
  id: string;
  stage: string;
  title: string;
  subtitle: string;
  environment: "void" | "workshop" | "lab" | "warroom" | "city" | "orbit" | "future";
};

export const CHAPTERS: Chapter[] = [
  {
    id: "curiosity",
    stage: "Curiosity",
    title: "The question that refuses to leave",
    subtitle: "Everything begins with a quiet itch. A pattern only you notice.",
    environment: "void",
  },
  {
    id: "obsession",
    stage: "Obsession",
    title: "When the idea starts owning you",
    subtitle: "Nights blur. Notes multiply. The outside world grows quiet.",
    environment: "workshop",
  },
  {
    id: "building",
    stage: "Building",
    title: "Hands in the machine",
    subtitle: "Code, prototypes, late commits. The first fragile shape of something real.",
    environment: "lab",
  },
  {
    id: "failure",
    stage: "Failure",
    title: "The necessary collapse",
    subtitle: "What breaks teaches more than what works. This is the price of clarity.",
    environment: "warroom",
  },
  {
    id: "breakthrough",
    stage: "Breakthrough",
    title: "The moment the pieces lock",
    subtitle: "Suddenly the system breathes. Thought becomes force.",
    environment: "city",
  },
  {
    id: "impact",
    stage: "Impact",
    title: "The world starts moving with you",
    subtitle: "Others feel the pull. The idea leaves the room and enters the culture.",
    environment: "orbit",
  },
  {
    id: "future",
    stage: "Future",
    title: "This is only the first frame",
    subtitle: "You were never building a product. You were building the next version of yourself.",
    environment: "future",
  },
];
