import DOMPurify from 'isomorphic-dompurify';

function domPurify(dirty: string) {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'b',
      'i',
      'u',
      'a',
      'p',
      'span',
      'div',
      'table',
      'thead',
      'tbody',
      'tr',
      'td',
      'th',
      'ul',
      'ol',
      'li',
      'code',
      'pre',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style'],
    FORBID_TAGS: ['script', 'iframe'],
    KEEP_CONTENT: true,
    SAFE_FOR_TEMPLATES: true,
  });
}

export default domPurify;
