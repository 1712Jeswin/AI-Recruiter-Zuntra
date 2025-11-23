"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarOptions } from "@/services/Constants";

export function AppSidebar() {

  const path = usePathname();

  return (
    <Sidebar className="bg-white border-r border-slate-200 shadow-sm flex flex-col">
      
      {/* HEADER WITH LOGO + ACTION BUTTON */}
      <SidebarHeader className="px-4 py-6 flex flex-col items-center">
        <Image
          src="/logo.png"
          alt="logo"
          width={140}
          height={80}
          className="mb-4 select-none"
        />

        {/* CTA Button */}
        <Link href="/dashboard/create-interview" className="w-full">
          <Button className="w-full h-10 rounded-xl font-medium shadow-sm bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
           <Plus className="h-4 w-4 mr-1.5" />
            Create New Interview
           </Button>
        </Link>

      </SidebarHeader>

      {/* SIDEBAR NAVIGATION */}
      <SidebarContent className="px-3 py-4 flex-1">
        <SidebarGroup>
          <SidebarMenu className="space-y-1.5">
            {SidebarOptions.map((option, index) => {
              const active = path === option.path;

              return (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${active ? "bg-blue-100 text-blue-600 shadow-sm" : "hover:bg-slate-100"}
                    `}
                  >
                    <Link href={option.path}>
                      <option.icon
                        className={`h-5 w-5 ${
                          active ? "text-blue-600" : "text-slate-600 group-hover:text-slate-800"
                        }`}
                      />
                      <span
                        className={`text-[15px] font-medium ${
                          active ? "text-blue-700" : "text-slate-700"
                        }`}
                      >
                        {option.name}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER AREA (optional future use) */}
      <SidebarFooter className="px-4 py-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">© HireMindAI</p>
      </SidebarFooter>
    </Sidebar>
  );
}
