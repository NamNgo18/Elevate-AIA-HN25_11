import { InterviewResult } from "@/components/interview-result/InterviewResult";
import { useInterviewResult } from "@/features/interview-result/useInterviewResult";

function InterviewResultPage() {
  // Mock interview data
  const interviewData = {
    candidate: {
      name: "Sarah Johnson",
      email_address: "sarah.johnson@email.com",
      contact_phone: "+1 (555) 123-4567",
      target_position: "Senior Frontend Developer",
    },
    interviewResult: {
      passed: true,
      overall_score: 90,
      technical_skill: 85,
      problem_solving: 86,
      communication: 87,
      experience: 89,
      pros: [
        "Excellent understanding of React and modern frontend frameworks",
        "Strong problem-solving abilities with clear thought process",
        "Great communication skills and ability to explain complex concepts",
        "Demonstrated enthusiasm for learning new technologies",
        "Solid grasp of software design patterns and best practices",
      ],
      cons: [
        "Limited experience with backend technologies",
        "Could improve knowledge of automated testing strategies",
        "Less familiar with CI/CD pipelines and DevOps practices",
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <InterviewResult {...interviewData} />
    </div>
  );
}

export default InterviewResultPage;
