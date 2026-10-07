import { Pool } from 'pg';

// Connection pool targeting PostgreSQL container
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgrespassword@localhost:5432/nexus_d2c';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });
  }
  return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const p = getDbPool();
  try {
    const res = await p.query(text, params);
    return res.rows;
  } catch (error) {
    console.error('PostgreSQL query error:', error, { text, params });
    throw error;
  }
}
