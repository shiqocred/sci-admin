import { Metadata } from "next";
import { ContainerPage } from "@/components/container-page";
import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Client } from "./_components/client";

export const metadata: Metadata = { title: "Edit Promo" };

const EditPromoPage = async () => {
  const session = await auth();
  if (!session) {
    const path = "/promos";
    redirect(`/login?redirect=${encodeURIComponent(path)}`);
  }

  return (
    <ContainerPage
      breadcrumbs={[
        { label: "Home", url: "/" },
        { label: "Promos", url: "/promos" },
        { label: "Edit" },
      ]}
    >
      <Client />
    </ContainerPage>
  );
};

export default EditPromoPage;
