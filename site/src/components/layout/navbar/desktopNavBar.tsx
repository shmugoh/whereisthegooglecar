import React from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Search } from "~/components/layout/search";
import { MoonIcon, SunIcon } from "lucide-react";

import { cn } from "~/lib/utils";

import Link from "next/link";
import type Url from "next/link";

type DesktopNavBarProps = {
  setTheme: (theme: string) => void;
};
export default function DesktopNavBar(props: DesktopNavBarProps) {
  return (
    <div className="hidden w-full md:relative md:flex">
      {/* Menu Buttons */}
      <NavigationMenu>
        <NavigationMenuList>
          {/* Home */}
          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuItemStyle}>
                Home
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

          {/* Others */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navigationMenuItemStyle}>
              Services
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[200px] gap-2 p-6">
                <ListItem href="/" title="Google"></ListItem>
                <ListItem href="/services/apple" title="Apple"></ListItem>
                <ListItem href="/services/yandex" title="Yandex"></ListItem>
                <ListItem href="/services/others" title="Others"></ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link href="/submit" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuItemStyle}>
                Submit
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

          {/* About & FAQ */}
          <NavigationMenuItem>
            <Link href="/about" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuItemStyle}>
                About
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex flex-1 items-center justify-end space-x-2">
        {/* Search */}
        <Search />

        {/* Dark Mode Toggle */}
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
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, href }, ref) => {
  href = href ?? "#"; // seems to be the only way for typescript to shut up

  return (
    <li>
      <Link href={href} legacyBehavior passHref>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className,
            )}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </Link>
    </li>
  );
});
ListItem.displayName = "ListItem";
const navigationMenuItemStyle = cn(
  navigationMenuTriggerStyle(),
  "bg-[transparent] hover:bg-accent/50 focus:bg-accent/50 text-xs font-medium md:text-sm",
);
