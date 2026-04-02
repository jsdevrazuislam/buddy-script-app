import commentRepository from '../../repositories/comment.repository';
import { NotFoundError } from '../../utils/errors';

export const createComment = async (userId: string, postId: string, text: string) => {
  const comment = await commentRepository.create({
    userId,
    postId,
    text,
  });

  const fetchedComment = await commentRepository.findByIdWithUser(comment.id, userId);
  if (fetchedComment) {
    fetchedComment.setDataValue('likesCount', 0);
    fetchedComment.setDataValue('isLiked', false);
  }
  return fetchedComment;
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

  const fetchedReply = await commentRepository.findByIdWithUser(reply.id, userId);
  if (fetchedReply) {
    fetchedReply.setDataValue('likesCount', 0);
    fetchedReply.setDataValue('isLiked', false);
  }
  return fetchedReply;
};

export const getCommentsForPost = async (
  userId: string,
  postId: string,
  limit?: number,
  offset?: number,
) => {
  return await commentRepository.findByPostId(userId, postId, limit, offset);
};
