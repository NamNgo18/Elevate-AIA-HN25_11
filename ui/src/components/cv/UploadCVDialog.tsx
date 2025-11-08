import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, X } from "lucide-react";

interface UploadCVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: (fileName: string) => void;
}

export function UploadCVDialog({
  open,
  onOpenChange,
  onUploadSuccess,
}: UploadCVDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setUploadedFile(file);
      } else {
        alert("Please upload only PDF or DOCX files");
      }
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setUploadedFile(file);
      } else {
        alert("Please upload only PDF or DOCX files");
      }
    }
  };

  const handleUpload = async () => {
    setIsLoading(true);
    if (uploadedFile) {
      //upload file to backend
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch("http://127.0.0.1:8000/routes/cv", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        alert("Failed to upload file");
        return;
      }
      onUploadSuccess(uploadedFile.name);
      setUploadedFile(null);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setUploadedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload New CV</DialogTitle>
          <DialogDescription>
            Upload a cv document to start finding candidates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div
            className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploadedFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="text-left">
                  <p className="text-gray-900">{uploadedFile.name}</p>
                  <p className="text-gray-500">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedFile(null)}
                  className="ml-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="mb-2 text-gray-700">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-gray-500">Supports PDF and DOCX files</p>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileInput}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </>
            )}
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-3 text-blue-900">
              Best Practices for CV Scanning
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600">•</span>
                <span>Use clear and standard section headings.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600">•</span>
                <span>Save your CV as a PDF or DOCX file.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600">•</span>
                <span>Avoid using images, charts, or tables.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600">•</span>
                <span>Keep formatting simple for easy text extraction.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600">•</span>
                <span>Include relevant keywords from the job description.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-blue-600">•</span>
                <span>
                  Avoid images or complex layouts for better text extraction
                </span>
              </li>
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadedFile || isLoading}
            >
              {isLoading ? "Uploading..." : "Upload CV"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
