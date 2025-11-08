"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Upload, Search, Loader2 } from "lucide-react"; // Thêm Search và Loader2
import { UploadJDDialog } from "@/components/job-descriptions/UploadJDDialog";
import { FindCandidateDialog } from "@/components/job-descriptions/FindCandidateDialog";

// ⚠️ Cập nhật Interface để khớp với dữ liệu từ API /api/scan-jd (get_processed_jd_data)
interface JobDescription {
  key: string; // Tương đương với id duy nhất
  jd_id: string; // Mã JD (Ví dụ: JD001)
  job_title: string; // Tên công việc (Tên JD)
  uploaded_by: string; // Người tải lên
  scanned_at: string; // Thời gian quét/Tải lên
}

export default function App() {
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Trạng thái Loading
  const [error, setError] = useState<string | null>(null); // Trạng thái Lỗi

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [selectedJD, setSelectedJD] = useState<JobDescription | null>(null);

  // --- 1. Tải Dữ liệu từ API ---
  useEffect(() => {
    const fetchJDs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Gọi API của FastAPI
        const response = await fetch("http://localhost:8000/api/scan-jd");

        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Status: ${response.status}`);
        }

        const data: JobDescription[] = await response.json();
        setJobDescriptions(data);

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu JD:", err);
        setError("Không thể kết nối đến Backend hoặc API bị lỗi.");
      } finally {
        setLoading(false);
      }
    };

    fetchJDs();
  }, []);

  // --- Các hàm xử lý ---

  // Hàm này cần được cập nhật để gọi API DELETE thực tế sau này
  const handleDelete = (id: string) => {
    // Logic xóa JD (tạm thời chỉ xóa trong state frontend)
    setJobDescriptions(jobDescriptions.filter((jd) => jd.jd_id !== id));
    console.log(`JD ${id} deleted.`);
  };

  // Hàm này cần được cập nhật để xử lý kết quả API POST upload
  const handleUploadSuccess = (fileName: string) => {
    // ⚠️ Trong ứng dụng thực tế, sau khi upload thành công, bạn nên gọi lại fetchJDs()
    // để làm mới danh sách từ backend, thay vì thêm mock data.
    alert(`File uploaded: ${fileName}. Please refresh to see the new JD.`);

    // Tạm thời, thêm một JD giả để minh họa (Sẽ bị mất khi refresh)
    const newJD: JobDescription = {
      key: `TEMP-${Date.now()}`,
      jd_id: `JD-${String(jobDescriptions.length + 1).padStart(3, "0")}`,
      job_title: fileName.replace(/\.(docx|pdf)$/i, ""),
      uploaded_by: "Current User",
      scanned_at: new Date().toISOString(),
    };
    setJobDescriptions([...jobDescriptions, newJD]);
  };

  const handleFindCandidate = (jd: JobDescription) => {
    setSelectedJD(jd);
    setCandidateDialogOpen(true);
  };

  const handleInterviewPractice = (jd: JobDescription) => {
    alert(`Starting interview practice for: ${jd.job_title}`);
  };

  // --- Hàm chuyển đổi ngày tháng ---
  const formatUploadDate = (dateString: string) => {
    try {
      // Lấy ngày tháng từ chuỗi ISO 8601
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Trả về chuỗi gốc nếu không hợp lệ
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };


  // --- Nội dung Render ---
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Job Descriptions</h1>
            <p className="text-gray-600">
              Manage and track all your job descriptions loaded from the backend.
            </p>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload New JD
          </Button>
        </div>

        {/* Hiển thị trạng thái Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-600">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Đang tải dữ liệu từ Backend...
          </div>
        )}

        {/* Hiển thị lỗi */}
        {error && (
          <div className="rounded-md border border-red-400 bg-red-50 p-4 text-red-700">
            <p className="font-semibold">Lỗi tải dữ liệu:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Bảng dữ liệu chính */}
        {!loading && !error && (
          <div className="rounded-lg bg-white shadow overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã JD</TableHead> {/* Thay đổi ID thành Mã JD */}
                  <TableHead>Tiêu đề Công việc</TableHead> {/* Thay đổi JD Name */}
                  <TableHead>Người tải lên</TableHead> {/* Thay đổi Who Uploaded */}
                  <TableHead>Thời gian quét</TableHead> {/* Thay đổi Upload Date */}
                  <TableHead className="text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobDescriptions.map((jd) => (
                  <TableRow key={jd.key}>
                    <TableCell className="font-medium">{jd.jd_id}</TableCell>
                    <TableCell>{jd.job_title}</TableCell>
                    <TableCell>{jd.uploaded_by}</TableCell>
                    <TableCell>
                      {formatUploadDate(jd.scanned_at)}
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
                          className="gap-1"
                        >
                          <Search className="h-4 w-4" />
                          Find Candidate
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(jd.jd_id)}
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
                Không có Mô tả Công việc nào được tải lên.
              </div>
            )}
          </div>
        )}
      </div>

      <UploadJDDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={handleUploadSuccess}
      />

      <FindCandidateDialog
        open={candidateDialogOpen}
        onOpenChange={setCandidateDialogOpen}
        jobDescription={selectedJD ? { jd_id: selectedJD.jd_id } : null}
      />
    </div>
  );
}