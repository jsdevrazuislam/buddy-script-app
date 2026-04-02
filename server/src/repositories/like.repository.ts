import { Like, User } from '../models';

class LikeRepository {
  async findOne(userId: string, targetId: string, targetType: string): Promise<Like | null> {
    return await Like.findOne({
      where: { userId, targetId, targetType },
    });
  }

  async create(
    userId: string,
    targetId: string,
    targetType: 'POST' | 'COMMENT' | 'REPLY',
  ): Promise<Like> {
    return await Like.create({ userId, targetId, targetType });
  }

  async destroy(like: Like): Promise<void> {
    await like.destroy();
  }

  async findUsersByTarget(targetId: string, targetType: string): Promise<User[]> {
    const likes = await Like.findAll({
      where: { targetId, targetType },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });
    // @ts-expect-error Typescript incorrectly complains about untyped relations
    return likes.map((like) => like.user);
  }
}

export default new LikeRepository();
