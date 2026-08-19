import { useState } from 'react'
import Seal from '@/components/Seal'
import { VALID_CODES } from '@/data/mock'

interface LandingProps {
  onSuccess: (code: string) => void
  onAdminLink: () => void
}

export default function Landing({ onSuccess, onAdminLink }: LandingProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      setError('Por favor, informe o código do convite.')
      return
    }
    setLoading(true)
    setError('')
    await new Promise((r) => setTimeout(r, 900))
    if (VALID_CODES[trimmed]) {
      onSuccess(trimmed)
    } else {
      setError('Não encontramos esse convite. Verifique o código informado e tente novamente.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-between px-4 py-12">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm animate-fade-up">
        <Seal size={88} className="mb-8" />

        <h1
          className="text-center mb-3 leading-tight"
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(32px, 8vw, 44px)',
            fontWeight: 500,
            color: '#16223E',
            letterSpacing: '-0.01em',
          }}
        >
          Marina & Thiago
        </h1>

        <p className="text-center text-ink text-base leading-relaxed mb-1" style={{ fontFamily: 'Jost, sans-serif' }}>
          Olá! Que alegria ter você conosco.
        </p>
        <p className="text-center text-muted text-sm leading-relaxed mb-10" style={{ fontFamily: 'Jost, sans-serif' }}>
          Para confirmar sua presença, informe o código do seu convite.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="code"
              className="text-ink text-xs font-medium tracking-wide uppercase"
              style={{ fontFamily: 'Jost, sans-serif', letterSpacing: '0.06em', fontSize: 12 }}
            >
              Código do convite
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError('') }}
              placeholder="Ex: AB12CD"
              disabled={loading}
              maxLength={6}
              className="w-full h-12 px-4 bg-surface border border-line rounded-[10px] text-ink text-base placeholder-muted/60 outline-none transition-all duration-150 disabled:opacity-60"
              style={{
                fontFamily: 'Jost, sans-serif',
                letterSpacing: '0.1em',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#16223E'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,118,0.15)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E4DFD5'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            {error && (
              <div
                className="flex items-start gap-2 px-3 py-2.5 rounded-[8px] mt-1"
                style={{ backgroundColor: '#F5E9E7' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="#B5564A" strokeWidth="1.2" />
                  <path d="M8 5v3.5M8 11h.01" stroke="#B5564A" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <p className="text-sm leading-snug" style={{ color: '#B5564A', fontFamily: 'Jost, sans-serif' }}>
                  {error}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-[10px] font-semibold text-[15px] text-surface transition-all duration-150 disabled:opacity-70 flex items-center justify-center gap-2"
            style={{
              backgroundColor: loading ? '#1F3159' : '#16223E',
              fontFamily: 'Jost, sans-serif',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#1F3159' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#16223E' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <path d="M9 2a7 7 0 0 1 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Verificando...
              </>
            ) : (
              'Continuar'
            )}
          </button>
        </form>
      </div>

      <div className="flex flex-col items-center gap-3 mt-8">
        <div className="flex items-center gap-2" style={{ color: '#E4DFD5' }}>
          <div className="h-px w-12 bg-line" />
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1L7.09 4.26H10.51L7.7 6.27L8.79 9.53L6 7.52L3.21 9.53L4.3 6.27L1.49 4.26H4.91L6 1Z" fill="#C9A876" fillOpacity="0.6" />
          </svg>
          <div className="h-px w-12 bg-line" />
        </div>
        <p className="text-xs text-muted text-center" style={{ fontFamily: 'Jost, sans-serif' }}>
          14 de setembro de 2026 · Igreja São Francisco, São Paulo
        </p>
        <button
          onClick={onAdminLink}
          className="text-xs text-muted/50 hover:text-muted transition-colors mt-2"
          style={{ fontFamily: 'Jost, sans-serif' }}
        >
          Acesso administrativo
        </button>
      </div>
    </div>
  )
}
