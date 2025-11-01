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
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  Row,
  ColumnDef,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const columns: ColumnDef<JobDescription, any>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        return <span>{row.original.id}</span>;
      },
    },
    {
      accessorKey: "name",
      header: "JD Name",
    },
    {
      accessorKey: "uploadBy",
      header: "Uploaded By",
      cell: ({ row }) => {
        // For demo purposes, we return a placeholder name
        return <span>Admin User</span>;
      },
    },
    {
      accessorKey: "uploadDate",
      header: "Upload Date",
      cell: ({ row }) => {
        const date = new Date(
          row.original.uploadDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3T"),
        );
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
    {
      id: "actions", // Use 'id' for a column that doesn't map to a data key
      header: "Actions",
      cell: ({ row }: { row: Row<JobDescription> }) => {
        // Get the original JobDescription object from the row
        const jd = row.original;

        // Return the button combo JSX here
        return (
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
        );
      },
    },
  ];

  useEffect(() => {
    const fetchJDs = async () => {
      const response = await fetch("http://127.0.0.1:8000/jd");
      const data = await response.json();
      console.log(data);
      setJobDescriptions(data.data);
    };
    fetchJDs();
  }, []);

  const table = useReactTable({
    data: jobDescriptions,
    getCoreRowModel: getCoreRowModel(),
    columns,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

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
        const filenameStarRegex = /filename\*=utf-8''([^;]+)/i;
        const matchesStar = filenameStarRegex.exec(disposition);

        if (matchesStar && matchesStar[1]) {
          filename = decodeURIComponent(matchesStar[1]);
        } else {
          const filenameRegex = /filename="?([^"]+)"?/;
          const matches = filenameRegex.exec(disposition);

          if (matches && matches[1]) {
            filename = matches[1];
          }
        }
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      document.body.appendChild(link);
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
        <div className="mb-4 w-full items-center gap-4 rounded-lg bg-white px-6 py-4 shadow">
          <Input
            placeholder="Filter by name..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="w-full"
          />
          <div className="pt-4 text-sm text-gray-500">
            <span>
              Show {table.getFilteredRowModel().rows.length} /{" "}
              {jobDescriptions.length} JDs
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-white shadow">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        // Use cn to merge classes
                        className={cn(header.id === "actions" && "text-center")}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-12 text-center text-gray-500"
                  >
                    No job descriptions uploaded yet. Click "Upload New JD" to
                    get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
