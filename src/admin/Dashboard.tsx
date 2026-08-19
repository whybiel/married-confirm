import { useState, useMemo } from 'react'
import { Guest, GroupDef, formatLastAccess } from '@/data/mock'

interface DashboardProps {
  guests: Guest[]
  groups: GroupDef[]
  onUpdate: (guests: Guest[]) => void
  onNavigateGroups: () => void
  onLogout: () => void
}

type SortKey = 'name' | 'group' | 'lastAccess' | 'confirmed'
type FilterDelivered = 'all' | 'yes' | 'no'
type FilterConfirmed = 'all' | 'yes' | 'no'

interface GuestFormData {
  name: string
  note: string
  group: string
  inviteDelivered: boolean
  confirmed: boolean
}

type ImportStep = 1 | 2 | 3 | 4

const mockImportRows = [
  { id: 'N01', name: 'Carla Mendes', note: '', group: 'Família Mendes', inviteDelivered: true, confirmed: false, error: null },
  { id: 'N02', name: 'André Mendes', note: 'Diabético', group: 'Família Mendes', inviteDelivered: false, confirmed: false, error: null },
  { id: 'N03', name: '', note: '', group: 'Conhecidos', inviteDelivered: false, confirmed: false, error: 'Nome em branco' },
  { id: 'N04', name: 'Tatiane Ramos', note: '', group: '', inviteDelivered: false, confirmed: false, error: 'Grupo não identificado' },
]

function StatusChip({ confirmed }: { confirmed: boolean }) {
  return confirmed ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: '#EAF0E6', color: '#6F8F6B', letterSpacing: '0.02em' }}>
      Confirmado
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: '#F3EEE5', color: '#6B7280', letterSpacing: '0.02em' }}>
      Pendente
    </span>
  )
}

function DeliveredChip({ delivered }: { delivered: boolean }) {
  return delivered ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: '#EBE0CB', color: '#16223E', letterSpacing: '0.02em' }}>
      Entregue
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: '#F3EEE5', color: '#6B7280', letterSpacing: '0.02em' }}>
      Pendente
    </span>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="relative inline-flex h-6 w-10 items-center rounded-full transition-colors duration-200 shrink-0"
      style={{ backgroundColor: value ? '#16223E' : '#E4DFD5' }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: value ? 'translateX(20px)' : 'translateX(4px)' }}
      />
    </button>
  )
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div
      className="bg-surface rounded-[20px] border border-line p-5 flex flex-col gap-1 min-w-[120px]"
      style={{ boxShadow: '0 4px 20px rgba(22,34,62,0.05)' }}
    >
      <p className="text-xs font-medium text-muted uppercase tracking-wider" style={{ fontFamily: 'Jost, sans-serif', letterSpacing: '0.06em', fontSize: 11 }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 40,
          fontWeight: 500,
          color: '#16223E',
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted" style={{ fontFamily: 'Jost, sans-serif' }}>{sub}</p>}
    </div>
  )
}

function GuestFormModal({
  guest,
  groups,
  onSave,
  onClose,
}: {
  guest: Guest | null
  groups: GroupDef[]
  onSave: (data: GuestFormData, id?: string) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<GuestFormData>({
    name: guest?.name ?? '',
    note: guest?.note ?? '',
    group: guest?.group ?? '',
    inviteDelivered: guest?.inviteDelivered ?? false,
    confirmed: guest?.confirmed ?? false,
  })
  const [saving, setSaving] = useState(false)
  const isEdit = !!guest

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    onSave(form, guest?.id)
    setSaving(false)
  }

  const groupNames = Array.from(new Set(groups.map((g) => g.name)))

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center p-4 z-50"
      style={{ backgroundColor: 'rgba(22,34,62,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose() }}
    >
      <div
        className="bg-surface w-full max-w-[480px] rounded-t-[24px] sm:rounded-[24px] flex flex-col"
        style={{ boxShadow: '0 20px 60px rgba(22,34,62,0.18)' }}
      >
        <div className="px-8 pt-8 pb-6 border-b border-line">
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 22, fontWeight: 500, color: '#16223E' }}>
            {isEdit ? 'Editar convidado' : 'Adicionar convidado'}
          </h2>
        </div>

        <div className="px-8 py-6 flex flex-col gap-5 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ink tracking-wide" style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, letterSpacing: '0.04em' }}>
              Nome <span style={{ color: '#B5564A' }}>*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nome completo"
              className="h-12 px-4 bg-bg border border-line rounded-[10px] text-ink text-[15px] outline-none transition-all"
              style={{ fontFamily: 'Jost, sans-serif' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#16223E' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E4DFD5' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ink tracking-wide" style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, letterSpacing: '0.04em' }}>
              Observação
            </label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Restrição alimentar, acessibilidade…"
              className="h-12 px-4 bg-bg border border-line rounded-[10px] text-ink text-[15px] outline-none transition-all"
              style={{ fontFamily: 'Jost, sans-serif' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#16223E' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E4DFD5' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ink tracking-wide" style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, letterSpacing: '0.04em' }}>
              Grupo
            </label>
            <input
              type="text"
              list="group-list"
              value={form.group}
              onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
              placeholder="Ex: Família Silva"
              className="h-12 px-4 bg-bg border border-line rounded-[10px] text-ink text-[15px] outline-none transition-all"
              style={{ fontFamily: 'Jost, sans-serif' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#16223E' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E4DFD5' }}
            />
            <datalist id="group-list">
              {groupNames.map((n) => <option key={n} value={n} />)}
            </datalist>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[15px] text-ink font-medium" style={{ fontFamily: 'Jost, sans-serif' }}>Convite entregue</p>
            </div>
            <Toggle value={form.inviteDelivered} onChange={(v) => setForm((f) => ({ ...f, inviteDelivered: v }))} />
          </div>

          {isEdit && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] text-ink font-medium" style={{ fontFamily: 'Jost, sans-serif' }}>Confirmou presença</p>
              </div>
              <Toggle value={form.confirmed} onChange={(v) => setForm((f) => ({ ...f, confirmed: v }))} />
            </div>
          )}
        </div>

        <div className="px-8 pb-8 pt-4 flex items-center gap-3 border-t border-line">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 h-12 rounded-[10px] text-slate font-semibold text-[15px] transition-colors hover:text-ink disabled:opacity-50"
            style={{ fontFamily: 'Jost, sans-serif' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || saving}
            className="flex-[2] h-12 rounded-[10px] text-surface font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: '#16223E', fontFamily: 'Jost, sans-serif' }}
          >
            {saving ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Salvando...
              </>
            ) : isEdit ? 'Salvar alterações' : 'Adicionar convidado'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ImportModal({ onClose, onComplete }: { onClose: () => void; onComplete: (rows: typeof mockImportRows) => void }) {
  const [step, setStep] = useState<ImportStep>(1)
  const [rows, setRows] = useState(mockImportRows)
  const [importing, setImporting] = useState(false)

  const validRows = rows.filter((r) => !r.error)
  const errorRows = rows.filter((r) => r.error)

  const handleUpload = () => {
    setTimeout(() => setStep(2), 600)
  }

  const handleConfirmImport = async () => {
    setImporting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setStep(4)
    setImporting(false)
  }

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center p-4 z-50"
      style={{ backgroundColor: 'rgba(22,34,62,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !importing) onClose() }}
    >
      <div
        className="bg-surface w-full max-w-[540px] rounded-t-[24px] sm:rounded-[24px] flex flex-col max-h-[90vh]"
        style={{ boxShadow: '0 20px 60px rgba(22,34,62,0.18)' }}
      >
        <div className="px-8 pt-8 pb-5 border-b border-line">
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: step >= s ? '#16223E' : '#E4DFD5',
                    color: step >= s ? 'white' : '#6B7280',
                    fontFamily: 'Jost, sans-serif',
                  }}
                >
                  {step > s ? (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : s}
                </div>
                {s < 4 && <div className="w-6 h-px" style={{ backgroundColor: step > s ? '#16223E' : '#E4DFD5' }} />}
              </div>
            ))}
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 22, fontWeight: 500, color: '#16223E' }}>
            {step === 1 && 'Importar convidados'}
            {step === 2 && 'Pré-visualização'}
            {step === 3 && 'Confirmar importação'}
            {step === 4 && 'Importação concluída'}
          </h2>
        </div>

        <div className="px-8 py-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div
                className="border-2 border-dashed rounded-[16px] p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors"
                style={{ borderColor: '#E4DFD5' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C9A876'; e.currentTarget.style.backgroundColor = '#FAF8F4' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E4DFD5'; e.currentTarget.style.backgroundColor = 'transparent' }}
                onClick={handleUpload}
              >
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path d="M6 24v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4M18 6v18M12 12l6-6 6 6" stroke="#5B6B85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="font-semibold text-ink text-[15px]" style={{ fontFamily: 'Jost, sans-serif' }}>
                  Clique para enviar o arquivo
                </p>
                <p className="text-muted text-sm text-center" style={{ fontFamily: 'Jost, sans-serif' }}>
                  Aceita .csv ou .xlsx — máx. 5 MB
                </p>
              </div>
              <div className="flex items-center gap-2 p-4 rounded-[12px] bg-surface-alt">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#5B6B85" strokeWidth="1.2" />
                  <path d="M8 7v5M8 5h.01" stroke="#5B6B85" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <p className="text-sm text-muted flex-1" style={{ fontFamily: 'Jost, sans-serif' }}>
                  Colunas esperadas: ID, Nome, Observação, Grupo, Convite entregue, Confirmou presença
                </p>
              </div>
              <button className="text-sm font-medium text-navy underline underline-offset-2 text-left" style={{ fontFamily: 'Jost, sans-serif' }}>
                Baixar modelo de planilha
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="px-3 py-1.5 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: '#EBE0CB', color: '#16223E', fontFamily: 'Jost, sans-serif' }}
                >
                  {rows.length} convidados encontrados
                </span>
                <span
                  className="px-3 py-1.5 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: '#EAF0E6', color: '#6F8F6B', fontFamily: 'Jost, sans-serif' }}
                >
                  {validRows.length} válidos
                </span>
                {errorRows.length > 0 && (
                  <span
                    className="px-3 py-1.5 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: '#F5E9E7', color: '#B5564A', fontFamily: 'Jost, sans-serif' }}
                  >
                    {errorRows.length} com atenção
                  </span>
                )}
              </div>

              <div className="border border-line rounded-[14px] overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_1fr_auto] text-xs font-semibold text-muted px-4 py-2.5 bg-surface-alt border-b border-line"
                  style={{ fontFamily: 'Jost, sans-serif', letterSpacing: '0.04em' }}>
                  <span className="w-12">ID</span>
                  <span>Nome</span>
                  <span>Grupo</span>
                  <span className="w-8" />
                </div>
                {rows.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[auto_1fr_1fr_auto] px-4 py-3 items-center border-b border-line last:border-b-0 group"
                    style={{ backgroundColor: row.error ? '#FEF5F4' : 'transparent' }}
                  >
                    <span className="w-12 text-xs text-muted font-mono" style={{ fontFamily: 'Jost, sans-serif' }}>{row.id}</span>
                    <div>
                      <p className="text-sm text-ink" style={{ fontFamily: 'Jost, sans-serif' }}>
                        {row.name || <span className="text-muted italic">em branco</span>}
                      </p>
                      {row.error && <p className="text-xs mt-0.5" style={{ color: '#B5564A', fontFamily: 'Jost, sans-serif' }}>{row.error}</p>}
                    </div>
                    <span className="text-sm text-muted" style={{ fontFamily: 'Jost, sans-serif' }}>{row.group || '—'}</span>
                    <button
                      onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-terra-light transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 2l10 10M12 2L2 12" stroke="#B5564A" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={validRows.length === 0}
                className="w-full h-12 rounded-[10px] text-surface font-semibold text-[15px] disabled:opacity-40"
                style={{ backgroundColor: '#16223E', fontFamily: 'Jost, sans-serif' }}
              >
                Continuar com {validRows.length} registros
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div
                className="p-5 rounded-[16px] flex items-center gap-4"
                style={{ backgroundColor: '#EBE0CB' }}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" stroke="#C9A876" strokeWidth="1.5" />
                  <path d="M10 16l4 4 8-8" stroke="#16223E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="text-ink font-semibold text-[15px]" style={{ fontFamily: 'Jost, sans-serif' }}>
                    Prestes a importar {validRows.length} convidados
                  </p>
                  <p className="text-muted text-sm" style={{ fontFamily: 'Jost, sans-serif' }}>
                    {errorRows.length > 0 ? `${errorRows.length} registros ignorados` : 'Todos os registros estão válidos'}
                  </p>
                </div>
              </div>
              <p className="text-muted text-sm leading-relaxed" style={{ fontFamily: 'Jost, sans-serif' }}>
                Ao confirmar, os convidados serão adicionados à lista. Esta ação não pode ser desfeita em massa — convidados individuais podem ser editados ou removidos depois.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center py-6 gap-4 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EAF0E6' }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M8 16l5 5 11-11" stroke="#6F8F6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 22, fontWeight: 500, color: '#16223E' }}>
                Importação concluída
              </h3>
              <p className="text-muted text-sm" style={{ fontFamily: 'Jost, sans-serif' }}>
                {validRows.length} convidados importados com sucesso.
              </p>
            </div>
          )}
        </div>

        <div className="px-8 pb-8 pt-4 flex items-center gap-3 border-t border-line">
          <button
            onClick={onClose}
            disabled={importing}
            className="flex-1 h-12 rounded-[10px] text-slate font-semibold text-[15px] hover:text-ink transition-colors disabled:opacity-50"
            style={{ fontFamily: 'Jost, sans-serif' }}
          >
            {step === 4 ? 'Concluir' : 'Cancelar'}
          </button>
          {step === 3 && (
            <button
              onClick={handleConfirmImport}
              disabled={importing}
              className="flex-[2] h-12 rounded-[10px] text-surface font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ backgroundColor: '#16223E', fontFamily: 'Jost, sans-serif' }}
            >
              {importing ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Importando...
                </>
              ) : 'Importar convidados'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({ guests, groups, onUpdate, onNavigateGroups, onLogout }: DashboardProps) {
  const [search, setSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState('all')
  const [filterDelivered, setFilterDelivered] = useState<FilterDelivered>('all')
  const [filterConfirmed, setFilterConfirmed] = useState<FilterConfirmed>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [editGuest, setEditGuest] = useState<Guest | null | 'new'>(null)
  const [showImport, setShowImport] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const groupNames = Array.from(new Set(guests.map((g) => g.group).filter(Boolean)))

  const filtered = useMemo(() => {
    let result = [...guests]
    if (search) result = result.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()) || g.group.toLowerCase().includes(search.toLowerCase()))
    if (filterGroup !== 'all') result = result.filter((g) => g.group === filterGroup)
    if (filterDelivered === 'yes') result = result.filter((g) => g.inviteDelivered)
    if (filterDelivered === 'no') result = result.filter((g) => !g.inviteDelivered)
    if (filterConfirmed === 'yes') result = result.filter((g) => g.confirmed)
    if (filterConfirmed === 'no') result = result.filter((g) => !g.confirmed)
    result.sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name)
      if (sortKey === 'group') return a.group.localeCompare(b.group)
      if (sortKey === 'confirmed') return Number(b.confirmed) - Number(a.confirmed)
      if (sortKey === 'lastAccess') return (b.lastAccess ?? '').localeCompare(a.lastAccess ?? '')
      return 0
    })
    return result
  }, [guests, search, filterGroup, filterDelivered, filterConfirmed, sortKey])

  const stats = useMemo(() => ({
    total: guests.length,
    confirmed: guests.filter((g) => g.confirmed).length,
    pending: guests.filter((g) => !g.confirmed).length,
    delivered: guests.filter((g) => g.inviteDelivered).length,
    groups: groups.length,
  }), [guests, groups])

  const clearFilters = () => {
    setSearch('')
    setFilterGroup('all')
    setFilterDelivered('all')
    setFilterConfirmed('all')
  }

  const hasFilters = search || filterGroup !== 'all' || filterDelivered !== 'all' || filterConfirmed !== 'all'

  const handleSave = (data: GuestFormData, id?: string) => {
    if (id) {
      onUpdate(guests.map((g) => g.id === id ? { ...g, ...data } : g))
    } else {
      const newId = String(Date.now()).slice(-4)
      onUpdate([...guests, {
        id: newId,
        name: data.name,
        note: data.note,
        group: data.group,
        inviteDelivered: data.inviteDelivered,
        confirmed: false,
        lastAccess: null,
      }])
    }
    setEditGuest(null)
  }

  const handleDelete = (id: string) => {
    onUpdate(guests.filter((g) => g.id !== id))
    setDeleteId(null)
  }

  const selectEl = "h-10 px-3 bg-surface border border-line rounded-[10px] text-ink text-sm outline-none"

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
                Marina & Thiago
              </p>
            </div>
            <nav className="hidden sm:flex items-center gap-1">
              <button
                className="h-8 px-4 rounded-[8px] text-sm font-semibold text-surface"
                style={{ backgroundColor: '#16223E', fontFamily: 'Jost, sans-serif' }}
              >
                Convidados
              </button>
              <button
                onClick={onNavigateGroups}
                className="h-8 px-4 rounded-[8px] text-sm font-medium text-muted hover:text-ink hover:bg-surface-alt transition-colors"
                style={{ fontFamily: 'Jost, sans-serif' }}
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
        {/* Page title + actions */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: 500, color: '#16223E' }}>
              Convidados
            </h1>
            <p className="text-muted text-sm mt-0.5" style={{ fontFamily: 'Jost, sans-serif' }}>
              Gerenciar a lista de convidados do casamento
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImport(true)}
              className="h-10 px-5 rounded-[10px] border border-navy text-navy text-sm font-semibold hover:bg-navy hover:text-surface transition-all"
              style={{ fontFamily: 'Jost, sans-serif' }}
            >
              Importar
            </button>
            <button
              onClick={() => setEditGuest('new')}
              className="h-10 px-5 rounded-[10px] text-surface text-sm font-semibold flex items-center gap-1.5"
              style={{ backgroundColor: '#16223E', fontFamily: 'Jost, sans-serif' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1F3159' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#16223E' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Adicionar
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Confirmados" value={stats.confirmed} sub={`${Math.round(stats.confirmed / Math.max(stats.total, 1) * 100)}% do total`} />
          <StatCard label="Pendentes" value={stats.pending} />
          <StatCard label="Convites entregues" value={stats.delivered} />
          <StatCard label="Grupos" value={stats.groups} />
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-[16px] border border-line p-4 mb-4" style={{ boxShadow: '0 2px 8px rgba(22,34,62,0.04)' }}>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou grupo…"
                className="w-full h-10 pl-9 pr-4 bg-bg border border-line rounded-[10px] text-ink text-sm outline-none transition-all"
                style={{ fontFamily: 'Jost, sans-serif' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#16223E' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#E4DFD5' }}
              />
            </div>
            <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className={selectEl} style={{ fontFamily: 'Jost, sans-serif' }}>
              <option value="all">Todos os grupos</option>
              {groupNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <select value={filterDelivered} onChange={(e) => setFilterDelivered(e.target.value as FilterDelivered)} className={selectEl} style={{ fontFamily: 'Jost, sans-serif' }}>
              <option value="all">Convite: Todos</option>
              <option value="yes">Entregue</option>
              <option value="no">Não entregue</option>
            </select>
            <select value={filterConfirmed} onChange={(e) => setFilterConfirmed(e.target.value as FilterConfirmed)} className={selectEl} style={{ fontFamily: 'Jost, sans-serif' }}>
              <option value="all">Status: Todos</option>
              <option value="yes">Confirmado</option>
              <option value="no">Pendente</option>
            </select>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className={selectEl} style={{ fontFamily: 'Jost, sans-serif' }}>
              <option value="name">Ordenar: Nome</option>
              <option value="group">Ordenar: Grupo</option>
              <option value="confirmed">Ordenar: Status</option>
              <option value="lastAccess">Ordenar: Último acesso</option>
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-terra font-medium hover:underline" style={{ fontFamily: 'Jost, sans-serif' }}>
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Table (desktop) */}
        <div className="hidden sm:block bg-surface rounded-[20px] border border-line overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(22,34,62,0.05)' }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-4 text-center px-4">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="7" y="9" width="26" height="22" rx="3" stroke="#E4DFD5" strokeWidth="1.5" />
                <path d="M13 18h14M13 24h9" stroke="#E4DFD5" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="font-semibold text-ink" style={{ fontFamily: 'Jost, sans-serif' }}>
                {hasFilters ? 'Nenhum convidado encontrado com esses filtros.' : 'Nenhum convidado cadastrado ainda.'}
              </p>
              {hasFilters ? (
                <button onClick={clearFilters} className="text-sm font-medium text-navy underline" style={{ fontFamily: 'Jost, sans-serif' }}>
                  Limpar filtros
                </button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => setShowImport(true)} className="text-sm font-medium text-navy border border-navy px-4 py-2 rounded-[8px]" style={{ fontFamily: 'Jost, sans-serif' }}>
                    Importar convidados
                  </button>
                  <button onClick={() => setEditGuest('new')} className="text-sm font-semibold text-surface px-4 py-2 rounded-[8px]" style={{ backgroundColor: '#16223E', fontFamily: 'Jost, sans-serif' }}>
                    Adicionar convidado
                  </button>
                </div>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  {['ID', 'Nome', 'Observação', 'Grupo', 'Convite', 'Confirmação', 'Último acesso', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-muted uppercase tracking-wider whitespace-nowrap"
                      style={{ fontFamily: 'Jost, sans-serif', letterSpacing: '0.06em', backgroundColor: '#FAF8F4' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((guest, i) => (
                  <tr
                    key={guest.id}
                    className="border-b border-line last:border-b-0 hover:bg-bg transition-colors group"
                  >
                    <td className="px-4 py-3.5 text-xs text-muted font-mono" style={{ fontFamily: 'Jost, sans-serif' }}>{guest.id}</td>
                    <td className="px-4 py-3.5 font-medium text-[15px] text-ink whitespace-nowrap" style={{ fontFamily: 'Jost, sans-serif' }}>{guest.name}</td>
                    <td className="px-4 py-3.5 text-sm text-muted max-w-[140px] truncate" style={{ fontFamily: 'Jost, sans-serif' }}>{guest.note || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-ink whitespace-nowrap" style={{ fontFamily: 'Jost, sans-serif' }}>{guest.group}</td>
                    <td className="px-4 py-3.5"><DeliveredChip delivered={guest.inviteDelivered} /></td>
                    <td className="px-4 py-3.5"><StatusChip confirmed={guest.confirmed} /></td>
                    <td className="px-4 py-3.5 text-sm text-muted whitespace-nowrap" style={{ fontFamily: 'Jost, sans-serif' }}>{formatLastAccess(guest.lastAccess)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditGuest(guest)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-alt transition-colors" title="Editar">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M10 2l2 2-8 8H2v-2L10 2z" stroke="#5B6B85" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button onClick={() => setDeleteId(guest.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-terra-light transition-colors" title="Excluir">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 4h10M5 4V3h4v1M5.5 6.5v4M8.5 6.5v4M3 4l1 8h6l1-8" stroke="#B5564A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Card list (mobile) */}
        <div className="sm:hidden flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center">
              <p className="font-semibold text-ink" style={{ fontFamily: 'Jost, sans-serif' }}>
                {hasFilters ? 'Nenhum resultado encontrado.' : 'Nenhum convidado cadastrado.'}
              </p>
            </div>
          ) : (
            filtered.map((guest) => (
              <div
                key={guest.id}
                className="bg-surface rounded-[20px] border border-line p-5"
                style={{ boxShadow: '0 4px 20px rgba(22,34,62,0.05)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-[17px] text-ink" style={{ fontFamily: 'Jost, sans-serif' }}>{guest.name}</p>
                    <p className="text-sm text-muted mt-0.5" style={{ fontFamily: 'Jost, sans-serif' }}>{guest.group}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setEditGuest(guest)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-alt transition-colors">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M10 2l2 2-8 8H2v-2L10 2z" stroke="#5B6B85" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button onClick={() => setDeleteId(guest.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-terra-light transition-colors">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 4h10M5 4V3h4v1M5.5 6.5v4M8.5 6.5v4M3 4l1 8h6l1-8" stroke="#B5564A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <DeliveredChip delivered={guest.inviteDelivered} />
                  <StatusChip confirmed={guest.confirmed} />
                </div>
                <div className="flex flex-col gap-1.5">
                  {guest.note && (
                    <div className="flex gap-2">
                      <p className="text-xs text-muted w-24 shrink-0" style={{ fontFamily: 'Jost, sans-serif' }}>Observação</p>
                      <p className="text-xs text-ink" style={{ fontFamily: 'Jost, sans-serif' }}>{guest.note}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <p className="text-xs text-muted w-24 shrink-0" style={{ fontFamily: 'Jost, sans-serif' }}>Último acesso</p>
                    <p className="text-xs text-ink" style={{ fontFamily: 'Jost, sans-serif' }}>{formatLastAccess(guest.lastAccess)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filtered.length > 0 && (
          <p className="text-center text-xs text-muted mt-6" style={{ fontFamily: 'Jost, sans-serif' }}>
            Exibindo {filtered.length} de {guests.length} convidados
          </p>
        )}
      </main>

      {/* Guest form modal */}
      {editGuest !== null && (
        <GuestFormModal
          guest={editGuest === 'new' ? null : editGuest}
          groups={groups}
          onSave={handleSave}
          onClose={() => setEditGuest(null)}
        />
      )}

      {/* Import modal */}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onComplete={() => setShowImport(false)}
        />
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(22,34,62,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteId(null) }}
        >
          <div
            className="bg-surface rounded-[24px] p-8 w-full max-w-sm flex flex-col gap-5"
            style={{ boxShadow: '0 20px 60px rgba(22,34,62,0.18)' }}
          >
            <div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 22, fontWeight: 500, color: '#16223E' }}>
                Remover convidado?
              </h3>
              <p className="text-muted text-sm mt-2" style={{ fontFamily: 'Jost, sans-serif' }}>
                Esta ação não pode ser desfeita. O convidado será removido permanentemente da lista.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 h-11 rounded-[10px] text-slate font-semibold text-[15px]" style={{ fontFamily: 'Jost, sans-serif' }}>
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 h-11 rounded-[10px] text-surface font-semibold text-[15px]"
                style={{ backgroundColor: '#B5564A', fontFamily: 'Jost, sans-serif' }}
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
