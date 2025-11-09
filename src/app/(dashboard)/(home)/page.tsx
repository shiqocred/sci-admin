import React from "react";
import { Metadata } from "next";
import { auth } from "@/lib/auth";

import { redirect } from "next/navigation";
import { Client } from "./_components/client";
import { ContainerPage } from "@/components/container-page";

export const metadata: Metadata = { title: "Dashboard" };

const DashboardPage = async () => {
  const session = await auth();
  if (!session) redirect(`/login`);

  return (
    <ContainerPage breadcrumbs={[{ label: "Home" }]}>
      <Client />
    </ContainerPage>
  );
};

export default DashboardPage;
