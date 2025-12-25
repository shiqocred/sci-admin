import { FormEvent, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader } from "lucide-react";
import { LabelInput } from "@/components/label-input";
import { pronoun, sizesImage } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import {
  GetCouriersType,
  GetExpiredType,
  GetLocationType,
  UpdateCouriersType,
  UpdateExpiredType,
  UpdateLocationType,
} from "./client";

interface FormSectionProps {
  updateExpired: UpdateExpiredType;
  updateLocation: UpdateLocationType;
  updateCourier: UpdateCouriersType;
  dataCouriers: GetCouriersType;
  dataLocation: GetLocationType;
  dataExpired: GetExpiredType;
  isUpdatingCourier: boolean;
  isUpdatingLocation: boolean;
  isUpdatingExpired: boolean;
  isGettingCouriers: boolean;
  isGettingLocation: boolean;
  isGettingExpired: boolean;
}

const parseGMapsUrl = (
  url: string,
): { latitude: number; longitude: number } | null => {
  if (url.length === 0 || !url.startsWith("https://www.google.com/maps"))
    return null;

  const urlObj = new URL(url);
  const path = urlObj.pathname;
  const match = path.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),/);

  if (!match) return null;

  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);

  if (isNaN(lat) && isNaN(lng)) return null;

  return { latitude: lat, longitude: lng };
};

export const FormSection = ({
  isUpdatingCourier,
  isUpdatingLocation,
  isUpdatingExpired,
  isGettingCouriers,
  isGettingLocation,
  isGettingExpired,
  updateCourier,
  updateLocation,
  updateExpired,
  dataCouriers,
  dataLocation,
  dataExpired,
}: FormSectionProps) => {
  const [expired, setExpired] = useState(dataExpired.data ?? "1");
  const [type, setType] = useState<"manual" | "auto">("manual");
  const [location, setLocation] = useState({
    latitude: dataLocation.data?.lat ?? "",
    longitude: dataLocation.data?.long ?? "",
    address: dataLocation.data?.address ?? "",
  });
  const [gMapsURL, setGMapsURL] = useState("");

  const [couriers, setCouriers] = useState<
    {
      id: string;
      name: string;
      value: string;
      status: boolean;
    }[]
  >(dataCouriers.data ?? []);

  const parsedGMaps = parseGMapsUrl(gMapsURL);

  const handleUpdateCouriers = (e: FormEvent) => {
    e.preventDefault();

    const body = couriers.map((c) => ({ id: c.id, status: c.status }));
    updateCourier({
      body,
    });
  };

  const handleUpdateLocation = (e: FormEvent) => {
    e.preventDefault();

    updateLocation(
      {
        body: {
          lat:
            type === "manual"
              ? location.latitude
              : (parsedGMaps?.latitude.toString() ?? ""),
          long:
            type === "manual"
              ? location.longitude
              : (parsedGMaps?.longitude.toString() ?? ""),
          address: location.address,
        },
      },
      {
        onSuccess: () => {
          if (type === "auto") {
            setType("manual");
            setGMapsURL("");
          }
        },
      },
    );
  };
  const handleUpdateExpired = (e: FormEvent) => {
    e.preventDefault();
    updateExpired({
      body: { expired },
    });
  };
  const isInvalidGMapsUrl =
    gMapsURL.length > 0 &&
    (!parsedGMaps || !gMapsURL.startsWith("https://www.google.com/maps"));

  const isValidGMapsUrl =
    gMapsURL.length > 0 &&
    !!parsedGMaps &&
    gMapsURL.startsWith("https://www.google.com/maps");

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Payment Expired</h3>
        {isGettingExpired ? (
          <div className="h-40 flex items-center justify-center flex-col gap-1">
            <Loader className="size-6 animate-spin -mt-3" />
            <p className="text-sm ml-2">Loading...</p>
          </div>
        ) : (
          <Select value={expired} onValueChange={setExpired}>
            <SelectTrigger className="w-full border-gray-300 focus-visible:ring-0 focus-visible:border-gray-500 data-[state=open]:border-gray-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup className="max-h-56 overflow-y-auto">
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={`${i + 1}`}>
                    {i + 1} Hour{pronoun(i + 1)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
        <div className="flex items-center justify-end">
          <Button onClick={handleUpdateExpired} disabled={isUpdatingExpired}>
            {isUpdatingExpired ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Store Address</h3>
        {isGettingLocation ? (
          <div className="h-40 flex items-center justify-center flex-col gap-1">
            <Loader className="size-6 animate-spin -mt-3" />
            <p className="text-sm ml-2">Loading...</p>
          </div>
        ) : (
          <div className="flex items-center flex-col justify-center w-full gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-200 w-full">
              <AlertCircle className="size-4" />
              <p className="text-xs">
                Please fill in the latitude and longitude manually or by using a
                Google Maps URL.
              </p>
            </div>
            <Tabs
              value={type}
              onValueChange={(e) => setType(e as "manual" | "auto")}
              className="w-full"
            >
              <TabsList>
                <TabsTrigger value="manual" className="text-xs h-7">
                  Manual
                </TabsTrigger>
                <TabsTrigger value="auto" className="text-xs h-7">
                  Google Maps URL
                </TabsTrigger>
              </TabsList>
              <TabsContent value="manual" className="w-full">
                <div className="grid grid-cols-2 gap-4 w-full">
                  <LabelInput
                    label="Latitude"
                    placeholder="e.g. -6.1670162"
                    type="number"
                    value={location.latitude}
                    onChange={(e) =>
                      setLocation((prev) => ({
                        ...prev,
                        latitude: e.target.value,
                      }))
                    }
                  />
                  <LabelInput
                    label="Longitude"
                    placeholder="e.g. 106.9453995"
                    type="number"
                    value={location.longitude}
                    onChange={(e) =>
                      setLocation((prev) => ({
                        ...prev,
                        longitude: e.target.value,
                      }))
                    }
                  />
                </div>
              </TabsContent>
              <TabsContent value="auto">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <LabelInput
                      label="Google Maps URL"
                      placeholder="e.g. https://www.google.com/maps..."
                      value={gMapsURL}
                      onChange={(e) => setGMapsURL(e.target.value)}
                    />
                    {isInvalidGMapsUrl && (
                      <p className="text-xs before:content-['*'] before:pr-1 text-red-500">
                        {!parsedGMaps
                          ? "Latitude and longitude could not be extracted from this URL."
                          : "Please enter a valid URL that starts with 'https://www.google.com/maps'."}
                      </p>
                    )}
                  </div>
                  {isValidGMapsUrl && (
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <LabelInput
                        label="Latitude"
                        placeholder="e.g. -6.1670162"
                        className="cursor-not-allowed"
                        defaultValue={parsedGMaps.latitude}
                        readOnly
                      />
                      <LabelInput
                        label="Longitude"
                        placeholder="e.g. 106.9453995"
                        className="cursor-not-allowed"
                        defaultValue={parsedGMaps.longitude}
                        readOnly
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex flex-col gap-1">
              <Label>Address</Label>
              <Textarea
                placeholder="e.g. Jl. RS Fatmawati No. 39..."
                value={location.address}
                onChange={(e) =>
                  setLocation((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                className="border-gray-300 focus-visible:border-gray-500 focus-visible:ring-0 min-h-24"
              />
            </div>
          </div>
        )}
        <div className="flex items-center justify-end">
          <Button onClick={handleUpdateLocation} disabled={isUpdatingLocation}>
            {isUpdatingLocation ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Available Couriers</h3>
        {isGettingCouriers ? (
          <div className="h-40 flex items-center justify-center flex-col gap-1">
            <Loader className="size-6 animate-spin -mt-3" />
            <p className="text-sm ml-2">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {couriers &&
              couriers.length > 0 &&
              couriers.map((courier) => (
                <Label
                  key={courier.id}
                  className="w-full border rounded-md p-2 flex items-center gap-2"
                >
                  <div className="size-14 flex-none flex items-center justify-center border rounded overflow-hidden">
                    <div className="size-10 relative">
                      <Image
                        src={`/images/couriers/${courier.value}.png`}
                        fill
                        alt={courier.value}
                        sizes={sizesImage}
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <p className="whitespace-normal font-medium">
                    {courier.name}
                  </p>
                  <Switch
                    className="ml-auto"
                    checked={courier.status}
                    onCheckedChange={(e) =>
                      setCouriers((prev) =>
                        prev
                          ? prev.map((item) =>
                              item.id === courier.id
                                ? { ...item, status: e }
                                : item,
                            )
                          : [],
                      )
                    }
                  />
                </Label>
              ))}
          </div>
        )}
        <div className="flex items-center justify-end">
          <Button onClick={handleUpdateCouriers} disabled={isUpdatingCourier}>
            {isUpdatingCourier ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};
