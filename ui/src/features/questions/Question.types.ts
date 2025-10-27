export interface Question {
  id: number;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  tips: string[];
}

export const questions: Question[] = [
  // Behavioral Questions
  {
    id: 1,
    category: "Behavioral",
    difficulty: "Medium",
    question:
      "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
    tips: [
      "Use the STAR method (Situation, Task, Action, Result)",
      "Focus on your actions and communication skills",
      "Show empathy and professionalism",
    ],
  },
  {
    id: 2,
    category: "Behavioral",
    difficulty: "Medium",
    question:
      "Describe a situation where you had to meet a tight deadline. What did you do?",
    tips: [
      "Highlight your time management skills",
      "Explain how you prioritized tasks",
      "Mention any collaboration or delegation",
    ],
  },
  {
    id: 3,
    category: "Behavioral",
    difficulty: "Hard",
    question:
      "Tell me about a time when you failed. What did you learn from it?",
    tips: [
      "Be honest and show self-awareness",
      "Focus on the learning and growth",
      "Explain how you applied those lessons",
    ],
  },
  {
    id: 4,
    category: "Behavioral",
    difficulty: "Easy",
    question: "Why do you want to work for our company?",
    tips: [
      "Research the company beforehand",
      "Align your values with the company's mission",
      "Be specific about what excites you",
    ],
  },

  // Technical Questions
  {
    id: 5,
    category: "Technical",
    difficulty: "Easy",
    question:
      "What is the difference between var, let, and const in JavaScript?",
    tips: [
      "Explain scope differences",
      "Discuss hoisting behavior",
      "Mention when to use each",
    ],
  },
  {
    id: 6,
    category: "Technical",
    difficulty: "Medium",
    question: "Explain the concept of closures in JavaScript with an example.",
    tips: [
      "Define what a closure is",
      "Provide a practical code example",
      "Explain use cases",
    ],
  },
  {
    id: 7,
    category: "Technical",
    difficulty: "Hard",
    question: "How would you optimize the performance of a React application?",
    tips: [
      "Mention React.memo and useMemo",
      "Discuss code splitting and lazy loading",
      "Talk about profiling tools",
    ],
  },
  {
    id: 8,
    category: "Technical",
    difficulty: "Medium",
    question:
      "What is the difference between SQL and NoSQL databases? When would you use each?",
    tips: [
      "Compare structure and flexibility",
      "Discuss scalability differences",
      "Provide real-world use cases",
    ],
  },

  // Problem Solving
  {
    id: 9,
    category: "Problem Solving",
    difficulty: "Medium",
    question: "How would you design a URL shortener like bit.ly?",
    tips: [
      "Start with requirements gathering",
      "Discuss database schema",
      "Consider scalability and collision handling",
    ],
  },
  {
    id: 10,
    category: "Problem Solving",
    difficulty: "Hard",
    question: "Design a rate limiter for an API.",
    tips: [
      "Discuss different algorithms (token bucket, leaky bucket)",
      "Consider distributed systems",
      "Talk about storage and performance",
    ],
  },
  {
    id: 11,
    category: "Problem Solving",
    difficulty: "Easy",
    question:
      "How would you reverse a string in your preferred programming language?",
    tips: [
      "Think about different approaches",
      "Consider time and space complexity",
      "Mention edge cases",
    ],
  },

  // Leadership
  {
    id: 12,
    category: "Leadership",
    difficulty: "Medium",
    question:
      "Describe your leadership style and give an example of when you demonstrated it.",
    tips: [
      "Be authentic about your approach",
      "Provide a specific example",
      "Show adaptability",
    ],
  },
  {
    id: 13,
    category: "Leadership",
    difficulty: "Hard",
    question: "How do you handle conflicts within your team?",
    tips: [
      "Show emotional intelligence",
      "Explain your conflict resolution process",
      "Focus on finding win-win solutions",
    ],
  },

  // Communication
  {
    id: 14,
    category: "Communication",
    difficulty: "Medium",
    question:
      "Explain a complex technical concept to someone without a technical background.",
    tips: [
      "Use analogies and simple language",
      "Avoid jargon",
      "Check for understanding",
    ],
  },
  {
    id: 15,
    category: "Communication",
    difficulty: "Easy",
    question: "How do you prefer to receive feedback?",
    tips: [
      "Show you're open to growth",
      "Mention specific preferences",
      "Give an example of acting on feedback",
    ],
  },
];

export const categories = Array.from(new Set(questions.map((q) => q.category)));
