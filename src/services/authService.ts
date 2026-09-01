import { AppDataSource } from "../_config/data-source.js";
import type { userData } from "../controller/auth.js";
import { USER } from "../entity/user.entity.js";
import { Roles } from "../constants/index.js";

export class authService {
  async create({ username, email, password }: userData) {
    const userRepository = AppDataSource.getRepository(USER);
    const user = userRepository.create({
      username: username ?? "",
      email: email ?? "",
      password: password ?? "",
      role: Roles.CUSTOMER,
    });

    const savedUser = await userRepository.save(user);
    return savedUser;
  }
}