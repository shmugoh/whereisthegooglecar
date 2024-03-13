import * as React from "react";

import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";

import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "~/lib/utils";

type valuesDropdownBox = {
  value: string;
  label: string;
};

export function DropdownBox({
  name,
  label,
  values,
  value,
  onChange,
}: {
  name: string;
  label: string;
  values: valuesDropdownBox[];
  value: string | undefined; // Add the valueState property
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Calendar Button */}
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? name === "Country"
              ? values
                  .find((values) => values.value === value)
                  ?.label.slice(0, 4)
              : values
                  .find((values) => values.value === value)
                  ?.label.slice(0, 7) + (value.length > 7 ? "..." : "")
            : name}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      {/* Calendar Popup */}
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${label}...`} />
          <CommandEmpty>No {label} found.</CommandEmpty>
          <ScrollArea className="h-[238px]">
            <CommandGroup>
              {values.map((values) => (
                <CommandItem
                  key={values.value}
                  value={values.label}
                  onSelect={(currentValue) => {
                    currentValue = values.value;
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === values.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {values.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
