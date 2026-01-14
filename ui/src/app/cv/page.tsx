"use client";

import { useEffect, useState, useCallback } from "react";
import { getApiUrl } from "@/lib/api";
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
import { UploadCVDialog } from "@/components/cv/UploadCVDialog";
import { CVOverviewDialog } from "@/components/cv/CVOverviewDialog";
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
import { toast } from "sonner";
import { ErrorDisplay, TableLoadingSkeleton } from "@/components/shared";

interface CV {
  id: string;
  name: string;
  uploadBy: string;
  uploadDate: string;
}

interface PageState {
  data: CV[];
  isLoading: boolean;
  error: string | null;
}

import { useLanguage } from "@/contexts/LanguageContext";

export default function CVPage() {
  const { t } = useLanguage();
  const [state, setState] = useState<PageState>({
    data: [],
    isLoading: true,
    error: null,
  });
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Fetch CVs with error handling
  const fetchCVs = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(getApiUrl("routes/cv"));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data?.data) {
        throw new Error("Invalid response format from server");
      }

      setState({ data: data.data, isLoading: false, error: null });
    } catch (err: any) {
      const errorMessage =
        err?.message || t("failedToDownload"); // Fallback to a translation key
      setState({ data: [], isLoading: false, error: errorMessage });
      toast.error(`${t("error")}: ${errorMessage}`);
    }
  }, [t]);

  useEffect(() => {
    fetchCVs();
  }, [fetchCVs]);

  const columns: ColumnDef<CV, any>[] = [
    {
      accessorKey: "id",
      header: t("id"),
      cell: ({ row }) => {
        return <span>{row.original.id}</span>;
      },
    },
    {
      accessorKey: "name",
      header: t("cvName"),
    },
    {
      accessorKey: "uploadBy",
      header: t("uploadedBy"),
    },
    {
      accessorKey: "uploadDate",
      header: t("uploadDate"),
      cell: ({ row }) => {
        try {
          const date = new Date(
            row.original.uploadDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3T")
          );
          return <span>{date.toLocaleDateString()}</span>;
        } catch {
          return <span>{row.original.uploadDate}</span>;
        }
      },
    },
    {
      id: "actions",
      header: t("actions"),
      cell: ({ row }: { row: Row<CV> }) => {
        const cv = row.original;
        const isCurrentlyDeleting = isDeleting === cv.id;
        const isCurrentlyDownloading = isDownloading === cv.id;

        return (
          <div className="flex justify-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(cv.id);
              }}
              disabled={isCurrentlyDeleting}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 shadow-md shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              {isCurrentlyDeleting ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(cv.id);
              }}
              disabled={isCurrentlyDownloading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0 text-white shadow-md shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              {isCurrentlyDownloading ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: state.data,
    getCoreRowModel: getCoreRowModel(),
    columns,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      rowSelection,
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteCVConfirm"))) {
      return;
    }

    setIsDeleting(id);

    try {
      const response = await fetch(getApiUrl(`routes/cv/${id}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.status}`);
      }

      setState((prev) => ({
        ...prev,
        data: prev.data.filter((cv) => cv.id !== id),
      }));
      toast.success(t("cvDeleted"));
    } catch (err: any) {
      toast.error(`${t("failedToDeleteCV")}: ${err.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownload = async (id: string) => {
    setIsDownloading(id);

    try {
      const response = await fetch(getApiUrl(`routes/cv/${id}`), {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`);
      }

      const disposition = response.headers.get("Content-Disposition") || "";
      let filename = `${id}.bin`;

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
      window.URL.revokeObjectURL(url);

      toast.success(t("downloadStarted"));
    } catch (err: any) {
      toast.error(`${t("failedToDownload")}: ${err.message}`);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleUploadSuccess = () => {
    fetchCVs();
    toast.success(t("success"));
  };

  const handleRowClick = (cv: CV) => {
    setSelectedCV(cv);
    setPreviewDialogOpen(true);
  };

  // Render error state
  if (state.error && !state.isLoading && state.data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-800/15 via-transparent to-transparent pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-800/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {t("cvsTitle")}
            </h1>
          </div>
          <ErrorDisplay message={state.error} onRetry={fetchCVs} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8">
      {/* Animated background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-800/15 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-800/15 via-transparent to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              {t("cvsTitle")}
            </h1>
            <p className="text-slate-300 text-lg">
              {t("cvsSubtitle")}
            </p>
          </div>
          <div className="flex gap-x-4">
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg shadow-purple-500/50 transition-all duration-300 hover:shadow-purple-500/70 hover:scale-105"
            >
              <Upload className="h-4 w-4" />
              {t("uploadNewCV")}
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6 w-full rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-5 shadow-2xl">
          <Input
            placeholder={t("filterByName")}
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="w-full bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400/50 transition-all duration-200"
          />
          <div className="pt-4 text-sm text-slate-300 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span>
              Show{" "}
              <span className="font-semibold text-purple-400">
                {table.getFilteredRowModel().rows.length}
              </span>{" "}
              /{" "}
              <span className="font-semibold text-blue-400">
                {state.data.length}
              </span>{" "}
              {t("cvsTitle")}
            </span>
          </div>
        </div>

        {/* Table Section with Glassmorphism */}
        <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl overflow-hidden">
          {state.isLoading ? (
            <TableLoadingSkeleton rows={5} />
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "text-purple-300 font-semibold text-sm uppercase tracking-wider",
                            header.id === "actions" && "text-center"
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, idx) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() => handleRowClick(row.original)}
                      className="border-b border-white/5 hover:bg-white/10 transition-all duration-200 group cursor-pointer"
                      style={{
                        animation: `fadeIn 0.3s ease-out ${idx * 0.1}s both`,
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-slate-200">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                          <Upload className="h-8 w-8 text-purple-400" />
                        </div>
                        <p className="text-slate-300 text-lg">
                          {t("noCVs")}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <UploadCVDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={handleUploadSuccess}
      />

      <CVOverviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        cvId={selectedCV?.id || null}
        cvName={selectedCV?.name || ""}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
