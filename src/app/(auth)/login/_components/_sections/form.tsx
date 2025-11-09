import { Loader2, LogInIcon } from "lucide-react";
import React, { FormEventHandler } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LabelInput, LabelInputPros } from "@/components/label-input";

interface HeaderProps {
  title: string;
  description: string;
}

interface AuthFormProps {
  credentialsAction?: FormEventHandler<HTMLFormElement>;
  inputs: LabelInputPros[];
  header: HeaderProps;
  disabled: boolean;
  loading: boolean;
}

export const AuthForm = ({
  credentialsAction,
  inputs,
  header,
  disabled,
  loading,
}: AuthFormProps) => {
  return (
    <form
      onSubmit={credentialsAction}
      className="max-w-md w-full p-8 rounded-lg bg-white border border-green-100 text-black text-sm flex flex-col gap-4 shadow-sm"
    >
      <div className="w-full flex flex-col">
        <h1 className="text-xl">{header.title}</h1>
        <p className="text-gray-700">{header.description}</p>
      </div>
      <Separator className="bg-gray-400" />
      <div className="w-full flex flex-col gap-3">
        {inputs.map((item) => (
          <LabelInput key={item.id} {...item} />
        ))}
      </div>
      <Button type="submit" disabled={disabled}>
        {loading ? <Loader2 className="animate-spin" /> : <LogInIcon />}
        {loading ? "Loading..." : "Login"}
      </Button>
    </form>
  );
};
