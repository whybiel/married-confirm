import { Guest, GroupDef, formatLastAccess } from '@/data/mock'
import { compareNaturally } from '@/utils/compareNaturally'

interface GruposProps {
  guests: Guest[]
  groups: GroupDef[]
  onNavigateDashboard: () => void
  onLogout: () => void
}

export default function Grupos({ guests, groups, onNavigateDashboard, onLogout }: GruposProps) {
  const groupStats = groups
    .map((g) => {
      const members = guests.filter((guest) => g.guestIds.includes(guest.id))
      const confirmed = members.filter((m) => m.confirmed).length
      const pending = members.filter((m) => !m.confirmed).length
      const lastAccesses = members.map((m) => m.lastAccess).filter(Boolean) as string[]
      const lastAccess = lastAccesses.length > 0 ? lastAccesses.sort().at(-1)! : null
      return { ...g, members: members.length, confirmed, pending, lastAccess }
    })
    .sort((a, b) => compareNaturally(a.name, b.name))

  return (
    <div className="min-h-screen bg-surface-alt flex flex-col">
      {/* Admin header */}
      <header className="bg-surface border-b border-line sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted leading-none mb-0.5" style={{ fontFamily: 'Jost, sans-serif', fontSize: 11 }}>
                Painel
              </p>
              <p className="font-semibold text-navy text-[15px] leading-none" style={{ fontFamily: 'Jost, sans-serif' }}>
                Mariana & Gabriel
              </p>
            </div>
            <nav className="hidden sm:flex items-center gap-1">
              <button
                onClick={onNavigateDashboard}
                className="h-8 px-4 rounded-2 text-sm font-medium text-muted hover:text-ink hover:bg-surface-alt transition-colors"
                style={{ fontFamily: 'Jost, sans-serif' }}
              >
                Convidados
              </button>
              <button
                className="h-8 px-4 rounded-2 text-sm font-semibold text-surface"
                style={{ backgroundColor: '#16223E', fontFamily: 'Jost, sans-serif' }}
              >
                Grupos
              </button>
            </nav>
          </div>
          <button
            onClick={onLogout}
            className="text-sm text-muted hover:text-ink transition-colors flex items-center gap-1.5"
            style={{ fontFamily: 'Jost, sans-serif' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: 500, color: '#16223E' }}>
            Grupos
          </h1>
          <p className="text-muted text-sm mt-0.5" style={{ fontFamily: 'Jost, sans-serif' }}>
            {groups.length} grupos · {guests.length} convidados no total
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groupStats.map((g) => (
            <div
              key={g.id}
              className="bg-surface rounded-5 border border-line p-6 flex flex-col gap-4 transition-all duration-150 hover:border-champagne"
              style={{ boxShadow: '0 4px 20px rgba(22,34,62,0.05)' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-ink text-[17px]" style={{ fontFamily: 'Jost, sans-serif' }}>
                    {g.name}
                  </h2>
                  <p className="text-muted text-sm mt-0.5" style={{ fontFamily: 'Jost, sans-serif' }}>
                    {g.members} {g.members === 1 ? 'convidado' : 'convidados'} · Código:{' '}
                    <span className="font-mono font-medium text-navy">{g.code}</span>
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-2.5 flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#F3EEE5' }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="7" cy="6" r="3" stroke="#5B6B85" strokeWidth="1.3" />
                    <circle cx="13" cy="8" r="2" stroke="#5B6B85" strokeWidth="1.3" />
                    <path d="M1 15c0-3 2.7-5 6-5s6 2 6 5" stroke="#5B6B85" strokeWidth="1.3" strokeLinecap="round" />
                    <path d="M13 11c2 0 4 1.5 4 4" stroke="#5B6B85" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Confirmed / Pending */}
              <div className="flex items-center gap-4">
                <div className="flex-1 text-center py-3 rounded-3" style={{ backgroundColor: '#EAF0E6' }}>
                  <p
                    style={{
                      fontFamily: 'Cormorant Garamond, Georgia, serif',
                      fontSize: 32,
                      fontWeight: 500,
                      color: '#6F8F6B',
                      lineHeight: 1,
                    }}
                  >
                    {g.confirmed}
                  </p>
                  <p className="text-xs font-medium mt-1" style={{ color: '#6F8F6B', fontFamily: 'Jost, sans-serif' }}>
                    confirmado{g.confirmed !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex-1 text-center py-3 rounded-3" style={{ backgroundColor: '#F3EEE5' }}>
                  <p
                    style={{
                      fontFamily: 'Cormorant Garamond, Georgia, serif',
                      fontSize: 32,
                      fontWeight: 500,
                      color: '#6B7280',
                      lineHeight: 1,
                    }}
                  >
                    {g.pending}
                  </p>
                  <p className="text-xs font-medium mt-1" style={{ color: '#6B7280', fontFamily: 'Jost, sans-serif' }}>
                    pendente{g.pending !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              {g.members > 0 && (
                <div>
                  <div className="h-1.5 rounded-full bg-surface-alt overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(g.confirmed / g.members * 100)}%`,
                        backgroundColor: '#6F8F6B',
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted mt-1.5" style={{ fontFamily: 'Jost, sans-serif' }}>
                    {Math.round(g.confirmed / g.members * 100)}% confirmado
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-line">
                <p className="text-xs text-muted" style={{ fontFamily: 'Jost, sans-serif' }}>
                  Último acesso: {g.lastAccess ? formatLastAccess(g.lastAccess) : 'nunca'}
                </p>
                <button
                  onClick={onNavigateDashboard}
                  className="text-xs font-semibold text-navy hover:underline underline-offset-2"
                  style={{ fontFamily: 'Jost, sans-serif' }}
                >
                  Ver convidados →
                </button>
              </div>
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-4 text-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="16" cy="14" r="7" stroke="#E4DFD5" strokeWidth="1.5" />
              <circle cx="30" cy="18" r="5" stroke="#E4DFD5" strokeWidth="1.5" />
              <path d="M2 34c0-7 6.3-11 14-11s14 4.5 14 11" stroke="#E4DFD5" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-muted" style={{ fontFamily: 'Jost, sans-serif' }}>Nenhum grupo criado ainda.</p>
          </div>
        )}
      </main>
    </div>
  )
}
