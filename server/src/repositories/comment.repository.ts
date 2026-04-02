import { Comment, User } from '../models';

class CommentRepository {
  async create(commentData: Parameters<typeof Comment.create>[0]): Promise<Comment> {
    return await Comment.create(commentData);
  }

  async findByIdWithUser(id: string): Promise<Comment | null> {
    return await Comment.findByPk(id, {
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

  async findByPostId(postId: string, limit?: number, offset?: number): Promise<Comment[]> {
    return await Comment.findAll({
      where: {
        postId,
        parentId: null,
      },
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: Comment,
          as: 'replies',
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
}

export default new CommentRepository();
