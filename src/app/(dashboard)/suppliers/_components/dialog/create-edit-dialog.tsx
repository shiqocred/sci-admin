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
  useCreateSupplier,
  useGetShowSupplier,
  useUpdateSupplier,
} from "../../_api";
import { FileUpload } from "@/components/ui/file-upload";

const initialValue = {
  name: "",
  slug: "",
  image: null as File | null,
  imageOld: "" as string | null,
};

export const CreateEditDialog = ({
  open,
  onOpenChange,
  supplierId,
}: {
  open: boolean;
  onOpenChange: () => void;
  supplierId: string;
}) => {
  const [input, setInput] = useState(initialValue);
  const [randomCode, setRandomCode] = useState(generateRandomNumber());
  const [isGenerating, setIsGenerating] = useState(false); // trigger dari luar

  const { mutate: createSupplier, isPending: isCreating } = useCreateSupplier();
  const { mutate: UpdateSupplier, isPending: isupdating } = useUpdateSupplier();
  const { data, isPending, isSuccess } = useGetShowSupplier({
    supplierId,
    open,
  });

  const loading = isCreating || isupdating || (isPending && !!supplierId);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target;
    setInput((prev) => ({ ...prev, [v.id]: v.value }));
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const body = new FormData();
    body.append("name", input.name);
    body.append("slug", input.slug);
    if (input.image) {
      body.append("image", input.image);
    }

    if (supplierId) {
      return UpdateSupplier(
        { body, params: { id: supplierId } },
        {
          onSuccess: () => {
            setIsGenerating(true);
            onOpenChange();
          },
        }
      );
    }

    return createSupplier(
      { body },
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
      const supplier = data.data;
      setInput({
        name: supplier.name,
        slug: supplier.slug,
        image: null,
        imageOld: supplier.image,
      });
      // get unique code in last slug
      const getUnique = supplier.slug.match(/-(\d+)$/);
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
          <DialogTitle>{supplierId ? "Edit" : "Create"} Supplier</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <form onSubmit={handleCreate} className="gap-6 flex flex-col">
          {supplierId && isPending ? (
            <div className="flex flex-col gap-3">
              <LabelInput label="Name" isLoading />
              <LabelInput label="Slug" isLoading />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <FileUpload
                multiple={false}
                imageOld={input.imageOld}
                setImageOld={(e: any) =>
                  setInput((prev) => ({ ...prev, imageOld: e }))
                }
                onChange={(e) =>
                  setInput((prev) => ({ ...prev, image: e as File }))
                }
              />
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
              {supplierId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
