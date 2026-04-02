import { Op, WhereOptions } from 'sequelize';
import sequelize from '../config/database';
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
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT CAST(COUNT(*) AS INTEGER)
              FROM likes AS l
              WHERE
                l."targetId" = "Post"."id"
                AND l."targetType" = 'POST'
            )`),
            'likesCount',
          ],
          [
            sequelize.literal(`(
              SELECT CAST(COUNT(*) AS INTEGER)
              FROM comments AS c
              WHERE
                c."postId" = "Post"."id"
            )`),
            'commentsCount',
          ],
          [
            sequelize.literal(`(
              SELECT EXISTS(
                SELECT 1
                FROM likes AS l
                WHERE
                  l."targetId" = "Post"."id"
                  AND l."targetType" = 'POST'
                  AND l."userId" = '${userId.replace(/'/g, "''")}'
              )
            )`),
            'isLiked',
          ],
        ],
      },
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
    const attributes: import('sequelize').FindAttributeOptions = {
      include: [
        [
          sequelize.literal(`(
            SELECT CAST(COUNT(*) AS INTEGER)
            FROM likes AS l
            WHERE
              l."targetId" = "Post"."id"
              AND l."targetType" = 'POST'
          )`),
          'likesCount',
        ],
        [
          sequelize.literal(`(
            SELECT CAST(COUNT(*) AS INTEGER)
            FROM comments AS c
            WHERE
              c."postId" = "Post"."id"
          )`),
          'commentsCount',
        ],
      ],
    };

    if (userId) {
      attributes.include.push([
        sequelize.literal(`(
          SELECT EXISTS(
            SELECT 1
            FROM likes AS l
            WHERE
              l."targetId" = "Post"."id"
              AND l."targetType" = 'POST'
              AND l."userId" = '${userId.replace(/'/g, "''")}'
          )
        )`),
        'isLiked',
      ]);
    }

    return await Post.findByPk(id, {
      attributes,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });
  }
}

export default new PostRepository();
