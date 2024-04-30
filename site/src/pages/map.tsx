/**
 * v0 by Vercel.
 * @see https://v0.dev/t/FHQMFOUDvpE
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {
  AccordionTrigger,
  AccordionContent,
  AccordionItem,
  Accordion,
} from "~/components/ui/accordion";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  PopoverTrigger,
  PopoverContent,
  Popover,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import MapWrapper from "~/components/MapWrapper";

export default function Component() {
  return (
    <div className="flex h-screen">
      <div className="relative z-0 flex-1">
        <MapWrapper />
      </div>
      <div className="flex w-80 flex-col gap-6 border-l p-6">
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">Filters</h2>
          <Accordion collapsible type="single">
            <AccordionItem value="date">
              <AccordionTrigger className="text-base">Date</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Input id="start-date" type="date" />
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Calendar />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Input id="end-date" type="date" />
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Calendar />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="service">
              <AccordionTrigger className="text-base">Service</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2 font-normal">
                    <Checkbox id="service-police" />
                    Police{"\n                              "}
                  </Label>
                  <Label className="flex items-center gap-2 font-normal">
                    <Checkbox id="service-fire" />
                    Fire{"\n                              "}
                  </Label>
                  <Label className="flex items-center gap-2 font-normal">
                    <Checkbox id="service-ems" />
                    EMS{"\n                              "}
                  </Label>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="location">
              <AccordionTrigger className="text-base">
                Location
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  <Input
                    id="location-search"
                    placeholder="Search location"
                    type="text"
                  />
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2 font-normal">
                      <Checkbox id="location-city" />
                      City{"\n                                  "}
                    </Label>
                    <Label className="flex items-center gap-2 font-normal">
                      <Checkbox id="location-county" />
                      County{"\n                                  "}
                    </Label>
                    <Label className="flex items-center gap-2 font-normal">
                      <Checkbox id="location-state" />
                      State{"\n                                  "}
                    </Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="grid gap-4">
          <Button>Apply Filters</Button>
          <Button variant="outline">Clear Filters</Button>
        </div>
      </div>
    </div>
  );
}
