/**
 * Blog utility functions for SEO and content processing
 */

/**
 * Calculate reading time from HTML content
 * @param {string} htmlContent - HTML content string
 * @returns {string} - Reading time string (e.g., "5 min read")
 */
export function calculateReadingTime(htmlContent) {
  if (!htmlContent) return '1 min read';
  
  // Strip HTML tags and get text content
  const textContent = htmlContent
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Average reading speed: 200-250 words per minute
  // Using 225 as average
  const wordsPerMinute = 225;
  const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  return `${Math.max(1, minutes)} min read`;
}

/**
 * Generate table of contents from HTML content
 * Extracts headings (h2, h3, h4, h5, h6) and creates TOC structure
 * @param {string} htmlContent - HTML content string
 * @returns {Array} - Array of TOC items with { id, text, level }
 */
export function generateTableOfContents(htmlContent) {
  if (!htmlContent) return [];
  
  const toc = [];
  const headingRegex = /<h([2-6])[^>]*>(.*?)<\/h[2-6]>/gi;
  let match;
  let idCounter = 0;
  
  while ((match = headingRegex.exec(htmlContent)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2]
      .replace(/<[^>]*>/g, '') // Remove any nested HTML tags
      .trim();
    
    if (text) {
      // Generate ID from text (slugify)
      const id = `heading-${idCounter++}-${text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')}`;
      
      toc.push({
        id,
        text,
        level
      });
    }
  }
  
  return toc;
}

/**
 * Validate content for SEO best practices
 * @param {string} htmlContent - HTML content string
 * @returns {Object} - Validation result with errors and warnings
 */
export function validateContentSEO(htmlContent) {
  const errors = [];
  const warnings = [];
  
  if (!htmlContent) {
    return { errors: ['Content is required'], warnings: [] };
  }
  
  // Check for H1 tags (should only be in title, not content)
  const h1Matches = htmlContent.match(/<h1[^>]*>/gi);
  if (h1Matches && h1Matches.length > 0) {
    warnings.push(`Found ${h1Matches.length} H1 tag(s) in content. Only one H1 should be used (the post title).`);
  }
  
  // Check heading hierarchy
  const headingMatches = htmlContent.match(/<h([1-6])[^>]*>/gi);
  if (headingMatches) {
    let previousLevel = 0;
    headingMatches.forEach((heading, index) => {
      const level = parseInt(heading.match(/<h([1-6])/i)[1], 10);
      if (index > 0 && level > previousLevel + 1) {
        warnings.push(`Heading hierarchy issue: H${level} follows H${previousLevel}. Headings should increase by only one level.`);
      }
      previousLevel = level;
    });
  }
  
  // Check for images without alt text
  const imgMatches = htmlContent.match(/<img[^>]*>/gi);
  if (imgMatches) {
    imgMatches.forEach((img, index) => {
      if (!img.includes('alt=') || img.match(/alt=["']\s*["']/)) {
        warnings.push(`Image ${index + 1} is missing alt text or has empty alt attribute.`);
      }
    });
  }
  
  // Check minimum word count (recommended: 300+ words for SEO)
  const textContent = htmlContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
  
  if (wordCount < 300) {
    warnings.push(`Content is ${wordCount} words. Recommended minimum is 300 words for better SEO.`);
  }
  
  return { errors, warnings };
}

/**
 * Extract plain text from HTML (for word count, etc.)
 * @param {string} htmlContent - HTML content string
 * @returns {string} - Plain text content
 */
export function extractPlainText(htmlContent) {
  if (!htmlContent) return '';
  
  return htmlContent
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Get word count from HTML content
 * @param {string} htmlContent - HTML content string
 * @returns {number} - Word count
 */
export function getWordCount(htmlContent) {
  const text = extractPlainText(htmlContent);
  return text.split(/\s+/).filter(word => word.length > 0).length;
}
