'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { PostCreator } from '@/features/post/components/PostCreator';
import { PostCard } from '@/features/post/components/PostCard';
import { Stories } from '@/features/post/components/Stories';
import { usePosts } from '@/features/post/hooks/usePosts';
import { MobileNav } from '@/components/layout/MobileNav';
import { SwitchingBtn } from '@/components/layout/SwitchingBtn';
import { RightSidebar } from '@/components/layout/RightSidebar';

export default function FeedPage() {
  const { 
    posts, 
    isLoading, 
    error, 
    hasNextPage, 
    fetchNextPage, 
    isFetchingNextPage 
  } = usePosts();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`_layout _layout_main_wrapper ${isDarkMode ? '_dark_wrapper' : ''}`}>
      <SwitchingBtn onToggle={toggleTheme} />
      <main className="_main_layout">
        <Header />
        <MobileNav />

        {/* Main Layout Structure Start */}
        <div className="container _custom_container">
          <div className='_layout_inner_wrap'>
            <div className="row">
              {/* Left Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 _custom_mobile_none">
                <Sidebar />
              </div>

              {/* Main Content */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    <Stories />
                    <PostCreator />

                    {isLoading ? (
                      <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading posts...</span>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="alert alert-danger">
                        Failed to load posts. Please try again.
                      </div>
                    ) : (
                      <div className="_feed_posts_container">
                        {posts.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 _custom_none">
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
        {/* Main Layout Structure End */}
      </main>
    </div>
  );
}
