import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'gpbmt';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

async function getDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }

  db = client.db(MONGODB_DB);
  return db;
}

export async function getCollection(collectionName: string) {
  const database = await getDatabase();
  return database.collection(collectionName);
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export default getDatabase;
