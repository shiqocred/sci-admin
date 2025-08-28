import { Metadata } from "next";
import { ContainerPage } from "@/components/container-page";
import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Client } from "./_components/client";

export const metadata: Metadata = { title: "Free Shippings" };

const FreeShippingPage = async () => {
  const session = await auth();
  if (!session) {
    const path = "/free-shippings";
    redirect(`/login?redirect=${encodeURIComponent(path)}`);
  }

  return (
    <ContainerPage
      breadcrumbs={[{ label: "Home", url: "/" }, { label: "Free Shippings" }]}
    >
      <Client />
    </ContainerPage>
  );
};

export default FreeShippingPage;
