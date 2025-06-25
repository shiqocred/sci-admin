import React from "react";
import { Client } from "./_components/client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Login" };

const LoginPage = async () => {
  const session = await auth();
  if (session) {
    redirect(`/?from=login`);
  }
  return (
    <div className="bg-white w-full h-full">
      <div className="[background-image:radial-gradient(88%_100%_at_top,rgba(134,239,172,0.5),rgba(134,239,172,0))] w-full h-full flex items-center justify-center">
        <Client />
      </div>
    </div>
  );
};

export default LoginPage;
