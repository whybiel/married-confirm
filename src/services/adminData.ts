import { supabase } from '@/lib/supabase'
import { Guest, GroupDef } from '@/data/mock'
import { buildGroupsFromImport, type ImportRow } from '@/services/importGuests'
import { compareNaturally } from '@/utils/compareNaturally'

interface GroupRow {
  id: string
  name: string
  number: number | null
  code: string
}

interface GuestRow {
  id: string
  spreadsheet_id: string | null
  group_id: string
  name: string
  note: string
  invite_delivered: boolean
  confirmed: boolean
  last_access: string | null
}

export interface GuestWrite {
  name: string
  note: string
  group: string
  inviteDelivered: boolean
  confirmed: boolean
}

export interface AdminLists {
  guests: Guest[]
  groups: GroupDef[]
}

export function parseGroupNumber(name: string): number | null {
  const match = name.match(/(\d+)\s*$/)
  return match ? Number(match[1]) : null
}

function generateGroupCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 7; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
}

function mapLists(groupRows: GroupRow[], guestRows: GuestRow[]): AdminLists {
  const nameById = new Map(groupRows.map((group) => [group.id, group.name]))
  const guestIdsByGroup = new Map<string, string[]>()

  for (const group of groupRows) {
    guestIdsByGroup.set(group.id, [])
  }

  const guests: Guest[] = guestRows.map((row) => {
    const members = guestIdsByGroup.get(row.group_id) ?? []
    members.push(row.id)
    guestIdsByGroup.set(row.group_id, members)

    return {
      id: row.id,
      spreadsheetId: row.spreadsheet_id,
      name: row.name,
      note: row.note ?? '',
      group: nameById.get(row.group_id) ?? '',
      groupId: row.group_id,
      inviteDelivered: row.invite_delivered,
      confirmed: row.confirmed,
      lastAccess: row.last_access,
    }
  })

  const groups: GroupDef[] = groupRows
    .map((group) => ({
      id: group.id,
      name: group.name,
      code: group.code,
      guestIds: guestIdsByGroup.get(group.id) ?? [],
    }))
    .sort((a, b) => compareNaturally(a.name, b.name))

  return { guests, groups }
}

export async function fetchAdminLists(): Promise<AdminLists> {
  const [groupsResult, guestsResult] = await Promise.all([
    supabase.from('groups').select('id, name, number, code'),
    supabase.from('guests').select('id, spreadsheet_id, group_id, name, note, invite_delivered, confirmed, last_access'),
  ])

  if (groupsResult.error) throw new Error(groupsResult.error.message)
  if (guestsResult.error) throw new Error(guestsResult.error.message)

  return mapLists(
    (groupsResult.data ?? []) as GroupRow[],
    (guestsResult.data ?? []) as GuestRow[],
  )
}

async function resolveGroupId(groupName: string, groups: GroupDef[]): Promise<string> {
  const name = groupName.trim() || 'Sem grupo'
  const existing = groups.find((group) => group.name.toLowerCase() === name.toLowerCase())
  if (existing) return existing.id

  const { data, error } = await supabase
    .from('groups')
    .insert({
      name,
      number: parseGroupNumber(name),
      code: generateGroupCode(),
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data.id as string
}

export async function saveGuest(
  data: GuestWrite,
  id: string | undefined,
  groups: GroupDef[],
): Promise<void> {
  const groupId = await resolveGroupId(data.group, groups)
  const payload = {
    name: data.name.trim(),
    note: data.note.trim(),
    group_id: groupId,
    invite_delivered: data.inviteDelivered,
    confirmed: data.confirmed,
  }

  if (id) {
    const { error } = await supabase.from('guests').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
    return
  }

  const { error } = await supabase.from('guests').insert({
    ...payload,
    spreadsheet_id: null,
    confirmed: false,
    last_access: null,
  })
  if (error) throw new Error(error.message)
}

export async function deleteGuest(id: string): Promise<void> {
  const { error } = await supabase.from('guests').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function replaceFromImport(rows: ImportRow[]): Promise<AdminLists> {
  const validRows = rows.filter((row) => !row.error)
  const builtGroups = buildGroupsFromImport(validRows)

  const { error: deleteGuestsError } = await supabase.from('guests').delete().not('id', 'is', null)
  if (deleteGuestsError) throw new Error(deleteGuestsError.message)

  const { error: deleteGroupsError } = await supabase.from('groups').delete().not('id', 'is', null)
  if (deleteGroupsError) throw new Error(deleteGroupsError.message)

  const { data: insertedGroups, error: insertGroupsError } = await supabase
    .from('groups')
    .insert(
      builtGroups.map((group) => ({
        name: group.name,
        number: parseGroupNumber(group.name),
        code: group.code,
      })),
    )
    .select('id, code')

  if (insertGroupsError) throw new Error(insertGroupsError.message)

  const idByCode = new Map((insertedGroups ?? []).map((group) => [group.code, group.id as string]))

  const guestsPayload = validRows.map((row) => {
    const groupId = idByCode.get(row.groupCode)
    if (!groupId) {
      throw new Error(`Grupo não encontrado para o código ${row.groupCode}`)
    }

    return {
      spreadsheet_id: row.id,
      group_id: groupId,
      name: row.name,
      note: row.note,
      invite_delivered: row.inviteDelivered,
      confirmed: row.confirmed,
      last_access: row.confirmed ? new Date().toISOString() : null,
    }
  })

  if (guestsPayload.length > 0) {
    const { error: insertGuestsError } = await supabase.from('guests').insert(guestsPayload)
    if (insertGuestsError) throw new Error(insertGuestsError.message)
  }

  return fetchAdminLists()
}

export async function signInAdmin(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    if (error.message.toLowerCase().includes('invalid login')) {
      throw new Error('E-mail ou senha incorretos. Tente novamente.')
    }
    throw new Error(error.message)
  }
}

export async function signOutAdmin(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}
