import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Roles } from "../constants/index.js";
import { Tenant } from "./tenant.entity.js";

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

  @ManyToOne(() => Tenant, { onDelete: "SET NULL", nullable: true })
  tenant!: Tenant | null;

  @CreateDateColumn()
  createdAt!: Date;
}

