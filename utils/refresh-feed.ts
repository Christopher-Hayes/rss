'use server'
// import { Feed } from "@/types";
import { createClient } from "@/utils/supabase/server";
import * as xml2js from 'xml-js';
// import Vibrant from 'node-vibrant'
import { Feed, Post } from "@/types";

export async function refreshFeed() {
  const supabase = createClient();

  let { data: feeds, error: feedsError } = await supabase
    .from('rss_feeds')
    .select('*');

  for (const feed of feeds ?? []) {
    const { data: posts, error: postsError } = await supabase
      .from('rss_posts')
      .select('*')
      .eq('feed_id', feed.id)
      .order('date_published', { ascending: false })
      .limit(1);

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      continue;
    }

    const response = await fetch(feed.url);
    const xml = await response.text();

    const xmlResult = xml2js.xml2json(xml, { compact: true, spaces: 4 });
    const result = JSON.parse(xmlResult);

    let items;
    if (result.feed) { // Atom feed
      items = result.feed.entry;
    } else if (result.rss) { // RSS feed
      items = result.rss.channel[0].item;
    }

    // Process items only if they are available
    if (items) {
      const newItems = items.filter((item: any) => {
        const url = item.link?._attributes?.href || item.link?._text;
        return !(posts as any[]).some(post => post.url === url);
      });

      for (const item of newItems) {
        const title = item.title._text ?? item.title._cdata ?? item.title;
        const description = item['content:encoded']?._cdata ?? item.description?._text ?? item.description?._cdata ?? item.summary?._text ?? item.summary?._cdata ?? '';
        const url = item.link?._attributes?.href ?? item.link?._text;
        const date_published = item.published?._text ?? item.pubDate?._text;

        if (title && url && date_published) {
          const { data: insertData, error: insertError } = await supabase
            .from('rss_posts')
            .insert([
              {
                feed_id: feed.id,
                title,
                description,
                url,
                date_published,
              },
            ]);

          if (insertError) {
            console.error('error inserting post:', insertError);
          }
        } else {
          console.error('missing required fields:', { title, description, url, date_published });
        }
      }

      return newItems;
    }
  }
}

// Gets latest feed ABOUT each feed. This may occasionally be out of date.
// Does not fetch the posts themselves.
export async function updateFeeds() {
  const supabase = createClient();

  let { data: feeds, error: feedsError } = await supabase
    .from('rss_feeds')
    .select('*');

  if (feedsError) {
    console.error('Error fetching feeds:', feedsError);
    return;
  }

  for (const feed of feeds ?? []) {
    try {
      console.log('fetching feed:', feed.url);
      const response = await fetch(feed.url);
      const xml = await response.text();

      // console.log('xml:', xml);

      const xmlResult = xml2js.xml2json(xml, { compact: true, spaces: 4 });
      const result = JSON.parse(xmlResult);

      // console.log('result:', result);

      // Extracting data differently based on whether it's an Atom or RSS feed
      let feedData: any = {};
      if (result.feed) {
        // Process Atom feed
        feedData = {
          title: result.feed.title._text,
          description: result.feed.subtitle?._text ?? result.feed.description?._text ?? '',
          updated_at: result.feed.updated?._text,
          author_name: result.feed.author?.name._text,
        };
      } else if (result.rss) {
        // Process RSS feed
        const channel = result.rss.channel;
        feedData = {
          title: channel.title._text,
          description: channel.description._text,
          updated_at: channel.lastBuildDate?._text,
          author_name: channel['dc:creator']?._text,
        };
      }

      console.log('feedData:', feedData);

      const { data: updatedData, error: updateError } = await supabase
        .from('rss_feeds')
        .update(feedData)
        .eq('id', feed.id);

      if (updateError) {
        console.error('Error updating feed:', updateError);
      }
    } catch (error) {
      console.error('Error parsing feed XML:', error);
    }
  }
}

export async function addNewRSSFeed(feedUrl: string) {
  const supabase = createClient();
  const response = await fetch(feedUrl);
  const xml = await response.text();
  const jsonResult = JSON.parse(xml2js.xml2json(xml, { compact: true, nativeType: true }));
  let isAtomFeed = jsonResult.feed;

  // Initialize the feed data object
  let feedData: Partial<Feed> = {
    url: feedUrl,
    title: "",
    updated_at: ""
  };
  let postsData = [];
  if (isAtomFeed) {
    feedData = {
      ...feedData,
      title: jsonResult.feed.title._text,
      description: jsonResult.feed.subtitle?._text ?? jsonResult.feed.summary?._text,
      author_name: jsonResult.feed.author?.name?._text,
      updated_at: jsonResult.feed.updated?._text,
    };
    postsData = jsonResult.feed.entry.slice(0, 20);
  } else {
    const channel = jsonResult.rss.channel;

    // console.log('channel:', JSON.stringify(channel, (key, value) => key === 'item' ? undefined : value, 2));

    feedData = {
      ...feedData,
      title: channel.title._cdata ?? channel.title._text ?? channel.title,
      description: channel.description._cdata ?? channel.description._text ?? channel.summary?._text ?? channel.summary?._cdata,
      updated_at: channel.lastBuildDate?._text ?? new Date().toISOString(),
    };
    postsData = channel.item.slice(0, 20);
  }

  // Insert feed into 'rss_feeds'
  const { data: newFeed, error: feedError } = await supabase
    .from('rss_feeds')
    .insert([feedData])
    .select('*')
    .single()

  if (feedError) {
    console.error('Error inserting new feed:', feedError);
    return;
  }

  console.log('newFeed:', newFeed);

  const feedId = (newFeed as Feed).id;

  // Prepare posts for insertion
  const recentPosts = postsData.map((post: any) => ({
    feed_id: feedId,
    title: post.title?._text ?? post.title?._cdata ?? post.title,
    description: post.description?._text ?? post.description._cdata ?? post.summary?._text ?? post.summary?._cdata ?? '',
    url: post.link?._attributes?.href ?? post.link?._text ?? post.link,
    date_published: post.published?._text ?? post.pubDate?._text ?? new Date().toISOString(),
  }));

  // Insert posts into 'rss_posts'
  const { error: postsError } = await supabase
    .from('rss_posts')
    .insert(recentPosts);

  if (postsError) {
    console.error('Error inserting posts:', postsError);
  }

  return { newFeed, newPosts: recentPosts };
}

export async function getPosts(rangeStart: number = 0, rangeEnd: number = 15) {
  const supabase = createClient();

  const { data: posts, error } = await supabase
    .from('rss_posts')
    .select('*')
    .order('date_published', { ascending: false })
    .range(rangeStart, rangeEnd)

  return posts as Post[];
}
