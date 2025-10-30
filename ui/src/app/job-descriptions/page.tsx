"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Trash2, Upload } from "lucide-react";
import { UploadJDDialog } from "@/components/job-descriptions/UploadJDDialog";
import { FindCandidateDialog } from "@/components/job-descriptions/FindCandidateDialog";

interface JobDescription {
  id: string;
  name: string;
  uploadDate: string;
}

export default function App() {
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [selectedJD, setSelectedJD] = useState<JobDescription | null>(null);

  useEffect(() => {
    const fetchJDs = async () => {
      const response = await fetch("http://127.0.0.1:8000/jd");
      const data = await response.json();
      console.log(data);
      setJobDescriptions(data.data);
    };
    fetchJDs();
  }, []);

  const handleDelete = (id: string) => {
    //handle delete in backend
    const deleteJD = async () => {
      await fetch(`http://127.0.0.1:8000/jd/${id}`, {
        method: "DELETE",
      });
    };
    deleteJD();
    setJobDescriptions(jobDescriptions.filter((jd) => jd.id !== id));
  };

  const handleDownload = (id: string) => {
    //handle delete in backend
    const downloadJD = async () => {
      debugger;
      const response = await fetch(`http://127.0.0.1:8000/jd/${id}`, {
        method: "GET",
      });
      const filenameRegex = /filename="?([^"]+)"?/;
      const disposition = response.headers.get("Content-Disposition") || "";
      let filename = `${id}.bin`; // A default fallback filename

      if (disposition) {
        // --- New Logic Start ---

        // 1. Try the new RFC 5987 format (filename*=)
        // Example: filename*=utf-8''Job%20Description.docx
        const filenameStarRegex = /filename\*=utf-8''([^;]+)/i;
        const matchesStar = filenameStarRegex.exec(disposition);

        if (matchesStar && matchesStar[1]) {
          // We found it! Decode the URL-encoded string
          filename = decodeURIComponent(matchesStar[1]);
        } else {
          // 2. Fallback to the old RFC 2183 format (filename=)
          // Example: filename="Job Description.docx"
          const filenameRegex = /filename="?([^"]+)"?/;
          const matches = filenameRegex.exec(disposition);

          if (matches && matches[1]) {
            filename = matches[1];
          }
        }
        // --- New Logic End ---
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      document.body.appendChild(link);
      //download file with the original name can be docx or pdf
      link.setAttribute("download", filename);
      link.click();
      link.parentNode?.removeChild(link);
    };
    downloadJD();
  };

  const handleUploadSuccess = (fileName: string) => {
    const fetchJDs = async () => {
      const response = await fetch("http://127.0.0.1:8000/jd");
      const data = await response.json();
      console.log(data);
      setJobDescriptions(data.data);
    };
    fetchJDs();
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
                <TableHead>Upload Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobDescriptions.map((jd) => (
                <TableRow key={jd.id}>
                  <TableCell>{jd.id.substring(0, 8) + "..."}</TableCell>
                  <TableCell>{jd.name}</TableCell>
                  <TableCell suppressHydrationWarning>
                    {new Date(
                      jd.uploadDate.replace(
                        /(\d{4})(\d{2})(\d{2})/,
                        "$1-$2-$3T",
                      ),
                    ).toLocaleString()}
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
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownload(jd.id)}
                      >
                        <Download className="h-4 w-4" />
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
