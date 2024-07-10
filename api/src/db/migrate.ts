import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".dev.vars" });

const db = postgres(`${process.env.DATABASE_URL}`, { max: 1 });

const main = async () => {
  try {
    await migrate(drizzle(db), { migrationsFolder: "drizzle" });
    console.log("Migration complete");
  } catch (error) {
    console.log(error);
  }
  process.exit(0);
};
main();
