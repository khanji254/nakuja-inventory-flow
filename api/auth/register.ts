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
    const { name, email, password, role, teamId } = body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' })
    }

    const result = await AuthService.register({ name, email, password, role, teamId })
    return res.status(201).json(result)
  } catch (error: any) {
    console.error('REGISTER ERROR', { message: error?.message, stack: error?.stack })
    return res.status(400).json({ error: error?.message || 'Registration failed' })
  }
}
