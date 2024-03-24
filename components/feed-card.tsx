import { Feed } from "@/types";
import React from 'react';
import { Link } from "@/components/ui/link";

interface FeedCardProps {
  feed: Feed;
}

export function FeedCard({
  feed,
}: FeedCardProps) {
  const feedHomepage = `https://${new URL(feed.url).hostname}`;

  return (
    <div
      className="border border-gray-200 rounded-lg dark:border-gray-800"
      style={{ borderColor: feed.primary_color }}
      >
      <div className="flex items-center px-4 py-2 md:px-6 md:py-3">
        {feed.image_url && (
          <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden mr-4">
            <img
              alt="Feed logo"
              className="object-cover"
              src={feed.image_url}
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <header className="flex flex-col gap-0.5">
            <h3 className="font-semibold">{feed.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{feed.description}</p>
          </header>
          <Link href={feedHomepage} size="sm" variant="outline" target="_blank">
            Visit Blog
          </Link>
        </div>
      </div>
    </div>
  );
}