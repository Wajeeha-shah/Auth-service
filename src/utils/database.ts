import type { DataSource } from "typeorm";
import { AppDataSource } from "../_config/data-source.js";

/** Clears every registered entity so each test starts with an empty database. */
export async function clearDatabase(
  dataSource: DataSource = AppDataSource,
): Promise<void> {
  const repositories = [...dataSource.entityMetadatas]
    .reverse()
    .map((metadata) => dataSource.getRepository(metadata.target));

  for (const repository of repositories) {
    await repository.clear();
  }
}
