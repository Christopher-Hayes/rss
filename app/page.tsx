import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import { PostCard } from "@/components/PostCard";
import { FeedCard } from "@/components/feed-card";
import { Feed, Post } from "@/types";
import RefreshPostsButton from "@/components/RefreshPostsButton";
import RefreshFeedsButton from "@/components/RefreshFeedsButton";
import AddFeedButton from "@/components/AddFeedButton";
import { REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from "@supabase/supabase-js";
import PostList from "@/components/PostList";
import { getPosts } from "@/utils/refresh-feed";

export default async function Index() {
  const supabase = createClient();

  // Feeds
  let { data: feeds, error: feedsError } = await supabase
    .from('rss_feeds')
    .select('*')
    .order('updated_at', { ascending: false })

  const posts = await getPosts()

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <AuthButton />
        </div>
      </nav>

      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-5xl px-3">
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          <div className="flex flex-col gap-4">
            <header className="flex flex-col gap-2">
              <div className="flex justify-between gap-2">
                <h2 className="text-4xl font-semibold">Feeds</h2>
                <RefreshFeedsButton />
              </div>
              <p className="text-gray-500 dark:text-gray-400">You're following these creators.</p>
            </header>
            {feeds?.map(feed => (
              <FeedCard
                key={feed.id}
                feed={feed}
              />
            ))}
            <AddFeedButton />
          </div>
          <div className="col-span-2 flex flex-col gap-4">
            <PostList
              posts={posts as Post[] ?? []}
              feeds={feeds as Feed[] ?? []}
              />
          </div>
        </main>
      </div>

      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
      </footer>
    </div>
  );
}
