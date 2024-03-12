import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenu,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { DropdownBox } from "~/components/layout/combobox";
import {
  CalendarIcon,
  SearchIcon,
  Building2 as BuildingIcon,
} from "lucide-react";
import { DatePickerWithRange as Calendar } from "./calendar";
import { api } from "~/utils/api";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField } from "~/components/ui/form";

// define form schema
const formSchema = z.object({
  town: z.string().optional(),
  date: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
  services: z.string().optional(),
  countries: z.string().optional(),
});

export const Search = () => {
  // Dropdown Hook
  const [open, setOpen] = useState(false);

  // Grab Services, Countries, and FirstDate
  const services = api.grab.grabServices.useQuery().data ?? [];
  const countries = api.grab.grabCountries.useQuery().data ?? [];
  const firstDateRequest = api.grab.grabFirstDate.useQuery().data;
  /// Process First Date
  let firstDate: Date;
  if (firstDateRequest?.date) {
    firstDate = new Date(
      firstDateRequest.date.getUTCFullYear(),
      firstDateRequest.date.getUTCMonth(),
    );
  } else {
    firstDate = new Date(2006, 0);
  }

  // Initialize Router
  const router = useRouter();

  // Form Handlers
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      town: "",
      date: { from: undefined, to: undefined },
      services: "",
      countries: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setOpen(false);

    const query = {
      town: values.town,
      date: JSON.stringify(processDate(values.date)),
      services: values.services,
      countries: values.countries,
    };

    await router.replace({
      pathname: "/search",
      query: query,
    });
  }

  // Process Date
  const processDate = (
    date?: // if type matches z.object
    | {
          from?: Date | undefined;
          to?: Date | undefined;
        }
      // else if none
      | undefined,
  ) => {
    /// if both are empty, set default
    if (date?.from == undefined && date?.to == undefined)
      return { from: new Date(firstDate), to: new Date() };
    /// if both are empty, set to same day
    if (date.from && date.to == undefined) {
      return { from: date.from, to: date.from };
    }
    // else, return both
    return { from: date?.from, to: date?.to };
  };

  // Layout
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-9 px-0">
          <SearchIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Service and Country */}
            <div className="flex w-full">
              {/* Service */}
              <FormField
                control={form.control}
                name="services"
                render={({ field }) => (
                  <div className="flex w-1/2 items-center gap-2 p-2">
                    <SearchIcon className="h-4 w-4 text-gray-500" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <FormControl>
                          <DropdownBox
                            name="Service"
                            label="Service"
                            values={services}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </DropdownMenuTrigger>
                    </DropdownMenu>
                  </div>
                )}
              />

              {/* Country */}
              <FormField
                control={form.control}
                name="countries"
                render={({ field }) => (
                  <div className="flex w-1/2 items-center gap-2 p-2">
                    <BuildingIcon className="h-4 w-4 text-gray-500" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <FormControl>
                          <DropdownBox
                            name="Country"
                            label="Country"
                            values={countries}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </DropdownMenuTrigger>
                    </DropdownMenu>
                  </div>
                )}
              />
            </div>

            <DropdownMenuSeparator />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <div className="flex items-center gap-2 p-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <Calendar value={field.value} onChange={field.onChange} />
                </div>
              )}
            />

            <DropdownMenuSeparator />

            {/* Town */}
            <FormField
              control={form.control}
              name="town"
              render={({ field }) => (
                <div className="flex items-center gap-2 p-2">
                  <SearchIcon className="h-4 w-4 text-gray-500" />
                  <FormControl>
                    <Input
                      className="font-semibold"
                      id="name"
                      placeholder="Search by Town"
                      {...field}
                    />
                  </FormControl>
                </div>
              )}
            />

            <DropdownMenuSeparator />

            <div className="flex items-center gap-2 p-2">
              <Button className="w-full text-left" type="submit">
                Search
              </Button>
            </div>
          </form>
        </Form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
