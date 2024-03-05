import React from "react";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { cn } from "~/lib/utils";

import { MdOutlineStreetview } from "react-icons/md";

export const Header = () => {
  return (
    <div className="mt-24 md:mt-12">
      <header className="fixed left-0 top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex flex-col flex-wrap items-center gap-2 py-4 md:flex-row md:gap-8 md:py-2">
          {/* Title and Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <MdOutlineStreetview size={36} />
            whereisthegooglecar.com
          </Link>

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
              {/* <NavigationMenuItem>
                <NavigationMenuTrigger>Others</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <ListItem href="/" title="Google"></ListItem>
                    <ListItem href="/" title="Apple"></ListItem>
                    <ListItem href="/" title="Yandex"></ListItem>
                    <ListItem href="/" title="Others"></ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem> */}

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
        </div>
      </header>
    </div>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

const navigationMenuItemStyle = cn(
  navigationMenuTriggerStyle(),
  "bg-[transparent] hover:bg-accent/50 focus:bg-accent/50",
);
