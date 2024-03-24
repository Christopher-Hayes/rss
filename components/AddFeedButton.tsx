'use client'
import React from "react"
import { addNewRSSFeed, updateFeeds } from "@/utils/refresh-feed"
import { Button } from "./ui/button"

export default function () {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [showInput, setShowInput] = React.useState(false)

  const addNewFeed = async () => {
    if (inputRef.current?.value) {
      await addNewRSSFeed(inputRef?.current.value)
    } else {
      console.log('no value')
    }

    console.log('feed added')
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        {showInput &&
          <input
            className="text-white bg-black border border-gray-300 rounded-md py-1 px-2"
            type="text"
            id="rss-feed-url"
            placeholder="RSS feed url"
            ref={inputRef}
            />}
        {showInput && <button onClick={addNewFeed}>Add</button>}
      </div>
      {!showInput && <button onClick={() => setShowInput(!showInput)}>Add New</button>}
    </div>
  )
}
