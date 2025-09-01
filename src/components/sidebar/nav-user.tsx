import { useSession } from "next-auth/react";
import React from "react";
import { SidebarMenu, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import { LogoutButton } from "../logout-button";
import { cn } from "@/lib/utils";
import { UserRound } from "lucide-react";
import { TooltipText } from "@/providers/tooltip-provider";

export const NavUser = () => {
  const { data } = useSession();
  const { open } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div
          className={cn(
            "rounded-md flex flex-col gap-2",
            open && "p-1 border bg-gray-100 border-gray-300"
          )}
        >
          <div className="flex gap-2 items-center">
            <TooltipText
              side="right"
              className={cn("hidden", !open && "flex")}
              value={
                <div className="flex flex-col text-xs">
                  <h5 className="font-semibold">{data?.user?.name}</h5>
                  <p>{data?.user?.email}</p>
                </div>
              }
            >
              <div
                className={cn(
                  "size-9 border rounded-md flex items-center justify-center",
                  !open && "size-8"
                )}
              >
                <UserRound className="size-5" />
              </div>
            </TooltipText>
            <div className={cn("flex flex-col text-sm", !open && "hidden")}>
              <h5 className="font-semibold">{data?.user?.name}</h5>
              <p className="text-xs">{data?.user?.email}</p>
            </div>
          </div>
          <LogoutButton
            className={cn(
              "w-full justify-center bg-red-500 text-white hover:bg-red-600 hover:text-white",
              !open && "p-0 size-8"
            )}
            isVisible={open}
          />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
