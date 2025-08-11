import { AuthService } from '../../src/lib/auth-service'

async function parseJsonBody(req: any) {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS')
    return res.status(204).end()
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const body = (req.body && Object.keys(req.body).length ? req.body : await parseJsonBody(req)) || {}
    const { email, password } = body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const result = await AuthService.login({ email, password })
    return res.status(200).json(result)
  } catch (error: any) {
    console.error('LOGIN ERROR', { message: error?.message, stack: error?.stack })
    return res.status(401).json({ error: error?.message || 'Invalid credentials' })
  }
}
