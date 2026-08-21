import { useState } from 'react'
import { signInAdmin } from '@/services/adminData'

interface AdminAccessProps {
  onSuccess: () => void
  onBack: () => void
}

export default function AdminAccess({ onSuccess, onBack }: AdminAccessProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInAdmin(email.trim(), password)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-alt flex flex-col items-center justify-center px-4">
      <div
        className="bg-surface  p-8 w-full max-w-sm border border-line"
        style={{ boxShadow: '0 4px 20px rgba(22,34,62,0.06)' }}
      >
        <div className="mb-8">
          <p className="text-xs font-medium tracking-widest text-muted mb-3 uppercase" style={{ fontFamily: 'Jost, sans-serif', letterSpacing: '0.1em' }}>
            Painel Admin
          </p>
          <h2
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 26,
              fontWeight: 500,
              color: '#16223E',
            }}
          >
            Acesso administrativo
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-medium tracking-wide text-ink"
              style={{ fontFamily: 'Jost, sans-serif', letterSpacing: '0.04em', fontSize: 12 }}
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="seu@email.com"
              disabled={loading}
              autoComplete="email"
              className="w-full h-12 px-4 bg-bg border border-line rounded-[10px] text-ink text-base outline-none transition-all duration-150 disabled:opacity-60"
              style={{ fontFamily: 'Jost, sans-serif' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#16223E'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,118,0.12)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E4DFD5'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-medium tracking-wide text-ink"
              style={{ fontFamily: 'Jost, sans-serif', letterSpacing: '0.04em', fontSize: 12 }}
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
              className="w-full h-12 px-4 bg-bg border border-line rounded-[10px] text-ink text-base outline-none transition-all duration-150 disabled:opacity-60"
              style={{ fontFamily: 'Jost, sans-serif' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#16223E'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,168,118,0.12)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E4DFD5'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            {error && (
              <p className="text-sm mt-0.5" style={{ color: '#B5564A', fontFamily: 'Jost, sans-serif' }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full h-12 rounded-[10px] font-semibold text-[15px] text-surface transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            style={{ backgroundColor: '#16223E', fontFamily: 'Jost, sans-serif' }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#1F3159' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#16223E' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <path d="M9 2a7 7 0 0 1 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <button
          onClick={onBack}
          className="w-full text-center text-sm text-muted mt-6 hover:text-ink transition-colors"
          style={{ fontFamily: 'Jost, sans-serif' }}
        >
          ← Voltar ao site
        </button>
      </div>
    </div>
  )
}
