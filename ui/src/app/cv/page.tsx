"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Upload } from "lucide-react";
import { UploadJDDialog } from "@/components/job-descriptions/UploadJDDialog";
import { FindCandidateDialog } from "@/components/job-descriptions/FindCandidateDialog";

interface JobDescription {
  id: string;
  name: string;
  uploadedBy: string;
  uploadDate: string;
}

const mockJDs: JobDescription[] = [
  {
    id: "JD-001",
    name: "Senior Frontend Developer",
    uploadedBy: "Sarah Johnson",
    uploadDate: "2025-10-20",
  },
  {
    id: "JD-002",
    name: "Full Stack Engineer",
    uploadedBy: "Michael Chen",
    uploadDate: "2025-10-22",
  },
  {
    id: "JD-003",
    name: "Product Manager",
    uploadedBy: "Emily Davis",
    uploadDate: "2025-10-25",
  },
  {
    id: "JD-004",
    name: "UX Designer",
    uploadedBy: "Sarah Johnson",
    uploadDate: "2025-10-26",
  },
];

export default function App() {
  const [jobDescriptions, setJobDescriptions] =
    useState<JobDescription[]>(mockJDs);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [selectedJD, setSelectedJD] = useState<JobDescription | null>(null);

  const handleDelete = (id: string) => {
    setJobDescriptions(jobDescriptions.filter((jd) => jd.id !== id));
  };

  const handleUploadSuccess = (fileName: string) => {
    const newJD: JobDescription = {
      id: `JD-${String(jobDescriptions.length + 1).padStart(3, "0")}`,
      name: fileName.replace(/\.(docx|pdf)$/i, ""),
      uploadedBy: "Current User",
      uploadDate: new Date().toISOString().split("T")[0],
    };
    setJobDescriptions([...jobDescriptions, newJD]);
  };

  const handleFindCandidate = (jd: JobDescription) => {
    setSelectedJD(jd);
    setCandidateDialogOpen(true);
  };

  const handleInterviewPractice = (jd: JobDescription) => {
    alert(`Starting interview practice for: ${jd.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-gray-900">Job Descriptions</h1>
            <p className="text-gray-600">
              Manage and track all your job descriptions
            </p>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload New JD
          </Button>
        </div>

        <div className="rounded-lg bg-white shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>JD Name</TableHead>
                <TableHead>Who Uploaded</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobDescriptions.map((jd) => (
                <TableRow key={jd.id}>
                  <TableCell>{jd.id}</TableCell>
                  <TableCell>{jd.name}</TableCell>
                  <TableCell>{jd.uploadedBy}</TableCell>
                  <TableCell>
                    {new Date(jd.uploadDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInterviewPractice(jd)}
                      >
                        Interview Practice
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleFindCandidate(jd)}
                      >
                        Find Candidate
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(jd.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {jobDescriptions.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No job descriptions uploaded yet. Click "Upload New JD" to get
              started.
            </div>
          )}
        </div>
      </div>

      <UploadJDDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={handleUploadSuccess}
      />

      <FindCandidateDialog
        open={candidateDialogOpen}
        onOpenChange={setCandidateDialogOpen}
        jobDescription={selectedJD}
      />
    </div>
  );
}
