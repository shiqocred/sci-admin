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
import { generateRandomNumber } from "@/lib/utils";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import slugify from "slugify";
import {
  useCreateCategory,
  useGetShowCategory,
  useUpdateCategory,
} from "../../_api";

const initialValue = {
  name: "",
  slug: "",
};

export const CreateEditDialog = ({
  open,
  onOpenChange,
  categoryId,
}: {
  open: boolean;
  onOpenChange: () => void;
  categoryId: string;
}) => {
  const [input, setInput] = useState(initialValue);
  const [randomCode, setRandomCode] = useState(generateRandomNumber());
  const [isGenerating, setIsGenerating] = useState(false); // trigger dari luar

  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateeCategory, isPending: isUpdateing } =
    useUpdateCategory();
  const { data, isPending, isSuccess } = useGetShowCategory({
    categoryId,
    open,
  });

  const loading = isCreating || isUpdateing || (isPending && !!categoryId);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target;
    setInput((prev) => ({ ...prev, [v.id]: v.value }));
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (categoryId) {
      return updateeCategory(
        { body: input, params: { id: categoryId } },
        {
          onSuccess: () => {
            setIsGenerating(true);
            onOpenChange();
          },
        }
      );
    }
    return createCategory(
      { body: input },
      {
        onSuccess: () => {
          setIsGenerating(true);
          onOpenChange();
        },
      }
    );
  };

  useEffect(() => {
    if (isGenerating) {
      setRandomCode(generateRandomNumber());
      setIsGenerating(false); // reset trigger
    }
  }, [isGenerating]);

  useEffect(() => {
    if (data && isSuccess) {
      const category = data.data;
      setInput({
        name: category.name,
        slug: category.slug,
      });
      // get unique code in last slug
      const getUnique = category.slug.match(/-(\d+)$/);
      const unique = getUnique ? getUnique[1] : "";
      setRandomCode(unique);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    const slug = slugify(input.name, { lower: true });
    const slugFormated = slug.length > 0 ? `${slug}-${randomCode}` : "";

    setInput((prev) => ({ ...prev, slug: slugFormated }));
  }, [input.name]);

  useEffect(() => {
    if (!open) {
      setInput(initialValue);
    }
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{categoryId ? "Edit" : "Create"} Category</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <form onSubmit={handleCreate} className="gap-6 flex flex-col">
          {categoryId && isPending ? (
            <div className="flex flex-col gap-3">
              <LabelInput label="Name" isLoading />
              <LabelInput label="Slug" isLoading />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <LabelInput
                label="Name"
                id="name"
                value={input.name}
                onChange={handleChange}
                placeholder="e.g. Example Slug"
              />
              <LabelInput
                label="Slug"
                id="slug"
                value={input.slug}
                disabled
                className="disabled:opacity-100 disabled:pointer-events-auto"
                placeholder="e.g. example-slug-63473"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              disabled={loading}
              type="button"
              variant={"outline"}
              onClick={onOpenChange}
            >
              Cancel
            </Button>
            <Button disabled={loading} type="submit">
              {categoryId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
