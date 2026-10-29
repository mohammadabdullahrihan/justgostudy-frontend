import { Copy, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { companyData } from '../../constants/companyData';

// Same number used site-wide for WhatsApp (StickyWhatsApp.jsx, Contact.jsx).
const WHATSAPP_NUMBER = companyData.phoneIntl.replace(/\D/g, '');

/**
 * Copy-link + WhatsApp share, the same pattern used for referral links in
 * DashboardHome.jsx, extracted here so tool result screens (quiz, etc.) can
 * reuse it without duplicating the clipboard/wa.me wiring.
 */
const ShareButtons = ({ url, message, className = '' }) => {
  const handleCopy = async () => {
    // navigator.clipboard needs a secure context + permission and is
    // unavailable in some embedded/webview browsers entirely — fall back to
    // the old execCommand trick via a hidden textarea so the button still
    // works there instead of silently doing nothing.
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      toast.success('Link copied!');
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!copied) throw new Error('execCommand copy failed');
        toast.success('Link copied!');
      } catch {
        toast.error('Could not copy link. Please copy it manually.');
      }
    }
  };

  // A real anchor (not window.open in a click handler) so this still works
  // inside restrictive embedded/webview browsers that block script-triggered
  // popups but allow normal link navigation. Goes straight to the business's
  // WhatsApp number (not the generic wa.me picker) so the message actually
  // sends instead of asking the user to pick a contact.
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message ? `${message} ${url}` : url)}`;

  return (
    <div className={`flex flex-col gap-2 sm:flex-row ${className}`}>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20"
      >
        <Copy size={14} /> Copy Link
      </button>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-secondary-600"
      >
        <MessageCircle size={14} /> Share on WhatsApp
      </a>
    </div>
  );
};

export default ShareButtons;
