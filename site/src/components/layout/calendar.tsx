import * as React from "react";

import {
  addDays,
  format,
  eachYearOfInterval,
  getYear,
  getMonth,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
} from "date-fns";

import type { DateRange } from "react-day-picker";
import { type CaptionProps, useNavigation } from "react-day-picker";

import { buttonVariants, Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Command, CommandGroup, CommandItem } from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "../ui/scroll-area";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "~/lib/utils";

export function DatePickerWithRange({
  className,
  value,
  onChange,
}: {
  className?: string;
  value?: // if type matches z.object
  | {
        from?: Date | undefined;
        to?: Date | undefined;
      }
    // else if none
    | undefined;
  onChange: (value: DateRange) => void;
}) {
  // destructure from and to from value
  const { from, to } = value ?? {
    from: undefined,
    to: undefined,
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            {from ? (
              to ? (
                <>
                  {format(from, "LLL dd, y")} - {format(to, "LLL dd, y")}
                </>
              ) : (
                format(from, "LLL dd, y")
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
            defaultMonth={from}
            selected={{ from, to }}
            onSelect={(value) => {
              if (value) {
                onChange(value);
              }
            }}
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

export function CustomCaption(props: CaptionProps) {
  // handle navigation
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
        {/* Months */}
        <PopoverDatePicker
          name={format(props.displayMonth, "MMMM")}
          values={eachMonthOfInterval({
            start: startOfYear(new Date()),
            end: endOfYear(new Date()),
          }).map((month) => ({
            value: getMonth(month),
            label: format(month, "MMMM"),
          }))}
          onChange={(month) =>
            goToMonth(new Date(getYear(props.displayMonth), month))
          }
        />
        {/* Year */}
        <PopoverDatePicker
          name={format(props.displayMonth, "Y")}
          values={eachYearOfInterval({
            start: startOfYear(new Date(2006, 0)),
            end: endOfYear(new Date()),
          })
            .map((year) => ({
              value: getYear(year),
              label: format(year, "Y"),
            }))
            // order by most recent year
            .sort((a, b) => b.value - a.value)}
          onChange={(year) =>
            goToMonth(new Date(year, getMonth(props.displayMonth)))
          }
        />
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

export function PopoverDatePicker({
  name,
  values,
  onChange,
}: {
  name: string;
  values: { value: number; label: string }[];
  onChange: (value: number) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [valueState, setValueState] = React.useState<number | null>(null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-8 w-full justify-between"
        >
          {name}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <ScrollArea className="h-[238px]">
            <CommandGroup>
              {values.map((value) => (
                <CommandItem
                  key={value.value}
                  value={value.label}
                  onSelect={() => {
                    setValueState(value.value);
                    onChange(value.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      valueState === value.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {value.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
