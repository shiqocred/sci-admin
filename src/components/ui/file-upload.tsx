import { cn, sizesImage } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Trash2, UploadCloud, Plus } from "lucide-react";
import Image from "next/image";
import { Button } from "./button";

export const FileUpload = ({
  onChange,
  imageOld = [],
  setImageOld,
  multiple = true,
}: {
  onChange?: (files: File[] | File) => void;
  imageOld?: string[] | string | null;
  setImageOld?: (images: string[] | string | null) => void;
  multiple?: boolean;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [showAll, setShowAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PREVIEW_LIMIT = 7;

  const handleFileChange = (newFiles: File[]) => {
    const updatedFiles = multiple ? [...files, ...newFiles] : [newFiles[0]];
    setFiles(updatedFiles);
    if (onChange) {
      onChange(multiple ? updatedFiles : newFiles[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  const removeFile = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
    if (onChange) onChange(multiple ? updated : updated[0]);
  };

  const removeOldImage = (index: number) => {
    if (!Array.isArray(imageOld)) return setImageOld?.(null);
    const updated = [...imageOld];
    updated.splice(index, 1);
    setImageOld?.(updated.length > 0 ? updated : null);
  };

  const allImages = [
    ...(Array.isArray(imageOld) ? imageOld : imageOld ? [imageOld] : []),
    ...files.map((f) => URL.createObjectURL(f)),
  ];

  const imageOldLength = Array.isArray(imageOld)
    ? imageOld.length
    : imageOld
      ? 1
      : 0;

  const visibleImages = showAll ? allImages : allImages.slice(0, PREVIEW_LIMIT);
  const extraCount = allImages.length - PREVIEW_LIMIT;

  return (
    <div className="w-full flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
        className="hidden"
        multiple={multiple}
      />

      {allImages.length > 0 && (
        <div className="grid grid-cols-6 auto-rows-[1fr] gap-2">
          {visibleImages.map((src, index) => {
            const isOld = index < imageOldLength;
            return (
              <div
                key={`${src}-${index}`}
                className={cn(
                  "relative group size-full aspect-square rounded-md overflow-hidden border",
                  index === 0 && "col-span-2 row-span-2"
                )}
              >
                <Image
                  src={src}
                  alt={`image-${index}`}
                  fill
                  sizes={sizesImage}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 backdrop-blur-sm">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-white hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isOld) {
                        removeOldImage(index);
                      } else {
                        removeFile(index - imageOldLength);
                      }
                    }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            );
          })}

          {!showAll && extraCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="relative size-full aspect-square rounded-md border flex items-center justify-center bg-neutral-200/60 hover:bg-neutral-300"
            >
              <span className="text-lg font-semibold text-neutral-800">
                +{extraCount}
              </span>
            </button>
          )}

          {multiple && (
            <button
              type="button"
              onClick={handleClick}
              className="size-full aspect-square border-dashed border rounded-md flex items-center justify-center hover:bg-gray-100 group"
            >
              <div className="text-center">
                <Plus className="w-6 h-6 mx-auto text-neutral-500 group-hover:text-neutral-700" />
                <p className="text-xs text-neutral-500 group-hover:text-neutral-700">
                  Add Photo
                </p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Drag & Drop Area saat kosong */}
      {!allImages.length && (
        <div
          {...getRootProps()}
          className="w-full h-32 border border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 text-center bg-transparent gap-0"
          onClick={handleClick}
        >
          {isDragActive ? (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <UploadCloud className="w-4 h-4" />
              Drop files here
            </div>
          ) : (
            <>
              <UploadCloud className="w-5 h-5 text-neutral-500 mb-1" />
              <p className="text-sm font-medium text-neutral-700">
                Upload Image
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Drag & drop or click to upload
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
