import Head from "next/head";

import { SpeedInsights } from "@vercel/speed-insights/next";
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

import { NextSeo } from "next-seo";

const TITLE = "Where Is The Google Car";
const DESCRIPTION =
  "WhereIsTheGoogleCar is the largest community-driven database of Google Street View Sightings, monitoring since 2020.";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <NextSeo
        title={TITLE}
        description={DESCRIPTION}
        openGraph={{
          type: "website",
          title: TITLE,
          description: DESCRIPTION,
          images: [
            {
              url: `${env.NEXT_PUBLIC_VERCEL_URL}/about.webp`,
              width: 1200,
              height: 630,
              alt: TITLE,
            },
          ],
          site_name: "Where Is The Google Car",
        }}
        twitter={{
          cardType: "summary_large_image",
        }}
      />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="relative flex min-h-screen flex-col justify-between gap-4 bg-background">
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
          <SpeedInsights />
        </div>
      </ThemeProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
