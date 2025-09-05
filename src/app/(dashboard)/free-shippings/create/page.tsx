import { Metadata } from "next";
import { ContainerPage } from "@/components/container-page";
import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Client } from "./_components/client";

export const metadata: Metadata = { title: "Create Free Shipping" };

const CreateFreeShippingPage = async () => {
  const session = await auth();
  if (!session) {
    const path = "/free-shippings";
    redirect(`/login?redirect=${encodeURIComponent(path)}`);
  }

  return (
    <ContainerPage
      breadcrumbs={[
        { label: "Home", url: "/" },
        { label: "Free Shipping", url: "/free-shippings" },
        { label: "Create" },
      ]}
    >
      <Client />
    </ContainerPage>
  );
};

export default CreateFreeShippingPage;
