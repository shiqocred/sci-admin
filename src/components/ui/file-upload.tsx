import { cn, sizesImage } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { useDropzone } from "react-dropzone";
import { Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { Button } from "./button";

export const FileUpload = ({
  onChange,
  imageOld,
  setImageOld,
}: {
  onChange?: (files: File) => void;
  imageOld?: string | null;
  setImageOld?: any;
}) => {
  const [files, setFiles] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFiles(newFiles[0]);
      if (onChange) {
        onChange(newFiles[0]);
      }
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full flex gap-3" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className={cn(
          "group/file block rounded-lg cursor-pointer w-full relative",
          (files || imageOld) && "w-32"
        )}
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        {/* <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div> */}
        <div className="relative w-full h-32 border rounded-md mt-0 overflow-hidden">
          {!files && imageOld && (
            <div className={cn("relative z-40 size-full group")}>
              <div className="absolute left-0 top-0 size-full hidden transition-all items-center flex-col justify-center z-10 bg-white/50 backdrop-blur-md text-sm font-medium gap-2 group-hover:flex">
                <UploadCloud className="size-5" />
                Change Image
              </div>
              <Image
                src={imageOld}
                alt="Image"
                fill
                sizes={sizesImage}
                className="object-cover"
              />
            </div>
          )}
          {((files && imageOld) || (files && !imageOld)) && (
            <motion.div className={cn("relative z-40 size-full group")}>
              <div className="absolute left-0 top-0 size-full hidden transition-all items-center flex-col justify-center z-10 bg-white/50 backdrop-blur-md text-sm font-medium gap-2 group-hover:flex">
                <UploadCloud className="size-5" />
                Change Image
              </div>
              <Image
                src={URL.createObjectURL(files)}
                alt="Image"
                fill
                sizes={sizesImage}
                className="object-cover"
              />
            </motion.div>
          )}
          {!files && !imageOld && (
            <div className="w-full h-full flex flex-col items-center justify-center hover:bg-gray-100">
              {isDragActive ? (
                <div className="flex items-center gap-3 text-sm">
                  <UploadCloud className="size-4" />
                  Drop it
                </div>
              ) : (
                <>
                  <p className="relative z-20 font-sans font-bold text-neutral-700 text-sm">
                    Upload Image
                  </p>
                  <p className="relative z-20 font-sans font-normal text-neutral-500 text-xs mt-1">
                    Drag or drop your files here or click to upload
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
      {(files || imageOld) && (
        <Button
          variant={"outline"}
          type="button"
          className="border-red-400 text-red-400 hover:bg-red-50 hover:text-red-500"
          onClick={() => {
            if (files) {
              setFiles(null);
            } else {
              setImageOld("");
            }
          }}
        >
          <Trash2 />
          Remove Image
        </Button>
      )}
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
