"use client";

import { Button } from "@/components/ui/button";
import { Loader2Icon, LoaderIcon, Save } from "lucide-react";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { RichInput } from "@/components/rich-editor";
import {
  useGetPolicies,
  useUpdatePrivacy,
  useUpdateReturn,
  useUpdateTerms,
} from "../_api";

export const Client = () => {
  const [input, setInput] = useState({
    privacy: "",
    return: "",
    termOfUse: "",
  });

  const { mutate: updatePrivacy, isPending: isUpdatingPrivacy } =
    useUpdatePrivacy();
  const { mutate: updateReturn, isPending: isUpdatingReturn } =
    useUpdateReturn();
  const { mutate: updateTerms, isPending: isUpdatingTerms } = useUpdateTerms();
  const { data, isPending, isSuccess } = useGetPolicies();

  const handlePrivacy = (e: FormEvent) => {
    e.preventDefault();
    updatePrivacy({ body: { value: input.privacy } });
  };
  const handleReturn = (e: FormEvent) => {
    e.preventDefault();
    updateReturn({ body: { value: input.return } });
  };
  const handleTerms = (e: FormEvent) => {
    e.preventDefault();
    updateTerms({ body: { value: input.termOfUse } });
  };

  const isUpdatePrivacy = useMemo(
    () => data?.data.privacy !== input.privacy,
    [data, input]
  );

  const isUpdateRefund = useMemo(
    () => data?.data.return !== input.return,
    [data, input]
  );

  const isUpdateTerms = useMemo(
    () => data?.data.termOfUse !== input.termOfUse,
    [data, input]
  );

  useEffect(() => {
    if (data && isSuccess) {
      setInput({
        privacy: data.data.privacy ?? "",
        return: data.data.return ?? "",
        termOfUse: data.data.termOfUse ?? "",
      });
    }
  }, [data, isSuccess]);
  return (
    <div className="w-full flex-col flex">
      {isPending ? (
        <div className="flex flex-col gap-1 w-full h-[300px] justify-center items-center">
          <LoaderIcon className="animate-spin size-5" />
          <p className="ml-2 animate-pulse text-sm">Loading...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <form onSubmit={handlePrivacy} className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Privacy Policy</h3>
            <RichInput
              content={input.privacy}
              onChange={(e) => setInput((prev) => ({ ...prev, privacy: e }))}
            />
            <div className="w-full flex justify-end">
              <Button
                type="submit"
                disabled={isUpdatingPrivacy || !isUpdatePrivacy}
              >
                {isUpdatingPrivacy ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <Save />
                )}
                {isUpdatingPrivacy ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
          <Separator />
          <form onSubmit={handleReturn} className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Refund Policy</h3>
            <RichInput
              content={input.return}
              onChange={(e) => setInput((prev) => ({ ...prev, return: e }))}
            />
            <div className="w-full flex justify-end">
              <Button
                type="submit"
                disabled={isUpdatingReturn || !isUpdateRefund}
              >
                {isUpdatingReturn ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <Save />
                )}
                {isUpdatingReturn ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
          <Separator />
          <form onSubmit={handleTerms} className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Term of Use</h3>
            <RichInput
              content={input.termOfUse}
              onChange={(e) => setInput((prev) => ({ ...prev, termOfUse: e }))}
            />
            <div className="w-full flex justify-end">
              <Button
                type="submit"
                disabled={isUpdatingTerms || !isUpdateTerms}
              >
                {isUpdatingTerms ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <Save />
                )}
                {isUpdatingTerms ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
