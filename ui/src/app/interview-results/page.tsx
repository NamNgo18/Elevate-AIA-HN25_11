import { InterviewResult } from "@/components/interview-result/InterviewResult";

function App() {
  // Mock interview data
  const interviewData = {
    interviewee: {
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      position: "Senior Frontend Developer",
    },
    overallScore: 85,
    passed: true,
    detailedScores: {
      technicalSkills: 90,
      problemSolving: 85,
      communicationSkill: 88,
      practicalExperience: 82,
      enthusiasmAttitude: 92,
    },
    strengths: [
      "Excellent understanding of React and modern frontend frameworks",
      "Strong problem-solving abilities with clear thought process",
      "Great communication skills and ability to explain complex concepts",
      "Demonstrated enthusiasm for learning new technologies",
      "Solid grasp of software design patterns and best practices",
    ],
    weaknesses: [
      "Limited experience with backend technologies",
      "Could improve knowledge of automated testing strategies",
      "Less familiar with CI/CD pipelines and DevOps practices",
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <InterviewResult {...interviewData} />
    </div>
  );
}

export default App;
