import { getApiUrl } from "@/lib/api";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Briefcase, GraduationCap, Award, MapPin, Mail, Phone, Calendar, Code } from "lucide-react";
import { useEffect, useState } from "react";

interface CVData {
   name?: string;
   email?: string;
   phone?: string;
   location?: string;
   summary?: string;
   skills?: string[];
   experience?: Array<{
      title: string;
      company: string;
      duration: string;
      description?: string;
   }>;
   education?: Array<{
      degree: string;
      institution: string;
      year: string;
   }>;
   languages?: string[];
   certifications?: string[];
}

interface CVOverviewDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   cvId: string | null;
   cvName: string;
}

import { useLanguage } from "@/contexts/LanguageContext";

export function CVOverviewDialog({
   open,
   onOpenChange,
   cvId,
   cvName,
}: CVOverviewDialogProps) {
   const { t } = useLanguage();
   const [cvData, setCVData] = useState<CVData | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      if (open && cvId) {
         fetchCVAnalysis();
      }
   }, [open, cvId]);

   const fetchCVAnalysis = async () => {
      if (!cvId) return;

      setIsLoading(true);
      setError(null);

      try {
         // Call CV analysis endpoint - note the correct path
         const response = await fetch(getApiUrl(`routes/cv/${cvId}/analysis`), {
            method: "GET",
         });

         if (!response.ok) {
            throw new Error(t("failedToLoadCVAnalysis"));
         }

         const data = await response.json();

         // Map the CV_SCHEMA structure to our display format
         const mappedData: CVData = {
            name: data.basics?.name || t("notProvided"),
            email: data.basics?.email || t("notProvided"),
            phone: data.basics?.phone_number || t("notProvided"),
            location: data.basics?.location ? `${data.basics.location.city || ""}${data.basics.location.city && data.basics.location.countryCode ? ", " : ""}${data.basics.location.countryCode || ""}` : t("notProvided"),
            summary: data.basics?.summary || "",
            skills: data.skills?.flatMap((skill: any) => skill.keywords || []) || [],
            experience: data.work?.map((work: any) => {
               const start = work.startDate && work.startDate !== "null" ? work.startDate : "";
               const end = work.endDate && work.endDate !== "null" ? work.endDate : "Present";
               const duration = start || (end !== "Present") ? `${start} - ${end}` : "";

               return {
                  title: work.position || t("notProvided"),
                  company: work.name || t("notProvided"),
                  duration: duration,
                  description: work.highlights?.join(". ") || ""
               };
            }) || [],
            education: data.education?.map((edu: any) => {
               const studyType = edu.studyType && edu.studyType !== "null" ? edu.studyType : "";
               const area = edu.area && edu.area !== "null" ? edu.area : "";
               let degree = "";
               if (studyType && area) degree = `${studyType} in ${area}`;
               else if (studyType || area) degree = studyType || area;
               else degree = t("notProvided");

               return {
                  degree,
                  institution: edu.institution && edu.institution !== "null" ? edu.institution : (degree === t("notProvided") ? "" : t("notProvided")),
                  year: edu.score && edu.score !== "null" ? `(${edu.score})` : ""
               };
            }) || [],
            languages: data.languages?.map((lang: any) => {
               const language = lang.language && lang.language !== "null" ? lang.language : t("notProvided");
               if (language === t("notProvided")) return language;
               const fluency = lang.fluency && lang.fluency !== "null" ? ` (${lang.fluency})` : "";
               return `${language}${fluency}`;
            }) || [],
            certifications: data.awards?.map((award: any) => {
               const title = award.title && award.title !== "null" ? award.title : t("notProvided");
               if (title === t("notProvided")) return title;
               const awarder = award.awarder && award.awarder !== "null" ? ` - ${award.awarder}` : "";
               const date = award.date && award.date !== "null" ? ` (${award.date})` : "";
               return `${title}${awarder}${date}`;
            }) || []
         };

         setCVData(mappedData);
      } catch (err) {
         setError(t("failedToLoadCVAnalysis"));
         console.error(err);
      } finally {
         setIsLoading(false);
      }
   };

   const handleDownload = async () => {
      if (!cvId) return;

      try {
         const response = await fetch(getApiUrl(`routes/cv/${cvId}`), {
            method: "GET",
         });

         const disposition = response.headers.get("Content-Disposition") || "";
         let downloadFileName = cvName;

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
                     <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-purple-400" />
                     </div>
                     <div>
                        <DialogTitle className="text-xl text-white">{cvData?.name || cvName}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                           {t("candidateProfileOverview")}
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
                     {t("downloadCV")}
                  </Button>
               </div>
            </DialogHeader>

            {isLoading && (
               <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                     <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
                     <p className="text-slate-300">{t("analyzingCV")}</p>
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

            {cvData && !isLoading && !error && (
               <div className="space-y-6 py-4">
                  {/* Contact Information */}
                  {(cvData.email || cvData.phone || cvData.location) && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {cvData.email && (
                           <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 p-4">
                              <Mail className="h-5 w-5 text-blue-400" />
                              <div>
                                 <p className="text-xs text-slate-400">{t("email")}</p>
                                 <p className="text-sm text-white">{cvData.email}</p>
                              </div>
                           </div>
                        )}
                        {cvData.phone && (
                           <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 p-4">
                              <Phone className="h-5 w-5 text-green-400" />
                              <div>
                                 <p className="text-xs text-slate-400">{t("phone")}</p>
                                 <p className="text-sm text-white">{cvData.phone}</p>
                              </div>
                           </div>
                        )}
                        {cvData.location && (
                           <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 p-4">
                              <MapPin className="h-5 w-5 text-purple-400" />
                              <div>
                                 <p className="text-xs text-slate-400">{t("location")}</p>
                                 <p className="text-sm text-white">{cvData.location}</p>
                              </div>
                           </div>
                        )}
                     </div>
                  )}

                  {/* Summary */}
                  {cvData.summary && (
                     <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                           <Briefcase className="h-5 w-5 text-purple-400" />
                           {t("professionalSummary")}
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{cvData.summary}</p>
                     </div>
                  )}

                  {/* Skills */}
                  {cvData.skills && cvData.skills.length > 0 && (
                     <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                           <Code className="h-5 w-5 text-blue-400" />
                           {t("skills")}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                           {cvData.skills.map((skill, index) => (
                              <span
                                 key={index}
                                 className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-purple-300 text-sm font-medium"
                              >
                                 {skill}
                              </span>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Experience */}
                  {cvData.experience && cvData.experience.length > 0 && (
                     <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                           <Briefcase className="h-5 w-5 text-emerald-400" />
                           {t("workExperience")}
                        </h3>
                        <div className="space-y-4">
                           {cvData.experience.map((exp, index) => (
                              <div key={index} className="border-l-2 border-purple-400/50 pl-4">
                                 <h4 className="text-white font-medium">{exp.title}</h4>
                                 <p className="text-purple-300 text-sm">{exp.company}</p>
                                 <p className="text-slate-400 text-xs mb-2">{exp.duration}</p>
                                 {exp.description && (
                                    <p className="text-slate-300 text-sm">{exp.description}</p>
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Education */}
                  {cvData.education && cvData.education.length > 0 && (
                     <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                           <GraduationCap className="h-5 w-5 text-cyan-400" />
                           {t("education")}
                        </h3>
                        <div className="space-y-3">
                           {cvData.education.map((edu, index) => (
                              <div key={index}>
                                 <h4 className="text-white font-medium">{edu.degree}</h4>
                                 <p className="text-cyan-300 text-sm">{edu.institution}</p>
                                 <p className="text-slate-400 text-xs">{edu.year}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Languages & Certifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {cvData.languages && cvData.languages.length > 0 && (
                        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                           <h3 className="text-white font-semibold mb-3">{t("languages")}</h3>
                           <div className="flex flex-wrap gap-2">
                              {cvData.languages.map((lang, index) => (
                                 <span key={index} className="px-3 py-1 rounded-lg bg-white/10 text-slate-300 text-sm">
                                    {lang}
                                 </span>
                              ))}
                           </div>
                        </div>
                     )}

                     {cvData.certifications && cvData.certifications.length > 0 && (
                        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                           <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <Award className="h-5 w-5 text-yellow-400" />
                              {t("certifications")}
                           </h3>
                           <ul className="space-y-2">
                              {cvData.certifications.map((cert, index) => (
                                 <li key={index} className="text-slate-300 text-sm">• {cert}</li>
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
