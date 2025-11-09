import React from "react";
import { Metadata } from "next";
import { auth } from "@/lib/auth";

import { redirect } from "next/navigation";
import { loginRedirect } from "@/lib/utils";
import { Client } from "./_components/client";
import { ContainerPage } from "@/components/container-page";

export const metadata: Metadata = { title: "Banners" };

const BannersPage = async () => {
  const session = await auth();
  if (!session) redirect(loginRedirect("/banners"));

  return (
    <ContainerPage
      breadcrumbs={[{ label: "Home", url: "/" }, { label: "Banners" }]}
    >
      <Client />
    </ContainerPage>
  );
};

export default BannersPage;
