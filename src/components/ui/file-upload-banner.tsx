import { sizesImage } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { Button } from "./button";

export const FileUploadBanner = ({
  onChange,
  imageOld = [],
  setImageOld,
}: {
  onChange?: (files: File[] | File) => void;
  imageOld?: string[] | string | null;
  setImageOld?: (images: string[] | string | null) => void;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    const updatedFiles = [newFiles[0]];
    setFiles(updatedFiles);
    if (onChange) {
      onChange(newFiles[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
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
    if (onChange) onChange(updated[0]);
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

  return (
    <div className="w-full flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
        className="hidden"
        multiple={false}
      />

      {allImages.length > 0 && (
        <div className="w-full aspect-[21/10] flex-none">
          {allImages.map((src, index) => {
            const isOld = index < imageOldLength;
            return (
              <div
                key={`${src}-${index}`}
                className="relative group size-full rounded-md overflow-hidden border border-gray-400"
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
        </div>
      )}

      {/* Drag & Drop Area saat kosong */}
      {!allImages.length && (
        <div
          {...getRootProps()}
          className="w-full h-32 border border-dashed border-gray-400 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 text-center bg-transparent gap-0"
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
