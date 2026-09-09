import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { USER } from "./user.entity.js";

@Entity({ name: "refresh_tokens" })
export class RefreshToken {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @ManyToOne(() => USER, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: USER;

  @Column("uuid")
  userId!: string;

  @Column({ type: "timestamp" })
  expiresAt!: Date;

  @Column({ type: "boolean", default: false })
  revoked!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
