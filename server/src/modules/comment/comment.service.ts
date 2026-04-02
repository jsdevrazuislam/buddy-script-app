import commentRepository from '../../repositories/comment.repository';
import { NotFoundError } from '../../utils/errors';

export const createComment = async (userId: string, postId: string, text: string) => {
  const comment = await commentRepository.create({
    userId,
    postId,
    text,
  });

  return await commentRepository.findByIdWithUser(comment.id);
};

export const createReply = async (userId: string, parentId: string, text: string) => {
  const parentComment = await commentRepository.findById(parentId);

  if (!parentComment) {
    throw new NotFoundError('Parent comment not found');
  }

  const actualParentId = parentComment.parentId || parentId;

  const reply = await commentRepository.create({
    userId,
    postId: parentComment.postId,
    text,
    parentId: actualParentId,
  });

  return await commentRepository.findByIdWithUser(reply.id);
};

export const getCommentsForPost = async (postId: string, limit?: number, offset?: number) => {
  return await commentRepository.findByPostId(postId, limit, offset);
};
