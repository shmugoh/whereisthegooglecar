import Link from "next/link";
import React from "react";
import { Separator } from "../ui/separator";

import { Github } from "lucide-react";

import { MdOutlineStreetview } from "react-icons/md";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col flex-wrap items-center gap-4 py-4 md:flex-row md:gap-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <MdOutlineStreetview size={36} />
          whereisthegooglecar.com
        </Link>

        <nav className="flex items-center">
          {/* TODO: get active page */}
          <ul className="font-regular flex gap-16 text-lg leading-[normal] md:gap-5 md:text-base">
            <li>
              <Link
                href="/"
                className="text-foreground/60 hover:text-foreground/80"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-foreground/60 hover:text-foreground/80"
              >
                About
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex flex-1 items-center justify-between md:justify-end">
          {/* Search Bar */}

          {/* Links */}
          {/* {links.map(({ href, icon }, index) => (
            <React.Fragment key={index}>
              <a href={href} className="relative flex space-x-2">
                {React.cloneElement(icon, {
                  className: "hover:-rotate-6 hover:scale-125",
                })}
              </a>
              {index < links.length - 1 && (
                <Separator className="h-8 bg-popover" orientation="vertical" />
              )}
            </React.Fragment>
          ))} */}
        </div>
      </div>
    </header>
  );
};
