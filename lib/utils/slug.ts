export function generateSlug(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-一-鿿]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug || /[^\x00-\x7F]/.test(slug)) {
    return `post-${Date.now().toString(36)}`;
  }

  return slug;
}

export function generateTagSlug(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `tag-${Date.now().toString(36)}`;
}

export function generateCategorySlug(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `cat-${Date.now().toString(36)}`;
}
