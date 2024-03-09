import React from "react";
import { useRouter } from "next/router";
import type { DateRange } from "react-day-picker";
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

export const Search = () => {
  const services = api.grab.grabServices.useQuery().data ?? [];
  const countries = api.grab.grabCountries.useQuery().data ?? [];

  const router = useRouter();
  const handleSearch = async () => {
    const query = {
      town: town,
      date: JSON.stringify(processDate(date)),
      services: service,
      countries: country,
    };

    await router.replace({
      pathname: "/search",
      query: query,
    });
  };

  const [service, setService] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [town, setTown] = React.useState("");

  const processDate = (date: DateRange | undefined) => {
    if (date?.from == undefined && date?.to == undefined)
      return { from: new Date("2005-01-01"), to: new Date() };
    return { from: date?.from, to: date?.to };
  };

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
        {/* Service and Country */}
        <div className="flex w-full">
          {/* Service */}
          <div className="flex w-1/2 items-center gap-2 p-2">
            <SearchIcon className="h-4 w-4 text-gray-500" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <DropdownBox
                  name="Service"
                  label="Service"
                  values={services}
                  valueState={service}
                  setValueState={setService}
                />
              </DropdownMenuTrigger>
            </DropdownMenu>
          </div>
          {/* <DropdownMenuSeparator /> */}
          {/* Country */}
          <div className="flex w-1/2 items-center gap-2 p-2">
            <BuildingIcon className="h-4 w-4 text-gray-500" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <DropdownBox
                  name="Country"
                  label="Country"
                  values={countries}
                  valueState={country}
                  setValueState={setCountry}
                />
              </DropdownMenuTrigger>
            </DropdownMenu>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Date */}
        <div className="flex items-center gap-2 p-2">
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <Calendar dateState={date} setDateState={setDate} />
          {/* <Input id="date" placeholder="Search by Date" type="date" /> */}
        </div>

        <DropdownMenuSeparator />

        {/* Town */}
        <div className="flex items-center gap-2 p-2">
          <SearchIcon className="h-4 w-4 text-gray-500" />
          <Input
            className="font-semibold"
            id="name"
            placeholder="Search by Town"
            onChange={(e) => {
              setTown(e.target.value);
            }}
          />
        </div>

        <DropdownMenuSeparator />

        <div className="flex items-center gap-2 p-2">
          <Button
            className="w-full text-left"
            id="service"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
