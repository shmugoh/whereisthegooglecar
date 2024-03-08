import React, { useEffect, useState } from "react";
import {
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenu,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  CalendarIcon,
  SearchIcon,
  Building2 as BuildingIcon,
} from "lucide-react";

import { Button } from "~/components/ui/button";

import { DropdownBox } from "~/components/layout/combobox";

import { DatePickerWithRange as Calendar } from "./calendar";

import type { DateRange } from "react-day-picker";

import Link from "next/link";
import router, { useRouter } from "next/router";

import { api } from "~/utils/api";

export const Search = () => {
  const services = api.grab.grabServices.useQuery().data ?? [];
  const countries = api.grab.grabCountries.useQuery().data ?? [];

  const router = useRouter();

  const [service, setService] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [town, setTown] = React.useState("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-9 px-0">
          <SearchIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          {/* <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" /> */}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center gap-2 p-2">
          <SearchIcon className="h-4 w-4 text-gray-500" />
          <Input
            className="font-semibold"
            id="name"
            placeholder="Search by Town"
            onChange={(e) => {
              setTown(e.target.value);
              console.log(e.target.value);
            }}
          />
        </div>
        <DropdownMenuSeparator />
        <div className="flex items-center gap-2 p-2">
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <Calendar dateState={date} setDateState={setDate} />
          {/* <Input id="date" placeholder="Search by Date" type="date" /> */}
        </div>
        <DropdownMenuSeparator />
        <div className="flex items-center gap-2 p-2">
          <SearchIcon className="h-4 w-4 text-gray-500" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <DropdownBox
                name="Services"
                label="Services"
                values={services}
                valueState={service}
                setValueState={setService}
              />
            </DropdownMenuTrigger>
          </DropdownMenu>
        </div>
        <DropdownMenuSeparator />
        <div className="flex items-center gap-2 p-2">
          <BuildingIcon className="h-4 w-4 text-gray-500" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <DropdownBox
                name="Countries"
                label="Countries"
                values={countries}
                valueState={country}
                setValueState={setCountry}
              />
            </DropdownMenuTrigger>
          </DropdownMenu>
        </div>
        <DropdownMenuSeparator />
        <div className="flex items-center gap-2 p-2">
          <Button asChild className="w-full text-left" id="service">
            <Link
              href={`/search?town=${town}&date=${JSON.stringify(date)}&services=${service}&countries=${country}`}
              passHref
              onClick={() =>
                router.route === "/search" ? router.reload() : undefined
              }
            >
              Search
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
