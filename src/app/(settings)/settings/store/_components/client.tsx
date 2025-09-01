"use client";

import { Button } from "@/components/ui/button";
import { Loader2Icon, LoaderIcon, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { LabelInput } from "@/components/label-input";
import { useGetStore, useUpdateSosmed, useUpdateStore } from "../_api";

export const Client = () => {
  const [sosmed, setSosmed] = useState({
    facebook: "",
    linkedin: "",
    instagram: "",
  });
  const [store, setStore] = useState({
    name: "",
    address: "",
    phone: "",
    whatsapp: "",
  });

  const { mutate: updateSosmed, isPending: isUpdatingSosmed } =
    useUpdateSosmed();
  const { mutate: updateStore, isPending: isUpdatingStore } = useUpdateStore();
  const { data, isPending, isSuccess } = useGetStore();

  const handleStore = () => {
    updateStore({ body: store });
  };
  const handleSosmed = () => {
    updateSosmed({ body: sosmed });
  };

  useEffect(() => {
    if (data && isSuccess) {
      const storeData = data.data.store;
      const sosmedData = data.data.sosmed;
      setSosmed({
        facebook: sosmedData.facebook ?? "",
        linkedin: sosmedData.linkedin ?? "",
        instagram: sosmedData.instagram ?? "",
      });
      setStore({
        name: storeData.name ?? "",
        address: storeData.address ?? "",
        phone: storeData.phone ?? "",
        whatsapp: storeData.whatsapp ?? "",
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
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Store</h3>
            <LabelInput
              label="Name"
              placeholder="e.g. PT. Sehat Cerah Indonesia"
              value={store.name}
              onChange={(e) =>
                setStore((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <LabelInput
              label="Address"
              placeholder="e.g. Jl. RS Fatmawati No. 39..."
              value={store.address}
              onChange={(e) =>
                setStore((prev) => ({ ...prev, address: e.target.value }))
              }
            />
            <div className="flex gap-4 items-center">
              <LabelInput
                label="Phone"
                placeholder="e.g. 0217228383"
                value={store.phone}
                onChange={(e) =>
                  setStore((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
              <LabelInput
                label="WhatsApp"
                placeholder="e.g. 088888888888"
                value={store.whatsapp}
                onChange={(e) =>
                  setStore((prev) => ({ ...prev, whatsapp: e.target.value }))
                }
              />
            </div>
            <div className="w-full flex justify-end">
              <Button onClick={handleStore} disabled={isUpdatingStore}>
                {isUpdatingStore ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <Save />
                )}
                {isUpdatingStore ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Sosmed</h3>
            <LabelInput
              label="Facebook"
              placeholder="e.g. 'https://web.facebook.com/'..."
              value={sosmed.facebook}
              onChange={(e) =>
                setSosmed((prev) => ({ ...prev, facebook: e.target.value }))
              }
            />
            <LabelInput
              label="LinkedIn"
              placeholder="e.g. 'https://www.linkedin.com/in/'..."
              value={sosmed.linkedin}
              onChange={(e) =>
                setSosmed((prev) => ({ ...prev, linkedin: e.target.value }))
              }
            />
            <LabelInput
              label="Instagram"
              placeholder="e.g. 'https://www.instagram.com/'..."
              value={sosmed.instagram}
              onChange={(e) =>
                setSosmed((prev) => ({ ...prev, instagram: e.target.value }))
              }
            />
            <div className="w-full flex justify-end">
              <Button onClick={handleSosmed} disabled={isUpdatingSosmed}>
                {isUpdatingSosmed ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <Save />
                )}
                {isUpdatingSosmed ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
