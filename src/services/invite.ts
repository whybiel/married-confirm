import { supabase } from '@/lib/supabase'
import type { Guest } from '@/data/mock'

interface LookupGuestRow {
  id: string
  spreadsheet_id: string | null
  name: string
  note: string
  invite_delivered: boolean
  confirmed: boolean
  last_access: string | null
}

interface LookupInviteResult {
  found: boolean
  group?: {
    id: string
    name: string
    number: number | null
    code: string
  }
  guests?: LookupGuestRow[]
}

export interface InviteLookup {
  groupId: string
  groupName: string
  code: string
  guests: Guest[]
}

function mapInviteGuests(
  groupId: string,
  groupName: string,
  rows: LookupGuestRow[],
): Guest[] {
  return rows.map((row) => ({
    id: row.id,
    spreadsheetId: row.spreadsheet_id,
    name: row.name,
    note: row.note ?? '',
    group: groupName,
    groupId,
    inviteDelivered: row.invite_delivered,
    confirmed: row.confirmed,
    lastAccess: row.last_access,
  }))
}

export async function lookupInvite(code: string): Promise<InviteLookup | null> {
  const { data, error } = await supabase.rpc('lookup_invite', {
    p_code: code,
  })

  if (error) throw new Error(error.message)

  const result = data as LookupInviteResult | null
  if (!result?.found || !result.group) return null

  return {
    groupId: result.group.id,
    groupName: result.group.name,
    code: result.group.code,
    guests: mapInviteGuests(result.group.id, result.group.name, result.guests ?? []),
  }
}

export async function confirmPresence(code: string, guestIds: string[]): Promise<void> {
  const { error } = await supabase.rpc('confirm_presence', {
    p_code: code,
    p_guest_ids: guestIds,
  })

  if (error) throw new Error(error.message)
}
