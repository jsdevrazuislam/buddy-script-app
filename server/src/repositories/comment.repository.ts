import sequelize from '../config/database';
import { Comment, User } from '../models';

class CommentRepository {
  async create(commentData: Parameters<typeof Comment.create>[0]): Promise<Comment> {
    return await Comment.create(commentData);
  }

  async findByIdWithUser(id: string, userId: string): Promise<Comment | null> {
    return await Comment.findByPk(id, {
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT CAST(COUNT(*) AS INTEGER)
              FROM likes AS l
              WHERE
                l."targetId" = "Comment"."id"
                AND l."targetType" = 'COMMENT'
            )`),
            'likesCount',
          ],
          [
            sequelize.literal(`(
              SELECT EXISTS(
                SELECT 1
                FROM likes AS l
                WHERE
                  l."targetId" = "Comment"."id"
                  AND l."targetType" = 'COMMENT'
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

  async findById(id: string): Promise<Comment | null> {
    return await Comment.findByPk(id);
  }

  async findByPostId(
    userId: string,
    postId: string,
    limit?: number,
    offset?: number,
  ): Promise<Comment[]> {
    return await Comment.findAll({
      where: {
        postId,
        parentId: null,
      },
      limit,
      offset,
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT CAST(COUNT(*) AS INTEGER)
              FROM likes AS l
              WHERE
                l."targetId" = "Comment"."id"
                AND l."targetType" = 'COMMENT'
            )`),
            'likesCount',
          ],
          [
            sequelize.literal(`(
              SELECT EXISTS(
                SELECT 1
                FROM likes AS l
                WHERE
                  l."targetId" = "Comment"."id"
                  AND l."targetType" = 'COMMENT'
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
        {
          model: Comment,
          as: 'replies',
          attributes: {
            include: [
              [
                sequelize.literal(`(
                  SELECT CAST(COUNT(*) AS INTEGER)
                  FROM likes AS l
                  WHERE
                    l."targetId" = "replies"."id"
                    AND l."targetType" = 'REPLY'
                )`),
                'likesCount',
              ],
              [
                sequelize.literal(`(
                  SELECT EXISTS(
                    SELECT 1
                    FROM likes AS l
                    WHERE
                      l."targetId" = "replies"."id"
                      AND l."targetType" = 'REPLY'
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
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }
  async bulkCreate(comments: Parameters<typeof Comment.bulkCreate>[0]): Promise<void> {
    await Comment.bulkCreate(comments);
  }
}

export default new CommentRepository();
