import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronDown, ChevronRight, User2, X } from "lucide-react";
import { useGetSelectsUsers } from "../../_api";
import { InputProps } from "../client";
import { cn } from "@/lib/utils";

interface DiscountEligibilityProps {
  eligibility: string;
  setDiscounts: (e: any) => void;
  setInput: React.Dispatch<React.SetStateAction<InputProps>>;
  input: InputProps;
}

export const DiscountEligibility = ({
  eligibility,
  setDiscounts,
  setInput,
  input,
}: DiscountEligibilityProps) => {
  const { data: selectUsers } = useGetSelectsUsers();

  const users = React.useMemo(() => {
    return selectUsers?.data ?? [];
  }, [selectUsers]);

  const handleSelectUser = (item: any) => {
    if (input.userId.includes(item.id)) {
      handleRemoveUser(item);
    } else {
      setInput((prev) => ({
        ...prev,
        userId: [...prev.userId, item.id],
      }));
    }
  };

  const handleRemoveUser = (item: any) => {
    setInput((prev) => ({
      ...prev,
      userId: prev.userId.filter((i) => i !== item.id),
    }));
  };

  const handleSelectRole = (role: "BASIC" | "PETSHOP" | "VETERINARIAN") => {
    if (input.role.includes(role)) {
      setInput((prev) => ({
        ...prev,
        role: prev.role.filter((i) => i !== role),
      }));
    } else {
      setInput((prev) => ({
        ...prev,
        role: [...prev.role, role],
      }));
    }
  };
  return (
    <div className="px-3 py-5 bg-gray-50 border w-full rounded-lg border-gray-200 flex flex-col gap-4">
      <Label className="flex flex-col items-start gap-1.5">
        <p>Eligibility</p>
      </Label>
      <Select
        value={eligibility}
        onValueChange={(e) => {
          setDiscounts({ eligibility: e });
          setInput((prev) => ({ ...prev, userId: [], role: [] }));
        }}
      >
        <SelectTrigger className="w-full data-[state=open]:border-gray-400 hover:border-gray-400 shadow-none border-gray-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Customer</SelectItem>
          <SelectItem value="role">Spesific Role</SelectItem>
          <SelectItem value="user">Spesific User</SelectItem>
        </SelectContent>
      </Select>
      {eligibility === "role" && (
        <div className="flex flex-col gap-3">
          <Label className="flex items-center gap-2">
            <Checkbox
              checked={input.role.includes("BASIC")}
              onCheckedChange={() => handleSelectRole("BASIC")}
            />
            <p>Basic</p>
          </Label>
          <Label className="flex items-center gap-2">
            <Checkbox
              checked={input.role.includes("PETSHOP")}
              onCheckedChange={() => handleSelectRole("PETSHOP")}
            />
            <p>Pet shop</p>
          </Label>
          <Label className="flex items-center gap-2">
            <Checkbox
              checked={input.role.includes("VETERINARIAN")}
              onCheckedChange={() => handleSelectRole("VETERINARIAN")}
            />
            <p>Veterinarian</p>
          </Label>
        </div>
      )}
      {eligibility === "user" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="justify-between bg-transparent hover:border-gray-400 hover:bg-transparent font-normal shadow-none border-gray-300 group"
              variant={"outline"}
            >
              Select User
              <ChevronDown className="group-data-[state=open]:rotate-180 transition-all" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandInput />
              <CommandList>
                <CommandGroup>
                  {users.map((item) => (
                    <CommandItem
                      className="justify-between border mt-2 first:mt-0"
                      key={item.id}
                      onSelect={() => handleSelectUser(item)}
                    >
                      <div className="flex flex-col">
                        <p className="font-semibold">{item.name}</p>
                        <p>{item.email}</p>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto",
                          input.userId.includes(item.id) ? "flex" : "hidden"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
      {eligibility === "user" && input.userId.length > 0 && (
        <div className="flex flex-col border rounded-md divide-y">
          {users
            .filter((item) => input.userId.includes(item.id))
            .map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-2 text-sm hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <User2 className="size-3.5 ml-2" />
                  <ChevronRight className="size-3" />
                  <div className="flex flex-col">
                    <p className="font-semibold">{item.name}</p>
                    <p>{item.email}</p>
                  </div>
                </div>
                <Button
                  className="size-fit p-1 flex-none text-gray-500 hover:bg-gray-200"
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => handleRemoveUser(item)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
