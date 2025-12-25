"use client";

import { LoaderIcon } from "lucide-react";
import {
  useGetStore,
  useUpdateService,
  useUpdateSosmed,
  useUpdateStore,
} from "../_api";
import { FormSection } from "./form";

export type UpdateSosmedType = ReturnType<typeof useUpdateSosmed>["mutate"];
export type UpdateServiceType = ReturnType<typeof useUpdateService>["mutate"];
export type UpdateStoreType = ReturnType<typeof useUpdateStore>["mutate"];
export type GetStoreType = NonNullable<ReturnType<typeof useGetStore>["data"]>;

export const Client = () => {
  const { mutate: updateSosmed, isPending: isUpdatingSosmed } =
    useUpdateSosmed();
  const { mutate: updateService, isPending: isUpdatingService } =
    useUpdateService();
  const { mutate: updateStore, isPending: isUpdatingStore } = useUpdateStore();
  const { data } = useGetStore();

  return (
    <div className="w-full flex-col flex">
      {!data ? (
        <div className="flex flex-col gap-1 w-full h-[300px] justify-center items-center">
          <LoaderIcon className="animate-spin size-5" />
          <p className="ml-2 animate-pulse text-sm">Loading...</p>
        </div>
      ) : (
        <FormSection
          updateSosmed={updateSosmed}
          updateService={updateService}
          updateStore={updateStore}
          isUpdatingSosmed={isUpdatingSosmed}
          isUpdatingService={isUpdatingService}
          isUpdatingStore={isUpdatingStore}
          data={data}
        />
      )}
    </div>
  );
};
