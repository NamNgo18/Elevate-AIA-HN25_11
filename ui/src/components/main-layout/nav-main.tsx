"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url || pathname?.startsWith(`${item.url}/`);
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
                className={cn(
                  "relative transition-all duration-300 ease-in-out group/item",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-accent/50"
                )}
              >
                <Link href={item.url} className="flex items-center w-full gap-3">
                  {item.icon && (
                    <item.icon className={cn(
                      "size-5 transition-transform duration-300 group-hover/item:scale-110",
                      isActive ? "text-primary animate-pulse" : "text-muted-foreground group-hover/item:text-foreground"
                    )} />
                  )}
                  <span>{item.title}</span>
                  {isActive && (
                    <span className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
