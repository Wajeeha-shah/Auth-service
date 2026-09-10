import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "tenants" })
export class Tenant {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column("varchar", { length: 100 })
  name!: string;

  @Column("varchar", { length: 255 })
  address!: string;

  @UpdateDateColumn()
  updatedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
