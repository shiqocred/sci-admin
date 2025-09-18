"use client";

import { useQueryState } from "nuqs";
import React, { useEffect } from "react";
import { toast } from "sonner";

export const Client = () => {
  const [fromURL, setFromURL] = useQueryState("from");

  useEffect(() => {
    if (fromURL === "login") {
      toast.success("You are already logged in.");
      setFromURL(null);
    }
  }, [fromURL]);

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex items-center gap-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>
    </div>
  );
};
