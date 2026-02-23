import { Resend } from "resend"

let resend: Resend | null = null

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

const FROM = "Cam Burley <cam@burley.ai>"

export async function sendClientEmail(
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  const r = getResend()
  if (!r) {
    console.log(`[email skip] RESEND_API_KEY not set. Would have sent to ${to}: ${subject}`)
    return false
  }

  try {
    await r.emails.send({ from: FROM, to, subject, text: body })
    console.log(`[email sent] to=${to} subject="${subject}"`)
    return true
  } catch (err) {
    console.error("[email error]", err)
    return false
  }
}
