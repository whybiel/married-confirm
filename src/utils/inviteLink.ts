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

export function buildInviteMessage(guestName: string, code: string): string {
  const link = buildInviteLink(code)
  return `${guestName}, 💍✨

Olá! Tudo bem? Aqui é a cerimonialista responsável pelo casamento de Mariana e Gabriel. Estamos entrando em contato por este número para realizar a confirmação de presença dos convidados.

O grande dia está se aproximando, e será uma alegria contar com a sua presença! 🤍

Para que possamos finalizar a organização do evento, pedimos que sua confirmação de presença seja realizada até o dia 11/09, através do link abaixo:

🔗 ${link}

Agradecemos desde já pela atenção e colaboração. Estamos preparando tudo com muito carinho para receber vocês e tornar esse momento ainda mais especial. ✨

Atenciosamente,
Cerimonial | Mariana & Gabriel 🤍`
}

export async function copyInviteLink(code: string): Promise<void> {
  await navigator.clipboard.writeText(buildInviteLink(code))
}

export async function copyInviteMessage(guestName: string, code: string): Promise<void> {
  await navigator.clipboard.writeText(buildInviteMessage(guestName, code))
}

export function hasPendingInviteAutoSubmit(): boolean {
  return !inviteDeepLinkConsumed && Boolean(getInviteCodeFromUrl())
}

export function markInviteAutoSubmitConsumed(): void {
  inviteDeepLinkConsumed = true
}
