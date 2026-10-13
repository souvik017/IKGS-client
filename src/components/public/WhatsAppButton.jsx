import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export default function WhatsAppButton() {
  const { settings } = useSettings();
  const number = settings?.whatsapp?.replace(/[^\d]/g, '');
  if (!number) return null;

  const href = `https://wa.me/${number}?text=${encodeURIComponent(
    'Hello IKGS Solution, I would like to enquire about pest control services.'
  )}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[calc(1.25rem_+_env(safe-area-inset-bottom))] right-[calc(1.25rem_+_env(safe-area-inset-right))] z-30 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3.5 font-semibold text-white shadow-lift transition-colors hover:bg-[#1FBE5A]"
      aria-label="Chat with us on WhatsApp"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      <span className="hidden text-sm sm:inline">WhatsApp</span>
    </motion.a>
  );
}
