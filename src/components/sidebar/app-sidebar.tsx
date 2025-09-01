"use client";

import * as React from "react";
import {
  ChartNoAxesGantt,
  Gauge,
  PawPrint,
  Percent,
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
      items: [],
    },
    {
      title: "Orders",
      url: "/orders",
      icon: ShoppingBag,
      items: [
        { title: "List", url: "/orders" },
        { title: "Review", url: "/reviews" },
      ],
    },
    {
      title: "Customers",
      url: "/customers",
      icon: UserRound,
      items: [],
    },
    {
      title: "Products",
      url: "/products",
      icon: ChartNoAxesGantt,
      items: [],
    },
    {
      title: "Categories",
      url: "/categories",
      icon: Tags,
      items: [],
    },
    {
      title: "Pets",
      url: "/pets",
      icon: PawPrint,
      items: [],
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: Store,
      items: [],
    },
    {
      title: "Marketings",
      url: "/discounts",
      icon: Percent,
      items: [
        { title: "Discounts", url: "/discounts" },
        { title: "Banners", url: "/banners" },
        { title: "Promos", url: "/promos" },
        { title: "Free Shipping", url: "/free-shippings" },
      ],
    },
    {
      title: "Settings",
      url: "/settings/store",
      icon: Settings2,
      items: [],
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
