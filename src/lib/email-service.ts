const RESEND_API_KEY = process.env.RESEND_API_KEY
const MAIL_FROM = process.env.MAIL_FROM || 'no-reply@nakuja.org'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'glenngatiba@gmail.com'

export interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set; skipping email send')
    return
  }

  const recipients = Array.isArray(to) ? to : [to]
  const payload = {
    from: MAIL_FROM,
    to: recipients,
    bcc: [ADMIN_EMAIL],
    subject,
    html,
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Email send failed: ${res.status} ${text}`)
  }
}
