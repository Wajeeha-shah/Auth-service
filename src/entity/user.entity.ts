import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Roles } from "../constants/index.js";

@Entity({ name: "users" })
export class USER {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { unique: true })
  username!: string;

  @Column("varchar", { unique: true })
  email!: string;

  @Column("varchar")
  password!: string;

  @Column("varchar", { default: Roles.CUSTOMER })
  role!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
