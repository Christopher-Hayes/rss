'use client'
import { getPosts, refreshFeed } from "@/utils/refresh-feed"
import { Button } from "./ui/button"
import { Post } from "@/types"

type Props = {
  showUpdatedPosts: (posts: Post[]) => void
}

export default function ({ showUpdatedPosts }: Props) {
  const refreshFeedPostsButton = async () => {
    await refreshFeed()

    // Get the latest posts
    const posts = await getPosts()

    showUpdatedPosts(posts)
  }

  return (
    <button onClick={refreshFeedPostsButton}>Refresh</button>
  )
}
