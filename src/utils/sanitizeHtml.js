import DOMPurify from 'dompurify';

// DOMPurify strips `target` by default; force rel="noopener noreferrer" on
// any target="_blank" link so new-tab links can't reverse-tabnab the opener.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

// Shared sanitizer for any admin-authored HTML (lesson/blog/resource content)
// rendered via dangerouslySetInnerHTML, so stored content can't execute
// script in a visitor's browser.
const sanitizeHtml = (html) => DOMPurify.sanitize(html || '', { ADD_ATTR: ['target'] });

export default sanitizeHtml;
