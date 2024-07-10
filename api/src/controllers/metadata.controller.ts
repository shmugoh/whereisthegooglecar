import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { spottings as spottings_schema } from "../db/schema";
import { capitalizeLetter } from "../utils/strings";
import { orderServices } from "../utils/arrays";

class MetadataController {
  async getServices(c: any) {
    try {
      const sql = postgres(c.env.DATABASE_URL);
      const db = drizzle(sql);

      const queryResult = await db
        .selectDistinct({ services: spottings_schema.company })
        .from(spottings_schema);

      let result: string[] = [];
      queryResult.forEach((service) => {
        let serviceName = capitalizeLetter(service.services);
        result.push(serviceName);
      });
      orderServices(result);

      return result;
    } catch (error) {
      return error;
    }
  }
}

export const metadataController = new MetadataController();
