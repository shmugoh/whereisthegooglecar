"use client";

import React from "react";
import { Separator } from "~/components/ui/separator";
import { Twitter, Github, Coffee } from "lucide-react";
import Link from "next/link";

const links = [
  {
    href: "https://twitter.com/VirtualStreets_",
    icon: <Twitter />,
  },
  {
    href: "https://github.com/shmugoh/whereisthegooglecar",
    icon: <Github />,
  },
  {
    href: "https://ko-fi.com/shmugo",
    icon: <Coffee />,
  },
];

export function Foot() {
  return (
    <footer className="border-t border-border/40">
      <div className="relative mt-auto bg-background py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-wrap justify-center">
            <div className="flex flex-col items-center md:items-baseline">
              <p className="text-background-foreground font-bold leading-7">
                © VirtualStreets |{" "}
                <Link href="/privacy-policy" className="font-medium text-primary underline underline-offset-4">
                  Privacy Policy
                </Link>{" "}
                |{" "}
                <Link href="/about" className="font-medium text-primary underline underline-offset-4">
                  About
                </Link>
              </p>
              <p className="text-background-foreground leading-7">
                All trademarks and pictures are property of their respective owners.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {links.map(({ href, icon }, index) => (
              <React.Fragment key={index}>
                <a href={href} className="relative flex space-x-2">
                  {React.cloneElement(icon, {
                    className: "hover:-rotate-6 hover:scale-125",
                  })}
                </a>
                {index < links.length - 1 && <Separator className="h-8 bg-secondary" orientation="vertical" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
