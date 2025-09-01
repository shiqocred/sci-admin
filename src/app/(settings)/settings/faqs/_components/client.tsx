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
  useCreateFaq,
  useDeleteFaq,
  useGetFaq,
  useGetFaqs,
  useUpdateFaq,
  useUpdatePosition,
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
import { useConfirm } from "@/hooks/use-confirm";

const filterField = [
  { name: "Question", value: "question" },
  { name: "Position", value: "position" },
];

const initialValue = {
  question: "",
  answer: "",
};

export const Client = () => {
  const [{ sort, order, faqId, dialog }, setQuery] = useQueryStates(
    {
      sort: parseAsString.withDefault("position"),
      order: parseAsString.withDefault("asc"),
      faqId: parseAsString.withDefault(""),
      dialog: parseAsString.withDefault(""),
    },
    {
      urlKeys: {
        faqId: "id",
      },
    }
  );

  const [input, setInput] = useState(initialValue);
  const [errors, setErrors] = useState(initialValue);

  const [DeleteDialog, confirmDelete] = useConfirm(
    `Delete selected Faq?`,
    "This action cannot be undone",
    "destructive"
  );

  const { mutate: createFaq, isPending: isCreating } = useCreateFaq();
  const { mutate: updateFaq, isPending: isUpdating } = useUpdateFaq();
  const { mutate: deleteFaq, isPending: isDeleting } = useDeleteFaq();
  const { mutate: updatePosition, isPending: isPositioning } =
    useUpdatePosition();

  const { page, metaPage, limit, setLimit, setPage, setPagination } =
    usePagination();
  const { search, searchValue, setSearch } = useSearchQuery();
  const { data, isPending, refetch, isRefetching, isSuccess } = useGetFaqs({
    q: searchValue,
    p: page,
    limit,
    order,
    sort,
  });
  const { data: detailFaq, isPending: isPendingFaq } = useGetFaq({
    faqId,
    edit: dialog === "edit",
  });

  const isLoading =
    isPending ||
    isRefetching ||
    isCreating ||
    isUpdating ||
    isPositioning ||
    isDeleting;

  const faqList = useMemo(() => data?.data.data, [data]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClose = () => {
    if (dialog) {
      setQuery({
        dialog: "",
        faqId: "",
      });
    }
  };

  const handleSubmit = (e: MouseEvent) => {
    e.preventDefault();
    const body = {
      question: input.question,
      answer: input.answer,
    };
    if (dialog === "create") {
      createFaq(
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
      updateFaq(
        { body, params: { id: faqId } },
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

  const handleMove = (direction: "up" | "down", id: string) => {
    updatePosition({ body: { direction }, params: { id } });
  };
  const handleDelete = async (id: string) => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteFaq({ params: { id } });
  };

  // Cek apakah ada perubahan pada data
  const isChanged = useMemo(() => {
    if (faqId && dialog === "edit") {
      return (
        input.question !== detailFaq?.data.question ||
        input.answer !== detailFaq?.data.answer
      );
    }
    return true;
  }, [input, detailFaq]);

  useEffect(() => {
    if (detailFaq) {
      const detail = detailFaq.data;
      setInput({
        question: detail.question ?? "",
        answer: detail.answer ?? "",
      });
    }
  }, [detailFaq]);

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data.data.pagination);
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (faqId && dialog !== "edit") {
      setQuery({
        faqId: "",
        dialog: "",
      });
    }
    if (!faqId && !dialog) {
      setInput(initialValue);
      setErrors(initialValue);
    }
  }, [faqId, dialog]);

  return (
    <div className="w-full flex-col gap-4 flex">
      <DeleteDialog />
      <h2 className="text-lg font-semibold">FAQ&apos;s</h2>
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center w-full justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center group">
              <Input
                className="h-8 focus-visible:ring-0 shadow-none w-52 placeholder:text-xs"
                placeholder="Search faq..."
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
              isCustom
            />
          </div>
          <Button
            size={"sm"}
            className="text-xs"
            onClick={() => setQuery({ dialog: "create" })}
          >
            <Plus className="size-3.5" />
            Add Faq
          </Button>
        </div>
        <DataTable
          data={faqList ?? []}
          columns={column({ metaPage, setQuery, handleMove, handleDelete })}
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
            <DialogTitle>{faqId ? "Update" : "Create"} Faq</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {faqId && isPendingFaq && dialog === "edit" ? (
            <div className="flex flex-col gap-1 w-full items-center justify-center h-[200px]">
              <LoaderIcon className="size-5 animate-spin" />
              <p className="ml-2 text-sm animate-pulse">Loading...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <LabelInput
                  label="Question"
                  id="question"
                  placeholder="Type question"
                  value={input.question}
                  onChange={handleChange}
                  autoFocus
                  disabled={isLoading}
                />
                <MessageInputError error={errors.question} />
              </div>
              <div className="flex flex-col gap-1.5">
                <LabelInput
                  label="Answer"
                  id="answer"
                  placeholder="Type answer"
                  value={input.answer}
                  onChange={handleChange}
                  autoFocus
                  disabled={isLoading}
                />
                <MessageInputError error={errors.answer} />
              </div>
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
                !isChanged || isLoading || !input.question || !input.answer
              }
              onClick={handleSubmit}
            >
              <Send />
              {faqId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
