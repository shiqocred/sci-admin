"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Loader, Locate, XCircle } from "lucide-react";
import React, {
  ChangeEvent,
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { apiGMaps } from "@/config";
import { LabelInput } from "@/components/label-input";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { cn, sizesImage } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MessageInputError } from "@/components/message-input-error";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import {
  useGetCouriers,
  useGetLocation,
  useUpdateCouriers,
  useUpdateLocation,
} from "../_api";

export const Client = () => {
  const [input, setInput] = useState({ latitude: "", longitude: "" });

  const [couriers, setCouriers] = useState<
    {
      id: string;
      name: string;
      value: string;
      status: boolean;
    }[]
  >();

  const { mutate: updateCourier, isPending: isUpdatingCourier } =
    useUpdateCouriers();
  const { mutate: updateLocation, isPending: isUpdatingLocation } =
    useUpdateLocation();

  const { data: dataCouriers, isPending: isGettingCouriers } = useGetCouriers();
  const { data: dataLocation, isPending: isGettingLocation } = useGetLocation();

  const handleUpdateCouriers = (e: MouseEvent) => {
    e.preventDefault();
    if (couriers) {
      const body = couriers.map((c) => ({ id: c.id, status: c.status }));
      updateCourier({
        body,
      });
    }
  };
  const handleUpdateLocation = (e: MouseEvent) => {
    e.preventDefault();
    updateLocation({
      body: { lat: input.latitude, long: input.longitude },
    });
  };

  useEffect(() => {
    if (dataLocation) {
      const location = dataLocation.data;
      setInput(
        location
          ? { latitude: location.lat, longitude: location.long }
          : { latitude: "", longitude: "" }
      );
    }
  }, [dataLocation]);
  useEffect(() => {
    if (dataCouriers) {
      setCouriers(dataCouriers.data);
    }
  }, [dataCouriers]);
  return (
    <div className="w-full flex-col gap-4 flex">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Store Address</h3>
        {isGettingLocation ? (
          <div className="h-40 flex items-center justify-center flex-col gap-1">
            <Loader className="size-6 animate-spin -mt-3" />
            <p className="text-sm ml-2">Loading...</p>
          </div>
        ) : (
          <MapPicker
            input={input}
            setInput={setInput}
            errors={{ latitude: "", longitude: "" }}
          />
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
                          ? prev.map(
                              (item) =>
                                item.id === courier.id
                                  ? { ...item, status: e } // update status
                                  : item // biarkan tidak berubah
                            )
                          : undefined
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

const MapPicker = ({
  input,
  setInput,
  errors,
}: {
  input: any;
  setInput: Dispatch<SetStateAction<any>>;
  errors: {
    latitude: string;
    longitude: string;
  };
}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiGMaps,
    libraries: ["places"],
  });

  if (!isLoaded) {
    return <p>Loading....</p>;
  }
  return <Maps input={input} setInput={setInput} errors={errors} />;
};

const Maps = ({
  input,
  setInput,
  errors,
}: {
  input: any;
  setInput: Dispatch<SetStateAction<any>>;
  errors: {
    latitude: string;
    longitude: string;
  };
}) => {
  const [address, setAddress] = useState({
    formatted: "",
    address: "",
    province: "",
    city: "",
    district: "",
    postal_code: "",
  });
  // center marker by lat lng
  const center = useMemo(
    () => ({
      lat: -6.175392,
      lng: 106.827153,
    }),
    []
  );

  //   center position
  const [centerPosition, setCenterPosition] = useState(center);

  // Referensi untuk objek Google Map
  const mapRef = useRef<google.maps.Map | null>(null);

  //   use-places-autocomplete
  const {
    ready,
    setValue,
    suggestions: { data, status },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "ID" }, // <-- Perubahan utama di sini
    },
  });

  //   fetch data for every setValue to get suggest
  const [fetchData, setFetchData] = useState(false);

  //   to debounce address
  const placeDebounce = useDebounce(address.formatted);

  //   zoom maps
  const [zoomLevel, setZoomLevel] = useState(14);

  //   debounce at address change
  useEffect(() => {
    setValue(placeDebounce, fetchData);
  }, [placeDebounce]);

  //   handle select suggest
  const handleSelect = async (address: any) => {
    setValue(address, false);
    clearSuggestions();

    const results = await getGeocode({ address });
    const { lat, lng } = getLatLng(results[0]);

    const {
      district,
      city,
      province,
      newFormatted,
      postal_code,
      formattedAddress,
    } = sanitizeAddress(results);

    setAddress({
      formatted: formattedAddress ?? "",
      address: newFormatted ?? "",
      city: city ?? "",
      district: district ?? "",
      postal_code: postal_code ?? "",
      province: province ?? "",
    });

    setInput({
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
    setFetchData(false);
    setCenterPosition({ lat, lng });
    setZoomLevel(18);
  };

  //   handle drag end
  const handleDragEnd = async () => {
    if (mapRef.current) {
      const newCenter = {
        lat: mapRef.current.getCenter()?.lat() ?? center.lat,
        lng: mapRef.current.getCenter()?.lng() ?? center.lng,
      };
      setCenterPosition(newCenter);

      const results = await getGeocode({ location: newCenter });
      const { lat, lng } = getLatLng(results[0]);

      const {
        district,
        city,
        province,
        newFormatted,
        postal_code,
        formattedAddress,
      } = sanitizeAddress(results);

      setAddress({
        formatted: formattedAddress ?? "",
        address: newFormatted ?? "",
        city: city ?? "",
        district: district ?? "",
        postal_code: postal_code ?? "",
        province: province ?? "",
      });

      setInput({
        latitude: lat.toString(),
        longitude: lng.toString(),
      });
      setFetchData(false);
    }
  };

  //   handle change zoom
  const handleZoomChanged = async () => {
    if (mapRef.current) {
      const newCenter = {
        lat: mapRef.current.getCenter()?.lat() ?? center.lat,
        lng: mapRef.current.getCenter()?.lng() ?? center.lng,
      };
      setCenterPosition(newCenter);
      setZoomLevel(mapRef.current?.getZoom() ?? 14);

      const results = await getGeocode({ location: newCenter });
      const { lat, lng } = getLatLng(results[0]);

      const {
        district,
        city,
        province,
        newFormatted,
        postal_code,
        formattedAddress,
      } = sanitizeAddress(results);

      setAddress({
        formatted: formattedAddress ?? "",
        address: newFormatted ?? "",
        city: city ?? "",
        district: district ?? "",
        postal_code: postal_code ?? "",
        province: province ?? "",
      });

      setInput({
        latitude: lat.toString(),
        longitude: lng.toString(),
      });

      setFetchData(false);
    }
  };

  const handleZoomChangeSlider = (e: ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseInt(e.target.value, 10);
    setZoomLevel(newZoom);

    if (mapRef.current) {
      mapRef.current.setZoom(newZoom); // Update zoom level on the map
    }
  };

  //   style maps
  const grayscaleMapStyle = [
    {
      elementType: "geometry",
      stylers: [
        {
          saturation: -100, // Grayscale filter
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: zoomLevel >= 17 ? "on" : "off" }], // Tampilkan label jika zoom >= 18
    },
    {
      featureType: "administrative",
      elementType: "labels",
      stylers: [
        { visibility: "on" }, // Tampilkan label administratif jika zoom < 18
      ],
    },
    {
      featureType: "road",
      elementType: "labels",
      stylers: [{ visibility: "on" }], // Menampilkan label jalan jika zoom >= 18
    },
  ];

  //   handle clear address
  const handleClear = (e: MouseEvent) => {
    e.preventDefault();
    setAddress({
      formatted: "",
      address: "",
      city: "",
      district: "",
      postal_code: "",
      province: "",
    });
    setInput({
      latitude: "0",
      longitude: "0",
    });
    clearSuggestions();
  };

  //   map load
  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  //   handle get adress from lat lng
  const handleLatLng = async (lat: number, lng: number) => {
    const results = await getGeocode({ location: { lat, lng } });

    const {
      district,
      city,
      province,
      newFormatted,
      postal_code,
      formattedAddress,
    } = sanitizeAddress(results);

    setAddress({
      formatted: formattedAddress ?? "",
      address: newFormatted ?? "",
      city: city ?? "",
      district: district ?? "",
      postal_code: postal_code ?? "",
      province: province ?? "",
    });

    setInput({
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
    setFetchData(false);
    setCenterPosition({ lat, lng });
  };

  //   debounce lat lng
  const latDebounce = useDebounce(input.latitude);
  const lngDebounce = useDebounce(input.longitude);

  //   get address every change lat lng
  useEffect(() => {
    if (
      latDebounce &&
      latDebounce !== "0" &&
      lngDebounce &&
      lngDebounce !== "0"
    ) {
      handleLatLng(parseFloat(latDebounce), parseFloat(lngDebounce));
    }
  }, [latDebounce, lngDebounce]);

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const results = await getGeocode({ location: { lat, lng } });

        if (results.length > 0) {
          const {
            district,
            city,
            province,
            newFormatted,
            postal_code,
            formattedAddress,
          } = sanitizeAddress(results);

          setAddress({
            formatted: formattedAddress ?? "",
            address: newFormatted ?? "",
            city: city ?? "",
            district: district ?? "",
            postal_code: postal_code ?? "",
            province: province ?? "",
          });

          setInput({
            latitude: lat.toString(),
            longitude: lng.toString(),
          });
          setFetchData(false);
          setZoomLevel(18);
        }
      },
      () => {
        toast.error(
          "Unable to get your location. Please allow location access in your browser settings."
        );
      }
    );
  };

  const isSomeError = errors.latitude || errors.longitude;

  return (
    <div className="size-full flex-col flex-none relative flex gap-1.5 justify-center overflow-hidden">
      <div
        className={cn(
          "flex flex-col gap-4 relative border border-gray-300 rounded-md p-3 w-full",
          isSomeError && "border-red-500"
        )}
      >
        <Command className="h-fit absolute top-3 z-10 w-[calc(100%-24px)]">
          <div className="flex flex-col gap-1.5">
            <Label>Search Address</Label>
            <div className="w-full relative flex items-center">
              <Input
                className="pr-10 bg-gray-100 border-gray-300 focus-visible:border-gray-500 focus-visible:ring-transparent"
                value={address.formatted}
                onChange={(e) => {
                  setAddress((prev) => ({
                    ...prev,
                    formatted: e.target.value,
                  }));
                  setFetchData(true);
                }}
                disabled={!ready}
                placeholder="Type search address"
              />
              {address?.formatted.trim().length > 0 && (
                <Button
                  type="button"
                  onClick={handleClear}
                  className="px-0 w-8 h-7 bg-transparent justify-start hover:bg-transparent text-black absolute right-1 shadow-none hover:scale-110"
                >
                  <XCircle className="size-4" />
                </Button>
              )}
            </div>
          </div>
          {status === "OK" && (
            <CommandList className="mt-2 rounded-md border border-gray-500">
              <CommandGroup>
                {data.map(({ place_id, description }) => (
                  <CommandItem
                    onSelect={() => handleSelect(description)}
                    key={place_id}
                  >
                    {description}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          )}
        </Command>

        <div className="w-full h-full mt-[70px]">
          <div className="w-full aspect-[5/3] relative overflow-hidden flex items-center justify-center border-gray-300">
            <div className="w-full h-full relative overflow-hidden rounded shadow">
              <GoogleMap
                mapContainerClassName="w-full h-full scale-110"
                options={{
                  disableDefaultUI: true, // Menghilangkan semua tombol default
                  zoomControl: false, // Menghilangkan tombol zoom (opsional)
                  mapTypeControl: false, // Menghilangkan kontrol tipe peta (opsional)
                  streetViewControl: false, // Menghilangkan kontrol street view (opsional)
                  fullscreenControl: false, // Menghilangkan tombol fullscreen (opsional)
                  clickableIcons: false,
                  styles: grayscaleMapStyle, // Terapkan gaya grayscale
                  maxZoom: 20, // Batas maksimum zoom
                  minZoom: 5, // Batas minimum zoom
                }}
                zoom={zoomLevel}
                center={centerPosition}
                onLoad={handleMapLoad} // Simpan referensi objek map
                onDragEnd={handleDragEnd} // Tangani event drag-end
                onZoomChanged={handleZoomChanged}
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[calc(50%+20px)] size-10 flex items-center justify-center">
                <svg
                  className="size-10"
                  xmlns="http://www.w3.org/2000/svg"
                  fillRule="evenodd"
                  clipRule={"evenodd"}
                  imageRendering={"optimizeQuality"}
                  style={{
                    shapeRendering: "geometricPrecision",
                    textRendering: "geometricPrecision",
                  }}
                  viewBox="0 0 1.63 2.02"
                >
                  <g>
                    <path
                      className="fill-red-500 stroke-[0.08] stroke-black"
                      d="M1.59 0.82c0,0.48 -0.53,0.99 -0.71,1.14 -0.02,0.01 -0.04,0.02 -0.06,0.02 -0.02,0 -0.04,-0.01 -0.06,-0.02 -0.18,-0.15 -0.72,-0.66 -0.72,-1.14 0,-0.43 0.35,-0.78 0.78,-0.78 0.43,0 0.77,0.35 0.77,0.78zm-0.48 0c0,-0.16 -0.13,-0.29 -0.29,-0.29 -0.16,0 -0.29,0.13 -0.29,0.29 0,0.16 0.13,0.29 0.29,0.29 0.16,0 0.29,-0.13 0.29,-0.29z"
                    />
                  </g>
                </svg>
              </div>
              <div className="w-6 h-[150px] bg-white absolute left-3 bottom-3 flex items-center justify-center rounded-md shadow-md border">
                <input
                  type="range"
                  min="5"
                  max="20"
                  style={{ accentColor: "black" }}
                  className="w-[140px] h-2 rounded-full shadow cursor-pointer border border-white -rotate-90 vertical-range"
                  value={zoomLevel}
                  onChange={handleZoomChangeSlider}
                />
              </div>
              <Button
                onClick={handleCurrentLocation}
                variant={"outline"}
                className="absolute right-3 bottom-3 hover:bg-gray-50"
                type="button"
              >
                <Locate />
                Use current location
              </Button>
            </div>
          </div>
        </div>
        {(address.province || address.city || address.district) && (
          <div className="grid grid-cols-2 gap-4">
            <LabelInput
              label="Address"
              className="bg-gray-100 focus-visible:border-gray-300 read-only:cursor-default read-only:focus-visible:border-gray-300"
              classContainer="col-span-2"
              value={address.address ?? ""}
              readOnly
            />
            <LabelInput
              label="Province"
              className="bg-gray-100 focus-visible:border-gray-300 read-only:cursor-default read-only:focus-visible:border-gray-300"
              value={address.province ?? ""}
              readOnly
            />
            <LabelInput
              label="City"
              className="bg-gray-100 focus-visible:border-gray-300 read-only:cursor-default read-only:focus-visible:border-gray-300"
              value={address.city ?? ""}
              readOnly
            />
            <LabelInput
              label="District"
              className="bg-gray-100 focus-visible:border-gray-300 read-only:cursor-default read-only:focus-visible:border-gray-300"
              value={address.district ?? ""}
              readOnly
            />
            <LabelInput
              label="Postal Code"
              className="bg-gray-100 focus-visible:border-gray-300 read-only:cursor-default read-only:focus-visible:border-gray-300"
              value={address.postal_code ?? ""}
              readOnly
            />
          </div>
        )}
      </div>
      {isSomeError && <MessageInputError error={"Address is required"} />}
    </div>
  );
};

const sanitizeAddress = (results: google.maps.GeocoderResult[]) => {
  const streetAddress = results.find(
    (item) =>
      (item.types.length === 1 && item.types.includes("street_address")) ||
      (item.types.length === 1 && item.types.includes("route"))
  );

  const addressComponent = streetAddress?.address_components;

  const formattedAddress = streetAddress?.formatted_address;

  const district = addressComponent?.find((item) =>
    item.types.includes("administrative_area_level_3")
  )?.long_name;
  const city = addressComponent?.find((item) =>
    item.types.includes("administrative_area_level_2")
  )?.long_name;
  const province = addressComponent?.find((item) =>
    item.types.includes("administrative_area_level_1")
  )?.long_name;
  const country = addressComponent?.find((item) =>
    item.types.includes("country")
  )?.long_name;
  const postal_code = addressComponent?.find((item) =>
    item.types.includes("postal_code")
  )?.long_name;
  const district_short = addressComponent?.find((item) =>
    item.types.includes("administrative_area_level_3")
  )?.short_name;
  const city_short = addressComponent?.find((item) =>
    item.types.includes("administrative_area_level_2")
  )?.short_name;
  const province_short = addressComponent?.find((item) =>
    item.types.includes("administrative_area_level_1")
  )?.short_name;
  const country_short = addressComponent?.find((item) =>
    item.types.includes("country")
  )?.short_name;
  const postal_code_short = addressComponent?.find((item) =>
    item.types.includes("postal_code")
  )?.short_name;

  const newFormatted = formattedAddress
    ?.replace(district ? `, ${district}` : "", "")
    ?.replace(city ? `, ${city}` : "", "")
    ?.replace(province ? `, ${province}` : "", "")
    ?.replace(postal_code ? ` ${postal_code}` : "", "")
    ?.replace(country ? `, ${country}` : "", "")
    ?.replace(district_short ? `, ${district_short}` : "", "")
    ?.replace(city_short ? `, ${city_short}` : "", "")
    ?.replace(province_short ? `, ${province_short}` : "", "")
    ?.replace(postal_code_short ? ` ${postal_code_short}` : "", "")
    ?.replace(country_short ? `, ${country_short}` : "", "");

  return {
    district,
    city,
    province,
    formattedAddress,
    newFormatted,
    postal_code,
  };
};
