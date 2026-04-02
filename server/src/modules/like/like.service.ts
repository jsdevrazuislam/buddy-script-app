import likeRepository from '../../repositories/like.repository';

export const toggleLike = async (
  userId: string,
  targetId: string,
  targetType: 'POST' | 'COMMENT' | 'REPLY',
) => {
  const existingLike = await likeRepository.findOne(userId, targetId, targetType);

  if (existingLike) {
    await likeRepository.destroy(existingLike);
    return { liked: false };
  } else {
    await likeRepository.create(userId, targetId, targetType);
  }
};

export const getLikers = async (targetId: string, targetType: string) => {
  return await likeRepository.findUsersByTarget(targetId, targetType);
};
