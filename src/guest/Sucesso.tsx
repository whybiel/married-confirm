import Seal from '@/components/Seal'

interface SucessoProps {
  onBack: () => void
}

export default function Sucesso({ onBack }: SucessoProps) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-between px-4 py-16">
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm animate-fade-up">
        <Seal size={88} className="mb-8" />

        <h2
          className="mb-4 leading-tight"
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(26px, 7vw, 32px)',
            fontWeight: 500,
            color: '#16223E',
          }}
        >
          Presença confirmada 💙
        </h2>

        <p className="text-ink text-base leading-relaxed mb-2" style={{ fontFamily: 'Jost, sans-serif' }}>
          Obrigado por confirmar sua presença. Estamos muito felizes em poder celebrar esse momento com você!
        </p>

        <p className="text-muted text-sm mb-10" style={{ fontFamily: 'Jost, sans-serif' }}>
          Nos vemos no grande dia!
        </p>

        <div className="flex flex-col gap-3 w-full">
          <a
            href="https://marianareinaldo.meuchadepanela.com.br"
            className="w-full h-12 rounded-[10px] border font-semibold text-[15px] flex items-center justify-center gap-2 transition-all duration-150"
            style={{
              borderColor: '#16223E',
              color: '#16223E',
              fontFamily: 'Jost, sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#16223E'
              e.currentTarget.style.color = '#FAF8F4'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#16223E'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Lista de presentes
          </a>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 mt-8">
        <div className="flex items-center gap-2">
          <div className="h-px w-12 bg-line" />
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1L7.09 4.26H10.51L7.7 6.27L8.79 9.53L6 7.52L3.21 9.53L4.3 6.27L1.49 4.26H4.91L6 1Z" fill="#C9A876" fillOpacity="0.5" />
          </svg>
          <div className="h-px w-12 bg-line" />
        </div>
        <p className="text-xs text-muted/50 text-center" style={{ fontFamily: 'Jost, sans-serif' }}>
          03 de outubro de 2026 · Igreja Nossa Senhora da Glória, Santa Cruz - Rio de Janeiro
        </p>
        <button
          onClick={onBack}
          className="text-xs text-muted/40 hover:text-muted transition-colors mt-1"
          style={{ fontFamily: 'Jost, sans-serif' }}
        >
          Voltar ao início
        </button>
      </div>
    </div>
  )
}
