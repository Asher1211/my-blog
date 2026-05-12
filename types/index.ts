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

export interface AiChatRequest {
  postId: string;
  question: string;
  history: { role: "user" | "assistant"; content: string }[];
}

export interface AiSearchRequest {
  query: string;
}

export interface AiSearchResult {
  postId: string;
  title: string;
  slug: string;
  excerpt: string;
  relevance: string;
}

export interface PetChatRequest {
  message: string;
  context: {
    pageTitle?: string;
    category?: string;
  };
}
