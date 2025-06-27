import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { Client } from "./_components/client";
import { ContainerPage } from "@/components/container-page";

export const metadata: Metadata = { title: "Categories" };

const CategoriesPage = async () => {
  const session = await auth();
  if (!session) {
    const path = "/categories";
    redirect(`/login?redirect=${encodeURIComponent(path)}`);
  }
  return (
    <ContainerPage
      breadcrumbs={[{ label: "Home", url: "/" }, { label: "Categories" }]}
    >
      <Client />
    </ContainerPage>
  );
};

export default CategoriesPage;
