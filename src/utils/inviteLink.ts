export const INVITE_CODE_QUERY_PARAM = 'code'

let inviteDeepLinkConsumed = false

export function getInviteCodeFromUrl(search = window.location.search): string | null {
  const params = new URLSearchParams(search)
  const code = params.get(INVITE_CODE_QUERY_PARAM)?.trim().toUpperCase()
  return code || null
}

export function buildInviteLink(code: string): string {
  const url = new URL(import.meta.env.BASE_URL, window.location.origin)
  url.searchParams.set(INVITE_CODE_QUERY_PARAM, code.trim().toUpperCase())
  return url.toString()
}

export async function copyInviteLink(code: string): Promise<void> {
  await navigator.clipboard.writeText(buildInviteLink(code))
}

export function hasPendingInviteAutoSubmit(): boolean {
  return !inviteDeepLinkConsumed && Boolean(getInviteCodeFromUrl())
}

export function markInviteAutoSubmitConsumed(): void {
  inviteDeepLinkConsumed = true
}
