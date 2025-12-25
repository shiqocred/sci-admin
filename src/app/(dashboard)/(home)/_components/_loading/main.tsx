import { RangeLoading } from "./_partial/range";
import { SummaryLoading } from "./_partial/summary";

export const MainLoading = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex items-center gap-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>
      <div className="flex flex-col gap-6">
        <RangeLoading />
        <SummaryLoading />
      </div>
    </div>
  );
};
