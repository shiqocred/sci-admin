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
import { useCreatePet, useGetShowPet, useUpdatePet } from "../../_api";
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
  petId,
}: {
  open: boolean;
  onOpenChange: () => void;
  petId: string;
}) => {
  const [input, setInput] = useState(initialValue);
  const [randomCode, setRandomCode] = useState(generateRandomNumber());
  const [isGenerating, setIsGenerating] = useState(false); // trigger dari luar

  const { mutate: createPet, isPending: isCreating } = useCreatePet();
  const { mutate: updatePet, isPending: isUpdateing } = useUpdatePet();
  const { data, isPending, isSuccess } = useGetShowPet({
    petId,
    open,
  });

  const loading = isCreating || isUpdateing || (isPending && !!petId);

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

    if (petId) {
      return updatePet(
        { body, params: { id: petId } },
        {
          onSuccess: () => {
            setIsGenerating(true);
            onOpenChange();
          },
        }
      );
    }

    return createPet(
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
          <DialogTitle>{petId ? "Edit" : "Create"} Pet</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <form onSubmit={handleCreate} className="gap-6 flex flex-col">
          {petId && isPending ? (
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
            <Button
              disabled={
                loading ||
                !input.name ||
                (petId ? !input.image && !input.imageOld : !input.image)
              }
              type="submit"
            >
              {petId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
