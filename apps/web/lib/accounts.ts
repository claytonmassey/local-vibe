import { Pool } from "pg";
import type { Business, Role, User } from "./model";

type Sql = Pool;

const globalPool = globalThis as unknown as { __marketmapPool?: Pool };

function databaseConfig() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return null;
  const url = new URL(raw);
  return {
    host: url.hostname,
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    max: 3,
    ssl: { rejectUnauthorized: false },
  };
}

export function hasDatabase(): boolean {
  return Boolean(databaseConfig());
}

export function getPool(): Sql | null {
  const config = databaseConfig();
  if (!config) return null;
  if (!globalPool.__marketmapPool) globalPool.__marketmapPool = new Pool(config);
  return globalPool.__marketmapPool;
}

type ActorRow = {
  id: string;
  email: string;
  name: string;
  role: Role;
  business_id: string | null;
  business_name: string | null;
  category: string | null;
  zip: string | null;
  time_zone: string | null;
  offerings: string | null;
  tone: string | null;
  reminders_opt_in: boolean | null;
};

function businessFrom(row: ActorRow): Business | null {
  if (!row.business_id || !row.business_name || !row.category || !row.zip || !row.time_zone || !row.tone) return null;
  return {
    id: row.business_id,
    ownerId: row.id,
    name: row.business_name,
    category: row.category,
    zip: row.zip,
    timeZone: row.time_zone,
    offerings: row.offerings ?? "",
    tone: row.tone,
    remindersOptIn: Boolean(row.reminders_opt_in),
  };
}

export async function findAccount(token: string): Promise<{ user: User; business: Business | null } | null> {
  const db = getPool();
  if (!db) return null;
  const result = await db.query<ActorRow>(
    `select u.id, u.email, u.name, u.role,
            b.id as business_id, b.name as business_name, b.category, b.zip, b.time_zone,
            b.offerings, b.tone, b.reminders_opt_in
     from public.sessions s
     join public.users u on u.id = s.user_id
     left join public.businesses b on b.owner_id = u.id
     where s.token = $1`,
    [token],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    user: { id: row.id, email: row.email, name: row.name, role: row.role, passwordHash: null },
    business: businessFrom(row),
  };
}

export async function findUserByEmail(email: string): Promise<(User & { passwordHash: string | null }) | null> {
  const db = getPool();
  if (!db) return null;
  const result = await db.query<{ id: string; email: string; name: string; role: Role; password_hash: string | null }>(
    `select id, email, name, role, password_hash from public.users where email = $1`,
    [email],
  );
  const row = result.rows[0];
  if (!row) return null;
  return { id: row.id, email: row.email, name: row.name, role: row.role, passwordHash: row.password_hash };
}

export async function insertUser(user: User): Promise<void> {
  const db = getPool();
  if (!db) return;
  await db.query(
    `insert into public.users (id, email, name, role, password_hash) values ($1, $2, $3, $4, $5)`,
    [user.id, user.email, user.name, user.role, user.passwordHash],
  );
}

export async function insertSession(token: string, userId: string): Promise<void> {
  const db = getPool();
  if (!db) return;
  await db.query(`insert into public.sessions (token, user_id) values ($1, $2)`, [token, userId]);
}

export async function deleteSession(token: string): Promise<void> {
  const db = getPool();
  if (!db) return;
  await db.query(`delete from public.sessions where token = $1`, [token]);
}

export async function userHasBusiness(userId: string): Promise<boolean> {
  const db = getPool();
  if (!db) return false;
  const result = await db.query(`select 1 from public.businesses where owner_id = $1 limit 1`, [userId]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function saveBusinessRecord(business: Business): Promise<void> {
  const db = getPool();
  if (!db) return;
  await db.query(
    `insert into public.businesses (id, owner_id, name, category, zip, time_zone, offerings, tone, reminders_opt_in)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     on conflict (owner_id) do update set
       id = excluded.id,
       name = excluded.name,
       category = excluded.category,
       zip = excluded.zip,
       time_zone = excluded.time_zone,
       offerings = excluded.offerings,
       tone = excluded.tone,
       reminders_opt_in = excluded.reminders_opt_in`,
    [
      business.id,
      business.ownerId,
      business.name,
      business.category,
      business.zip,
      business.timeZone,
      business.offerings,
      business.tone,
      business.remindersOptIn,
    ],
  );
}
