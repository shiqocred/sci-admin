import { Metadata } from "next";
import { ContainerPage } from "@/components/container-page";
import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Suppliers" };

const SuppliersPage = async () => {
  const session = await auth();
  if (!session) {
    const path = "/suppliers";
    redirect(`/login?redirect=${encodeURIComponent(path)}`);
  }

  return (
    <ContainerPage
      breadcrumbs={[{ label: "Home", url: "/" }, { label: "Suppliers" }]}
    >
      Suppliers Page
    </ContainerPage>
  );
};

export default SuppliersPage;
