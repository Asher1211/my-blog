export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // 中文字符阅读速度约为 200 字/分钟
  const chineseChars = (content.match(/[一-鿿]/g) || []).length;
  const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
  const totalCount = chineseChars + englishWords;
  const minutes = Math.ceil(totalCount / wordsPerMinute);
  return Math.max(1, minutes);
}
