import {
  pgTable,
  pgSchema,
  AnyPgColumn,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import {
  serial,
  integer,
  varchar,
  timestamp,
  bigint,
} from "drizzle-orm/pg-core";
import { relations, type InferModel } from "drizzle-orm";

export const spottings = pgTable(
  "spottings",
  {
    id: serial("id").primaryKey(),
    date: timestamp("date").notNull(),
    town: varchar("town").notNull(),
    country: varchar("country").notNull(),
    countryEmoji: varchar("countryEmoji").notNull(),
    imageUrl: varchar("imageUrl").notNull(),
    sourceUrl: varchar("sourceUrl").notNull(),
    locationUrl: varchar("locationUrl"),
    company: varchar("company").notNull().default("google"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull().defaultNow(),
    message_id: varchar("message_id").notNull(),
    channel_id: bigint("channel_id", { mode: "bigint" }).notNull(),
    width: integer("width"),
    height: integer("height"),
  },
  (spottings) => ({
    idIndex: index("spottings_id_index").on(spottings.id),
  })
);

export const channel = pgTable("channel", {
  id: bigint("id", { mode: "bigint" }).primaryKey().unique(),
  type: varchar("type").notNull(),
  company: varchar("company").notNull().default("google"),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  town: varchar("town").notNull(),
  country: varchar("country").notNull(),
  imageUrl: varchar("imageUrl"),
  sourceUrl: varchar("sourceUrl").notNull(),
  locationUrl: varchar("locationUrl"),
  company: varchar("company").notNull().default("google"),
  mode: varchar("mode").notNull(),
  message_id: bigint("message_id", { mode: "bigint" }).notNull(),
  output_message_id: bigint("output_message_id", { mode: "bigint" }),
  output_channel_id: bigint("output_channel_id", { mode: "bigint" }),
});

export const spottingsRelations = relations(spottings, ({ one }) => ({
  channel: one(channel, {
    fields: [spottings.channel_id],
    references: [channel.id],
  }),
}));

export const channelRelations = relations(channel, ({ many }) => ({
  spottings: many(spottings),
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  channel: one(channel, {
    fields: [submissions.output_channel_id],
    references: [channel.id],
  }),
}));

export type Spottings = InferModel<typeof spottings>;
export type Channel = InferModel<typeof channel>;
export type Submissions = InferModel<typeof submissions>;
