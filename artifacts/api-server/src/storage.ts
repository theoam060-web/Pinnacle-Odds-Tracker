import { usersTable } from '@workspace/db';
import { eq, sql } from 'drizzle-orm';
import { db } from '@workspace/db';

export class Storage {
  async getUser(id: string) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
  }

  async createUser(id: string, email?: string) {
    const [user] = await db.insert(usersTable).values({ id, email }).onConflictDoNothing().returning();
    return user;
  }

  async getUserByEmail(email: string) {
    const result = await db.execute(
      sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`
    );
    return result.rows[0] || null;
  }
}

export const storage = new Storage();
