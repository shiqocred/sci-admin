"use client";

import { LabelInput } from "@/components/label-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LoaderIcon,
  Plus,
  RefreshCcw,
  Send,
  XCircle,
  XIcon,
} from "lucide-react";
import React, {
  ChangeEvent,
  MouseEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useCreateAccount,
  useGetAccount,
  useGetAccounts,
  useUpdateAccount,
  useUpdatePassword,
} from "../_api";
import { Input } from "@/components/ui/input";
import { TooltipText } from "@/providers/tooltip-provider";
import { SortTable } from "@/components/sort-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { usePagination } from "@/lib/pagination";
import { useSearchQuery } from "@/lib/search";
import { parseAsString, useQueryStates } from "nuqs";
import { cn } from "@/lib/utils";
import { column } from "./columns";
import { MessageInputError } from "@/components/message-input-error";
import { toast } from "sonner";

const filterField = [
  { name: "Name", value: "name" },
  { name: "Email", value: "email" },
];

const initialValue = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirm_password: "",
};

export const Client = () => {
  const [dialCode, setDialCode] = useState("+62");

  const [{ sort, order, adminId, dialog }, setQuery] = useQueryStates(
    {
      sort: parseAsString.withDefault("created"),
      order: parseAsString.withDefault("desc"),
      adminId: parseAsString.withDefault(""),
      dialog: parseAsString.withDefault(""),
    },
    {
      urlKeys: {
        adminId: "id",
      },
    }
  );

  const [input, setInput] = useState(initialValue);
  const [errors, setErrors] = useState(initialValue);

  const { mutate: createAccount, isPending: isCreating } = useCreateAccount();
  const { mutate: updateAccount, isPending: isUpdating } = useUpdateAccount();
  const { mutate: updatePassword, isPending: isUpdatingPassword } =
    useUpdatePassword();

  const { page, metaPage, limit, setLimit, setPage, setPagination } =
    usePagination();
  const { search, searchValue, setSearch } = useSearchQuery();
  const { data, isPending, refetch, isRefetching, isSuccess } = useGetAccounts({
    q: searchValue,
    p: page,
    limit,
    order,
    sort,
  });
  const { data: detailAccount, isPending: isPendingAccount } = useGetAccount({
    adminId,
    edit: dialog === "edit",
  });

  const isLoading =
    isPending || isRefetching || isCreating || isUpdating || isUpdatingPassword;

  const adminList = useMemo(() => data?.data.data, [data]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClose = () => {
    if (dialog) {
      setQuery({
        dialog: "",
        adminId: "",
      });
    }
  };

  const handleSubmit = (e: MouseEvent) => {
    e.preventDefault();
    if (dialog === "create") {
      const body = {
        name: input.name,
        email: input.email,
        phone: `${dialCode} ${input.phone}`,
        password: input.password,
      };

      if (input.password !== input.confirm_password)
        return toast.error("Password and Confirm Password do not match");

      createAccount(
        { body },
        {
          onSuccess: () => {
            handleClose();
            setErrors(initialValue);
          },
          onError: (err) => {
            setErrors((err.response?.data as any).errors);
          },
        }
      );
    }
    if (dialog === "edit") {
      const body = {
        name: input.name,
        email: input.email,
        phone: `${dialCode} ${input.phone}`,
      };

      updateAccount(
        { body, params: { id: adminId } },
        {
          onSuccess: () => {
            handleClose();
            setErrors(initialValue);
          },
          onError: (err) => {
            setErrors((err.response?.data as any).errors);
          },
        }
      );
    }
    if (dialog === "password") {
      const body = { password: input.password };

      updatePassword(
        { body, params: { id: adminId } },
        {
          onSuccess: () => {
            handleClose();
            setErrors(initialValue);
          },
          onError: (err) => {
            setErrors((err.response?.data as any).errors);
          },
        }
      );
    }
  };

  // Cek apakah ada perubahan pada data
  const isChanged = useMemo(() => {
    if (adminId && dialog === "edit") {
      return (
        input.name !== detailAccount?.data.name ||
        input.email !== detailAccount?.data.email ||
        `${dialCode} ${input.phone}` !== detailAccount?.data.phone
      );
    }
    return true;
  }, [input, dialCode, detailAccount]);

  useEffect(() => {
    if (detailAccount) {
      const detail = detailAccount.data;
      const phoneParts = detail.phone?.split(" ") ?? ["+62", ""];
      setInput((prev) => ({
        ...prev,
        name: detail.name ?? "",
        email: detail.email ?? "",
        phone: phoneParts[1],
      }));
      setDialCode(phoneParts[0]);
    }
  }, [detailAccount]);

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data.data.pagination);
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (adminId && dialog !== "edit" && dialog !== "password") {
      setQuery({
        adminId: "",
        dialog: "",
      });
    }
    if (!adminId && !dialog) {
      setInput(initialValue);
      setErrors(initialValue);
    }
  }, [adminId, dialog]);

  return (
    <div className="w-full flex-col gap-4 flex">
      <h2 className="text-lg font-semibold">Admin Accounts</h2>
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center w-full justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center group">
              <Input
                className="h-8 focus-visible:ring-0 shadow-none w-52 placeholder:text-xs"
                placeholder="Search admin..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search.length > 0 && (
                <Button
                  size={"icon"}
                  className="absolute right-2 size-4 hover:bg-gray-200 group-hover:flex hidden"
                  variant={"ghost"}
                  onClick={() => setSearch(null)}
                >
                  <XCircle className="size-3" />
                </Button>
              )}
            </div>
            <TooltipText value="Reload data">
              <Button
                className="size-8 flex-none disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed"
                variant={"outline"}
                size={"icon"}
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCcw
                  className={cn("size-3.5", isRefetching && "animate-spin")}
                />
              </Button>
            </TooltipText>
            <SortTable
              order={order}
              sort={sort}
              setSort={setQuery}
              data={filterField}
              disabled={isLoading}
            />
          </div>
          <Button
            size={"sm"}
            className="text-xs"
            onClick={() => setQuery({ dialog: "create" })}
          >
            <Plus className="size-3.5" />
            Add Account
          </Button>
        </div>
        <DataTable
          data={adminList ?? []}
          columns={column({ metaPage, setQuery })}
          isLoading={isPending || isRefetching}
        />
        <Pagination
          pagination={{ ...metaPage, current: page, limit }}
          setPagination={setPage}
          setLimit={setLimit}
          disabled={isPending || isRefetching}
        />
      </div>

      <Dialog open={!!dialog} onOpenChange={handleClose}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {adminId ? "Update" : "Create"}
              {dialog === "password" && " Password"} Admin Account
            </DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {adminId && isPendingAccount && dialog === "edit" ? (
            <div className="flex flex-col gap-1 w-full items-center justify-center h-[200px]">
              <LoaderIcon className="size-5 animate-spin" />
              <p className="ml-2 text-sm animate-pulse">Loading...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {dialog !== "password" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <LabelInput
                      label="Name"
                      id="name"
                      placeholder="Type name"
                      value={input.name}
                      onChange={handleChange}
                      autoFocus
                      disabled={isLoading}
                    />
                    <MessageInputError error={errors.name} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <LabelInput
                      label="Email"
                      type="email"
                      id="email"
                      placeholder="Type email"
                      value={input.email}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <MessageInputError error={errors.email} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <LabelInput
                      label="Phone"
                      isPhone
                      id="phone"
                      placeholder="Type phone number"
                      value={input.phone}
                      onChange={handleChange}
                      dialCode={dialCode}
                      setDialCode={setDialCode}
                      isNested
                      disabled={isLoading}
                    />
                    <MessageInputError error={errors.phone} />
                  </div>
                </>
              )}
              {dialog !== "edit" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <LabelInput
                      label="Password"
                      isPassword
                      id="password"
                      placeholder="Type password"
                      value={input.password}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <MessageInputError
                      error={
                        errors.password ??
                        (input.password &&
                          input.password.length < 8 &&
                          "Password at least 8 character")
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <LabelInput
                      label="Confirm password"
                      isPassword
                      id="confirm_password"
                      placeholder="Type confirm password"
                      value={input.confirm_password}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <MessageInputError
                      error={
                        input.password &&
                        input.confirm_password &&
                        input.password !== input.confirm_password &&
                        "Password and Confirm Password do not match"
                      }
                    />
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant={"outline"}
              onClick={handleClose}
              disabled={isLoading}
            >
              <XIcon />
              Cancel
            </Button>
            <Button
              disabled={
                !isChanged ||
                isLoading ||
                (dialog === "create" &&
                  (!input.name ||
                    !input.email ||
                    !input.phone ||
                    !input.password ||
                    input.password.length < 8 ||
                    !input.confirm_password ||
                    input.password !== input.confirm_password)) ||
                (dialog === "edit" &&
                  (!input.name || !input.email || !input.phone)) ||
                (dialog === "password" &&
                  (!input.password ||
                    input.password.length < 8 ||
                    !input.confirm_password ||
                    input.password !== input.confirm_password))
              }
              onClick={handleSubmit}
            >
              <Send />
              {adminId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
