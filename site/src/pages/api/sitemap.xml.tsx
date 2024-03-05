/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { NextApiRequest, NextApiResponse } from "next";

import { db } from "~/server/db";
import { env } from "~/env";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // removes slash at the end of next_public_vercel_url
  // an extrah slash is added in production
  let url = env.NEXT_PUBLIC_VERCEL_URL;
  if (url.endsWith("/")) {
    url = env.NEXT_PUBLIC_VERCEL_URL.slice(0, -1);
  }

  // instructing vercel to cache
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-control", "stale-while-revalidate, s-maxage=3600");

  // get all spotting ids for sitemap
  const startTime = performance.now();
  const spottingIds = await get_spottings();
  const endTime = performance.now();
  console.log(spottingIds);
  console.log(endTime - startTime);

  // generate sitemap
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"> 
    
    ${generateUrlAttribute(`${url}/`, new Date(), "always", "1.0")}
    ${generateUrlAttribute(`${url}/about`, undefined, "monthly", "0.9")}
    
    ${spottingIds.map((spotting) => {
      return generateUrlAttribute(
        `${url}/spotting/${spotting.message_id}`,
        spotting.date,
      );
    })}
    </urlset>`;
  res.end(xml);
}

function generateUrlAttribute(
  url: string,
  date?: Date,
  changeFreq?: string,
  priority?: string,
) {
  return `
    <url>
      <loc>${url}</loc>
      ${date ? `<lastmod>${date.toISOString()}</lastmod>` : ""}
      ${changeFreq ? `<changefreq>${changeFreq}</changefreq>` : ""}
      ${priority ? `<priority>${priority}</priority>` : ""}
    </url>
  `;
}

function get_spottings() {
  return db.spottings.findMany({
    select: {
      message_id: true,
      date: true,
    },
  });
}
