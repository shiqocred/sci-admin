import { Metadata } from "next";
import { ContainerPage } from "@/components/container-page";
import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

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
      Categories Page
    </ContainerPage>
  );
};

export default CategoriesPage;
