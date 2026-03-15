import { createClient } from '@libsql/client/http';

let client;

export function getDb() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DB_URL,
      authToken: process.env.TURSO_DB_TOKEN,
    });
  }
  return client;
}
