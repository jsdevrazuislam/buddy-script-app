'use client';

import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import { ReactionModal } from '@/components/common/ReactionModal';
import { useComments } from '@/features/comment/hooks/useComments';
import { useToggleLike, useLikers } from '@/features/like/hooks/useLikes';
import { useAuthStore } from '@/store/useAuthStore';
import { Post, Comment } from '@/types';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { mutate: toggleLike } = useToggleLike();
  const [showComments, setShowComments] = useState(false);
  const [isReactionModalOpen, setIsReactionModalOpen] = useState(false);
  const { data: likers } = useLikers(post.id, 'POST');
  const [isDropOpen, setIsDropOpen] = useState(false);
  const validLikers = likers?.slice(0, 5) || [];

  const handleLike = () => {
    toggleLike({ targetId: post.id, targetType: 'POST' });
  };

  return (
    <>
      <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
        <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
          <div className="_feed_inner_timeline_post_top">
            <div className="_feed_inner_timeline_post_box">
              <div className="_feed_inner_timeline_post_box_image">
                <Link href="/profile">
                  <Image
                    src={post.user.avatar || '/assets/images/post_img.png'}
                    alt="User Avatar"
                    width={44}
                    height={44}
                    className="_post_img"
                  />
                </Link>
              </div>
              <div className="_feed_inner_timeline_post_box_txt">
                <Link href="/profile">
                  <h4 className="_feed_inner_timeline_post_box_title">{`${post.user.firstName} ${post.user.lastName}`}</h4>
                </Link>
                <p className="_feed_inner_timeline_post_box_para">
                  {formatDistanceToNow(new Date(post.createdAt))} ago .{' '}
                  <Link href="#0">
                    {post.visibility.charAt(0) + post.visibility.slice(1).toLowerCase()}
                  </Link>
                </p>
              </div>
            </div>
            <div className="_feed_inner_timeline_post_box_dropdown">
              <div className="_feed_timeline_post_dropdown">
                <button
                  onClick={() => setIsDropOpen(!isDropOpen)}
                  id="_timeline_show_drop_btn"
                  className="_feed_timeline_post_dropdown_link"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="4"
                    height="17"
                    fill="none"
                    viewBox="0 0 4 17"
                  >
                    <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                    <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                    <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                  </svg>
                </button>
              </div>
              <div
                id="_timeline_drop"
                className={
                  isDropOpen
                    ? '_feed_timeline_dropdown _timeline_dropdown show'
                    : '_feed_timeline_dropdown _timeline_dropdown'
                }
              >
                <ul className="_feed_timeline_dropdown_list">
                  <li className="_feed_timeline_dropdown_item">
                    <a href="#0" className="_feed_timeline_dropdown_link">
                      <span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          fill="none"
                          viewBox="0 0 18 18"
                        >
                          <path
                            stroke="#737c86ff"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.2"
                            d="M14.25 15.75L9 12l-5.25 3.75v-12a1.5 1.5 0 011.5-1.5h7.5a1.5 1.5 0 011.5 1.5v12z"
                          />
                        </svg>
                      </span>
                      Save Post
                    </a>
                  </li>
                  <li className="_feed_timeline_dropdown_item">
                    <a href="#0" className="_feed_timeline_dropdown_link">
                      <span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="22"
                          fill="none"
                          viewBox="0 0 20 22"
                        >
                          <path
                            fill="#377DFF"
                            fillRule="evenodd"
                            d="M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 011.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002c-1.155-.001-2.248-.506-3.077-1.424a.762.762 0 01.057-1.083.774.774 0 011.092.057zM9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0zm0 1.535c-3.6 0-6.11 2.802-6.11 5.316 0 2.127-.595 3.11-1.12 3.978-.422.697-.755 1.247-.755 2.444.173 1.93 1.455 2.944 7.986 2.944 6.494 0 7.817-1.06 7.988-3.01-.003-1.13-.336-1.681-.757-2.378-.526-.868-1.12-1.851-1.12-3.978 0-2.514-2.51-5.316-6.111-5.316z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      Turn On Notification
                    </a>
                  </li>
                  <li className="_feed_timeline_dropdown_item">
                    <a href="#0" className="_feed_timeline_dropdown_link">
                      <span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          fill="none"
                          viewBox="0 0 18 18"
                        >
                          <path
                            stroke="#1890FF"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.2"
                            d="M14.25 2.25H3.75a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5h10.5a1.5 1.5 0 001.5-1.5V3.75a1.5 1.5 0 00-1.5-1.5zM6.75 6.75l4.5 4.5M11.25 6.75l-4.5 4.5"
                          />
                        </svg>
                      </span>
                      Hide
                    </a>
                  </li>
                  <li className="_feed_timeline_dropdown_item">
                    <a href="#0" className="_feed_timeline_dropdown_link">
                      <span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          fill="none"
                          viewBox="0 0 18 18"
                        >
                          <path
                            stroke="#1890FF"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.2"
                            d="M8.25 3H3a1.5 1.5 0 00-1.5 1.5V15A1.5 1.5 0 003 16.5h10.5A1.5 1.5 0 0015 15V9.75"
                          />
                          <path
                            stroke="#1890FF"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.2"
                            d="M13.875 1.875a1.591 1.591 0 112.25 2.25L9 11.25 6 12l.75-3 7.125-7.125z"
                          />
                        </svg>
                      </span>
                      Edit Post
                    </a>
                  </li>
                  <li className="_feed_timeline_dropdown_item">
                    <a href="#0" className="_feed_timeline_dropdown_link">
                      <span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          fill="none"
                          viewBox="0 0 18 18"
                        >
                          <path
                            stroke="#1890FF"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.2"
                            d="M2.25 4.5h13.5M6 4.5V3a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0112 3v1.5m2.25 0V15a1.5 1.5 0 01-1.5 1.5h-7.5a1.5 1.5 0 01-1.5-1.5V4.5h10.5zM7.5 8.25v4.5M10.5 8.25v4.5"
                          />
                        </svg>
                      </span>
                      Delete Post
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <h4 className="_feed_inner_timeline_post_title">{post.text}</h4>
          <div className="_feed_inner_timeline_image">
            {post.imageUrl && (
              <Image
                src={post.imageUrl}
                alt="Post Content"
                width={800}
                height={600}
                className="_time_img"
                style={{ width: '100%', height: 'auto' }}
              />
            )}
          </div>
        </div>
        <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
          {post.likesCount > 0 ? (
            <div
              className="_feed_inner_timeline_total_reacts_image"
              onClick={() => setIsReactionModalOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              {validLikers.map((liker, idx) => (
                <Image
                  key={liker.id}
                  src={liker.avatar || '/assets/images/react_img1.png'}
                  alt={`${liker.firstName}`}
                  width={32}
                  height={32}
                  className={
                    idx === 0 ? '_react_img1' : `_react_img ${idx > 1 ? '_rect_img_mbl_none' : ''}`
                  }
                />
              ))}
              <p className="_feed_inner_timeline_total_reacts_para">
                {post.likesCount > 5 ? `${post.likesCount - 5}+` : post.likesCount}
              </p>
            </div>
          ) : (
            <div className="_feed_inner_timeline_total_reacts_image"></div>
          )}
          <div className="_feed_inner_timeline_total_reacts_txt">
            <p
              className="_feed_inner_timeline_total_reacts_para1"
              onClick={() => setShowComments(!showComments)}
              style={{ cursor: 'pointer' }}
            >
              <span>{post.commentsCount}</span> Comment
            </p>
            <p className="_feed_inner_timeline_total_reacts_para2">
              <span>0</span> Share
            </p>
          </div>
        </div>
        <div className="_feed_inner_timeline_reaction">
          <button
            className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${post.isLiked ? '_feed_reaction_active' : ''}`}
            type="button"
            onClick={handleLike}
          >
            <span className="_feed_inner_timeline_reaction_link">
              <span>
                {post.isLiked ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      fill="none"
                      viewBox="0 0 19 19"
                    >
                      <path fill="#FFCC4D" d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z" />
                      <path
                        fill="#664500"
                        d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z"
                      />
                      <path
                        fill="#fff"
                        d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z"
                      />
                      <path
                        fill="#664500"
                        d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z"
                      />
                    </svg>
                    Haha
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      fill="none"
                      viewBox="0 0 19 19"
                    >
                      <path fill="#C4C4C4" d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z" />
                      <path
                        fill="#fff"
                        d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z"
                      />
                      <path
                        fill="#C4C4C4"
                        d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z"
                      />
                      <path
                        fill="#fff"
                        d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z"
                      />
                    </svg>
                    React
                  </>
                )}
              </span>
            </span>
          </button>
          <button
            className="_feed_inner_timeline_reaction_comment _feed_reaction"
            type="button"
            onClick={() => setShowComments(!showComments)}
          >
            <span className="_feed_inner_timeline_reaction_link">
              <span>
                <svg
                  className="_reaction_svg"
                  xmlns="http://www.w3.org/2000/svg"
                  width="21"
                  height="21"
                  fill="none"
                  viewBox="0 0 21 21"
                >
                  <path
                    stroke="#000"
                    d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z"
                  />
                  <path
                    stroke="#000"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.938 9.313h7.125M10.5 14.063h3.563"
                  />
                </svg>
                Comment
              </span>
            </span>
          </button>
          <button className="_feed_inner_timeline_reaction_share _feed_reaction" type="button">
            <span className="_feed_inner_timeline_reaction_link">
              <span>
                <svg
                  className="_reaction_svg"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="21"
                  fill="none"
                  viewBox="0 0 24 21"
                >
                  <path
                    stroke="#000"
                    strokeLinejoin="round"
                    d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z"
                  />
                </svg>
                Share
              </span>
            </span>
          </button>
        </div>

        {showComments && <CommentSection postId={post.id} />}
      </div>

      <ReactionModal
        isOpen={isReactionModalOpen}
        onClose={() => setIsReactionModalOpen(false)}
        targetId={post.id}
        targetType="POST"
      />
    </>
  );
};

const CommentSection: React.FC<{ postId: string }> = ({ postId }) => {
  const { comments, addComment, isAddingComment, isLoading, loadMore, hasMore } =
    useComments(postId);
  const [text, setText] = useState('');
  const { user: currentUser } = useAuthStore();

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment(text);
    setText('');
  };

  return (
    <div className="_feed_inner_timeline_comment_area _padd_r24 _padd_l24 mt-3">
      <div className="_feed_inner_comment_box _feed_inner_comment_box_form">
        <div className="_feed_inner_comment_box_content">
          <div className="_feed_inner_comment_box_content_image">
            <Image
              src={currentUser?.avatar || '/assets/images/comment_img.png'}
              alt="My Avatar"
              width={26}
              height={26}
              className="_comment_img"
            />
          </div>
          <div className="_feed_inner_comment_box_content_txt">
            <textarea
              className="form-control _comment_textarea"
              placeholder="Write a comment"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isAddingComment}
            ></textarea>
          </div>
        </div>
        <div className="_feed_inner_comment_box_icon">
          <button
            type="button"
            className="_feed_inner_comment_box_icon_btn"
            onClick={handleAddComment}
            disabled={isAddingComment}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="13"
              fill="none"
              viewBox="0 0 14 13"
            >
              <path
                fill="#000"
                fillOpacity=".46"
                d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="_timline_comment_main">
        {hasMore && (
          <div className="_previous_comment">
            <button type="button" className="_previous_comment_txt" onClick={loadMore}>
              View previous comments
            </button>
          </div>
        )}
        {isLoading && comments.length === 0 ? (
          <p>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-center mt-3">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))
        )}
      </div>
    </div>
  );
};

const CommentItem: React.FC<{ comment: Comment; postId: string }> = ({ comment, postId }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReactionModalOpen, setIsReactionModalOpen] = useState(false);
  const { addReply, isAddingReply } = useComments(postId);
  const { mutate: toggleLike } = useToggleLike(postId);
  const { user: currentUser } = useAuthStore();

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addReply({ commentId: comment.id, text: replyText });
    setReplyText('');
    setShowReplyBox(false);
  };

  const handleLike = () => {
    toggleLike({ targetId: comment.id, targetType: comment.parentId ? 'REPLY' : 'COMMENT' });
  };

  return (
    <div className="_comment_main">
      <div className="_comment_image">
        <Link className="_comment_image_link" href="/profile">
          <Image
            src={comment.user.avatar || '/assets/images/txt_img.png'}
            alt="Commenter Avatar"
            width={40}
            height={40}
            className="_comment_img1"
          />
        </Link>
      </div>
      <div className="_comment_area">
        <div className="_comment_details">
          <div className="_comment_details_top">
            <div className="_comment_name">
              <Link href="/profile">
                <h4 className="_comment_name_title">{`${comment.user.firstName} ${comment.user.lastName}`}</h4>
              </Link>
            </div>
          </div>
          <div className="_comment_status">
            <p
              className="_comment_status_text"
              style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
            >
              <span>{comment.text}</span>
            </p>
          </div>
          {comment.likesCount > 0 && (
            <div
              className="_total_reactions"
              onClick={() => setIsReactionModalOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              <div className="_total_react">
                <span className="_reaction_like">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    fill="none"
                    viewBox="0 0 12 12"
                  >
                    <path
                      fill="#fff"
                      d="M10.974 6.13H6.844V2.001a.375.375 0 00-.071-.22.378.378 0 00-.184-.131.373.373 0 00-.224-.019.38.38 0 00-.195.1l-4.13 4.128a.377.377 0 00-.044.053.375.375 0 000 .444.377.377 0 00.323.155h4.13v4.13a.375.375 0 00.071.22.378.378 0 00.184.131.373.373 0 00.224.019.38.38 0 00.195-.1l4.13-4.129a.377.377 0 00.044-.053.375.375 0 000-.444.377.377 0 00-.323-.155z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="_reaction_heart">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="12"
                    fill="none"
                    viewBox="0 0 13 12"
                  >
                    <path
                      fill="#fff"
                      fillRule="evenodd"
                      d="M6.5 12l-.448-.4a16.483 16.483 0 01-4.14-3.955C.7 6.155.034 4.593.034 2.73 0.034.936 1.488 0 3.298 0c1.026 0 2.012.476 2.656 1.226C6.598.476 7.584 0 8.61 0c1.81 0 3.264.936 3.264 2.73 0 1.863-.666 3.425-1.878 4.915a16.483 16.483 0 01-4.14 3.955l-.356.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
              <span className="_total">{comment.likesCount}</span>
            </div>
          )}
          <div className="_comment_reply">
            <div className="_comment_reply_num">
              <ul className="_comment_reply_list" style={{ whiteSpace: 'nowrap' }}>
                <li onClick={handleLike} style={{ cursor: 'pointer' }}>
                  <span>{comment.isLiked ? 'Unlike.' : 'Like.'}</span>
                </li>
                <li onClick={() => setShowReplyBox(!showReplyBox)} style={{ cursor: 'pointer' }}>
                  <span>Reply.</span>
                </li>
                <li>
                  <span>Share</span>
                </li>
                <li>
                  <span className="_time_link">
                    .{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: false })}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {showReplyBox && (
          <div className="_feed_inner_comment_box mt-2">
            <form className="_feed_inner_comment_box_form" onSubmit={handleAddReply}>
              <div className="_feed_inner_comment_box_content">
                <div className="_feed_inner_comment_box_content_image">
                  <Image
                    src={currentUser?.avatar || '/assets/images/comment_img.png'}
                    alt="My Avatar"
                    width={26}
                    height={26}
                    className="_comment_img"
                  />
                </div>
                <div className="_feed_inner_comment_box_content_txt">
                  <textarea
                    className="form-control _comment_textarea"
                    placeholder="Write a reply"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    autoFocus
                  ></textarea>
                </div>
              </div>
              <div className="_feed_inner_comment_box_icon">
                <button
                  className="_feed_inner_comment_box_icon_btn"
                  type="submit"
                  disabled={isAddingReply}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="13"
                    fill="none"
                    viewBox="0 0 14 13"
                  >
                    <path
                      fill="#000"
                      fillOpacity=".46"
                      d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="_timline_comment_nested mt-3">
            {comment.replies.map((reply: Comment) => (
              <CommentItem key={reply.id} comment={reply} postId={postId} />
            ))}
          </div>
        )}
      </div>

      <ReactionModal
        isOpen={isReactionModalOpen}
        onClose={() => setIsReactionModalOpen(false)}
        targetId={comment.id}
        targetType={comment.parentId ? 'REPLY' : 'COMMENT'}
      />
    </div>
  );
};
