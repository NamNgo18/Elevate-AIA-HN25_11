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
import { Eye, Trash2 } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ErrorDisplay, TableLoadingSkeleton } from "@/components/shared";
import { useLanguage } from "@/contexts/LanguageContext";

interface InterviewReport {
   id: string;
   name: string;
   candidate_name: string;
   position: string;
   uploadDate: string;
}

interface PageState {
   data: InterviewReport[];
   isLoading: boolean;
   error: string | null;
}

export default function InterviewReportsPage() {
   const { t } = useLanguage();
   const [state, setState] = useState<PageState>({
      data: [],
      isLoading: true,
      error: null,
   });
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
   const [isDeleting, setIsDeleting] = useState<string | null>(null);
   const router = useRouter();

   const fetchReports = useCallback(async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
         const response = await fetch(getApiUrl("routes/report/list"));

         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }

         const data = await response.json();

         if (!data?.data) {
            throw new Error("Invalid response format from server");
         }

         setState({ data: data.data, isLoading: false, error: null });
      } catch (err: any) {
         const errorMessage = err?.message || t("error");
         setState({ data: [], isLoading: false, error: errorMessage });
         toast.error(`${t("error")}: ${errorMessage}`);
      }
   }, [t]);

   useEffect(() => {
      fetchReports();
   }, [fetchReports]);

   const handleDelete = async (id: string) => {
      if (!confirm(t("deleteReportConfirm"))) {
         return;
      }

      setIsDeleting(id);

      try {
         const response = await fetch(getApiUrl(`routes/report/${id}`), {
            method: "DELETE",
         });

         if (!response.ok) {
            throw new Error(`Failed to delete: ${response.status}`);
         }

         setState((prev) => ({
            ...prev,
            data: prev.data.filter((report) => report.id !== id),
         }));
         toast.success(t("reportDeleted"));
      } catch (err: any) {
         toast.error(`${t("failedToDeleteReport")}: ${err.message}`);
      } finally {
         setIsDeleting(null);
      }
   };

   const columns: ColumnDef<InterviewReport, any>[] = [
      {
         accessorKey: "candidate_name",
         header: t("name"),
      },
      {
         accessorKey: "position",
         header: t("jobTitle"),
      },
      {
         accessorKey: "uploadDate",
         header: t("date"),
         cell: ({ row }) => {
            try {
               const dateStr = row.original.uploadDate;
               const formattedDate = dateStr.replace(/(\d{4})(\d{2})(\d{2})(\d{2}):(\d{2}):(\d{2})/, "$1-$2-$3 $4:$5:$6");
               return <span>{formattedDate}</span>;
            } catch {
               return <span>{row.original.uploadDate}</span>;
            }
         },
      },
      {
         id: "actions",
         header: t("actions"),
         cell: ({ row }: { row: Row<InterviewReport> }) => {
            const report = row.original;
            const isCurrentlyDeleting = isDeleting === report.id;
            return (
               <div className="flex justify-center gap-2">
                  <Button
                     variant="secondary"
                     size="sm"
                     onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/interview-results?session_id=${report.id}`);
                     }}
                     className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0 text-white shadow-md shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 hover:scale-105"
                  >
                     <Eye className="mr-2 h-4 w-4" />
                     {t("viewResult")}
                  </Button>
                  <Button
                     variant="destructive"
                     size="sm"
                     onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(report.id);
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
      state: {
         columnFilters,
      },
   });

   if (state.error && !state.isLoading && state.data.length === 0) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8">
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-800/15 via-transparent to-transparent pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-800/15 via-transparent to-transparent pointer-events-none" />

            <div className="relative mx-auto max-w-7xl">
               <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-8">
                  {t("interviewReports")}
               </h1>
               <ErrorDisplay message={state.error} onRetry={fetchReports} />
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8">
         <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-800/15 via-transparent to-transparent pointer-events-none" />
         <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-800/15 via-transparent to-transparent pointer-events-none" />

         <div className="relative mx-auto max-w-7xl">
            {/* Header Section */}
            <div className="mb-8">
               <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  {t("interviewReports")}
               </h1>
               <p className="text-slate-300 text-lg mt-2">
                  {t("assessmentReport")}
               </p>
            </div>

            {/* Filter Section */}
            <div className="mb-6 w-full rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-5 shadow-2xl">
               <Input
                  placeholder={t("filterByName")}
                  value={(table.getColumn("candidate_name")?.getFilterValue() as string) ?? ""}
                  onChange={(event) =>
                     table.getColumn("candidate_name")?.setFilterValue(event.target.value)
                  }
                  className="w-full bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400/50 transition-all duration-200"
               />
            </div>

            {/* Table Section */}
            <div className="rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl overflow-hidden">
               {state.isLoading ? (
                  <TableLoadingSkeleton rows={5} />
               ) : (
                  <Table>
                     <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                           <TableRow key={headerGroup.id} className="border-b border-white/10 hover:bg-white/5">
                              {headerGroup.headers.map((header) => (
                                 <TableHead
                                    key={header.id}
                                    className={cn(
                                       "text-purple-300 font-semibold text-sm uppercase tracking-wider",
                                       header.id === "actions" && "text-center"
                                    )}
                                 >
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                 </TableHead>
                              ))}
                           </TableRow>
                        ))}
                     </TableHeader>
                     <TableBody>
                        {table.getRowModel().rows?.length ? (
                           table.getRowModel().rows.map((row, idx) => (
                              <TableRow
                                 key={row.id}
                                 className="border-b border-white/5 hover:bg-white/10 transition-all duration-200 group cursor-pointer"
                                 style={{ animation: `fadeIn 0.3s ease-out ${idx * 0.1}s both` }}
                                 onClick={() => router.push(`/interview-results?session_id=${row.original.id}`)}
                              >
                                 {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="text-slate-200">
                                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                 ))}
                              </TableRow>
                           ))
                        ) : (
                           <TableRow>
                              <TableCell colSpan={columns.length} className="py-16 text-center text-slate-400">
                                 No reports found.
                              </TableCell>
                           </TableRow>
                        )}
                     </TableBody>
                  </Table>
               )}
            </div>
         </div>
         <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      </div>
   );
}
