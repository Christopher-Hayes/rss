// RSS feed
export interface Feed {
  id: string;
  title: string;
  url: string;
  description?: string;
  image_url?: string;
  updated_at?: string;
  primary_color?: string; // hex
  author_name?: string;
}

// RSS post
export interface Post {
  id: string;
  feed_id: string;
  title: string;
  description: string;
  url: string;
  date_published: string;
}
