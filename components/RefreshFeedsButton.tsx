'use client'
import { updateFeeds } from "@/utils/refresh-feed"
import { Button } from "./ui/button"

export default function () {
  const refreshFeedsButton = async () => {
    await updateFeeds()

    console.log('feeds updated')
  }

  return (
    <button onClick={refreshFeedsButton}>Refresh</button>
  )
}
