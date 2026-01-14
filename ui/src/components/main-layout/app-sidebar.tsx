"use client";

import * as React from "react";
import { Mic, FileUser, BriefcaseBusiness, Bot, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

import { NavMain } from "@/components/main-layout/nav-main";
import { NavUser } from "@/components/main-layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { cn } from "@/lib/utils";

import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t, language, setLanguage } = useLanguage();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const data = {
    teams: [
      {
        name: "AI-X HR",
        logo: Bot,
        plan: t("aiHRAssistant"),
      },
    ],
    navMain: [
      {
        title: t("cv"),
        url: "/cv",
        icon: FileUser,
      },
      {
        title: t("jobDescriptions"),
        url: "/job-descriptions",
        icon: BriefcaseBusiness,
      },
      {
        title: t("interviewReports"),
        url: "/interview-reports",
        icon: ClipboardList,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-white/5">
      <SidebarHeader className="py-6 px-4">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="px-2">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className={cn(
          "flex items-center gap-1 p-1 bg-sidebar-accent/50 rounded-xl transition-all duration-300",
          isCollapsed ? "flex-col" : "flex-row"
        )}>
          <Button
            variant={language === "en" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setLanguage("en")}
            className={cn(
              "flex-1 text-[10px] font-bold h-7 rounded-lg transition-all",
              language === "en" && "shadow-sm bg-white/10 text-white"
            )}
          >
            EN
          </Button>
          <Button
            variant={language === "vi" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setLanguage("vi")}
            className={cn(
              "flex-1 text-[10px] font-bold h-7 rounded-lg transition-all",
              language === "vi" && "shadow-sm bg-white/10 text-white"
            )}
          >
            VI
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
