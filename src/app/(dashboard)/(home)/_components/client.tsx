"use client";

import { useQueryState } from "nuqs";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardRange } from "./_section/range";
import { DashboardSummary } from "./_section/summary";
import { MainLoading } from "./_loading/main";

export const Client = () => {
  const [fromURL, setFromURL] = useQueryState("from");

  useEffect(() => {
    if (fromURL === "login") {
      toast.success("You are already logged in.");
      setFromURL(null);
    }
  }, [fromURL]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, []);

  if (!isMounted) {
    return <MainLoading />;
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex items-center gap-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>
      <div className="flex flex-col gap-6">
        <DashboardRange />
        <DashboardSummary />
      </div>
    </div>
  );
};
