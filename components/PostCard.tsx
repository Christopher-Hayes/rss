import { Feed, Post } from "@/types";
import React from 'react';
import { Link } from "@/components/ui/link"

interface PostCardProps {
  feed: Feed;
  post: Post;
}

export function PostCard({
  feed,
  post,
}: PostCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg dark:border-gray-800">
      {feed && (
        <div className="flex p-4 gap-4 md:p-6">
          {feed.image_url ? (
            <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden">
              <img
                alt="Author avatar"
                className="aspect-square object-cover"
                height={64}
                src={feed.image_url}
                width={64}
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden">
              <img
                alt="Author avatar"
                className="aspect-square object-cover"
                height={64}
                src={`https://www.google.com/s2/favicons?sz=64&domain_url=${(new URL(feed.url)).origin}`}
                width={64}
              />
            </div>
          )}
          <div className="flex flex-col gap-2 justify-center text-sm">
            <h3 className="font-semibold">{feed.title}</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Posted on {new Date(post.date_published).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4 border-t border-gray-200 p-4 md:p-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{post.title}</h1>
          <p>
            {post.description}
          </p>
        </header>
        <Link
          href={post.url}
          size="sm"
          variant="outline"
          target="_blank"
        >
          Read More
        </Link>
      </div>
    </div>
  );
}
