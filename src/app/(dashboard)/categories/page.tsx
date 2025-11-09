import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { Client } from "./_components/client";
import { ContainerPage } from "@/components/container-page";
import { loginRedirect } from "@/lib/utils";

export const metadata: Metadata = { title: "Categories" };

const CategoriesPage = async () => {
  const session = await auth();
  if (!session) redirect(loginRedirect("/banners"));
  return (
    <ContainerPage
      breadcrumbs={[{ label: "Home", url: "/" }, { label: "Categories" }]}
    >
      <Client />
    </ContainerPage>
  );
};

export default CategoriesPage;
