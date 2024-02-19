import Link from "next/link";
import React from "react";
import { Separator } from "../ui/separator";

import { Github } from "lucide-react";

import { MdOutlineStreetview } from "react-icons/md";

const links = [
  {
    href: "https://github.com/shmugoh/whentoplayvideo",
    icon: <Github />,
  },
];

export const Header = () => {
  return (
    <div>
      <header className="bg-[white]">
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
                  className="hover:text-foreground/80 text-foreground/60"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-foreground/80 text-foreground/60"
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex flex-1 items-center justify-between md:justify-end">
            {/* Search Bar */}

            {/* Links */}
            {links.map(({ href, icon }, index) => (
              <React.Fragment key={index}>
                <a href={href} className="relative flex space-x-2">
                  {React.cloneElement(icon, {
                    className: "hover:-rotate-6 hover:scale-125",
                  })}
                </a>
                {index < links.length - 1 && (
                  <Separator
                    className="bg-popover h-8"
                    orientation="vertical"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>
      <Separator />
    </div>
  );
};
