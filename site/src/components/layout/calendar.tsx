"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CaptionProps, DayPicker, useNavigation } from "react-day-picker";

import { buttonVariants } from "~/components/ui/button";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
            fromYear={2006}
            toDate={addDays(new Date(), 0)}
            components={{
              Caption: CustomCaption,
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function CustomCaption(props: CaptionProps) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();

  const handlePreviousMonth = () => {
    if (previousMonth) {
      goToMonth(previousMonth);
    }
  };

  const handleNextMonth = () => {
    if (nextMonth) {
      goToMonth(nextMonth);
    }
  };

  const buttonClass = cn(
    buttonVariants({ variant: "outline" }),
    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
  );

  return (
    <h2 className="relative flex items-center justify-center pt-1">
      <button
        className={cn("absolute left-1", buttonClass)}
        disabled={!previousMonth}
        onClick={handlePreviousMonth}
      >
        <ChevronLeft className="" />
      </button>
      <div className="flex gap-1 text-sm font-medium">
        <p>{format(props.displayMonth, "MMMM")}</p>
        <p className="">{format(props.displayMonth, "Y")}</p>
      </div>
      <button
        className={cn("absolute right-1", buttonClass)}
        disabled={!nextMonth}
        onClick={handleNextMonth}
      >
        <ChevronRight className="" />
      </button>
    </h2>
  );
}
