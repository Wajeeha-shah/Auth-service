import { Repository } from "typeorm";
import { AppDataSource } from "../_config/data-source.js";
import { USER } from "../entity/user.entity.js";
import type { UpdateUserData } from "../types/user.js";
import createHttpError from "http-errors";

export class UserService {
  private userRepository: Repository<USER>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(USER);
  }

  /** Return all users (password excluded by the caller) */
  async findAll(): Promise<USER[]> {
    return this.userRepository.find({ relations: ["tenant"] });
  }

  /** Return a single user by UUID */
  async findById(id: string): Promise<USER> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["tenant"],
    });
    if (!user) {
      throw createHttpError(404, "User not found");
    }
    return user;
  }

  /** Partial update — only supplied fields are changed */
  async update(id: string, data: UpdateUserData): Promise<USER> {
    const user = await this.findById(id);

    if (data.username) user.username = data.username.trim();
    if (data.email)    user.email    = data.email.trim();
    if (data.role)     user.role     = data.role;

    return this.userRepository.save(user);
  }

  /** Hard-delete a user by UUID */
  async remove(id: string): Promise<void> {
    const user = await this.findById(id); // throws 404 if not found
    await this.userRepository.remove(user);
  }
}
