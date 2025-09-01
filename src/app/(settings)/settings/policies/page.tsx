import React from "react";
import { Client } from "./_components/client";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Policies" };

const PoliciesPage = async () => {
  const session = await auth();
  if (!session) {
    redirect("/login?redirect=settings");
  }
  return (
    <div className="">
      <Client />
    </div>
  );
};

export default PoliciesPage;
