"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/main-layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();
   const isInterviewPage = pathname === "/chat";

   if (isInterviewPage) {
      return (
         <div className="flex flex-1 flex-col h-screen overflow-hidden">
            {children}
         </div>
      );
   }

   return (
      <SidebarProvider>
         <AppSidebar />
         <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
               {children}
            </div>
         </SidebarInset>
      </SidebarProvider>
   );
}
