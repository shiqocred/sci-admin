import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import React, { ReactNode } from "react";
import { SidebarSetting } from "./_components/sidebar";
import Link from "next/link";

const SettingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-gray-100 min-h-full">
      <div className="flex items-center gap-2 max-w-4xl mx-auto py-4">
        <Button
          size={"icon"}
          variant={"ghost"}
          className="size-8 hover:bg-gray-200"
          asChild
        >
          <Link href={"/"}>
            <ArrowLeft className="size-6" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      <div className="flex max-w-4xl mx-auto">
        <div className="grid grid-cols-7 gap-4 w-full">
          <div className="col-span-2 w-full flex h-full relative">
            <div className="bg-white rounded-lg shadow-sm p-3 w-full sticky top-4 h-fit">
              <SidebarSetting />
            </div>
          </div>
          <div className="col-span-5 w-full pb-20">
            <div className="bg-white rounded-lg shadow-sm p-3 w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingLayout;
