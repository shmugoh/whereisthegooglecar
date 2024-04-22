import React, { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenu,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField } from "~/components/ui/form";
import { DropdownBox } from "~/components/layout/combobox";

import { SearchIcon, FilterIcon, FlagIcon } from "lucide-react";

import { api } from "~/utils/api";

// define form schema
const formSchema = z.object({
  town: z.string().optional(),
  services: z.string().optional(),
  countries: z.string().optional(),
});

export const Search = () => {
  // Dropdown Hook
  const [open, setOpen] = useState(false);

  // Grab Services
  const services =
    api.grab.grabServices.useQuery(undefined, {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }).data ?? [];

  // Grab Countries
  const countries =
    api.grab.grabCountries.useQuery(undefined, {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }).data ?? [];

  // Initialize Router
  const router = useRouter();

  // Form Handlers
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      town: "",
      services: "",
      countries: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setOpen(false);

    const query = {
      town: values.town,
      services: values.services,
      countries: values.countries,
    };

    await router.replace({
      pathname: "/search",
      query: query,
    });
  }

  // Layout
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-full w-full gap-2 border bg-primary-foreground lg:flex lg:w-9 lg:border-0 lg:bg-inherit lg:px-0"
        >
          <SearchIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="inline-flex w-full text-muted-foreground lg:hidden">
            Search...
          </span>
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
                  <div className="flex w-40 items-center gap-2 p-2">
                    <FilterIcon className="h-4 w-4 text-gray-500" />
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
                  <div className="flex w-40 items-center gap-2 p-2">
                    <FlagIcon className="h-4 w-4 text-gray-500" />
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
