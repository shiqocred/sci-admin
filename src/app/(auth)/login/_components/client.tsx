"use client";

import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { AuthForm } from "./_sections/form";
import { LabelInputPros } from "@/components/label-input";

const initialValue = {
  email: "",
  password: "",
};

export const Client = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectURL = searchParams.get("redirect");

  const [input, setInput] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target;
    setInput((prev) => ({ ...prev, [v.id]: v.value }));
  };

  const credentialsAction = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn("credentials", {
        ...input,
        redirect: true,
        redirectTo: redirectURL ?? "/",
      });
    } catch (error) {
      setIsLoading(false);
      toast.error("Invalid Credentials");
      console.log("ERROR_LOGIN:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const dataInput: LabelInputPros[] = [
    {
      label: "Email",
      placeholder: "e.g. example@mail.com",
      id: "email",
      type: "email",
      value: input.email,
      onChange: handleChange,
    },
    {
      label: "Password",
      placeholder: "******",
      id: "password",
      value: input.password,
      onChange: handleChange,
      isPassword: true,
    },
  ];

  useEffect(() => {
    const error = searchParams.get("error");
    const code = searchParams.get("code");

    if (error === "CredentialsSignin" && code === "credential_not_match") {
      toast.error("Email atau password tidak cocok");

      // Menghapus query parameter tanpa reload
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("error");
      newParams.delete("code");

      return router.push(pathname + "?" + newParams.toString());
    }
  }, [searchParams]);

  return (
    <AuthForm
      header={{
        title: "Welcome Back",
        description: "Log in to your account to continue",
      }}
      credentialsAction={credentialsAction}
      inputs={dataInput}
      disabled={!input.email || !input.password || isLoading}
      loading={isLoading}
    />
  );
};
