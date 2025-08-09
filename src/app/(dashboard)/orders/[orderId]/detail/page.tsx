import { Metadata } from "next";
import { ContainerPage } from "@/components/container-page";
import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Client } from "./_components/client";

export const metadata: Metadata = { title: "Orders Detail" };

const OrdersDetailPage = async () => {
  const session = await auth();
  if (!session) {
    const path = "/orders";
    redirect(`/login?redirect=${encodeURIComponent(path)}`);
  }

  return (
    <ContainerPage
      breadcrumbs={[
        { label: "Home", url: "/" },
        { label: "Orders", url: "/orders" },
        { label: "Detail" },
      ]}
    >
      <Client />
    </ContainerPage>
  );
};

export default OrdersDetailPage;
