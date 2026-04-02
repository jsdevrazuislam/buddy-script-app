import { User } from '../models';

class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return await User.findByPk(id);
  }

  async create(userData: Parameters<typeof User.create>[0]): Promise<User> {
    return await User.create(userData);
  }
}

export default new UserRepository();
