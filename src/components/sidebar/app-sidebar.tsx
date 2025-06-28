"use client";

import * as React from "react";
import {
  BadgePercent,
  ChartNoAxesGantt,
  Gauge,
  PawPrint,
  RocketIcon,
  Settings2,
  ShoppingBag,
  Store,
  Tags,
  UserRound,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "../ui/sidebar";
import Link from "next/link";
import { NavMain } from "./nav-main";
import { cn } from "@/lib/utils";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Gauge,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: ShoppingBag,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: UserRound,
    },
    {
      title: "Products",
      url: "/products",
      icon: ChartNoAxesGantt,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: Tags,
    },
    {
      title: "Pets",
      url: "/pets",
      icon: PawPrint,
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Store,
    },
    {
      title: "Discounts",
      url: "/discounts",
      icon: BadgePercent,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          asChild
          className={cn(
            "h-auto text-xl font-bold justify-start",
            !open && "group-data-[collapsible=icon]:p-0!"
          )}
        >
          <Link href={"/"}>
            <div className="size-8 flex-none flex items-center justify-center rounded-md bg-gray-300">
              <RocketIcon className="size-5" />
            </div>
            <h1>ADMIN SCI</h1>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
