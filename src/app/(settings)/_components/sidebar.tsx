"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Headset, ScrollText, Truck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const data = [
  {
    icon: Truck,
    name: "Shipping",
    href: "/settings/shipping",
  },
  {
    icon: ScrollText,
    name: "Policy",
    href: "/settings/policy",
  },
  {
    icon: Headset,
    name: "FAQ's",
    href: "/settings/faqs",
  },
];

export const SidebarSetting = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col">
      {data.map((i) => (
        <Button
          key={i.href}
          variant={"ghost"}
          className={cn(
            "justify-start",
            pathname.includes(i.href) && "bg-gray-100"
          )}
          asChild
        >
          <Link href={i.href}>
            <i.icon />
            {i.name}
          </Link>
        </Button>
      ))}
    </div>
  );
};
