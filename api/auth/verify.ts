import { AuthService } from '../../src/lib/auth-service'

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  try {
    const token = (req.query?.token || req.url?.split('token=')[1] || '').toString()
    if (!token) return res.status(400).json({ error: 'Missing token' })

    await AuthService.verifyEmail(token)
    // Simple HTML response for UX
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(`
      <html><body style="font-family: system-ui; padding: 24px;">
        <h2>Email verified</h2>
        <p>Your email has been verified. You can now close this window and sign in.</p>
        <a href="/">Go to app</a>
      </body></html>
    `)
  } catch (error: any) {
    return res.status(400).json({ error: error?.message || 'Verification failed' })
  }
}
