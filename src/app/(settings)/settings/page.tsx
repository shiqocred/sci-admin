import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Settings" };

const SettingsPage = async () => {
  const session = await auth();
  if (!session) {
    redirect("/login?redirect=login");
  }
  redirect("/settings/shipping");
};

export default SettingsPage;
