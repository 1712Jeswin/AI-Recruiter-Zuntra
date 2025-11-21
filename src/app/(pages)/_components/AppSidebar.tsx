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

    const path = usePathname()
    console.log("The Current path is : ",path)

  return (
    <Sidebar className="bg-gradient-to-r from-blue-50 to-slate-100">
      <SidebarHeader className="flex justify-center items-center p-4">
        <Image
          src={"/logo.png"}
          alt="logo"
          height={80}
          width={150}
          className="w-[150px]"
        />
        <Button className="w-full mt-5">
          <Plus className="size-4" />
          Create New Interview
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarContent>
            <SidebarMenu>
              {SidebarOptions.map((option, index) => (
                <SidebarMenuItem key={index} className="p-1">
                  <SidebarMenuButton asChild className={`p-5 ${option.path==path && 'bg-blue-100'}`}>
                    <Link href={option.path}>
                      <option.icon className={` ${path==option.path && 'text-primary'} `}/>
                      <span className={`text-[16px] ${path==option.path && 'text-primary'} font-medium`}>{option.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}