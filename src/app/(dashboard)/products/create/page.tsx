import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { Client } from "./_components/client";
import { ContainerPage } from "@/components/container-page";

export const metadata: Metadata = { title: "Products" };

const ProductsPage = async () => {
  const session = await auth();
  if (!session) {
    const path = "/products";
    redirect(`/login?redirect=${encodeURIComponent(path)}`);
  }

  return (
    <ContainerPage
      breadcrumbs={[
        { label: "Home", url: "/" },
        { label: "Products", url: "/products" },
        { label: "New" },
      ]}
    >
      <Client />
    </ContainerPage>
  );
};

export default ProductsPage;
