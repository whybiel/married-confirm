export interface Guest {
  id: string
  name: string
  note: string
  group: string
  inviteDelivered: boolean
  confirmed: boolean
  lastAccess: string | null
}

export interface GroupDef {
  id: string
  name: string
  code: string
  guestIds: string[]
}

export const VALID_CODES: Record<string, string> = {
  AB12CD: 'g1',
  XY98ZW: 'g2',
  MR45TG: 'g3',
  TH67KL: 'g4',
}

export const initialGroups: GroupDef[] = [
  { id: 'g1', name: 'Família Silva', code: 'AB12CD', guestIds: ['001', '002', '003'] },
  { id: 'g2', name: 'Família Ferreira', code: 'XY98ZW', guestIds: ['004', '005'] },
  { id: 'g3', name: 'Amigos da Marina', code: 'MR45TG', guestIds: ['006', '007', '009'] },
  { id: 'g4', name: 'Amigos do Thiago', code: 'TH67KL', guestIds: ['008', '010'] },
]

export const initialGuests: Guest[] = [
  { id: '001', name: 'Ana Silva', note: '', group: 'Família Silva', inviteDelivered: true, confirmed: true, lastAccess: '2026-08-15T18:42:00' },
  { id: '002', name: 'Carlos Silva', note: 'Alergia a frutos do mar', group: 'Família Silva', inviteDelivered: true, confirmed: true, lastAccess: '2026-08-15T18:42:00' },
  { id: '003', name: 'Mariana Silva', note: '', group: 'Família Silva', inviteDelivered: true, confirmed: false, lastAccess: null },
  { id: '004', name: 'Pedro Ferreira', note: 'Vegetariano', group: 'Família Ferreira', inviteDelivered: true, confirmed: false, lastAccess: null },
  { id: '005', name: 'Lúcia Ferreira', note: '', group: 'Família Ferreira', inviteDelivered: false, confirmed: false, lastAccess: null },
  { id: '006', name: 'Roberto Costa', note: '', group: 'Amigos da Marina', inviteDelivered: true, confirmed: true, lastAccess: '2026-08-14T10:15:00' },
  { id: '007', name: 'Fernanda Costa', note: '', group: 'Amigos da Marina', inviteDelivered: true, confirmed: true, lastAccess: '2026-08-14T10:15:00' },
  { id: '008', name: 'João Oliveira', note: 'Cadeirante', group: 'Amigos do Thiago', inviteDelivered: true, confirmed: false, lastAccess: '2026-08-16T09:30:00' },
  { id: '009', name: 'Beatriz Lima', note: '', group: 'Amigos da Marina', inviteDelivered: false, confirmed: false, lastAccess: null },
  { id: '010', name: 'Rafael Santos', note: '', group: 'Amigos do Thiago', inviteDelivered: true, confirmed: false, lastAccess: null },
]

export function formatLastAccess(date: string | null): string {
  if (!date) return '—'
  const d = new Date(date)
  const now = new Date('2026-08-19')
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 0) return `Hoje às ${time}`
  if (diffDays === 1) return `Ontem às ${time}`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ` às ${time}`
}
