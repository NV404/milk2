import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL! as string;

let connection: postgres.Sql;

if (process.env.NODE_ENV === "production") {
  connection = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false },
    prepare: false,
  });
} else {
  const globalConnection = global as typeof globalThis & {
    connection: postgres.Sql;
  };

  if (!globalConnection.connection) {
    globalConnection.connection = postgres(DATABASE_URL, {
      ssl: { rejectUnauthorized: false },
      prepare: false,
    });
  }

  connection = globalConnection.connection;
}

const db = drizzle(connection, {
  schema,
});

export { db, schema };
