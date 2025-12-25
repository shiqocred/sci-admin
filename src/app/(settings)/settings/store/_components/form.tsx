import React, { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LabelInput } from "@/components/label-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  GetStoreType,
  UpdateServiceType,
  UpdateSosmedType,
  UpdateStoreType,
} from "./client";
import { Loader2Icon, Save } from "lucide-react";

interface FormSectionProps {
  updateStore: UpdateStoreType;
  updateSosmed: UpdateSosmedType;
  updateService: UpdateServiceType;
  data: GetStoreType;
  isUpdatingSosmed: boolean;
  isUpdatingService: boolean;
  isUpdatingStore: boolean;
}

export const FormSection = ({
  data,
  updateStore,
  updateSosmed,
  updateService,
  isUpdatingSosmed,
  isUpdatingService,
  isUpdatingStore,
}: FormSectionProps) => {
  const [sosmed, setSosmed] = useState({
    facebook: data.data.sosmed.facebook ?? "",
    linkedin: data.data.sosmed.linkedin ?? "",
    instagram: data.data.sosmed.instagram ?? "",
  });
  const [store, setStore] = useState({
    name: data.data.store.name ?? "",
    phone: data.data.store.phone ?? "",
  });

  const [service, setService] = useState({
    whatsapp: data.data.service.whatsapp ?? "",
    message: data.data.service.message ?? "",
  });

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

  const isUpdateService =
    data.data.service.message !== service.message ||
    data.data.service.whatsapp !== service.whatsapp;

  const isUpdateStore =
    data.data.store.name !== store.name ||
    data.data.store.phone !== store.phone;

  const isUpdateSosmed =
    data?.data.sosmed.facebook !== sosmed.facebook ||
    data?.data.sosmed.instagram !== sosmed.instagram ||
    data?.data.sosmed.linkedin !== sosmed.linkedin;
  return (
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
          <Button type="submit" disabled={isUpdatingStore || !isUpdateStore}>
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
  );
};
