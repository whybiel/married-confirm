export interface Guest {
  id: string
  spreadsheetId: string | null
  name: string
  note: string
  group: string
  groupId: string
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

export function formatLastAccess(date: string | null): string {
  if (!date) return '—'
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 0) return `Hoje às ${time}`
  if (diffDays === 1) return `Ontem às ${time}`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ` às ${time}`
}
