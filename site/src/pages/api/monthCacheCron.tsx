import { db } from "~/server/db";
import { kv } from "@vercel/kv";

import type { NextApiRequest, NextApiResponse } from "next";
import { TRPCError } from "@trpc/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // is executed by user
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401);
    res.send({ status: res.statusCode, message: "unauthorized", data: [] });
    return;
  }

  // is executed by cron
  const company = req.query.company;
  if (typeof company === "string") {
    // generates date
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(`${year}-${month}-31`);
    console.log("[CACHE - CRON] Using dates: ", startDate, endDate);

    // retrieve from database
    console.log("[CACHE - CRON] Retrieving from database...");
    const data = await db.spottings
      .findMany({
        where: {
          company: company,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: "desc" },
      })
      .then((data) => {
        if (data.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No data found for ${company} in ${month}/${year}`,
          });
        } else {
          return data;
        }
      });

    // caches on redis
    console.log("[CACHE - CRON] Caching...");
    await kv.hset(`spottings:${company}:${month}:${year}`, {
      data: data,
    });

    // returns cached data
    console.log("[CACHE - CRON] Cached! Returning cached data...");
    const cachedData = await kv.hget(
      `spottings:${company}:${month}:${year}`,
      "data",
    );
    res.send({ status: res.statusCode, message: "success", data: cachedData });
  }

  // in case of company not being passed
  res.status(400);
  res.send({
    status: res.statusCode,
    message: "service name was not passed",
    data: [],
  });
}
