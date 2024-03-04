import Head from "next/head";
import { Analytics } from "@vercel/analytics/react";

import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Inter as FontSans } from "next/font/google";

import { cn } from "../lib/utils";
import { Header } from "~/components/layout/header";
import { Foot } from "~/components/layout/footer";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const TITLE = "WhereIsTheGoogleCar";
const DESCRIPTION =
  "whereisthegooglecar.com is the largest public database of Google Street View Driving Sightings. We are not affiliated with Google or any other mapping company.";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta property="og:title" content={TITLE}></meta>
        <meta property="twitter:title" content={TITLE}></meta>

        <meta property="og:description" content={DESCRIPTION}></meta>
        <meta name="description" content={DESCRIPTION}></meta>

        <meta
          name="keywords"
          content="google street view, google car, google maps, google, street view, google street view car, google street view car location, google street view car sightings, google street view car tracker, google street view car sightings, google street view car sightings map, google street view car sightings live"
        />
        <link rel="icon" href="/favicon.svg" />
      </Head>
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
    </>
  );
};

export default api.withTRPC(MyApp);
