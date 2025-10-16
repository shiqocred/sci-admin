"use client";

import { Button } from "@/components/ui/button";
import { Loader2Icon, LoaderIcon, Save } from "lucide-react";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { LabelInput } from "@/components/label-input";
import {
  useGetStore,
  useUpdateService,
  useUpdateSosmed,
  useUpdateStore,
} from "../_api";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export const Client = () => {
  const [sosmed, setSosmed] = useState({
    facebook: "",
    linkedin: "",
    instagram: "",
  });
  const [store, setStore] = useState({
    name: "",
    phone: "",
  });

  const [service, setService] = useState({
    whatsapp: "",
    message: "",
  });

  const { mutate: updateSosmed, isPending: isUpdatingSosmed } =
    useUpdateSosmed();
  const { mutate: updateService, isPending: isUpdatingService } =
    useUpdateService();
  const { mutate: updateStore, isPending: isUpdatingStore } = useUpdateStore();
  const { data, isPending, isSuccess } = useGetStore();

  const handleStore = (e: FormEvent) => {
    e.preventDefault();
    updateStore({ body: store });
  };
  const handleSosmed = (e: FormEvent) => {
    e.preventDefault();
    updateSosmed({ body: sosmed });
  };
  const handleService = (e: FormEvent) => {
    e.preventDefault();
    updateService({ body: service });
  };

  const isUpdateService = useMemo(() => {
    const serviceData = data?.data.service;
    return (
      serviceData?.message !== service.message ||
      serviceData.whatsapp !== service.whatsapp
    );
  }, [data, service]);
  const isUpdateStore = useMemo(() => {
    const storeData = data?.data.store;
    return storeData?.name !== store.name || storeData.phone !== store.phone;
  }, [data, store]);
  const isUpdateSosmed = useMemo(() => {
    const sosmedData = data?.data.sosmed;
    return (
      sosmedData?.facebook !== sosmed.facebook ||
      sosmedData.instagram !== sosmed.instagram ||
      sosmedData.linkedin !== sosmed.linkedin
    );
  }, [data, store]);

  useEffect(() => {
    if (data && isSuccess) {
      const storeData = data.data.store;
      const sosmedData = data.data.sosmed;
      const serviceData = data.data.service;
      setSosmed({
        facebook: sosmedData.facebook ?? "",
        linkedin: sosmedData.linkedin ?? "",
        instagram: sosmedData.instagram ?? "",
      });
      setStore({
        name: storeData.name ?? "",
        phone: storeData.phone ?? "",
      });
      setService({
        whatsapp: serviceData.whatsapp ?? "",
        message: serviceData.message ?? "",
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
          <form onSubmit={handleStore} className="flex flex-col gap-4">
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
              label="Phone"
              placeholder="e.g. 0217228383"
              value={store.phone}
              onChange={(e) =>
                setStore((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
            <div className="w-full flex justify-end">
              <Button
                type="submit"
                disabled={isUpdatingStore || !isUpdateStore}
              >
                {isUpdatingStore ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <Save />
                )}
                {isUpdatingStore ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
          <Separator />
          <form onSubmit={handleService} className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Customer Service</h3>
            <div className="flex flex-col gap-1">
              <Label>WhatsApp</Label>
              <div className="flex items-center flex-row-reverse">
                <Input
                  placeholder="e.g. 88888888888"
                  className="rounded-l-none border-l-0 border-gray-300 focus-visible:border-gray-500 focus-visible:ring-0 peer"
                  value={service.whatsapp}
                  onChange={(e) =>
                    setService((prev) => ({
                      ...prev,
                      whatsapp: e.target.value,
                    }))
                  }
                />
                <div className="text-sm h-9 rounded-l-md border border-gray-300 border-r-0 bg-gray-300 flex items-center justify-center px-3 font-medium peer-focus-visible:border-gray-500">
                  +62
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Initial Message</Label>
              <Textarea
                placeholder="e.g. Hello admin..."
                value={service.message}
                onChange={(e) =>
                  setService((prev) => ({ ...prev, message: e.target.value }))
                }
                className="border-gray-300 focus-visible:border-gray-500 focus-visible:ring-0 min-h-24"
              />
            </div>
            <div className="w-full flex justify-end">
              <Button
                type="submit"
                disabled={isUpdatingService || !isUpdateService}
              >
                {isUpdatingService ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <Save />
                )}
                {isUpdatingService ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
          <Separator />
          <form onSubmit={handleSosmed} className="flex flex-col gap-4">
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
              <Button disabled={isUpdatingSosmed || !isUpdateSosmed}>
                {isUpdatingSosmed ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <Save />
                )}
                {isUpdatingSosmed ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
