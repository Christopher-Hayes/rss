'use client'
import React from 'react';
import RefreshPostsButton from './RefreshPostsButton'; // Adjust the import path as needed
import { Feed, Post } from '@/types';
import { PostCard } from './PostCard';
import { getPosts } from '@/utils/refresh-feed';
import classNames from 'classnames';

type Props = {
  posts: Post[];
  feeds: Feed[];
};

const PostList = ({ posts, feeds }: Props) => {
  const [loadingNewPosts, setLoadingNewPosts] = React.useState(false)
  const [showingFeeds, setShowingFeeds] = React.useState(feeds)

  // Add feed to each post based on feed_id in post and id in feed
  const addFeedToPosts = (posts: Post[]) => {
    return posts?.map(post => {
      let newPost: Post & { feed?: Feed } = post
      newPost.feed = feeds?.find(feed => feed.id === post.feed_id)

      return post as Post & { feed: Feed }
    }) ?? []
  }

  const showUpdatedPosts = (newPosts: Post[]) => {
    // filter any posts that are already in the list
    // this happens when you query the bottom of the db
    setUpdatedPosts(addFeedToPosts(newPosts.filter(post => updatedPosts.findIndex(p => p.id === post.id) === -1)))
  }

  // Add Feed to each posts based on feed_id in post and id in feed
  const postsWithFeed: (Post & { feed: Feed })[] = addFeedToPosts(posts)
  const [updatedPosts, setUpdatedPosts] = React.useState<(Post & { feed: Feed })[]>(postsWithFeed)

  return (
    <header className="w-full flex flex-col gap-2">
      <header className="w-full flex flex-col gap-2">
        <div className="flex justify-between gap-2">
          <h2 className="text-4xl font-semibold">Posts</h2>
          <RefreshPostsButton
            showUpdatedPosts={showUpdatedPosts}
            />
        </div>
        <p className="text-gray-500 dark:text-gray-400">The lastest posts from around the internet.</p>
        {/* list of feed buttons, if one is clicked only that one is shown */}
        <div className="flex flex-wrap gap-2">
          {feeds?.map(feed => (
            <button
              key={feed.id}
              onClick={() => {
                if (showingFeeds.some(f => f.id === feed.id)) {
                  setShowingFeeds([...showingFeeds.filter(f => f.id !== feed.id)])
                } else {
                  setShowingFeeds([...showingFeeds, feed])
                }

                setUpdatedPosts(updatedPosts ?? postsWithFeed)
              }}
              className={classNames('text-white bg-black border border-gray-300 rounded-md py-1 px-2',
                { 'bg-gray-800 border-blue-500': showingFeeds.some(f => f.id === feed.id) }
              )}>
              {feed.title}
            </button>
          ))}
          <button
            onClick={() => {
              setShowingFeeds(feeds)
            }}
            className="text-white bg-black border border-gray-300 rounded-md py-1 px-2"
            >
            Show All
          </button>
        </div>
      </header>
      {(updatedPosts ?? postsWithFeed)?.filter(post => showingFeeds.some(feed => feed.id === post.feed_id)).map(post => (
        <PostCard
          key={post.id}
          post={post}
          feed={post.feed}
        />
      ))}
      {/* show more button */}
      {loadingNewPosts ? (
        <div className="animate-pulse">
          <p>Loading...</p>
        </div>
      ) : (
        <button
            className="text-white bg-black border border-gray-300 rounded-md py-1 px-2"
            onClick={async () => {
              setLoadingNewPosts(true)

              // fetch more posts
              const start = (updatedPosts ?? postsWithFeed).length
              const newPosts = await getPosts(start, start + 10)
              setUpdatedPosts([...updatedPosts, ...addFeedToPosts(newPosts)])

              setLoadingNewPosts(false)
            }}
            >
            Show More
          </button>
        )}
    </header>
  );
};

export default PostList;