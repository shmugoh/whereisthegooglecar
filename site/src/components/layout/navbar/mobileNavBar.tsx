import { Button } from "~/components/ui/button";
import { SheetTrigger, SheetContent, Sheet } from "~/components/ui/sheet";
import Link from "next/link";
import {
  CollapsibleTrigger,
  CollapsibleContent,
  Collapsible,
} from "~/components/ui/collapsible";
import { ChevronRightIcon, MenuIcon, MoonIcon, SunIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Search } from "~/components/layout/search";

import { Donate } from "react-kofi-overlay";
import { MdOutlineStreetview } from "react-icons/md";

type MobileNavBarProps = {
  setTheme: (theme: string) => void;
};
export default function MobileNavBar(props: MobileNavBarProps) {
  return (
    <div className="flex w-full justify-end gap-4 lg:hidden">
      <Search />

      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="flex h-full flex-col justify-between"
        >
          <div>
            <div className="flex h-full flex-col gap-6 py-6">
              <Link
                className="flex items-center gap-2 text-lg font-semibold"
                href="#"
              >
                <MdOutlineStreetview size={40} className="flex" />
                <span className="font-bold">WhereIsTheGoogleCar</span>
              </Link>
              <nav className="grid gap-4">
                <Link
                  className="flex w-full items-center py-2 text-lg font-semibold"
                  href="/"
                >
                  Home
                </Link>
                <Collapsible className="grid gap-2">
                  <CollapsibleTrigger className="flex w-full items-center text-lg font-semibold [&[data-state=open]>svg]:rotate-90">
                    Services
                    <ChevronRightIcon className="ml-auto h-5 w-5 transition-all" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="-mx-6 grid gap-2 bg-gray-100 p-6 dark:bg-gray-800">
                      <Link
                        className="flex w-full items-center py-2 text-base font-medium"
                        href="/"
                      >
                        Google
                      </Link>
                      <Link
                        className="flex w-full items-center py-2 text-base font-medium"
                        href="/services/apple"
                      >
                        Apple
                      </Link>
                      <Link
                        className="flex w-full items-center py-2 text-base font-medium"
                        href="/services/others"
                      >
                        Others
                      </Link>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                <Link
                  className="flex w-full items-center py-2 text-lg font-semibold"
                  href="/submit"
                >
                  Submit Sighting
                </Link>
                <Link
                  className="flex w-full items-center py-2 text-lg font-semibold"
                  href="/about"
                >
                  About
                </Link>
              </nav>
            </div>
          </div>

          {/* Bottom */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <Donate
                username="shmugo"
                styles={{
                  donateBtn: { backgroundColor: "#29abe0", width: "80%" },
                }}
              >
                ❤️ Tip Me
              </Donate>
            </div>

            <div className="flex justify-between">
              <p className="flex items-center font-bold text-primary/90">
                © VirtualStreets
              </p>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-9 px-0">
                    <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => props.setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => props.setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => props.setTheme("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
