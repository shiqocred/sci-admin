import { signOut } from "next-auth/react";
import React, { MouseEvent } from "react";
import { Button } from "./ui/button";
import { LogOutIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";

export const LogoutButton = ({
  className,
  isVisible = true,
}: {
  className?: string;
  isVisible?: boolean;
}) => {
  const handleLogout = async (e: MouseEvent) => {
    e.preventDefault();
    await signOut({ redirect: true, redirectTo: "/login" });
  };
  return (
    <TooltipText
      side="right"
      className={cn(isVisible && "hidden")}
      value={"Logout"}
    >
      <Button
        variant={"ghost"}
        className={cn(
          "justify-start text-red-500 hover:text-red-500 hover:bg-red-50",
          className
        )}
        onClick={handleLogout}
      >
        <LogOutIcon />
        {isVisible && "Logout"}
      </Button>
    </TooltipText>
  );
};
