"use client";

import * as React from "react";
import { Mic, FileUser, BriefcaseBusiness } from "lucide-react";

import { NavMain } from "@/components/main-layout/nav-main";
import { NavUser } from "@/components/main-layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "AI IPB",
      logo: Mic,
      plan: "AI Interview Practice Bot",
    },
  ],
  navMain: [
    {
      title: "CV",
      url: "/cv",
      icon: FileUser,
      isActive: true,
    },
    {
      title: "Job Descriptions",
      url: "job-descriptions",
      icon: BriefcaseBusiness,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}
