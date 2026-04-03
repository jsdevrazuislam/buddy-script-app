import { Op, WhereOptions } from 'sequelize';
import { Post, User } from '../models';

class PostRepository {
  async create(postData: Parameters<typeof Post.create>[0]): Promise<Post> {
    return await Post.create(postData);
  }

  async findFeed(userId: string, cursor?: string, limit: number = 10): Promise<Post[]> {
    const whereClause: WhereOptions<Post> = {
      [Op.or]: [{ visibility: 'PUBLIC' }, { userId, visibility: 'PRIVATE' }],
    };

    if (cursor) {
      Object.assign(whereClause, {
        createdAt: {
          [Op.lt]: new Date(cursor),
        },
      });
    }

    return await Post.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: limit + 1,
      // Now using precomputed columns instead of subqueries
      attributes: ['id', 'userId', 'text', 'imageUrl', 'visibility', 'likesCount', 'commentsCount', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });
  }

  async findById(id: string, userId?: string): Promise<Post | null> {
    return await Post.findByPk(id, {
      attributes: ['id', 'userId', 'text', 'imageUrl', 'visibility', 'likesCount', 'commentsCount', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });
  }

  async incrementLikes(postId: string, delta: number): Promise<void> {
    await Post.increment('likesCount', {
      by: delta,
      where: { id: postId },
    });
  }

  async incrementComments(postId: string, delta: number): Promise<void> {
    await Post.increment('commentsCount', {
      by: delta,
      where: { id: postId },
    });
  }
}

export default new PostRepository();
