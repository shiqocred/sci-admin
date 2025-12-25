"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetCouriers,
  useGetExpired,
  useGetLocation,
  useUpdateCouriers,
  useUpdateExpired,
  useUpdateLocation,
} from "../_api";
import { FormSection } from "./form";
import { Separator } from "@/components/ui/separator";

export type UpdateExpiredType = ReturnType<typeof useUpdateExpired>["mutate"];
export type UpdateLocationType = ReturnType<typeof useUpdateLocation>["mutate"];
export type UpdateCouriersType = ReturnType<typeof useUpdateCouriers>["mutate"];
export type GetCouriersType = NonNullable<
  ReturnType<typeof useGetCouriers>["data"]
>;
export type GetLocationType = NonNullable<
  ReturnType<typeof useGetLocation>["data"]
>;
export type GetExpiredType = NonNullable<
  ReturnType<typeof useGetExpired>["data"]
>;

export const Client = () => {
  const { mutate: updateCourier, isPending: isUpdatingCourier } =
    useUpdateCouriers();
  const { mutate: updateLocation, isPending: isUpdatingLocation } =
    useUpdateLocation();
  const { mutate: updateExpired, isPending: isUpdatingExpired } =
    useUpdateExpired();

  const { data: dataCouriers, isPending: isGettingCouriers } = useGetCouriers();
  const { data: dataLocation, isPending: isGettingLocation } = useGetLocation();
  const { data: dataExpired, isPending: isGettingExpired } = useGetExpired();

  return (
    <div className="w-full">
      {dataCouriers && dataLocation && dataExpired ? (
        <FormSection
          key={`${JSON.stringify(dataCouriers)}-${JSON.stringify(dataLocation)}-${JSON.stringify(dataExpired)}`}
          isUpdatingCourier={isUpdatingCourier}
          isUpdatingLocation={isUpdatingLocation}
          isUpdatingExpired={isUpdatingExpired}
          isGettingCouriers={isGettingCouriers}
          isGettingLocation={isGettingLocation}
          isGettingExpired={isGettingExpired}
          updateCourier={updateCourier}
          updateLocation={updateLocation}
          updateExpired={updateExpired}
          dataCouriers={dataCouriers}
          dataLocation={dataLocation}
          dataExpired={dataExpired}
        />
      ) : (
        <div className="h-[70vh] flex flex-col gap-4">
          <Skeleton className="w-full h-full" />
          <Separator />
          <Skeleton className="w-full h-full" />
          <Separator />
          <Skeleton className="w-full h-full" />
        </div>
      )}
    </div>
  );
};
