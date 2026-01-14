import { getApiUrl } from "@/lib/api";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Briefcase, DollarSign, MapPin, Users, TrendingUp, Award } from "lucide-react";
import { useEffect, useState } from "react";

interface JDData {
   jobTitle?: string;
   level?: string;
   department?: string;
   location?: string;
   jobType?: string;
   summary?: string;
   responsibilities?: string[];
   benefits?: string[];
   salaryRange?: {
      min?: number;
      max?: number;
      currency?: string;
      text?: string;
   };
   experience?: {
      min_years?: number;
      max_years?: number;
      description?: string;
   };
   skills?: Array<{
      name: string;
      type: string;
      level: string;
      weight?: number;
   }>;
   education?: Array<{
      degree?: string;
      major?: string;
      level?: string;
   }>;
   certifications?: Array<{
      name: string;
      level?: string;
   }>;
   keywords?: string[];
}

interface JDOverviewDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   jdId: string | null;
   jdName: string;
}

import { useLanguage } from "@/contexts/LanguageContext";

export function JDOverviewDialog({
   open,
   onOpenChange,
   jdId,
   jdName,
}: JDOverviewDialogProps) {
   const { t } = useLanguage();
   const [jdData, setJDData] = useState<JDData | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      if (open && jdId) {
         fetchJDAnalysis();
      }
   }, [open, jdId]);

   const fetchJDAnalysis = async () => {
      if (!jdId) return;

      setIsLoading(true);
      setError(null);

      try {
         const response = await fetch(getApiUrl(`routes/jd/${jdId}/analysis`), {
            method: "GET",
         });

         if (!response.ok) {
            throw new Error(t("error") || "Failed to fetch JD analysis");
         }

         const data = await response.json();

         // Map the JD_SCHEMA structure to our display format
         const mappedData: JDData = {
            jobTitle: data.basic_info?.job_title || t("notProvided"),
            level: data.basic_info?.level || t("notProvided"),
            department: data.basic_info?.department || t("notProvided"),
            location: data.basic_info?.location || t("notProvided"),
            jobType: data.basic_info?.job_type || t("notProvided"),
            summary: data.content?.summary || "",
            responsibilities: data.content?.responsibilities || [],
            benefits: data.content?.benefits || [],
            salaryRange: data.content?.salary_range || {},
            experience: data.match_criteria?.experience || {},
            skills: data.match_criteria?.skills?.map((s: any) => ({
               ...s,
               name: s.name && s.name !== "null" ? s.name : t("notProvided"),
               type: s.type && s.type !== "null" ? s.type : ""
            })) || [],
            education: data.match_criteria?.education?.map((edu: any) => ({
               degree: edu.degree && edu.degree !== "null" ? edu.degree : t("notProvided"),
               major: edu.major && edu.major !== "null" ? edu.major : "",
               level: edu.level && edu.level !== "null" ? edu.level : ""
            })) || [],
            certifications: data.match_criteria?.certifications?.map((cert: any) => ({
               name: cert.name && cert.name !== "null" ? cert.name : t("notProvided"),
               level: cert.level && cert.level !== "null" ? cert.level : ""
            })) || [],
            keywords: data.match_criteria?.keywords || []
         };

         setJDData(mappedData);
      } catch (err) {
         setError("Failed to load JD analysis");
         console.error(err);
      } finally {
         setIsLoading(false);
      }
   };

   const handleDownload = async () => {
      if (!jdId) return;

      try {
         const response = await fetch(getApiUrl(`routes/jd/${jdId}`), {
            method: "GET",
         });

         const disposition = response.headers.get("Content-Disposition") || "";
         let downloadFileName = jdName;

         if (disposition) {
            const filenameStarRegex = /filename\*=utf-8''([^;]+)/i;
            const matchesStar = filenameStarRegex.exec(disposition);

            if (matchesStar && matchesStar[1]) {
               downloadFileName = decodeURIComponent(matchesStar[1]);
            } else {
               const filenameRegex = /filename="?([^"]+)"?/;
               const matches = filenameRegex.exec(disposition);

               if (matches && matches[1]) {
                  downloadFileName = matches[1];
               }
            }
         }

         const blob = await response.blob();
         const url = window.URL.createObjectURL(blob);
         const link = document.createElement("a");
         link.href = url;
         link.setAttribute("download", downloadFileName);
         document.body.appendChild(link);
         link.click();
         link.parentNode?.removeChild(link);
         window.URL.revokeObjectURL(url);
      } catch (err) {
         console.error("Download failed:", err);
      }
   };

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent
            className="w-[60vw] max-w-[60vw] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 border-white/20"
            style={{ maxWidth: '60vw', width: '60vw' }}
         >
            <DialogHeader>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-emerald-400" />
                     </div>
                     <div>
                        <DialogTitle className="text-xl text-white">{jdData?.jobTitle || jdName}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                           {t("jdOverview")}
                        </DialogDescription>
                     </div>
                  </div>
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={handleDownload}
                     className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0 text-white"
                  >
                     <Download className="h-4 w-4" />
                     {t("downloadJD")}
                  </Button>
               </div>
            </DialogHeader>

            {isLoading && (
               <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                     <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
                     <p className="text-slate-300">{t("loadingJD")}</p>
                  </div>
               </div>
            )}

            {error && (
               <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                     <X className="mx-auto mb-4 h-12 w-12 text-red-400" />
                     <p className="text-slate-300">{error}</p>
                  </div>
               </div>
            )}

            {jdData && !isLoading && !error && (
               <div className="space-y-6 py-4">
                  {/* Basic Info */}
                  {(jdData.level || jdData.department || jdData.location || jdData.jobType) && (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {jdData.level && (
                           <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 p-4">
                              <TrendingUp className="h-5 w-5 text-emerald-400" />
                              <div>
                                 <p className="text-xs text-slate-400">Level</p>
                                 <p className="text-sm text-white capitalize">{jdData.level}</p>
                              </div>
                           </div>
                        )}
                        {jdData.department && (
                           <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 p-4">
                              <Users className="h-5 w-5 text-blue-400" />
                              <div>
                                 <p className="text-xs text-slate-400">{t("department") || "Department"}</p>
                                 <p className="text-sm text-white">{jdData.department}</p>
                              </div>
                           </div>
                        )}
                        {jdData.location && (
                           <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 p-4">
                              <MapPin className="h-5 w-5 text-purple-400" />
                              <div>
                                 <p className="text-xs text-slate-400">{t("location")}</p>
                                 <p className="text-sm text-white">{jdData.location}</p>
                              </div>
                           </div>
                        )}
                        {jdData.jobType && (
                           <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 p-4">
                              <Briefcase className="h-5 w-5 text-cyan-400" />
                              <div>
                                 <p className="text-xs text-slate-400">{t("jobType")}</p>
                                 <p className="text-sm text-white capitalize">{jdData.jobType}</p>
                              </div>
                           </div>
                        )}
                     </div>
                  )}

                  {/* Salary Range */}
                  {jdData.salaryRange && (jdData.salaryRange.text || jdData.salaryRange.min) && (
                     <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                           <DollarSign className="h-5 w-5 text-green-400" />
                           {t("salaryRange")}
                        </h3>
                        <p className="text-slate-300 text-sm">
                           {jdData.salaryRange.text || (
                              jdData.salaryRange.min !== undefined || jdData.salaryRange.max !== undefined
                                 ? `${jdData.salaryRange.min?.toLocaleString() || 'N/A'} - ${jdData.salaryRange.max?.toLocaleString() || 'N/A'} ${jdData.salaryRange.currency || 'VND'}`
                                 : t("notProvided")
                           )}
                        </p>
                     </div>
                  )}

                  {/* Summary */}
                  {jdData.summary && (
                     <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                           <Briefcase className="h-5 w-5 text-emerald-400" />
                           {t("jobSummary")}
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{jdData.summary}</p>
                     </div>
                  )}

                  {/* Experience Required */}
                  {jdData.experience && (jdData.experience.min_years !== undefined || jdData.experience.description) && (
                     <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                        <h3 className="text-white font-semibold mb-3">{t("experienceRequired")}</h3>
                        {jdData.experience.min_years !== undefined && (
                           <p className="text-emerald-300 text-sm mb-2">
                              {jdData.experience.min_years} - {jdData.experience.max_years || '∞'} {t("experience") || "years"}
                           </p>
                        )}
                        {jdData.experience.description && (
                           <p className="text-slate-300 text-sm">{jdData.experience.description}</p>
                        )}
                     </div>
                  )}

                  {/* Required Skills */}
                  {jdData.skills && jdData.skills.length > 0 && (
                     <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                        <h3 className="text-white font-semibold mb-4">{t("skills")}</h3>
                        <div className="space-y-3">
                           {jdData.skills.filter(s => s.level === 'mandatory').length > 0 && (
                              <div>
                                 <p className="text-red-300 text-xs font-medium mb-2">{t("mandatory")}</p>
                                 <div className="flex flex-wrap gap-2">
                                    {jdData.skills.filter(s => s.level === 'mandatory').map((skill, index) => (
                                       <span
                                          key={index}
                                          className="px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 text-red-300 text-sm font-medium"
                                       >
                                          {skill.name}{skill.type && skill.name !== t("notProvided") ? ` (${skill.type})` : ''}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                           )}
                           {jdData.skills.filter(s => s.level === 'preferred').length > 0 && (
                              <div>
                                 <p className="text-blue-300 text-xs font-medium mb-2">{t("preferred")}</p>
                                 <div className="flex flex-wrap gap-2">
                                    {jdData.skills.filter(s => s.level === 'preferred').map((skill, index) => (
                                       <span
                                          key={index}
                                          className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium"
                                       >
                                          {skill.name}{skill.type && skill.name !== t("notProvided") ? ` (${skill.type})` : ''}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  {/* Responsibilities */}
                  {jdData.responsibilities && jdData.responsibilities.length > 0 && (
                     <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                        <h3 className="text-white font-semibold mb-4">{t("keyResponsibilities")}</h3>
                        <ul className="space-y-2">
                           {jdData.responsibilities.map((resp, index) => (
                              <li key={index} className="text-slate-300 text-sm flex gap-2">
                                 <span className="text-emerald-400">•</span>
                                 <span>{resp}</span>
                              </li>
                           ))}
                        </ul>
                     </div>
                  )}

                  {/* Benefits */}
                  {jdData.benefits && jdData.benefits.length > 0 && (
                     <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                           <Award className="h-5 w-5 text-yellow-400" />
                           {t("benefitsPerks")}
                        </h3>
                        <ul className="space-y-2">
                           {jdData.benefits.map((benefit, index) => (
                              <li key={index} className="text-slate-300 text-sm flex gap-2">
                                 <span className="text-yellow-400">•</span>
                                 <span>{benefit}</span>
                              </li>
                           ))}
                        </ul>
                     </div>
                  )}

                  {/* Education & Certifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {jdData.education && jdData.education.length > 0 && (
                        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                           <h3 className="text-white font-semibold mb-3">{t("education")}</h3>
                           <ul className="space-y-2">
                              {jdData.education.map((edu, index) => (
                                 <li key={index} className="text-slate-300 text-sm">
                                    • {edu.degree === t("notProvided")
                                       ? edu.degree
                                       : `${edu.degree}${edu.major ? ` in ${edu.major}` : ''}${edu.level ? ` (${edu.level})` : ''}`
                                    }
                                 </li>
                              ))}
                           </ul>
                        </div>
                     )}

                     {jdData.certifications && jdData.certifications.length > 0 && (
                        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                           <h3 className="text-white font-semibold mb-3">{t("certifications")}</h3>
                           <ul className="space-y-2">
                              {jdData.certifications.map((cert, index) => (
                                 <li key={index} className="text-slate-300 text-sm">
                                    • {cert.name === t("notProvided")
                                       ? cert.name
                                       : `${cert.name}${cert.level ? ` (${cert.level})` : ''}`
                                    }
                                 </li>
                              ))}
                           </ul>
                        </div>
                     )}
                  </div>
               </div>
            )}
         </DialogContent>
      </Dialog>
   );
}
