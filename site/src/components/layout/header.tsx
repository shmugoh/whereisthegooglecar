import React, { useEffect } from "react";
import Link from "next/link";

import { useTheme } from "next-themes";

import { MdOutlineStreetview } from "react-icons/md";
import Head from "next/head";

import DesktopNavBar from "./navbar/desktopNavBar";
import MobileNavBar from "./navbar/mobileNavBar";

export const Header = () => {
  //  for some reason if i attempt setting the theme-color on _app.tsx,
  // _app.tsx won't pickup the new updated hook
  // but if i try here... it works? it's weird
  const { setTheme, theme } = useTheme();

  return (
    <>
      <Head>
        <meta name="theme-color" content={theme === "dark" ? "#000" : "#fff"} />
      </Head>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center md:gap-4">
          {/* Title and Logo */}
          <Link href="/" className="flex items-center gap-2">
            <MdOutlineStreetview size={42} className="flex" />
            <span className="hidden text-xl font-bold lg:flex">
              Where Is The Google Car
            </span>
          </Link>

          {/* NavBar */}
          <DesktopNavBar setTheme={setTheme} />
          <MobileNavBar setTheme={setTheme} />
        </div>
      </header>
    </>
  );
};
