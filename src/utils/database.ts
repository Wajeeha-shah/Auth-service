import type { DataSource } from "typeorm";
import { AppDataSource } from "../_config/data-source.js";

/** Drops and rebuilds all database tables so each test starts with a completely fresh schema. */
export async function clearDatabase(
  dataSource: DataSource = AppDataSource,
): Promise<void> {
  await dataSource.dropDatabase();
  await dataSource.synchronize();
}

