import React from "react";
import {
  Timeline,
  TimelineTitle,
  TimelineHeader,
  TimelineItem,
  TimelineSeparator,
  TimelineIndicator,
  TimelineContent,
  TimelineDate,
} from "@/components/ui/timeline";
import { HistoriesExistProps } from "../../_api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Check,
  Clock,
  FileCheckIcon,
  PackageCheck,
  RefreshCcw,
  Truck,
  UserX2,
  X,
} from "lucide-react";

export const HistoriesSection = ({
  historiesList,
}: {
  historiesList: HistoriesExistProps[] | undefined;
}) => {
  if (historiesList && historiesList.length > 0) {
    return (
      <div className="flex flex-col gap-4 border rounded-lg bg-gray-50 p-5 w-full text-sm">
        <h3 className="font-semibold">Tracking Order</h3>
        <Timeline>
          {historiesList.map((item) => (
            <TimelineItem
              key={item.id}
              step={0}
              className="group-data-[orientation=vertical]/timeline:ms-10"
            >
              <TimelineHeader>
                <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5" />
                <TimelineDate className="mt-1 text-xs">
                  {format(item.updatedAt ?? new Date(), "PPP HH:mm:ss", {
                    locale: id,
                  })}
                </TimelineDate>
                <TimelineIndicator
                  className={cn(
                    "bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7",
                    (item.status === "CONFIRMED" ||
                      item.status === "ALLOCATED") &&
                      "!bg-blue-500",
                    item.status === "DELIVERED" && "!bg-green-500",
                    (item.status === "RETURNED" ||
                      item.status === "RETURN_IN_TRANSIT" ||
                      item.status === "ON_HOLD") &&
                      "!bg-orange-500",
                    (item.status === "COURIER_NOT_FOUND" ||
                      item.status === "DISPOSED" ||
                      item.status === "CANCELLED") &&
                      "!bg-red-500"
                  )}
                >
                  {(item.status === "CONFIRMED" ||
                    item.status === "ALLOCATED") && <FileCheckIcon size={14} />}
                  {(item.status === "PICKING_UP" ||
                    item.status === "DROPPING_OFF") && <Truck size={14} />}
                  {item.status === "PICKED" && <PackageCheck size={14} />}
                  {item.status === "COURIER_NOT_FOUND" && <UserX2 size={14} />}
                  {(item.status === "DISPOSED" ||
                    item.status === "CANCELLED") && <X size={14} />}
                  {(item.status === "RETURNED" ||
                    item.status === "RETURN_IN_TRANSIT") && (
                    <RefreshCcw size={14} />
                  )}
                  {item.status === "DELIVERED" && <Check size={14} />}
                  {item.status === "ON_HOLD" && <Clock size={14} />}
                </TimelineIndicator>
              </TimelineHeader>
              <TimelineContent>
                <TimelineTitle className="mt-0.5 text-sm">
                  {item.note}
                </TimelineTitle>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    );
  }
  return null;
};
