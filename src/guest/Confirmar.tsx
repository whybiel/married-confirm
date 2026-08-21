import { useState, useEffect } from 'react'
import { Guest } from '@/data/mock'
import { lookupInvite } from '@/services/invite'

interface ConfirmarProps {
  code: string
  onConfirm: (confirmedIds: string[]) => Promise<void>
  onBack: () => void
}

type PageState = 'loading' | 'ready' | 'error' | 'empty' | 'modal' | 'saving'

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-checked={checked}
      role="checkbox"
      className="shrink-0 w-5.5 h-5.5 rounded-1.5 border flex items-center justify-center transition-all duration-150"
      style={{
        borderColor: checked ? '#16223E' : '#E4DFD5',
        backgroundColor: checked ? '#16223E' : 'transparent',
      }}
    >
      {checked && (
        <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
          <path
            className="check-path"
            d="M1.5 5L5 8.5L11.5 1.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}

function SkeletonCard() {
  return (
    <div
      className="bg-surface border border-line rounded-[20px] p-5 flex items-center gap-4 animate-skeleton"
      style={{ boxShadow: '0 4px 20px rgba(22,34,62,0.06)' }}
    >
      <div className="w-5.5 h-5.5 rounded-1.5 bg-line shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 w-32 rounded bg-line" />
        <div className="h-5 w-20 rounded-full bg-line" />
      </div>
    </div>
  )
}

function StatusChip({ confirmed }: { confirmed: boolean }) {
  if (confirmed) {
    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: '#EAF0E6', color: '#6F8F6B', letterSpacing: '0.02em' }}
      >
        Confirmado
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: '#F3EEE5', color: '#6B7280', letterSpacing: '0.02em' }}
    >
      Ainda não confirmado
    </span>
  )
}

export default function Confirmar({ code, onConfirm, onBack }: ConfirmarProps) {
  const [pageState, setPageState] = useState<PageState>('loading')
  const [groupGuests, setGroupGuests] = useState<Guest[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    let cancelled = false

    lookupInvite(code)
      .then((invite) => {
        if (cancelled) return
        if (!invite) {
          setPageState('error')
          return
        }
        if (invite.guests.length === 0) {
          setPageState('empty')
          return
        }
        setGroupGuests(invite.guests)
        setPageState('ready')
      })
      .catch(() => {
        if (!cancelled) setPageState('error')
      })

    return () => {
      cancelled = true
    }
  }, [code])

  const allConfirmed = groupGuests.length > 0 && groupGuests.every((g) => g.confirmed)
  const allSelected = groupGuests.length > 0 && groupGuests.every((g) => selected.has(g.id))

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(groupGuests.map((g) => g.id)))
    }
  }

  const toggleGuest = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleConfirmClick = () => {
    if (selected.size === 0) return
    setPageState('modal')
    setModalError('')
  }

  const handleConfirmSave = async () => {
    setPageState('saving')
    setModalError('')
    try {
      await onConfirm(Array.from(selected))
    } catch {
      setModalError('Não foi possível confirmar. Tente novamente.')
      setPageState('modal')
    }
  }

  const selectedGuests = groupGuests.filter((g) => selected.has(g.id))

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="px-6 pt-10 pb-6 max-w-lg mx-auto w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate text-sm mb-8 hover:text-ink transition-colors"
          style={{ fontFamily: 'Jost, sans-serif' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </button>

        <h2
          className="leading-tight mb-2"
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(24px, 6vw, 28px)',
            fontWeight: 500,
            color: '#16223E',
          }}
        >
          Confirme sua presença
        </h2>
        <p className="text-muted text-sm leading-relaxed" style={{ fontFamily: 'Jost, sans-serif' }}>
          Selecione as pessoas que estarão presentes no nosso casamento.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-32 max-w-lg mx-auto w-full flex flex-col gap-3">
        {pageState === 'loading' && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {pageState === 'error' && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#B5564A" strokeWidth="1.5" />
              <path d="M20 13v8M20 25h.01" stroke="#B5564A" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <p className="text-ink font-medium" style={{ fontFamily: 'Jost, sans-serif' }}>
              Não conseguimos carregar sua lista agora.
            </p>
            <p className="text-muted text-sm" style={{ fontFamily: 'Jost, sans-serif' }}>
              Tente novamente em instantes.
            </p>
            <button
              onClick={onBack}
              className="mt-2 h-10 px-6 rounded-[10px] border border-navy text-navy text-sm font-semibold transition-colors"
              style={{ fontFamily: 'Jost, sans-serif' }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {pageState === 'empty' && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="8" y="10" width="24" height="20" rx="3" stroke="#6B7280" strokeWidth="1.3" />
              <path d="M14 18h12M14 23h8" stroke="#6B7280" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <p className="text-ink font-medium" style={{ fontFamily: 'Jost, sans-serif' }}>
              Nenhum convidado encontrado nesse convite.
            </p>
            <p className="text-muted text-sm" style={{ fontFamily: 'Jost, sans-serif' }}>
              Fale com os noivos para verificar o código.
            </p>
            <button
              onClick={onBack}
              className="mt-2 text-slate text-sm font-medium underline underline-offset-2"
              style={{ fontFamily: 'Jost, sans-serif' }}
            >
              Voltar
            </button>
          </div>
        )}

        {(pageState === 'ready' || pageState === 'modal' || pageState === 'saving') && (
          <>
            {allConfirmed && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-3 mb-1"
                style={{ backgroundColor: '#EAF0E6' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#6F8F6B" strokeWidth="1.2" />
                  <path d="M5 8l2 2 4-4" stroke="#6F8F6B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm" style={{ color: '#6F8F6B', fontFamily: 'Jost, sans-serif' }}>
                  Vimos que sua presença já está confirmada 💙
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mb-1 px-1">
              <button
                onClick={toggleAll}
                className="text-sm font-medium text-slate hover:text-ink transition-colors"
                style={{ fontFamily: 'Jost, sans-serif' }}
              >
                {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
              </button>
              <span className="text-xs text-muted" style={{ fontFamily: 'Jost, sans-serif' }}>
                {selected.size} de {groupGuests.length} selecionado{selected.size !== 1 ? 's' : ''}
              </span>
            </div>

            {groupGuests.map((guest) => (
              <button
                key={guest.id}
                type="button"
                onClick={() => toggleGuest(guest.id)}
                className="w-full bg-surface border border-line rounded-[20px] p-5 flex items-center gap-4 text-left transition-all duration-150 hover:border-champagne"
                style={{ boxShadow: '0 4px 20px rgba(22,34,62,0.06)' }}
              >
                <Checkbox
                  checked={selected.has(guest.id)}
                  onChange={() => toggleGuest(guest.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-ink font-semibold text-[17px] leading-snug mb-1.5" style={{ fontFamily: 'Jost, sans-serif' }}>
                    {guest.name}
                  </p>
                  <StatusChip confirmed={guest.confirmed} />
                  {guest.note && (
                    <p className="text-muted text-xs mt-1.5" style={{ fontFamily: 'Jost, sans-serif' }}>
                      {guest.note}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Sticky footer button */}
      {(pageState === 'ready' || pageState === 'modal' || pageState === 'saving') && (
        <div
          className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4"
          style={{ background: 'linear-gradient(to top, #FAF8F4 70%, transparent)' }}
        >
          <div className="max-w-lg mx-auto">
            <button
              onClick={handleConfirmClick}
              disabled={selected.size === 0}
              className="w-full h-12 rounded-[10px] font-semibold text-[15px] text-surface transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#16223E',
                fontFamily: 'Jost, sans-serif',
              }}
              onMouseEnter={(e) => { if (selected.size > 0) e.currentTarget.style.backgroundColor = '#1F3159' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#16223E' }}
            >
              Confirmar presença
            </button>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {(pageState === 'modal' || pageState === 'saving') && (
        <div
          className="fixed inset-0 flex items-end sm:items-center justify-center p-4 sm:p-6 z-50"
          style={{ backgroundColor: 'rgba(22,34,62,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget && pageState !== 'saving') setPageState('ready') }}
        >
          <div
            className="bg-surface w-full max-w-120 rounded-t-6 sm:rounded-6 p-8 flex flex-col gap-6"
            style={{ boxShadow: '0 20px 60px rgba(22,34,62,0.18)' }}
          >
            <div>
              <h2
                className="mb-2"
                style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 24,
                  fontWeight: 500,
                  color: '#16223E',
                }}
              >
                Confirmar presença?
              </h2>
              <p className="text-muted text-sm leading-relaxed" style={{ fontFamily: 'Jost, sans-serif' }}>
                Você deseja confirmar a presença das seguintes pessoas?
              </p>
            </div>

            <ul className="flex flex-col gap-2">
              {selectedGuests.map((g) => (
                <li key={g.id} className="flex items-center gap-2 text-ink text-[15px]" style={{ fontFamily: 'Jost, sans-serif' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-champagne shrink-0" />
                  {g.name}
                </li>
              ))}
            </ul>

            <p className="text-muted text-sm" style={{ fontFamily: 'Jost, sans-serif' }}>
              Essas pessoas estarão presentes no nosso casamento?
            </p>

            {modalError && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-2" style={{ backgroundColor: '#F5E9E7' }}>
                <p className="text-sm" style={{ color: '#B5564A', fontFamily: 'Jost, sans-serif' }}>
                  {modalError}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => { if (pageState !== 'saving') setPageState('ready') }}
                disabled={pageState === 'saving'}
                className="flex-1 h-12 rounded-[10px] text-slate font-semibold text-[15px] transition-colors hover:text-ink disabled:opacity-50"
                style={{ fontFamily: 'Jost, sans-serif' }}
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={pageState === 'saving'}
                className="flex-2 h-12 rounded-2 text-surface font-semibold text-[15px] flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                style={{ backgroundColor: '#16223E', fontFamily: 'Jost, sans-serif' }}
                onMouseEnter={(e) => { if (pageState !== 'saving') e.currentTarget.style.backgroundColor = '#1F3159' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#16223E' }}
              >
                {pageState === 'saving' ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                      <path d="M9 2a7 7 0 0 1 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Salvando...
                  </>
                ) : (
                  'Confirmar presença'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
