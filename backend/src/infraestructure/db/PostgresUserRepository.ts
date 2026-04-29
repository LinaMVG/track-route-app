import { Pool } from "pg";
import { IUserRepository } from "@domain/ports/IUserRepository";
import { User, UserRole } from "@domain/entities/User";

function mapRowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    username: row.username as string,
    password: row.password as string,
    role: row.role as UserRole,
    createdAt: new Date(),
    isActive: row.is_active as boolean,
  };
}

export class PostgressUserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  async findByUsername(username: string): Promise<User | null> {
    const result = await this.pool.query(
      "SELECT * FROM users WHERE username = $1 AND is_active = true LIMIT 1",
      [username]
    );
    return result.rows.length > 0 ? mapRowToUser(result.rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query("SELECT * FROM users WHERE id = $1 AND is_active = true LIMIT 1", [
      [id],
    ]);
    return result.rows.length > 0 ? mapRowToUser(result.rows[0]) : null;
  }
}
