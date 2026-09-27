import * as XLSX from 'xlsx'
import type { Guest } from '@/data/mock'
import { compareNaturally } from '@/utils/compareNaturally'

const COLUMNS = ['Nome', 'Observação'] as const

export function exportGuestList(guests: Guest[]) {
  const rows = [...guests]
    .sort((a, b) => compareNaturally(a.name, b.name))
    .map((guest) => ({
      Nome: guest.name,
      Observação: guest.note,
    }))

  const sheet = XLSX.utils.json_to_sheet(rows, { header: [...COLUMNS] })
  sheet['!cols'] = [{ wch: 40 }, { wch: 48 }]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Convidados')
  XLSX.writeFile(workbook, 'convidados.xlsx')
}
