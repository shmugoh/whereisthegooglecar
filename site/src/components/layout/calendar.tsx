"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export function DatePickerWithRange({
  className,
  dateState,
  setDateState,
}: {
  className?: string;
  dateState?: DateRange;
  setDateState: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateState && "text-muted-foreground",
            )}
          >
            {dateState?.from ? (
              dateState.to ? (
                <>
                  {format(dateState.from, "LLL dd, y")} -{" "}
                  {format(dateState.to, "LLL dd, y")}
                </>
              ) : (
                format(dateState.from, "LLL dd, y")
              )
            ) : (
              <span className="text-muted-foreground">Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateState?.from}
            selected={dateState}
            onSelect={setDateState}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
