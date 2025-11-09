import { Metadata } from "next";
import { ContainerPage } from "@/components/container-page";
import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Client } from "./_components/client";
import { loginRedirect } from "@/lib/utils";

export const metadata: Metadata = { title: "Create Banners" };

const CreateBannerPage = async () => {
  const session = await auth();
  if (!session) redirect(loginRedirect("/banners"));

  return (
    <ContainerPage
      breadcrumbs={[
        { label: "Home", url: "/" },
        { label: "Banners", url: "/banners" },
        { label: "Create" },
      ]}
    >
      <Client />
    </ContainerPage>
  );
};

export default CreateBannerPage;
