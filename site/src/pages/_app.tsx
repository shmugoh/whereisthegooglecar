import Head from "next/head";
import { Analytics } from "@vercel/analytics/react";

import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Inter as FontSans } from "next/font/google";

import { cn } from "../lib/utils";
import { Header } from "~/components/layout/header";
import { Foot } from "~/components/layout/footer";
import { ThemeProvider } from "~/components/theme-provider";

import { env } from "~/env";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const TITLE = "WhereIsTheGoogleCar";
const DESCRIPTION =
  "WhereIsTheGoogleCar is the largest community-driven database of Google Street View Sightings, monitoring since 2020.";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <link
          rel="sitemap"
          type="application/xml"
          title="Sitemap"
          href="/api/sitemap.xml"
        />

        <title>{TITLE}</title>
        <meta property="og:title" content={TITLE}></meta>
        <meta property="twitter:title" content={TITLE}></meta>

        <meta property="twitter:description" content={DESCRIPTION}></meta>
        <meta property="og:description" content={DESCRIPTION}></meta>
        <meta name="description" content={DESCRIPTION}></meta>
        <meta
          name="keywords"
          content="google street view, google car, google maps, google, street view, google street view car, google street view car location, google street view car sightings, google street view car tracker, google street view car sightings, google street view car sightings map, google street view car sightings live"
        />
        <link rel="icon" href="/favicon.svg" />

        <meta
          property="og:image"
          content={`${env.NEXT_PUBLIC_VERCEL_URL}/about.webp`}
        />
        <meta
          property="twitter:image"
          content={`${env.NEXT_PUBLIC_VERCEL_URL}/about.webp`}
        ></meta>
        <meta name="twitter:card" content="summary_large_image" />

        <meta property="og:type" content="website" />
        {/* <meta
            property="og:url"
            content={`${env.NEXT_PUBLIC_VERCEL_URL}/spotting/${props.data.id}`}
          /> */}
      </Head>

      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="flex h-screen flex-col justify-between gap-4 bg-background">
          <Header />
          <div className="container flex flex-col pb-4">
            <Component
              className={cn(
                "min-h-screen bg-background font-sans antialiased",
                fontSans.variable,
              )}
              {...pageProps}
            />
          </div>
          <Foot />
          <Analytics />
        </div>
      </ThemeProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
