import * as XLSX from 'xlsx'
import { GroupDef } from '@/data/mock'
import { compareNaturally } from '@/utils/compareNaturally'

export interface ImportRow {
  id: string
  name: string
  note: string
  group: string
  groupCode: string
  inviteDelivered: boolean
  confirmed: boolean
  error: string | null
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

const COLUMN_ALIASES = {
  id: ['id'],
  name: ['nome', 'name'],
  note: ['observacao', 'obs', 'note'],
  groupNumber: ['grupo', 'group'],
  groupCode: ['codigo', 'code'],
  inviteDelivered: ['convite entregue', 'convite', 'entregue'],
  confirmed: ['confirmou presenca', 'confirmado', 'confirmou', 'presenca'],
}

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\?+$/, '')
    .replace(/\s+/g, ' ')
}

function findHeaderRowIndex(rawRows: unknown[][]): number {
  const maxScan = Math.min(rawRows.length, 15)
  for (let i = 0; i < maxScan; i++) {
    const headers = (rawRows[i] ?? []).map(normalizeHeader)
    const hasName = headers.some((h) => COLUMN_ALIASES.name.includes(h))
    const hasCode = headers.some((h) => COLUMN_ALIASES.groupCode.includes(h))
    if (hasName && hasCode) return i
  }
  return 0
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  const text = String(value ?? '')
    .trim()
    .toLowerCase()
  if (!text) return false
  return ['sim', 's', 'yes', 'y', 'true', '1', 'x', '✓', 'ok'].includes(text)
}

function cellToString(value: unknown): string {
  if (value == null) return ''
  return String(value).trim()
}

function findColumnIndex(headers: string[], aliases: string[]): number {
  return headers.findIndex((h) => aliases.includes(h))
}

function generateGuestId(existingIds: Set<string>, fallback: string): string {
  const base = fallback || `N${Date.now().toString().slice(-6)}`
  if (!existingIds.has(base)) return base
  let i = 1
  while (existingIds.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}

function formatGroupName(groupNumber: string, groupCode: string): string {
  if (groupNumber) return `Grupo ${groupNumber}`
  return groupCode
}

export function parseGuestSpreadsheet(file: File): Promise<ImportRow[]> {
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    return Promise.reject(new Error('Formato inválido. Envie um arquivo .xlsx.'))
  }
  if (file.size > MAX_FILE_SIZE) {
    return Promise.reject(new Error('Arquivo muito grande. O limite é 5 MB.'))
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const buffer = event.target?.result
        if (!(buffer instanceof ArrayBuffer)) {
          reject(new Error('Não foi possível ler o arquivo.'))
          return
        }

        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) {
          reject(new Error('A planilha está vazia.'))
          return
        }

        const sheet = workbook.Sheets[sheetName]
        const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' })

        if (rawRows.length < 2) {
          reject(new Error('A planilha não contém dados para importar.'))
          return
        }

        const headerRowIndex = findHeaderRowIndex(rawRows)
        const headers = (rawRows[headerRowIndex] ?? []).map(normalizeHeader)
        const colIndex = {
          id: findColumnIndex(headers, COLUMN_ALIASES.id),
          name: findColumnIndex(headers, COLUMN_ALIASES.name),
          note: findColumnIndex(headers, COLUMN_ALIASES.note),
          groupNumber: findColumnIndex(headers, COLUMN_ALIASES.groupNumber),
          groupCode: findColumnIndex(headers, COLUMN_ALIASES.groupCode),
          inviteDelivered: findColumnIndex(headers, COLUMN_ALIASES.inviteDelivered),
          confirmed: findColumnIndex(headers, COLUMN_ALIASES.confirmed),
        }

        if (colIndex.name === -1) {
          const found = headers.filter(Boolean).join(', ') || 'nenhuma coluna detectada'
          reject(new Error(`Coluna "Nome" não encontrada. Colunas lidas: ${found}`))
          return
        }

        if (colIndex.groupCode === -1) {
          reject(new Error('Coluna "Código" não encontrada. Verifique o cabeçalho da planilha.'))
          return
        }

        const seenIds = new Set<string>()
        const rows: ImportRow[] = []

        for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
          const row = rawRows[i] ?? []
          const name = cellToString(colIndex.name >= 0 ? row[colIndex.name] : '')
          const note = cellToString(colIndex.note >= 0 ? row[colIndex.note] : '')
          const groupNumber = cellToString(colIndex.groupNumber >= 0 ? row[colIndex.groupNumber] : '')
          const groupCode = cellToString(colIndex.groupCode >= 0 ? row[colIndex.groupCode] : '').toUpperCase()
          const inviteDelivered = parseBoolean(colIndex.inviteDelivered >= 0 ? row[colIndex.inviteDelivered] : false)
          const confirmed = parseBoolean(colIndex.confirmed >= 0 ? row[colIndex.confirmed] : false)

          const rawId = cellToString(colIndex.id >= 0 ? row[colIndex.id] : '')
          const isEmptyRow = !name && !note && !groupNumber && !groupCode && !rawId
          if (isEmptyRow) continue

          const id = generateGuestId(seenIds, rawId || String(i))
          const group = formatGroupName(groupNumber, groupCode)

          let error: string | null = null
          if (!name) error = 'Nome em branco'
          else if (!groupCode) error = 'Código do grupo não identificado'
          else if (rawId && seenIds.has(rawId)) error = 'ID duplicado na planilha'

          if (!error) seenIds.add(id)

          rows.push({ id, name, note, group, groupCode, inviteDelivered, confirmed, error })
        }

        if (rows.length === 0) {
          reject(new Error('Nenhum convidado encontrado na planilha.'))
          return
        }

        resolve(rows)
      } catch {
        reject(new Error('Não foi possível processar a planilha. Verifique o formato do arquivo.'))
      }
    }

    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'))
    reader.readAsArrayBuffer(file)
  })
}

export function buildGroupsFromImport(rows: ImportRow[]): GroupDef[] {
  const validRows = rows.filter((row) => !row.error)
  const byCode = new Map<string, ImportRow[]>()

  for (const row of validRows) {
    const members = byCode.get(row.groupCode) ?? []
    members.push(row)
    byCode.set(row.groupCode, members)
  }

  return [...byCode.entries()]
    .map(([code, members], index) => ({
      id: `g-${index + 1}`,
      name: members[0]?.group ?? `Grupo ${index + 1}`,
      code,
      guestIds: members.map((m) => m.id),
    }))
    .sort((a, b) => compareNaturally(a.name, b.name))
}
