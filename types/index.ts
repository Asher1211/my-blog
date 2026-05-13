export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  published: boolean;
  views: number;
  wordCount: number;
  readingTime: number;
  createdAt: string;
  publishedAt: string | null;
  category: { name: string; slug: string } | null;
  tags: { name: string; slug: string }[];
}

export interface PostDetail extends PostListItem {
  content: string;
  updatedAt: string;
}
