import "reflect-metadata"
import { DataSource } from "typeorm"
import { USER } from "../entity/user.entity.js";
import { Config } from "./index.js";
export const AppDataSource = new DataSource({
  type: "postgres",

  host: Config.DB_HOST as string,
  port: parseInt(Config.DB_PORT as string),

  username: Config.DB_USER as string,
  password: Config.DB_PASSWORD as string,
  database: Config.DB_NAME as string,

  synchronize: Config.NODE_ENV === 'dev' || Config.NODE_ENV === 'test' ? true : false,
  logging: true,

  entities: [USER],
  subscribers: [],
  migrations: [],
});