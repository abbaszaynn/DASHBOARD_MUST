"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { Home, TrendingUp, Flag, Users, FileText, SettingsIcon, ShieldCheck, Activity, Lock } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Command Center" },
  { href: "/trend-analysis", icon: TrendingUp, label: "Trend Analysis" },
  { href: "/flagged-content", icon: Flag, label: "Flagged Content" },
  { href: "/user-monitoring", icon: Users, label: "User Monitoring" },
  { href: "/reports", icon: FileText, label: "Reports" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r border-border/40">
        <SidebarHeader className="border-b border-border/40 bg-sidebar/50 backdrop-blur">
          <div className="flex items-center gap-3 p-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-sm">
              <img src="/logo.png" alt="MUST Security Logo" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-bold tracking-wider text-foreground">MUST</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Security</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="px-2 py-4">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href} className="mb-1">
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={pathname === item.href}
                    className={cn(
                      "transition-all duration-200 hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/15 data-[active=true]:text-primary data-[active=true]:shadow-[inset_3px_0_0_0_hsl(var(--primary))]",
                      "h-10 text-sm font-medium tracking-wide"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t border-border/40 p-4">
          <div className="rounded-md bg-card/50 p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs font-mono font-semibold text-primary">SYSTEM STATUS</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>OPERATIONAL</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-1">
              <Lock className="h-3 w-3" />
              <span>SECURE CONN.</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background/50">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
              <ShieldCheck className="h-3 w-3 text-primary" />
              <span className="text-xs font-mono text-primary/80 tracking-wider">THREAT LEVEL: LOW</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-xs font-mono text-muted-foreground">
              {new Date().toISOString().split('T')[0]} <span className="text-primary">::</span> UTC
            </div>
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-6 overflow-hidden">
          <div className="mx-auto max-w-7xl animate-in fade-in-50 duration-500">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
