import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";

export const metadata: Metadata = { title: "Settings" };

const SettingsPage = async () => {
  const session = await auth();
  if (session) {
    redirect("/login?redirect=login");
  }
  return <div>llggg</div>;
};

export default SettingsPage;
