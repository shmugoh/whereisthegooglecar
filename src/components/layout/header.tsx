import Link from "next/link";
import React from "react";
import { Separator } from "../ui/separator";

import { Github } from "lucide-react";

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
          <div>
            <Link href="/" className="text-xl font-bold">
              whereisthegooglecar.com
            </Link>
          </div>

          <nav className="flex items-center">
            {/* icon here */}

            <ul className="flex gap-6 leading-[normal]">
              <li>
                <Link href="/" className="">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="">
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
