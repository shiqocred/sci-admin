import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { Client } from "./_components/client";
import { ContainerPage } from "@/components/container-page";
import { getProductDetail } from "@/lib/api";

const dataDetail = async ({
  params,
}: {
  params: Promise<{ productId: string }>;
}) => {
  const { productId } = await params;
  return await getProductDetail(productId);
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const data = await dataDetail({ params });

  return {
    title: data.name,
    openGraph: {
      images: data.image ?? "/images/logo-sci.png",
    },
  };
}

const ProductsPage = async ({
  params,
}: {
  params: Promise<{ productId: string }>;
}) => {
  const session = await auth();
  if (!session) {
    const path = "/products";
    redirect(`/login?redirect=${encodeURIComponent(path)}`);
  }

  const data = await dataDetail({ params });

  return (
    <ContainerPage
      breadcrumbs={[
        { label: "Home", url: "/" },
        { label: "Products", url: "/products" },
        { label: "Edit" },
        { label: data.name },
      ]}
    >
      <Client />
    </ContainerPage>
  );
};

export default ProductsPage;
