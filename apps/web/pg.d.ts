declare module "pg" {
  export class Pool {
    constructor(config?: {
      connectionString?: string;
      host?: string;
      port?: number;
      user?: string;
      password?: string;
      database?: string;
      max?: number;
      ssl?: { rejectUnauthorized: boolean };
    });
    query<T = Record<string, unknown>>(
      text: string,
      values?: readonly unknown[],
    ): Promise<{ rows: T[]; rowCount: number | null }>;
    end(): Promise<void>;
  }
}
