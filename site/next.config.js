/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");
const { withPlausibleProxy } = await import("next-plausible");

/** @type {import("next").NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const config = withPlausibleProxy({
  customDomain: "https://analytics.shmugo.co",
})({
  reactStrictMode: true,

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.whereisthegooglecar.com", // works for now :P
      },
    ],
  },
});

export default config;
