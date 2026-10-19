import { motion } from 'framer-motion'
import { whatsappLink } from '@/config/site'
import { WhatsAppIcon } from '@/components/ui/BrandIcons'

/**
 * Botão flutuante de WhatsApp. Só aparece quando o número oficial está
 * configurado (VITE_WHATSAPP_NUMBER ou site.whatsapp.number).
 * Em desenvolvimento, sem número, mostra um aviso para lembrar da configuração.
 */
export function WhatsAppButton() {
  const href = whatsappLink()
  if (!href && !import.meta.env.DEV) return null

  return (
    <motion.div
      className="fixed bottom-5 right-5 z-40 sm:bottom-7 sm:right-7"
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 2.2, type: 'spring', stiffness: 260, damping: 22 }}
    >
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conversar pelo WhatsApp (abre em nova aba)"
          className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#1f9d55] text-white shadow-[0_12px_40px_-8px_rgba(31,157,85,0.6)] transition-transform duration-500 ease-premium hover:scale-105"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-[#1f9d55]/30 [animation-duration:2.8s]" aria-hidden="true" />
          <WhatsAppIcon className="relative h-6 w-6" />
          <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink-950 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block">
            Fale conosco
          </span>
        </a>
      ) : (
        <span
          title="Defina VITE_WHATSAPP_NUMBER (ou site.whatsapp.number) para ativar este botão. Aviso visível apenas em desenvolvimento."
          className="flex h-14 items-center gap-2 rounded-full border border-dashed border-[#1f9d55]/70 bg-ink-900/90 px-4 text-xs text-steel-200 backdrop-blur"
        >
          <WhatsAppIcon className="h-5 w-5 text-[#1f9d55]" />
          WhatsApp: número não configurado
        </span>
      )}
    </motion.div>
  )
}
